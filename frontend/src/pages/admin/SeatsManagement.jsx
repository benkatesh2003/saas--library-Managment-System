import React, { useState, useEffect } from 'react';
import {
  Armchair,
  Plus,
  Layers,
  Clock,
  UserCheck,
  CheckCircle,
  X,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Edit2,
  Check,
  User,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/apiClient';

export function SeatsManagement() {
  // Live state
  const [shifts, setShifts] = useState([]);
  const [seats, setSeats] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSeat, setSelectedSeat] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modals state
  const [isSingleSeatModalOpen, setIsSingleSeatModalOpen] = useState(false);
  const [isBulkSeatModalOpen, setIsBulkSeatModalOpen] = useState(false);

  // Form states - Single
  const [newSeatNumber, setNewSeatNumber] = useState('');
  const [newSeatFloor, setNewSeatFloor] = useState('Ground');
  const [newSeatSection, setNewSeatSection] = useState('');

  // Form states - Bulk
  const [bulkPrefix, setBulkPrefix] = useState('S');
  const [bulkStart, setBulkStart] = useState(1);
  const [bulkEnd, setBulkEnd] = useState(20);
  const [bulkFloor, setBulkFloor] = useState('Ground');
  const [bulkSection, setBulkSection] = useState('');

  // Load seats and shifts
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [seatsRes, shiftsRes] = await Promise.all([
        api.seats.getAll(),
        api.shifts.getAll()
      ]);

      if (seatsRes.success) {
        const loadedSeats = seatsRes.data?.seats || [];
        setSeats(loadedSeats);
        // Keep selected seat synced if already selected
        if (selectedSeat) {
          const updated = loadedSeats.find(s => s._id === selectedSeat._id);
          setSelectedSeat(updated || null);
        }
      } else {
        setError(seatsRes.message || 'Failed to load seats');
      }

      if (shiftsRes.success) {
        const loadedShifts = shiftsRes.data?.shifts || [];
        setShifts(loadedShifts);
        if (loadedShifts.length > 0 && !selectedShiftId) {
          setSelectedShiftId(loadedShifts[0]._id);
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentShift = shifts.find(s => s._id === selectedShiftId) || shifts[0];

  // Dynamic floors from existing seats
  const uniqueFloors = Array.from(new Set(seats.map(s => String(s.floor || 'Ground')))).filter(Boolean);
  const floorList = ['all', ...(uniqueFloors.length > 0 ? uniqueFloors : ['Ground', '1', '2'])];

  // Filter seats by floor and status
  const filteredSeats = seats.filter(s => {
    if (selectedFloor !== 'all' && String(s.floor || 'Ground').toLowerCase() !== String(selectedFloor).toLowerCase()) {
      return false;
    }
    const currentSeatStatus = s.status || 'available';

    if (selectedStatus !== 'all' && currentSeatStatus !== selectedStatus) {
      return false;
    }
    return true;
  });

  // Handle single seat creation
  const handleCreateSingleSeat = async (e) => {
    e.preventDefault();
    if (!newSeatNumber.trim()) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.seats.create({
        seatNumber: newSeatNumber.trim(),
        floor: newSeatFloor.trim() || 'Ground',
        section: newSeatSection.trim() || undefined
      });

      if (res.success) {
        setActionSuccess(`Seat ${res.data?.seat?.seatNumber || newSeatNumber} created successfully!`);
        setIsSingleSeatModalOpen(false);
        setNewSeatNumber('');
        setNewSeatFloor('Ground');
        setNewSeatSection('');
        await loadData();
      } else {
        setActionError(res.message || 'Failed to create seat');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to create seat');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle bulk seat creation
  const handleBulkCreateSeats = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.seats.bulkCreate({
        prefix: bulkPrefix.trim(),
        start: Number(bulkStart),
        end: Number(bulkEnd),
        floor: bulkFloor.trim() || 'Ground',
        section: bulkSection.trim() || undefined
      });

      if (res.success) {
        const count = res.data?.seats?.length || (Number(bulkEnd) - Number(bulkStart) + 1);
        setActionSuccess(`Successfully generated ${count} seats!`);
        setIsBulkSeatModalOpen(false);
        await loadData();
      } else {
        setActionError(res.message || 'Failed to bulk generate seats');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to bulk generate seats');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle status update
  const handleToggleSeatStatus = async (seatId, newStatus) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.seats.update(seatId, { status: newStatus });
      if (res.success) {
        setActionSuccess(`Seat status updated to ${newStatus}`);
        setSeats(prev => prev.map(s => s._id === seatId ? { ...s, status: newStatus } : s));
        if (selectedSeat && selectedSeat._id === seatId) {
          setSelectedSeat(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        setActionError(res.message || 'Failed to update seat status');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update seat status');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle seat deletion
  const handleDeleteSeat = async (seatId) => {
    if (!window.confirm('Are you sure you want to delete this seat?')) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.seats.delete(seatId);
      if (res.success) {
        setActionSuccess('Seat deleted successfully');
        setSeats(prev => prev.filter(s => s._id !== seatId));
        if (selectedSeat && selectedSeat._id === seatId) {
          setSelectedSeat(null);
        }
      } else {
        setActionError(res.message || 'Failed to delete seat');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to delete seat');
    } finally {
      setActionLoading(false);
    }
  };

  // Compute counts
  const occupiedCount = seats.filter(s => s.status === 'occupied').length;
  const reservedCount = seats.filter(s => s.status === 'reserved').length;
  const maintenanceCount = seats.filter(s => s.status === 'maintenance').length;
  const availableCount = seats.filter(s => (s.status || 'available') === 'available').length;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Seat Matrix & Layout</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live API (Port 5000)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure visual desk allocations, status overrides, and bulk generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:border-slate-400 px-3.5 py-2 rounded-xl transition-colors disabled:opacity-50 shadow-xs"
            title="Reload live seats from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => {
              setActionError(null);
              setActionSuccess(null);
              setIsSingleSeatModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-brand-300 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-brand-600" />
            <span>Add Single Seat</span>
          </button>
          <button
            onClick={() => {
              setActionError(null);
              setActionSuccess(null);
              setIsBulkSeatModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Bulk Create Desks</span>
          </button>
        </div>
      </div>

      {/* Notifications / Error Banners */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={loadData} className="font-bold underline hover:no-underline">Retry</button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Shift Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Shift Switcher */}
          {shifts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Shift Info:
              </span>
              {shifts.map((shift) => {
                const isSelected = shift._id === selectedShiftId;
                return (
                  <button
                    key={shift._id}
                    onClick={() => {
                      setSelectedShiftId(shift._id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </button>
                );
              })}
            </div>
          )}

          {/* Floor & Status Switchers */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Floor:
              </span>
              <div className="flex items-center gap-1">
                {floorList.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFloor(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                      selectedFloor === f
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs font-medium px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Legend & Summary */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-slate-600 font-medium">
            Showing <strong className="text-slate-900">{filteredSeats.length}</strong> of <strong className="text-slate-900">{seats.length}</strong> total desks
            {currentShift && <span> for <strong className="text-brand-700">{currentShift.name}</strong></span>}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Available ({availableCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-brand-600" />
              <span>Occupied ({occupiedCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Reserved ({reservedCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Maintenance ({maintenanceCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Seat Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
            <p className="text-xs font-semibold">Loading live seat layout...</p>
          </div>
        ) : filteredSeats.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Armchair className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No seats found</p>
            <p className="text-xs text-slate-400 mt-1">
              Create seats singly or generate them in bulk to view them on the matrix.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {filteredSeats.map((seat) => {
              const status = seat.status || 'available';
              const isSelected = selectedSeat?._id === seat._id;

              let badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
              if (status === 'occupied') {
                badgeColor = "bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100";
              } else if (status === 'reserved') {
                badgeColor = "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100";
              } else if (status === 'maintenance') {
                badgeColor = "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100";
              }

              return (
                <button
                  key={seat._id}
                  onClick={() => setSelectedSeat(seat)}
                  className={`h-16 rounded-xl border p-2 flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs ${badgeColor} ${
                    isSelected ? 'ring-2 ring-brand-600 ring-offset-2 scale-105' : ''
                  }`}
                >
                  <span className="text-xs font-mono font-extrabold">{seat.seatNumber}</span>
                  <span className="text-[10px] font-semibold capitalize mt-0.5 opacity-90">{status}</span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {seat.floor ? `F:${seat.floor}` : 'Ground'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Seat Inspector Drawer / Popover */}
      {selectedSeat && (
        <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-md animate-in fade-in flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 font-mono font-extrabold flex items-center justify-center text-base shrink-0">
              {selectedSeat.seatNumber}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Desk {selectedSeat.seatNumber} (Floor: {selectedSeat.floor || 'Ground'}{selectedSeat.section ? `, Sec: ${selectedSeat.section}` : ''})
                </h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                  selectedSeat.status === 'occupied'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : selectedSeat.status === 'reserved'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : selectedSeat.status === 'maintenance'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {selectedSeat.status || 'available'}
                </span>
              </div>
              
              {/* Assigned Student Details if populated */}
              {selectedSeat.reservedFor ? (
                <div className="flex items-center gap-1.5 text-xs text-brand-800 mt-1 font-medium">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  <span>
                    Occupied by: {selectedSeat.reservedFor.firstName} {selectedSeat.reservedFor.lastName}
                    {selectedSeat.reservedFor.studentId && ` (${selectedSeat.reservedFor.studentId})`}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentShift ? `Selected shift: ${currentShift.name} (${currentShift.startTime} - ${currentShift.endTime})` : 'Unassigned'}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Quick Status Override:</span>
            <button
              onClick={() => handleToggleSeatStatus(selectedSeat._id, 'available')}
              disabled={actionLoading || selectedSeat.status === 'available'}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 disabled:opacity-40 transition-colors"
            >
              Available
            </button>
            <button
              onClick={() => handleToggleSeatStatus(selectedSeat._id, 'reserved')}
              disabled={actionLoading || selectedSeat.status === 'reserved'}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-40 transition-colors"
            >
              Reserved
            </button>
            <button
              onClick={() => handleToggleSeatStatus(selectedSeat._id, 'maintenance')}
              disabled={actionLoading || selectedSeat.status === 'maintenance'}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 disabled:opacity-40 transition-colors"
            >
              Maintenance
            </button>
            <button
              onClick={() => handleDeleteSeat(selectedSeat._id)}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1"
              title="Delete this seat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setSelectedSeat(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg ml-1"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Single Seat */}
      {isSingleSeatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Seat</h3>
              <button onClick={() => setIsSingleSeatModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSingleSeat} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Seat Number *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. S-41"
                  value={newSeatNumber}
                  onChange={(e) => setNewSeatNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Floor Level</label>
                <input
                  type="text"
                  placeholder="e.g. Ground, 1, 2"
                  value={newSeatFloor}
                  onChange={(e) => setNewSeatFloor(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Section (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Hall A, Silent Wing"
                  value={newSeatSection}
                  onChange={(e) => setNewSeatSection(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSingleSeatModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Seat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Create Seats */}
      {isBulkSeatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Bulk Generate Seats</h3>
              <button onClick={() => setIsBulkSeatModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBulkCreateSeats} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Seat Prefix *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. S- or A-"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start No. *</label>
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">End No. *</label>
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Floor Level</label>
                <input
                  type="text"
                  placeholder="e.g. Ground, 1, 2"
                  value={bulkFloor}
                  onChange={(e) => setBulkFloor(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Section (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Hall A"
                  value={bulkSection}
                  onChange={(e) => setBulkSection(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkSeatModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || Number(bulkEnd) < Number(bulkStart)}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate {Math.max(0, Number(bulkEnd) - Number(bulkStart) + 1)} Seats</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
