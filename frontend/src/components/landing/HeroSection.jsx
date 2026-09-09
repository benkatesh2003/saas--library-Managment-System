import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Play, Sparkles, ShieldCheck, Users, Calendar, LayoutGrid, Award } from 'lucide-react';
import { UnverifiedBadge } from '../common/UnverifiedBadge';

export function HeroSection({ onOpenDemoModal }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 bg-[#FAFAFA] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs font-medium shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px] text-neutral-500">v2.0 RELEASE</span>
            <span className="text-neutral-300">|</span>
            <span>Cloud Infrastructure for Reading Rooms & Co-Working Hubs</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight leading-[1.12]">
            Run your library with zero friction and maximum occupancy.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-neutral-500 leading-relaxed max-w-2xl mx-auto font-normal">
            Eliminate shift collisions, track overdue student fees automatically, manage visual seat layouts, and issue computerized GST receipts from one unified admin console.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenDemoModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-neutral-900 text-white font-medium text-xs sm:text-sm hover:bg-neutral-800 transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              <span>Book a 1-on-1 Free Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <Link
              to="/admin/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-white border border-neutral-300 text-neutral-800 font-medium text-xs sm:text-sm hover:bg-neutral-50 transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-neutral-600" />
              <span>Explore Live Admin Portal</span>
            </Link>
          </div>

          {/* Quick Value Props */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800" />
              <span>No credit card required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800" />
              <span>Instant 2-minute setup</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800" />
              <span>Mobile, Tablet & Desktop responsive</span>
            </span>
          </div>
        </div>

        {/* Hero Interactive Mockup Showcase */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="rounded-lg overflow-hidden bg-[#0A0A0A] border border-neutral-800 text-white shadow-sm">
            {/* Browser Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="ml-2 font-mono text-[11px] text-neutral-400">librarysathi.in/admin/dashboard</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[10px]">PRODUCTION READY</span>
                </span>
                <span className="font-medium text-neutral-300">Apex Study Lounge, Delhi</span>
              </div>
            </div>

            {/* Dashboard Preview Body */}
            <div className="p-4 sm:p-6 bg-[#0A0A0A] grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Stats & Occupancy (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-neutral-900/90 p-3 rounded-md border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block uppercase font-mono tracking-wider">Total Seats</span>
                    <span className="text-xl font-bold text-white mt-1 block font-mono">40</span>
                    <span className="text-[10px] text-emerald-400 font-mono">84% Occupancy</span>
                  </div>
                  <div className="bg-neutral-900/90 p-3 rounded-md border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block uppercase font-mono tracking-wider">Active Students</span>
                    <span className="text-xl font-bold text-white mt-1 block font-mono">118</span>
                    <span className="text-[10px] text-neutral-400 font-mono">+12 this week</span>
                  </div>
                  <div className="bg-neutral-900/90 p-3 rounded-md border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block uppercase font-mono tracking-wider">Monthly Revenue</span>
                    <span className="text-xl font-bold text-emerald-400 mt-1 block font-mono">₹1,42,800</span>
                    <span className="text-[10px] text-neutral-500 font-mono">₹8,400 due</span>
                  </div>
                </div>

                {/* Visual Seat Grid Mini Preview */}
                <div className="bg-neutral-900/60 p-3.5 rounded-md border border-neutral-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-neutral-200">Floor 1 • Shift Matrix</span>
                      <span className="bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] px-1.5 py-0.5 rounded font-mono">
                        06:00 - 12:00
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Vacant</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Occupied</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Reserved</span>
                    </div>
                  </div>

                  {/* Seat Mini Blocks */}
                  <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                    {Array.from({ length: 20 }, (_, idx) => {
                      const num = idx + 1;
                      const isOcc = num % 3 === 0;
                      const isRes = num === 7 || num === 14;
                      const colorClass = isOcc
                        ? 'bg-[#171B26] text-blue-300 border border-[#2E384D] font-bold'
                        : (isRes
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80 font-bold'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 font-bold');
                      return (
                        <div
                          key={idx}
                          className={`h-7 rounded flex items-center justify-center font-mono text-[9px] font-bold transition-all ${colorClass}`}
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
              <div className="lg:col-span-5 bg-neutral-900/60 p-3.5 rounded-md border border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-medium text-neutral-200">Today's Admissions</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">Auto-Receipt Sent</span>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { name: "Rahul Kumar", seat: "S-03", shift: "Morning", fee: "₹1,800", status: "Paid" },
                      { name: "Priya Sharma", seat: "S-06", shift: "Afternoon", fee: "₹600", status: "Paid" },
                      { name: "Amit Patel", seat: "S-01", shift: "Full Day", fee: "₹3,800", status: "Due" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-neutral-950/60 border border-neutral-800/80 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px] flex items-center justify-center">
                            {item.name[0]}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-200 text-xs">{item.name}</div>
                            <div className="text-[10px] text-neutral-400 font-mono font-medium">{item.seat} • {item.shift}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-neutral-200 text-xs">{item.fee}</div>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            item.status === 'Paid' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-neutral-500 font-mono">Shift Engine Active</span>
                  <Link to="/admin/dashboard" className="text-[11px] text-neutral-300 hover:text-white font-medium flex items-center gap-1 transition-colors">
                    <span>Enter Console</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Numbers & Trust Counter */}
        <div className="mt-12 pt-8 border-t border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 tracking-tight">500+</div>
            <div className="text-xs text-neutral-500 mt-1">Study Centers Powered</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 tracking-tight">50,000+</div>
            <div className="text-xs text-neutral-500 mt-1">Students Managed Daily</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 tracking-tight">99.9%</div>
            <div className="text-xs text-neutral-500 mt-1">System Uptime SLA</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 tracking-tight">4.9 / 5.0</div>
            <div className="text-xs text-neutral-500 mt-1">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
}
