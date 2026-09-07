import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Armchair,
  KeyRound,
  QrCode,
  X,
  CreditCard,
  Printer,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Upload,
  UserCheck
} from 'lucide-react';
import { api, isMockEnabled } from '../../services/apiClient';
import { mockStore } from '../../mock/mockStore';
import { formatINR, formatDate } from '../../utils/formatters';
import { UnverifiedBadge } from '../../components/common/UnverifiedBadge';

export function StudentsManagement() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState(isMockEnabled() ? mockStore.getStudents() : []);
  const [shifts, setShifts] = useState(isMockEnabled() ? mockStore.getShifts() : []);
  const [seats, setSeats] = useState(isMockEnabled() ? mockStore.getSeats() : []);
  const [lockers, setLockers] = useState(isMockEnabled() ? mockStore.getLockers() : []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedActiveFilter, setSelectedActiveFilter] = useState('all');

  // Modals
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(searchParams.get('action') === 'admit');
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState(null);
  const [admittedStudentResult, setAdmittedStudentResult] = useState(null);

  // Form State for Admit Student
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [seatId, setSeatId] = useState('');
  const [lockerId, setLockerId] = useState('');
  const [duration, setDuration] = useState('1');
  const [discount, setDiscount] = useState('0');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoFile, setPhotoFile] = useState(null);

  // Load live data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, shiftsRes, seatsRes] = await Promise.all([
        api.students.getAll({ limit: 100 }),
        api.shifts.getAll(),
        api.seats.getAvailable()
      ]);

      if (studentsRes.success) {
        setStudents(studentsRes.data?.students || []);
      } else {
        setError(studentsRes.message || 'Failed to load students');
      }

      if (shiftsRes.success) {
        const loadedShifts = shiftsRes.data?.shifts || [];
        setShifts(loadedShifts);
        if (loadedShifts.length > 0 && !shiftId) {
          setShiftId(loadedShifts[0]._id);
        }
      }

      if (seatsRes.success) {
        setSeats(seatsRes.data?.seats || []);
      }

      if (isMockEnabled()) {
        setLockers(mockStore.getLockers());
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

  // Compute end date based on duration
  const start = new Date(startDate);
  const end = new Date(start.setMonth(start.getMonth() + parseInt(duration, 10)));
  const calculatedEndDate = end.toISOString().split('T')[0];

  // Selected shift details for pricing
  const chosenShift = shifts.find(s => s._id === shiftId) || shifts[0];
  const baseShiftPrice = chosenShift ? (chosenShift.price || 0) : 600;
  const totalBaseFee = (baseShiftPrice * parseInt(duration, 10)) - parseInt(discount || 0, 10);
  const finalPayable = Math.max(0, totalBaseFee);

  // Available seats
  const availableSeats = isMockEnabled()
    ? seats.filter(s => {
        const occ = s.shiftOccupancy?.[shiftId];
        return (occ === 'available' || !occ) && (s.status !== 'occupied');
      })
    : seats.filter(s => s.status === 'available');

  // Available lockers
  const availableLockers = lockers.filter(l => l.status === 'available' || !l.isOccupied);

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      shiftId: shiftId || undefined,
      seatId: seatId || undefined,
      lockerId: lockerId || undefined,
      startDate,
      endDate: calculatedEndDate,
      duration: parseInt(duration, 10),
      discount: parseInt(discount || 0, 10),
      paymentStatus
    };

    try {
      const res = await api.students.admit(payload, photoFile);
      if (res.success) {
        setAdmittedStudentResult(res.data);
        await loadData();
      } else {
        setActionError(res.message || 'Failed to admit student');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to admit student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseAdmitModal = () => {
    setIsAdmitModalOpen(false);
    setAdmittedStudentResult(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setSeatId('');
    setLockerId('');
    setDiscount('0');
    setPhotoFile(null);
    setActionError(null);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this student record? Assigned desk and locker will be freed.")) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.students.delete(id);
      if (res.success) {
        setActionSuccess(res.message || 'Student deactivated and resources released');
        await loadData();
      } else {
        setActionError(res.message || 'Failed to deactivate student');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to deactivate student');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered students list
  const filteredStudents = students.filter(s => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const seatNum = (s.seat?.seatNumber || s.seatNumber || '').toLowerCase();
      const match = s.name?.toLowerCase().includes(term) ||
        s.phone?.includes(term) ||
        s.studentId?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        seatNum.includes(term);
      if (!match) return false;
    }
    const currentShiftId = s.shift?.shiftId || s.shiftId;
    if (selectedShiftFilter !== 'all' && currentShiftId !== selectedShiftFilter) return false;
    if (selectedStatusFilter !== 'all' && s.paymentStatus !== selectedStatusFilter) return false;
    if (selectedActiveFilter !== 'all') {
      const isAct = selectedActiveFilter === 'active';
      if (s.isActive !== isAct) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Directory & Admissions</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isMockEnabled()
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isMockEnabled() ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              {isMockEnabled() ? 'Mock Mode' : 'Live API (Port 5000)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage student enrollments, assign desks, issue fee receipts, and generate ID cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:border-slate-400 px-3.5 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-xs"
            title="Reload live student directory from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => {
              setActionError(null);
              setActionSuccess(null);
              setIsAdmitModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Admission</span>
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by student name, mobile number, ID, or seat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Shift Filter */}
          <select
            value={selectedShiftFilter}
            onChange={(e) => setSelectedShiftFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Shifts</option>
            {shifts.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          {/* Payment Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Fee Status</option>
            <option value="paid">Paid</option>
            <option value="due">Due / Unpaid</option>
            <option value="partial">Partial</option>
            <option value="advance">Advance</option>
          </select>

          {/* Active Status Filter */}
          <select
            value={selectedActiveFilter}
            onChange={(e) => setSelectedActiveFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive / Deactivated</option>
          </select>
        </div>
      </div>

      {/* Student Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4">Student Profile</th>
                <th className="py-3 px-4">Seat</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Locker</th>
                <th className="py-3 px-4">Membership Expiry</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto text-brand-600 mb-2" />
                    <p className="text-xs font-semibold">Loading live student directory...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const seatNumber = s.seat?.seatNumber || s.seatNumber;
                  const shiftName = s.shift?.shiftName || s.shiftName;
                  const lockerNumber = s.locker?.lockerNumber || s.lockerNumber;
                  const endDate = s.subscription?.endDate || s.endDate;
                  const isDeactivated = s.isActive === false;

                  return (
                    <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {s.image?.url ? (
                            <img
                              src={s.image.url}
                              alt={s.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {s.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{s.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span className="font-bold text-brand-600">{s.studentId}</span>
                              {s.phone && (
                                <>
                                  <span>•</span>
                                  <span>{s.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Seat */}
                      <td className="py-3 px-4">
                        {seatNumber ? (
                          <span className="font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded text-xs">
                            {seatNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Shift */}
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {shiftName || <span className="text-slate-400 italic">—</span>}
                      </td>

                      {/* Locker */}
                      <td className="py-3 px-4">
                        {lockerNumber ? (
                          <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {lockerNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {endDate ? formatDate(endDate) : '—'}
                      </td>

                      {/* Fee Status */}
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          s.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : s.paymentStatus === 'due'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {s.paymentStatus || 'due'}
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          !isDeactivated
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {!isDeactivated ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudentForIdCard(s)}
                            title="Generate Student ID Card"
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s._id)}
                            disabled={actionLoading || isDeactivated}
                            title={isDeactivated ? "Student already deactivated" : "Deactivate Student"}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Admit Student */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Student Admission Form</h3>
                <span className="text-[11px] text-slate-400">Generates instant computerized receipt & seat reservation</span>
              </div>
              <button onClick={handleCloseAdmitModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {admittedStudentResult ? (
              <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Admission Successful!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Student ID: <strong className="font-mono text-brand-700">{admittedStudentResult.student?.studentId}</strong>
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-bold text-slate-900">{admittedStudentResult.student?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allocated Desk:</span>
                    <span className="font-mono font-bold text-brand-700">
                      {admittedStudentResult.student?.seat?.seatNumber || admittedStudentResult.student?.seatNumber || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shift Window:</span>
                    <span className="font-semibold text-slate-800">
                      {admittedStudentResult.student?.shift?.shiftName || admittedStudentResult.student?.shiftName || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice Number:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {admittedStudentResult.invoice?.invoiceNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Student Portal Password:</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {admittedStudentResult.tempPassword || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedStudentForIdCard(admittedStudentResult.student);
                      setAdmittedStudentResult(null);
                      setIsAdmitModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Print Student ID Card</span>
                  </button>
                  <button
                    onClick={handleCloseAdmitModal}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdmitSubmit} className="space-y-4">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mobile (WhatsApp) *</label>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. 9811223344"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Email & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="rahul@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Local Address</label>
                    <input
                      type="text"
                      placeholder="Karol Bagh, Delhi"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Shift Selection & Photo Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Select Shift *</label>
                    <select
                      value={shiftId}
                      onChange={(e) => {
                        setShiftId(e.target.value);
                        setSeatId(''); // Reset seat when shift changes
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {shifts.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.startTime} - {s.endTime}) — ₹{s.price}/mo
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Student Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 file:mr-2 file:py-0.5 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                  </div>
                </div>

                {/* Seat & Locker Allocation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Assign Desk / Seat</label>
                    <select
                      value={seatId}
                      onChange={(e) => setSeatId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">-- Select Vacant Seat --</option>
                      {availableSeats.map(seat => (
                        <option key={seat._id} value={seat._id}>
                          {seat.seatNumber} {seat.floor !== undefined ? `(Floor ${seat.floor})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Assign Locker (Optional)</label>
                    <select
                      value={lockerId}
                      onChange={(e) => setLockerId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">-- No Locker --</option>
                      {availableLockers.map(lock => (
                        <option key={lock._id} value={lock._id}>
                          {lock.lockerNumber} (+₹{lock.monthlyRent}/mo)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration & Start Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Duration (Months)</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="1">1 Month</option>
                      <option value="2">2 Months</option>
                      <option value="3">3 Months (Quarterly)</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months (Annual)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Discount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                </div>

                {/* Fee Calculation Summary Box */}
                <div className="bg-brand-50/70 p-3.5 rounded-2xl border border-brand-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-600 block">Total Amount Payable:</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ₹{baseShiftPrice} x {duration} mo {discount > 0 ? `- ₹${discount} disc` : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold font-mono text-brand-700">
                      {formatINR(finalPayable)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Valid till {formatDate(calculatedEndDate)}</span>
                  </div>
                </div>

                {/* Payment Status Choice */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Initial Payment Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['paid', 'partial', 'due'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setPaymentStatus(st)}
                        className={`py-2 text-xs font-bold capitalize rounded-xl border transition-all ${
                          paymentStatus === st
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseAdmitModal}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
                  >
                    Complete Admission
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Student ID Card Preview */}
      {selectedStudentForIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Student ID Card</h3>
              <button onClick={() => setSelectedStudentForIdCard(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable ID Card Badge */}
            <div className="rounded-2xl overflow-hidden border-2 border-slate-800 bg-white shadow-md text-slate-900">
              {/* Card Header */}
              <div className="bg-slate-900 text-white p-3 text-center">
                <div className="text-[10px] font-bold text-brand-300 uppercase tracking-widest">Library Sathi Access Card</div>
                <div className="text-xs font-extrabold truncate">Apex Study Lounge, Delhi</div>
              </div>

              {/* Card Body */}
              <div className="p-4 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 font-extrabold text-2xl flex items-center justify-center mx-auto border-2 border-brand-300 shadow-xs overflow-hidden">
                  {selectedStudentForIdCard.image?.url ? (
                    <img src={selectedStudentForIdCard.image.url} alt={selectedStudentForIdCard.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedStudentForIdCard.name?.[0]
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{selectedStudentForIdCard.name}</h4>
                  <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    ID: {selectedStudentForIdCard.studentId}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seat Desk:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedStudentForIdCard.seat?.seatNumber || selectedStudentForIdCard.seatNumber || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shift:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedStudentForIdCard.shift?.shiftName || selectedStudentForIdCard.shiftName || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Valid Till:</span>
                    <span className="font-mono text-slate-700">
                      {formatDate(selectedStudentForIdCard.subscription?.endDate || selectedStudentForIdCard.endDate)}
                    </span>
                  </div>
                </div>

                {/* QR Code Simulation */}
                <div className="p-2 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 flex flex-col items-center">
                  <QrCode className="w-16 h-16 text-slate-800" />
                  <span className="text-[9px] text-slate-400 mt-1">Scan for Contactless Check-In</span>
                  <div className="mt-1">
                    <UnverifiedBadge type="QR_CODE" size="xs" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Student Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
