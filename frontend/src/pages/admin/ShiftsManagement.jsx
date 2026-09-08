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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Shift Schedules & Pricing</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure daily study intervals, monthly subscription rates, and active seat capacities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Port 5000 Active</span>
          </div>

          <button
            type="button"
            onClick={loadShifts}
            disabled={loading}
            className="p-1.5 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-md text-neutral-600 shadow-2xs transition-colors"
            title="Reload Shifts from Backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Shift</span>
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {successMsg && (
        <div className="p-3 bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50/50 border border-rose-200 text-rose-900 text-xs rounded-md flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Operation Error</span>
            <span className="break-words text-rose-700">{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Loading Skeleton / State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-lg p-5 border border-neutral-200 animate-pulse space-y-4">
              <div className="h-5 bg-neutral-100 rounded w-2/3" />
              <div className="h-3.5 bg-neutral-100 rounded w-1/3" />
              <div className="h-9 bg-neutral-100 rounded w-full mt-4" />
            </div>
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-neutral-200 space-y-3">
          <div className="w-10 h-10 rounded-md bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto border border-neutral-200">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">No shifts configured</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You haven't set up any study shifts yet. Create your first operational shift to allocate seats and admit students.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Shift</span>
          </button>
        </div>
      ) : (
        /* Shifts Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map((shift) => {
            const hasMaxStudents = shift.maxStudents && shift.maxStudents > 0;
            const enrolled = shift.currentStudents || 0;
            const isFull = shift.isFull || (hasMaxStudents && enrolled >= shift.maxStudents);

            return (
              <div
                key={shift._id}
                className={`bg-white rounded-lg p-5 border shadow-2xs flex flex-col justify-between transition-all ${
                  shift.isActive ? 'border-neutral-200 hover:border-neutral-300' : 'border-neutral-200 opacity-60 bg-neutral-50/50'
                }`}
              >
                <div>
                  {/* Shift Header & Toggle */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-md flex items-center justify-center border ${
                          shift.isActive ? 'bg-neutral-100 text-neutral-900 border-neutral-200' : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                          <span>{shift.name}</span>
                          {isFull && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-100 text-neutral-900 border border-neutral-300">
                              FULL
                            </span>
                          )}
                        </h3>
                        <span className="text-xs text-neutral-500 font-mono">
                          {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(shift)}
                      title={shift.isActive ? "Deactivate Shift" : "Activate Shift"}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                        shift.isActive 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                          : 'text-neutral-500 bg-neutral-100 border-neutral-200 hover:bg-neutral-200'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{shift.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>

                  {/* Shift Capacity & Metrics Block */}
                  <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200 rounded-md space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Enrolled Capacity</span>
                      </span>
                      <span className="font-mono font-medium text-neutral-900">
                        {enrolled} {hasMaxStudents ? `/ ${shift.maxStudents}` : 'students'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-neutral-900' : 'bg-neutral-700'
                        }`}
                        style={{
                          width: hasMaxStudents ? `${Math.min(100, Math.round((enrolled / shift.maxStudents) * 100))}%` : '20%'
                        }}
                      />
                    </div>

                    <div className="text-[11px] text-neutral-400 font-mono text-right">
                      {hasMaxStudents ? `${shift.maxStudents - enrolled} seats available` : 'Unlimited seats'}
                    </div>
                  </div>
                </div>

                {/* Footer: Price & Action Buttons */}
                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider block">Monthly Fee</span>
                    <span className="text-base font-semibold font-mono text-neutral-900">
                      ₹{shift.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(shift)}
                      className="p-1 text-neutral-400 hover:text-neutral-900 rounded hover:bg-neutral-100 transition-colors"
                      title="Edit Shift"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-100 transition-colors"
                      title="Delete Shift"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-lg border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900">Create New Shift</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Shift Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Morning Focus Slot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Start Time (24h) *</label>
                  <input
                    required
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">End Time (24h) *</label>
                  <input
                    required
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Monthly Subscription Fee (₹) *</label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2" />
                  <input
                    required
                    type="number"
                    min="0"
                    step="50"
                    placeholder="600"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              {/* maxStudents Capacity Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-700">Maximum Student Capacity</label>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnlimitedCapacity}
                      onChange={(e) => setIsUnlimitedCapacity(e.target.checked)}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span>Unlimited Seats</span>
                  </label>
                </div>
                {!isUnlimitedCapacity && (
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2" />
                    <input
                      required={!isUnlimitedCapacity}
                      type="number"
                      min="1"
                      placeholder="e.g. 30"
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs disabled:opacity-50 flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-lg border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900">Edit Shift</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateShift} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Shift Name *</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Start Time (24h) *</label>
                  <input
                    required
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">End Time (24h) *</label>
                  <input
                    required
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Monthly Subscription Fee (₹) *</label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2" />
                  <input
                    required
                    type="number"
                    min="0"
                    step="50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              {/* maxStudents Capacity Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-700">Maximum Student Capacity</label>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnlimitedCapacity}
                      onChange={(e) => setIsUnlimitedCapacity(e.target.checked)}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span>Unlimited Seats</span>
                  </label>
                </div>
                {!isUnlimitedCapacity && (
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2" />
                    <input
                      required={!isUnlimitedCapacity}
                      type="number"
                      min="1"
                      placeholder="e.g. 30"
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs disabled:opacity-50 flex items-center gap-1.5"
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
