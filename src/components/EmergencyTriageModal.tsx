import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { TRIAGE_SYMPTOMS_LIST } from '../data/mockData';
import { TriageUrgency } from '../types';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Clock, 
  HeartCrack,
  HelpCircle,
  Zap
} from 'lucide-react';

interface EmergencyTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tokenId: string) => void;
}

export const EmergencyTriageModal: React.FC<EmergencyTriageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { issueInstantToken, language } = useQueue();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [patientName, setPatientName] = useState('Dhanush Mangali');
  const [patientPhone, setPatientPhone] = useState('+91 91234 56789');
  const [patientAge, setPatientAge] = useState<number>(26);
  const [customComplaint, setCustomComplaint] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Determine Acuity based on selected red-flag symptoms
  const hasCritical = selectedSymptoms.some((sId) => {
    const s = TRIAGE_SYMPTOMS_LIST.find((item) => item.id === sId);
    return s?.urgency === 'CRITICAL';
  });

  const hasUrgent = selectedSymptoms.some((sId) => {
    const s = TRIAGE_SYMPTOMS_LIST.find((item) => item.id === sId);
    return s?.urgency === 'URGENT';
  });

  const evaluatedUrgency: TriageUrgency = hasCritical
    ? 'CRITICAL'
    : hasUrgent
    ? 'URGENT'
    : 'STANDARD';

  // Find recommended department
  const firstCrit = selectedSymptoms.map((sId) => TRIAGE_SYMPTOMS_LIST.find((i) => i.id === sId)).find(Boolean);
  const recommendedDeptId = firstCrit?.department || 'gen-med';

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const symptomLabels = selectedSymptoms.map((sId) => {
      const match = TRIAGE_SYMPTOMS_LIST.find((i) => i.id === sId);
      return match ? match.label : sId;
    });
    if (customComplaint.trim()) {
      symptomLabels.push(customComplaint);
    }

    try {
      const token = await issueInstantToken({
        patientName,
        patientPhone,
        patientAge: Number(patientAge) || 28,
        patientGender: 'male',
        departmentId: recommendedDeptId,
        isEmergency: evaluatedUrgency === 'CRITICAL' || evaluatedUrgency === 'URGENT',
        triageUrgency: evaluatedUrgency,
        triageSymptoms: symptomLabels,
      });

      setSubmitting(false);
      onClose();
      onSuccess(token.id);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{language === 'te' ? 'ఎమర్జెన్సీ AI ట్రయాజ్ అసెస్‌మెంట్' : 'Emergency AI Triage Engine'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'te' ? 'లక్షణాల తీవ్రతను బట్టి ప్రాధాన్యత క్యూ నంబర్ ఇవ్వబడుతుంది' : 'Real-time Clinical Acuity & Priority Queue Assignment'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTriageSubmit} className="mt-5 space-y-4">
          {/* Acuity Level Status Bar */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              evaluatedUrgency === 'CRITICAL'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : evaluatedUrgency === 'URGENT'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm">
                <AlertTriangle
                  className={`w-4 h-4 ${
                    evaluatedUrgency === 'CRITICAL'
                      ? 'text-rose-600 animate-bounce'
                      : evaluatedUrgency === 'URGENT'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                />
                <span>
                  {evaluatedUrgency === 'CRITICAL'
                    ? (language === 'te' ? 'స్థాయి 1: తీవ్రమైన అత్యవసరం (ప్రాధాన్యత 1)' : 'Level 1: Critical Emergency (Priority Bump)')
                    : evaluatedUrgency === 'URGENT'
                    ? (language === 'te' ? 'స్థాయి 2: త్వరిత సంరక్షణ అవసరం (అర్జెంటు)' : 'Level 2: Urgent Priority (~5 min SLA)')
                    : (language === 'te' ? 'స్థాయి 3: సాధారణ ఓపీడీ సంప్రదింపు' : 'Level 3: Standard OPD Consultation')}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/70">
                {evaluatedUrgency}
              </span>
            </div>
            <p className="text-xs mt-1.5 opacity-90 leading-relaxed">
              {evaluatedUrgency === 'CRITICAL'
                ? (language === 'te'
                    ? 'మీ టోకెన్ నేరుగా అత్యవసర విభాగం మరియు సీనియర్ డాక్టర్‌కి పంపబడుతుంది.'
                    : 'Critical signs detected. Patient automatically jumps ahead of routine queue with instant doctor alert.')
                : evaluatedUrgency === 'URGENT'
                ? (language === 'te'
                    ? 'తీవ్రత మధ్యస్థంగా ఉంది. ప్రాధాన్యత స్లాట్ కేటాయించబడుతుంది.'
                    : 'Urgent assessment recommended. Prioritized over routine walk-ins.')
                : (language === 'te'
                    ? 'సాధారణ సంప్రదింపు. సాధారణ క్యూ సమయం కేటాయించబడుతుంది.'
                    : 'Non-life-threatening routine checkup. Standard OPD wait applies.')}
            </p>
          </div>

          {/* Quick Symptoms Checkbox Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {language === 'te' ? 'లక్షణాలు / సమస్యలు ఎంచుకోండి (బహుళ ఎంపిక)' : 'Select Observed Red-Flags & Symptoms'}
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {TRIAGE_SYMPTOMS_LIST.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                      isSelected
                        ? sym.urgency === 'CRITICAL'
                          ? 'border-rose-500 bg-rose-50/80 text-rose-950 font-bold'
                          : 'border-amber-500 bg-amber-50/80 text-amber-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span>{language === 'te' ? sym.labelTe : sym.label}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold shrink-0 ml-2 ${
                        sym.urgency === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : sym.urgency === 'URGENT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {sym.urgency}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'te' ? 'ఇతర వివరాలు / లక్షణాలు' : 'Other Symptoms or Patient State'}
            </label>
            <input
              type="text"
              value={customComplaint}
              onChange={(e) => setCustomComplaint(e.target.value)}
              placeholder="e.g. Diaphoresis, radiating pain to left arm"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'te' ? 'రోగి పేరు' : 'Patient Name'}
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'te' ? 'వయస్సు' : 'Age'}
              </label>
              <input
                type="number"
                required
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Clinical Disclaimer */}
          <p className="text-[11px] text-slate-500 leading-normal bg-slate-50 p-3 rounded-xl border border-slate-200">
            <strong>Clinical Safety Notice:</strong> AI Triage provides immediate queue prioritization assistance. If the patient is unresponsive, in cardiac arrest, or suffering catastrophic trauma, call 108 or hospital code blue immediately.
          </p>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-extrabold text-sm shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
                evaluatedUrgency === 'CRITICAL'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
              }`}
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>
                {submitting
                  ? (language === 'te' ? 'ప్రాధాన్యత టోకెన్ జారీ అవుతోంది...' : 'Issuing Priority Pass...')
                  : evaluatedUrgency === 'CRITICAL'
                  ? (language === 'te' ? 'అత్యవసర ప్రాధాన్యత టోకెన్ తీసుకోండి (EMG)' : 'Issue Emergency Priority Token (EMG)')
                  : (language === 'te' ? 'ట్రయాజ్ టోకెన్ పొందండి' : 'Issue Assessed Queue Token')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
