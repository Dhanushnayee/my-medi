import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Department, Doctor, QueueToken, Appointment, NotificationItem, UserRole, Language, TriageUrgency, User } from '../types';
import { DEPARTMENTS, DOCTORS, INITIAL_TOKENS, INITIAL_APPOINTMENTS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import { soundService } from '../services/soundService';
import { api } from '../services/api';

interface QueueContextType {
  currentUser: User | null;
  authLoading: boolean;
  departments: Department[];
  doctors: Doctor[];
  tokens: QueueToken[];
  appointments: Appointment[];
  notifications: NotificationItem[];
  userToken: QueueToken | null;
  currentRole: UserRole;
  language: Language;
  soundEnabled: boolean;
  autoSimulate: boolean;
  activeDoctorId: string;
  
  // Auth Actions
  login: (email: string, pass: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    age?: number;
    gender?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;

  // App Actions
  refreshData: () => Promise<void>;
  setLanguage: (lang: Language) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAutoSimulate: (simulate: boolean) => void;
  setActiveDoctorId: (id: string) => void;
  issueInstantToken: (data: {
    patientName: string;
    patientPhone: string;
    patientAge: number;
    patientGender: 'male' | 'female' | 'other';
    departmentId: string;
    doctorId?: string;
    isEmergency?: boolean;
    triageUrgency?: TriageUrgency;
    triageSymptoms?: string[];
  }) => Promise<QueueToken>;
  bookAppointment: (data: {
    patientName: string;
    patientPhone: string;
    doctorId: string;
    departmentId: string;
    date: string;
    timeSlot: string;
    reason: string;
  }) => Promise<Appointment>;
  callNextPatient: (doctorId: string) => Promise<QueueToken | null>;
  completeConsultation: (tokenId: string, notes?: string) => Promise<void>;
  skipPatient: (tokenId: string) => Promise<void>;
  delayUserToken: (tokenId: string, minutes?: number) => Promise<void>;
  cancelUserToken: (tokenId: string) => Promise<void>;
  setTokenPriority: (tokenId: string) => Promise<void>;
  setDoctorStatus: (doctorId: string, status: string) => Promise<void>;
  checkInAppointment: (appointmentId: string) => Promise<QueueToken>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => void;
  announceCurrentToken: (tokenId: string) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [departments, setDepartments] = useState<Department[]>(DEPARTMENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS);
  const [tokens, setTokens] = useState<QueueToken[]>(INITIAL_TOKENS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [language, setLanguage] = useState<Language>('en');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
  const [activeDoctorId, setActiveDoctorId] = useState<string>('doc-1');

  // Check initial session
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await api.getMe();
        if (res && res.user) {
          setCurrentUser(res.user);
          if (res.user.doctor_id) {
            setActiveDoctorId(res.user.doctor_id);
          }
        }
      } catch {
        // Not authenticated
      } finally {
        setAuthLoading(false);
      }
    }
    initAuth();
  }, []);

  // Fetch data from backend
  const refreshData = useCallback(async () => {
    try {
      const [deptsData, docsData, tokensData, aptsData, notifsData] = await Promise.all([
        api.getDepartments().catch(() => DEPARTMENTS),
        api.getDoctors().catch(() => DOCTORS),
        api.getTokens().catch(() => INITIAL_TOKENS),
        api.getAppointments().catch(() => INITIAL_APPOINTMENTS),
        api.getNotifications().catch(() => INITIAL_NOTIFICATIONS),
      ]);

      if (deptsData && deptsData.length > 0) setDepartments(deptsData);
      if (docsData && docsData.length > 0) setDoctors(docsData);
      if (tokensData) setTokens(tokensData);
      if (aptsData) setAppointments(aptsData);
      if (notifsData) setNotifications(notifsData);
    } catch {
      // Backend fallback gracefully
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      refreshData();
    }
  }, [authLoading, currentUser, refreshData]);

  // Auth methods
  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.login(email, pass);
    setCurrentUser(res.user);
    if (res.user.doctor_id) {
      setActiveDoctorId(res.user.doctor_id);
    }
    await refreshData();
    return res.user;
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    age?: number;
    gender?: string;
  }): Promise<User> => {
    const res = await api.register(payload);
    setCurrentUser(res.user);
    await refreshData();
    return res.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setCurrentUser(null);
      await refreshData();
    }
  };

  const currentRole: UserRole = currentUser ? currentUser.role : 'patient';

  // Find active token for current patient user
  const userToken = tokens.find(
    (t) => (t.status === 'waiting' || t.status === 'called' || t.status === 'in_consultation') &&
      (currentUser?.id ? t.patientName === currentUser.name || t.patientPhone === currentUser.phone : true)
  ) || null;

  // Issue Token
  const issueInstantToken = useCallback(
    async (data: {
      patientName: string;
      patientPhone: string;
      patientAge: number;
      patientGender: 'male' | 'female' | 'other';
      departmentId: string;
      doctorId?: string;
      isEmergency?: boolean;
      triageUrgency?: TriageUrgency;
      triageSymptoms?: string[];
    }): Promise<QueueToken> => {
      const token = await api.issueToken(data);
      if (soundEnabled) {
        soundService.playSuccessBeep();
      }
      await refreshData();
      return token;
    },
    [soundEnabled, refreshData]
  );

  // Book Appointment
  const bookAppointment = useCallback(
    async (data: {
      patientName: string;
      patientPhone: string;
      doctorId: string;
      departmentId: string;
      date: string;
      timeSlot: string;
      reason: string;
    }): Promise<Appointment> => {
      const apt = await api.bookAppointment(data);
      if (soundEnabled) {
        soundService.playSuccessBeep();
      }
      await refreshData();
      return apt;
    },
    [soundEnabled, refreshData]
  );

  // Check in appointment
  const checkInAppointment = useCallback(
    async (appointmentId: string): Promise<QueueToken> => {
      const res = await api.checkInAppointment(appointmentId);
      await refreshData();
      const tok = tokens.find((t) => t.id === res.tokenId) || {
        id: res.tokenId,
        tokenNumber: res.tokenNumber,
        patientName: 'Patient',
        patientPhone: '',
        patientAge: 30,
        patientGender: 'male',
        departmentId: 'gen-med',
        doctorId: 'doc-1',
        status: 'waiting',
        triageUrgency: 'STANDARD',
        issuedAt: new Date().toISOString(),
        estimatedCallTime: '',
        queuePosition: 1,
      };
      return tok;
    },
    [refreshData, tokens]
  );

  // Doctor calls next
  const callNextPatient = useCallback(
    async (docId: string): Promise<QueueToken | null> => {
      const doctor = doctors.find((d) => d.id === docId);
      if (!doctor) return null;

      // Find next waiting token
      const nextWaiting = tokens.find(
        (t) => (t.doctorId === docId || t.departmentId === doctor.departmentId) && t.status === 'waiting'
      );

      if (!nextWaiting) return null;

      const updated = await api.callToken(nextWaiting.id);
      if (soundEnabled) {
        soundService.announceToken(updated.tokenNumber, doctor.roomNumber, language);
      }
      await refreshData();
      return updated;
    },
    [doctors, tokens, soundEnabled, language, refreshData]
  );

  const completeConsultation = useCallback(
    async (tokenId: string, notes?: string) => {
      await api.completeToken(tokenId, notes);
      if (soundEnabled) {
        soundService.playSuccessBeep();
      }
      await refreshData();
    },
    [soundEnabled, refreshData]
  );

  const setTokenPriority = useCallback(
    async (tokenId: string) => {
      await api.setTokenPriority(tokenId);
      await refreshData();
    },
    [refreshData]
  );

  const setDoctorStatus = useCallback(
    async (doctorId: string, status: string) => {
      await api.setDoctorStatus(doctorId, status);
      await refreshData();
    },
    [refreshData]
  );

  const skipPatient = useCallback(
    async (tokenId: string) => {
      await api.skipToken(tokenId);
      await refreshData();
    },
    [refreshData]
  );

  const delayUserToken = useCallback(
    async (tokenId: string) => {
      await api.delayToken(tokenId);
      await refreshData();
    },
    [refreshData]
  );

  const cancelUserToken = useCallback(
    async (tokenId: string) => {
      await api.cancelToken(tokenId);
      await refreshData();
    },
    [refreshData]
  );

  const announceCurrentToken = useCallback(
    (tokenId: string) => {
      const tok = tokens.find((t) => t.id === tokenId);
      if (!tok) return;
      const doc = doctors.find((d) => d.id === tok.doctorId);
      soundService.announceToken(tok.tokenNumber, doc?.roomNumber || 'Room 101', language);
    },
    [tokens, doctors, language]
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      await api.markNotificationRead(id);
      await refreshData();
    },
    [refreshData]
  );

  const clearNotifications = () => setNotifications([]);

  return (
    <QueueContext.Provider
      value={{
        currentUser,
        authLoading,
        departments,
        doctors,
        tokens,
        appointments,
        notifications,
        userToken,
        currentRole,
        language,
        soundEnabled,
        autoSimulate,
        activeDoctorId,
        login,
        register,
        logout,
        refreshData,
        setLanguage,
        setSoundEnabled,
        setAutoSimulate,
        setActiveDoctorId,
        issueInstantToken,
        bookAppointment,
        callNextPatient,
        completeConsultation,
        skipPatient,
        delayUserToken,
        cancelUserToken,
        setTokenPriority,
        setDoctorStatus,
        checkInAppointment,
        markNotificationRead,
        clearNotifications,
        announceCurrentToken,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
