/**
 * Pre-loaded mock database for standalone Library Sathi frontend.
 * Mirrors exact backend schemas from src/models/
 */

export const INITIAL_ADMIN = {
  _id: "admin_apex_01",
  firstName: "Vikram",
  lastName: "Sharma",
  email: "admin@apexlibrary.in",
  phone: "9876543210",
  libraryName: "Apex Study Library & Reading Lounge",
  address: "Plot 42, Metro Pillar 118, Karol Bagh, New Delhi 110005",
  libraryId: "LIB-DEL-042",
  isVerified: true,
  createdAt: "2024-01-15T10:00:00.000Z"
};

export const INITIAL_SHIFTS = [
  {
    _id: "shift_morn_01",
    name: "Morning Shift",
    startTime: "06:00",
    endTime: "12:00",
    price: 600,
    maxStudents: 30,
    currentStudents: 12,
    isActive: true
  },
  {
    _id: "shift_noon_02",
    name: "Afternoon Shift",
    startTime: "12:00",
    endTime: "18:00",
    price: 600,
    maxStudents: 30,
    currentStudents: 8,
    isActive: true
  },
  {
    _id: "shift_eve_03",
    name: "Evening Shift",
    startTime: "18:00",
    endTime: "24:00",
    price: 700,
    maxStudents: 30,
    currentStudents: 15,
    isActive: true
  },
  {
    _id: "shift_fullday_04",
    name: "24-Hour / Full Day Access",
    startTime: "00:00",
    endTime: "23:59",
    price: 1300,
    maxStudents: 50,
    currentStudents: 5,
    isActive: true
  }
];

export const INITIAL_SEATS = Array.from({ length: 40 }, (_, i) => {
  const num = i + 1;
  const floor = num <= 20 ? 1 : 2;
  const row = String.fromCharCode(65 + Math.floor((num - 1) % 20 / 5)); // A, B, C, D
  return {
    _id: `seat_${num}`,
    seatNumber: `S-${num < 10 ? '0' + num : num}`,
    floor: floor,
    row: row,
    isActive: true,
    // Per-shift occupancy map
    shiftOccupancy: {
      shift_morn_01: num % 3 === 0 ? "occupied" : (num === 7 ? "reserved" : "available"),
      shift_noon_02: num % 2 === 0 ? "occupied" : (num === 12 ? "reserved" : "available"),
      shift_eve_03: num % 4 === 0 ? "occupied" : (num === 5 ? "maintenance" : "available"),
      shift_fullday_04: num <= 10 ? "occupied" : (num === 15 ? "reserved" : "available")
    }
  };
});

