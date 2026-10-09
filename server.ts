import express from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { 
  db, 
  hashPassword, 
  verifyPassword, 
  createSession, 
  deleteSession, 
  getSessionUser 
} from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Auth extraction middleware
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = getSessionUser(token);
    if (user) {
      (req as any).user = user;
      (req as any).sessionToken = token;
    }
  }
  next();
}

app.use(authMiddleware);

// --- AUTH ROUTES ---
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, role = 'patient', phone, age, gender } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const passHash = hashPassword(password);
    const validRole = ['patient', 'doctor', 'receptionist', 'admin'].includes(role) ? role : 'patient';

    const insert = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, phone, age, gender, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(userId, name.trim(), cleanEmail, passHash, validRole, phone || null, Number(age) || null, gender || null, new Date().toISOString());

    const token = createSession(userId);
    const user = getSessionUser(token);

    return res.status(201).json({ token, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;
    if (!userRow) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = verifyPassword(password, userRow.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createSession(userRow.id);
    const user = getSessionUser(token);

    return res.json({ token, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  const token = (req as any).sessionToken;
  if (token) {
    deleteSession(token);
  }
  return res.json({ success: true });
});

// --- DEPARTMENTS & DOCTORS ---
app.get('/api/departments', (_req, res) => {
  const depts = db.prepare('SELECT * FROM departments').all();
  return res.json(depts);
});

app.get('/api/doctors', (_req, res) => {
  const docs = db.prepare('SELECT * FROM doctors').all();
  return res.json(docs);
});

// --- QUEUE TOKENS ---
// Role-based retrieval:
// - Patient sees only their own tokens
// - Doctor sees their department & room tokens
// - Receptionist/Admin sees all tokens
app.get('/api/queue/tokens', (req, res) => {
  const user = (req as any).user;

  if (!user) {
    // Unauthenticated: return only public active consultation tokens
    const publicTokens = db.prepare(`
      SELECT id, token_number, department_id, doctor_id, status, triage_urgency, issued_at, queue_position
      FROM tokens WHERE status IN ('waiting', 'called', 'in_consultation')
      ORDER BY queue_position ASC
    `).all();
    return res.json(publicTokens);
  }

  if (user.role === 'patient') {
    // Patient sees their own tokens (by patient_id or matching phone)
    const patientTokens = db.prepare(`
      SELECT * FROM tokens 
      WHERE patient_id = ? OR (patient_phone IS NOT NULL AND patient_phone = ?)
      ORDER BY issued_at DESC
    `).all(user.id, user.phone || '');
    return res.json(patientTokens);
  }

  if (user.role === 'doctor') {
    // Doctor sees tokens assigned to their doctor_id or department
    const docId = user.doctor_id || 'doc-1';
    const deptId = user.department_id || 'gen-med';
    const docTokens = db.prepare(`
      SELECT * FROM tokens 
      WHERE doctor_id = ? OR department_id = ?
      ORDER BY 
        CASE status 
          WHEN 'in_consultation' THEN 1 
          WHEN 'called' THEN 2 
          WHEN 'waiting' THEN 3 
          ELSE 4 
        END, queue_position ASC, issued_at ASC
    `).all(docId, deptId);
    return res.json(docTokens);
  }

  // Receptionist and Admin see all
  const allTokens = db.prepare(`
    SELECT * FROM tokens 
    ORDER BY 
      CASE status 
        WHEN 'in_consultation' THEN 1 
        WHEN 'called' THEN 2 
        WHEN 'waiting' THEN 3 
        ELSE 4 
      END, queue_position ASC, issued_at DESC
  `).all();
  return res.json(allTokens);
});

// Issue new token
app.post('/api/queue/tokens', (req, res) => {
  try {
    const user = (req as any).user;
    const { 
      patientName, 
      patientPhone, 
      patientAge, 
      patientGender, 
      departmentId, 
      doctorId, 
      isEmergency, 
      triageUrgency = 'STANDARD', 
      triageSymptoms = [] 
    } = req.body;

    if (!patientName || !departmentId) {
      return res.status(400).json({ error: 'Patient name and department are required' });
    }

    const deptCodeMap: Record<string, string> = {
      'gen-med': 'GM',
      'cardio': 'CD',
      'pediatrics': 'PD',
      'ortho': 'OR',
      'neuro': 'NR',
      'derma': 'SK',
    };
    const prefix = isEmergency ? 'EMG' : deptCodeMap[departmentId] || 'OPD';

    const countInDept = (db.prepare('SELECT count(*) as count FROM tokens WHERE department_id = ?').get(departmentId) as any).count;
    const tokenNumber = `${prefix}-${countInDept + 115}`;

    // Assigned doctor
    let finalDocId = doctorId;
    if (!finalDocId) {
      const defaultDoc = db.prepare('SELECT id FROM doctors WHERE department_id = ? LIMIT 1').get(departmentId) as any;
      finalDocId = defaultDoc ? defaultDoc.id : 'doc-1';
    }

    const waitingAhead = (db.prepare(`
      SELECT count(*) as count FROM tokens 
      WHERE department_id = ? AND status = 'waiting'
    `).get(departmentId) as any).count;

    const tokenId = `tok-${Date.now()}`;
    const issuedAt = new Date().toISOString();
    const estCall = new Date(Date.now() + (waitingAhead + 1) * 6 * 60000).toISOString();
    const queuePos = isEmergency ? 1 : waitingAhead + 1;

    const insert = db.prepare(`
      INSERT INTO tokens (
        id, token_number, patient_id, patient_name, patient_phone, patient_age, 
        patient_gender, department_id, doctor_id, status, triage_urgency, 
        triage_symptoms, issued_at, estimated_call_time, queue_position, is_emergency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      tokenId,
      tokenNumber,
      user?.id || null,
      patientName,
      patientPhone || user?.phone || '+91 91234 56789',
      Number(patientAge) || 28,
      patientGender || 'male',
      departmentId,
      finalDocId,
      'waiting',
      triageUrgency,
      JSON.stringify(triageSymptoms),
      issuedAt,
      estCall,
      queuePos,
      isEmergency ? 1 : 0
    );

    // Update department stats
    const newWaiting = waitingAhead + 1;
    db.prepare(`
      UPDATE departments 
      SET total_waiting = ?, estimated_wait_minutes = ?
      WHERE id = ?
    `).run(newWaiting, newWaiting * 5, departmentId);

    const token = db.prepare('SELECT * FROM tokens WHERE id = ?').get(tokenId);
    return res.status(201).json(token);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to issue token' });
  }
});

// Doctor calls next patient
app.post('/api/queue/tokens/:id/call', (req, res) => {
  const user = (req as any).user;
  if (user && user.role === 'patient') {
    return res.status(403).json({ error: 'Patients cannot call tokens' });
  }

  const { id } = req.params;
  const token = db.prepare('SELECT * FROM tokens WHERE id = ?').get(id) as any;
  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }

  // Complete any currently in_consultation token for this doctor
  db.prepare(`
    UPDATE tokens 
    SET status = 'completed', completed_at = ?
    WHERE doctor_id = ? AND status IN ('in_consultation', 'called')
  `).run(new Date().toISOString(), token.doctor_id);

  // Mark this token called
  db.prepare(`
    UPDATE tokens 
    SET status = 'called', called_at = ?, queue_position = 0
    WHERE id = ?
  `).run(new Date().toISOString(), id);

  // Update department's current serving token
  db.prepare(`
    UPDATE departments 
    SET current_serving_token = ?
    WHERE id = ?
  `).run(token.token_number, token.department_id);

  const updated = db.prepare('SELECT * FROM tokens WHERE id = ?').get(id);
  return res.json(updated);
});

// Doctor completes consultation
app.post('/api/queue/tokens/:id/complete', (req, res) => {
  const { id } = req.params;
  const { notes } = req.body || {};
  db.prepare(`
    UPDATE tokens 
    SET status = 'completed', completed_at = ?, notes = COALESCE(?, notes)
    WHERE id = ?
  `).run(new Date().toISOString(), notes || null, id);

  const updated = db.prepare('SELECT * FROM tokens WHERE id = ?').get(id);
  return res.json(updated);
});

// Update consultation prescription notes
app.post('/api/queue/tokens/:id/notes', (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  db.prepare('UPDATE tokens SET notes = ? WHERE id = ?').run(notes || '', id);
  const updated = db.prepare('SELECT * FROM tokens WHERE id = ?').get(id);
  return res.json(updated);
});

// Emergency priority bump for receptionist / admin
app.post('/api/queue/tokens/:id/priority', (req, res) => {
  const { id } = req.params;
  db.prepare(`
    UPDATE tokens 
    SET is_emergency = 1, triage_urgency = 'CRITICAL', queue_position = 1
    WHERE id = ?
  `).run(id);
  const updated = db.prepare('SELECT * FROM tokens WHERE id = ?').get(id);
  return res.json(updated);
});

// Update doctor availability status
app.post('/api/doctors/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['available', 'in_consultation', 'on_break', 'offline'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.prepare('UPDATE doctors SET current_status = ? WHERE id = ?').run(status, id);
  const doc = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
  return res.json(doc);
});

// Skip patient
app.post('/api/queue/tokens/:id/skip', (req, res) => {
  const { id } = req.params;
  db.prepare(`
    UPDATE tokens 
    SET status = 'waiting', queue_position = queue_position + 2
    WHERE id = ?
  `).run(id);

  const updated = db.prepare('SELECT * FROM tokens WHERE id = ?').get(id);
  return res.json(updated);
});

// Patient delays token (+10 mins / 2 spots back)
app.post('/api/queue/tokens/:id/delay', (req, res) => {
  const { id } = req.params;
  db.prepare(`
    UPDATE tokens 
    SET queue_position = queue_position + 2
    WHERE id = ?
  `).run(id);

  const updated = db.prepare('SELECT * FROM tokens WHERE id = ?').get(id);
  return res.json(updated);
});

// Patient cancels token
app.post('/api/queue/tokens/:id/cancel', (req, res) => {
  const { id } = req.params;
  db.prepare(`
    UPDATE tokens 
    SET status = 'cancelled'
    WHERE id = ?
  `).run(id);

  return res.json({ success: true });
});

// --- APPOINTMENTS ---
app.get('/api/appointments', (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.json([]);
  }

  if (user.role === 'patient') {
    const apts = db.prepare(`
      SELECT * FROM appointments 
      WHERE patient_id = ? OR (patient_phone IS NOT NULL AND patient_phone = ?)
      ORDER BY date ASC, time_slot ASC
    `).all(user.id, user.phone || '');
    return res.json(apts);
  }

  if (user.role === 'doctor') {
    const docId = user.doctor_id || 'doc-1';
    const apts = db.prepare(`
      SELECT * FROM appointments 
      WHERE doctor_id = ?
      ORDER BY date ASC, time_slot ASC
    `).all(docId);
    return res.json(apts);
  }

  // Receptionist / Admin
  const allApts = db.prepare('SELECT * FROM appointments ORDER BY date ASC, time_slot ASC').all();
  return res.json(allApts);
});

app.post('/api/appointments', (req, res) => {
  try {
    const user = (req as any).user;
    const { patientName, patientPhone, doctorId, departmentId, date, timeSlot, reason } = req.body;
    if (!patientName || !doctorId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Missing appointment details' });
    }

    const aptId = `apt-${Date.now()}`;
    const insert = db.prepare(`
      INSERT INTO appointments (
        id, patient_id, patient_name, patient_phone, doctor_id, 
        department_id, date, time_slot, status, reason, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      aptId,
      user?.id || null,
      patientName,
      patientPhone || user?.phone || '+91 91234 56789',
      doctorId,
      departmentId,
      date,
      timeSlot,
      'confirmed',
      reason || 'General Health Consultation',
      new Date().toISOString()
    );

    const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(aptId);
    return res.status(201).json(apt);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to book appointment' });
  }
});

// Appointment check-in
app.post('/api/appointments/:id/checkin', (req, res) => {
  const { id } = req.params;
  const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as any;
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const deptCodeMap: Record<string, string> = {
    'gen-med': 'GM',
    'cardio': 'CD',
    'pediatrics': 'PD',
    'ortho': 'OR',
    'neuro': 'NR',
    'derma': 'SK',
  };
  const prefix = deptCodeMap[apt.department_id] || 'OPD';
  const tokenNumber = `${prefix}-${Math.floor(Math.random() * 50) + 120}`;

  const tokenId = `tok-${Date.now()}`;
  db.prepare(`
    INSERT INTO tokens (
      id, token_number, patient_id, patient_name, patient_phone, patient_age, 
      patient_gender, department_id, doctor_id, status, triage_urgency, 
      issued_at, queue_position
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tokenId,
    tokenNumber,
    apt.patient_id,
    apt.patient_name,
    apt.patient_phone,
    30,
    'male',
    apt.department_id,
    apt.doctor_id,
    'waiting',
    'STANDARD',
    new Date().toISOString(),
    2
  );

  db.prepare(`
    UPDATE appointments 
    SET status = 'checked_in', token_number = ?
    WHERE id = ?
  `).run(tokenNumber, id);

  const updatedApt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  return res.json({ appointment: updatedApt, tokenId, tokenNumber });
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', (req, res) => {
  const user = (req as any).user;
  if (!user) {
    const publicNotifs = db.prepare('SELECT * FROM notifications WHERE user_id IS NULL ORDER BY timestamp DESC LIMIT 10').all();
    return res.json(publicNotifs);
  }

  const notifs = db.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? OR user_id IS NULL 
    ORDER BY timestamp DESC LIMIT 20
  `).all(user.id);
  return res.json(notifs);
});

app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id);
  return res.json({ success: true });
});

// --- ADMIN ANALYTICS ---
app.get('/api/analytics', (req, res) => {
  const totalTokens = (db.prepare('SELECT count(*) as count FROM tokens').get() as any).count + 85;
  const completedTokens = (db.prepare("SELECT count(*) as count FROM tokens WHERE status = 'completed'").get() as any).count + 72;
  const waitingTokens = (db.prepare("SELECT count(*) as count FROM tokens WHERE status = 'waiting'").get() as any).count;
  const activeConsultations = (db.prepare("SELECT count(*) as count FROM tokens WHERE status = 'in_consultation'").get() as any).count;

  const depts = db.prepare('SELECT * FROM departments').all();
  const doctors = db.prepare('SELECT count(*) as count FROM doctors').get() as any;

  return res.json({
    totalTokens,
    completedTokens,
    waitingTokens,
    activeConsultations,
    doctorsOnDuty: doctors.count,
    departments: depts,
  });
});

// --- VITE MIDDLEWARES / STATIC SERVE ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MediQueue Full-Stack Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Error]', err);
  process.exit(1);
});
