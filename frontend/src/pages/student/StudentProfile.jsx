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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Student Digital Pass & Profile</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Your official digital access badge for entry, turnstile verification, and desk reservation.
          </p>
        </div>

        <button
          onClick={() => fetchProfile(true)}
          disabled={loading || refreshing}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-md shadow-2xs transition-colors disabled:opacity-50"
          title="Refresh digital pass data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-neutral-900' : 'text-neutral-500'}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync Pass'}</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-rose-50/50 border border-rose-200 text-rose-900 text-xs rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchProfile(true)}
            className="text-xs font-medium text-rose-700 underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Printable Digital ID Badge (Left Col - 1 span) */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-[#0A0A0A] text-white p-5 rounded-lg border border-neutral-800 shadow-sm space-y-4 text-center relative overflow-hidden">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <span className="text-[10px] font-mono font-medium text-neutral-400 tracking-wider uppercase">
                Library Pass
              </span>
              <span className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded border uppercase ${
                student?.isActive !== false
                  ? 'bg-neutral-900 text-emerald-400 border-neutral-800'
                  : 'bg-neutral-900 text-rose-400 border-neutral-800'
              }`}>
                {student?.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            {/* Student Photo */}
            <div className="relative mx-auto w-20 h-20">
              <img
                src={avatarUrl}
                alt={student?.name || 'Student'}
                className="w-20 h-20 rounded-md object-cover border border-neutral-800 shadow-xs mx-auto"
              />
            </div>

            {/* Student Name and ID */}
            <div>
              <h2 className="text-base font-semibold text-white">{student?.name || 'Student Member'}</h2>
              <span className="text-xs text-neutral-400 font-mono block mt-0.5">
                {student?.studentId || 'ID: N/A'}
              </span>
              <span className="text-[11px] text-neutral-500 block mt-0.5 truncate">
                {admin?.libraryName || 'Library Member'}
              </span>
            </div>

            {/* QR Code Pass */}
            <div className="bg-white p-3 rounded-md mx-auto w-32 h-32 flex flex-col items-center justify-center shadow-xs">
              <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-neutral-100 rounded">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35 || i === 14 || i === 21
                        ? 'bg-neutral-950'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <UnverifiedBadge type="QR_GENERATION" size="xs" />
              <div className="text-[10px] text-neutral-500 font-mono">
                Scan for attendance & turnstile check-in
              </div>
            </div>

            {/* Desk & Shift details */}
            <div className="bg-neutral-900 p-2.5 rounded-md border border-neutral-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase block font-mono">Desk</span>
                <span className="font-mono font-semibold text-white">{seatNumber}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase block font-mono">Shift</span>
                <span className="font-medium text-neutral-200 truncate block">{shiftName?.split(' ')[0] || 'Morning'}</span>
              </div>
            </div>

            {/* Print ID Card Button */}
            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-white hover:bg-neutral-100 text-neutral-950 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Digital Pass</span>
            </button>
          </div>
        </div>

        {/* Profile Info Details (Right Col - 2 spans) */}
        <div className="md:col-span-2 space-y-4">
          {/* Membership & Validity Card */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Membership & Validity Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200">
                <span className="text-neutral-400 text-[10px] font-mono uppercase block">Admission Date</span>
                <span className="font-semibold text-neutral-900 text-sm mt-0.5 block font-mono">
                  {startDate ? formatDate(startDate) : 'Ongoing'}
                </span>
                <span className="text-[11px] text-neutral-500">Registered member</span>
              </div>

              <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200">
                <span className="text-neutral-400 text-[10px] font-mono uppercase block">Valid Through</span>
                <span className="font-semibold text-neutral-900 text-sm mt-0.5 block font-mono">
                  {endDate ? formatDate(endDate) : 'Ongoing'}
                </span>
                <span className={`text-[11px] font-medium ${student?.isActive !== false ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {student?.isActive !== false ? 'Active Subscription' : 'Expired / Inactive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="border border-neutral-200 p-2.5 rounded-md flex items-center gap-2.5">
                <Armchair className="w-4 h-4 text-neutral-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-400 block font-medium">Allocated Desk</span>
                  <span className="font-mono font-semibold text-neutral-900">{seatNumber}</span>
                </div>
              </div>

              <div className="border border-neutral-200 p-2.5 rounded-md flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-400 block font-medium">Shift Timing</span>
                  <span className="font-mono font-medium text-neutral-900">{shiftTiming}</span>
                </div>
              </div>

              <div className="border border-neutral-200 p-2.5 rounded-md flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-neutral-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-400 block font-medium">Locker Unit</span>
                  <span className="font-mono font-semibold text-neutral-900">{lockerNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info & Contact Card */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-400" />
              <span>Personal Information</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Registered Mobile:</span>
                <span className="font-mono font-medium text-neutral-900">{student?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Email Address:</span>
                <span className="font-mono text-neutral-900">{student?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Residential Address:</span>
                <span className="text-neutral-900 text-right">{student?.address || 'Not Provided'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-neutral-500">Subscription Duration:</span>
                <span className="font-medium text-neutral-900">{duration} Month{duration > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Library Help & Support Contact */}
          <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 text-xs space-y-1.5">
            <h4 className="font-medium text-neutral-900">Need Help or Shift Rescheduling?</h4>
            <p className="text-neutral-500 leading-relaxed">
              Contact the front desk administrator of <strong className="text-neutral-800">{admin?.libraryName || 'your library'}</strong>:
            </p>
            <div className="flex flex-wrap gap-4 pt-1 font-mono text-[11px] text-neutral-600">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-neutral-400" />
                <span>{admin?.phone || 'Contact Front Desk'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-neutral-400" />
                <span>{admin?.email || 'admin@librarysathi.in'}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-neutral-400" />
                <span>{admin?.address || 'Library Campus'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