export const INITIAL_STUDENTS = [
  {
    _id: "stu_1001",
    studentId: "LS-2401",
    name: "Rahul Kumar",
    email: "rahul.upsc@gmail.com",
    phone: "9811223344",
    address: "Patel Nagar, New Delhi",
    shiftId: "shift_morn_01",
    seatId: "seat_3",
    seatNumber: "S-03",
    shiftName: "Morning Shift",
    lockerId: "lock_01",
    lockerNumber: "L-01",
    startDate: "2026-08-01",
    endDate: "2026-11-01",
    duration: 3,
    discount: 0,
    feeAmount: 1800,
    paidAmount: 1800,
    paymentStatus: "paid",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "stu_1002",
    studentId: "LS-2402",
    name: "Priya Sharma",
    email: "priya.sharma99@gmail.com",
    phone: "9822334455",
    address: "Rajendra Nagar, New Delhi",
    shiftId: "shift_noon_02",
    seatId: "seat_6",
    seatNumber: "S-06",
    shiftName: "Afternoon Shift",
    lockerId: "lock_04",
    lockerNumber: "L-04",
    startDate: "2026-08-15",
    endDate: "2026-09-15",
    duration: 1,
    discount: 50,
    feeAmount: 550,
    paidAmount: 550,
    paymentStatus: "paid",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "stu_1003",
    studentId: "LS-2403",
    name: "Amit Patel",
    email: "amit.patel.ca@gmail.com",
    phone: "9833445566",
    address: "Karol Bagh, New Delhi",
    shiftId: "shift_fullday_04",
    seatId: "seat_1",
    seatNumber: "S-01",
    shiftName: "24-Hour / Full Day Access",
    lockerId: null,
    lockerNumber: null,
    startDate: "2026-09-01",
    endDate: "2026-12-01",
    duration: 3,
    discount: 100,
    feeAmount: 3800,
    paidAmount: 0,
    paymentStatus: "due",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "stu_1004",
    studentId: "LS-2404",
    name: "Neha Verma",
    email: "neha.verma.ssc@gmail.com",
    phone: "9844556677",
    address: "Pusa Road, New Delhi",
    shiftId: "shift_eve_03",
    seatId: "seat_8",
    seatNumber: "S-08",
    shiftName: "Evening Shift",
    lockerId: "lock_08",
    lockerNumber: "L-08",
    startDate: "2026-08-20",
    endDate: "2026-10-20",
    duration: 2,
    discount: 0,
    feeAmount: 1400,
    paidAmount: 700,
    paymentStatus: "partial",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "stu_1005",
    studentId: "LS-2405",
    name: "Rohan Gupta",
    email: "rohan.gate@gmail.com",
    phone: "9855667788",
    address: "Shadipur, New Delhi",
    shiftId: "shift_morn_01",
    seatId: "seat_9",
    seatNumber: "S-09",
    shiftName: "Morning Shift",
    lockerId: null,
    lockerNumber: null,
    startDate: "2026-09-01",
    endDate: "2026-10-01",
    duration: 1,
    discount: 0,
    feeAmount: 600,
    paidAmount: 600,
    paymentStatus: "paid",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "stu_1006",
    studentId: "LS-2406",
    name: "Anjali Mishra",
    email: "anjali.judiciary@gmail.com",
    phone: "9866778899",
    address: "Mukherjee Nagar, Delhi",
    shiftId: "shift_fullday_04",
    seatId: "seat_2",
    seatNumber: "S-02",
    shiftName: "24-Hour / Full Day Access",
    lockerId: "lock_02",
    lockerNumber: "L-02",
    startDate: "2026-07-01",
    endDate: "2026-10-01",
    duration: 3,
    discount: 200,
    feeAmount: 3700,
    paidAmount: 3700,
    paymentStatus: "paid",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  }
];

export const INITIAL_LOCKERS = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  const numStr = num < 10 ? '0' + num : `${num}`;
  const isOccupied = [1, 2, 4, 8].includes(num);
  return {
    _id: `lock_${numStr}`,
    lockerNumber: `L-${numStr}`,
    status: isOccupied ? "occupied" : "available",
    monthlyRent: 200,
    assignedStudent: isOccupied
      ? INITIAL_STUDENTS.find(s => s.lockerNumber === `L-${numStr}`)?.name || "Assigned Student"
      : null
  };
});

