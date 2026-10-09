import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'mediqueue.db');
export const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('patient', 'doctor', 'receptionist', 'admin')),
    phone TEXT,
    age INTEGER,
    gender TEXT,
    doctor_id TEXT,
    department_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_te TEXT NOT NULL,
    icon TEXT NOT NULL,
    room_numbers TEXT NOT NULL,
    current_serving_token TEXT NOT NULL,
    total_waiting INTEGER DEFAULT 0,
    estimated_wait_minutes INTEGER DEFAULT 15,
    head_doctor_id TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_te TEXT NOT NULL,
    specialty TEXT NOT NULL,
    specialty_te TEXT NOT NULL,
    department_id TEXT NOT NULL,
    room_number TEXT NOT NULL,
    experience_years INTEGER NOT NULL,
    current_status TEXT DEFAULT 'available',
    photo TEXT NOT NULL,
    rating REAL DEFAULT 4.9,
    consultation_fee INTEGER NOT NULL,
    average_mins_per_patient INTEGER DEFAULT 6
  );

  CREATE TABLE IF NOT EXISTS tokens (
    id TEXT PRIMARY KEY,
    token_number TEXT NOT NULL,
    patient_id TEXT,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_age INTEGER NOT NULL,
    patient_gender TEXT NOT NULL,
    department_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('waiting', 'called', 'in_consultation', 'completed', 'cancelled', 'skipped')),
    triage_urgency TEXT NOT NULL DEFAULT 'STANDARD',
    triage_symptoms TEXT, -- JSON array
    issued_at TEXT NOT NULL,
    estimated_call_time TEXT,
    called_at TEXT,
    completed_at TEXT,
    queue_position INTEGER DEFAULT 1,
    notes TEXT,
    is_emergency INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    token_number TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    title_te TEXT NOT NULL,
    message TEXT NOT NULL,
    message_te TEXT NOT NULL,
    type TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    timestamp TEXT NOT NULL
  );
`);

// Password hashing helper
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  } catch {
    return false;
  }
}

// Session helper
export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  const insert = db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `);
  insert.run(token, userId, createdAt, expiresAt);
  return token;
}

export function deleteSession(token: string): void {
  const del = db.prepare('DELETE FROM sessions WHERE token = ?');
  del.run(token);
}

