import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Users, 
  Clock, 
  Volume2, 
  ArrowRight, 
  Search, 
  Activity, 
  HeartPulse, 
  Stethoscope, 
  Baby, 
  Brain, 
  Sparkles,
  Zap
} from 'lucide-react';

interface LiveQueueTrackerProps {
  onSelectDepartmentForToken: (deptId: string) => void;
}

export const LiveQueueTracker: React.FC<LiveQueueTrackerProps> = ({ onSelectDepartmentForToken }) => {
  const { departments, doctors, tokens, language, announceCurrentToken, callNextPatient } = useQueue();
  const [searchTerm, setSearchTerm] = useState('');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return HeartPulse;
      case 'Baby': return Baby;
      case 'Activity': return Activity;
      case 'Brain': return Brain;
      case 'Sparkles': return Sparkles;
      default: return Stethoscope;
    }
  };

  const filtered = departments.filter((d) => {
    const query = searchTerm.toLowerCase();
    return d.name.toLowerCase().includes(query) || d.nameTe.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-4">
      {/* Search & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {language === 'te' ? 'ప్రత్యక్ష ఓపీడీ క్యూ బోర్డ్ (లైవ్ డిస్ప్లే)' : 'Live Department OPD Boards'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'te'
              ? 'ప్రతి విభాగం యొక్క ప్రస్తుత టోకెన్ మరియు నిరీక్షణ సమయం ప్రత్యక్షంగా చూడండి'
              : 'Real-time room call counters with instant audio announcement'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'te' ? 'విభాగం వెతకండి...' : 'Search departments...'}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept) => {
          const Icon = getIcon(dept.icon);
          const headDoctor = doctors.find((d) => d.id === dept.headDoctorId);

          // Find active token in this department
          const activeToken = tokens.find(
            (t) => t.departmentId === dept.id && (t.status === 'in_consultation' || t.status === 'called')
          );

          const statusColor =
            dept.status === 'busy'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : dept.status === 'full'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200';

          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {language === 'te' ? dept.nameTe : dept.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{dept.roomNumbers}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                    {dept.status === 'busy' ? 'Busy' : dept.status === 'full' ? 'Crowded' : 'Active'}
                  </span>
                </div>

                {/* Big Live Token Display */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {language === 'te' ? 'ప్రస్తుతం పిలుస్తున్న టోకెన్' : 'Now Serving'}
                    </span>
                    {activeToken && (
                      <button
                        onClick={() => announceCurrentToken(activeToken.id)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Play audio announcement"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-black text-indigo-700 font-mono tabular-nums tracking-tight">
                      {dept.currentServingToken}
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {headDoctor ? (language === 'te' ? headDoctor.nameTe : headDoctor.name) : 'On Duty'}
                    </span>
                  </div>
                </div>

                {/* Queue Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/70 text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>
                      <strong className="text-slate-900 tabular-nums">{dept.totalWaiting}</strong>{' '}
                      {language === 'te' ? 'వేచి ఉన్నారు' : 'in line'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/70 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>
                      ~<strong className="text-slate-900 tabular-nums">{dept.estimatedWaitMinutes}</strong>{' '}
                      {language === 'te' ? 'నిమి' : 'mins wait'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onSelectDepartmentForToken(dept.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer group"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:text-white transition-colors" />
                <span>{language === 'te' ? 'ఇక్కడికి టోకెన్ తీసుకోండి' : 'Get Token for This OPD'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
