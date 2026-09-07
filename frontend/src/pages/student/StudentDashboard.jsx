import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Armchair,
  Clock,
  KeyRound,
  Calendar,
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  IdCard,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';
import { formatINR, formatDate } from '../../utils/formatters';


export function StudentDashboard() {
  const { studentUser, refreshStudentProfile } = useAuth();
  const admin = studentUser?.student?.adminId || {};
  const [profile, setProfile] = useState(studentUser?.student || null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchStudentData = async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [profRes, invRes] = await Promise.all([
        api.studentPortal.getProfile(),
        api.studentPortal.getInvoices()
      ]);

      if (profRes.success && profRes.data) {
        setProfile(profRes.data);
      } else if (!profRes.success) {
        setError(profRes.message || 'Failed to load student profile');
      }

      if (invRes.success && invRes.data) {
        setInvoices(invRes.data.invoices || []);
      }
    } catch (err) {
      setError(`Network error loading portal data: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const student = profile || studentUser?.student;
  const seatNumber = student?.seat?.seatNumber || student?.seatNumber || 'Unassigned';
  const shiftName = student?.shift?.shiftName || student?.shiftName || 'Unassigned';
  const shiftTiming = student?.shift?.startTime && student?.shift?.endTime
    ? `${student.shift.startTime} – ${student.shift.endTime}`
    : (student?.shiftTime || '06:00 AM – 12:00 PM');
  const lockerNumber = student?.locker?.lockerNumber || student?.lockerNumber || 'None';
  const validTill = student?.subscription?.endDate || student?.endDate || student?.admissionDate;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Disclaimer Banner */}

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchStudentData(true)}
            className="text-xs font-semibold text-rose-700 underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Page Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Dashboard</span>
        </div>
        <button
          onClick={() => fetchStudentData(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-brand-300 px-3 py-1.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          title="Refresh profile & invoices"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-600' : 'text-slate-500'}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>

      {/* Student Profile Overview Banner Card */}
      <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-brand-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600/30 border border-brand-400/40 text-brand-300 text-2xl font-extrabold flex items-center justify-center">
            {student?.name?.[0] || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{student?.name || 'Member'}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                student?.isActive !== false
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {student?.isActive !== false ? 'Active Member' : 'Inactive'}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              ID: {student?.studentId || 'N/A'} • {admin.libraryName}
            </div>
            <div className="text-xs text-brand-300 font-medium mt-1">
              Valid Till: {validTill ? formatDate(validTill) : 'Ongoing'}
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-left sm:text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Shift</span>
          <span className="text-base font-extrabold text-white block mt-0.5">{shiftName}</span>
          <span className="text-[11px] text-brand-300 font-mono">{student?.phone ? `Mob: ${student.phone}` : 'Official Enrollment'}</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/student/profile"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-300 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Digital Pass & QR ID</span>
              <span className="text-[11px] text-slate-400">View official gate badge</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/student/invoices"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-300 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Fee Receipts</span>
              <span className="text-[11px] text-slate-400">Download or print invoices</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Allocation Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Seat Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Armchair className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Allocated Desk</span>
            <span className="text-xl font-extrabold font-mono text-slate-900">{seatNumber}</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Reserved For You</span>
          </div>
        </div>

        {/* Shift Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Shift Timing</span>
            <span className="text-sm font-extrabold text-slate-900 block mt-0.5">{shiftTiming}</span>
            <span className="text-[10px] text-slate-500 block">{shiftName}</span>
          </div>
        </div>

        {/* Locker Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Personal Locker</span>
            <span className="text-xl font-extrabold font-mono text-slate-900">{lockerNumber}</span>
            <span className="text-[10px] text-slate-500 block">Facility Locker Bay</span>
          </div>
        </div>
      </div>

      {/* Fee Invoices & Payment History Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Fee Invoices</h3>
            <p className="text-xs text-slate-500">Official computerized payment receipts issued by library</p>
          </div>
          <Link
            to="/student/invoices"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No fee invoices or receipts found for this account.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
                            Invoices generated upon enrollment or renewal will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.slice(0, 5).map((inv) => {
              const invId = inv.invoiceNumber || inv.id || inv._id;
              const invAmount = inv.totalPayable ?? inv.amountPaidNow ?? inv.amount ?? 0;
              const invDate = inv.issueDate || inv.date || inv.createdAt;
              const invPeriod = inv.period || (inv.startDate && inv.endDate ? `${formatDate(inv.startDate)} – ${formatDate(inv.endDate)}` : 'Subscription Fee');
              const invStatus = inv.status || 'paid';
              const invMode = inv.paymentMethod || inv.mode || 'Direct';

              return (
                <div key={invId} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="font-mono">{invId}</span>
                      <span className="font-normal text-slate-500">({invPeriod})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Issued {invDate ? formatDate(invDate) : 'N/A'} • Mode: {invMode}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-900">{formatINR(invAmount)}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                      {invStatus}
                    </span>
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-1.5 text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-lg flex items-center gap-1 font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Printable Receipt */}
      {selectedInvoice && (() => {
        const invId = selectedInvoice.invoiceNumber || selectedInvoice.id || selectedInvoice._id;
        const invAmount = selectedInvoice.totalPayable ?? selectedInvoice.amountPaidNow ?? selectedInvoice.amount ?? 0;
        const invDate = selectedInvoice.issueDate || selectedInvoice.date || selectedInvoice.createdAt;
        const invPeriod = selectedInvoice.period || (selectedInvoice.startDate && selectedInvoice.endDate ? `${formatDate(selectedInvoice.startDate)} – ${formatDate(selectedInvoice.endDate)}` : 'Subscription');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-slate-900 space-y-4">
              {/* Header */}
              <div className="text-center pb-3 border-b border-slate-200">
                <h4 className="text-base font-extrabold">{admin.libraryName}</h4>
                <p className="text-[11px] text-slate-500">{admin.address}</p>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">Help: {admin.phone}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold">{invId}</span>
                <span className="text-slate-500">{invDate ? formatDate(invDate) : 'N/A'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold">{student?.name} ({student?.studentId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Desk & Shift:</span>
                  <span className="font-bold">{seatNumber} ({shiftName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subscription Period:</span>
                  <span className="font-mono">{invPeriod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-emerald-700">{formatINR(invAmount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Copy</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
