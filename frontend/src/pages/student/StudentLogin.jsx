import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, User, Lock, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isMockEnabled } from '../../services/apiClient';
import { UnverifiedBadge, UnverifiedBanner } from '../../components/common/UnverifiedBadge';

export function StudentLogin() {
  const isLive = !isMockEnabled();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { studentUser, loginStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to target or student dashboard
  useEffect(() => {
    if (studentUser) {
      const from = location.state?.from?.pathname || '/student/dashboard';
      navigate(from, { replace: true });
    }
  }, [studentUser, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginStudent(studentId, password);
      if (res.success) {
        const from = location.state?.from?.pathname || '/student/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setStudentId('LS-2401');
    setPassword('rahul@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">Library<span className="text-brand-600">Sathi</span></span>
        </Link>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Port 5000
          </span>
        ) : (
          <UnverifiedBadge type="STUDENT_AUTH" size="xs" />
        )}
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Self-Service Portal</h1>
          </div>
          <p className="text-xs text-slate-500">
            Check your allocated seat, shift timings, locker status, and fee receipts.
          </p>
        </div>

        {/* Demo / Live Helper */}
        {!isLive ? (
          <div className="bg-brand-50/70 p-3.5 rounded-2xl border border-brand-200 text-xs flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-brand-900 block">Mock Demo Account</span>
              <span className="text-slate-500 text-[11px]">ID: LS-2401 • Pass: rahul@123</span>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs"
            >
              Auto-Fill
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 text-xs">
            <span className="font-bold text-emerald-900 block">Live Backend Mode</span>
            <span className="text-emerald-700 text-[11px]">
              Use your Student ID (e.g. STU-00001) and temporary password generated during admission.
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Student ID *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                required
                type="text"
                placeholder={isLive ? "e.g. STU-00001" : "e.g. LS-2401"}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Log In to Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-400">
          <span>Are you a library owner? </span>
          <Link to="/admin/login" className="font-bold text-brand-600 hover:text-brand-700">
            Admin Login
          </Link>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Library Sathi. {isLive ? 'Connected to live backend on port 5000' : 'Powered by Standalone Mock Architecture'}.
      </div>
    </div>
  );
}
