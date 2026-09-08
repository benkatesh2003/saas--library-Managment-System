import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Lock, Mail, ArrowRight, Shield, Building2, User, Phone, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminRegister() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    libraryName: '',
    phone: '',
    city: '',
    state: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminUser, registerAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to admin dashboard
  useEffect(() => {
    if (adminUser) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [adminUser, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        libraryName: formData.libraryName.trim(),
        phone: formData.phone.trim(),
        address: {
          city: formData.city.trim(),
          state: formData.state.trim()
        }
      };

      const res = await registerAdmin(payload);
      if (res && res.success) {
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(res?.message || 'Registration failed. Please review your details.');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      firstName: 'Library',
      lastName: 'Manager',
      email: `manager${rand}@studyhub.in`,
      password: 'Admin@' + rand,
      libraryName: `Study Hub Library #${rand}`,
      phone: '987654' + rand,
      city: 'Delhi',
      state: 'Delhi'
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-neutral-950 flex items-center justify-center text-white font-bold shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-neutral-900 tracking-tight">LibrarySathi</span>
        </Link>
        <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">Tenant Setup</span>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-lg p-6 sm:p-7 border border-neutral-200 shadow-xs space-y-4 my-4">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Create Admin Account</h1>
          <p className="text-xs text-neutral-500">
            Set up your library management workspace in seconds.
          </p>
        </div>

        {/* Mode Indicator & Quick Fill */}
        <div className="bg-neutral-50 p-2.5 rounded-md border border-neutral-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Live Server (5000)</span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            disabled={loading}
            className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 disabled:opacity-50 text-neutral-700 font-medium text-[11px] shadow-2xs transition-colors shrink-0"
          >
            Quick Fill Demo
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Registration Error</span>
              <span className="break-words">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">First name *</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  required
                  type="text"
                  name="firstName"
                  disabled={loading}
                  placeholder="Ramesh"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60 transition-colors placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Last name</label>
              <input
                type="text"
                name="lastName"
                disabled={loading}
                placeholder="Sharma"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60 transition-colors placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Library / Space name *</label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                required
                type="text"
                name="libraryName"
                disabled={loading}
                placeholder="Apex Reading Space"
                value={formData.libraryName}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60 transition-colors placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Email address *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  required
                  type="email"
                  name="email"
                  disabled={loading}
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60 transition-colors placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Phone</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="phone"
                  disabled={loading}
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60 transition-colors placeholder:text-neutral-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Password (Min. 6 chars) *</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                required
                type="password"
                name="password"
                minLength={6}
                disabled={loading}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60 transition-colors placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">City</label>
              <input
                type="text"
                name="city"
                disabled={loading}
                placeholder="New Delhi"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60 transition-colors placeholder:text-neutral-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">State</label>
              <input
                type="text"
                name="state"
                disabled={loading}
                placeholder="Delhi"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60 transition-colors placeholder:text-neutral-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-3 rounded-md bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white font-medium text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 mt-1"
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Register & Access Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-150">
          <span>Already have an account? </span>
          <Link to="/admin/login" className="font-medium text-neutral-900 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-neutral-400 font-mono">
        © {new Date().getFullYear()} LibrarySathi • Self-Service Platform
      </div>
    </div>
  );
}
