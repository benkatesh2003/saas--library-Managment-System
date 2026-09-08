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
import { api } from '../../services/apiClient';
import { formatINR, formatDate } from '../../utils/formatters';
import { useRazorpay } from '../../hooks/useRazorpay';

export function StudentsManagement() {
  const [searchParams] = useSearchParams();
  const { openCheckout } = useRazorpay();
  const [students, setStudents] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [seats, setSeats] = useState([]);
  const [lockers, setLockers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [payingStudentId, setPayingStudentId] = useState(null);

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
  const [payWithRazorpayNow, setPayWithRazorpayNow] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoFile, setPhotoFile] = useState(null);

  // Load live data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, shiftsRes, seatsRes, lockersRes] = await Promise.all([
        api.students.getAll(),
        api.shifts.getAll(),
        api.seats.getAll(),
        api.lockers.getAll()
      ]);

      if (studentsRes.success) {
        setStudents(studentsRes.data?.students || []);
      }
      if (shiftsRes.success) {
        const liveShifts = shiftsRes.data?.shifts || [];
        setShifts(liveShifts);
        if (liveShifts.length > 0 && !shiftId) {
          setShiftId(liveShifts[0]._id);
        }
      }
      if (seatsRes.success) {
        setSeats(seatsRes.data?.seats || []);
      }
      if (lockersRes.success) {
        setLockers(lockersRes.data?.lockers || []);
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
  const availableSeats = seats.filter(s => s.status === 'available');

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
      paymentStatus: payWithRazorpayNow ? 'due' : paymentStatus
    };

    try {
      const res = await api.students.admit(payload, photoFile);
      if (res.success) {
        setAdmittedStudentResult(res.data);
        await loadData();
        if (payWithRazorpayNow && res.data?.student) {
          handleCollectFee(res.data.student);
        }
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

  const handleCollectFee = async (student) => {
    setPayingStudentId(student._id);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.studentPayments.createOrder({ studentId: student._id });
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to initialize fee payment order');
      }

      const { orderId, amount, currency, key } = res.data;

      openCheckout({
        key,
        orderId,
        amount,
        currency,
        name: 'Library Sathi',
        description: `Fee Collection for ${student.name} (${student.studentId})`,
        prefill: {
          name: student.name,
          email: student.email || '',
          contact: student.phone || '',
        },
        theme: { color: '#4f46e5' },
        onSuccess: async (response) => {
          try {
            setActionSuccess(`Verifying fee payment for ${student.name}...`);
            const verifyRes = await api.studentPayments.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setActionSuccess(`Fee payment received for ${student.name}! Status updated to Paid.`);
              await loadData();
            } else {
              setActionError(verifyRes.message || 'Fee payment verification failed');
            }
          } catch (verErr) {
            setActionError(`Verification error: ${verErr.message}`);
          } finally {
            setPayingStudentId(null);
          }
        },
        onError: (err) => {
          setActionError(err.description || err.message || 'Payment cancelled or failed');
          setPayingStudentId(null);
        },
        onDismiss: () => {
          setPayingStudentId(null);
        },
      });
    } catch (err) {
      setActionError(err.message || 'Could not initiate Razorpay fee collection');
      setPayingStudentId(null);
    }
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Student Directory & Admissions</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage student enrollments, desk reservations, fee payments, and digital passes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 shadow-2xs"
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
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-3.5 py-1.5 rounded-md shadow-2xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* Notifications / Error Banners */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md flex items-center justify-between text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={loadData} className="font-medium underline hover:no-underline">Retry</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md flex items-center justify-between text-rose-800 text-xs">
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
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-between text-emerald-800 text-xs">
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
      <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name, mobile, ID, or desk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Shift Filter */}
          <select
            value={selectedShiftFilter}
            onChange={(e) => setSelectedShiftFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white text-neutral-700 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
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
            className="px-2.5 py-1.5 text-xs bg-white text-neutral-700 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
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
            className="px-2.5 py-1.5 text-xs bg-white text-neutral-700 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Student Directory Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Student Profile</th>
                <th className="py-2.5 px-4">Desk</th>
                <th className="py-2.5 px-4">Shift</th>
                <th className="py-2.5 px-4">Locker</th>
                <th className="py-2.5 px-4">Expiry</th>
                <th className="py-2.5 px-4">Fee Status</th>
                <th className="py-2.5 px-4">Membership</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-neutral-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-neutral-500 mb-2" />
                    <p className="text-xs">Loading live students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-neutral-400">
                    No students found matching your filters.
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
                    <tr key={s._id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Student Info */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {s.image?.url ? (
                            <img
                              src={s.image.url}
                              alt={s.name}
                              className="w-7 h-7 rounded-full object-cover border border-neutral-200 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-800 font-semibold flex items-center justify-center text-xs shrink-0 border border-neutral-200">
                              {s.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-neutral-900 text-xs">
                              {s.name}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span className="font-medium text-neutral-600">{s.studentId}</span>
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
                      <td className="py-2.5 px-4">
                        {seatNumber ? (
                          <span className="font-mono font-medium text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded text-[11px]">
                            {seatNumber}
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* Shift */}
                      <td className="py-2.5 px-4 text-neutral-700">
                        {shiftName || <span className="text-neutral-400 italic">—</span>}
                      </td>

                      {/* Locker */}
                      <td className="py-2.5 px-4">
                        {lockerNumber ? (
                          <span className="font-mono text-neutral-700 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded text-[11px]">
                            {lockerNumber}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-2.5 px-4 font-mono text-neutral-600 text-[11px]">
                        {endDate ? formatDate(endDate) : '—'}
                      </td>

                      {/* Fee Status */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                            s.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : s.paymentStatus === 'due'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {s.paymentStatus || 'due'}
                          </span>
                          {s.paymentStatus !== 'paid' && !isDeactivated && (
                            <button
                              onClick={() => handleCollectFee(s)}
                              disabled={payingStudentId === s._id}
                              title="Collect fee via Razorpay"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-[10px] font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                            >
                              <CreditCard className="w-2.5 h-2.5" />
                              <span>{payingStudentId === s._id ? '...' : 'Pay'}</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="py-2.5 px-4">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          !isDeactivated
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                        }`}>
                          {!isDeactivated ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedStudentForIdCard(s)}
                            title="Generate Student ID Card"
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s._id)}
                            disabled={actionLoading || isDeactivated}
                            title={isDeactivated ? "Student already deactivated" : "Deactivate Student"}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-dropdown border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Student Admission</h3>
                <span className="text-[11px] text-neutral-500">Assign seat, shift timings, and register dues</span>
              </div>
              <button onClick={handleCloseAdmitModal} className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            {admittedStudentResult ? (
              <div className="text-center py-5 space-y-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-neutral-900">Admission Completed</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Student ID: <strong className="font-mono text-neutral-900">{admittedStudentResult.student?.studentId}</strong>
                  </p>
                </div>

                <div className="bg-neutral-50 p-3.5 rounded-md border border-neutral-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Student Name:</span>
                    <span className="font-semibold text-neutral-900">{admittedStudentResult.student?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Allocated Desk:</span>
                    <span className="font-mono font-bold text-neutral-900">
                      {admittedStudentResult.student?.seat?.seatNumber || admittedStudentResult.student?.seatNumber || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Shift Schedule:</span>
                    <span className="text-neutral-800">
                      {admittedStudentResult.student?.shift?.shiftName || admittedStudentResult.student?.shiftName || 'Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Invoice Number:</span>
                    <span className="font-mono text-neutral-800">
                      {admittedStudentResult.invoice?.invoiceNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-200">
                    <span className="text-neutral-500">Portal Password:</span>
                    <span className="font-mono font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                      {admittedStudentResult.tempPassword || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {admittedStudentResult.student?.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => handleCollectFee(admittedStudentResult.student)}
                      className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Fee Online</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedStudentForIdCard(admittedStudentResult.student);
                      setAdmittedStudentResult(null);
                      setIsAdmitModalOpen(false);
                    }}
                    className="px-3.5 py-1.5 rounded-md text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5 shadow-2xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Print Pass</span>
                  </button>
                  <button
                    onClick={handleCloseAdmitModal}
                    className="px-4 py-1.5 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdmitSubmit} className="space-y-3.5">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Full name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Rahul Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Mobile number *</label>
                    <input
                      required
                      type="tel"
                      placeholder="9811223344"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                {/* Email & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Email address</label>
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Address</label>
                    <input
                      type="text"
                      placeholder="Karol Bagh, Delhi"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                {/* Shift Selection & Photo Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Shift schedule *</label>
                    <select
                      value={shiftId}
                      onChange={(e) => {
                        setShiftId(e.target.value);
                        setSeatId('');
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    >
                      {shifts.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.startTime} - {s.endTime}) — ₹{s.price}/mo
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-medium file:bg-neutral-100 file:text-neutral-800"
                    />
                  </div>
                </div>

                {/* Seat & Locker Allocation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Desk allocation</label>
                    <select
                      value={seatId}
                      onChange={(e) => setSeatId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
                    >
                      <option value="">-- Select Vacant Desk --</option>
                      {availableSeats.map(seat => (
                        <option key={seat._id} value={seat._id}>
                          Desk {seat.seatNumber} {seat.floor !== undefined ? `(Floor ${seat.floor})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Locker (Optional)</label>
                    <select
                      value={lockerId}
                      onChange={(e) => setLockerId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
                    >
                      <option value="">-- None --</option>
                      {availableLockers.map(lock => (
                        <option key={lock._id} value={lock._id}>
                          Locker {lock.lockerNumber} (+₹{lock.monthlyRent}/mo)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration & Start Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
                    >
                      <option value="1">1 Month</option>
                      <option value="2">2 Months</option>
                      <option value="3">3 Months (Quarterly)</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months (Annual)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Discount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
                    />
                  </div>
                </div>

                {/* Fee Calculation Summary Box */}
                <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-neutral-600 block">Total Payable:</span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      ₹{baseShiftPrice} x {duration} mo {discount > 0 ? `- ₹${discount} discount` : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-neutral-900">
                      {formatINR(finalPayable)}
                    </span>
                    <span className="text-[10px] text-neutral-500 block">Valid until {formatDate(calculatedEndDate)}</span>
                  </div>
                </div>

                {/* Payment Status Choice */}
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Payment status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['paid', 'partial', 'due'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setPaymentStatus(st);
                          if (st === 'paid') setPayWithRazorpayNow(false);
                        }}
                        className={`py-1.5 text-xs font-medium capitalize rounded-md border transition-colors ${
                          paymentStatus === st && !payWithRazorpayNow
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <label className="mt-2.5 flex items-center gap-2 text-xs text-neutral-700 font-medium cursor-pointer bg-neutral-50 hover:bg-neutral-100 p-2.5 rounded-md border border-neutral-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={payWithRazorpayNow}
                      onChange={(e) => setPayWithRazorpayNow(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <CreditCard className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <span>Collect fee instantly via Razorpay online payment</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-150">
                  <button
                    type="button"
                    onClick={handleCloseAdmitModal}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-2xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-dropdown border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900">Student Access Pass</h3>
              <button onClick={() => setSelectedStudentForIdCard(null)} className="text-neutral-400 hover:text-neutral-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable ID Card Badge */}
            <div className="rounded-lg overflow-hidden border border-neutral-300 bg-white shadow-xs text-neutral-900">
              {/* Card Header */}
              <div className="bg-neutral-900 text-white p-3 text-center">
                <div className="text-[10px] font-mono font-medium text-neutral-400 uppercase tracking-wider">LibrarySathi Member Pass</div>
                <div className="text-xs font-semibold truncate mt-0.5">Reading Space Verification</div>
              </div>

              {/* Card Body */}
              <div className="p-4 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-800 font-bold text-xl flex items-center justify-center mx-auto border border-neutral-200 overflow-hidden">
                  {selectedStudentForIdCard.image?.url ? (
                    <img src={selectedStudentForIdCard.image.url} alt={selectedStudentForIdCard.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedStudentForIdCard.name?.[0]
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{selectedStudentForIdCard.name}</h4>
                  <span className="text-xs font-mono text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded mt-1 inline-block">
                    {selectedStudentForIdCard.studentId}
                  </span>
                </div>

                <div className="bg-neutral-50 p-2.5 rounded-md border border-neutral-200 text-xs space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Desk:</span>
                    <span className="font-mono font-semibold text-neutral-900">
                      {selectedStudentForIdCard.seat?.seatNumber || selectedStudentForIdCard.seatNumber || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Shift:</span>
                    <span className="text-neutral-800">
                      {selectedStudentForIdCard.shift?.shiftName || selectedStudentForIdCard.shiftName || 'Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Valid Until:</span>
                    <span className="font-mono text-neutral-700">
                      {formatDate(selectedStudentForIdCard.subscription?.endDate || selectedStudentForIdCard.endDate)}
                    </span>
                  </div>
                </div>

                {/* QR Code Simulation */}
                <div className="p-2 border border-dashed border-neutral-300 rounded-md bg-neutral-50 flex flex-col items-center">
                  <QrCode className="w-12 h-12 text-neutral-800" />
                  <span className="text-[9px] text-neutral-400 mt-1">Access Check-In Barcode</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2 rounded-md text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
