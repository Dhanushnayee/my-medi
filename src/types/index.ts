export type Language = 'en' | 'te';

export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  age?: number;
  gender?: string;
  doctor_id?: string;
  department_id?: string;
  created_at: string;
}

export type TriageUrgency = 'CRITICAL' | 'URGENT' | 'STANDARD' | 'NON_URGENT';

export interface Doctor {
  id: string;
  name: string;
  nameTe: string;
  specialty: string;
  specialtyTe: string;
  departmentId: string;
  roomNumber: string;
  experienceYears: number;
  availableDays: string[];
  currentStatus: 'available' | 'in_consultation' | 'on_break' | 'offline';
  photo: string;
  rating: number;
  consultationFee: number;
  averageMinsPerPatient: number;
}

export interface Department {
  id: string;
  name: string;
  nameTe: string;
  icon: string;
  currentServingToken: string;
  totalWaiting: number;
  estimatedWaitMinutes: number;
  roomNumbers: string;
  headDoctorId: string;
  status: 'active' | 'busy' | 'full';
}

export interface QueueToken {
  id: string;
  tokenNumber: string; // e.g. "A-104", "EMG-02"
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  departmentId: string;
  doctorId: string;
  status: 'waiting' | 'called' | 'in_consultation' | 'completed' | 'cancelled' | 'skipped';
  triageUrgency: TriageUrgency;
  triageSymptoms?: string[];
  issuedAt: string; // ISO
  estimatedCallTime: string;
  calledAt?: string;
  completedAt?: string;
  queuePosition: number;
  notes?: string;
  isEmergency?: boolean;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  departmentId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  tokenNumber?: string;
  status: 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
  reason: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  titleTe: string;
  message: string;
  messageTe: string;
  timestamp: string;
  type: 'token_alert' | 'appointment' | 'emergency' | 'system';
  read: boolean;
}
