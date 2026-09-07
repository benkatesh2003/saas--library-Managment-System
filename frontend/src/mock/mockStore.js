import {
  INITIAL_ADMIN,
  INITIAL_SHIFTS,
  INITIAL_SEATS,
  INITIAL_STUDENTS,
  INITIAL_LOCKERS,
  INITIAL_BOOKS,
  INITIAL_BOOK_ISSUES,
  INITIAL_PLANS,
  INITIAL_FEATURES,
  INITIAL_SUBSCRIPTIONS
} from './mockData';

const STORAGE_KEYS = {
  ADMIN: 'ls_admin',
  SHIFTS: 'ls_shifts',
  SEATS: 'ls_seats',
  STUDENTS: 'ls_students',
  LOCKERS: 'ls_lockers',
  BOOKS: 'ls_books',
  ISSUES: 'ls_book_issues',
  PLANS: 'ls_plans',
  FEATURES: 'ls_features',
  SUBSCRIPTIONS: 'ls_subscriptions'
};

function load(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    // LocalStorage quota or access error fallback
  }
}

export const mockStore = {
  // Admin Profile
  getAdmin() {
    return load(STORAGE_KEYS.ADMIN, INITIAL_ADMIN);
  },
  updateAdmin(updates) {
    const current = this.getAdmin();
    const updated = { ...current, ...updates };
    save(STORAGE_KEYS.ADMIN, updated);
    return updated;
  },

  // Shifts
  getShifts() {
    return load(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
  },
  addShift(shiftData) {
    const shifts = this.getShifts();
    const newShift = {
      _id: `shift_${Date.now()}`,
      isActive: true,
      maxStudents: shiftData.maxStudents !== undefined ? Number(shiftData.maxStudents) : -1,
      currentStudents: 0,
      ...shiftData
    };
    shifts.push(newShift);
    save(STORAGE_KEYS.SHIFTS, shifts);
    return newShift;
  },
  updateShift(id, updates) {
    const shifts = this.getShifts();
    const idx = shifts.findIndex(s => s._id === id);
    if (idx !== -1) {
      shifts[idx] = { ...shifts[idx], ...updates };
      save(STORAGE_KEYS.SHIFTS, shifts);
      return shifts[idx];
    }
    return null;
  },
  toggleShift(id) {
    const shifts = this.getShifts();
    const shift = shifts.find(s => s._id === id);
    if (shift) {
      shift.isActive = !shift.isActive;
      save(STORAGE_KEYS.SHIFTS, shifts);
      return shift;
    }
    return null;
  },
  deleteShift(id) {
    const shifts = this.getShifts().filter(s => s._id !== id);
    save(STORAGE_KEYS.SHIFTS, shifts);
    return true;
  },

  // Seats
  getSeats() {
    return load(STORAGE_KEYS.SEATS, INITIAL_SEATS);
  },
  getAvailableSeats(shiftId) {
    const seats = this.getSeats();
    return seats.filter(s => {
      const status = s.status || (shiftId && s.shiftOccupancy?.[shiftId]) || "available";
      return status === "available" && s.isActive;
    });
  },
  createSeat(seatData) {
    const seats = this.getSeats();
    const newSeat = {
      _id: `seat_${Date.now()}`,
      isActive: true,
      status: seatData.status || 'available',
      floor: seatData.floor || 'Ground',
      section: seatData.section || null,
      shiftOccupancy: {},
      ...seatData
    };
    seats.push(newSeat);
    save(STORAGE_KEYS.SEATS, seats);
    return newSeat;
  },
  bulkCreateSeats(countOrPayload, floorParam = 'Ground', prefixParam = "S-") {
    const seats = this.getSeats();
    let prefix = prefixParam;
    let start = seats.length + 1;
    let end = start + 9;
    let floor = floorParam;
    let section = null;

    if (typeof countOrPayload === 'object' && countOrPayload !== null) {
      prefix = countOrPayload.prefix !== undefined ? countOrPayload.prefix : 'S-';
      start = countOrPayload.start !== undefined ? Number(countOrPayload.start) : 1;
      end = countOrPayload.end !== undefined ? Number(countOrPayload.end) : 10;
      floor = countOrPayload.floor !== undefined ? countOrPayload.floor : 'Ground';
      section = countOrPayload.section || null;
    } else if (typeof countOrPayload === 'number') {
      const count = countOrPayload;
      floor = floorParam;
      prefix = prefixParam;
      start = seats.length + 1;
      end = start + count - 1;
    }

    const added = [];
    for (let i = start; i <= end; i++) {
      const seat = {
        _id: `seat_${Date.now()}_${i}`,
        seatNumber: `${prefix}${i}`,
        floor: String(floor),
        section: section,
        status: 'available',
        isActive: true,
        shiftOccupancy: {}
      };
      seats.push(seat);
      added.push(seat);
    }
    save(STORAGE_KEYS.SEATS, seats);
    return added;
  },
  updateSeat(id, updates) {
    const seats = this.getSeats();
    const idx = seats.findIndex(s => s._id === id || s.seatNumber === id);
    if (idx !== -1) {
      seats[idx] = { ...seats[idx], ...updates };
      save(STORAGE_KEYS.SEATS, seats);
      return seats[idx];
    }
    return null;
  },
  deleteSeat(id) {
    const seats = this.getSeats();
    const seat = seats.find(s => s._id === id || s.seatNumber === id);
    if (seat && (seat.status === 'occupied' || seat.reservedFor)) {
      return { success: false, message: 'Cannot delete an occupied seat' };
    }
    const filtered = seats.filter(s => s._id !== id && s.seatNumber !== id);
    save(STORAGE_KEYS.SEATS, filtered);
    return { success: true, message: 'Seat deleted successfully' };
  },
  setSeatStatusForShift(seatId, shiftId, status) {
    const seats = this.getSeats();
    const seat = seats.find(s => s._id === seatId || s.seatNumber === seatId);
    if (seat) {
      seat.status = status;
      if (!seat.shiftOccupancy) seat.shiftOccupancy = {};
      if (shiftId) seat.shiftOccupancy[shiftId] = status;
      save(STORAGE_KEYS.SEATS, seats);
      return seat;
    }
    return null;
  },

  // Students
  getStudents() {
    return load(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },
  searchStudents(term) {
    const students = this.getStudents();
    if (!term) return students;
    const lower = term.toLowerCase();
    return students.filter(s =>
      s.name?.toLowerCase().includes(lower) ||
      s.phone?.includes(lower) ||
      s.studentId?.toLowerCase().includes(lower) ||
      s.seatNumber?.toLowerCase().includes(lower)
    );
  },
  admitStudent(data) {
    const students = this.getStudents();
    const studentId = `LS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newStudent = {
      _id: `stu_${Date.now()}`,
      studentId,
      isActive: true,
      createdAt: new Date().toISOString(),
      ...data
    };
    students.unshift(newStudent);
    save(STORAGE_KEYS.STUDENTS, students);

    // If seat and shift provided, mark seat as occupied
    if (data.seatId && data.shiftId) {
      this.setSeatStatusForShift(data.seatId, data.shiftId, "occupied");
    }

    // If locker assigned, mark locker as occupied
    if (data.lockerId) {
      this.assignLocker(data.lockerId, newStudent.name);
    }

    return {
      student: newStudent,
      tempPassword: `${data.name.split(' ')[0].toLowerCase()}@123`,
      invoice: {
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        totalPayable: data.feeAmount || 1200,
        paidAmount: data.paidAmount || 0,
        paymentStatus: data.paymentStatus || 'paid'
      }
    };
  },
  updateStudent(id, updates) {
    const students = this.getStudents();
    const idx = students.findIndex(s => s._id === id);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...updates };
      save(STORAGE_KEYS.STUDENTS, students);
      return students[idx];
    }
    return null;
  },
  deleteStudent(id) {
    const students = this.getStudents();
    const target = students.find(s => s._id === id);
    if (target && target.seatId && target.shiftId) {
      this.setSeatStatusForShift(target.seatId, target.shiftId, "available");
    }
    if (target && target.lockerId) {
      this.releaseLocker(target.lockerId);
    }
    const filtered = students.filter(s => s._id !== id);
    save(STORAGE_KEYS.STUDENTS, filtered);
    return true;
  },

  // Lockers
  getLockers() {
    return load(STORAGE_KEYS.LOCKERS, INITIAL_LOCKERS);
  },
  createLocker(data) {
    const lockers = this.getLockers();
    const newLocker = {
      _id: `lock_${Date.now()}`,
      lockerNumber: data.lockerNumber,
      price: Number(data.price) || 200,
      monthlyRent: Number(data.price) || 200,
      size: data.size || 'medium',
      status: data.status || 'available',
      isOccupied: data.status === 'occupied',
      assignedStudent: null
    };
    lockers.push(newLocker);
    save(STORAGE_KEYS.LOCKERS, lockers);
    return newLocker;
  },
  bulkCreateLockers({ prefix = 'L', start = 1, end = 10, price = 200 }) {
    const lockers = this.getLockers();
    const created = [];
    const cleanPrefix = String(prefix).replace(/-+$/, '');
    for (let i = Number(start); i <= Number(end); i++) {
      const lockerNumber = `${cleanPrefix}-${i}`;
      if (!lockers.some(l => l.lockerNumber === lockerNumber)) {
        const item = {
          _id: `lock_${Date.now()}_${i}`,
          lockerNumber,
          price: Number(price) || 200,
          monthlyRent: Number(price) || 200,
          size: 'medium',
          status: 'available',
          isOccupied: false,
          assignedStudent: null
        };
        lockers.push(item);
        created.push(item);
      }
    }
    save(STORAGE_KEYS.LOCKERS, lockers);
    return created;
  },
  updateLocker(id, updates) {
    const lockers = this.getLockers();
    const idx = lockers.findIndex(l => l._id === id || l.id === id);
    if (idx !== -1) {
      lockers[idx] = {
        ...lockers[idx],
        ...updates,
        price: updates.price !== undefined ? Number(updates.price) : lockers[idx].price,
        monthlyRent: updates.price !== undefined ? Number(updates.price) : lockers[idx].monthlyRent
      };
      save(STORAGE_KEYS.LOCKERS, lockers);
      return lockers[idx];
    }
    return null;
  },
  deleteLocker(id) {
    const lockers = this.getLockers();
    const target = lockers.find(l => l._id === id || l.id === id);
    if (!target) return { success: false, message: 'Locker not found' };
    if (target.status === 'occupied' || target.isOccupied) {
      return { success: false, message: 'Cannot delete an occupied locker' };
    }
    const filtered = lockers.filter(l => l._id !== id && l.id !== id);
    save(STORAGE_KEYS.LOCKERS, filtered);
    return { success: true, message: 'Locker deleted' };
  },
  assignLocker(lockerId, studentName) {
    const lockers = this.getLockers();
    const locker = lockers.find(l => l._id === lockerId || l.lockerNumber === lockerId);
    if (locker) {
      locker.status = "occupied";
      locker.assignedStudent = studentName;
      save(STORAGE_KEYS.LOCKERS, lockers);
      return locker;
    }
    return null;
  },
  releaseLocker(lockerId) {
    const lockers = this.getLockers();
    const locker = lockers.find(l => l._id === lockerId || l.lockerNumber === lockerId);
    if (locker) {
      locker.status = "available";
      locker.assignedStudent = null;
      save(STORAGE_KEYS.LOCKERS, lockers);
      return locker;
    }
    return null;
  },

  // Books & Issues
  getBooks() {
    return load(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  },
  addBook(data) {
    const books = this.getBooks();
    const newBook = {
      _id: `bk_${Date.now()}`,
      availableCopies: data.totalCopies || 1,
      ...data
    };
    books.unshift(newBook);
    save(STORAGE_KEYS.BOOKS, books);
    return newBook;
  },
  updateBook(id, updates) {
    const books = this.getBooks();
    const idx = books.findIndex(b => b._id === id || b.id === id);
    if (idx !== -1) {
      if (updates.totalCopies) {
        const diff = Number(updates.totalCopies) - Number(books[idx].totalCopies || 0);
        updates.availableCopies = Math.max(0, Number(books[idx].availableCopies || 0) + diff);
      }
      books[idx] = { ...books[idx], ...updates };
      save(STORAGE_KEYS.BOOKS, books);
      return books[idx];
    }
    return null;
  },
  deleteBook(id) {
    const books = this.getBooks();
    const target = books.find(b => b._id === id || b.id === id);
    if (!target) return { success: false, message: 'Book not found' };
    const issues = this.getBookIssues();
    const active = issues.filter(i => (i.bookId === id || i.bookId?._id === id) && i.status === 'issued');
    if (active.length > 0) {
      return { success: false, message: 'Cannot delete book with active issues' };
    }
    const filtered = books.filter(b => b._id !== id && b.id !== id);
    save(STORAGE_KEYS.BOOKS, filtered);
    return { success: true, message: 'Book deleted' };
  },
  issueBook({ bookId, studentId, studentName, studentPhone, dueDate }) {
    const books = this.getBooks();
    const book = books.find(b => b._id === bookId);
    if (book && book.availableCopies > 0) {
      book.availableCopies -= 1;
      save(STORAGE_KEYS.BOOKS, books);
    }

    const issues = load(STORAGE_KEYS.ISSUES, INITIAL_BOOK_ISSUES);
    const newIssue = {
      _id: `iss_${Date.now()}`,
      bookId,
      bookTitle: book?.title || "Library Book",
      studentId,
      studentName: studentName || "Student",
      studentPhone: studentPhone || "",
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: "issued",
      fineAmount: 0
    };
    issues.unshift(newIssue);
    save(STORAGE_KEYS.ISSUES, issues);
    return newIssue;
  },
  returnBook(issueId) {
    const issues = load(STORAGE_KEYS.ISSUES, INITIAL_BOOK_ISSUES);
    const issue = issues.find(i => i._id === issueId);
    if (issue) {
      issue.status = "returned";
      issue.returnDate = new Date().toISOString().split('T')[0];
      save(STORAGE_KEYS.ISSUES, issues);

      // Restore book copy
      const books = this.getBooks();
      const book = books.find(b => b._id === issue.bookId);
      if (book) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
        save(STORAGE_KEYS.BOOKS, books);
      }
      return issue;
    }
    return null;
  },
  getBookIssues() {
    return load(STORAGE_KEYS.ISSUES, INITIAL_BOOK_ISSUES);
  },

  // Dashboard Aggregated Stats
  getDashboardStats() {
    const seats = this.getSeats();
    const students = this.getStudents();
    const shifts = this.getShifts();
    const lockers = this.getLockers();
    const books = this.getBooks();

    const totalSeats = seats.length;
    // Count active occupied seats across all shifts
    let totalOccupiedSlots = 0;
    shifts.forEach(shift => {
      seats.forEach(s => {
        if (s.shiftOccupancy?.[shift._id] === "occupied") {
          totalOccupiedSlots++;
        }
      });
    });

    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.isActive).length;
    const dueStudents = students.filter(s => s.paymentStatus === "due");
    const totalDueAmount = dueStudents.reduce((acc, s) => acc + (s.feeAmount || 0), 0);
    const totalRevenue = students.reduce((acc, s) => acc + (s.paidAmount || s.feeAmount || 0), 0);

    const occupiedLockers = lockers.filter(l => l.status === "occupied").length;
    const availableLockers = lockers.length - occupiedLockers;

    return {
      totalSeats,
      totalStudents,
      activeStudents,
      dueStudentsCount: dueStudents.length,
      totalDueAmount,
      totalRevenue,
      activeShiftsCount: shifts.filter(s => s.isActive).length,
      lockers: { total: lockers.length, occupied: occupiedLockers, available: availableLockers },
      books: { total: books.length, available: books.reduce((acc, b) => acc + b.availableCopies, 0) },
      occupancyRate: totalSeats > 0 ? Math.round((totalOccupiedSlots / (totalSeats * shifts.length)) * 100) : 0
    };
  },

  // SaaS Plans (Super Admin)
  getPlans() {
    return load(STORAGE_KEYS.PLANS, INITIAL_PLANS);
  },
  createPlan(planData) {
    const plans = this.getPlans();
    const newPlan = {
      _id: `plan_${Date.now()}`,
      isPopular: false,
      ...planData
    };
    plans.push(newPlan);
    save(STORAGE_KEYS.PLANS, plans);
    return newPlan;
  },
  updatePlan(id, updates) {
    const plans = this.getPlans();
    const idx = plans.findIndex(p => p._id === id);
    if (idx !== -1) {
      plans[idx] = { ...plans[idx], ...updates };
      save(STORAGE_KEYS.PLANS, plans);
      return plans[idx];
    }
    return null;
  },
  deletePlan(id) {
    const plans = this.getPlans().filter(p => p._id !== id);
    save(STORAGE_KEYS.PLANS, plans);
    return true;
  },

  // SaaS Features (Super Admin)
  getFeatures() {
    return load(STORAGE_KEYS.FEATURES, INITIAL_FEATURES);
  },
  addFeature(featureData) {
    const features = this.getFeatures();
    const newFeature = {
      _id: `feat_${Date.now()}`,
      isActive: true,
      ...featureData
    };
    features.unshift(newFeature);
    save(STORAGE_KEYS.FEATURES, features);
    return newFeature;
  },
  updateFeature(id, updates) {
    const features = this.getFeatures();
    const idx = features.findIndex(f => f._id === id);
    if (idx !== -1) {
      features[idx] = { ...features[idx], ...updates };
      save(STORAGE_KEYS.FEATURES, features);
      return features[idx];
    }
    return null;
  },
  toggleFeature(id) {
    const features = this.getFeatures();
    const feat = features.find(f => f._id === id);
    if (feat) {
      feat.isActive = !feat.isActive;
      save(STORAGE_KEYS.FEATURES, features);
      return feat;
    }
    return null;
  },
  deleteFeature(id) {
    const features = this.getFeatures().filter(f => f._id !== id);
    save(STORAGE_KEYS.FEATURES, features);
    return true;
  },

  // Subscriptions (Super Admin)
  getSubscriptions() {
    return load(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
  },
  updateSubscriptionStatus(id, paymentStatus) {
    const subs = this.getSubscriptions();
    const sub = subs.find(s => s._id === id);
    if (sub) {
      sub.paymentStatus = paymentStatus;
      save(STORAGE_KEYS.SUBSCRIPTIONS, subs);
      return sub;
    }
    return null;
  }
};
