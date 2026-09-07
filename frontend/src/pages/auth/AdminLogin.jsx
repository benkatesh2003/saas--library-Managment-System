import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Lock, Mail, ArrowRight, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UnverifiedBadge } from '../../components/common/UnverifiedBadge';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminUser, loginAdmin, loginAdminWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, immediately redirect to admin dashboard
  useEffect(() => {
    if (adminUser) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [adminUser, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAdmin({ email, password });
      if (res.success) {
        const from = location.state?.from?.pathname || '/admin/dashboard';
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


  const handleGoogleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginAdminWithGoogle('mock_google_id_token');
      if (res && res.success) {
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(res?.message || 'Google authentication failed');
      }
    } catch (err) {
      setError(`Google OAuth error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">Library<span className="text-brand-600">Sathi</span></span>
        </Link>
        <span className="text-xs text-slate-500 font-medium">Admin Portal</span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Library Admin Login</h1>
          <p className="text-xs text-slate-500">
            Sign in to manage your reading space, seats, student fees, and shifts.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Authentication Error:</span>
              <span className="break-words">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                required
                type="email"
                disabled={loading}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
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
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Google OAuth Simulation Button */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={handleGoogleDemo}
            disabled={loading}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-60 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>
          <div className="flex justify-center">
            <UnverifiedBadge type="GOOGLE_OAUTH" size="xs" />
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 space-y-1.5">
          <div>
            <span>New library owner? </span>
            <Link to="/admin/register" className="font-bold text-brand-600 hover:text-brand-700">
              Create an Admin Account
            </Link>
          </div>
          <div>
            <span className="text-slate-400">Looking for student login? </span>
            <Link to="/student/login" className="font-bold text-brand-600 hover:text-brand-700">
              Student Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Library Sathi. Connected to live backend on port 5000.
      </div>
    </div>
  );
}
