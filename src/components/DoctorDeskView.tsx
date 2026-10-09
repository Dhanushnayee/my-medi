import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Stethoscope, 
  Users, 
  Volume2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Phone,
  FileText
} from 'lucide-react';

export const DoctorDeskView: React.FC = () => {
  const { 
    doctors, 
    departments, 
    tokens, 
    activeDoctorId, 
    setActiveDoctorId, 
    callNextPatient, 
    completeConsultation, 
    skipPatient,
    setDoctorStatus,
    announceCurrentToken,
    language 
  } = useQueue();

  const doctor = doctors.find((d) => d.id === activeDoctorId) || doctors[0];
  const dept = departments.find((d) => d.id === doctor.departmentId);

  // Find currently active patient for this doctor
  const currentToken = tokens.find(
    (t) => (t.doctorId === doctor.id || t.departmentId === doctor.departmentId) &&
      (t.status === 'in_consultation' || t.status === 'called')
  );

  // Find waiting queue for this doctor / department
  const waitingTokens = tokens.filter(
    (t) => (t.doctorId === doctor.id || t.departmentId === doctor.departmentId) && t.status === 'waiting'
  );

  // Recently completed tokens
  const completedTokens = tokens.filter(
    (t) => (t.doctorId === doctor.id || t.departmentId === doctor.departmentId) && t.status === 'completed'
  );

  const [clinicalNotes, setClinicalNotes] = useState('');

  const handleCallNext = async () => {
    await callNextPatient(doctor.id);
  };

  const handleComplete = async () => {
    if (currentToken) {
      await completeConsultation(currentToken.id, clinicalNotes);
      setClinicalNotes('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Doctor Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 overflow-hidden shrink-0">
            <img
              src={doctor.photo}
              alt={doctor.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'te' ? doctor.nameTe : doctor.name}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {doctor.roomNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'te' ? doctor.specialtyTe : doctor.specialty} · {language === 'te' ? dept?.nameTe : dept?.name}
            </p>
          </div>
        </div>

        {/* Doctor Switcher & Duty Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setDoctorStatus(doctor.id, 'available')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                doctor.currentStatus === 'available'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ● On Duty
            </button>
            <button
              type="button"
              onClick={() => setDoctorStatus(doctor.id, 'on_break')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                doctor.currentStatus === 'on_break'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ☕ Break
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={activeDoctorId}
              onChange={(e) => setActiveDoctorId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {language === 'te' ? d.nameTe : d.name} ({d.roomNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Consultation Console */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  {language === 'te' ? 'ప్రస్తుత కన్సల్టేషన్' : 'Active Patient In Consultation'}
                </h4>
              </div>
              {currentToken && (
                <button
                  onClick={() => announceCurrentToken(currentToken.id)}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'తిరిగి పిలవండి' : 'Re-announce'}</span>
                </button>
              )}
            </div>

            {currentToken ? (
              <div className="mt-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <div>
                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      {language === 'te' ? 'కాల్ చేసిన టోకెన్' : 'Token'}
                    </span>
                    <div className="text-4xl font-black text-indigo-950 font-mono">
                      {currentToken.tokenNumber}
                    </div>
                  </div>

                  <div className="space-y-1 text-right sm:text-right">
                    <div className="text-base font-bold text-slate-900">
                      {currentToken.patientName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {currentToken.patientAge}y · {currentToken.patientGender} · {currentToken.patientPhone}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        currentToken.triageUrgency === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : currentToken.triageUrgency === 'URGENT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Acuity: {currentToken.triageUrgency}
                    </span>
                  </div>
                </div>

                {/* Symptoms / Complaints */}
                {currentToken.triageSymptoms && currentToken.triageSymptoms.length > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      {language === 'te' ? 'లక్షణాలు / సమస్యలు' : 'Reported Symptoms'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentToken.triageSymptoms.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-white text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Doctor Note Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'te' ? 'డాక్టర్ కన్సల్టేషన్ నోట్స్ / ప్రిస్క్రిప్షన్' : 'Quick Prescription / Doctor Notes'}
                  </label>
                  <textarea
                    rows={3}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Enter diagnostic impression, Rx, or advice..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Desk Control Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleComplete}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'te' ? 'కన్సల్టేషన్ పూర్తయింది' : 'Finish & Next'}</span>
                  </button>

                  <button
                    onClick={() => skipPatient(currentToken.id)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500" />
                    <span>{language === 'te' ? 'రోగి రాలేదు / దాటవేయి' : 'Skip / Patient Away'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div>
                  <h5 className="text-base font-bold text-slate-800">
                    {language === 'te' ? 'గది ప్రస్తుతం ఖాళీగా ఉంది' : 'Room Currently Available'}
                  </h5>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    {language === 'te'
                      ? 'తదుపరి వేచి ఉన్న రోగిని పిలవడానికి క్రింది బటన్ నొక్కండి.'
                      : 'No patient in consultation right now. Click below to call the next waiting token.'}
                  </p>
                </div>

                <button
                  onClick={handleCallNext}
                  disabled={waitingTokens.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {language === 'te'
                      ? `తదుపరి రోగిని పిలవండి (${waitingTokens.length} వేచి ఉన్నారు)`
                      : `Call Next Patient (${waitingTokens.length} waiting)`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Waiting Queue List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  {language === 'te' ? 'వేచి ఉన్న క్యూ' : 'Waiting Queue'}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {waitingTokens.length} {language === 'te' ? 'మంది' : 'patients'}
              </span>
            </div>

            {waitingTokens.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {language === 'te' ? 'క్యూలో ఎవరూ వేచి లేరు' : 'Queue is completely clear!'}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {waitingTokens.map((t, idx) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold font-mono text-[11px]">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{t.patientName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {t.tokenNumber} · {t.patientAge}y
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                          t.triageUrgency === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : t.triageUrgency === 'URGENT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.triageUrgency}
                      </span>
                      <button
                        onClick={() => announceCurrentToken(t.id)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600"
                        title="Announce token"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Doctor Summary stats */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {language === 'te' ? 'నేటి కౌంటర్ సారాంశం' : "Today's OPD Throughput"}
            </h5>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 text-[11px] block">{language === 'te' ? 'పూర్తయిన సంఖ్య' : 'Completed'}</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                  {completedTokens.length + 8}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 text-[11px] block">{language === 'te' ? 'సగటు సమయం' : 'Avg Speed'}</span>
                <span className="text-xl font-bold font-mono text-indigo-300 mt-1 block">
                  {doctor.averageMinsPerPatient} mins
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
