import React, { useState, useEffect } from 'react';
import { IdCard, QrCode, Phone, Mail, MapPin, Calendar, Clock, Armchair, KeyRound, Printer, ShieldCheck, User, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';
import { formatDate } from '../../utils/formatters';
import { UnverifiedBadge } from '../../components/common/UnverifiedBadge';

export function StudentProfile() {
  const { studentUser, refreshStudentProfile } = useAuth();

  const [profile, setProfile] = useState(studentUser?.student || null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.studentPortal.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      } else if (!res.success) {
        setError(res.message || 'Failed to fetch student profile');
      }
    } catch (err) {
      setError(`Network error loading profile: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const student = profile || studentUser?.student || null;
  const admin = student?.adminId || {};

  const seatNumber = student?.seat?.seatNumber || student?.seatNumber || 'Unassigned';
  const shiftName = student?.shift?.shiftName || student?.shiftName || 'Unassigned';
  const shiftTiming = student?.shift?.startTime && student?.shift?.endTime
    ? `${student.shift.startTime} – ${student.shift.endTime}`
    : (student?.shiftTime || '06:00 AM – 12:00 PM');
  const lockerNumber = student?.locker?.lockerNumber || student?.lockerNumber || 'None';
  const startDate = student?.subscription?.startDate || student?.startDate || student?.admissionDate;
  const endDate = student?.subscription?.endDate || student?.endDate;
  const duration = student?.subscription?.duration || student?.duration || 1;
  const avatarUrl = typeof student?.avatar === 'object' && student?.avatar?.url
    ? student?.avatar?.url
    : (typeof student?.avatar === 'string' && student?.avatar
      ? student?.avatar
      : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80");

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Digital Pass & Profile</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live API (Port 5000)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Your official digital access badge for entry, turnstile verification, and desk reservation.
          </p>
        </div>

        <button
          onClick={() => fetchProfile(true)}
          disabled={loading || refreshing}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-brand-300 px-3 py-1.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          title="Refresh digital pass data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-600' : 'text-slate-500'}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync Pass'}</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchProfile(true)}
            className="text-xs font-bold text-rose-700 underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Printable Digital ID Badge (Left Col - 1 span) */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950 text-white p-6 rounded-3xl border border-brand-500/40 shadow-xl space-y-5 text-center relative overflow-hidden">
            {/* Glow backdrop */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-extrabold text-brand-400 tracking-widest uppercase font-mono">
                Library Pass
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                student?.isActive !== false
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border-rose-800'
              }`}>
                {student?.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            {/* Student Photo */}
            <div className="relative mx-auto w-24 h-24">
              <img
                src={avatarUrl}
                alt={student?.name || 'Student'}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-400/50 shadow-md mx-auto"
              />
            </div>

            {/* Student Name and ID */}
            <div>
              <h2 className="text-lg font-extrabold text-white">{student?.name || 'Student Member'}</h2>
              <span className="text-xs text-brand-300 font-mono font-bold block mt-0.5">
                {student?.studentId || 'ID: N/A'}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                {admin?.libraryName || 'Library Member'}
              </span>
            </div>

            {/* QR Code Pass */}
            <div className="bg-white p-3.5 rounded-2xl mx-auto w-36 h-36 flex flex-col items-center justify-center shadow-lg">
              {/* Simulated QR Code matrix */}
              <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-slate-100 rounded-lg">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35 || i === 14 || i === 21
                        ? 'bg-slate-900'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <UnverifiedBadge type="QR_GENERATION" size="xs" />
              <div className="text-[10px] text-slate-400 font-mono">
                Scan for attendance & turnstile check-in
              </div>
            </div>

            {/* Desk & Shift details */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[9px] text-slate-400 uppercase block font-semibold">Desk</span>
                <span className="font-mono font-extrabold text-brand-300">{seatNumber}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase block font-semibold">Shift</span>
                <span className="font-semibold text-white truncate block">{shiftName?.split(' ')[0] || 'Morning'}</span>
              </div>
            </div>

            {/* Print ID Card Button */}
            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/20 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Digital Pass</span>
            </button>
          </div>
        </div>

        {/* Profile Info Details (Right Col - 2 spans) */}
        <div className="md:col-span-2 space-y-4">
          {/* Membership & Validity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Membership & Validity Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Admission Date</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {startDate ? formatDate(startDate) : 'Ongoing'}
                </span>
                <span className="text-[11px] text-slate-500">Registered member</span>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 text-[10px] font-bold uppercase block">Valid Through</span>
                <span className="font-bold text-emerald-900 text-sm mt-0.5 block">
                  {endDate ? formatDate(endDate) : 'Ongoing'}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {student?.isActive !== false ? 'Active Subscription' : 'Expired / Inactive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                <Armchair className="w-5 h-5 text-brand-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Allocated Desk</span>
                  <span className="font-mono font-bold text-slate-900">{seatNumber}</span>
                </div>
              </div>

              <div className="border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Shift Timing</span>
                  <span className="font-bold text-slate-900">{shiftTiming}</span>
                </div>
              </div>

              <div className="border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Locker Unit</span>
                  <span className="font-mono font-bold text-slate-900">{lockerNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info & Contact Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Personal Information</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Registered Mobile:</span>
                <span className="font-mono font-bold text-slate-900">{student?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <span className="font-mono text-slate-900">{student?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Residential Address:</span>
                <span className="text-slate-900 text-right">{student?.address || 'Not Provided'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Subscription Duration:</span>
                <span className="font-bold text-slate-900">{duration} Month{duration > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Library Help & Support Contact */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 text-xs space-y-2">
            <h4 className="font-bold text-slate-800">Need Help or Shift Rescheduling?</h4>
            <p className="text-slate-500 leading-relaxed">
              Contact the front desk administrator of <strong>{admin?.libraryName || 'your library'}</strong>:
            </p>
            <div className="flex flex-wrap gap-4 pt-1 font-mono text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                <span>{admin?.phone || 'Contact Front Desk'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-brand-600" />
                <span>{admin?.email || 'admin@librarysathi.in'}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>{admin?.address || 'Library Campus'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