export function getSessionUser(token: string) {
  const stmt = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.phone, u.age, u.gender, u.doctor_id, u.department_id, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
  `);
  return stmt.get(token) as {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'receptionist' | 'admin';
    phone?: string;
    age?: number;
    gender?: string;
    doctor_id?: string;
    department_id?: string;
    created_at: string;
  } | undefined;
}

// Seed initial data
export function seedDatabase() {
  // 1. Check if users seeded
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, phone, age, gender, doctor_id, department_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Patient
    insertUser.run(
      'usr-patient-1',
      'Dhanush Mangali',
      'patient@mediqueue.com',
      hashPassword('patient123'),
      'patient',
      '+91 91234 56789',
      26,
      'male',
      null,
      null,
      new Date().toISOString()
    );

    // Doctor 1 (General Medicine)
    insertUser.run(
      'usr-doc-1',
      'Dr. Sarah Smith, MD',
      'doctor@mediqueue.com',
      hashPassword('doctor123'),
      'doctor',
      '+91 98480 11223',
      42,
      'female',
      'doc-1',
      'gen-med',
      new Date().toISOString()
    );

    // Doctor 2 (Cardiology)
    insertUser.run(
      'usr-doc-2',
      'Dr. Rajesh Rao, DM (Cardio)',
      'cardio@mediqueue.com',
      hashPassword('doctor123'),
      'doctor',
      '+91 98480 99887',
      48,
      'male',
      'doc-2',
      'cardio',
      new Date().toISOString()
    );

    // Receptionist
    insertUser.run(
      'usr-reception-1',
      'Priya Reception Counter',
      'reception@mediqueue.com',
      hashPassword('reception123'),
      'receptionist',
      '+91 98480 55667',
      29,
      'female',
      null,
      null,
      new Date().toISOString()
    );

    // Admin
    insertUser.run(
      'usr-admin-1',
      'Dr. K. V. Sharma (Hospital Superintendent)',
      'admin@mediqueue.com',
      hashPassword('admin123'),
      'admin',
      '+91 98480 00001',
      54,
      'male',
      null,
      null,
      new Date().toISOString()
    );
  }

  // 2. Departments
  const deptCount = db.prepare('SELECT count(*) as count FROM departments').get() as { count: number };
  if (deptCount.count === 0) {
    const insertDept = db.prepare(`
      INSERT INTO departments (id, name, name_te, icon, room_numbers, current_serving_token, total_waiting, estimated_wait_minutes, head_doctor_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDept.run('gen-med', 'General Medicine', 'జనరల్ మెడిసిన్', 'Stethoscope', 'Rooms 101 - 104', 'GM-108', 4, 18, 'doc-1', 'busy');
    insertDept.run('cardio', 'Cardiology', 'కార్డియాలజీ (గుండె విభాగం)', 'HeartPulse', 'Rooms 201 - 203', 'CD-042', 2, 14, 'doc-2', 'active');
    insertDept.run('pediatrics', 'Pediatrics & Child Care', 'పీడియాట్రిక్స్ (పిల్లల విభాగం)', 'Baby', 'Rooms 108 - 110', 'PD-019', 5, 22, 'doc-3', 'busy');
    insertDept.run('ortho', 'Orthopedics & Joint Care', 'ఆర్తోపెడిక్స్ (ఎముకల విభాగం)', 'Activity', 'Rooms 205 - 207', 'OR-031', 3, 15, 'doc-4', 'active');
    insertDept.run('neuro', 'Neurology', 'న్యూరాలజీ (నరాల విభాగం)', 'Brain', 'Room 302', 'NR-012', 2, 20, 'doc-5', 'active');
    insertDept.run('derma', 'Dermatology & Skin', 'డెర్మటాలజీ (చర్మ విభాగం)', 'Sparkles', 'Room 115', 'SK-015', 1, 8, 'doc-6', 'active');
  }

  // 3. Doctors
  const docCount = db.prepare('SELECT count(*) as count FROM doctors').get() as { count: number };
  if (docCount.count === 0) {
    const insertDoc = db.prepare(`
      INSERT INTO doctors (id, name, name_te, specialty, specialty_te, department_id, room_number, experience_years, current_status, photo, rating, consultation_fee, average_mins_per_patient)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDoc.run('doc-1', 'Dr. Sarah Smith, MD', 'డా. సారా స్మిత్, MD', 'Senior General Physician', 'సీనియర్ జనరల్ ఫిజిషియన్', 'gen-med', 'Room 102', 14, 'available', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', 4.9, 400, 6);
    insertDoc.run('doc-2', 'Dr. Rajesh Rao, DM (Cardio)', 'డా. రాజేష్ రావు, DM (కార్డియో)', 'Interventional Cardiologist', 'ఇంటర్వెన్షనల్ కార్డియాలజిస్ట్', 'cardio', 'Room 201', 18, 'in_consultation', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', 4.95, 700, 8);
    insertDoc.run('doc-3', 'Dr. Ananya Reddy, MD (Pediatrics)', 'డా. అనన్య రెడ్డి, MD (పీడియాట్రిక్స్)', 'Consultant Pediatrician', 'కన్సల్టెంట్ పీడియాట్రిషియన్', 'pediatrics', 'Room 109', 11, 'available', 'https://images.unsplash.com/photo-1594824813576-46b0d99ef874?auto=format&fit=crop&q=80&w=300', 4.88, 500, 5);
    insertDoc.run('doc-4', 'Dr. Vikram Chandra, MS (Ortho)', 'డా. విక్రమ్ చంద్ర, MS (ఆర్తో)', 'Orthopedic Surgeon', 'ఆర్థోపెడిక్ సర్జన్', 'ortho', 'Room 206', 16, 'available', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', 4.91, 600, 7);
    insertDoc.run('doc-5', 'Dr. Suresh Varma, DM (Neuro)', 'డా. సురేష్ వర్మ, DM (న్యూరో)', 'Senior Neurologist', 'సీనియర్ న్యూరాలజిస్ట్', 'neuro', 'Room 302', 20, 'available', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', 4.94, 800, 10);
    insertDoc.run('doc-6', 'Dr. Kavitha Menon, MD (Derma)', 'డా. కవితా మీనన్, MD (డెర్మటాలజీ)', 'Consultant Dermatologist', 'కన్సల్టెంట్ డెర్మటాలజిస్ట్', 'derma', 'Room 115', 9, 'available', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', 4.82, 450, 6);
  }

  // 4. Tokens
  const tokenCount = db.prepare('SELECT count(*) as count FROM tokens').get() as { count: number };
  if (tokenCount.count === 0) {
    const insertTok = db.prepare(`
      INSERT INTO tokens (id, token_number, patient_id, patient_name, patient_phone, patient_age, patient_gender, department_id, doctor_id, status, triage_urgency, triage_symptoms, issued_at, estimated_call_time, called_at, completed_at, queue_position, notes, is_emergency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTok.run('tok-1', 'GM-108', 'usr-rand-1', 'Ramesh Naidu', '+91 98480 12345', 45, 'male', 'gen-med', 'doc-1', 'in_consultation', 'STANDARD', JSON.stringify(['Fever', 'Body aches']), new Date(Date.now() - 35 * 60000).toISOString(), new Date(Date.now() - 5 * 60000).toISOString(), new Date(Date.now() - 4 * 60000).toISOString(), null, 0, null, 0);
    insertTok.run('tok-2', 'GM-109', 'usr-rand-2', 'Lakshmi Devi', '+91 99887 65432', 62, 'female', 'gen-med', 'doc-1', 'waiting', 'URGENT', JSON.stringify(['High BP', 'Dizziness']), new Date(Date.now() - 25 * 60000).toISOString(), new Date(Date.now() + 4 * 60000).toISOString(), null, null, 1, null, 0);
    insertTok.run('tok-3', 'GM-110', 'usr-rand-3', 'Sai Kumar', '+91 97000 55443', 29, 'male', 'gen-med', 'doc-1', 'waiting', 'STANDARD', JSON.stringify(['Viral fever', 'Cough']), new Date(Date.now() - 20 * 60000).toISOString(), new Date(Date.now() + 10 * 60000).toISOString(), null, null, 2, null, 0);
    insertTok.run('tok-4', 'GM-111', 'usr-patient-1', 'Dhanush Mangali', '+91 91234 56789', 26, 'male', 'gen-med', 'doc-1', 'waiting', 'STANDARD', JSON.stringify(['Persistent headache', 'Weakness']), new Date(Date.now() - 15 * 60000).toISOString(), new Date(Date.now() + 16 * 60000).toISOString(), null, null, 3, null, 0);
    insertTok.run('tok-5', 'CD-042', 'usr-rand-4', 'Venkat Rao', '+91 98855 44332', 58, 'male', 'cardio', 'doc-2', 'in_consultation', 'URGENT', JSON.stringify(['Chest tightness', 'Shortness of breath']), new Date(Date.now() - 40 * 60000).toISOString(), new Date(Date.now() - 3 * 60000).toISOString(), new Date(Date.now() - 2 * 60000).toISOString(), null, 0, null, 0);
  }

  // 5. Appointments
  const aptCount = db.prepare('SELECT count(*) as count FROM appointments').get() as { count: number };
  if (aptCount.count === 0) {
    const insertApt = db.prepare(`
      INSERT INTO appointments (id, patient_id, patient_name, patient_phone, doctor_id, department_id, date, time_slot, token_number, status, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertApt.run('apt-1', 'usr-patient-1', 'Dhanush Mangali', '+91 91234 56789', 'doc-1', 'gen-med', new Date().toISOString().split('T')[0], '11:15 AM', 'GM-111', 'checked_in', 'Routine health checkup and headache evaluation', new Date(Date.now() - 86400000).toISOString());
    insertApt.run('apt-2', 'usr-rand-5', 'Priya Sharma', '+91 98499 11223', 'doc-3', 'pediatrics', new Date().toISOString().split('T')[0], '02:30 PM', null, 'confirmed', '6-month vaccination schedule', new Date(Date.now() - 48 * 3600000).toISOString());
  }

  // 6. Notifications
  const notifCount = db.prepare('SELECT count(*) as count FROM notifications').get() as { count: number };
  if (notifCount.count === 0) {
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, user_id, title, title_te, message, message_te, type, read, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertNotif.run('notif-1', 'usr-patient-1', 'Queue Progress Update', 'క్యూ ప్రోగ్రెస్ అప్‌డేట్', 'Token GM-108 is currently in consultation. Your token GM-111 is 3 spots away (~16 mins).', 'టోకెన్ GM-108 డాక్టర్‌తో ఉంది. మీ టోకెన్ GM-111 ఇంకా 3 స్థానాల దూరంలో ఉంది (~16 నిమిషాలు).', 'token_alert', 0, '2 mins ago');
    insertNotif.run('notif-2', null, 'OPD Doctor On Duty', 'డాక్టర్ డ్యూటీలో ఉన్నారు', 'Dr. Sarah Smith (General Medicine) is actively attending patients in Room 102.', 'డా. సారా స్మిత్ (జనరల్ మెడిసిన్) రూమ్ 102 లో రోగులను చూస్తున్నారు.', 'system', 1, '15 mins ago');
  }
}

// Call seedDatabase on startup
seedDatabase();
