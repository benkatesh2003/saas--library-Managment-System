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
import { formatINR } from '../../utils/formatters';
import { UnverifiedBadge, UnverifiedBanner } from '../../components/common/UnverifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';

export function BillingManagement() {
  const { adminUser } = useAuth();

  const [plans, setPlans] = useState([]);
  const [plansUnavailable, setPlansUnavailable] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);

  // Live diagnostic state for testing backend order creation
  const [testPlanId, setTestPlanId] = useState('');
  const [testOrderLoading, setTestOrderLoading] = useState(false);
  const [testOrderResult, setTestOrderResult] = useState(null);

  const fetchPlans = async () => {
    try {
      const res = await api.billing.getPlans();
      if (res.success && res.data?.plans?.length) {
        setPlans(res.data.plans);
        setPlansUnavailable(false);
      } else {
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

  // Live diagnostic test handler
  const handleTestCreateOrder = async (e) => {
    e.preventDefault();
    setTestOrderLoading(true);
    setTestOrderResult(null);

    const payload = {
      planId: testPlanId.trim() || 'dummy_plan_test',
      billingCycle: 'monthly'
    };

    try {
      const res = await api.billing.createOrder(payload);
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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Library Subscription & Billing</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live API (Port 5000)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your Library Sathi software license, desk tier limits, and add-ons.
          </p>
        </div>

        <button
          onClick={fetchPlans}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Active License Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {currentPlan ? currentPlan.name : 'Subscription Managed Via Platform Super Admin'}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Verified Tenant</span>
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {adminUser?.admin?.libraryName || 'Apex Study Library & Reading Lounge'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Account: {adminUser?.admin?.email || 'admin@apexlibrary.in'}</span>
                <span>•</span>
                <span>ID: {adminUser?.admin?.libraryId || 'LIB-DEL-042'}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-1 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Monthly Billing Cycle</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Building2 className="w-4 h-4 text-brand-400" />
                <span>Capacity: Tier Allocation Enabled</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/80 min-w-56 space-y-3">
            <div className="text-xs text-slate-400">Payment Gateway Status</div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-400" />
              <span>Razorpay Live Orders</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Order creation is handled by the live backend.
            </p>
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

        {plansUnavailable ? (
          <div className="space-y-6">
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">Plan Catalog Managed Via Super Admin</h4>
              <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                No public plan catalog browsing route exists for library administrators on the backend (the endpoint <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">/api/super-admin/plan/all</code> is reserved for Super Admin authorization). Plans are configured platform-wide by the Super Admin.
              </p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                All data in live mode is connected directly to the backend Express server.
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

              <form onSubmit={handleTestCreateOrder} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter a Plan MongoDB _id (optional, or send test ID)"
                  value={testPlanId}
                  onChange={(e) => setTestPlanId(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={testOrderLoading}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {testOrderLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Calling Live API...</span>
                    </>
                  ) : (
                    <>
                      <span>Send POST Request</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {testOrderResult && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">Backend Response Status:</span>
                    <span className={testOrderResult.success ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {testOrderResult.success ? '200 / Success' : 'Error Response'}
                    </span>
                  </div>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                    {JSON.stringify(testOrderResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : (
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
                      {(plan.features || []).slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{typeof f === 'string' ? f : f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
