import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Edit2, Trash2, Check, X, Shield, Users, Armchair, DollarSign, RefreshCw, AlertCircle, CheckCircle2, Power, Sparkles } from 'lucide-react';
import { api, isMockEnabled } from '../../services/apiClient';
import { mockStore } from '../../mock/mockStore';
import { formatINR } from '../../utils/formatters';

export function SuperAdminPlans() {
  const [plans, setPlans] = useState(isMockEnabled() ? mockStore.getPlans() : []);
  const [featuresList, setFeaturesList] = useState(isMockEnabled() ? mockStore.getFeatures() : []);
  const [loading, setLoading] = useState(!isMockEnabled());
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyPrice: 799,
    yearlyPrice: 7990,
    lifetimePrice: 19999,
    maxSeats: 75,
    maxStudents: 150,
    selectedFeatureIds: [],
    featuresText: ''
  });

  const loadData = useCallback(async () => {
    if (isMockEnabled()) {
      setPlans(mockStore.getPlans());
      setFeaturesList(mockStore.getFeatures());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [plansRes, featsRes] = await Promise.all([
        api.superAdmin.plans.getAll(),
        api.superAdmin.features.getAll()
      ]);

      if (plansRes && plansRes.success && plansRes.data) {
        setPlans(plansRes.data.plans || []);
      } else {
        setError(plansRes?.message || 'Failed to load subscription plans from live backend.');
      }

      if (featsRes && featsRes.success && featsRes.data) {
        setFeaturesList(featsRes.data.features || []);
      }
    } catch (err) {
      setError(`Network error loading plans: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      monthlyPrice: 799,
      yearlyPrice: 7990,
      lifetimePrice: 19999,
      maxSeats: 75,
      maxStudents: 150,
      selectedFeatureIds: [],
      featuresText: 'Seat Allocation & Visual Map\nShift Timings\nStudent Fee Receipts'
    });
    setActionError('');
    setActionSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    const mPrice = plan.pricing?.monthly ?? plan.monthlyPrice ?? 0;
    const yPrice = plan.pricing?.yearly ?? plan.yearlyPrice ?? 0;
    const lPrice = plan.pricing?.lifetime ?? plan.lifetimePrice ?? 0;

    let featIds = [];
    let featText = '';
    if (Array.isArray(plan.features)) {
      featIds = plan.features.map(f => (typeof f === 'object' && f?._id ? f._id : f));
      featText = plan.features.map(f => (typeof f === 'object' && f?.name ? f.name : String(f))).join('\n');
    }

    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      monthlyPrice: mPrice,
      yearlyPrice: yPrice,
      lifetimePrice: lPrice,
      maxSeats: plan.maxSeats ?? 50,
      maxStudents: plan.maxStudents ?? 100,
      selectedFeatureIds: featIds,
      featuresText: featText
    });
    setActionError('');
    setActionSuccess('');
    setIsModalOpen(true);
  };

  const handleToggleFeatureSelection = (fId) => {
    setFormData(prev => {
      const exists = prev.selectedFeatureIds.includes(fId);
      const updatedIds = exists
        ? prev.selectedFeatureIds.filter(id => id !== fId)
        : [...prev.selectedFeatureIds, fId];

      const featNames = updatedIds
        .map(id => featuresList.find(f => f._id === id)?.name || id)
        .filter(Boolean);

      return {
        ...prev,
        selectedFeatureIds: updatedIds,
        featuresText: featNames.join('\n')
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      if (isMockEnabled()) {
        const textFeatures = formData.featuresText
          .split('\n')
          .map(f => f.trim())
          .filter(Boolean);

        const mockPayload = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          monthlyPrice: Number(formData.monthlyPrice),
          yearlyPrice: Number(formData.yearlyPrice),
          maxSeats: Number(formData.maxSeats),
          maxStudents: Number(formData.maxStudents),
          features: textFeatures
        };

        if (editingPlan) {
          mockStore.updatePlan(editingPlan._id, mockPayload);
        } else {
          mockStore.createPlan(mockPayload);
        }
        await loadData();
        setActionSuccess(editingPlan ? 'Plan updated successfully!' : 'Plan created successfully!');
        setIsModalOpen(false);
      } else {
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          pricing: {
            monthly: Number(formData.monthlyPrice),
            yearly: Number(formData.yearlyPrice),
            lifetime: Number(formData.lifetimePrice || 0)
          },
          maxSeats: Number(formData.maxSeats),
          maxStudents: Number(formData.maxStudents),
          features: formData.selectedFeatureIds.filter(Boolean)
        };

        let res;
        if (editingPlan) {
          res = await api.superAdmin.plans.update(editingPlan._id, payload);
        } else {
          res = await api.superAdmin.plans.create(payload);
        }

        if (res && res.success) {
          await loadData();
          setActionSuccess(res.message || (editingPlan ? 'Plan updated!' : 'Plan created!'));
          setIsModalOpen(false);
        } else {
          setActionError(res?.message || res?.error || 'Failed to save subscription plan.');
        }
      }
    } catch (err) {
      setActionError(`Network error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (plan) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.superAdmin.plans.toggle(plan._id);
      if (res && res.success) {
        await loadData();
        setActionSuccess(`Plan "${plan.name}" status updated.`);
      } else {
        setActionError(res?.message || 'Failed to toggle plan status.');
      }
    } catch (err) {
      setActionError(`Network error toggling plan: ${err.message}`);
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete subscription plan tier "${plan.name}"?`)) {
      return;
    }

    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.superAdmin.plans.delete(plan._id);
      if (res && res.success) {
        await loadData();
        setActionSuccess(`Plan "${plan.name}" deleted successfully.`);
      } else {
        setActionError(res?.message || 'Cannot delete plan. It may be attached to active subscriptions.');
      }
    } catch (err) {
      setActionError(`Network error deleting plan: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">SaaS Subscription Plans</h1>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
              isMockEnabled()
                ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
            }`}>
              {isMockEnabled() ? 'Offline Mock' : '● Live Atlas'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure tiered pricing models, desk volume caps, and feature entitlements for library tenants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2.5 rounded-xl transition-colors"
            title="Refresh Plans"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Tier</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <div className="font-bold">Error loading live plans</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && plans.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Fetching live subscription plans from backend...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && plans.length === 0 && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Subscription Plans Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are currently no active or draft subscription tiers configured in the system.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
          >
            Create First Plan Tier
          </button>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const monthly = plan.pricing?.monthly ?? plan.monthlyPrice ?? 0;
          const yearly = plan.pricing?.yearly ?? plan.yearlyPrice ?? 0;
          const isPlanActive = plan.isActive !== false;

          let displayFeatures = [];
          if (Array.isArray(plan.features)) {
            displayFeatures = plan.features.map(f => {
              if (typeof f === 'object' && f !== null) return f.name || f.code || 'Feature';
              const matched = featuresList.find(item => item._id === f);
              return matched ? matched.name : String(f);
            });
          }

          return (
            <div
              key={plan._id}
              className={`bg-slate-900 rounded-3xl border ${
                plan.isPopular ? 'border-brand-500 shadow-xl shadow-brand-500/10' : 'border-slate-800'
              } p-6 flex flex-col justify-between relative ${
                !isPlanActive ? 'opacity-65' : ''
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 right-6 bg-brand-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-white">{plan.name}</h3>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isPlanActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {isPlanActive ? 'Active' : 'Draft/Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{plan.description || 'No description provided.'}</p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white font-mono">{formatINR(monthly)}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    Annual: {formatINR(yearly)} / year
                    {plan.pricing?.lifetime ? ` • Lifetime: ${formatINR(plan.pricing.lifetime)}` : ''}
                  </div>
                </div>

                {/* Capacities */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Desk Limit</span>
                    <span className="font-mono font-bold text-white">
                      {plan.maxSeats === -1 ? 'Unlimited' : `${plan.maxSeats} Desks`}
                    </span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Max Students</span>
                    <span className="font-mono font-bold text-white">
                      {plan.maxStudents === -1 ? 'Unlimited' : `${plan.maxStudents} Students`}
                    </span>
                  </div>
                </div>

                {/* Included Features */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Included Features ({displayFeatures.length})
                  </span>
                  {displayFeatures.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No features linked yet.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {displayFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-2 mt-6">
                <button
                  onClick={() => handleToggleStatus(plan)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    isPlanActive
                      ? 'text-amber-400 border-amber-900/60 bg-amber-950/30 hover:bg-amber-900/40'
                      : 'text-emerald-400 border-emerald-900/60 bg-emerald-950/30 hover:bg-emerald-900/40'
                  }`}
                  title={isPlanActive ? 'Deactivate Plan' : 'Activate Plan'}
                >
                  <Power className="w-3 h-3" />
                  <span>{isPlanActive ? 'Disable' : 'Enable'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    title="Edit Plan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingPlan ? 'Edit SaaS Plan Tier' : 'Create New SaaS Plan Tier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Plan Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Starter / Silver / Growth"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Target audience and recommended capacity"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Monthly Price (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Yearly Price (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Max Seat Capacity *</label>
                  <input
                    required
                    type="number"
                    min="-1"
                    placeholder="-1 for unlimited"
                    value={formData.maxSeats}
                    onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">-1 for unlimited seats</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Max Students *</label>
                  <input
                    required
                    type="number"
                    min="-1"
                    placeholder="-1 for unlimited"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">-1 for unlimited students</span>
                </div>
              </div>

              {/* Feature Selection from Live Catalog */}
              {featuresList.length > 0 && !isMockEnabled() && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Attach Feature Flags from Catalog
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {featuresList.map((f) => {
                      const isChecked = formData.selectedFeatureIds.includes(f._id);
                      return (
                        <label
                          key={f._id}
                          className="flex items-center gap-2 p-1.5 hover:bg-slate-900 rounded-lg cursor-pointer text-xs text-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleFeatureSelection(f._id)}
                            className="rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="font-medium">{f.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({f.code || f.type})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Textarea for mock or custom feature notes */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Features List (One per line)
                </label>
                <textarea
                  rows="3"
                  placeholder="Seat Allocation & Visual Map&#10;Shift Timings&#10;Student Fee Receipts"
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingPlan ? 'Save Changes' : 'Create Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