export const INITIAL_BOOKS = [
  {
    _id: "bk_01",
    title: "Indian Polity (7th Edition)",
    author: "M. Laxmikanth",
    isbn: "978-9355325013",
    publisher: "McGraw Hill India",
    category: "Civil Services / UPSC",
    totalCopies: 6,
    availableCopies: 4,
    shelfLocation: "Shelf A-1",
    description: "The gold standard reference book for UPSC CSE preparation"
  },
  {
    _id: "bk_02",
    title: "A Brief History of Modern India",
    author: "Rajiv Ahir (Spectrum)",
    isbn: "978-8179307731",
    publisher: "Spectrum Books",
    category: "Modern History",
    totalCopies: 8,
    availableCopies: 5,
    shelfLocation: "Shelf A-2",
    description: "Chronological narrative of modern Indian history and freedom movement"
  },
  {
    _id: "bk_03",
    title: "Indian Economy for Civil Services",
    author: "Ramesh Singh",
    isbn: "978-9355324542",
    publisher: "McGraw Hill India",
    category: "Economics",
    totalCopies: 5,
    availableCopies: 3,
    shelfLocation: "Shelf B-1",
    description: "Comprehensive guide for national income, fiscal policies, and economic surveys"
  },
  {
    _id: "bk_04",
    title: "Certificate Physical and Human Geography",
    author: "G.C. Leong",
    isbn: "978-0195628166",
    publisher: "Oxford University Press",
    category: "Geography",
    totalCopies: 6,
    availableCopies: 6,
    shelfLocation: "Shelf B-2",
    description: "Essential geographical concepts, weather patterns, and climatology"
  },
  {
    _id: "bk_05",
    title: "Quantitative Aptitude for Competitive Exams",
    author: "R.S. Aggarwal",
    isbn: "978-9352534029",
    publisher: "S. Chand",
    category: "Banking & SSC",
    totalCopies: 10,
    availableCopies: 7,
    shelfLocation: "Shelf C-1",
    description: "Formulae, shortcuts, and practice sets for general aptitude"
  }
];

export const INITIAL_BOOK_ISSUES = [
  {
    _id: "iss_01",
    bookId: "bk_01",
    bookTitle: "Indian Polity (7th Edition)",
    studentId: "stu_1001",
    studentName: "Rahul Kumar",
    studentPhone: "9811223344",
    issueDate: "2026-08-25",
    dueDate: "2026-09-08",
    status: "issued",
    fineAmount: 0
  },
  {
    _id: "iss_02",
    bookId: "bk_02",
    bookTitle: "A Brief History of Modern India",
    studentId: "stu_1002",
    studentName: "Priya Sharma",
    studentPhone: "9822334455",
    issueDate: "2026-08-20",
    dueDate: "2026-09-03",
    status: "issued",
    fineAmount: 20 // Overdue fine preview
  },
  {
    _id: "iss_03",
    bookId: "bk_03",
    bookTitle: "Indian Economy for Civil Services",
    studentId: "stu_1004",
    studentName: "Neha Verma",
    studentPhone: "9844556677",
    issueDate: "2026-08-10",
    dueDate: "2026-08-24",
    returnDate: "2026-08-23",
    status: "returned",
    fineAmount: 0
  }
];

export const INITIAL_PLANS = [
  {
    _id: "plan_basic",
    name: "Starter / Silver",
    description: "Best for single-room study centers & newly opened libraries up to 50 seats",
    monthlyPrice: 599,
    yearlyPrice: 5990,
    maxSeats: 50,
    maxStudents: 100,
    features: ["Seat Allocation & Visual Map", "Shift Timings (Up to 3 shifts)", "Student Admission & Fee Receipts", "Basic Expense Tracker"],
    isPopular: false
  },
  {
    _id: "plan_pro",
    name: "Growth / Gold",
    description: "Most popular for established libraries & study reading halls up to 150 seats",
    monthlyPrice: 1199,
    yearlyPrice: 11990,
    maxSeats: 150,
    maxStudents: 350,
    features: ["Everything in Starter", "Unlimited Shifts & 24/7 Access", "Digital Locker Grid Management", "Book Lending & Overdue Fines", "Automated Fee Due Reminders", "Export to Excel / PDF Reports"],
    isPopular: true
  },
  {
    _id: "plan_elite",
    name: "Elite / Platinum",
    description: "Designed for high-capacity centers, multi-floor hubs, and franchise branches",
    monthlyPrice: 2199,
    yearlyPrice: 21990,
    maxSeats: 500,
    maxStudents: 1200,
    features: ["Everything in Growth", "Multi-Branch Consolidated Dashboard", "Student Self-Service Portal", "Priority WhatsApp & Call Support", "Custom Library ID Card Generator", "Dedicated Account Manager"],
    isPopular: false
  }
];

