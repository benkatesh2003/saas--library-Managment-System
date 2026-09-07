/**
 * Public marketing presentation data for the landing page (librarysathi.in clone).
 * Strictly used for marketing showcases and educational diagrams.
 */

export const LANDING_FAQ = [
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

export const LANDING_TESTIMONIALS = [
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

export const LANDING_PLANS = [
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

export const DEMO_SHIFTS = [
  {
    _id: "demo_shift_morn",
    name: "Morning Shift",
    startTime: "06:00",
    endTime: "12:00",
    price: 600,
    maxStudents: 30,
    currentStudents: 12,
    isActive: true
  },
  {
    _id: "demo_shift_noon",
    name: "Afternoon Shift",
    startTime: "12:00",
    endTime: "18:00",
    price: 600,
    maxStudents: 30,
    currentStudents: 8,
    isActive: true
  },
  {
    _id: "demo_shift_eve",
    name: "Evening Shift",
    startTime: "18:00",
    endTime: "24:00",
    price: 700,
    maxStudents: 30,
    currentStudents: 15,
    isActive: true
  },
  {
    _id: "demo_shift_fullday",
    name: "24-Hour / Full Day Access",
    startTime: "00:00",
    endTime: "23:59",
    price: 1300,
    maxStudents: 50,
    currentStudents: 5,
    isActive: true
  }
];

export const DEMO_SEATS = Array.from({ length: 40 }, (_, i) => {
  const num = i + 1;
  const floor = num <= 20 ? 1 : 2;
  const row = String.fromCharCode(65 + Math.floor((num - 1) % 20 / 5));
  return {
    _id: `demo_seat_${num}`,
    seatNumber: `S-${num < 10 ? '0' + num : num}`,
    floor: floor,
    row: row,
    isActive: true,
    shiftOccupancy: {
      demo_shift_morn: num % 3 === 0 ? "occupied" : (num === 7 ? "reserved" : "available"),
      demo_shift_noon: num % 2 === 0 ? "occupied" : (num === 12 ? "reserved" : "available"),
      demo_shift_eve: num % 4 === 0 ? "occupied" : (num === 5 ? "maintenance" : "available"),
      demo_shift_fullday: num <= 10 ? "occupied" : (num === 15 ? "reserved" : "available")
    }
  };
});
