import React, { useState } from 'react';
import { LayoutGrid, Clock, User, CheckCircle, Info, Sparkles, Check } from 'lucide-react';
import { DEMO_SHIFTS, DEMO_SEATS } from '../../data/landingContent';

export function LiveSeatGridDemo() {
  const [selectedShiftId, setSelectedShiftId] = useState(DEMO_SHIFTS[0]._id);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const currentShift = DEMO_SHIFTS.find(s => s._id === selectedShiftId) || DEMO_SHIFTS[0];

  // Compute live occupancy for selected shift
  const occupiedCount = DEMO_SEATS.filter(s => s.shiftOccupancy?.[selectedShiftId] === "occupied").length;
  const reservedCount = DEMO_SEATS.filter(s => s.shiftOccupancy?.[selectedShiftId] === "reserved").length;
  const availableCount = DEMO_SEATS.length - occupiedCount - reservedCount;

  return (
    <section id="seat-demo" className="py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-brand-600 font-extrabold text-xs tracking-wider uppercase bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
            Interactive Live Demonstration
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Multi-Shift Collision-Free Seat Matrix
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Switch shifts below and see how the visual layout updates instantly. The exact same seat can be allocated in Morning and Evening shifts to different students without double-booking!
          </p>
        </div>

        {/* Shift Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {DEMO_SHIFTS.map((shift) => {
            const isActive = shift._id === selectedShiftId;
            return (
              <button
                key={shift._id}
                onClick={() => {
                  setSelectedShiftId(shift._id);
                  setSelectedSeat(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/25 scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{shift.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-brand-700 text-brand-100' : 'bg-slate-200 text-slate-600'}`}>
                  {shift.startTime} - {shift.endTime}
                </span>
              </button>
            );
          })}
        </div>

        {/* Seat Layout Container */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-8 shadow-sm">
          {/* Header Stats Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Active Shift: {currentShift.name}</span>
              <span className="text-slate-500 font-mono">({currentShift.startTime} - {currentShift.endTime})</span>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Available: {availableCount}</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-brand-700">
                <span className="w-3 h-3 rounded-full bg-brand-600" />
                <span>Occupied: {occupiedCount}</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-amber-700">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Reserved: {reservedCount}</span>
              </div>
            </div>
          </div>

          {/* Interactive Seat Matrix */}
          <div className="pt-6">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Main Study Hall (40 Desks) • Click any seat to inspect status</span>
              <span className="text-brand-600">Tip: Click S-03 or S-06</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-3">
              {DEMO_SEATS.map((seat) => {
                const status = seat.shiftOccupancy?.[selectedShiftId] || "available";
                const isSelected = selectedSeat?._id === seat._id;

                let colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400";
                if (status === "occupied") {
                  colorClasses = "bg-brand-50 text-brand-700 border-brand-300 hover:bg-brand-100 hover:border-brand-400";
                } else if (status === "reserved") {
                  colorClasses = "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 hover:border-amber-400";
                }

                if (isSelected) {
                  colorClasses += " ring-2 ring-brand-600 ring-offset-2 scale-105";
                }

                return (
                  <button
                    key={seat._id}
                    onClick={() => setSelectedSeat(seat)}
                    className={`h-14 rounded-xl border flex flex-col items-center justify-center p-1 transition-all text-center group cursor-pointer shadow-xs ${colorClasses}`}
                  >
                    <span className="text-xs font-mono font-extrabold">{seat.seatNumber}</span>
                    <span className="text-[10px] font-semibold capitalize mt-0.5 opacity-90">{status}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Seat Details Drawer/Box */}
          {selectedSeat && (
            <div className="mt-6 p-4 rounded-xl bg-white border border-brand-200 shadow-md animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 font-mono font-extrabold flex items-center justify-center text-sm">
                    {selectedSeat.seatNumber}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>Desk {selectedSeat.seatNumber} - Floor {selectedSeat.floor}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize bg-brand-50 text-brand-700 border border-brand-200">
                        {selectedSeat.shiftOccupancy?.[selectedShiftId] || 'available'} in {currentShift.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Shift Timing: {currentShift.startTime} - {currentShift.endTime} • Monthly Fee: ₹{currentShift.price}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Ready to assign?</span>
                  <a
                    href="/admin/students"
                    className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 rounded-lg shadow-sm"
                  >
                    Open Admission Form
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
