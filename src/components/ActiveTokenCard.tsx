import React from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  QrCode, 
  Clock, 
  MapPin, 
  Users, 
  Volume2, 
  Calendar, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ActiveTokenCardProps {
  onOpenPass: (tokenId: string) => void;
  onOpenInstantToken: () => void;
  onOpenDoctorBooking: () => void;
  onOpenEmergencyTriage: () => void;
}

export const ActiveTokenCard: React.FC<ActiveTokenCardProps> = ({
  onOpenPass,
  onOpenInstantToken,
  onOpenDoctorBooking,
  onOpenEmergencyTriage,
}) => {
  const { 
    userToken, 
    departments, 
    doctors, 
    language, 
    delayUserToken, 
    cancelUserToken, 
    announceCurrentToken,
    tokens
  } = useQueue();

  if (!userToken) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white shadow-xl p-6 sm:p-8">
        {/* Subtle decorative mesh */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'te' ? 'ఆన్‌లైన్ ఓపీడీ క్యూ సిస్టమ్' : 'Instant OPD Queue & Smart Triage'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {language === 'te' 
                ? 'హాస్పిటల్ క్యూలో నిలబడకుండా నేరుగా టోకెన్ పొందండి' 
                : 'Zero-Wait Hospital Queues. 1-Tap OPD Tokens.'}
            </h2>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              {language === 'te'
                ? 'ఫోన్‌పే తరహాలో త్వరితగతిన ఓపీడీ టోకెన్ తీసుకోండి, డాక్టర్ సంప్రదింపు స్లాట్ బుక్ చేయండి లేదా లైవ్ క్యూ స్టేటస్ ట్రాక్ చేయండి.'
                : 'Skip tedious registration lines. Generate instant hospital tokens, book verified specialists, and track live room calls directly from your phone.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={onOpenInstantToken}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{language === 'te' ? 'ఇన్‌స్టంట్ టోకెన్ తీసుకోండి' : 'Get Instant Token'}</span>
            </button>
            <button
              onClick={onOpenDoctorBooking}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm border border-white/15 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{language === 'te' ? 'డాక్టర్ బుకింగ్' : 'Book Specialist'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dept = departments.find(d => d.id === userToken.departmentId);
  const doctor = doctors.find(d => d.id === userToken.doctorId);

  // Calculate live patients ahead
  const waitingTokensInDept = tokens.filter(
    t => t.departmentId === userToken.departmentId && (t.status === 'waiting' || t.status === 'called')
  );
  const userIdx = waitingTokensInDept.findIndex(t => t.id === userToken.id);
  const patientsAhead = userIdx >= 0 ? userIdx : userToken.queuePosition;
  const estimatedWaitMins = Math.max(2, patientsAhead * (doctor?.averageMinsPerPatient || 5));

  const isCalled = userToken.status === 'called';
  const isInConsultation = userToken.status === 'in_consultation';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-950 text-white shadow-xl border border-indigo-700/50">
      {/* Top Banner Bar */}
      <div className="px-6 py-4 bg-indigo-950/60 border-b border-indigo-700/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            {language === 'te' ? 'యాక్టివ్ ఓపీడీ టోకెన్' : 'Live OPD Token'}
          </span>
          <span className="text-indigo-400 text-xs">·</span>
          <span className="text-xs font-semibold text-indigo-200">
            {language === 'te' ? dept?.nameTe : dept?.name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-indigo-300">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span>{doctor?.roomNumber || 'Room 102'}</span>
          <span>·</span>
          <span>{language === 'te' ? doctor?.nameTe : doctor?.name}</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="p-6 sm:p-7">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Big Token Number Display */}
          <div className="md:col-span-5 flex flex-col justify-center">
            <div className="text-xs font-medium text-indigo-300 mb-1">
              {language === 'te' ? 'మీ టోకెన్ సంఖ్య' : 'Your Token Number'}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono tabular-nums">
                {userToken.tokenNumber}
              </span>
              {userToken.isEmergency && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                  PRIORITY
                </span>
              )}
            </div>

            <p className="text-xs text-indigo-200/80 mt-2">
              {language === 'te' ? 'రోగి' : 'Patient'}: <strong className="text-white">{userToken.patientName}</strong> ({userToken.patientAge}y, {userToken.patientGender})
            </p>
          </div>

          {/* Real-time Status Gauges */}
          <div className="md:col-span-7 grid grid-cols-3 gap-3 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-xs">
            {/* Serving Now */}
            <div className="flex flex-col text-center sm:text-left">
              <span className="text-[11px] font-medium text-indigo-300 flex items-center gap-1 justify-center sm:justify-start">
                <Users className="w-3 h-3 text-indigo-400" />
                {language === 'te' ? 'ప్రస్తుత రోగి' : 'Now Serving'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-white font-mono tabular-nums mt-1">
                {dept?.currentServingToken || 'GM-108'}
              </span>
              <span className="text-[10px] text-slate-400">
                {language === 'te' ? 'డాక్టర్ గదిలో' : 'In Consultation'}
              </span>
            </div>

            {/* Patients Ahead */}
            <div className="flex flex-col text-center sm:text-left border-x border-white/10 px-2 sm:px-3">
              <span className="text-[11px] font-medium text-indigo-300 flex items-center gap-1 justify-center sm:justify-start">
                <Users className="w-3 h-3 text-amber-400" />
                {language === 'te' ? 'ముందు ఉన్నవారు' : 'Ahead of You'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono tabular-nums mt-1">
                {isCalled || isInConsultation ? 0 : patientsAhead}
              </span>
              <span className="text-[10px] text-slate-400">
                {language === 'te' ? 'రోగులు' : 'Patients waiting'}
              </span>
            </div>

            {/* Wait Time */}
            <div className="flex flex-col text-center sm:text-left">
              <span className="text-[11px] font-medium text-indigo-300 flex items-center gap-1 justify-center sm:justify-start">
                <Clock className="w-3 h-3 text-emerald-400" />
                {language === 'te' ? 'అంచనా సమయం' : 'Est. Wait'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono tabular-nums mt-1">
                {isCalled || isInConsultation ? 'Now!' : `~${estimatedWaitMins}m`}
              </span>
              <span className="text-[10px] text-slate-400">
                {isCalled ? 'Proceed to door' : 'AI dynamic prediction'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Status Notification Alert */}
        {isCalled && (
          <div className="mt-5 p-3.5 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
              <div className="text-xs sm:text-sm font-semibold">
                {language === 'te'
                  ? `మీ టోకెన్ ${userToken.tokenNumber} పిలవబడింది! దయచేసి ${doctor?.roomNumber} కు వెళ్లండి.`
                  : `Your Token ${userToken.tokenNumber} is CALLED! Please proceed to ${doctor?.roomNumber}.`}
              </div>
            </div>
            <button
              onClick={() => announceCurrentToken(userToken.id)}
              className="px-2.5 py-1 text-xs rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors shrink-0 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action Buttons Row (PhonePe style clean action pills) */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* View Digital Pass Button */}
            <button
              onClick={() => onOpenPass(userToken.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>{language === 'te' ? 'డిజిటల్ పాస్ & QR' : 'Digital Pass & QR'}</span>
            </button>

            {/* Delay 10 min button */}
            <button
              onClick={() => delayUserToken(userToken.id, 10)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 font-medium text-xs border border-white/10 transition-colors cursor-pointer"
              title="Step aside temporarily if you need a break or are getting tests done"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-300" />
              <span>{language === 'te' ? '10 నిమిషాలు ఆపండి' : 'Step Aside (+10m)'}</span>
            </button>

            {/* Audio chime button */}
            <button
              onClick={() => announceCurrentToken(userToken.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 font-medium text-xs border border-white/10 transition-colors cursor-pointer"
              title="Play hospital voice announcement"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>{language === 'te' ? 'వాయిస్ అనౌన్స్' : 'Hear Call'}</span>
            </button>
          </div>

          {/* Cancel Token */}
          <button
            onClick={() => {
              if (confirm(language === 'te' ? 'ఖచ్చితంగా టోకెన్ రద్దు చేయాలనుకుంటున్నారా?' : 'Are you sure you want to cancel this token?')) {
                cancelUserToken(userToken.id);
              }
            }}
            className="text-xs text-rose-300 hover:text-rose-100 transition-colors font-medium px-2 py-1 cursor-pointer"
          >
            {language === 'te' ? 'టోకెన్ రద్దు చేయి' : 'Cancel Token'}
          </button>
        </div>
      </div>
    </div>
  );
};