export const INITIAL_FAQ = [
  {
    q: "Is Library Sathi only for traditional book libraries or also for self-study reading rooms?",
    a: "Library Sathi is specifically engineered for modern self-study centers, reading rooms, coaching libraries, and co-working spaces in India. While it includes book cataloging, its core strength lies in seat allocation, multi-shift timings (morning, evening, 24x7), student fee collection, and locker management."
  },
  {
    q: "How does the Seat & Shift collision prevention work?",
    a: "Our visual seat matrix ensures that a seat allocated in the Morning shift (06:00-12:00) can still be safely allocated to another student in the Afternoon shift (12:00-18:00) without any overlap. The system automatically warns you and prevents double bookings for the same shift timing."
  },
  {
    q: "Can I manage digital lockers alongside seat allocations?",
    a: "Yes! You can configure your exact locker grid (L-01, L-02...), assign them during student admission, set monthly locker rental fees, and release lockers with a single click upon checkout."
  },
  {
    q: "Do I need to install heavy software or hardware scanners?",
    a: "No special hardware is required. Library Sathi is 100% cloud-based (SaaS). You can access your admin panel from your laptop, desktop, tablet, or smartphone browser anytime, anywhere."
  },
  {
    q: "How are fee receipts and student dues handled?",
    a: "Every admission generates a computerized GST/non-GST fee receipt with unique invoice number, shift, seat number, and validity dates. You can print receipts directly or share them via WhatsApp/Email."
  }
];

export const INITIAL_TESTIMONIALS = [
  {
    name: "Er. Ramesh Kulkarni",
    role: "Founder, Saraswati Study Point",
    city: "Karol Bagh, Delhi (180 Seats)",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
    quote: "Earlier we had huge confusion during shift changes between 12 PM and 6 PM. Students were fighting over desk spaces. Library Sathi completely solved seat overlapping, and our fee due leakage dropped to zero."
  },
  {
    name: "Dr. Sunita Choudhary",
    role: "Director, Lakshya Reading Hall",
    city: "Boring Road, Patna (120 Seats)",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    quote: "The visual seat layout is brilliant. Whenever a new student visits, we simply show them the green available seats on the tablet screen. Admissions happen in under two minutes!"
  },
  {
    name: "Kapil Verma",
    role: "Owner, Toppers Library",
    city: "Talwandi, Kota (250 Seats)",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    quote: "Managing 250 seats across 4 shifts in Kota was a nightmare on paper registers. Library Sathi gave me total control, automated fee reminders, and clear profit analytics."
  }
];

export const INITIAL_FEATURES = [
  {
    _id: "feat_01",
    name: "Automated WhatsApp Alerts & Reminders",
    code: "FEAT_WHATSAPP_ALERTS",
    description: "Sends automated WhatsApp messages to students when admission is completed, fee is due, or book return date arrives.",
    type: "addon",
    pricing: { monthly: 299, yearly: 2990 },
    isActive: true
  },
  {
    _id: "feat_02",
    name: "QR Code Attendance & Turnstile Gate Sync",
    code: "FEAT_QR_ATTENDANCE",
    description: "Generates dynamic student QR pass for check-in/check-out logs and automated library entry gating.",
    type: "core",
    pricing: { monthly: 499, yearly: 4990 },
    isActive: true
  },
  {
    _id: "feat_03",
    name: "Digital Locker Matrix & Lock Logs",
    code: "FEAT_LOCKER_MATRIX",
    description: "Visual locker grid with student assignment, deposit security tracking, and rental fee billing.",
    type: "core",
    pricing: { monthly: 199, yearly: 1990 },
    isActive: true
  },
  {
    _id: "feat_04",
    name: "Book Cataloging & Automatic Overdue Fines",
    code: "FEAT_BOOK_LENDING",
    description: "Lending register, barcode/ISBN tracking, due-date calculation, and daily overdue fine calculations.",
    type: "core",
    pricing: { monthly: 249, yearly: 2490 },
    isActive: true
  },
  {
    _id: "feat_05",
    name: "Student Self-Service Portal",
    code: "FEAT_STUDENT_PORTAL",
    description: "Dedicated mobile-friendly student portal for checking allocated desk, shift hours, and downloading tax invoices.",
    type: "addon",
    pricing: { monthly: 399, yearly: 3990 },
    isActive: true
  },
  {
    _id: "feat_06",
    name: "Multi-Branch Consolidated SaaS Hierarchy",
    code: "FEAT_MULTI_BRANCH",
    description: "Centralized owner dashboard across multiple library branches in different cities with unified financial analytics.",
    type: "enterprise",
    pricing: { monthly: 999, yearly: 9990 },
    isActive: false
  }
];

