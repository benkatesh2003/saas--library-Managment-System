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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between max-w-lg w-full mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">
            Library<span className="text-brand-600">Sathi</span>
          </span>
        </Link>
        <span className="text-xs text-slate-500 font-medium">Tenant Registration</span>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-lg w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5 my-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Admin Account</h1>
          <p className="text-xs text-slate-500">
            Set up your library management workspace in under a minute.
          </p>
        </div>

        {/* Mode Indicator & Quick Fill */}
        <div className="bg-brand-50/70 p-3 rounded-2xl border border-brand-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-brand-900">
              Live API (Port 5000)
            </span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            disabled={loading}
            className="px-3 py-1 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-2xs transition-colors shrink-0"
          >
            Quick Fill Demo
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Registration Error</span>
              <span className="break-words">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">First Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="text"
                  name="firstName"
                  disabled={loading}
                  placeholder="e.g. Ramesh"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                disabled={loading}
                placeholder="e.g. Sharma"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Library / Space Name *</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                required
                type="text"
                name="libraryName"
                disabled={loading}
                placeholder="e.g. Apex Reading Library"
                value={formData.libraryName}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="email"
                  name="email"
                  disabled={loading}
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="phone"
                  disabled={loading}
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password (Min. 6 chars) *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                required
                type="password"
                name="password"
                minLength={6}
                disabled={loading}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                name="city"
                disabled={loading}
                placeholder="e.g. New Delhi"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
              <input
                type="text"
                name="state"
                disabled={loading}
                placeholder="e.g. Delhi"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Creating Admin Account...</span>
            ) : (
              <>
                <span>Register & Access Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Already have an admin account? </span>
          <Link to="/admin/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign In here
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Library Sathi. Tenant Self-Service Platform.
      </div>
    </div>
  );
}
