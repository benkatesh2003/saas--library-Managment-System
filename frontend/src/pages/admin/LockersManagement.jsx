import React, { useState, useEffect } from 'react';
import {
  KeyRound, CheckCircle2, User, Unlock, Lock, X, Plus, RefreshCw,
  AlertCircle, Trash2, Edit3, Layers, Info, Wrench, Search
} from 'lucide-react';
import { api, isMockEnabled } from '../../services/apiClient';
import { mockStore } from '../../mock/mockStore';

export function LockersManagement() {
  const [lockers, setLockers] = useState(isMockEnabled() ? mockStore.getLockers() : []);
  const [students, setStudents] = useState(isMockEnabled() ? mockStore.getStudents() : []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create Form State
  const [newNumber, setNewNumber] = useState('');
  const [newPrice, setNewPrice] = useState('200');
  const [newStatus, setNewStatus] = useState('available');

  // Bulk Form State
  const [bulkPrefix, setBulkPrefix] = useState('L');
  const [bulkStart, setBulkStart] = useState('1');
  const [bulkEnd, setBulkEnd] = useState('10');
  const [bulkPrice, setBulkPrice] = useState('200');

  // Edit Form State
  const [editNumber, setEditNumber] = useState('');
  const [editPrice, setEditPrice] = useState('200');
  const [editStatus, setEditStatus] = useState('available');

  // Assign Student Name (Mock Mode fallback only)
  const [selectedStudentName, setSelectedStudentName] = useState('');

  // Load live data from backend
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.lockers.getAll();
      if (res.success) {
        setLockers(res.data?.lockers || []);
      } else {
        setError(res.message || 'Failed to retrieve lockers from backend');
      }
      if (isMockEnabled()) {
        setStudents(mockStore.getStudents());
      }
    } catch (err) {
      setError(err.message || 'Network error connecting to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Create Single Locker
  const handleCreateLocker = async (e) => {
    e.preventDefault();
    if (!newNumber.trim()) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.lockers.create({
        lockerNumber: newNumber.trim(),
        price: Number(newPrice) || 0,
        status: newStatus
      });

      if (res.success) {
        setActionSuccess(res.message || 'Locker created successfully');
        setIsCreateModalOpen(false);
        setNewNumber('');
        setNewPrice('200');
        setNewStatus('available');
        await loadData();
      } else {
        setActionError(res.message || 'Failed to create locker');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to create locker');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Create Lockers
  const handleBulkCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.lockers.bulkCreate({
        prefix: bulkPrefix.trim() || 'L',
        start: parseInt(bulkStart, 10) || 1,
        end: parseInt(bulkEnd, 10) || 10,
        price: Number(bulkPrice) || 0
      });

      if (res.success) {
        setActionSuccess(res.message || 'Bulk lockers created successfully');
        setIsBulkModalOpen(false);
        await loadData();
      } else {
        setActionError(res.message || 'Failed to create bulk lockers');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to create bulk lockers');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (locker) => {
    setSelectedLocker(locker);
    setEditNumber(locker.lockerNumber || '');
    setEditPrice(String(locker.price ?? locker.monthlyRent ?? 200));
    setEditStatus(locker.status || 'available');
    setIsEditModalOpen(true);
  };

  // Save Locker Updates
  const handleUpdateLocker = async (e) => {
    e.preventDefault();
    if (!selectedLocker) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.lockers.update(selectedLocker._id, {
        lockerNumber: editNumber.trim(),
        price: Number(editPrice) || 0,
        status: editStatus
      });

      if (res.success) {
        setActionSuccess(res.message || 'Locker updated successfully');
        setIsEditModalOpen(false);
        setSelectedLocker(null);
        await loadData();
      } else {
        setActionError(res.message || 'Failed to update locker');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update locker');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Locker
  const handleDeleteLocker = async (lockerId) => {
    if (!window.confirm("Are you sure you want to permanently delete this locker?")) {
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.lockers.delete(lockerId);
      if (res.success) {
        setActionSuccess(res.message || 'Locker deleted successfully');
        setSelectedLocker(null);
        setIsEditModalOpen(false);
        await loadData();
      } else {
        setActionError(res.message || 'Failed to delete locker');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to delete locker');
    } finally {
      setActionLoading(false);
    }
  };

  // Mock Assign (Offline Mock mode only)
  const handleMockAssign = (e) => {
    e.preventDefault();
    if (!selectedLocker || !selectedStudentName.trim()) return;

    mockStore.assignLocker(selectedLocker._id, selectedStudentName.trim());
    setLockers(mockStore.getLockers());
    setSelectedLocker(null);
    setSelectedStudentName('');
  };

  // Mock Release (Offline Mock mode only)
  const handleMockRelease = (lockerId) => {
    mockStore.releaseLocker(lockerId);
    setLockers(mockStore.getLockers());
    setSelectedLocker(null);
  };

  // Filtered Lockers List
  const filteredLockers = lockers.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const numMatch = l.lockerNumber?.toLowerCase().includes(term);
      const studentId = (l.studentId?.studentId || l.studentId?.name || l.assignedStudent || '').toLowerCase();
      const studentMatch = studentId.includes(term);
      if (!numMatch && !studentMatch) return false;
    }
    return true;
  });

  const occupiedCount = lockers.filter(l => l.status === 'occupied' || l.isOccupied).length;
  const maintenanceCount = lockers.filter(l => l.status === 'maintenance').length;
  const availableCount = lockers.filter(l => l.status === 'available' && !l.isOccupied).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Digital Locker Grid</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isMockEnabled()
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isMockEnabled() ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              {isMockEnabled() ? 'Mock Mode' : 'Live API (Port 5000)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage physical personal lockers, configure monthly rental rates, and track student allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:border-slate-400 px-3.5 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-xs"
            title="Reload live lockers from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Generate</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Locker</span>
          </button>
        </div>
      </div>

      {/* Action Alerts */}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl flex items-center justify-between text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl flex items-center justify-between text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Load Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold block">Error loading live lockers from backend:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Live System Workflow Notice */}
      {!isMockEnabled() && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-blue-800">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Locker Allocation & Release Workflow:</span>
            <span className="text-blue-700 ml-1">
              In live backend mode, lockers are assigned directly during <strong>Student Admission</strong> and automatically released when a student is deactivated. Direct assignment/release buttons are intentionally unavailable per backend architecture.
            </span>
          </div>
        </div>
      )}

      {/* Metrics & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Count Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-slate-700 font-bold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span>Total: {lockers.length}</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Available ({availableCount})</span>
          </span>
          <span className="flex items-center gap-1.5 text-brand-700 font-bold bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-brand-600" />
            <span>Occupied ({occupiedCount})</span>
          </span>
          {maintenanceCount > 0 && (
            <span className="flex items-center gap-1.5 text-amber-700 font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Maintenance ({maintenanceCount})</span>
            </span>
          )}
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search locker or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Lockers Matrix Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-2" />
            <span className="text-xs font-semibold">Loading live locker grid from server...</span>
          </div>
        ) : filteredLockers.length === 0 ? (
          <div className="text-center py-20 text-slate-400 space-y-2">
            <KeyRound className="w-10 h-10 mx-auto stroke-1 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No lockers match your filter</p>
            <p className="text-xs text-slate-400">
              {lockers.length === 0
                ? "No lockers configured yet. Click 'Add Locker' or 'Bulk Generate' to create your first locker."
                : "Try adjusting your search query or status filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {filteredLockers.map((locker) => {
              const isOccupied = locker.status === 'occupied' || locker.isOccupied;
              const isMaintenance = locker.status === 'maintenance';
              const assignedText = locker.studentId?.studentId || locker.studentId?.name || locker.assignedStudent;

              let cardBg = 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400';
              let iconBg = 'text-emerald-600 bg-emerald-100';
              let Icon = Unlock;

              if (isOccupied) {
                cardBg = 'bg-brand-50/60 border-brand-200 hover:border-brand-400';
                iconBg = 'text-brand-600 bg-brand-100';
                Icon = Lock;
              } else if (isMaintenance) {
                cardBg = 'bg-amber-50/60 border-amber-200 hover:border-amber-400';
                iconBg = 'text-amber-600 bg-amber-100';
                Icon = Wrench;
              }

              return (
                <div
                  key={locker._id}
                  onClick={() => setSelectedLocker(locker)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 shadow-2xs hover:shadow-sm ${cardBg}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-extrabold font-mono text-slate-900 block">
                        {locker.lockerNumber}
                      </span>
                      {locker.size && (
                        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                          {locker.size}
                        </span>
                      )}
                    </div>
                    <div className={`p-1.5 rounded-lg ${iconBg}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    {isOccupied ? (
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold block">Assigned:</span>
                        <span className="text-xs font-bold text-slate-900 truncate block" title={assignedText}>
                          {assignedText || 'Enrolled Student'}
                        </span>
                      </div>
                    ) : isMaintenance ? (
                      <div>
                        <span className="text-xs font-bold text-amber-700 block">Maintenance</span>
                        <span className="text-[10px] text-slate-400 font-mono">₹{locker.price ?? locker.monthlyRent ?? 0}/mo</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-emerald-700 block">Available</span>
                        <span className="text-[10px] text-slate-400 font-mono">₹{locker.price ?? locker.monthlyRent ?? 0}/mo</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Locker Inspector / Quick Actions */}
      {selectedLocker && !isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Locker {selectedLocker.lockerNumber}
                </h3>
                <span className="text-[11px] text-slate-400">Locker Details & Management</span>
              </div>
              <button onClick={() => setSelectedLocker(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Locker Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedLocker.lockerNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operational Status:</span>
                <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                  selectedLocker.status === 'occupied' || selectedLocker.isOccupied
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : selectedLocker.status === 'maintenance'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {selectedLocker.status || (selectedLocker.isOccupied ? 'occupied' : 'available')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Rental Fee:</span>
                <span className="font-mono font-bold text-slate-900">₹{selectedLocker.price ?? selectedLocker.monthlyRent ?? 0}/mo</span>
              </div>
              {selectedLocker.size && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Locker Size:</span>
                  <span className="capitalize font-semibold text-slate-800">{selectedLocker.size}</span>
                </div>
              )}
              {(selectedLocker.status === 'occupied' || selectedLocker.isOccupied) && (
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Assigned Student:</span>
                  <span className="font-bold text-slate-900">
                    {selectedLocker.studentId?.studentId || selectedLocker.studentId?.name || selectedLocker.assignedStudent || 'Enrolled Student'}
                  </span>
                </div>
              )}
            </div>

            {/* In Mock Mode: Allow Quick Mock Assign/Release */}
            {isMockEnabled() ? (
              (selectedLocker.status === 'occupied' || selectedLocker.isOccupied) ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleMockRelease(selectedLocker._id)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                  >
                    Release / Vacate Locker (Mock)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMockAssign} className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Assign to Student (Mock Mode)
                    </label>
                    <select
                      value={selectedStudentName}
                      onChange={(e) => setSelectedStudentName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">-- Select Student --</option>
                      {students.map(s => (
                        <option key={s._id} value={s.name}>{s.name} ({s.studentId})</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={!selectedStudentName}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors"
                  >
                    Assign Locker (Mock)
                  </button>
                </form>
              )
            ) : null}

            {/* Actions: Edit & Delete */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-3">
              <button
                type="button"
                onClick={() => openEditModal(selectedLocker)}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLocker(selectedLocker._id)}
                disabled={actionLoading || selectedLocker.status === 'occupied' || selectedLocker.isOccupied}
                title={selectedLocker.status === 'occupied' || selectedLocker.isOccupied ? "Occupied lockers cannot be deleted" : "Delete Locker"}
                className="py-2 px-3 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Locker */}
      {isEditModalOpen && selectedLocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Edit Locker {selectedLocker.lockerNumber}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLocker} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Locker Number *</label>
                <input
                  required
                  type="text"
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Rental Price (₹) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="50"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Single Locker */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Locker</h3>
                <span className="text-[11px] text-slate-400">Configure single physical locker</span>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLocker} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Locker Number *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. L-21"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Rent Price (₹) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="50"
                  placeholder="200"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Initial Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm"
                >
                  {actionLoading ? 'Creating...' : 'Create Locker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Bulk Generate Lockers */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Bulk Generate Lockers</h3>
                <span className="text-[11px] text-slate-400">Instantly generate consecutive locker sequence</span>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Prefix *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. L"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Number *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={bulkStart}
                    onChange={(e) => setBulkStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">End Number *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={bulkEnd}
                    onChange={(e) => setBulkEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Rent per Locker (₹) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="50"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span>Generates: </span>
                <strong className="font-mono text-brand-700">
                  {bulkPrefix || 'L'}-{bulkStart} to {bulkPrefix || 'L'}-{bulkEnd}
                </strong>
                <span className="block text-[11px] text-slate-400 mt-0.5">
                  ({Math.max(0, parseInt(bulkEnd || 0, 10) - parseInt(bulkStart || 0, 10) + 1)} lockers)
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm"
                >
                  {actionLoading ? 'Generating...' : 'Generate Lockers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
