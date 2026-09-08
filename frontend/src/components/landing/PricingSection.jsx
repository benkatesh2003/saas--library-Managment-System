import React, { useState } from 'react';
import { Check, Sparkles, HelpCircle, ArrowRight, CreditCard } from 'lucide-react';
import { LANDING_PLANS } from '../../data/landingContent';
import { formatINR } from '../../utils/formatters';

export function PricingSection({ onOpenDemoModal, onSelectPlan }) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-16 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-mono mb-3">
            <span>TRANSPARENT PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Predictable plans for every library tier.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base mt-2">
            No setup surcharges or hidden licensing fees. Full feature set included on every tier with instant onboarding.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-xs font-medium ${!isAnnual ? 'text-neutral-900' : 'text-neutral-500'}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-11 h-6 bg-neutral-900 rounded-full p-1 relative transition-colors focus:outline-none"
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-2xs transform transition-transform ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium ${isAnnual ? 'text-neutral-900' : 'text-neutral-500'}`}>
                Annual
              </span>
              <span className="bg-neutral-100 text-neutral-700 text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-200">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
          {LANDING_PLANS.map((plan) => {
            const price = isAnnual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
            const billedText = isAnnual ? `Billed annually (${formatINR(plan.yearlyPrice)}/yr)` : 'Billed monthly';

            return (
              <div
                key={plan._id}
                className={`rounded-lg p-6 flex flex-col justify-between transition-all relative ${
                  plan.isPopular
                    ? 'bg-[#0A0A0A] text-white border border-neutral-800 shadow-sm'
                    : 'bg-white text-neutral-900 border border-neutral-200 shadow-2xs hover:border-neutral-400'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-6 bg-white text-neutral-900 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-neutral-200 shadow-2xs">
                    POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold tracking-tight">{plan.name}</h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      plan.isPopular ? 'bg-neutral-900 text-neutral-300 border-neutral-800' : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}>
                      {plan.maxSeats} Desks
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed mb-5 ${plan.isPopular ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-5 pb-5 border-b border-neutral-200/40">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-mono tracking-tight">
                        {formatINR(price)}
                      </span>
                      <span className={`text-xs ${plan.isPopular ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        /mo
                      </span>
                    </div>
                    <div className={`text-[11px] font-mono mt-1 ${plan.isPopular ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {billedText}
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-2.5 mb-6">
                    <div className={`text-[11px] font-mono uppercase tracking-wider ${plan.isPopular ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Features:
                    </div>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.isPopular ? 'text-neutral-300' : 'text-neutral-700'}`} />
                        <span className={plan.isPopular ? 'text-neutral-300' : 'text-neutral-600'}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      if (onSelectPlan) onSelectPlan(plan);
                      else onOpenDemoModal();
                    }}
                    className={`w-full py-2.5 rounded-md font-medium text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 ${
                      plan.isPopular
                        ? 'bg-white hover:bg-neutral-100 text-neutral-900'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                    }`}
                  >
                    <span>Get Started with {plan.name.split('/')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px]">
                    <CreditCard className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className={plan.isPopular ? 'text-neutral-400' : 'text-neutral-500 font-mono text-[10px]'}>
                      Razorpay Checkout • Cards & UPI
                    </span>
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
