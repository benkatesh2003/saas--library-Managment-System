import React, { useState, useEffect, useCallback } from 'react';
import { Sliders, Plus, Search, Check, X, Shield, Edit2, Trash2, Power, Sparkles, Tag, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/apiClient';
import { formatINR } from '../../utils/formatters';

export function SuperAdminFeatures() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    type: 'addon',
    monthlyPrice: 299,
    yearlyPrice: 2990
  });

  const loadFeatures = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.superAdmin.features.getAll();
      if (res && res.success && res.data) {
        setFeatures(res.data.features || []);
      } else {
        setError(res?.message || 'Failed to fetch features from live backend.');
      }
    } catch (err) {
      setError(`Network error loading features: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleToggleStatus = async (feat) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.superAdmin.features.toggle(feat._id);
      if (res && res.success) {
        await loadFeatures();
        setActionSuccess(`Feature "${feat.name}" status toggled.`);
      } else {
        setActionError(res?.message || 'Failed to toggle feature status.');
      }
    } catch (err) {
      setActionError(`Network error toggling feature: ${err.message}`);
    }
  };


  const handleOpenCreate = () => {
    setEditingFeature(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      type: 'addon',
      monthlyPrice: 299,
      yearlyPrice: 2990
    });
    setActionError('');
    setActionSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (feat) => {
    setEditingFeature(feat);
    setFormData({
      name: feat.name || '',
      code: feat.code || '',
      description: feat.description || '',
      type: feat.type || 'addon',
      monthlyPrice: feat.pricing?.monthly ?? 0,
      yearlyPrice: feat.pricing?.yearly ?? 0
    });
    setActionError('');
    setActionSuccess('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        pricing: {
          monthly: Number(formData.monthlyPrice),
          yearly: Number(formData.yearlyPrice),
          lifetime: 0
        }
      };

      let res;
      if (editingFeature) {
        res = await api.superAdmin.features.update(editingFeature._id, payload);
      } else {
        res = await api.superAdmin.features.create(payload);
      }

      if (res && res.success) {
        await loadFeatures();
        setActionSuccess(res.message || (editingFeature ? 'Feature updated!' : 'Feature created!'));
        setIsModalOpen(false);
      } else {
        setActionError(res?.message || res?.error || 'Failed to save feature.');
      }
    } catch (err) {
      setActionError(`Network error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (feat) => {
    if (!window.confirm(`Are you sure you want to delete feature flag "${feat.name}"?`)) {
      return;
    }

    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.superAdmin.features.delete(feat._id);
      if (res && res.success) {
        await loadFeatures();
        setActionSuccess(`Feature "${feat.name}" deleted successfully.`);
      } else {
        setActionError(res?.message || 'Cannot delete feature as it is currently used in one or more plans.');
      }
    } catch (err) {
      setActionError(`Network error deleting feature: ${err.message}`);
    }
  };

  const filtered = features.filter((feat) => {
    const matchesSearch =
      feat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feat.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (feat.description && feat.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || feat.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Feature Flags & Modules</h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase bg-emerald-950/60 text-emerald-400 border-emerald-800">
              ● Live Atlas (Port 5000)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Globally enable, disable, or package feature modules for library tenants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadFeatures}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2.5 rounded-xl transition-colors"
            title="Refresh Features"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Feature Flag</span>
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
            <div className="font-bold">Error loading live features</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by module name, code (e.g. FEAT-001), or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
          {['all', 'basic', 'premium', 'addon'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                selectedType === t
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && features.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Fetching live feature flags from backend...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Feature Flags Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || selectedType !== 'all'
                ? 'No features match your current search and filter criteria.'
                : 'There are currently no feature flags configured in the system.'}
            </p>
          </div>
          {(!searchTerm && selectedType === 'all') && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
            >
              Add First Feature Flag
            </button>
          )}
        </div>
      )}

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((feat) => {
          const isFeatActive = feat.isActive !== false;
          return (
            <div
              key={feat._id}
              className={`bg-slate-900 rounded-2xl border ${
                isFeatActive ? 'border-slate-800' : 'border-slate-800/50 opacity-60'
              } p-5 flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
                          feat.type === 'basic' || feat.type === 'core'
                            ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                            : feat.type === 'premium' || feat.type === 'enterprise'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-brand-950 text-brand-400 border border-brand-800'
                        }`}
                      >
                        {feat.type}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isFeatActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {isFeatActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">{feat.name}</h3>
                    <div className="text-[10px] text-brand-400 font-mono mt-0.5">{feat.code}</div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(feat)}
                    title={isFeatActive ? 'Module is Active (Click to Disable)' : 'Module is Disabled (Click to Enable)'}
                    className={`p-2 rounded-xl transition-all ${
                      isFeatActive
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {feat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Standalone Add-on Price</span>
                  <span className="font-mono font-bold text-white">
                    {feat.pricing?.monthly ? `${formatINR(feat.pricing.monthly)}/mo` : 'Included in Plan'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(feat)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Feature"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(feat)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors"
                    title="Delete Feature"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add or Edit Feature */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingFeature ? 'Edit Feature Flag' : 'Create New Feature Flag'}
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
                <label className="text-xs font-bold text-slate-300 block mb-1">Feature Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Automated WhatsApp Alerts"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Module Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="basic">Basic (Core Included)</option>
                  <option value="premium">Premium Feature</option>
                  <option value="addon">Add-On Module</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Detailed function description for the module..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Monthly Addon Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Yearly Addon Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
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
                  <span>{editingFeature ? 'Update Flag' : 'Save Feature'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
