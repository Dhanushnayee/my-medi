import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Building2, 
  UserPlus, 
  Search, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Zap, 
  ArrowRight,
  Clock
} from 'lucide-react';

interface ReceptionDeskViewProps {
  onOpenPass: (tokenId: string) => void;
}

export const ReceptionDeskView: React.FC<ReceptionDeskViewProps> = ({ onOpenPass }) => {
  const { 
    departments, 
    tokens, 
    appointments, 
    issueInstantToken, 
    checkInAppointment, 
    setTokenPriority,
    language 
  } = useQueue();

  const [searchQuery, setSearchQuery] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('+91 ');
  const [patientAge, setPatientAge] = useState<number>(30);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'gen-med');
  const [isEmergency, setIsEmergency] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegisterWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    try {
      const token = await issueInstantToken({
        patientName,
        patientPhone,
        patientAge: Number(patientAge) || 30,
        patientGender,
        departmentId,
        isEmergency,
      });

      setSuccessMessage(`Token ${token.tokenNumber} issued for ${patientName}`);
      setPatientName('');
      setPatientPhone('+91 ');
      setIsEmergency(false);
      setTimeout(() => setSuccessMessage(null), 4000);
      onOpenPass(token.id);
    } catch {
      // error
    }
  };

  const filteredTokens = tokens.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.patientName.toLowerCase().includes(q) ||
      t.tokenNumber.toLowerCase().includes(q) ||
      t.patientPhone.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'te' ? 'రిసెప్షన్ & వాక్-ఇన్ కౌంటర్' : 'Reception & Walk-in Desk'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'te' ? 'వేగవంతమైన రోగుల నమోదు మరియు టోకెన్ జారీ' : 'High-speed physical token issuance & appointment check-in'}
            </p>
          </div>
        </div>

        {/* Global Live Summary */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono">
          <span className="text-slate-500">Total Active In Queue:</span>
          <strong className="text-indigo-700 font-bold">
            {tokens.filter((t) => t.status === 'waiting' || t.status === 'in_consultation').length} Patients
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fast Walk-In Registration Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
            <UserPlus className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              {language === 'te' ? 'త్వరిత వాక్-ఇన్ నమోదు' : 'Fast Walk-in Registration'}
            </h4>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegisterWalkIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'te' ? 'రోగి పేరు' : 'Patient Name'}
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'te' ? 'ఫోన్ నంబర్' : 'Phone'}
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sex</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as 'male' | 'female' | 'other')}
                    className="w-full px-1 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="male">M</option>
                    <option value="female">F</option>
                    <option value="other">O</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'te' ? 'విభాగం' : 'OPD Department'}
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {language === 'te' ? d.nameTe : d.name} (Wait: ~{d.estimatedWaitMinutes}m)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="reception-emg"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <label htmlFor="reception-emg" className="text-xs font-bold text-rose-700 cursor-pointer">
                {language === 'te' ? 'అత్యవసర ప్రాధాన్యత (Emergency Bump)' : 'Mark as Emergency / Priority Walk-in'}
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer mt-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{language === 'te' ? 'టోకెన్ జారీ & ప్రింట్ పాస్' : 'Issue Token & Print Pass'}</span>
            </button>
          </form>

          {/* Pending Appointments for Check-in */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Online Bookings Ready for Check-in</span>
            </h5>
            <div className="space-y-2">
              {appointments
                .filter((a) => a.status === 'confirmed')
                .slice(0, 3)
                .map((apt) => (
                  <div
                    key={apt.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-slate-900">{apt.patientName}</strong>
                      <div className="text-[10px] text-slate-500">
                        {apt.timeSlot} · {apt.date}
                      </div>
                    </div>
                    <button
                      onClick={() => checkInAppointment(apt.id)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Check-In
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Live Search and Queue Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              {language === 'te' ? 'క్యూ జాబితా & ట్రాకింగ్' : 'Live Patient Queue Ledger'}
            </h4>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token, name, phone..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2">Token</th>
                  <th className="pb-2">Patient</th>
                  <th className="pb-2">Department</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTokens.slice(0, 8).map((tok) => {
                  const dept = departments.find((d) => d.id === tok.departmentId);
                  return (
                    <tr key={tok.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-bold font-mono text-indigo-700">
                        {tok.tokenNumber}
                      </td>
                      <td className="py-2.5">
                        <div className="font-bold text-slate-900">{tok.patientName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{tok.patientPhone}</div>
                      </td>
                      <td className="py-2.5 text-slate-600 truncate max-w-[120px]">
                        {dept?.name}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
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
                      </td>
                      <td className="py-2.5 text-right space-x-1">
                        {tok.status === 'waiting' && !tok.isEmergency && (
                          <button
                            onClick={() => setTokenPriority(tok.id)}
                            className="px-2 py-1 text-[10px] rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors"
                            title="Emergency Priority Bump"
                          >
                            ⚡ Bump
                          </button>
                        )}
                        <button
                          onClick={() => onOpenPass(tok.id)}
                          className="px-2 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                        >
                          Pass
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
