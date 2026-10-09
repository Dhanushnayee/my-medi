/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QueueProvider, useQueue } from './context/QueueContext';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { ActiveTokenCard } from './components/ActiveTokenCard';
import { QuickActionsGrid } from './components/QuickActionsGrid';
import { LiveQueueTracker } from './components/LiveQueueTracker';
import { DoctorsListView } from './components/DoctorsListView';
import { MyPassesView } from './components/MyPassesView';
import { DoctorDeskView } from './components/DoctorDeskView';
import { ReceptionDeskView } from './components/ReceptionDeskView';
import { AdminAnalyticsView } from './components/AdminAnalyticsView';
import { InstantTokenModal } from './components/InstantTokenModal';
import { BookDoctorModal } from './components/BookDoctorModal';
import { EmergencyTriageModal } from './components/EmergencyTriageModal';
import { DigitalPassModal } from './components/DigitalPassModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { 
  Phone, 
  ArrowRight,
  Zap,
  Activity,
  Home,
  QrCode,
  Stethoscope,
  Building2,
  BarChart3,
  Calendar
} from 'lucide-react';

function DashboardContent() {
  const { currentUser, authLoading, language, departments, doctors } = useQueue();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('default');

  // Modal States
  const [instantTokenOpen, setInstantTokenOpen] = useState(false);
  const [selectedDeptForToken, setSelectedDeptForToken] = useState<string | undefined>();
  const [selectedDoctorForToken, setSelectedDoctorForToken] = useState<string | undefined>();
  
  const [bookDoctorOpen, setBookDoctorOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<string | undefined>();

  const [emergencyTriageOpen, setEmergencyTriageOpen] = useState(false);
  const [passModalTokenId, setPassModalTokenId] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // If loading session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-white text-center">
          <Activity className="w-9 h-9 text-indigo-400 animate-spin" />
          <span className="text-sm font-semibold tracking-wide">Loading MediQueue Secure Portal...</span>
        </div>
      </div>
    );
  }

  // If user is not logged in: SHOW DEDICATED LOGIN / REGISTER SCREEN
  if (!currentUser) {
    return <AuthScreen />;
  }

  const handleOpenInstantToken = (deptId?: string, doctorId?: string) => {
    setSelectedDeptForToken(deptId);
    setSelectedDoctorForToken(doctorId);
    setInstantTokenOpen(true);
  };

  const handleOpenDoctorBooking = (doctorId?: string) => {
    setSelectedDoctorForBooking(doctorId);
    setBookDoctorOpen(true);
  };

  const handleOpenPass = (tokenId: string) => {
    setPassModalTokenId(tokenId);
  };

  const userRole = currentUser.role;

  // Render Role-specific content without any white-screen possibility
  const renderRoleContent = () => {
    // 1. DOCTOR PORTAL
    if (userRole === 'doctor') {
      if (activeTab === 'live-queue') {
        return <LiveQueueTracker onSelectDepartmentForToken={handleOpenInstantToken} />;
      }
      return <DoctorDeskView />;
    }

    // 2. RECEPTIONIST PORTAL
    if (userRole === 'receptionist') {
      if (activeTab === 'live-queue') {
        return <LiveQueueTracker onSelectDepartmentForToken={handleOpenInstantToken} />;
      }
      return <ReceptionDeskView onOpenPass={handleOpenPass} />;
    }

    // 3. ADMIN PORTAL
    if (userRole === 'admin') {
      if (activeTab === 'live-queue') {
        return <LiveQueueTracker onSelectDepartmentForToken={handleOpenInstantToken} />;
      }
      if (activeTab === 'doctor-desk') {
        return <DoctorDeskView />;
      }
      if (activeTab === 'reception-desk') {
        return <ReceptionDeskView onOpenPass={handleOpenPass} />;
      }
      return <AdminAnalyticsView />;
    }

    // 4. PATIENT PORTAL (PhonePe Style)
    if (activeTab === 'live-queue') {
      return <LiveQueueTracker onSelectDepartmentForToken={handleOpenInstantToken} />;
    }
    if (activeTab === 'doctors') {
      return (
        <DoctorsListView
          onBookDoctor={handleOpenDoctorBooking}
          onInstantTokenForDoctor={(deptId, docId) => handleOpenInstantToken(deptId, docId)}
        />
      );
    }
    if (activeTab === 'passes') {
      return (
        <MyPassesView
          onOpenPass={handleOpenPass}
          onOpenInstantToken={() => handleOpenInstantToken()}
          onOpenDoctorBooking={() => handleOpenDoctorBooking()}
        />
      );
    }

    // Default Patient Dashboard
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* 1. PhonePe-style Prominent Top Live Status Card */}
        <ActiveTokenCard
          onOpenPass={handleOpenPass}
          onOpenInstantToken={() => handleOpenInstantToken()}
          onOpenDoctorBooking={() => handleOpenDoctorBooking()}
          onOpenEmergencyTriage={() => setEmergencyTriageOpen(true)}
        />

        {/* 2. PhonePe-style Quick Actions Grid */}
        <QuickActionsGrid
          onOpenInstantToken={() => handleOpenInstantToken()}
          onOpenDoctorBooking={() => handleOpenDoctorBooking()}
          onOpenEmergencyTriage={() => setEmergencyTriageOpen(true)}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />

        {/* 3. Live Department Queue Glance & Fast Access */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {language === 'te' ? 'విభాగాల వారీగా ప్రత్యక్ష క్యూ సమాచారం' : 'Live Department Wait Times'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'te' ? 'హాస్పిటల్ లోపలికి రాగానే ఎక్కడ రద్దీ తక్కువగా ఉందో చూడండి' : 'Check current room calls before reaching the hospital'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('live-queue')}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              <span>{language === 'te' ? 'అన్ని విభాగాలు' : 'View All Boards'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.slice(0, 3).map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900">
                      {language === 'te' ? dept.nameTe : dept.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {dept.roomNumbers}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Now Calling</span>
                      <span className="text-xl font-black text-indigo-700 font-mono tabular-nums">
                        {dept.currentServingToken}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Wait Time</span>
                      <span className="text-sm font-bold text-slate-800 font-mono tabular-nums">
                        ~{dept.estimatedWaitMinutes}m
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenInstantToken(dept.id)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'te' ? 'టోకెన్ పొందండి' : 'Get Token'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Verified Specialists on Duty */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {language === 'te' ? 'డ్యూటీలో ఉన్న సీనియర్ వైద్యులు' : 'Chief Specialists on OPD Duty'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'te' ? 'కన్సల్టేషన్ స్లాట్లను నేరుగా బుక్ చేసుకోండి' : 'Book a verified slot or walk-in queue pass'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('doctors')}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              <span>{language === 'te' ? 'డాక్టర్ల జాబితా' : 'See All Specialists'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doctors.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={doc.photo}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {language === 'te' ? doc.nameTe : doc.name}
                      </h4>
                      <p className="text-[11px] text-indigo-600 truncate">
                        {language === 'te' ? doc.specialtyTe : doc.specialty}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {doc.roomNumber} · ₹{doc.consultationFee}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenDoctorBooking(doc.id)}
                    className="py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    {language === 'te' ? 'స్లాట్ బుక్' : 'Book'}
                  </button>
                  <button
                    onClick={() => handleOpenInstantToken(doc.departmentId, doc.id)}
                    className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    {language === 'te' ? 'క్యూ టోకెన్' : 'Token'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Hospital Emergency Banner */}
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950">
                {language === 'te' ? '24/7 అత్యవసర సంరక్షణ (ఎమర్జెన్సీ వార్డ్)' : '24/7 Emergency Care & Trauma Desk'}
              </h4>
              <p className="text-xs text-rose-800/90 mt-0.5">
                {language === 'te'
                  ? 'ఛాతీ నొప్పి, పక్షవాతం లేదా తీవ్ర గాయాలకు తక్షణమే 108 కు కాల్ చేయండి లేదా ఎమర్జెన్సీ ట్రయాజ్ ఉపయోగించండి.'
                  : 'Severe chest pain, stroke signs, or trauma bypass the OPD line with priority triage code.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEmergencyTriageOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-colors shrink-0 cursor-pointer"
          >
            <span>{language === 'te' ? 'అత్యవసర ట్రయాజ్ ప్రారంభించండి' : 'Start Emergency AI Triage'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16 md:pb-0">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar 
        onOpenNotifications={() => setNotificationsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderRoleContent()}
      </main>

      {/* Mobile-Friendly PhonePe-Style Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
        {userRole === 'patient' && (
          <>
            <button
              onClick={() => setActiveTab('default')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'default' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{language === 'te' ? 'హోమ్' : 'Home'}</span>
            </button>
            <button
              onClick={() => handleOpenInstantToken()}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-emerald-600 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-emerald-600" />
              <span>{language === 'te' ? 'టోకెన్' : 'Token'}</span>
            </button>
            <button
              onClick={() => setActiveTab('passes')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'passes' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{language === 'te' ? 'పాస్‌లు' : 'Passes'}</span>
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'doctors' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{language === 'te' ? 'డాక్టర్లు' : 'Doctors'}</span>
            </button>
            <button
              onClick={() => setActiveTab('live-queue')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'live-queue' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{language === 'te' ? 'క్యూ' : 'Queue'}</span>
            </button>
          </>
        )}

        {userRole === 'doctor' && (
          <>
            <button
              onClick={() => setActiveTab('default')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'default' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>OPD Desk</span>
            </button>
            <button
              onClick={() => setActiveTab('live-queue')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'live-queue' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Live Queue</span>
            </button>
          </>
        )}

        {userRole === 'receptionist' && (
          <>
            <button
              onClick={() => setActiveTab('default')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'default' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Reception Desk</span>
            </button>
            <button
              onClick={() => setActiveTab('live-queue')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'live-queue' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Live Board</span>
            </button>
          </>
        )}

        {userRole === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('default')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'default' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('doctor-desk')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'doctor-desk' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctors</span>
            </button>
            <button
              onClick={() => setActiveTab('reception-desk')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'reception-desk' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Reception</span>
            </button>
            <button
              onClick={() => setActiveTab('live-queue')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                activeTab === 'live-queue' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Queue</span>
            </button>
          </>
        )}
      </div>

      {/* Clean Unboxed Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">MediQueue AI</span>
              <span aria-hidden="true">·</span>
              <span>Signed in as <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">NABH & Digital Health ID Compliant</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <InstantTokenModal
        isOpen={instantTokenOpen}
        onClose={() => setInstantTokenOpen(false)}
        defaultDepartmentId={selectedDeptForToken}
        onSuccess={(tokenId) => handleOpenPass(tokenId)}
      />

      <BookDoctorModal
        isOpen={bookDoctorOpen}
        onClose={() => setBookDoctorOpen(false)}
        defaultDoctorId={selectedDoctorForBooking}
        onSuccess={() => setActiveTab('passes')}
      />

      <EmergencyTriageModal
        isOpen={emergencyTriageOpen}
        onClose={() => setEmergencyTriageOpen(false)}
        onSuccess={(tokenId) => handleOpenPass(tokenId)}
      />

      <DigitalPassModal
        tokenId={passModalTokenId}
        onClose={() => setPassModalTokenId(null)}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueueProvider>
      <DashboardContent />
    </QueueProvider>
  );
}
