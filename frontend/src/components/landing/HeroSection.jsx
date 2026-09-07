import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Play, Sparkles, ShieldCheck, Users, Calendar, LayoutGrid, Award } from 'lucide-react';
import { UnverifiedBadge } from '../common/UnverifiedBadge';

export function HeroSection({ onOpenDemoModal }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-brand-50/60 via-white to-slate-50">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-200/40 via-indigo-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-bold tracking-wide shadow-sm animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>#1 Cloud Software for Indian Reading Rooms & Co-Working Hubs</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Run Your Library with Zero Confusion & <span className="text-gradient-purple">100% Occupancy</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Eliminate shift overlapping, track student fee dues automatically, manage visual seat layouts, and issue computerized GST receipts from one powerful, modern admin panel.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onOpenDemoModal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 text-white font-bold text-sm shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>Book a 1-on-1 Free Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/admin/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-slate-300 hover:border-brand-300 text-slate-800 hover:text-brand-600 font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <LayoutGrid className="w-4 h-4 text-brand-600" />
              <span>Explore Live Admin Portal</span>
            </Link>
          </div>

          {/* Quick Value Props */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No credit card required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant 2-minute setup</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mobile, Tablet & PC friendly</span>
            </span>
          </div>
        </div>

        {/* Hero Interactive Mockup Showcase */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="relative rounded-2xl p-2 bg-gradient-to-b from-slate-200 to-slate-300/60 shadow-2xl border border-slate-200">
            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-inner">
              {/* Browser Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-slate-400">librarysathi.in/admin/dashboard</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Simulation</span>
                  </span>
                  <span className="font-semibold text-slate-300">Apex Study Lounge, Delhi</span>
                </div>
              </div>

              {/* Dashboard Preview Body */}
              <div className="p-4 sm:p-6 bg-slate-900 grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Stats & Occupancy (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[11px] text-slate-400 block font-medium">Total Seats</span>
                      <span className="text-xl font-extrabold text-white mt-0.5 block">40 Desks</span>
                      <span className="text-[10px] text-emerald-400 font-medium">● 84% Occupancy</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[11px] text-slate-400 block font-medium">Active Students</span>
                      <span className="text-xl font-extrabold text-white mt-0.5 block">118 Members</span>
                      <span className="text-[10px] text-brand-300 font-medium">+12 this week</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[11px] text-slate-400 block font-medium">Monthly Collection</span>
                      <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">₹1,42,800</span>
                      <span className="text-[10px] text-slate-400 font-medium">₹8,400 due</span>
                    </div>
                  </div>

                  {/* Visual Seat Grid Mini Preview */}
                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Floor 1 - Live Shift Matrix</span>
                        <span className="bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] px-2 py-0.5 rounded font-medium">
                          Morning Shift (06:00 - 12:00)
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Vacant</span>
                        <span className="flex items-center gap-1 text-brand-300"><span className="w-2 h-2 rounded-full bg-brand-500" /> Occupied</span>
                        <span className="flex items-center gap-1 text-amber-300"><span className="w-2 h-2 rounded-full bg-amber-500" /> Reserved</span>
                      </div>
                    </div>

                    {/* Seat Mini Blocks */}
                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                      {Array.from({ length: 20 }, (_, idx) => {
                        const num = idx + 1;
                        const isOcc = num % 3 === 0;
                        const isRes = num === 7 || num === 14;
                        const colorClass = isOcc ? 'bg-brand-600/90 text-white' : (isRes ? 'bg-amber-500/90 text-white' : 'bg-emerald-600/80 text-white');
                        return (
                          <div
                            key={idx}
                            className={`h-8 rounded flex items-center justify-center font-mono text-[10px] font-bold shadow-sm transition-transform hover:scale-105 cursor-pointer ${colorClass}`}
                            title={`Seat S-${num < 10 ? '0' + num : num}`}
                          >
                            S{num}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Recent Admissions / Activity (5 cols) */}
                <div className="lg:col-span-5 bg-slate-800/70 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-200">Today's Quick Admissions</span>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Auto-Receipt Sent</span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { name: "Rahul Kumar", seat: "S-03", shift: "Morning", fee: "₹1,800", status: "Paid" },
                        { name: "Priya Sharma", seat: "S-06", shift: "Afternoon", fee: "₹600", status: "Paid" },
                        { name: "Amit Patel", seat: "S-01", shift: "Full Day", fee: "₹3,800", status: "Due" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-700/40 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-600/40 text-brand-300 font-bold flex items-center justify-center text-[11px]">
                              {item.name[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-100 text-[11px]">{item.name}</div>
                              <div className="text-[10px] text-slate-400">{item.seat} • {item.shift}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-slate-200 text-[11px]">{item.fee}</div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              item.status === 'Paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Shift Timings Automation Active</span>
                    <Link to="/admin/dashboard" className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
                      <span>Enter Admin Panel</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Numbers & Trust Counter */}
        <div className="mt-14 pt-10 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">500+</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Libraries Across India</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-600">50,000+</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Students Managed Daily</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">99.9%</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Uptime Cloud SLA</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-500">4.9 / 5 ★</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Library Owner Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
}
