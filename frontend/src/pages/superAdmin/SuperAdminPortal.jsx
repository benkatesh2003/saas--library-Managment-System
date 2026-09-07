import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Building2, Layers, CreditCard, Sparkles, Check, X, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import { api } from '../../services/apiClient';
import { formatINR } from '../../utils/formatters';

export function SuperAdminPortal() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [subsRes, plansRes] = await Promise.all([
          api.superAdmin.subscriptions.getAll().catch(() => ({ success: false })),
          api.superAdmin.plans.getAll().catch(() => ({ success: false }))
        ]);
        if (subsRes.success && subsRes.data?.subscriptions) {
          setSubscriptions(subsRes.data.subscriptions);
        }
        if (plansRes.success && plansRes.data?.plans) {
          setPlans(plansRes.data.plans);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-extrabold shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">Library Sathi Platform Super Admin</h1>
            <span className="text-[10px] text-slate-400 font-mono">Live Multi-Tenant Management Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/super-admin/dashboard"
            className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-950/60 border border-brand-800 px-3 py-1.5 rounded-lg"
          >
            <span>Open Modern Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Website</span>
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">Subscriptions</span>
            <span className="text-3xl font-extrabold text-white font-mono mt-1 block">
              {loading ? '...' : subscriptions.length}
            </span>
            <span className="text-[10px] text-emerald-400">Live active subscriptions</span>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">SaaS Plans</span>
            <span className="text-3xl font-extrabold text-brand-400 font-mono mt-1 block">
              {loading ? '...' : plans.length}
            </span>
            <span className="text-[10px] text-slate-500">Live configured tiers</span>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">Backend Mode</span>
            <span className="text-3xl font-extrabold text-emerald-400 font-mono mt-1 block">Live</span>
            <span className="text-[10px] text-emerald-400">Express API Port 5000</span>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">Database</span>
            <span className="text-3xl font-extrabold text-amber-400 font-mono mt-1 block">Atlas</span>
            <span className="text-[10px] text-slate-500">MongoDB Atlas Cloud</span>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Live Subscribed Library Tenants</h3>
              <p className="text-xs text-slate-400">Live records from /api/super-admin/subscription/all</p>
            </div>
            <Link to="/super-admin/subscriptions" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
              Manage Subscriptions →
            </Link>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading live records...</span>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active subscriptions found on the live backend.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="pb-3">Tenant ID</th>
                    <th className="pb-3">Library Business</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Cycle</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {subscriptions.slice(0, 10).map((sub) => (
                    <tr key={sub._id || sub.id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-mono text-brand-400 font-bold">
                        {String(sub._id || sub.id).slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 text-white font-medium">
                        {sub.adminId?.libraryName || sub.adminId?.email || 'Library Business'}
                      </td>
                      <td className="py-3 text-slate-300">{sub.planId?.name || 'Standard Tier'}</td>
                      <td className="py-3 text-slate-300 capitalize">{sub.billingCycle || 'monthly'}</td>
                      <td className="py-3 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                          {sub.paymentStatus || (sub.isActive ? 'active' : 'inactive')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
