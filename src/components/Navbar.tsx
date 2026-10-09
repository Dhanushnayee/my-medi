import React from 'react';
import { useQueue } from '../context/QueueContext';
import { UserRole } from '../types';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Languages, 
  Activity, 
  LogOut,
  User,
  Stethoscope,
  Building2,
  BarChart3,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenNotifications,
  activeTab,
  setActiveTab,
  onOpenAuth,
}) => {
  const { 
    currentUser,
    logout,
    language, 
    setLanguage, 
    soundEnabled, 
    setSoundEnabled, 
    notifications,
  } = useQueue();

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleBadgeConfig: Record<UserRole, { labelEn: string; labelTe: string; color: string; icon: any }> = {
    patient: { labelEn: 'Patient', labelTe: 'రోగి', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: User },
    doctor: { labelEn: 'Doctor OPD', labelTe: 'డాక్టర్', color: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: Stethoscope },
    receptionist: { labelEn: 'Receptionist', labelTe: 'రిసెప్షన్', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: Building2 },
    admin: { labelEn: 'Hospital Admin', labelTe: 'అడ్మిన్', color: 'bg-purple-50 text-purple-800 border-purple-200', icon: BarChart3 },
  };

  const userRole = currentUser?.role || 'patient';
  const roleInfo = roleBadgeConfig[userRole];
  const RoleIcon = roleInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <button 
              onClick={() => {
                if (userRole === 'doctor') setActiveTab('doctor-desk');
                else if (userRole === 'receptionist') setActiveTab('reception-desk');
                else if (userRole === 'admin') setActiveTab('admin-kpi');
                else setActiveTab('dashboard');
              }}
              className="flex items-center gap-1.5 sm:gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors shrink-0">
                <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div className="flex items-center min-w-0">
                <span className="text-sm sm:text-lg font-bold sm:font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  MediQueue<span className="text-indigo-600">AI</span>
                </span>
                <span className="hidden lg:inline-block ml-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                  Live OPD
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links - FILTERED STRICTLY BY ROLE (Desktop only) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            {/* Patient navigation */}
            {userRole === 'patient' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'dashboard' || activeTab === 'default'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'నా డాష్‌బోర్డ్' : 'My Dashboard'}
                </button>
                <button
                  onClick={() => setActiveTab('live-queue')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'live-queue'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'లైవ్ క్యూ బోర్డ్' : 'Live OPD Board'}
                </button>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'doctors'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'డాక్టర్లు & స్లాట్లు' : 'Doctors & Slots'}
                </button>
                <button
                  onClick={() => setActiveTab('passes')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'passes'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'నా పాస్‌లు & బుకింగ్స్' : 'My Passes & QR'}
                </button>
              </>
            )}

            {/* Doctor navigation */}
            {userRole === 'doctor' && (
              <>
                <button
                  onClick={() => setActiveTab('doctor-desk')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'doctor-desk' || activeTab === 'default'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'డాక్టర్ కన్సల్టేషన్ డెస్క్' : 'OPD Consultation Desk'}
                </button>
                <button
                  onClick={() => setActiveTab('live-queue')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'live-queue'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'లైవ్ క్యూ బోర్డ్' : 'Live OPD Board'}
                </button>
              </>
            )}

            {/* Receptionist navigation */}
            {userRole === 'receptionist' && (
              <>
                <button
                  onClick={() => setActiveTab('reception-desk')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'reception-desk' || activeTab === 'default'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'వాక్-ఇన్ రిసెప్షన్ కౌంటర్' : 'Walk-in Reception Desk'}
                </button>
                <button
                  onClick={() => setActiveTab('live-queue')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'live-queue'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'లైవ్ క్యూ బోర్డ్' : 'Live OPD Board'}
                </button>
              </>
            )}

            {/* Admin navigation */}
            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('admin-kpi')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'admin-kpi' || activeTab === 'default'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'హాస్పిటల్ ఎగ్జిక్యూటివ్ డాష్‌బోర్డ్' : 'Hospital Executive Analytics'}
                </button>
                <button
                  onClick={() => setActiveTab('live-queue')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'live-queue'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'లైవ్ క్యూ బోర్డ్' : 'Live OPD Board'}
                </button>
                <button
                  onClick={() => setActiveTab('doctor-desk')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'doctor-desk'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'డాక్టర్ డెస్క్' : 'Doctor Desk'}
                </button>
                <button
                  onClick={() => setActiveTab('reception-desk')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'reception-desk'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'te' ? 'రిసెప్షన్ కౌంటర్' : 'Reception Desk'}
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Controls, User Profile & Logout */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Chimes & Audio' : 'Unmute Chimes & Audio'}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                soundEnabled 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Language Switcher (Telugu / English) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Change Language"
            >
              <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 shrink-0" />
              <span className="sm:hidden">{language === 'en' ? 'తె' : 'EN'}</span>
              <span className="hidden sm:inline">{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 sm:p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shrink-0"
              aria-label="View Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-rose-500 text-white rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Logged in User Pill + Logout Button */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200 shrink-0">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border inline-block ${roleInfo.color}`}>
                    {language === 'te' ? roleInfo.labelTe : roleInfo.labelEn}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'te' ? 'లాగౌట్' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'లాగిన్' : 'Sign In'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
