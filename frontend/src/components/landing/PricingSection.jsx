import React, { useState } from 'react';
import { Check, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { INITIAL_PLANS } from '../../mock/mockData';
import { formatINR } from '../../utils/formatters';
import { UnverifiedBadge } from '../common/UnverifiedBadge';

export function PricingSection({ onOpenDemoModal, onSelectPlan }) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-brand-600 font-extrabold text-xs tracking-wider uppercase bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
            Transparent Subscription Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Affordable Pricing Tailored for Every Study Center
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            No hidden setup fees. Choose a plan based on your desk capacity, with free onboarding and live WhatsApp support.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-xs font-bold ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-13 h-7 bg-brand-600 rounded-full p-1 relative transition-colors focus:outline-none"
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Annual Billing
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {INITIAL_PLANS.map((plan) => {
            const price = isAnnual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
            const billedText = isAnnual ? `Billed annually (${formatINR(plan.yearlyPrice)} / yr)` : 'Billed monthly';

            return (
              <div
                key={plan._id}
                className={`rounded-3xl p-7 flex flex-col justify-between transition-all relative ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-brand-900 via-slate-900 to-slate-950 text-white shadow-2xl border-2 border-brand-500 md:-translate-y-2'
                    : 'bg-slate-50 text-slate-900 border border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-extrabold tracking-tight">{plan.name}</h3>
                    {plan.isPopular ? (
                      <span className="bg-brand-500/30 text-brand-300 text-[10px] font-bold px-2 py-0.5 rounded border border-brand-400/30">
                        {plan.maxSeats} Desks
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {plan.maxSeats} Desks
                      </span>
                    )}
                  </div>

                  <p className={`text-xs leading-relaxed mb-6 ${plan.isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-200/20">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight font-mono">
                        {formatINR(price)}
                      </span>
                      <span className={`text-xs font-semibold ${plan.isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                        / month
                      </span>
                    </div>
                    <div className={`text-[11px] mt-1 ${plan.isPopular ? 'text-brand-300' : 'text-slate-500'}`}>
                      {billedText}
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3 mb-8">
                    <div className={`text-[11px] font-bold uppercase tracking-wider ${plan.isPopular ? 'text-slate-400' : 'text-slate-600'}`}>
                      What's Included:
                    </div>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.isPopular ? 'text-brand-400' : 'text-emerald-600'}`} />
                        <span className={plan.isPopular ? 'text-slate-200' : 'text-slate-700'}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (onSelectPlan) onSelectPlan(plan);
                      else onOpenDemoModal();
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                      plan.isPopular
                        ? 'bg-brand-500 hover:bg-brand-400 text-white shadow-brand-500/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
                    }`}
                  >
                    <span>Get Started with {plan.name.split('/')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    <UnverifiedBadge type="RAZORPAY" size="xs" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
