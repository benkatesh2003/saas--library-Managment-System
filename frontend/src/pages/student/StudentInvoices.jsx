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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Fee Invoices & Receipts</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            View official computerized payment receipts and billing history issued by {admin.libraryName || 'your library'}.
          </p>
        </div>

        <button
          onClick={() => fetchInvoices(true)}
          disabled={loading || refreshing}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-md shadow-2xs transition-colors disabled:opacity-50"
          title="Refresh invoices"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-neutral-900' : 'text-neutral-500'}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
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
            onClick={() => fetchInvoices(true)}
            className="text-xs font-medium text-rose-700 underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-700">Billing History</span>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {loading ? 'Checking...' : `${filteredInvoices.length} Invoices`}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-neutral-600" />
            <span>Loading billing history...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-900">No Fee Invoices Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              No billing records or computerized fee receipts have been issued for your student account yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
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
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-xs text-neutral-900">{invId}</span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border bg-neutral-100 text-neutral-700 border-neutral-200">
                        {invStatus}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600">{invPeriod}</div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      Issued {invDate ? formatDate(invDate) : 'N/A'} via {invMode}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs font-semibold font-mono text-neutral-900 block">
                        {formatINR(invAmount)}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">Desk {invSeat}</span>
                    </div>

                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-md transition-colors"
                    >
                      <Printer className="w-3 h-3" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-lg p-5 sm:p-6 max-w-lg w-full shadow-lg border border-neutral-200 text-neutral-900 space-y-4 animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-neutral-900">{admin.libraryName}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{admin.address}</p>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    Phone: {admin.phone} • Email: {admin.email}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Receipt Subheader */}
              <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-mono">Receipt Number</span>
                  <span className="font-mono font-medium text-neutral-900">{invId}</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-400 block text-[10px] uppercase font-mono">Payment Date</span>
                  <span className="font-mono text-neutral-700">{invDate ? formatDate(invDate) : 'N/A'}</span>
                </div>
              </div>

              {/* Table Details */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Student Name:</span>
                  <span className="font-medium text-right text-neutral-900">{student?.name || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Student ID:</span>
                  <span className="font-mono font-medium text-right text-neutral-900">{student?.studentId || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Allocated Desk:</span>
                  <span className="font-mono font-medium text-right text-neutral-900">{invSeat}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Shift & Timing:</span>
                  <span className="font-medium text-right text-neutral-900">{invShift}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Locker Box:</span>
                  <span className="font-medium text-right text-neutral-900">{invLocker}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Validity Period:</span>
                  <span className="font-medium text-right text-neutral-900">{invPeriod}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Payment Mode:</span>
                  <span className="font-mono text-right text-neutral-900">{invMode}</span>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs font-semibold">
                  <span className="text-neutral-900">Total Amount Paid:</span>
                  <span className="font-mono text-neutral-900 text-sm">{formatINR(invAmount)}</span>
                </div>
              </div>

              {/* Stamp & Footer */}
              <div className="pt-2 text-center text-[11px] text-neutral-400 border-t border-neutral-100">
                <p>This is a computer-generated fee receipt verified by Library Sathi.</p>
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
