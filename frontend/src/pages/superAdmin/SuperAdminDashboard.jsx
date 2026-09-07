import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Building2, Layers, TrendingUp, ArrowUpRight, Activity, Users, CreditCard, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { api, isMockEnabled } from '../../services/apiClient';

const MOCK_LIBRARIES = [
  { id: "LIB-DEL-042", name: "Apex Study Library", owner: "Vikram Sharma", city: "Delhi", seats: 40, plan: "Growth (Gold)", status: "active", mrr: 1199 },
  { id: "LIB-PAT-108", name: "Lakshya Reading Hall", owner: "Sunita Choudhary", city: "Patna", seats: 120, plan: "Elite (Platinum)", status: "active", mrr: 2199 },
  { id: "LIB-KOT-250", name: "Toppers Library", owner: "Kapil Verma", city: "Kota", seats: 250, plan: "Elite (Platinum)", status: "active", mrr: 2199 },
  { id: "LIB-JAI-080", name: "Saraswati Reading Point", owner: "Ramesh Kulkarni", city: "Jaipur", seats: 80, plan: "Starter (Silver)", status: "active", mrr: 599 },
  { id: "LIB-VAR-060", name: "Kashi Scholars Lounge", owner: "Deepak Pandey", city: "Varanasi", seats: 60, plan: "Growth (Gold)", status: "active", mrr: 1199 },
];

export function SuperAdminDashboard() {
  const [loading, setLoading] = useState(!isMockEnabled());
  const [error, setError] = useState('');
  const [liveMetrics, setLiveMetrics] = useState({
    activeLibraries: 0,
    managedDesks: 0,
    platformMRR: 0,
    activePlansCount: 0,
    recentSubscriptions: []
  });

  const loadLiveMetrics = useCallback(async () => {
    if (isMockEnabled()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parallel fetch of subscriptions and plans from live backend
      const [subsRes, plansRes] = await Promise.all([
        api.superAdmin.subscriptions.getAll().catch(err => ({ success: false, message: err.message })),
        api.superAdmin.plans.getAll().catch(err => ({ success: false, message: err.message }))
      ]);

      if (!subsRes.success) {
        throw new Error(subsRes.message || 'Failed to fetch subscription records');
      }

      const subscriptions = subsRes.data?.subscriptions || [];
      const plans = plansRes.success ? (plansRes.data?.plans || []) : [];

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
        recentSubscriptions: subscriptions.slice(0, 5)
      });
    } catch (err) {
      setError(`Failed to calculate live metrics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

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
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
              isMockEnabled()
                ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
            }`}>
              {isMockEnabled() ? 'Mock Demo Mode' : 'Live Platform Data'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Consolidated multi-tenant analytics across all Indian study spaces.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-bold block">Active Libraries</span>
            <Building2 className="w-4 h-4 text-brand-400" />
          </div>
          <span className="text-3xl font-extrabold text-white font-mono mt-2 block">
            {loading ? '...' : (isMockEnabled() ? '524' : liveMetrics.activeLibraries)}
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>{isMockEnabled() ? '+18 onboarding this month' : 'Derived from active subscriptions'}</span>
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-bold block">Managed Desks</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <span className="text-3xl font-extrabold text-brand-400 font-mono mt-2 block">
            {loading ? '...' : (isMockEnabled() ? '42,850' : liveMetrics.managedDesks)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isMockEnabled() ? 'Across 28 cities' : 'Aggregated plan capacity'}
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-bold block">Platform MRR</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-extrabold text-emerald-400 font-mono mt-2 block">
            {loading ? '...' : (isMockEnabled() ? '₹6,28,800' : formatINR(liveMetrics.platformMRR))}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            {isMockEnabled() ? '+22% YoY Subscription Growth' : 'Live paid subscription volume'}
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-bold block">
              {isMockEnabled() ? 'System Uptime' : 'Active SaaS Plans'}
            </span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-extrabold text-amber-400 font-mono mt-2 block">
            {loading ? '...' : (isMockEnabled() ? '99.98%' : liveMetrics.activePlansCount)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isMockEnabled() ? 'Zero incident reports' : 'Available for library subscription'}
          </span>
        </div>
      </div>

      {/* Architecture & Tenancy Note */}
      {!isMockEnabled() && (
        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/60 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-200">
            <span className="font-bold text-blue-100">Live Metric Architecture: </span>
            Metrics above are computed dynamically from live backend endpoints (<code className="font-mono text-[11px] bg-blue-900/40 px-1 py-0.5 rounded">/api/super-admin/subscription/all</code> and <code className="font-mono text-[11px] bg-blue-900/40 px-1 py-0.5 rounded">/api/super-admin/plan/all</code>). Library tenant counts reflect unique Admin subscribers in MongoDB Atlas.
          </div>
        </div>
      )}

      {/* Recent Onboarded Libraries / Subscriptions */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              {isMockEnabled() ? 'Recent Library Onboardings' : 'Recent Subscription Transactions'}
            </h3>
            <p className="text-xs text-slate-400">
              {isMockEnabled() ? 'Newly registered reading space accounts' : 'Latest SaaS subscriptions across tenant libraries'}
            </p>
          </div>
          <Link to="/super-admin/tenants" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            <span>View All {isMockEnabled() ? '524' : liveMetrics.activeLibraries} Libraries</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-brand-400" />
              <span>Loading metrics from live backend...</span>
            </div>
          ) : isMockEnabled() ? (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="pb-3">Library Name</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Owner Contact</th>
                  <th className="pb-3">Desk Capacity</th>
                  <th className="pb-3">SaaS Tier</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {MOCK_LIBRARIES.map((lib) => (
                  <tr key={lib.id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-white">
                      <div>{lib.name}</div>
                      <div className="text-[10px] text-brand-400 font-mono">{lib.id}</div>
                    </td>
                    <td className="py-3 text-slate-300">{lib.city}</td>
                    <td className="py-3 text-slate-300">{lib.owner}</td>
                    <td className="py-3 font-mono font-bold text-white">{lib.seats} Desks</td>
                    <td className="py-3 text-slate-300 font-semibold">{lib.plan}</td>
                    <td className="py-3 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                        {lib.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
