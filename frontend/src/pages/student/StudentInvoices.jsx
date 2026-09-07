import React, { useState, useEffect } from 'react';
import { Receipt, Printer, CheckCircle2, Download, Search, FileText, X, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';
import { formatINR, formatDate } from '../../utils/formatters';

export function StudentInvoices() {
  const { studentUser } = useAuth();
  const admin = studentUser?.student?.adminId || {};
  const student = studentUser?.student || null;

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchInvoices = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.studentPortal.getInvoices();
      if (res.success && res.data) {
        setInvoices(res.data.invoices || []);
      } else if (!res.success) {
        setError(res.message || 'Failed to fetch invoices from server');
      }
    } catch (err) {
      setError(`Network error loading invoices: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'all') return true;
    const st = (inv.status || '').toLowerCase();
    return st === filter.toLowerCase();
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fee Invoices & Receipts</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live API (Port 5000)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            View official computerized payment receipts and billing history issued by {admin.libraryName || 'your library'}.
          </p>
        </div>

        <button
          onClick={() => fetchInvoices(true)}
          disabled={loading || refreshing}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-brand-300 px-3 py-1.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          title="Refresh invoices"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-600' : 'text-slate-500'}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
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
            onClick={() => fetchInvoices(true)}
            className="text-xs font-bold text-rose-700 underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-slate-800">Billing History</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {loading ? 'Checking...' : `${filteredInvoices.length} Invoices Recorded`}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
            <span>Loading billing history...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Fee Invoices Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                            {`No billing records or computerized fee receipts have been issued for your student account yet.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map((inv) => {
              const invId = inv.invoiceNumber || inv.id || inv._id;
              const invAmount = inv.totalPayable ?? inv.amountPaidNow ?? inv.amount ?? 0;
              const invDate = inv.issueDate || inv.date || inv.createdAt;
              const invPeriod = inv.period || (inv.startDate && inv.endDate ? `${formatDate(inv.startDate)} – ${formatDate(inv.endDate)}` : 'Subscription Fee');
              const invStatus = inv.status || 'paid';
              const invMode = inv.paymentMethod || inv.mode || 'Direct';
              const invSeat = inv.seat || student?.seat?.seatNumber || student?.seatNumber || 'Unassigned';

              return (
                <div
                  key={invId}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{invId}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {invStatus}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">{invPeriod}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Issued {invDate ? formatDate(invDate) : 'N/A'} via {invMode}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-sm font-extrabold font-mono text-slate-900 block">
                        {formatINR(invAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400">Desk {invSeat}</span>
                    </div>

                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-colors shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Receipt</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Printable Receipt */}
      {selectedInvoice && (() => {
        const invId = selectedInvoice.invoiceNumber || selectedInvoice.id || selectedInvoice._id;
        const invAmount = selectedInvoice.totalPayable ?? selectedInvoice.amountPaidNow ?? selectedInvoice.amount ?? 0;
        const invDate = selectedInvoice.issueDate || selectedInvoice.date || selectedInvoice.createdAt;
        const invPeriod = selectedInvoice.period || (selectedInvoice.startDate && selectedInvoice.endDate ? `${formatDate(selectedInvoice.startDate)} – ${formatDate(selectedInvoice.endDate)}` : 'Subscription');
        const invMode = selectedInvoice.paymentMethod || selectedInvoice.mode || 'Direct';
        const invSeat = selectedInvoice.seat || student?.seat?.seatNumber || student?.seatNumber || 'Unassigned';
        const invShift = selectedInvoice.shift || student?.shift?.shiftName || student?.shiftName || 'Unassigned';
        const invLocker = selectedInvoice.locker || student?.locker?.lockerNumber || student?.lockerNumber || 'None';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-slate-900 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-slate-900">{admin.libraryName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{admin.address}</p>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Phone: {admin.phone} • Email: {admin.email}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Receipt Subheader */}
              <div className="bg-brand-50/60 p-4 rounded-2xl border border-brand-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Receipt Number</span>
                  <span className="font-mono font-bold text-brand-900">{invId}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Payment Date</span>
                  <span className="font-mono text-slate-800">{invDate ? formatDate(invDate) : 'N/A'}</span>
                </div>
              </div>

              {/* Table Details */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Student Name:</span>
                  <span className="font-bold text-right text-slate-900">{student?.name || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Student ID:</span>
                  <span className="font-mono font-bold text-right text-slate-900">{student?.studentId || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Allocated Desk:</span>
                  <span className="font-mono font-bold text-right text-slate-900">{invSeat}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Shift & Timing:</span>
                  <span className="font-medium text-right text-slate-900">{invShift}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Locker Box:</span>
                  <span className="font-medium text-right text-slate-900">{invLocker}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Validity Period:</span>
                  <span className="font-medium text-right text-slate-900">{invPeriod}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Payment Mode:</span>
                  <span className="font-mono text-right text-slate-900">{invMode}</span>
                </div>

                <div className="flex items-center justify-between pt-3 text-sm font-extrabold">
                  <span className="text-slate-900">Total Amount Paid:</span>
                  <span className="font-mono text-emerald-600 text-base">{formatINR(invAmount)}</span>
                </div>
              </div>

              {/* Stamp & Footer */}
              <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
                <p>This is a computer-generated fee receipt verified by Library Sathi.</p>
                <p className="text-[10px] mt-0.5">Valid for library premises entry & verification.</p>
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
                  <span>Print Official Copy</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
