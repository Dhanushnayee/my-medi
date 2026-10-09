import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Activity, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Stethoscope, 
  Building2, 
  BarChart3,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { login, register, language, setLanguage } = useQueue();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [role, setRole] = useState<'patient' | 'doctor' | 'receptionist' | 'admin'>('patient');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick 1-click Demo credentials filler
  const handleQuickDemo = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          role,
          phone,
          age: Number(age) || 25,
          gender,
        });
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || (mode === 'login' ? 'Invalid email or password' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          MediQueue<span className="text-indigo-400">AI</span>
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {language === 'te' 
            ? 'రోగులు, వైద్యులు & సిబ్బంది కోసం ప్రత్యేక పోర్టల్'
            : 'Dedicated Secure Portals for Patients, Doctors & Staff'}
        </p>

        {/* Language switch */}
        <div className="mt-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
            className="text-xs text-indigo-300 hover:text-white transition-colors underline font-medium cursor-pointer"
          >
            {language === 'en' ? 'తెలుగులోకి మార్చండి (Telugu)' : 'Switch to English'}
          </button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          {/* 1-Click Role Testing Quick Bar */}
          <div className="mb-6 pb-6 border-b border-slate-100">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              {language === 'te' ? 'త్వరిత డెమో లాగిన్ (1-క్లిక్)' : 'Quick 1-Click Demo Logins:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('patient@mediqueue.com', 'patient123')}
                disabled={loading}
                className="flex flex-col items-center p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-center cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mb-1 group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Patient</span>
                <span className="text-[10px] text-slate-400">Dhanush</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('doctor@mediqueue.com', 'doctor123')}
                disabled={loading}
                className="flex flex-col items-center p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-center cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs mb-1 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Doctor</span>
                <span className="text-[10px] text-slate-400">Dr. Sarah</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('reception@mediqueue.com', 'reception123')}
                disabled={loading}
                className="flex flex-col items-center p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-center cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs mb-1 group-hover:scale-105 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Reception</span>
                <span className="text-[10px] text-slate-400">Priya Desk</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@mediqueue.com', 'admin123')}
                disabled={loading}
                className="flex flex-col items-center p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-center cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs mb-1 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Admin</span>
                <span className="text-[10px] text-slate-400">Hospital KPI</span>
              </button>
            </div>
          </div>

          {/* Mode Tabs (Login / Register) */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'te' ? 'లాగిన్' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'te' ? 'కొత్త ఖాతా నమోదు (Register)' : 'New Registration'}
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'te' ? 'పూర్తి పేరు' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Naidu"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'te' ? 'మొబైల్ నంబర్' : 'Mobile Number'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98480..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Sex</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
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
                    {language === 'te' ? 'పాత్ర (Account Role)' : 'Account Role'}
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="patient">👤 Patient (రోగి)</option>
                    <option value="doctor">🩺 Doctor (వైద్యులు)</option>
                    <option value="receptionist">🏢 Receptionist (రిసెప్షన్ సిబ్బంది)</option>
                    <option value="admin">📊 Administrator (హాస్పిటల్ నిర్వాహకులు)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'te' ? 'ఈమెయిల్ అడ్రస్' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'te' ? 'పాస్‌వర్డ్' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>
                {loading
                  ? (language === 'te' ? 'ధృవీకరిస్తోంది...' : 'Processing...')
                  : mode === 'login'
                  ? (language === 'te' ? 'సురక్షితంగా లాగిన్ అవ్వండి' : 'Sign In to Portal')
                  : (language === 'te' ? 'ఖాతా సృష్టించండి' : 'Create Account & Enter')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
