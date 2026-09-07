import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Search, Plus, Check, X, ShieldAlert, Power, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { api, isMockEnabled } from '../../services/apiClient';

const MOCK_TENANTS_INITIAL = [
  { id: "LIB-DEL-042", name: "Apex Study Library", owner: "Vikram Sharma", phone: "9876543210", city: "Delhi", seats: 40, plan: "Growth (Gold)", status: "active", joined: "2024-01-15" },
  { id: "LIB-PAT-108", name: "Lakshya Reading Hall", owner: "Sunita Choudhary", phone: "9811223344", city: "Patna", seats: 120, plan: "Elite (Platinum)", status: "active", joined: "2024-03-20" },
  { id: "LIB-KOT-250", name: "Toppers Library", owner: "Kapil Verma", phone: "9822334455", city: "Kota", seats: 250, plan: "Elite (Platinum)", status: "active", joined: "2024-02-10" },
  { id: "LIB-JAI-080", name: "Saraswati Reading Point", owner: "Ramesh Kulkarni", phone: "9833445566", city: "Jaipur", seats: 80, plan: "Starter (Silver)", status: "active", joined: "2024-04-05" },
  { id: "LIB-VAR-060", name: "Kashi Scholars Lounge", owner: "Deepak Pandey", phone: "9844556677", city: "Varanasi", seats: 60, plan: "Growth (Gold)", status: "active", joined: "2024-05-12" },
  { id: "LIB-LUK-110", name: "Awadh Study Center", owner: "Mohd Rizwan", phone: "9855667788", city: "Lucknow", seats: 110, plan: "Growth (Gold)", status: "suspended", joined: "2024-06-01" },
];

export function SuperAdminTenants() {
  const [tenants, setTenants] = useState(isMockEnabled() ? MOCK_TENANTS_INITIAL : []);
  const [loading, setLoading] = useState(!isMockEnabled());
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLibName, setNewLibName] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newSeats, setNewSeats] = useState(50);

  const loadTenants = useCallback(async () => {
    if (isMockEnabled()) {
      setTenants(MOCK_TENANTS_INITIAL);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.superAdmin.subscriptions.getAll();
      if (res && res.success && res.data) {
        const subs = res.data.subscriptions || [];
        // Derive unique tenant libraries from subscription data
        const tenantMap = new Map();
        subs.forEach((sub) => {
          const adminObj = sub.adminId;
          const adminId = adminObj?._id || adminObj?.id || sub.adminId;
          if (!adminId) return;

          if (!tenantMap.has(adminId)) {
            const libName = adminObj?.libraryName || 'Library Business';
            const email = adminObj?.email || 'N/A';
            const planName = sub.planId?.name || 'SaaS Subscription';
            const isSubActive = sub.isActive || sub.paymentStatus === 'paid';

            tenantMap.set(adminId, {
              id: `TEN-${String(adminId).slice(-6).toUpperCase()}`,
              name: libName,
              owner: adminObj?.fullName || email.split('@')[0],
              email: email,
              city: 'Regional Hub',
              seats: sub.planId?.maxSeats && sub.planId?.maxSeats !== -1 ? sub.planId.maxSeats : 'Unlimited',
              plan: planName,
              status: isSubActive ? 'active' : 'pending',
              paymentStatus: sub.paymentStatus,
              billingCycle: sub.billingCycle,
              joined: sub.createdAt ? sub.createdAt.split('T')[0] : 'N/A',
              rawId: adminId
            });
          }
        });

        setTenants(Array.from(tenantMap.values()));
      } else {
        setError(res?.message || 'Failed to load tenant accounts from live backend.');
      }
    } catch (err) {
      setError(`Network error loading tenants: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleToggleStatus = (id) => {
    if (isMockEnabled()) {
      setTenants(tenants.map(t => {
        if (t.id === id) {
          return { ...t, status: t.status === 'active' ? 'suspended' : 'active' };
        }
        return t;
      }));
    } else {
      alert('In Live Mode, tenant account status is determined by subscription payment status. Please manage status via the Subscriptions Log.');
    }
  };

  const handleAddLibrary = (e) => {
    e.preventDefault();
    if (!newLibName.trim()) return;

    if (isMockEnabled()) {
      const newTenant = {
        id: `LIB-${(newCity || 'IND').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        name: newLibName.trim(),
        owner: newOwner.trim() || 'Admin User',
        phone: '9876543210',
        email: `${(newOwner || 'admin').toLowerCase().replace(/\s+/g, '')}@library.in`,
        city: newCity.trim() || 'India',
        seats: Number(newSeats),
        plan: 'Starter (Silver)',
        status: 'active',
        joined: new Date().toISOString().split('T')[0]
      };

      setTenants([newTenant, ...tenants]);
      setNewLibName('');
      setNewOwner('');
      setNewCity('');
      setIsAddModalOpen(false);
    } else {
      alert('In Live Mode, tenant library accounts are established when a library Administrator registers via the Admin portal and purchases or activates a subscription. Direct tenant insertion is not an exposed backend endpoint.');
      setIsAddModalOpen(false);
    }
  };

  const filtered = tenants.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Onboarded Library Tenants</h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
              isMockEnabled()
                ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
            }`}>
              {isMockEnabled() ? 'Mock Store' : 'Live Subscriptions'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multi-tenant library business accounts, desk limits, and account authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTenants}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-2.5 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
            title="Refresh tenants from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Library</span>
          </button>
        </div>
      </div>

      {/* Multi-tenancy Architecture Notice */}
      {!isMockEnabled() && (
        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/60 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-200">
            <span className="font-bold text-blue-100">Multi-Tenancy Architecture Notice: </span>
            The Library Sathi backend manages tenants through library Admin subscriptions (<code className="font-mono text-[11px] bg-blue-900/40 px-1 py-0.5 rounded">/api/super-admin/subscription/all</code>). Each unique Admin account populated in subscription records represents an active study library tenant.
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by library name, city, owner, email, or tenant ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Tenants Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
            <span>Loading library tenants from live backend...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No library tenants found</p>
            <p className="text-slate-500 mt-1">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No active subscriptions found in the backend.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/40">
                <tr>
                  <th className="py-3 px-4">Library Business</th>
                  <th className="py-3 px-4">City / Region</th>
                  <th className="py-3 px-4">Owner & Contact</th>
                  <th className="py-3 px-4">Allocated Desks</th>
                  <th className="py-3 px-4">Active Plan</th>
                  <th className="py-3 px-4 text-right">Account Control</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">
                    <div>{t.name}</div>
                    <span className="text-[10px] text-brand-400 font-mono">{t.id}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{t.city}</td>
                  <td className="py-3 px-4 text-slate-300">
                    <div>{t.owner}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{t.email || t.phone}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">{t.seats} Desks</td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{t.plan}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(t.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border transition-colors ${
                        t.status === 'active'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                          : 'bg-rose-950/60 text-rose-400 border-rose-800 hover:bg-rose-900'
                      }`}
                    >
                      {t.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

      {/* Modal: Add Library */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Onboard Library Tenant</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLibrary} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Library Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Apex Reading Room"
                  value={newLibName}
                  onChange={(e) => setNewLibName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Owner Name</label>
                  <input
                    type="text"
                    placeholder="Vikram Sharma"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Delhi"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Desk Capacity</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={newSeats}
                  onChange={(e) => setNewSeats(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm"
                >
                  Confirm Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
