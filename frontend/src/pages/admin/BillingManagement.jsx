import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Check,
  Sparkles,
  Shield,
  Clock,
  ArrowRight,
  AlertTriangle,
  Building2,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';
import { useRazorpay } from '../../hooks/useRazorpay';

export function BillingManagement() {
  const { adminUser } = useAuth();
  const { openCheckout } = useRazorpay();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const res = await api.billing.getPlans();
      if (res.success && res.data?.plans?.length) {
        setPlans(res.data.plans);
      } else {
        setPlans([]);
      }
    } catch (err) {
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSubscribe = async (plan) => {
    setSubscribingPlanId(plan._id);
    setFeedback(null);

    try {
      const orderRes = await api.billing.createOrder({
        planId: plan._id,
        billingCycle,
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to initialize payment order');
      }

      const { orderId, amount, currency, key, planName } = orderRes.data;

      openCheckout({
        key,
        orderId,
        amount,
        currency,
        name: 'Library Sathi',
        description: `${planName || plan.name} Subscription (${billingCycle})`,
        prefill: {
          name: adminUser?.admin?.libraryName || adminUser?.admin?.firstName || '',
          email: adminUser?.admin?.email || '',
          phone: adminUser?.admin?.phone || '',
        },
        theme: { color: '#4f46e5' },
        onSuccess: async (response) => {
          try {
            setFeedback({ type: 'info', message: 'Verifying payment signature with backend...' });
            const verifyRes = await api.billing.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setFeedback({
                type: 'success',
                message: `Payment successful! Your library is now subscribed to the ${plan.name} plan.`,
              });
              await fetchPlans();
            } else {
              setFeedback({
                type: 'error',
                message: verifyRes.message || 'Payment signature verification failed.',
              });
            }
          } catch (verErr) {
            setFeedback({
              type: 'error',
              message: `Verification error: ${verErr.message}`,
            });
          } finally {
            setSubscribingPlanId(null);
          }
        },
        onError: (err) => {
          setFeedback({
            type: 'error',
            message: err.description || err.message || 'Payment was cancelled or failed.',
          });
          setSubscribingPlanId(null);
        },
        onDismiss: () => {
          setSubscribingPlanId(null);
        },
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Could not initiate Razorpay payment.',
      });
      setSubscribingPlanId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Library Subscription & Billing</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
              <Zap className="w-3 h-3 text-neutral-900" />
              Razorpay Secured
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your Library Sathi software license, desk tier limits, and online gateway.
          </p>
        </div>

        <button
          onClick={fetchPlans}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-md text-xs font-medium text-neutral-700 shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingPlans ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-md flex items-start gap-2.5 border text-xs leading-relaxed transition-all ${
            feedback.type === 'success'
              ? 'bg-neutral-50 border-neutral-200 text-neutral-900'
              : feedback.type === 'info'
              ? 'bg-neutral-50 border-neutral-200 text-neutral-900'
              : 'bg-rose-50/50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : feedback.type === 'info' ? (
            <RefreshCw className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5 animate-spin" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.message}</div>
          <button
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-neutral-600 text-xs font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Active License Card */}
      <div className="bg-[#0A0A0A] text-white rounded-lg p-6 shadow-sm border border-neutral-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase font-medium bg-neutral-800 text-neutral-200 border border-neutral-700">
                {adminUser?.admin?.subscriptionId ? 'Active Subscription' : 'Standard License'}
              </span>
              <span className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Tenant</span>
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                {adminUser?.admin?.libraryName || 'Apex Study Library & Reading Lounge'}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 font-mono flex items-center gap-2">
                <span>{adminUser?.admin?.email || 'admin@librarysathi.in'}</span>
                <span>•</span>
                <span>ID: {adminUser?.admin?._id ? `LIB-${adminUser.admin._id.slice(-6).toUpperCase()}` : 'LIB-001'}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-1 text-xs">
              <div className="flex items-center gap-1.5 text-neutral-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Instant Auto-Activation</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400 font-mono">
                <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Razorpay Gateway Verified</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 p-4 rounded-md border border-neutral-800 min-w-52 space-y-2">
            <div className="text-[11px] text-neutral-400 font-mono uppercase">Payment Gateway</div>
            <div className="text-base font-semibold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-neutral-300" />
              <span>Razorpay Live</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
              UPI, Cards, NetBanking, and Wallets supported.
            </p>
          </div>
        </div>
      </div>

      {/* Available Tier Upgrades / Plan Catalog Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Subscription Plans & Tiers</h3>
            <p className="text-xs text-neutral-500">Choose a plan that fits your study space capacity.</p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex p-0.5 bg-neutral-100 rounded-md border border-neutral-200 text-xs font-medium self-start">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 rounded transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1 rounded transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Yearly <span className="text-[10px] text-emerald-600 font-mono ml-1 font-semibold">Save ~15%</span>
            </button>
          </div>
        </div>

        {loadingPlans ? (
          <div className="p-12 text-center bg-white rounded-lg border border-neutral-200">
            <RefreshCw className="w-5 h-5 text-neutral-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-neutral-500">Loading subscription plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-neutral-200 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-neutral-900">No Active Plans Available</h4>
            <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
              No subscription plans have been configured yet by the Super Admin. Once plans are published, they will appear here with instant Razorpay checkout.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const price = plan.pricing
                ? plan.pricing[billingCycle] || plan.pricing.monthly || 0
                : plan.monthlyPrice || 0;

              const isSubscribing = subscribingPlanId === plan._id;

              return (
                <div
                  key={plan._id}
                  className="bg-white rounded-lg p-5 border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-neutral-900">{plan.name}</h4>
                      {plan.discount?.percentage > 0 && (
                        <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {plan.discount.percentage}% OFF
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-semibold font-mono text-neutral-900 mb-1">
                      {formatINR(price)}{' '}
                      <span className="text-xs font-normal text-neutral-500">
                        / {billingCycle === 'yearly' ? 'year' : 'mo'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed mb-4">{plan.description}</p>

                    <div className="space-y-2 border-t border-neutral-100 pt-3 mb-6">
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                        <span>
                          Capacity:{' '}
                          {plan.maxStudents === -1 ? 'Unlimited Students' : `Up to ${plan.maxStudents} Students`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                        <span>
                          Seats: {plan.maxSeats === -1 ? 'Unlimited Seats' : `Up to ${plan.maxSeats} Desks`}
                        </span>
                      </div>
                      {(plan.features || []).slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-neutral-600">
                          <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                          <span>{typeof f === 'string' ? f : f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isSubscribing}
                    className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isSubscribing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Opening Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Subscribe with Razorpay</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
