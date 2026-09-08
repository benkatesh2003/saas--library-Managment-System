import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Sparkles, Terminal, AlertCircle, RefreshCw, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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


  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-100 flex flex-col justify-between p-4 sm:p-6 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-sm w-full mx-auto relative z-10">
        <Link to="/" className="text-neutral-400 hover:text-white transition-colors text-xs">
          ← Public Website
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">
            Live 5000
          </span>
          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
            Root
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-sm w-full mx-auto bg-neutral-900/80 border border-neutral-800 rounded-lg p-6 sm:p-7 shadow-xl space-y-5 relative z-10">
        <div className="text-center space-y-1">
          <div className="w-8 h-8 rounded-md bg-white text-neutral-950 flex items-center justify-center mx-auto shadow-2xs mb-2 font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">Super Admin Console</h1>
          <p className="text-xs text-neutral-400">
            Root access for platform multi-tenancy and plans.
          </p>
        </div>

        {/* Tab switch between Sign In and Register */}
        <div className="flex bg-neutral-950 p-1 rounded-md border border-neutral-800">
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5 ${
              !isRegisterMode ? 'bg-neutral-800 text-white shadow-2xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5 ${
              isRegisterMode ? 'bg-neutral-800 text-white shadow-2xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs rounded-md flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegisterMode && (
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Full Name</label>
              <input
                required
                type="text"
                placeholder="System Administrator"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:border-neutral-400 text-white placeholder:text-neutral-600"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">Super Admin Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                required
                type="email"
                placeholder="superadmin@librarysathi.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:border-neutral-400 text-white font-mono placeholder:text-neutral-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">Security Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:border-neutral-400 text-white placeholder:text-neutral-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-3 rounded-md bg-white hover:bg-neutral-200 disabled:opacity-50 text-neutral-950 font-medium text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{isRegisterMode ? 'Create Super Admin' : 'Access Console'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[10px] text-neutral-500 flex items-center justify-center gap-1.5 pt-2 border-t border-neutral-800">
          <Terminal className="w-3 h-3 text-neutral-400" />
          <span>Restricted administrative route</span>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-neutral-600 relative z-10 font-mono">
        © {new Date().getFullYear()} LibrarySathi • Platform Root
      </div>
    </div>
  );
}
