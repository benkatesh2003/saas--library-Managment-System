import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../mock/mockStore';

export function AdminProfile() {
  const { adminUser, updateAdminProfile, refreshAdminProfile, isMockMode } = useAuth();
  const currentAdmin = adminUser?.admin || mockStore.getAdmin();

  const [formData, setFormData] = useState({
    firstName: currentAdmin.firstName || '',
    lastName: currentAdmin.lastName || '',
    libraryName: currentAdmin.libraryName || '',
    phone: currentAdmin.phone || '',
    email: currentAdmin.email || '',
    address: {
      street: currentAdmin.address?.street || '',
      city: currentAdmin.address?.city || '',
      state: currentAdmin.address?.state || '',
      pincode: currentAdmin.address?.pincode || ''
    }
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentAdmin.avatar?.url || '');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync form data when currentAdmin changes
  useEffect(() => {
    if (currentAdmin) {
      setFormData({
        firstName: currentAdmin.firstName || '',
        lastName: currentAdmin.lastName || '',
        libraryName: currentAdmin.libraryName || '',
        phone: currentAdmin.phone || '',
        email: currentAdmin.email || '',
        address: {
          street: currentAdmin.address?.street || '',
          city: currentAdmin.address?.city || '',
          state: currentAdmin.address?.state || '',
          pincode: currentAdmin.address?.pincode || ''
        }
      });
      if (!selectedFile) {
        setPreviewUrl(currentAdmin.avatar?.url || '');
      }
    }
  }, [currentAdmin, selectedFile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        libraryName: formData.libraryName,
        phone: formData.phone,
        address: formData.address
      };

      const res = await updateAdminProfile(payload, selectedFile);
      if (res && res.success) {
        setSuccessMsg(res.message || 'Profile updated successfully!');
        setSelectedFile(null);
      } else {
        setErrorMsg(res?.message || res?.error || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg(`Network or server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    setRefreshing(true);

    try {
      const res = await refreshAdminProfile();
      if (res && res.success) {
        setSuccessMsg('Profile refreshed from backend.');
      } else {
        setErrorMsg(res?.message || 'Failed to refresh profile from backend.');
      }
    } catch (err) {
      setErrorMsg(`Network error: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Profile & Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your library details, branch address, contact information, and administrator account.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
            <span className={`w-2 h-2 rounded-full ${isMockMode ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
            <span>{isMockMode ? 'Mock Mode' : 'Live API (Port 5000)'}</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors disabled:opacity-50"
            title="Refresh from GET /api/admin/auth/profile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Profile'}</span>
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Update Failed</span>
            <span className="break-words">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Admin Profile Overview Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Upload Preview */}
        <div className="relative group shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Admin Avatar"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-200 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-brand-100 text-brand-700 border-2 border-brand-200 flex items-center justify-center font-extrabold text-2xl shadow-sm">
              {(currentAdmin.firstName || 'A')[0]}
            </div>
          )}
          <label
            htmlFor="avatar-upload"
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center cursor-pointer shadow-md transition-transform group-hover:scale-110"
            title="Upload new avatar image"
          >
            <Camera className="w-4 h-4" />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              {currentAdmin.firstName} {currentAdmin.lastName}
            </h2>
            <span className="px-2 py-0.5 bg-brand-100 text-brand-800 rounded-full font-mono text-[11px] font-bold">
              {currentAdmin.libraryId || 'NO-ID'}
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{currentAdmin.role ? currentAdmin.role.toUpperCase() : 'ADMIN'}</span>
            </span>
          </div>

          <div className="text-sm font-semibold text-slate-700 flex items-center justify-center sm:justify-start gap-1.5">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>{currentAdmin.libraryName}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentAdmin.email}</span>
            </div>
            {currentAdmin.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentAdmin.phone}</span>
              </div>
            )}
            {currentAdmin.address?.city && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentAdmin.address.city}, {currentAdmin.address.state}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal & Library Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Personal & Organization Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">First Name *</label>
              <input
                required
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Library / Space Name *</label>
              <input
                required
                type="text"
                name="libraryName"
                value={formData.libraryName}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Registered Email (Identifier - Read Only)
              </label>
              <input
                disabled
                type="email"
                value={formData.email}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Branch Address</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="Shop/Floor, Landmark, Street"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                placeholder="e.g. New Delhi"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                placeholder="e.g. Delhi"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pincode</label>
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleInputChange}
                placeholder="e.g. 110001"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {selectedFile && (
            <span className="text-xs text-brand-600 font-medium">
              Image attached: {selectedFile.name}
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving to Backend...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
