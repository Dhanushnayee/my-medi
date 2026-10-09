import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Star, 
  CheckCircle2, 
  MapPin, 
  IndianRupee 
} from 'lucide-react';

interface BookDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDoctorId?: string;
  onSuccess: (appointmentId: string) => void;
}

export const BookDoctorModal: React.FC<BookDoctorModalProps> = ({
  isOpen,
  onClose,
  defaultDoctorId,
  onSuccess,
}) => {
  const { doctors, departments, bookAppointment, language } = useQueue();

  const [selectedDoctorId, setSelectedDoctorId] = useState(defaultDoctorId || doctors[0]?.id || 'doc-1');
  const [patientName, setPatientName] = useState('Dhanush Mangali');
  const [patientPhone, setPatientPhone] = useState('+91 91234 56789');
  
  // Date options (Today, Tomorrow, Day after)
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM');
  const [reason, setReason] = useState('General consultation and health review');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const timeSlots = [
    '09:30 AM', '10:15 AM', '11:00 AM', '11:45 AM',
    '02:30 PM', '03:15 PM', '04:00 PM', '05:00 PM'
  ];

  const doctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const dept = departments.find((d) => d.id === doctor.departmentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const apt = await bookAppointment({
        patientName,
        patientPhone,
        doctorId: doctor.id,
        departmentId: doctor.departmentId,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason,
      });
      setSubmitting(false);
      onClose();
      onSuccess(apt.id);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'te' ? 'స్పెషలిస్ట్ డాక్టర్ అపాయింట్‌మెంట్' : 'Book Specialist Doctor'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'te' ? 'కన్సల్టేషన్ స్లాట్‌ను ముందస్తుగా రిజర్వ్ చేసుకోండి' : 'Verified consultants & confirmed OPD slots'}
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
          {/* Doctor Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {language === 'te' ? 'డాక్టర్‌ను ఎంచుకోండి' : 'Select Doctor'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {doctors.map((doc) => {
                const isSelected = doc.id === selectedDoctorId;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      <img
                        src={doc.photo}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {language === 'te' ? doc.nameTe : doc.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {language === 'te' ? doc.specialtyTe : doc.specialty}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 font-medium">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
                          {doc.rating}
                        </span>
                        <span>·</span>
                        <span>₹{doc.consultationFee}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {language === 'te' ? 'తేదీ ఎంచుకోండి' : 'Consultation Date'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: language === 'te' ? 'ఈ రోజు' : 'Today', val: today },
                { label: language === 'te' ? 'రేపు' : 'Tomorrow', val: tomorrow },
                { label: language === 'te' ? 'ఎల్లుండి' : 'Day After', val: dayAfter },
              ].map((d) => (
                <button
                  key={d.val}
                  type="button"
                  onClick={() => setSelectedDate(d.val)}
                  className={`p-2.5 rounded-xl border text-center transition-all text-xs font-semibold cursor-pointer ${
                    selectedDate === d.val
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div>{d.label}</div>
                  <div className={`text-[10px] mt-0.5 ${selectedDate === d.val ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {d.val}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {language === 'te' ? 'సమయం స్లాట్' : 'Available Time Slot'}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 rounded-lg border text-center transition-all text-xs font-semibold cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
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
                {language === 'te' ? 'మొబైల్ నంబర్' : 'Mobile Number'}
              </label>
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'te' ? 'సమస్య / కన్సల్టేషన్ కారణం' : 'Reason for Visit'}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Pricing & Doctor Info Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{doctor.roomNumber} ({dept?.name})</span>
            </div>
            <div className="text-slate-900 font-bold flex items-center">
              <span>{language === 'te' ? 'రుసుము' : 'OPD Fee'}:</span>
              <span className="ml-1 text-indigo-700">₹{doctor.consultationFee}</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {submitting
                  ? (language === 'te' ? 'బుకింగ్ జరుగుతోంది...' : 'Confirming Slot...')
                  : (language === 'te' ? 'అపాయింట్‌మెంట్ కన్ఫర్మ్ చేయండి' : 'Confirm Appointment')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
