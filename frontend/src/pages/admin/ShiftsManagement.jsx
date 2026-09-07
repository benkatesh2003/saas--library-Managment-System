import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Power,
  Edit3,
  X,
  CheckCircle2,
  IndianRupee,
  Users,
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { formatTime } from '../../utils/formatters';

export function ShiftsManagement() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState(null);

  // Form states (aligned exclusively with backend Shift model)
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('12:00');
  const [price, setPrice] = useState('600');
  const [maxStudents, setMaxStudents] = useState('30');
  const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(false);

  // Fetch shifts from live backend
  const loadShifts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.shifts.getAll();
      if (res && res.success && res.data?.shifts) {
        setShifts(res.data.shifts);
      } else {
        setError(res?.message || 'Failed to retrieve shifts from backend.');
        setShifts([]);
      }
    } catch (err) {
      setError(`Network error connecting to backend: ${err.message}`);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  // Open Create Modal
  const handleOpenAddModal = () => {
    setName('');
    setStartTime('06:00');
    setEndTime('12:00');
    setPrice('600');
    setMaxStudents('30');
    setIsUnlimitedCapacity(false);
    setError('');
    setSuccessMsg('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (shift) => {
    setEditingShiftId(shift._id);
    setName(shift.name || '');
    setStartTime(shift.startTime || '06:00');
    setEndTime(shift.endTime || '12:00');
    setPrice(String(shift.price || '600'));
    if (shift.maxStudents === -1 || !shift.maxStudents || shift.maxStudents <= 0) {
      setIsUnlimitedCapacity(true);
      setMaxStudents('');
    } else {
      setIsUnlimitedCapacity(false);
      setMaxStudents(String(shift.maxStudents));
    }
    setError('');
    setSuccessMsg('');
    setIsEditModalOpen(true);
  };

  // Create Shift
  const handleCreateShift = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    const payload = {
      name: name.trim(),
      startTime,
      endTime,
      price: Number(price),
      maxStudents: isUnlimitedCapacity ? -1 : (Number(maxStudents) > 0 ? Number(maxStudents) : -1)
    };

    try {
      const res = await api.shifts.create(payload);
      if (res && res.success) {
        setSuccessMsg(res.message || 'Shift created successfully!');
        setIsAddModalOpen(false);
        await loadShifts();
      } else {
        setError(res?.message || res?.error || 'Failed to create shift.');
      }
    } catch (err) {
      setError(`Error creating shift: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Shift
  const handleUpdateShift = async (e) => {
    e.preventDefault();
    if (!name.trim() || !editingShiftId) return;

    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    const updates = {
      name: name.trim(),
      startTime,
      endTime,
      price: Number(price),
      maxStudents: isUnlimitedCapacity ? -1 : (Number(maxStudents) > 0 ? Number(maxStudents) : -1)
    };

    try {
      const res = await api.shifts.update(editingShiftId, updates);
      if (res && res.success) {
        setSuccessMsg(res.message || 'Shift updated successfully!');
        setIsEditModalOpen(false);
        setEditingShiftId(null);
        await loadShifts();
      } else {
        setError(res?.message || res?.error || 'Failed to update shift.');
      }
    } catch (err) {
      setError(`Error updating shift: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Shift Status
  const handleToggleStatus = async (shift) => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.shifts.toggle(shift._id);
      if (res && res.success) {
        const newStatus = res.data?.shift?.isActive ?? !shift.isActive;
        setShifts(prev => prev.map(s => s._id === shift._id ? { ...s, isActive: newStatus } : s));
        setSuccessMsg(`Shift "${shift.name}" status changed to ${newStatus ? 'active' : 'inactive'}.`);
      } else {
        setError(res?.message || 'Failed to toggle shift status.');
      }
    } catch (err) {
      setError(`Error toggling shift status: ${err.message}`);
    }
  };

  // Delete Shift
  const handleDeleteShift = async (shift) => {
    if (!confirm(`Are you sure you want to delete the shift "${shift.name}"?`)) {
      return;
    }

    setError('');
    setSuccessMsg('');

    try {
      const res = await api.shifts.delete(shift._id);
      if (res && res.success) {
        setShifts(prev => prev.filter(s => s._id !== shift._id));
        setSuccessMsg(`Shift "${shift.name}" deleted successfully.`);
      } else {
        // Backend returns error if currentStudents > 0
        setError(res?.message || res?.error || 'Failed to delete shift.');
      }
    } catch (err) {
      setError(`Error deleting shift: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shift Schedules & Pricing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure daily study intervals, monthly subscription rates, and active seat capacities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live API (Port 5000)</span>
          </div>

          <button
            type="button"
            onClick={loadShifts}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 shadow-2xs transition-colors"
            title="Reload Shifts from Backend"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Shift</span>
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Operation Error</span>
            <span className="break-words">{error}</span>
          </div>
        </div>
      )}

      {/* Loading Skeleton / State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 bg-slate-100 rounded-md w-3/4" />
              <div className="h-4 bg-slate-100 rounded-md w-1/2" />
              <div className="h-10 bg-slate-100 rounded-md w-full mt-4" />
            </div>
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No shifts configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't set up any study shifts yet. Create your first operational shift to allocate seats and admit students.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Shift</span>
          </button>
        </div>
      ) : (
        /* Shifts Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shifts.map((shift) => {
            const hasMaxStudents = shift.maxStudents && shift.maxStudents > 0;
            const enrolled = shift.currentStudents || 0;
            const isFull = shift.isFull || (hasMaxStudents && enrolled >= shift.maxStudents);

            return (
              <div
                key={shift._id}
                className={`bg-white rounded-2xl p-6 border shadow-xs flex flex-col justify-between transition-all ${
                  shift.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div>
                  {/* Shift Header & Toggle */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          shift.isActive ? 'bg-brand-50 text-brand-600' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>{shift.name}</span>
                          {isFull && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              FULL
                            </span>
                          )}
                        </h3>
                        <span className="text-xs text-slate-500 font-mono font-semibold">
                          {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(shift)}
                      title={shift.isActive ? "Deactivate Shift" : "Activate Shift"}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                        shift.isActive ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200' : 'text-slate-500 bg-slate-200 hover:bg-slate-300'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Shift Capacity & Metrics Block (Actual Backend Fields) */}
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Enrolled Capacity</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {enrolled} {hasMaxStudents ? `/ ${shift.maxStudents}` : 'students'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-rose-500' : 'bg-brand-600'
                        }`}
                        style={{
                          width: hasMaxStudents ? `${Math.min(100, Math.round((enrolled / shift.maxStudents) * 100))}%` : '20%'
                        }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-400 text-right">
                      {hasMaxStudents ? `${shift.maxStudents - enrolled} seats available` : 'Unlimited seats'}
                    </div>
                  </div>
                </div>

                {/* Footer: Price & Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Monthly Fee</span>
                    <span className="text-lg font-extrabold font-mono text-slate-900 flex items-center">
                      ₹{shift.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(shift)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                      title="Edit Shift"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Shift"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Shift */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Create New Shift</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Shift Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Morning Focus Slot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Time (24h) *</label>
                  <input
                    required
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">End Time (24h) *</label>
                  <input
                    required
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Subscription Fee (₹) *</label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    required
                    type="number"
                    min="0"
                    step="50"
                    placeholder="600"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              {/* maxStudents Capacity Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Maximum Student Capacity</label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnlimitedCapacity}
                      onChange={(e) => setIsUnlimitedCapacity(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>Unlimited Seats</span>
                  </label>
                </div>
                {!isUnlimitedCapacity && (
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      required={!isUnlimitedCapacity}
                      type="number"
                      min="1"
                      placeholder="e.g. 30"
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading ? 'Saving...' : 'Create Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Shift */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Edit Shift</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateShift} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Shift Name *</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Time (24h) *</label>
                  <input
                    required
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">End Time (24h) *</label>
                  <input
                    required
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Subscription Fee (₹) *</label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    required
                    type="number"
                    min="0"
                    step="50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              {/* maxStudents Capacity Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Maximum Student Capacity</label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnlimitedCapacity}
                      onChange={(e) => setIsUnlimitedCapacity(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>Unlimited Seats</span>
                  </label>
                </div>
                {!isUnlimitedCapacity && (
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      required={!isUnlimitedCapacity}
                      type="number"
                      min="1"
                      placeholder="e.g. 30"
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading ? 'Updating...' : 'Update Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
