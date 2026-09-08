import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Lock, Mail, ArrowRight, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google.');
      }
      const res = await loginAdminWithGoogle(credentialResponse.credential);
      if (res && res.success) {
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(res?.message || 'Google authentication failed.');
      }
    } catch (err) {
      setError(`Google login error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was cancelled or failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between max-w-sm w-full mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-neutral-950 flex items-center justify-center text-white font-bold shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-neutral-900 tracking-tight">LibrarySathi</span>
        </Link>
        <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">Admin Portal</span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-sm w-full mx-auto bg-white rounded-lg p-6 sm:p-7 border border-neutral-200 shadow-xs space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Admin Sign In</h1>
          <p className="text-xs text-neutral-500">
            Access your library dashboard, desk matrix, and billing.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Authentication Error:</span>
              <span className="break-words">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                required
                type="email"
                disabled={loading}
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60 transition-colors placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-700">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                required
                type="password"
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60 transition-colors placeholder:text-neutral-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-3 rounded-md bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white font-medium text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign in with Email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-neutral-200"></div>
          <span className="flex-shrink mx-2 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">or</span>
          <div className="flex-grow border-t border-neutral-200"></div>
        </div>

        {/* Google OAuth Login */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="medium"
            shape="rectangular"
            text="continue_with"
            width="336"
          />
        </div>

        <div className="text-center text-xs text-neutral-500 pt-3 border-t border-neutral-150 space-y-1.5">
          <div>
            <span>Don't have an account? </span>
            <Link to="/admin/register" className="font-medium text-neutral-900 hover:underline">
              Register library
            </Link>
          </div>
          <div>
            <span className="text-neutral-400">Student access? </span>
            <Link to="/student/login" className="font-medium text-neutral-700 hover:underline">
              Student portal
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-neutral-400 font-mono">
        © {new Date().getFullYear()} LibrarySathi • Live Backend 5000
      </div>
    </div>
  );
}
