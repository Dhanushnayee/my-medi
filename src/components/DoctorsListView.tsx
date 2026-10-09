import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Search, 
  Star, 
  MapPin, 
  Calendar, 
  Zap, 
  Clock, 
  IndianRupee,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface DoctorsListViewProps {
  onBookDoctor: (doctorId: string) => void;
  onInstantTokenForDoctor: (deptId: string, doctorId: string) => void;
}

export const DoctorsListView: React.FC<DoctorsListViewProps> = ({
  onBookDoctor,
  onInstantTokenForDoctor,
}) => {
  const { doctors, departments, language } = useQueue();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  const filteredDoctors = doctors.filter((doc) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(query) ||
      doc.nameTe.toLowerCase().includes(query) ||
      doc.specialty.toLowerCase().includes(query) ||
      doc.specialtyTe.toLowerCase().includes(query);

    const matchesDept = selectedDeptId === 'all' || doc.departmentId === selectedDeptId;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {language === 'te' ? 'వైద్య నిపుణులు & సంప్రదింపు స్లాట్లు' : 'Specialist Doctors & OPD Clinics'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'te' ? 'పరిశీలించిన సీనియర్ వైద్యులు మరియు నేటి ఓపీడీ లభ్యత' : 'Verified chief medical specialists available for live consultation today'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'te' ? 'డాక్టర్ లేదా స్పెషాలిటీ వెతకండి...' : 'Search doctor or specialty...'}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <button
            onClick={() => setSelectedDeptId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedDeptId === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'te' ? 'అన్ని విభాగాలు' : 'All Departments'}
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeptId(d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedDeptId === d.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {language === 'te' ? d.nameTe : d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doc) => {
          const dept = departments.find((d) => d.id === doc.departmentId);
          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {language === 'te' ? doc.nameTe : doc.name}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    </div>

                    <p className="text-xs font-medium text-indigo-700 truncate mt-0.5">
                      {language === 'te' ? doc.specialtyTe : doc.specialty}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {doc.rating}
                      </span>
                      <span>·</span>
                      <span>{doc.experienceYears} yrs exp</span>
                    </div>
                  </div>
                </div>

                {/* Details Banner */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs mb-4">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.roomNumber}</span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      ₹{doc.consultationFee} OPD Fee
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Avg {doc.averageMinsPerPatient} mins / patient</span>
                    </span>
                    <span className="text-emerald-700 font-semibold">Available Today</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => onBookDoctor(doc.id)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'స్లాట్ బుక్' : 'Book Slot'}</span>
                </button>

                <button
                  onClick={() => onInstantTokenForDoctor(doc.departmentId, doc.id)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'te' ? 'టోకెన్ తీసుకోండి' : 'Get Token'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
