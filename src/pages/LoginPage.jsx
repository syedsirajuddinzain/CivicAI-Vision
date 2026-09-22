import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Mail,
  Lock,
  HardHat,
  Building2,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Key,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('citizen'); // 'citizen' | 'authority' | 'worker'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('citizen@civicai.gov');
  const [password, setPassword] = useState('Citizen123!');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('dept_roads');
  const [departmentName, setDepartmentName] = useState('Roads & Infrastructure Department');
  const [skills, setSkills] = useState('Pothole Repair, Asphalt Laying');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const departments = [
    { id: 'dept_roads', name: 'Roads & Infrastructure Department' },
    { id: 'dept_electrical', name: 'Electrical Department' },
    { id: 'dept_water', name: 'Water & Drainage Department' },
    { id: 'dept_sanitation', name: 'Sanitation Department' },
    { id: 'dept_general', name: 'General Municipal Department' },
  ];

  const handleRoleSelect = (targetRole) => {
    setRole(targetRole);
    setError(null);
    setSuccessMsg(null);

    if (targetRole === 'citizen') {
      setEmail('citizen@civicai.gov');
      setPassword('Citizen123!');
    } else if (targetRole === 'authority') {
      setEmail('road.authority@civicai.gov');
      setPassword('Authority123!');
      setDepartmentId('dept_roads');
      setDepartmentName('Roads & Infrastructure Department');
    } else if (targetRole === 'worker') {
      setEmail('worker@civicai.gov');
      setPassword('Worker123!');
      setDepartmentId('dept_roads');
      setDepartmentName('Roads & Infrastructure Department');
    }
  };

  const handleDepartmentChange = (e) => {
    const selectedId = e.target.value;
    const matched = departments.find((d) => d.id === selectedId);
    setDepartmentId(selectedId);
    setDepartmentName(matched ? matched.name : selectedId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isRegister) {
        const result = await register({
          name,
          email,
          password,
          phone,
          role,
          departmentId,
          department: departmentName,
          skills,
        });

        if (result?.pendingApproval) {
          setSuccessMsg(
            result.message ||
              'Worker registration request submitted for authority review! You will be able to log in once approved.'
          );
          setIsRegister(false);
        } else {
          setSuccessMsg(`Account created successfully as ${result.name || name}!`);
          setTimeout(() => {
            redirectUser(result.role || role);
          }, 600);
        }
      } else {
        const user = await login(email, password);
        setSuccessMsg(`Welcome back, ${user.name}!`);
        setTimeout(() => {
          redirectUser(user.role);
        }, 500);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (userRole) => {
    if (userRole === 'authority') {
      navigate('/authority');
    } else if (userRole === 'worker') {
      navigate('/worker');
    } else {
      navigate('/my-reports');
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-600/10 text-blue-600 rounded-2xl mb-1">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isRegister ? 'Join CivicAI Portal' : 'Sign in to CivicAI'}
          </h1>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Select your account type to register with your municipality'
              : 'Direct database authentication with role-based dashboard routing'}
          </p>
        </div>

        {/* 3 Separate Role Picker Tabs */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            Select User Persona / Role
          </span>
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => handleRoleSelect('citizen')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                role === 'citizen'
                  ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('authority')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                role === 'authority'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Authority</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('worker')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                role === 'worker'
                  ? 'bg-white text-amber-700 shadow-xs ring-1 ring-amber-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardHat className="w-4 h-4 text-amber-600" />
              <span>Worker</span>
            </button>
          </div>
        </div>

        {/* Feedback notices */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="leading-relaxed">{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Register Fields */}
          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zain Malik"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Department Picker for Authority & Worker */}
              {(role === 'authority' || role === 'worker') && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Municipal Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={handleDepartmentChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Worker Skills */}
              {role === 'worker' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Skills / Specialties</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. Pothole Repair, Asphalt Laying"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Worker accounts must be reviewed and approved by the department authority before task assignment and dashboard access.
                    </span>
                  </div>
                </>
              )}
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@civicai.gov"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-3 rounded-2xl shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with MongoDB...</span>
              </>
            ) : (
              <>
                <span>{isRegister ? (role === 'worker' ? 'Submit Worker Request' : 'Register Account') : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : role === 'worker'
              ? 'Want to join as a Field Worker? Submit Worker Registration'
              : "Don't have an account? Create one now"}
          </button>
        </div>
      </div>
    </div>
  );
}
