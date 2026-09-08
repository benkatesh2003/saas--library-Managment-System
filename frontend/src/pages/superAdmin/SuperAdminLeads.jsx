import React, { useState, useEffect, useCallback } from 'react';
import {
  PhoneCall,
  Mail,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Trash2,
  AlertCircle,
  Filter
} from 'lucide-react';
import { api } from '../../services/apiClient';

export function SuperAdminLeads() {
  const [leads, setLeads] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, contacted: 0, converted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.superAdmin.demoRequests.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined
      });

      if (res && res.success) {
        setLeads(res.data?.demoRequests || []);
        if (res.data?.counts) {
          setCounts(res.data.counts);
        }
      } else {
        setError(res?.message || 'Failed to fetch demo leads from backend');
      }
    } catch (err) {
      setError(err.message || 'Network error fetching leads');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await api.superAdmin.demoRequests.updateStatus(id, newStatus);
      if (res && res.success) {
        setLeads(prev =>
          prev.map(item => (item._id === id || item.id === id ? { ...item, status: newStatus } : item))
        );
        // Refresh counts in background
        fetchLeads();
      } else {
        alert(res?.message || 'Failed to update status');
      }
    } catch (err) {
      alert(err.message || 'Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead record?')) return;
    try {
      const res = await api.superAdmin.demoRequests.delete(id);
      if (res && res.success) {
        setLeads(prev => prev.filter(item => item._id !== id && item.id !== id));
        fetchLeads();
      } else {
        alert(res?.message || 'Failed to delete lead');
      }
    } catch (err) {
      alert(err.message || 'Error deleting lead');
    }
  };

  const getCleanPhone = (phone) => {
    return (phone || '').replace(/[^0-9]/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Inbound Demo & Pricing Leads</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-neutral-900 text-neutral-300 border-neutral-800">
              Landing Page Inquiries
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Prospective library operators who requested a demo or inquired for a pricing plan tier.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 px-3 py-2 rounded-md border border-neutral-800 transition-colors disabled:opacity-50 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === 'all'
              ? 'bg-neutral-900 border-neutral-700'
              : 'bg-[#0A0A0A] border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Total Inquiries</span>
          <span className="text-2xl font-bold text-white font-mono mt-0.5 block">{counts.total}</span>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === 'pending'
              ? 'bg-amber-950/40 border-amber-800'
              : 'bg-[#0A0A0A] border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-amber-400 block">Pending Follow-up</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-0.5 block">{counts.pending}</span>
        </div>

        <div
          onClick={() => setStatusFilter('contacted')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === 'contacted'
              ? 'bg-blue-950/40 border-blue-800'
              : 'bg-[#0A0A0A] border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-blue-400 block">Contacted</span>
          <span className="text-2xl font-bold text-blue-400 font-mono mt-0.5 block">{counts.contacted}</span>
        </div>

        <div
          onClick={() => setStatusFilter('converted')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === 'converted'
              ? 'bg-emerald-950/40 border-emerald-800'
              : 'bg-[#0A0A0A] border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-emerald-400 block">Converted Customers</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-0.5 block">{counts.converted}</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-md bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-[#0A0A0A] rounded-lg border border-neutral-800 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads by name, city, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] text-neutral-400 font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 focus:outline-none focus:border-neutral-700"
          >
            <option value="all">All Inquiries</option>
            <option value="pending">Pending Only</option>
            <option value="contacted">Contacted</option>
            <option value="demo_scheduled">Demo Scheduled</option>
            <option value="converted">Converted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-[#0A0A0A] rounded-lg border border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-neutral-400 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
              <span>Fetching live leads from database...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 text-xs space-y-2">
              <PhoneCall className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="font-medium text-neutral-300">No leads match your filter.</p>
              <p className="text-[11px] text-neutral-500">Inbound inquiries from the landing page pricing & demo buttons will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Study Center & Location</th>
                  <th className="py-3 px-4">Inquired Plan & Scale</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {leads.map((lead) => {
                  const leadId = lead._id || lead.id;
                  const cleanPhone = getCleanPhone(lead.phone);
                  const isUpdating = updatingId === leadId;

                  return (
                    <tr key={leadId} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white text-xs">{lead.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="text-[11px] text-neutral-300 font-mono hover:text-white flex items-center gap-1"
                          >
                            <PhoneCall className="w-3 h-3 text-neutral-500" />
                            <span>{lead.phone}</span>
                          </a>

                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                              `Hello ${lead.name}, thank you for your interest in Library Sathi regarding ${lead.selectedPlan || 'our software'}. How can we assist your reading room?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/80 text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                        {lead.email && (
                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5 flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5 text-neutral-500" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-200">{lead.libraryName}</div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-neutral-500" />
                          <span>{lead.city}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-white px-2 py-0.5 rounded text-[11px] bg-neutral-900 border border-neutral-700">
                          {lead.selectedPlan || 'General Demo'}
                        </span>
                        <div className="text-[10px] font-mono text-neutral-400 mt-1">
                          Scale: {lead.seatCount || '50-100'} • {lead.preferredTime || 'Morning'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Recent'}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          disabled={isUpdating}
                          value={lead.status || 'pending'}
                          onChange={(e) => handleStatusChange(leadId, e.target.value)}
                          className={`text-[10px] font-mono px-2 py-1 rounded border focus:outline-none ${
                            lead.status === 'converted'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                              : lead.status === 'contacted'
                              ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                              : lead.status === 'demo_scheduled'
                              ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                              : lead.status === 'rejected'
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                              : 'bg-amber-950/60 text-amber-300 border-amber-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="demo_scheduled">Demo Scheduled</option>
                          <option value="converted">Converted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(leadId)}
                          className="text-neutral-500 hover:text-rose-400 p-1.5 rounded hover:bg-neutral-900 transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
