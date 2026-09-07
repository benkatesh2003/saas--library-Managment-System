import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Search, CheckCircle2, Clock, XCircle, AlertCircle, Edit3, X, Filter, RefreshCw } from 'lucide-react';
import { api } from '../../services/apiClient';
import { formatINR, formatDate } from '../../utils/formatters';

export function SuperAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingSub, setEditingSub] = useState(null);
  const [newStatus, setNewStatus] = useState('paid');

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.superAdmin.subscriptions.getAll();
      if (res && res.success && res.data) {
        setSubscriptions(res.data.subscriptions || []);
      } else {
        setError(res?.message || 'Failed to fetch subscriptions from live backend.');
      }
    } catch (err) {
      setError(`Network error loading subscriptions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleOpenStatusModal = (sub) => {
    setEditingSub(sub);
    setNewStatus(sub.paymentStatus || 'paid');
    setActionError('');
    setActionSuccess('');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!editingSub) return;

    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      const res = await api.superAdmin.subscriptions.updateStatus(editingSub._id, newStatus);
      if (res && res.success) {
        await loadSubscriptions();
        setActionSuccess(`Subscription status updated to "${newStatus}"!`);
        setEditingSub(null);
      } else {
        setActionError(res?.message || 'Failed to update subscription status.');
      }
    } catch (err) {
      setActionError(`Network error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = subscriptions.filter((sub) => {
    const libName = sub.adminId?.libraryName || '';
    const email = sub.adminId?.email || '';
    const orderId = sub.razorpayOrderId || '';
    const matchesSearch =
      libName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Paid</span>
          </span>
        );
      case 'created':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-amber-950 text-amber-400 border border-amber-800">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-rose-950 text-rose-400 border border-rose-800">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">SaaS Subscription Billing Logs</h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase bg-emerald-950/60 text-emerald-400 border-emerald-800">
              ● Live Atlas (Port 5000)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time transaction logs, recurring billing cycles, and manual payment verification overrides.
          </p>
        </div>

        <button
          onClick={loadSubscriptions}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2.5 rounded-xl transition-colors"
          title="Refresh Subscriptions"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Global Alerts */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <div className="font-bold">Error loading subscriptions</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by library name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
          {['all', 'paid', 'created', 'failed', 'pending', 'expired'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st === 'created' ? 'Pending' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && subscriptions.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Fetching live subscription billing logs...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Subscription Logs Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'No subscription logs match your search and filter criteria.'
                : 'There are currently no tenant subscriptions recorded in the system.'}
            </p>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      {filtered.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/40">
                <tr>
                  <th className="py-3 px-4">Library Account</th>
                  <th className="py-3 px-4">Plan & Cycle</th>
                  <th className="py-3 px-4">Order & Gateway ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Validity Period</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">
                      <div>{sub.adminId?.libraryName || 'Library Tenant'}</div>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        {sub.adminId?.email || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-semibold text-white">{sub.planId?.name || 'SaaS Plan'}</div>
                      <span className="text-[10px] text-brand-400 uppercase font-mono">{sub.billingCycle}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      <div>{sub.razorpayOrderId || 'N/A'}</div>
                      {sub.razorpayPaymentId && (
                        <div className="text-[10px] text-emerald-400">{sub.razorpayPaymentId}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {formatINR(sub.finalAmount ?? sub.totalAmount ?? 0)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      <div>{sub.startDate ? formatDate(sub.startDate) : 'Immediate'}</div>
                      <div className="text-slate-500">{sub.endDate ? `to ${formatDate(sub.endDate)}` : 'Active'}</div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(sub.paymentStatus)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(sub)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                        title="Override Status"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Override</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Override Status */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Manual Status Override</h3>
              <button onClick={() => setEditingSub(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div className="text-xs text-slate-300">
                <p>
                  Override status for <strong>{editingSub.adminId?.libraryName || 'Library Tenant'}</strong>:
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  Order ID: {editingSub.razorpayOrderId || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">New Payment Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="paid">Paid (Mark Verified)</option>
                  <option value="created">Created</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
