import React from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  QrCode, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ArrowRight,
  Printer
} from 'lucide-react';

interface MyPassesViewProps {
  onOpenPass: (tokenId: string) => void;
  onOpenInstantToken: () => void;
  onOpenDoctorBooking: () => void;
}

export const MyPassesView: React.FC<MyPassesViewProps> = ({
  onOpenPass,
  onOpenInstantToken,
  onOpenDoctorBooking,
}) => {
  const { tokens, appointments, departments, doctors, checkInAppointment, language } = useQueue();

  // Find user tokens
  const userTokens = tokens.filter((t) => t.patientPhone.includes('91234') || t.patientName.includes('Dhanush') || t.status !== 'cancelled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {language === 'te' ? 'నా డిజిటల్ టోకెన్ పాస్‌లు & బుకింగ్స్' : 'My Digital Passes & Appointments'}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'te' ? 'మీ యాక్టివ్ టోకెన్లు, QR కోడ్‌లు మరియు హాస్పిటల్ రసీదులు' : 'Manage your hospital queue tickets, QR passes, and doctor consultations'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInstantToken}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>{language === 'te' ? 'కొత్త టోకెన్' : 'New Token'}</span>
          </button>
          <button
            onClick={onOpenDoctorBooking}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'కొత్త బుకింగ్' : 'New Appointment'}</span>
          </button>
        </div>
      </div>

      {/* Tokens List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          {language === 'te' ? 'యాక్టివ్ మరియు గత టోకెన్లు' : 'Hospital Queue Tokens'}
        </h4>

        {userTokens.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
            <QrCode className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">
              {language === 'te' ? 'మీకు ప్రస్తుతం ఎలాంటి టోకెన్లు లేవు' : 'No hospital tokens generated yet.'}
            </p>
            <button
              onClick={onOpenInstantToken}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Get Instant Token
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userTokens.map((tok) => {
              const dept = departments.find((d) => d.id === tok.departmentId);
              const doc = doctors.find((d) => d.id === tok.doctorId);
              return (
                <div
                  key={tok.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black text-indigo-700 font-mono">
                        {tok.tokenNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full font-mono ${
                          tok.status === 'in_consultation'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tok.status === 'called'
                            ? 'bg-amber-100 text-amber-800'
                            : tok.status === 'completed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {tok.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-slate-900">{tok.patientName}</div>
                      <div className="text-slate-500">
                        {language === 'te' ? dept?.nameTe : dept?.name} · {doc?.roomNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Issued: {new Date(tok.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onOpenPass(tok.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{language === 'te' ? 'డిజిటల్ పాస్ & QR చూడండి' : 'View Pass & QR'}</span>
                    </button>
                    <button
                      onClick={() => onOpenPass(tok.id)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title="Print"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmed Appointments */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          {language === 'te' ? 'ముందస్తు అపాయింట్‌మెంట్లు' : 'Doctor Appointments'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((apt) => {
            const doc = doctors.find((d) => d.id === apt.doctorId);
            const dept = departments.find((d) => d.id === apt.departmentId);
            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      {apt.timeSlot} · {apt.date}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                      {apt.status}
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-slate-900 mt-2">
                    {language === 'te' ? doc?.nameTe : doc?.name}
                  </h5>
                  <p className="text-xs text-slate-500">
                    {language === 'te' ? doc?.specialtyTe : doc?.specialty} ({doc?.roomNumber})
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 italic">
                    "{apt.reason}"
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  {apt.status === 'confirmed' ? (
                    <button
                      onClick={() => checkInAppointment(apt.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{language === 'te' ? 'ఇప్పుడే క్యూ టోకెన్ తీసుకోండి' : 'Check-In to Live Queue'}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Checked-In ({apt.tokenNumber})</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