export const INITIAL_SUBSCRIPTIONS = [
  {
    _id: "sub_01",
    adminId: { _id: "admin_01", libraryName: "Apex Study Library", email: "vikram@apexlibrary.in" },
    planId: { _id: "plan_pro", name: "Growth / Gold" },
    billingCycle: "monthly",
    totalAmount: 1199,
    finalAmount: 1199,
    paymentStatus: "paid",
    razorpayOrderId: "order_mock_001",
    razorpayPaymentId: "pay_mock_981",
    startDate: "2026-08-01",
    endDate: "2026-09-01",
    createdAt: "2026-08-01T10:00:00.000Z"
  },
  {
    _id: "sub_02",
    adminId: { _id: "admin_02", libraryName: "Lakshya Reading Hall", email: "sunita@lakshyalibrary.in" },
    planId: { _id: "plan_elite", name: "Elite / Platinum" },
    billingCycle: "yearly",
    totalAmount: 21990,
    finalAmount: 19791,
    paymentStatus: "paid",
    razorpayOrderId: "order_mock_002",
    razorpayPaymentId: "pay_mock_982",
    startDate: "2026-01-01",
    endDate: "2027-01-01",
    createdAt: "2026-01-01T09:30:00.000Z"
  },
  {
    _id: "sub_03",
    adminId: { _id: "admin_03", libraryName: "Toppers Library Kota", email: "kapil@topperskota.in" },
    planId: { _id: "plan_elite", name: "Elite / Platinum" },
    billingCycle: "monthly",
    totalAmount: 2199,
    finalAmount: 2199,
    paymentStatus: "paid",
    razorpayOrderId: "order_mock_003",
    razorpayPaymentId: "pay_mock_983",
    startDate: "2026-08-15",
    endDate: "2026-09-15",
    createdAt: "2026-08-15T11:20:00.000Z"
  },
  {
    _id: "sub_04",
    adminId: { _id: "admin_04", libraryName: "Saraswati Reading Point", email: "ramesh@saraswatipoint.in" },
    planId: { _id: "plan_basic", name: "Starter / Silver" },
    billingCycle: "monthly",
    totalAmount: 599,
    finalAmount: 599,
    paymentStatus: "created",
    razorpayOrderId: "order_mock_004",
    razorpayPaymentId: null,
    startDate: "2026-09-01",
    endDate: "2026-10-01",
    createdAt: "2026-09-01T08:00:00.000Z"
  },
  {
    _id: "sub_05",
    adminId: { _id: "admin_05", libraryName: "Awadh Study Center", email: "rizwan@awadhstudy.in" },
    planId: { _id: "plan_pro", name: "Growth / Gold" },
    billingCycle: "monthly",
    totalAmount: 1199,
    finalAmount: 1199,
    paymentStatus: "failed",
    razorpayOrderId: "order_mock_005",
    razorpayPaymentId: null,
    startDate: "2026-08-28",
    endDate: "2026-09-28",
    createdAt: "2026-08-28T14:45:00.000Z"
  }
];
