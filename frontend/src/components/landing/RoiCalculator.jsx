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
    <section id="calculator" className="py-16 bg-[#0A0A0A] text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono mb-3">
            <span>FINANCIAL IMPACT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Calculate your operational ROI.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-2">
            Most library operators lose between 10% to 15% of annual revenue to untracked shift extensions and uncollected student dues.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-neutral-950 rounded-lg border border-neutral-800 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono uppercase text-neutral-400">
                    Total Library Desks
                  </label>
                  <span className="text-lg font-bold text-white font-mono">
                    {seats} Desks
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="5"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                  <span>20</span>
                  <span>100</span>
                  <span>200</span>
                  <span>300+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono uppercase text-neutral-400">
                    Avg Monthly Fee / Shift
                  </label>
                  <span className="text-lg font-bold text-white font-mono">
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
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                  <span>₹400</span>
                  <span>₹1,000</span>
                  <span>₹1,500</span>
                  <span>₹2,000</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 space-y-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-300" />
                  <span>Calculated across 2.2 active shifts per desk</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-300" />
                  <span>Automatic fee due tracking and notifications</span>
                </div>
              </div>
            </div>

            {/* Right Results Card */}
            <div className="bg-neutral-900/90 p-5 rounded-md border border-neutral-800 text-center space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-400 block">
                  Estimated Value Recovered
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-white font-mono mt-1">
                  +{formatINR(annualBoost)} <span className="text-sm text-neutral-400 font-normal">/ yr</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  From recovered fee leakages and automated bookkeeping
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800 text-left">
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-mono block">Monthly Dues Recovered</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5 block">{formatINR(preventedLeakage)}</span>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-mono block">Admin Time Saved</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5 block">{savedHours} hrs / mo</span>
                </div>
              </div>

              <button
                onClick={onOpenDemoModal}
                className="w-full py-2.5 rounded-md bg-white hover:bg-neutral-100 text-neutral-900 font-medium text-xs transition-colors shadow-2xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
                <span>Schedule Walkthrough</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
