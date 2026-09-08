import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Armchair,
  Users,
  IndianRupee,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  KeyRound,
  BookOpen,
  UserPlus,
  Plus,
  RefreshCw,
  CreditCard,
  Zap
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { formatINR, formatDate } from '../../utils/formatters';
import { useRazorpay } from '../../hooks/useRazorpay';

export function AdminDashboard() {
  const { openCheckout } = useRazorpay();
  const [stats, setStats] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [payingStudentId, setPayingStudentId] = useState(null);
  const [paymentNotice, setPaymentNotice] = useState(null);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [statsRes, shiftsRes, studentsRes] = await Promise.all([
        api.dashboard.getStats(),
        api.shifts.getAll(),
        api.students.getAll({ limit: 100 })
      ]);

      if (statsRes.success) {
        setStats(statsRes.data?.stats || statsRes.data || {});
      } else {
        setError(statsRes.message || 'Failed to load dashboard statistics');
      }

      if (shiftsRes.success) {
        setShifts(shiftsRes.data?.shifts || []);
      }

      if (studentsRes.success) {
        setStudents(studentsRes.data?.students || []);
      }
    } catch (err) {
      setError(`Network error connecting to backend: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCollectFee = async (student) => {
    setPayingStudentId(student._id);
    setPaymentNotice(null);

    try {
      const res = await api.studentPayments.createOrder({ studentId: student._id });
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to initialize fee payment order');
      }

      const { orderId, amount, currency, key } = res.data;

      openCheckout({
        key,
        orderId,
        amount,
        currency,
        name: 'Library Sathi',
        description: `Fee Collection for ${student.name} (${student.studentId})`,
        prefill: {
          name: student.name,
          email: student.email || '',
          contact: student.phone || '',
        },
        theme: { color: '#4f46e5' },
        onSuccess: async (response) => {
          try {
            setPaymentNotice({ type: 'info', message: `Verifying fee payment for ${student.name}...` });
            const verifyRes = await api.studentPayments.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setPaymentNotice({ type: 'success', message: `Fee payment received for ${student.name}! Status updated to Paid.` });
              await fetchDashboardData(true);
            } else {
              setPaymentNotice({ type: 'error', message: verifyRes.message || 'Fee payment verification failed' });
            }
          } catch (verErr) {
            setPaymentNotice({ type: 'error', message: `Verification error: ${verErr.message}` });
          } finally {
            setPayingStudentId(null);
          }
        },
        onError: (err) => {
          setPaymentNotice({ type: 'error', message: err.description || err.message || 'Payment cancelled or failed' });
          setPayingStudentId(null);
        },
        onDismiss: () => {
          setPayingStudentId(null);
        },
      });
    } catch (err) {
      setPaymentNotice({ type: 'error', message: err.message || 'Could not initiate Razorpay fee collection' });
      setPayingStudentId(null);
    }
  };

  // Compute authoritative KPI statistics
  const currentStats = stats || {};

  const totalSeats = currentStats.totalSeats ?? 0;
  const occupiedSeats = currentStats.occupiedSeats ?? 0;
  const occupancyRate = currentStats.occupancyRate !== undefined
    ? currentStats.occupancyRate
    : (totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0);

  const activeStudents = currentStats.activeStudents ?? 0;
  const totalStudents = currentStats.totalStudents ?? students.length;

  const totalLockers = currentStats.totalLockers ?? (currentStats.lockers?.total ?? 0);
  const occupiedLockers = currentStats.occupiedLockers ?? (currentStats.lockers?.occupied ?? 0);

  const totalBooks = currentStats.totalBooks ?? (currentStats.books?.total ?? 0);
  const issuedBooks = currentStats.issuedBooks ?? 0;

  // Authoritative financial statistics without unnecessary recalculation
  const revenueAmount = currentStats.revenueThisMonth !== undefined
    ? currentStats.revenueThisMonth
    : (currentStats.totalRevenue ?? 0);
  const revenueLabel = currentStats.revenueThisMonth !== undefined
    ? "Revenue this Month"
    : "Total Collection";

  const pendingAmount = currentStats.pendingPayments !== undefined
    ? currentStats.pendingPayments
    : (currentStats.totalDueAmount ?? 0);
  const pendingLabel = currentStats.pendingPayments !== undefined
    ? "Pending Payments"
    : "Pending Dues";

  const dueStudentsCount = currentStats.dueStudentsCount !== undefined
    ? currentStats.dueStudentsCount
    : students.filter(s => s.paymentStatus === 'due' || s.paymentStatus === 'partial').length;

  const recentStudents = students.slice(0, 5);
  const dueStudents = students.filter(s => s.paymentStatus === 'due' || s.paymentStatus === 'partial');

  return (
    <div className="space-y-6">
      {/* Error Alert Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-md flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            className="text-xs font-medium text-rose-700 underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Payment Notice */}
      {paymentNotice && (
        <div
          className={`p-3.5 rounded-md flex items-start gap-2.5 border text-xs leading-relaxed transition-all ${
            paymentNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : paymentNotice.type === 'info'
              ? 'bg-neutral-100 border-neutral-300 text-neutral-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {paymentNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : paymentNotice.type === 'info' ? (
            <RefreshCw className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5 animate-spin" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{paymentNotice.message}</div>
          <button
            onClick={() => setPaymentNotice(null)}
            className="text-neutral-400 hover:text-neutral-600 text-xs font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Operations Dashboard</h1>
            <Link
              to="/admin/billing"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200 transition-colors"
              title="Manage subscription"
            >
              <CreditCard className="w-3 h-3 text-neutral-600" />
              <span>Gateway Live</span>
            </Link>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time occupancy, multi-shift capacity, and student fee collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-md shadow-2xs transition-colors disabled:opacity-50"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-neutral-900' : 'text-neutral-500'}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
          <Link
            to="/admin/seats"
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-md shadow-2xs transition-colors"
          >
            <Armchair className="w-3.5 h-3.5 text-neutral-500" />
            <span>Seat Matrix</span>
          </Link>
          <Link
            to="/admin/students?action=admit"
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-3.5 py-1.5 rounded-md shadow-2xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Admit Student</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Seats */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Desks</span>
            <div className="w-8 h-8 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center border border-neutral-200">
              <Armchair className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-900 font-mono tracking-tight">
              {loading ? '...' : `${totalSeats} Desks`}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {loading ? '...' : `${occupancyRate}% Overall Occupancy`}
                {occupiedSeats > 0 && <span className="text-neutral-400 font-normal ml-1">({occupiedSeats} occupied)</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Active Students</span>
            <div className="w-8 h-8 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center border border-neutral-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-900 font-mono tracking-tight">
              {loading ? '...' : `${activeStudents} Members`}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {loading ? '...' : `Across ${shifts.length} shift schedule${shifts.length === 1 ? '' : 's'}`}
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">{revenueLabel}</span>
            <div className="w-8 h-8 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center border border-neutral-200">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-900 font-mono tracking-tight">
              {loading ? '...' : formatINR(revenueAmount)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Collected fees this month
            </div>
          </div>
        </div>

        {/* Due Amounts */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">{pendingLabel}</span>
            <div className="w-8 h-8 rounded-md bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600 font-mono tracking-tight">
              {loading ? '...' : formatINR(pendingAmount)}
            </div>
            <div className="text-xs text-rose-600 mt-1 font-medium">
              {loading ? '...' : `${dueStudentsCount} student${dueStudentsCount === 1 ? '' : 's'} pending`}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Resource Summary Bar: Lockers & Book Inventory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center border border-neutral-200">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Digital Lockers</div>
              <div className="text-sm font-bold text-neutral-900 mt-0.5 font-mono">
                {loading ? '...' : `${occupiedLockers} of ${totalLockers} Occupied`}
              </div>
            </div>
          </div>
          <Link
            to="/admin/lockers"
            className="text-xs font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-200 bg-white hover:bg-neutral-50 px-2.5 py-1 rounded-md transition-colors shadow-2xs flex items-center gap-1"
          >
            <span>Manage</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500" />
          </Link>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center border border-neutral-200">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Book Inventory</div>
              <div className="text-sm font-bold text-neutral-900 mt-0.5 font-mono">
                {loading ? '...' : `${issuedBooks} Issued • ${totalBooks} Titles`}
              </div>
            </div>
          </div>
          <Link
            to="/admin/books"
            className="text-xs font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-200 bg-white hover:bg-neutral-50 px-2.5 py-1 rounded-md transition-colors shadow-2xs flex items-center gap-1"
          >
            <span>Catalog</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500" />
          </Link>
        </div>
      </div>

      {/* Shifts Breakdown & Capacity */}
      <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Shift Schedules & Capacity</h2>
            <p className="text-xs text-neutral-500">Live breakdown of student density in each shift</p>
          </div>
          <Link to="/admin/shifts" className="text-xs font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-200 bg-white hover:bg-neutral-50 px-2.5 py-1 rounded-md transition-colors shadow-2xs flex items-center gap-1">
            <span>Manage Shifts</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-400">Loading shift data...</div>
        ) : shifts.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">No shifts configured yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shifts.map((shift) => {
              const shiftStudents = students.filter(s => {
                const sShiftId = s.shift?.shiftId || s.shiftId;
                const sShiftName = s.shift?.shiftName || s.shiftName;
                return (sShiftId && sShiftId === shift._id) ||
                  (sShiftName && sShiftName.toLowerCase() === shift.name?.toLowerCase());
              });
              const count = shiftStudents.length > 0 ? shiftStudents.length : (shift.currentStudents || 0);
              const max = shift.maxStudents && shift.maxStudents > 0 ? shift.maxStudents : totalSeats;
              const percent = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;

              return (
                <div key={shift._id} className="p-3.5 rounded-md bg-neutral-50 border border-neutral-200 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{shift.name}</h4>
                      <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-neutral-900">
                      ₹{shift.price}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-neutral-600 mb-1">
                      <span>{count} Students</span>
                      <span className="font-mono text-neutral-400 text-[10px]">
                        {shift.maxStudents && shift.maxStudents > 0 ? `${count}/${shift.maxStudents} cap` : `${percent}%`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Section: Recent Admissions + Due Fees */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Admissions (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Recent Admissions</h3>
                <p className="text-xs text-neutral-500">Newly enrolled students and assigned seats</p>
              </div>
              <Link to="/admin/students" className="text-xs font-medium text-neutral-700 hover:text-neutral-900">
                View All →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                    <th className="pb-2.5">Student</th>
                    <th className="pb-2.5">Seat</th>
                    <th className="pb-2.5">Shift</th>
                    <th className="pb-2.5">Fee</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-xs text-neutral-400">
                        Loading student records...
                      </td>
                    </tr>
                  ) : recentStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-xs text-neutral-400">
                        No students enrolled yet.
                      </td>
                    </tr>
                  ) : (
                    recentStudents.map((s) => (
                      <tr key={s._id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-2.5 pr-3">
                          <div className="font-semibold text-neutral-900">{s.name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {s.studentId} • {s.phone || s.email || 'No phone'}
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 font-mono font-medium text-neutral-900">
                          {s.seat?.seatNumber || s.seatNumber || '—'}
                        </td>
                        <td className="py-2.5 pr-3 text-neutral-600">
                          {s.shift?.shiftName || s.shiftName || 'Standard'}
                        </td>
                        <td className="py-2.5 pr-3 font-mono font-medium text-neutral-900">
                          {s.feeAmount !== undefined
                            ? formatINR(s.feeAmount)
                            : (s.paidAmount !== undefined ? formatINR(s.paidAmount) : '-')}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded-full border ${
                            s.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : s.paymentStatus === 'due'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {s.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-150 flex items-center justify-between text-xs text-neutral-500 mt-3">
            <span>Showing {recentStudents.length} of {students.length} students</span>
            <Link to="/admin/students" className="font-medium text-neutral-900 hover:underline">
              Open Full Directory →
            </Link>
          </div>
        </div>

        {/* Pending Dues & Expirations (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Fee Due Follow-Ups</h3>
                <p className="text-xs text-neutral-500">Students with outstanding balances</p>
              </div>
              <span className="text-[10px] font-mono font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {dueStudents.length} Pending
              </span>
            </div>

            <div className="space-y-2.5">
              {loading ? (
                <div className="py-8 text-center text-xs text-neutral-400">Loading due records...</div>
              ) : dueStudents.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <span>All fees collected. Zero pending dues.</span>
                </div>
              ) : (
                dueStudents.map((s) => (
                  <div key={s._id} className="p-3 rounded-md bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-neutral-900">{s.name}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Seat {s.seat?.seatNumber || s.seatNumber || '—'} • {s.phone || 'No phone'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        {s.feeAmount !== undefined ? (
                          <div className="font-mono font-bold text-rose-600 text-xs">
                            {formatINR(s.feeAmount - (s.paidAmount || 0))}
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium font-mono px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
                            {s.paymentStatus}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 block mt-0.5">Due</span>
                      </div>
                      <button
                        onClick={() => handleCollectFee(s)}
                        disabled={payingStudentId === s._id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-medium transition-colors shadow-2xs disabled:opacity-50 cursor-pointer shrink-0"
                        title="Collect fee via Razorpay"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>{payingStudentId === s._id ? '...' : 'Pay'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-150 flex items-center justify-between mt-3">
            <span className="text-[11px] text-neutral-600 font-medium flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-neutral-500" />
              Razorpay Gateway Active
            </span>
            <Link to="/admin/students?selectedStatusFilter=due" className="text-[11px] font-medium text-neutral-900 hover:underline">
              View All Dues →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
