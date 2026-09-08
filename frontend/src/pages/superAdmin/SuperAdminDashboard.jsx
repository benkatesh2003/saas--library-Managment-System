import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Building2,
  Layers,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Users,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Info,
  PhoneCall,
  MessageSquare,
  MapPin,
  Sparkles
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { api } from '../../services/apiClient';

export function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveMetrics, setLiveMetrics] = useState({
    activeLibraries: 0,
    managedDesks: 0,
    platformMRR: 0,
    activePlansCount: 0,
    recentSubscriptions: [],
    recentLeads: [],
    leadCounts: { total: 0, pending: 0, contacted: 0, converted: 0 }
  });

  const loadLiveMetrics = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Parallel fetch of subscriptions, plans, and demo leads from live backend
      const [subsRes, plansRes, leadsRes] = await Promise.all([
        api.superAdmin.subscriptions.getAll().catch(err => ({ success: false, message: err.message })),
        api.superAdmin.plans.getAll().catch(err => ({ success: false, message: err.message })),
        api.superAdmin.demoRequests.getAll({ limit: 6 }).catch(err => ({ success: false, message: err.message }))
      ]);

      if (!subsRes.success) {
        throw new Error(subsRes.message || 'Failed to fetch subscription records');
      }

      const subscriptions = subsRes.data?.subscriptions || [];
      const plans = plansRes.success ? (plansRes.data?.plans || []) : [];
      const recentLeads = leadsRes.success ? (leadsRes.data?.demoRequests || []) : [];
      const leadCounts = leadsRes.success && leadsRes.data?.counts
        ? leadsRes.data.counts
        : { total: recentLeads.length, pending: recentLeads.filter(l => l.status === 'pending').length };

      // Calculate unique tenant libraries
      const uniqueAdminIds = new Set();
      let totalMRR = 0;
      let totalDesks = 0;

      subscriptions.forEach(sub => {
        const adminObj = sub.adminId;
        const adminId = adminObj?._id || adminObj?.id || sub.adminId;
        if (adminId) {
          uniqueAdminIds.add(String(adminId));
        }

        // Add to MRR if active or paid
        const isPaidOrActive = sub.isActive || sub.paymentStatus === 'paid';
        if (isPaidOrActive) {
          const amt = Number(sub.finalAmount ?? sub.totalAmount ?? 0);
          totalMRR += amt;
        }

        // Add desk capacity from plan if available
        if (sub.planId?.maxSeats && sub.planId?.maxSeats > 0) {
          totalDesks += sub.planId.maxSeats;
        }
      });

      const activePlans = plans.filter(p => p.isActive);

      setLiveMetrics({
        activeLibraries: uniqueAdminIds.size,
        managedDesks: totalDesks > 0 ? totalDesks : uniqueAdminIds.size * 50,
        platformMRR: totalMRR,
        activePlansCount: activePlans.length,
        recentSubscriptions: subscriptions.slice(0, 5),
        recentLeads,
        leadCounts
      });
    } catch (err) {
      setError(`Failed to calculate live metrics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQuickLeadStatus = async (id, newStatus) => {
    try {
      const res = await api.superAdmin.demoRequests.updateStatus(id, newStatus);
      if (res && res.success) {
        setLiveMetrics(prev => ({
          ...prev,
          recentLeads: prev.recentLeads.map(l => (l._id === id || l.id === id ? { ...l, status: newStatus } : l))
        }));
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  useEffect(() => {
    loadLiveMetrics();
  }, [loadLiveMetrics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Performance & Metrics</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border bg-emerald-950/60 text-emerald-400 border-emerald-800">
              Live Platform Data (Port 5000)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Consolidated multi-tenant analytics across all study spaces.
          </p>
        </div>

        <button
          onClick={loadLiveMetrics}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
          title="Refresh metrics from backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 uppercase font-mono block">Active Libraries</span>
            <Building2 className="w-4 h-4 text-neutral-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono mt-1.5 block">
            {loading ? '...' : liveMetrics.activeLibraries}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            ● Active tenants
          </span>
        </div>

        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 uppercase font-mono block">Managed Desks</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono mt-1.5 block">
            {loading ? '...' : liveMetrics.managedDesks}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
            Total desk capacity
          </span>
        </div>

        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 uppercase font-mono block">Platform MRR</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1.5 block">
            {loading ? '...' : formatINR(liveMetrics.platformMRR)}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            Paid subscription run-rate
          </span>
        </div>

        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 uppercase font-mono block">
              SaaS Plans
            </span>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono mt-1.5 block">
            {loading ? '...' : liveMetrics.activePlansCount}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
            Public pricing tiers
          </span>
        </div>

        {/* 5th Card: Inbound Demo Leads */}
        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 uppercase font-mono block">Demo Leads</span>
            <PhoneCall className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono mt-1.5 block">
            {loading ? '...' : (liveMetrics.leadCounts?.total ?? liveMetrics.recentLeads.length)}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-800/80">
              {loading ? '...' : (liveMetrics.leadCounts?.pending ?? 0)} pending
            </span>
            <Link to="/super-admin/leads" className="text-[10px] text-neutral-400 hover:text-white underline">
              View all
            </Link>
          </div>
        </div>
      </div>

      {/* Architecture & Tenancy Note */}
      <div className="p-3.5 rounded-md bg-neutral-950 border border-neutral-800 flex items-start gap-3">
        <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-300">
          <span className="font-semibold text-white">Live Platform Architecture: </span>
          All tenant metrics and inbound leads are dynamically synchronized with backend REST APIs (<code className="font-mono text-[11px] text-neutral-400">/api/super-admin/demo-request/*</code>, <code className="font-mono text-[11px] text-neutral-400">/api/super-admin/subscription/*</code>).
        </div>
      </div>

      {/* Inbound Demo & Pricing Leads Section */}
      <div className="bg-neutral-950 rounded-lg border border-neutral-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white tracking-tight">
                Recent Inbound Demo & Pricing Leads
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-amber-950/60 text-amber-400 border-amber-800/80">
                Landing Page Inquiries
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Prospective library operators interested in specific tiers or general demonstrations.
            </p>
          </div>
          <Link
            to="/super-admin/leads"
            className="text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md shadow-2xs transition-colors"
          >
            <span>Manage All Leads ({liveMetrics.leadCounts?.total ?? liveMetrics.recentLeads.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-neutral-400 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
              <span>Loading inbound leads...</span>
            </div>
          ) : liveMetrics.recentLeads.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-xs space-y-1">
              <PhoneCall className="w-7 h-7 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-300 font-medium">No demo or pricing inquiries received yet.</p>
              <p className="text-neutral-500 text-[11px]">When users submit the demo form or click pricing plans, their leads will appear here instantly.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-800 bg-neutral-900/50 text-neutral-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="py-2.5 px-3">Lead Contact</th>
                  <th className="py-2.5 px-3">Study Center & City</th>
                  <th className="py-2.5 px-3">Inquired Plan / Scale</th>
                  <th className="py-2.5 px-3">Received</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {liveMetrics.recentLeads.map((lead) => {
                  const leadId = lead._id || lead.id;
                  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr key={leadId} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-2.5 px-3">
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
                              `Hello ${lead.name}, thank you for contacting Library Sathi regarding ${lead.selectedPlan || 'our software'}!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/80 text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors"
                            title="Direct WhatsApp"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-neutral-200">{lead.libraryName}</div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-neutral-500" />
                          <span>{lead.city}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] font-medium px-2 py-0.5 rounded">
                          {lead.selectedPlan || 'General Demo'}
                        </span>
                        <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                          {lead.seatCount || '50-100'} • {lead.preferredTime || 'Morning'}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-neutral-400 font-mono text-[11px]">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Recent'}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize ${
                          lead.status === 'converted'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            : lead.status === 'contacted'
                            ? 'bg-blue-950/60 text-blue-400 border-blue-800'
                            : lead.status === 'rejected'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800'
                            : 'bg-amber-950/60 text-amber-400 border-amber-800'
                        }`}>
                          {lead.status || 'pending'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <select
                          value={lead.status || 'pending'}
                          onChange={(e) => handleQuickLeadStatus(leadId, e.target.value)}
                          className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px] font-mono px-2 py-1 rounded focus:outline-none focus:border-neutral-500"
                        >
                          <option value="pending">Mark Pending</option>
                          <option value="contacted">Mark Contacted</option>
                          <option value="demo_scheduled">Scheduled</option>
                          <option value="converted">Convert Customer</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Onboarded Libraries / Subscriptions */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Recent Subscription Transactions
            </h3>
            <p className="text-xs text-slate-400">
              Latest SaaS subscriptions across tenant libraries
            </p>
          </div>
          <Link to="/super-admin/tenants" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            <span>View All {liveMetrics.activeLibraries} Libraries</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-brand-400" />
              <span>Loading metrics from live backend...</span>
            </div>
          ) : liveMetrics.recentSubscriptions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No recent subscription transactions found on the live backend.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="pb-3">Library Business</th>
                  <th className="pb-3">Admin Email</th>
                  <th className="pb-3">Plan Subscribed</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Billing Cycle</th>
                  <th className="pb-3 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {liveMetrics.recentSubscriptions.map((sub) => {
                  const adminObj = sub.adminId;
                  const libName = adminObj?.libraryName || 'Library Business';
                  const email = adminObj?.email || 'N/A';
                  const planName = sub.planId?.name || 'SaaS Plan';
                  const amt = sub.finalAmount ?? sub.totalAmount ?? 0;
                  const status = sub.paymentStatus || (sub.isActive ? 'paid' : 'pending');

                  return (
                    <tr key={sub._id || sub.id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-white">
                        <div>{libName}</div>
                        <div className="text-[10px] text-brand-400 font-mono">
                          ID: {String(sub._id || sub.id).slice(-6).toUpperCase()}
                        </div>
                      </td>
                      <td className="py-3 text-slate-300 font-mono">{email}</td>
                      <td className="py-3 text-white font-medium">{planName}</td>
                      <td className="py-3 font-mono font-bold text-emerald-400">{formatINR(amt)}</td>
                      <td className="py-3 text-slate-300 capitalize">{sub.billingCycle || 'monthly'}</td>
                      <td className="py-3 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          status === 'paid'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            : 'bg-amber-950/60 text-amber-400 border-amber-800'
                        }`}>
                          {status}
                        </span>
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
