import React from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Zap, 
  Calendar, 
  AlertTriangle, 
  Activity, 
  QrCode, 
  Stethoscope, 
  Building2, 
  Clock,
  Sparkles
} from 'lucide-react';

interface QuickActionsGridProps {
  onOpenInstantToken: () => void;
  onOpenDoctorBooking: () => void;
  onOpenEmergencyTriage: () => void;
  onNavigateTab: (tab: string) => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onOpenInstantToken,
  onOpenDoctorBooking,
  onOpenEmergencyTriage,
  onNavigateTab,
}) => {
  const { language } = useQueue();

  const actions = [
    {
      id: 'instant-token',
      title: language === 'te' ? 'ఇన్‌స్టంట్ టోకెన్' : 'Instant Token',
      subtitle: language === 'te' ? '1-ట్యాప్ ఓపీడీ పాస్' : '10s Digital Pass',
      icon: Zap,
      color: 'bg-emerald-500 text-white shadow-emerald-200',
      badge: language === 'te' ? 'త్వరితం' : 'FAST',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      onClick: onOpenInstantToken,
    },
    {
      id: 'book-doctor',
      title: language === 'te' ? 'డాక్టర్ బుకింగ్' : 'Book Doctor',
      subtitle: language === 'te' ? 'స్పెషలిస్ట్ స్లాట్స్' : 'Specialist Slots',
      icon: Calendar,
      color: 'bg-indigo-600 text-white shadow-indigo-200',
      badge: language === 'te' ? 'స్లాట్లు' : 'SLOTS',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      onClick: onOpenDoctorBooking,
    },
    {
      id: 'emergency-triage',
      title: language === 'te' ? 'ఎమర్జెన్సీ ట్రయాజ్' : 'AI Triage',
      subtitle: language === 'te' ? 'తీవ్ర లక్షణాల ప్రాధాన్యత' : 'Urgency Acuity',
      icon: AlertTriangle,
      color: 'bg-rose-500 text-white shadow-rose-200',
      badge: language === 'te' ? '24/7' : 'PRIORITY',
      badgeColor: 'bg-rose-100 text-rose-800',
      onClick: onOpenEmergencyTriage,
    },
    {
      id: 'live-board',
      title: language === 'te' ? 'లైవ్ క్యూ బోర్డ్' : 'Live Board',
      subtitle: language === 'te' ? 'రూమ్ కౌంటర్లు & సౌండ్' : 'Department Displays',
      icon: Activity,
      color: 'bg-blue-600 text-white shadow-blue-200',
      badge: 'LIVE',
      badgeColor: 'bg-blue-100 text-blue-800',
      onClick: () => onNavigateTab('live-queue'),
    },
    {
      id: 'my-passes',
      title: language === 'te' ? 'నా పాస్‌లు & QR' : 'My Token Passes',
      subtitle: language === 'te' ? 'డిజిటల్ రసీదు' : 'Active & Past Receipts',
      icon: QrCode,
      color: 'bg-violet-600 text-white shadow-violet-200',
      badge: null,
      badgeColor: '',
      onClick: () => onNavigateTab('passes'),
    },
    {
      id: 'doctors-list',
      title: language === 'te' ? 'డాక్టర్ల జాబితా' : 'Find Specialists',
      subtitle: language === 'te' ? 'డ్యూటీలో ఉన్న వైద్యులు' : 'Consultants on Duty',
      icon: Stethoscope,
      color: 'bg-teal-600 text-white shadow-teal-200',
      badge: null,
      badgeColor: '',
      onClick: () => onNavigateTab('doctors'),
    },
    {
      id: 'departments',
      title: language === 'te' ? 'విభాగాల రద్దీ' : 'OPD Wait Times',
      subtitle: language === 'te' ? 'కౌంటర్ సమయాలు' : 'Live Room Traffic',
      icon: Clock,
      color: 'bg-amber-600 text-white shadow-amber-200',
      badge: null,
      badgeColor: '',
      onClick: () => onNavigateTab('live-queue'),
    },
    {
      id: 'emergency-call',
      title: language === 'te' ? 'ఎమర్జెన్సీ హెల్ప్‌లైన్' : 'Emergency 108',
      subtitle: language === 'te' ? '24/7 ట్రౌమా డెస్క్' : 'Hospital Code Blue',
      icon: AlertTriangle,
      color: 'bg-slate-800 text-white shadow-slate-200',
      badge: '24x7',
      badgeColor: 'bg-rose-100 text-rose-800',
      onClick: onOpenEmergencyTriage,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {language === 'te' ? 'రోగి సేవా కేంద్రం (క్విక్ యాక్షన్స్)' : 'Patient Quick Services'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'te'
              ? 'ఫోన్‌పే తరహాలో ఒకే ట్యాప్‌తో మీ ఓపీడీ సేవను ప్రారంభించండి'
              : 'Instant hospital operations designed for zero wait times'}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'te' ? 'ఇన్‌స్టంట్ సర్వీస్' : 'Instant 1-Tap'}</span>
        </div>
      </div>

      {/* 4 columns on desktop, 2 columns on mobile (PhonePe style grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className="flex flex-col items-center sm:items-start text-center sm:text-left p-3.5 sm:p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group cursor-pointer relative"
            >
              {act.badge && (
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.2 rounded ${act.badgeColor}`}>
                  {act.badge}
                </span>
              )}

              {/* Icon Circle */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-md transition-transform group-hover:scale-105 ${act.color}`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Title & Subtitle */}
              <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {act.title}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {act.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
