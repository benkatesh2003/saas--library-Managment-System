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
  RefreshCw
} from 'lucide-react';
import { api, isMockEnabled } from '../../services/apiClient';
import { mockStore } from '../../mock/mockStore';
import { formatINR, formatDate } from '../../utils/formatters';
import { UnverifiedBadge, UnverifiedBanner } from '../../components/common/UnverifiedBadge';

export function AdminDashboard() {
  const isLive = !isMockEnabled();
  const [stats, setStats] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showNotice, setShowNotice] = useState(true);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      if (isMockEnabled()) {
        setStats(mockStore.getDashboardStats());
        setShifts(mockStore.getShifts());
        setStudents(mockStore.getStudents());
      } else {
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
      {/* Top Disclaimer Banner */}
      {showNotice && (
        <UnverifiedBanner
          type="STUDENT_AUTH"
          onDismiss={() => setShowNotice(false)}
        />
      )}

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            className="text-xs font-semibold text-rose-700 underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Library Operations Dashboard</h1>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live API (Port 5000)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Mock Mode (Offline)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time occupancy, multi-shift capacity, and fee collection overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-brand-300 px-3 py-2 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-600' : 'text-slate-500'}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
          <Link
            to="/admin/seats"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-brand-300 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <Armchair className="w-4 h-4 text-brand-600" />
            <span>View Seat Grid</span>
          </Link>
          <Link
            to="/admin/students"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit Student</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Seats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Seats</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Armchair className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {loading ? '...' : `${totalSeats} Desks`}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {loading ? '...' : `${occupancyRate}% Overall Occupancy`}
                {occupiedSeats > 0 && <span className="text-slate-400 font-normal ml-1">({occupiedSeats} occupied)</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Students</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {loading ? '...' : `${activeStudents} Members`}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {loading ? '...' : `Across ${shifts.length} shift schedule${shifts.length === 1 ? '' : 's'}`}
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{revenueLabel}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-600 font-mono">
              {loading ? '...' : formatINR(revenueAmount)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Authoritative backend collection
            </div>
          </div>
        </div>

        {/* Due Amounts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{pendingLabel}</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-rose-600 font-mono">
              {loading ? '...' : formatINR(pendingAmount)}
            </div>
            <div className="text-xs text-rose-600 mt-1 font-semibold">
              {loading ? '...' : `${dueStudentsCount} student${dueStudentsCount === 1 ? '' : 's'} with pending balance`}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Resource Summary Bar: Lockers & Book Inventory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Digital Lockers</div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {loading ? '...' : `${occupiedLockers} of ${totalLockers} Occupied`}
              </div>
            </div>
          </div>
          <Link
            to="/admin/lockers"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Manage</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Book Inventory & Issues</div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {loading ? '...' : `${issuedBooks} Issued • ${totalBooks} Titles in Catalog`}
              </div>
            </div>
          </div>
          <Link
            to="/admin/books"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Catalog</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Shifts Breakdown & Capacity */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Shift Timings & Student Allocation</h2>
            <p className="text-xs text-slate-500">Live breakdown of student density in each shift window</p>
          </div>
          <Link to="/admin/shifts" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>Manage Shifts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading live shift data...</div>
        ) : shifts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No shifts configured yet.</div>
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
                <div key={shift._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{shift.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold font-mono text-brand-700">
                      ₹{shift.price}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>{count} Students</span>
                      <span className="font-mono text-slate-500">
                        {shift.maxStudents && shift.maxStudents > 0 ? `${count}/${shift.maxStudents} cap` : `${percent}% filled`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 rounded-full transition-all"
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
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Student Admissions</h3>
                <p className="text-xs text-slate-500">Newly enrolled students and assigned seats</p>
              </div>
              <Link to="/admin/students" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Seat</th>
                    <th className="pb-3">Shift</th>
                    <th className="pb-3">Fee / Paid</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-xs text-slate-400">
                        Loading student records...
                      </td>
                    </tr>
                  ) : recentStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-xs text-slate-400">
                        No students enrolled yet.
                      </td>
                    </tr>
                  ) : (
                    recentStudents.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pr-3">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {s.studentId} • {s.phone || s.email || 'No phone'}
                          </div>
                        </td>
                        <td className="py-3 pr-3 font-mono font-bold text-brand-700">
                          {s.seat?.seatNumber || s.seatNumber || 'Unassigned'}
                        </td>
                        <td className="py-3 pr-3 text-slate-600">
                          {s.shift?.shiftName || s.shiftName || 'Unassigned'}
                        </td>
                        <td className="py-3 pr-3 font-mono font-semibold text-slate-800">
                          {s.feeAmount !== undefined
                            ? formatINR(s.feeAmount)
                            : (s.paidAmount !== undefined ? formatINR(s.paidAmount) : '-')}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            s.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.paymentStatus === 'due'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
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

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
            <span>Showing {recentStudents.length} of {students.length} students</span>
            <Link to="/admin/students" className="font-semibold text-brand-600 hover:text-brand-700">
              Open Full Directory →
            </Link>
          </div>
        </div>

        {/* Pending Dues & Expirations (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Fee Due Follow-Ups</h3>
                <p className="text-xs text-slate-500">Students with outstanding fees</p>
              </div>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {dueStudents.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading due records...</div>
              ) : dueStudents.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>All student fees are fully collected! No pending dues.</span>
                </div>
              ) : (
                dueStudents.map((s) => (
                  <div key={s._id} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[10px] text-slate-500">
                        Seat {s.seat?.seatNumber || s.seatNumber || 'Unassigned'} • {s.phone || 'No phone'}
                      </div>
                    </div>
                    <div className="text-right">
                      {s.feeAmount !== undefined ? (
                        <div className="font-mono font-bold text-rose-600 text-sm">
                          {formatINR(s.feeAmount - (s.paidAmount || 0))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-rose-100 text-rose-800">
                          {s.paymentStatus}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-rose-700 block mt-0.5">Uncollected</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
            <div className="flex items-center gap-1.5">
              <UnverifiedBadge type="WHATSAPP_SMS" size="xs" />
            </div>
            <span className="text-[11px] text-slate-400">Manual Reminder Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
