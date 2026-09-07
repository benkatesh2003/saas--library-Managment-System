import React, { useState } from 'react';
import { Calculator, TrendingUp, Clock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export function RoiCalculator({ onOpenDemoModal }) {
  const [seats, setSeats] = useState(80);
  const [avgFee, setAvgFee] = useState(700);

  // Math: 80 seats * 700 * 2.2 shifts average = monthly potential
  const potentialMonthlyRevenue = Math.round(seats * avgFee * 2.2);
  const preventedLeakage = Math.round(potentialMonthlyRevenue * 0.12); // 12% average uncollected dues prevented
  const savedHours = Math.round(seats * 0.45); // 0.45 hours saved per seat per month on manual register bookkeeping
  const annualBoost = (preventedLeakage * 12) + (savedHours * 200 * 12);

  return (
    <section id="calculator" className="py-20 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-brand-300 font-extrabold text-xs tracking-wider uppercase bg-brand-900/60 border border-brand-700/60 px-3 py-1 rounded-full">
            ROI & Leakage Calculator
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
            See How Much Revenue You Are Losing to Manual Registers
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Most library owners in India lose between 10% to 15% of their fee revenue due to unmonitored overstays, untracked shift extensions, and missed follow-ups.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-700/80 p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Total Library Desks / Seats
                  </label>
                  <span className="text-xl font-extrabold text-brand-300 font-mono">
                    {seats} Seats
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="5"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>20</span>
                  <span>100</span>
                  <span>200</span>
                  <span>300+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Average Monthly Fee Per Shift
                  </label>
                  <span className="text-xl font-extrabold text-brand-300 font-mono">
                    {formatINR(avgFee)}
                  </span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  step="50"
                  value={avgFee}
                  onChange={(e) => setAvgFee(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>₹400</span>
                  <span>₹1,000</span>
                  <span>₹1,500</span>
                  <span>₹2,000</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Calculated across 2 to 3 shifts per desk</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Automated expiry due date alerts</span>
                </div>
              </div>
            </div>

            {/* Right Results Card */}
            <div className="bg-gradient-to-br from-brand-900/60 via-slate-900 to-slate-950 p-6 rounded-2xl border border-brand-500/30 text-center space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                  Estimated Annual Value Added
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono mt-1">
                  +{formatINR(annualBoost)} / yr
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  In recovered fee leakages & saved administrative labor
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-left">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Dues Recovered</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">{formatINR(preventedLeakage)}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Admin Time Saved</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">{savedHours} hrs / mo</span>
                </div>
              </div>

              <button
                onClick={onOpenDemoModal}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Saving Revenue - Book Free Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
