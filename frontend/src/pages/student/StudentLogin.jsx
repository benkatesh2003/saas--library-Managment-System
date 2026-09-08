import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, User, Lock, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UnverifiedBadge, UnverifiedBanner } from '../../components/common/UnverifiedBadge';

export function StudentLogin() {
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-sm w-full mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-neutral-950 flex items-center justify-center text-white font-bold shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-neutral-900 tracking-tight">LibrarySathi</span>
        </Link>
        <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">Student Portal</span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-sm w-full mx-auto bg-white rounded-lg p-6 sm:p-7 border border-neutral-200 shadow-xs space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Student Access</h1>
          <p className="text-xs text-neutral-500">
            Check your allocated desk, shift timings, and fee receipts.
          </p>
        </div>

        {/* Live Helper */}
        <div className="bg-neutral-50 p-2.5 rounded-md border border-neutral-200 text-xs">
          <span className="font-semibold text-neutral-900 block mb-0.5">Admission Credentials</span>
          <span className="text-neutral-500 text-[11px]">
            Use your Student ID (e.g. STU-00001) and password provided upon admission.
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Student ID</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                required
                type="text"
                placeholder="STU-00001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-3 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Student Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-150 text-xs text-neutral-500">
          <span>Are you a library owner? </span>
          <Link to="/admin/login" className="font-medium text-neutral-900 hover:underline">
            Admin Login
          </Link>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-neutral-400 font-mono">
        © {new Date().getFullYear()} LibrarySathi • Live Backend 5000
      </div>
    </div>
  );
}
