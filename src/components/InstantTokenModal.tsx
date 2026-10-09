import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  X, 
  Zap, 
  User, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Building2,
  Stethoscope,
  HeartPulse,
  Baby,
  Activity,
  Brain,
  Sparkles
} from 'lucide-react';

interface InstantTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDepartmentId?: string;
  onSuccess: (tokenId: string) => void;
}

export const InstantTokenModal: React.FC<InstantTokenModalProps> = ({
  isOpen,
  onClose,
  defaultDepartmentId,
  onSuccess,
}) => {
  const { departments, doctors, issueInstantToken, language } = useQueue();

  const [departmentId, setDepartmentId] = useState(defaultDepartmentId || departments[0]?.id || 'gen-med');
  const [patientName, setPatientName] = useState('Dhanush Mangali');
  const [patientPhone, setPatientPhone] = useState('+91 91234 56789');
  const [patientAge, setPatientAge] = useState<number>(26);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setSubmitting(true);
    try {
      const token = await issueInstantToken({
        patientName,
        patientPhone,
        patientAge: Number(patientAge) || 28,
        patientGender,
        departmentId,
        triageSymptoms: symptoms ? [symptoms] : undefined,
      });
      setSubmitting(false);
      onClose();
      onSuccess(token.id);
    } catch {
      setSubmitting(false);
    }
  };

  const selectedDept = departments.find((d) => d.id === departmentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'te' ? 'ఇన్‌స్టంట్ ఓపీడీ టోకెన్' : 'Instant OPD Token'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'te' ? '5 సెకన్లలో డిజిటల్ క్యూ నంబర్ పొందండి' : 'Skip the physical line in 5 seconds'}
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Department Selection Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {language === 'te' ? 'విభాగం ఎంచుకోండి' : 'Select Department'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {departments.map((dept) => {
                const isSelected = dept.id === departmentId;
                return (
                  <button
                    type="button"
                    key={dept.id}
                    onClick={() => setDepartmentId(dept.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all text-xs font-semibold cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="truncate">{language === 'te' ? dept.nameTe : dept.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                      ~{dept.estimatedWaitMinutes}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'te' ? 'రోగి పూర్తి పేరు' : 'Patient Full Name'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Ramesh Naidu"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'te' ? 'ఫోన్ నంబర్' : 'Mobile Number'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91 98480..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'te' ? 'వయస్సు' : 'Age'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'te' ? 'లింగం' : 'Gender'}
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as 'male' | 'female' | 'other')}
                  className="w-full px-2 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="male">{language === 'te' ? 'పురుషుడు' : 'Male'}</option>
                  <option value="female">{language === 'te' ? 'స్త్రీ' : 'Female'}</option>
                  <option value="other">{language === 'te' ? 'ఇతర' : 'Other'}</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'te' ? 'ప్రధాన సమస్య / లక్షణాలు (ఐచ్ఛికం)' : 'Chief Complaint / Symptoms (Optional)'}
            </label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={language === 'te' ? 'ఉదా: జ్వరం, తలనొప్పి, కడుపునొప్పి' : 'e.g. Mild fever, dry cough, dizziness'}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Summary Banner */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">{language === 'te' ? 'అంచనా నిరీక్షణ:' : 'Expected Wait Time:'}</span>
              <span className="font-bold text-slate-900 ml-1.5 font-mono">
                ~{selectedDept?.estimatedWaitMinutes || 15} mins
              </span>
            </div>
            <div className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {language === 'te' ? 'ఉచిత ఓపీడీ చెక్-ఇన్' : 'Zero Booking Fee'}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>
                {submitting
                  ? (language === 'te' ? 'టోకెన్ సిద్ధం చేస్తోంది...' : 'Generating Token...')
                  : (language === 'te' ? 'ఇప్పుడే టోకెన్ జారీ చేయండి' : 'Issue Live Token Now')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
