import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Sparkles, Terminal, AlertCircle, RefreshCw, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isMockEnabled } from '../../services/apiClient';

export function SuperAdminLogin() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { superAdminUser, loginSuperAdmin, registerSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to target or super admin dashboard
  useEffect(() => {
    if (superAdminUser) {
      const from = location.state?.from?.pathname || '/super-admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [superAdminUser, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        const res = await registerSuperAdmin({ name: name.trim(), email: email.trim(), password });
        if (res.success) {
          const from = location.state?.from?.pathname || '/super-admin/dashboard';
          navigate(from, { replace: true });
        } else {
          setError(res.message || 'Failed to register Super Admin.');
        }
      } else {
        const res = await loginSuperAdmin({ email: email.trim(), password });
        if (res.success) {
          const from = location.state?.from?.pathname || '/super-admin/dashboard';
          navigate(from, { replace: true });
        } else {
          setError(res.message || 'Invalid Super Admin credentials.');
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIsRegisterMode(false);
    setEmail('superadmin@librarysathi.in');
    setPassword('superadmin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto relative z-10">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs">
          <span>← Back to Website</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${
            isMockEnabled()
              ? 'text-amber-400 bg-amber-950/60 border-amber-800'
              : 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
          }`}>
            {isMockEnabled() ? 'Mock Mode' : '● Live API'}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            Platform Root
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Super Admin Console</h1>
          <p className="text-xs text-slate-400">
            Root access for platform SaaS multi-tenancy, plan management, and subscriptions.
          </p>
        </div>

        {/* Tab switch between Sign In and Register */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              !isRegisterMode ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              isRegisterMode ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Admin</span>
          </button>
        </div>

        {/* Demo Fast Fill */}
        {!isRegisterMode && (
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 text-xs flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-brand-300 block">Super Admin Credentials</span>
              <span className="text-slate-400 text-[11px] font-mono">superadmin@librarysathi.in • superadmin123</span>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="System Administrator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Super Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                required
                type="email"
                placeholder="superadmin@librarysathi.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Security Key / Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating with Backend...</span>
              </>
            ) : (
              <>
                <span>{isRegisterMode ? 'Register Super Admin' : 'Enter Super Admin Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-2 border-t border-slate-800">
          <Terminal className="w-3.5 h-3.5 text-brand-400" />
          <span>Non-prominent administrative route</span>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-600 relative z-10">
        © {new Date().getFullYear()} Library Sathi Platform Operations.
      </div>
    </div>
  );
}
