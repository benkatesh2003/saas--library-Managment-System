/**
 * Application Constants
 */

export const APP_NAME = "Library Sathi";
export const TAGLINE = "Smart Library & Co-Working Space Management Software in India";
export const SUPPORT_EMAIL = "librarysathi07@gmail.com";
export const SUPPORT_PHONE = "+91 98765 43210";

/**
 * UNVERIFIED INTEGRATIONS NOTICE
 * Explicitly marking integrations that require third-party service credentials.
 */
export const UNVERIFIED_NOTICES = {
  RAZORPAY: {
    title: "Integration Notice: Razorpay Gateway",
    badge: "Gateway Config",
    description: "Online checkout order creation connects to backend. Real payment settlement requires merchant gateway key configuration.",
    type: "warning"
  },
  GOOGLE_OAUTH: {
    title: "Integration Notice: Google OAuth",
    badge: "OAuth Setup",
    description: "Google Sign-In requires active Google Cloud OAuth Client ID configuration.",
    type: "info"
  },
  WHATSAPP_SMS: {
    title: "Integration Notice: WhatsApp & SMS Alerts",
    badge: "Gateway Setup",
    description: "Automated SMS/WhatsApp fee reminders and admission receipts require third-party SMS/WhatsApp gateway credentials.",
    type: "info"
  },
  QR_CODE: {
    title: "Integration Notice: Dynamic QR Generation",
    badge: "Scanner Sync",
    description: "QR attendance and seat check-in generation is visually enabled pending turnstile hardware sync.",
    type: "info"
  },
  STUDENT_AUTH: {
    title: "Integration Notice: Student Authentication",
    badge: "Live Auth",
    description: "Student portal login runs directly against live backend JWT authentication on port 5000.",
    type: "info"
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
