import React from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  X, 
  Printer, 
  Share2, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Volume2, 
  CheckCircle2,
  Building2,
  Stethoscope
} from 'lucide-react';

interface DigitalPassModalProps {
  tokenId: string | null;
  onClose: () => void;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({ tokenId, onClose }) => {
  const { tokens, departments, doctors, language, announceCurrentToken } = useQueue();

  if (!tokenId) return null;

  const token = tokens.find((t) => t.id === tokenId);
  if (!token) return null;

  const dept = departments.find((d) => d.id === token.departmentId);
  const doctor = doctors.find((d) => d.id === token.doctorId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Pass Top Banner */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'ఆంధ్రప్రదేశ్ మెడికల్ సూపర్ స్పెషాలిటీ' : 'MediQueue Apex Healthcare Center'}</span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            {language === 'te' ? 'డిజిటల్ ఓపీడీ టోకెన్ పాస్' : 'Official OPD Token Pass'}
          </h3>
          <p className="text-xs text-indigo-200/90 mt-0.5">
            {language === 'te' ? 'ఈ పాస్‌ను కౌంటర్ లేదా డాక్టర్ గది వద్ద చూపించండి' : 'Present this digital pass or QR at OPD door'}
          </p>
        </div>

        {/* Pass Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Token Display Box */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center relative">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {language === 'te' ? 'క్యూ టోకెన్ నంబర్' : 'Queue Token Number'}
            </span>
            <div className="text-5xl font-black text-indigo-700 font-mono tracking-tight my-2">
              {token.tokenNumber}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{token.status.toUpperCase().replace('_', ' ')}</span>
            </div>

            {/* Generated QR Code Vector Representation */}
            <div className="mt-4 flex flex-col items-center justify-center">
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200">
                <svg
                  className="w-32 h-32"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Frame */}
                  <rect width="100" height="100" fill="white" />
                  {/* Top-left locator */}
                  <rect x="10" y="10" width="24" height="24" fill="#0f172a" />
                  <rect x="14" y="14" width="16" height="16" fill="white" />
                  <rect x="18" y="18" width="8" height="8" fill="#0f172a" />
                  {/* Top-right locator */}
                  <rect x="66" y="10" width="24" height="24" fill="#0f172a" />
                  <rect x="70" y="14" width="16" height="16" fill="white" />
                  <rect x="74" y="18" width="8" height="8" fill="#0f172a" />
                  {/* Bottom-left locator */}
                  <rect x="10" y="66" width="24" height="24" fill="#0f172a" />
                  <rect x="14" y="70" width="16" height="16" fill="white" />
                  <rect x="18" y="74" width="8" height="8" fill="#0f172a" />
                  {/* QR Pattern dots */}
                  <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="18" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="26" width="6" height="6" fill="#0f172a" />
                  <rect x="12" y="44" width="6" height="6" fill="#0f172a" />
                  <rect x="22" y="52" width="6" height="6" fill="#0f172a" />
                  <rect x="34" y="42" width="8" height="8" fill="#4338ca" />
                  <rect x="46" y="42" width="6" height="6" fill="#0f172a" />
                  <rect x="56" y="50" width="8" height="8" fill="#0f172a" />
                  <rect x="44" y="66" width="6" height="6" fill="#0f172a" />
                  <rect x="54" y="76" width="6" height="6" fill="#0f172a" />
                  <rect x="68" y="44" width="8" height="8" fill="#0f172a" />
                  <rect x="80" y="52" width="6" height="6" fill="#0f172a" />
                  <rect x="68" y="66" width="6" height="6" fill="#0f172a" />
                  <rect x="78" y="76" width="10" height="10" fill="#4338ca" />
                </svg>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-mono tracking-widest">
                SCAN AT ROOM SCANNER
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">{language === 'te' ? 'రోగి పేరు' : 'Patient Name'}</span>
              <strong className="text-slate-900">{token.patientName}</strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">{language === 'te' ? 'విభాగం' : 'Department'}</span>
              <strong className="text-slate-900">{language === 'te' ? dept?.nameTe : dept?.name}</strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">{language === 'te' ? 'డాక్టర్ & రూమ్' : 'Consultant & Room'}</span>
              <strong className="text-slate-900">
                {language === 'te' ? doctor?.nameTe : doctor?.name} ({doctor?.roomNumber})
              </strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">{language === 'te' ? 'జారీ సమయం' : 'Issued Time'}</span>
              <span className="text-slate-700 font-mono">
                {new Date(token.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">{language === 'te' ? 'ట్రయాజ్ ప్రాధాన్యత' : 'Acuity Level'}</span>
              <span className="font-bold font-mono text-indigo-700">{token.triageUrgency}</span>
            </div>
          </div>

          {/* Hospital Navigation Assistance */}
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong>{language === 'te' ? 'గది దిశలు' : 'Direction Guide'}:</strong>{' '}
              {language === 'te'
                ? `లిఫ్ట్ లేదా మెట్లు ద్వారా వెళ్ళండి. ${doctor?.roomNumber || 'Room 102'} వైపు సంప్రదించండి.`
                : `Proceed to East Wing, 2nd Floor, Room ${doctor?.roomNumber || 'Room 102'}. Waiting lounge chairs available outside.`}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={() => announceCurrentToken(token.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'te' ? 'అనౌన్స్ చేయి' : 'Audio Announce'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'పాస్ ప్రింట్ / సేవ్' : 'Print / Save Pass'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
