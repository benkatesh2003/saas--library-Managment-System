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
    <section id="seat-demo" className="py-16 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-mono mb-3">
            <span>INTERACTIVE DEMO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Multi-shift collision-free seat matrix.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base mt-2">
            Switch shifts below to observe real-time desk availability. The exact same desk can be allocated across Morning and Evening shifts to different students without double-booking.
          </p>
        </div>

        {/* Shift Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {DEMO_SHIFTS.map((shift) => {
            const isActive = shift._id === selectedShiftId;
            return (
              <button
                key={shift._id}
                onClick={() => {
                  setSelectedShiftId(shift._id);
                  setSelectedSeat(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-medium text-xs transition-colors ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-2xs"
                    : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{shift.name}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>
                  {shift.startTime} - {shift.endTime}
                </span>
              </button>
            );
          })}
        </div>

        {/* Seat Layout Container */}
        <div className="bg-[#FAFAFA] border border-neutral-200 rounded-lg p-4 sm:p-6 shadow-2xs">
          {/* Header Stats Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-neutral-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900 text-xs sm:text-sm">Active Shift: {currentShift.name}</span>
              <span className="text-neutral-500 font-mono text-xs">({currentShift.startTime} - {currentShift.endTime})</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-neutral-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Available: <strong className="font-mono">{availableCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-neutral-700">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span>Occupied: <strong className="font-mono">{occupiedCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-neutral-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Reserved: <strong className="font-mono">{reservedCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Interactive Seat Matrix */}
          <div className="pt-5">
            <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Main Study Hall (40 Desks) • Click any desk to inspect</span>
              <span className="text-neutral-600 font-medium">Tip: Click S-03 or S-06</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {DEMO_SEATS.map((seat) => {
                const status = seat.shiftOccupancy?.[selectedShiftId] || "available";
                const isSelected = selectedSeat?._id === seat._id;

                let colorClasses = "bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50";
                if (status === "occupied") {
                  colorClasses = "bg-neutral-200/70 text-neutral-600 border-neutral-300 hover:bg-neutral-200";
                } else if (status === "reserved") {
                  colorClasses = "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100";
                }

                if (isSelected) {
                  colorClasses += " ring-2 ring-neutral-900 ring-offset-2";
                }

                return (
                  <button
                    key={seat._id}
                    onClick={() => setSelectedSeat(seat)}
                    className={`h-12 rounded-md border flex flex-col items-center justify-center p-1 transition-colors text-center cursor-pointer shadow-2xs ${colorClasses}`}
                  >
                    <span className="text-xs font-mono font-semibold">{seat.seatNumber}</span>
                    <span className="text-[9px] font-medium capitalize mt-0.5 opacity-80">{status}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Seat Details Drawer/Box */}
          {selectedSeat && (
            <div className="mt-5 p-3.5 rounded-md bg-white border border-neutral-200 shadow-2xs animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-neutral-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                    {selectedSeat.seatNumber}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900 text-xs sm:text-sm flex items-center gap-2">
                      <span>Desk {selectedSeat.seatNumber} • Floor {selectedSeat.floor}</span>
                      <span className="text-[11px] font-medium font-mono px-2 py-0.5 rounded capitalize bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {selectedSeat.shiftOccupancy?.[selectedShiftId] || 'available'} in {currentShift.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Shift Timing: {currentShift.startTime} - {currentShift.endTime} • Fee: ₹{currentShift.price}/mo
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/admin/students"
                    className="text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 rounded-md shadow-2xs transition-colors"
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
