/**
 * Application Constants
 */

export const APP_NAME = "Library Sathi";
export const TAGLINE = "Smart Library & Co-Working Space Management Software in India";
export const SUPPORT_EMAIL = "librarysathi07@gmail.com";
export const SUPPORT_PHONE = "+91 98765 43210";

/**
 * UNVERIFIED INTEGRATIONS NOTICE
 * Explicitly marking integrations that are mocks or pending live backend verification.
 */
export const UNVERIFIED_NOTICES = {
  RAZORPAY: {
    title: "Unverified Integration: Razorpay",
    badge: "Mock Payment Gateway",
    description: "Online checkout and webhook verification are simulated locally. No real charges are processed.",
    type: "warning"
  },
  GOOGLE_OAUTH: {
    title: "Unverified Integration: Google OAuth",
    badge: "Mock OAuth Flow",
    description: "Google Sign-In is simulated in frontend mock mode. Token verification requires production backend configuration.",
    type: "warning"
  },
  WHATSAPP_SMS: {
    title: "Unverified Integration: WhatsApp & SMS Alerts",
    badge: "Upcoming Integration",
    description: "Automated SMS/WhatsApp fee reminders and admission receipts require third-party SMS/WhatsApp gateway credentials.",
    type: "info"
  },
  QR_CODE: {
    title: "Unverified Integration: Dynamic QR Generation",
    badge: "Preview Feature",
    description: "QR attendance and seat check-in generation is a client-side visual simulation pending hardware/scanner sync.",
    type: "info"
  },
  STUDENT_AUTH: {
    title: "Unverified Integration: Student Authentication",
    badge: "Mock Auth Mode",
    description: "Student portal login runs against local mock store. Requires production backend JWT sync when live.",
    type: "warning"
  }
};

export const SEAT_STATUS = {
  AVAILABLE: { label: "Available", color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  OCCUPIED: { label: "Occupied", color: "bg-brand-600", text: "text-brand-700", bg: "bg-brand-50", border: "border-brand-200" },
  RESERVED: { label: "Reserved", color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  MAINTENANCE: { label: "Maintenance", color: "bg-slate-400", text: "text-slate-700", bg: "bg-slate-100", border: "border-slate-300" },
};

export const PAYMENT_STATUS = {
  PAID: { label: "Paid", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  DUE: { label: "Due", badge: "bg-rose-100 text-rose-800 border-rose-200" },
  PARTIAL: { label: "Partial", badge: "bg-amber-100 text-amber-800 border-amber-200" },
};
