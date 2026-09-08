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
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';
import { formatINR, formatDate } from '../../utils/formatters';
import { useRazorpay } from '../../hooks/useRazorpay';

export function StudentDashboard() {
  const { studentUser, refreshStudentProfile } = useAuth();
  const { openCheckout } = useRazorpay();
  const admin = studentUser?.student?.adminId || {};
  const [profile, setProfile] = useState(studentUser?.student || null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingOnline, setPayingOnline] = useState(false);

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

  const handleStudentPayFee = async () => {
    setPayingOnline(true);
    try {
      const res = await api.studentPayments.createOrder();
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to initialize payment');
      }
      const { orderId, amount, currency, key } = res.data;
      openCheckout({
        key,
        orderId,
        amount,
        currency,
        name: admin.libraryName || 'Library Sathi',
        description: `Library Fee Payment for ${student?.name}`,
        prefill: {
          name: student?.name || '',
          email: student?.email || '',
          phone: student?.phone || '',
        },
        theme: { color: '#4f46e5' },
        onSuccess: async (response) => {
          const verifyRes = await api.studentPayments.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verifyRes.success) {
            alert('Fee payment successful! Your library access has been renewed.');
            await fetchStudentData(true);
          } else {
            alert(verifyRes.message || 'Payment verification failed');
          }
          setPayingOnline(false);
        },
        onError: (err) => {
          alert(err.description || err.message || 'Payment was cancelled');
          setPayingOnline(false);
        },
        onDismiss: () => {
          setPayingOnline(false);
        },
      });
    } catch (err) {
      alert(err.message || 'Could not launch payment gateway');
      setPayingOnline(false);
    }
  };

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
      {/* Error Alert Banner */}
      {error && (
        <div className="bg-rose-50/50 border border-rose-200 text-rose-900 px-3.5 py-2.5 rounded-md flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchStudentData(true)}
            className="text-xs font-medium text-rose-700 underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Page Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Student Workspace</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            View allocated desk, shift hours, personal locker, and fee invoices.
          </p>
        </div>
        <button
          onClick={() => fetchStudentData(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-md shadow-2xs transition-colors disabled:opacity-50"
          title="Refresh profile & invoices"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-neutral-900' : 'text-neutral-500'}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>

      {/* Student Profile Overview Banner Card */}
      <div className="bg-[#0A0A0A] text-white p-5 sm:p-6 rounded-lg border border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-neutral-900 border border-neutral-800 text-white text-lg font-semibold flex items-center justify-center font-mono">
            {student?.name?.[0] || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-white">{student?.name || 'Member'}</h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                student?.isActive !== false
                  ? 'bg-neutral-900 text-emerald-400 border-neutral-800'
                  : 'bg-neutral-900 text-rose-400 border-neutral-800'
              }`}>
                {student?.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-xs text-neutral-400 font-mono mt-0.5">
              ID: {student?.studentId || 'N/A'} • {admin.libraryName || 'Library Member'}
            </div>
            <div className="text-xs text-neutral-500 font-mono mt-0.5">
              Valid Till: {validTill ? formatDate(validTill) : 'Ongoing'}
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/80 px-3.5 py-2.5 rounded-md border border-neutral-800 text-left sm:text-right min-w-44">
          <span className="text-[10px] uppercase font-mono text-neutral-400 block">Assigned Shift</span>
          <span className="text-sm font-semibold text-white block mt-0.5">{shiftName}</span>
          <span className="text-[11px] text-neutral-400 font-mono">{student?.phone ? `Mob: ${student.phone}` : 'Active Enrollment'}</span>
        </div>
      </div>

      {/* Due Fee Alert & Razorpay Online Payment */}
      {(student?.paymentStatus === 'due' || student?.paymentStatus === 'partial') && (
        <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-900 flex items-center gap-2">
                <span>Pending Library Fee Balance</span>
                <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-mono font-medium px-1.5 py-0.2 rounded uppercase">
                  {student.paymentStatus}
                </span>
              </div>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Clear your monthly shift & seat fee securely online via Razorpay (UPI, Google Pay, Cards).
              </p>
            </div>
          </div>

          <button
            onClick={handleStudentPayFee}
            disabled={payingOnline}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-medium transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer self-stretch sm:self-auto justify-center"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{payingOnline ? 'Opening Razorpay...' : 'Pay Online with Razorpay'}</span>
          </button>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/student/profile"
          className="bg-white p-3.5 rounded-lg border border-neutral-200 shadow-2xs hover:border-neutral-300 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center border border-neutral-200">
              <IdCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-900 block">Digital Pass & QR ID</span>
              <span className="text-[11px] text-neutral-500">View official gate badge</span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/student/invoices"
          className="bg-white p-3.5 rounded-lg border border-neutral-200 shadow-2xs hover:border-neutral-300 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center border border-neutral-200">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-900 block">Fee Receipts</span>
              <span className="text-[11px] text-neutral-500">Download or print invoices</span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Allocation Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Seat Card */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 border border-neutral-200">
            <Armchair className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider block">Allocated Desk</span>
            <span className="text-base font-semibold font-mono text-neutral-900">{seatNumber}</span>
            <span className="text-[10px] text-emerald-600 font-medium block">Assigned Seat</span>
          </div>
        </div>

        {/* Shift Card */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 border border-neutral-200">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider block">Shift Timing</span>
            <span className="text-xs font-semibold font-mono text-neutral-900 block mt-0.5">{shiftTiming}</span>
            <span className="text-[10px] text-neutral-500 block truncate">{shiftName}</span>
          </div>
        </div>

        {/* Locker Card */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 border border-neutral-200">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider block">Personal Locker</span>
            <span className="text-base font-semibold font-mono text-neutral-900">{lockerNumber}</span>
            <span className="text-[10px] text-neutral-500 block">Facility Bay</span>
          </div>
        </div>
      </div>

      {/* Fee Invoices & Payment History Preview */}
      <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Recent Fee Invoices</h3>
            <p className="text-xs text-neutral-500">Official computerized payment receipts issued by library</p>
          </div>
          <Link
            to="/student/invoices"
            className="text-xs font-medium text-neutral-900 hover:text-neutral-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="py-8 text-center bg-neutral-50 rounded-md border border-neutral-200">
            <Receipt className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-neutral-700">No fee invoices found for this account.</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Invoices generated upon enrollment or renewal will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {invoices.slice(0, 5).map((inv) => {
              const invId = inv.invoiceNumber || inv.id || inv._id;
              const invAmount = inv.totalPayable ?? inv.amountPaidNow ?? inv.amount ?? 0;
              const invDate = inv.issueDate || inv.date || inv.createdAt;
              const invPeriod = inv.period || (inv.startDate && inv.endDate ? `${formatDate(inv.startDate)} – ${formatDate(inv.endDate)}` : 'Subscription Fee');
              const invStatus = inv.status || 'paid';
              const invMode = inv.paymentMethod || inv.mode || 'Direct';

              return (
                <div key={invId} className="py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-medium text-neutral-900 flex items-center gap-2">
                      <span className="font-mono">{invId}</span>
                      <span className="font-normal text-neutral-500">({invPeriod})</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      Issued {invDate ? formatDate(invDate) : 'N/A'} • Mode: {invMode}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-semibold text-xs text-neutral-900">{formatINR(invAmount)}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border uppercase font-medium bg-neutral-100 text-neutral-700 border-neutral-200">
                      {invStatus}
                    </span>
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded flex items-center gap-1 font-medium"
                    >
                      <Printer className="w-3 h-3" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-lg border border-neutral-200 text-neutral-900 space-y-4 animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="text-center pb-3 border-b border-neutral-100">
                <h4 className="text-sm font-semibold">{admin.libraryName}</h4>
                <p className="text-[11px] text-neutral-500">{admin.address}</p>
                <span className="text-[10px] font-mono text-neutral-400 mt-0.5 block">Help: {admin.phone}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-medium">{invId}</span>
                <span className="text-neutral-500">{invDate ? formatDate(invDate) : 'N/A'}</span>
              </div>

              <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Student:</span>
                  <span className="font-medium">{student?.name} ({student?.studentId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Desk & Shift:</span>
                  <span className="font-medium">{seatNumber} ({shiftName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Period:</span>
                  <span className="font-mono">{invPeriod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 font-semibold text-xs">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-neutral-900">{formatINR(invAmount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md flex items-center gap-1.5 shadow-xs"
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
