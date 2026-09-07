import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Sparkles,
  Shield,
  Clock,
  ArrowRight,
  AlertTriangle,
  Receipt,
  Building2,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Terminal,
  Info,
  X
} from 'lucide-react';
import { INITIAL_PLANS } from '../../mock/mockData';
import { formatINR } from '../../utils/formatters';
import { UnverifiedBadge, UnverifiedBanner } from '../../components/common/UnverifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { api, isMockEnabled } from '../../services/apiClient';

export function BillingManagement() {
  const isLive = !isMockEnabled();
  const { adminUser } = useAuth();

  // In mock mode, initialize with mock plans; in live mode, start with empty array
  const [plans, setPlans] = useState(() => (isMockEnabled() ? INITIAL_PLANS : []));
  const [plansUnavailable, setPlansUnavailable] = useState(!isMockEnabled());
  const [currentPlan, setCurrentPlan] = useState(() => (isMockEnabled() ? INITIAL_PLANS[1] : null));
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Live diagnostic state for testing backend order creation
  const [testPlanId, setTestPlanId] = useState('');
  const [testOrderLoading, setTestOrderLoading] = useState(false);
  const [testOrderResult, setTestOrderResult] = useState(null);

  const fetchPlans = async () => {
    if (isMockEnabled()) {
      setPlans(INITIAL_PLANS);
      setPlansUnavailable(false);
      setCurrentPlan(INITIAL_PLANS[1]);
      return;
    }

    try {
      const res = await api.billing.getPlans();
      if (res.success && res.data?.plans?.length) {
        setPlans(res.data.plans);
        setPlansUnavailable(false);
      } else {
        // Explicitly set unavailable state in live mode - never fall back to mock plans silently
        setPlans([]);
        setPlansUnavailable(true);
      }
    } catch (err) {
      setPlans([]);
      setPlansUnavailable(true);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Mock checkout handler
  const handleSimulatePayment = () => {
    setTimeout(() => {
      setPaymentDone(true);
      if (selectedPlanForUpgrade) {
        setCurrentPlan(selectedPlanForUpgrade);
      }
    }, 1200);
  };

  const handleCloseModal = () => {
    setIsCheckoutModalOpen(false);
    setPaymentDone(false);
    setSelectedPlanForUpgrade(null);
  };

  // Live order creation test (to inspect actual backend error from POST /api/admin/payment/create-order)
  const handleTestOrderCreation = async () => {
    setTestOrderLoading(true);
    setTestOrderResult(null);

    try {
      // Use provided ID or dummy ID
      const targetId = testPlanId.trim() || '6a9aba8ec82d005cc2975c83';
      const res = await api.billing.createOrder({ planId: targetId });
      setTestOrderResult(res);
    } catch (err) {
      setTestOrderResult({
        success: false,
        message: err.message,
        error: err.toString()
      });
    } finally {
      setTestOrderLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Disclaimer Banner */}
      {!isLive ? (
        <UnverifiedBanner type="RAZORPAY" />
      ) : (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Razorpay Live Checkout Notice</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Razorpay live checkout is currently not functional on this backend deployment. Backend order creation utilizes stub order identifiers, and the payment controller omits required schema fields for subscriptions. Real card or UPI payments cannot be processed until the backend discrepancy is intentionally resolved.
          </p>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Library Subscription & Billing</h1>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live API (Port 5000)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Mock Mode (Offline)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your Library Sathi software license, desk tier limits, and add-ons.
          </p>
        </div>

        <button
          onClick={fetchPlans}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-brand-300 px-3 py-1.5 rounded-xl shadow-xs transition-colors"
          title="Refresh billing state"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Sync Status</span>
        </button>
      </div>

      {/* Current Active Plan Card */}
      <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-brand-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-brand-500/30 text-brand-300 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-brand-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Current License</span>
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isLive ? 'Active Account' : 'Paid & Active'}</span>
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isLive ? (adminUser?.admin?.libraryName || 'Library Sathi Tenant') : `${currentPlan?.name || 'Gold Pro'} Plan`}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mt-1">
            {isLive
              ? `Registered administrator account for ${adminUser?.admin?.email || 'admin'}. License status is managed by platform Super Administrator.`
              : `Enables up to ${currentPlan?.maxSeats || 150} visual desks, multi-shift timings, digital lockers, and computerized fee invoices.`}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-mono text-slate-300">
            <div>Library ID: <strong className="text-brand-300">{adminUser?.admin?.libraryId || 'LIB-001'}</strong></div>
            <div>•</div>
            <div>Billing Tier: <strong className="text-white">{isLive ? (adminUser?.admin?.subscriptionId ? 'Custom Plan' : 'Standard SaaS') : 'Growth / Gold'}</strong></div>
            <div>•</div>
            <div>Status: <strong className="text-emerald-400 font-bold">{adminUser?.admin?.isActive !== false ? 'Active' : 'Suspended'}</strong></div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="text-left md:text-right">
            <span className="text-[10px] text-slate-400 block font-mono">Tenant Reference</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {adminUser?.admin?._id ? `#TENANT-${adminUser.admin._id.slice(-6).toUpperCase()}` : '#ORD-948123-VERIFIED'}
            </span>
          </div>
          <div className="pt-2">
            <UnverifiedBadge type="RAZORPAY" size="xs" />
          </div>
        </div>
      </div>

      {/* Available Tier Upgrades / Plan Catalog Section */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">Subscription Plans & Tiers</h3>
          <p className="text-xs text-slate-500">License tiers and capacity upgrades.</p>
        </div>

        {/* LIVE MODE: Explicit Plan Catalog Unavailable State */}
        {isLive && plansUnavailable ? (
          <div className="space-y-6">
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">Plan Catalog Unavailable in Live Mode</h4>
              <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                No authorized live plan catalog route exists for library administrators on the backend (the endpoint <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">/api/super-admin/plan/all</code> requires Super Admin authorization, and <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">/api/admin/plan/all</code> is not implemented).
              </p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                Per project constraints, mock plans are strictly hidden in live mode to avoid presenting false data.
              </p>
            </div>

            {/* Live Backend Order Creation Diagnostic */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand-400" />
                  <h4 className="text-xs font-extrabold tracking-wider uppercase text-brand-300">
                    Live Backend Payment Endpoint Diagnostic
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">POST /api/admin/payment/create-order</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Test the live <code className="text-brand-300 font-mono">create-order</code> endpoint with the current admin session to inspect the exact backend response.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Optional Plan ID (defaults to test plan in DB)"
                  value={testPlanId}
                  onChange={(e) => setTestPlanId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={handleTestOrderCreation}
                  disabled={testOrderLoading}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                >
                  {testOrderLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Requesting...</span>
                    </>
                  ) : (
                    <span>Test Create Order</span>
                  )}
                </button>
              </div>

              {testOrderResult && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">Actual Backend Response:</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      testOrderResult.success
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {testOrderResult.success ? 'Success' : 'Rejected'}
                    </span>
                  </div>
                  <pre className="p-3 bg-black/60 rounded-xl text-[11px] font-mono text-slate-200 overflow-x-auto border border-slate-800 max-h-48">
                    {JSON.stringify(testOrderResult, null, 2)}
                  </pre>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Notice: Backend controller creates a Subscription record omitting required schema fields (<code className="text-rose-400 font-mono">billingCycle</code>, <code className="text-rose-400 font-mono">totalAmount</code>, <code className="text-rose-400 font-mono">finalAmount</code>), which Mongoose rejects during validation.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* MOCK MODE: Fully Functional Mock Plans Catalog */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = currentPlan && plan._id === currentPlan._id;
              return (
                <div
                  key={plan._id}
                  className={`bg-white rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                    isCurrent ? 'border-2 border-brand-600 shadow-md' : 'border-slate-200 shadow-xs hover:border-brand-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-bold text-slate-900">{plan.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-extrabold font-mono text-slate-900 mb-1">
                      {formatINR(plan.monthlyPrice)} <span className="text-xs font-normal text-slate-500">/ mo</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{plan.description}</p>

                    <div className="space-y-2 border-t border-slate-100 pt-3 mb-6">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={isCurrent}
                    onClick={() => {
                      setSelectedPlanForUpgrade(plan);
                      setIsCheckoutModalOpen(true);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name.split('/')[0]}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Simulated Checkout (Mock Mode Only) */}
      {isCheckoutModalOpen && selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            {paymentDone ? (
              <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Upgrade Successful!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your library has been upgraded to <strong className="text-slate-800">{selectedPlanForUpgrade.name}</strong>.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Checkout Preview</h3>
                    <span className="text-[10px] text-slate-400">Order ID: ORD_MOCK_48912</span>
                  </div>
                  <UnverifiedBadge type="RAZORPAY" size="xs" />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Tier:</span>
                    <span className="font-bold text-slate-900">{selectedPlanForUpgrade.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly License:</span>
                    <span className="font-mono font-bold text-slate-900">{formatINR(selectedPlanForUpgrade.monthlyPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capacity:</span>
                    <span className="font-semibold text-slate-800">{selectedPlanForUpgrade.maxSeats} Desks</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  ⚠️ <strong>Mock Checkout Mode:</strong> Razorpay integration is simulated locally. Clicking the button below simulates instant payment verification without charging any card.
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSimulatePayment}
                    className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
                  >
                    Simulate Payment ({formatINR(selectedPlanForUpgrade.monthlyPrice)})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
