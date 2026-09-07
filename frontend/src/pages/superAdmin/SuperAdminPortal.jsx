import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Building2, Layers, CreditCard, Sparkles, Check, X, ArrowLeft } from 'lucide-react';
import { INITIAL_PLANS } from '../../mock/mockData';
import { formatINR } from '../../utils/formatters';

export function SuperAdminPortal() {
  const [plans, setPlans] = useState(INITIAL_PLANS);

  const mockLibraries = [
    { id: "LIB-DEL-042", name: "Apex Study Library", owner: "Vikram Sharma", city: "Delhi", seats: 40, plan: "Growth (Gold)", status: "active" },
    { id: "LIB-PAT-108", name: "Lakshya Reading Hall", owner: "Sunita Choudhary", city: "Patna", seats: 120, plan: "Elite (Platinum)", status: "active" },
    { id: "LIB-KOT-250", name: "Toppers Library", owner: "Kapil Verma", city: "Kota", seats: 250, plan: "Elite (Platinum)", status: "active" },
    { id: "LIB-JAI-080", name: "Saraswati Reading Point", owner: "Ramesh Kulkarni", city: "Jaipur", seats: 80, plan: "Starter (Silver)", status: "active" },
  ];

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
            <span className="text-[10px] text-slate-400 font-mono">Multi-Tenant Management Console</span>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Website</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">Active Libraries</span>
            <span className="text-3xl font-extrabold text-white font-mono mt-1 block">524</span>
            <span className="text-[10px] text-emerald-400">+18 this month</span>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">Managed Desks</span>
            <span className="text-3xl font-extrabold text-brand-400 font-mono mt-1 block">42,850</span>
            <span className="text-[10px] text-slate-500">Across 28 cities</span>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">Platform MRR</span>
            <span className="text-3xl font-extrabold text-emerald-400 font-mono mt-1 block">₹6,28,800</span>
            <span className="text-[10px] text-emerald-400">+22% YoY</span>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">Platform Uptime</span>
            <span className="text-3xl font-extrabold text-amber-400 font-mono mt-1 block">99.98%</span>
            <span className="text-[10px] text-slate-500">All systems normal</span>
          </div>
        </div>

        {/* Onboarded Libraries Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Onboarded Library Tenants</h3>
              <p className="text-xs text-slate-400">Manage client subscriptions and capacity allotments</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="pb-3">Library Name</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Owner Contact</th>
                  <th className="pb-3">Seats</th>
                  <th className="pb-3">Active Plan</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {mockLibraries.map((lib) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
