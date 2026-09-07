import React from 'react';
import {
  LayoutGrid,
  Clock,
  Receipt,
  KeyRound,
  BookMarked,
  BarChart3,
  QrCode,
  MessageSquare,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { UnverifiedBadge } from '../common/UnverifiedBadge';

export function FeaturesSection() {
  const features = [
    {
      icon: LayoutGrid,
      title: "Dynamic Visual Seat Matrix",
      badge: "Core Feature",
      badgeColor: "bg-brand-50 text-brand-700 border-brand-200",
      description: "Visual floor-wise desk layouts. Color-coded seat statuses: Green (Available), Purple (Occupied), Amber (Reserved). Allocate or vacate seats with a single tap."
    },
    {
      icon: Clock,
      title: "Multi-Shift Time Management",
      badge: "Collision Proof",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      description: "Support for Morning, Afternoon, Evening, and 24x7 Full Day shifts. Our system ensures independent seat occupancy per shift without booking collisions."
    },
    {
      icon: Receipt,
      title: "Computerized Fee Invoicing",
      badge: "Automated",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "Instant invoice generation with unique invoice numbers, GST details, discount deductions, and multiple payment modes (Cash, UPI, Online)."
    },
    {
      icon: KeyRound,
      title: "Digital Locker Grid",
      badge: "Addon Ready",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      description: "Manage physical lockers digitally. Track allocated lockers, student names, monthly locker rentals, and 1-click release upon checkout."
    },
    {
      icon: BookMarked,
      title: "Book Catalog & Lending Fines",
      badge: "Library ERP",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      description: "Maintain your reference book inventory with ISBN, shelf locations, and copies. Auto-calculate overdue fines at ₹10/day upon book return."
    },
    {
      icon: BarChart3,
      title: "Daily Collection & Occupancy Analytics",
      badge: "Real-time",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      description: "Clear dashboard overview of daily cash collection, pending dues, total active students, and peak occupancy percentage across all shifts."
    },
    {
      icon: MessageSquare,
      title: "WhatsApp & SMS Due Alerts",
      unverifiedType: "WHATSAPP_SMS",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      description: "Automated notification reminders sent to students 3 days before fee expiry to eliminate revenue leakage and awkward manual follow-ups."
    },
    {
      icon: QrCode,
      title: "QR Code Attendance & Check-In",
      unverifiedType: "QR_CODE",
      badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
      description: "Contactless student entry check-in via dynamic QR badges printed on customized Library Sathi Student ID cards."
    }
  ];

  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-600 font-extrabold text-xs tracking-wider uppercase bg-brand-100/70 border border-brand-200 px-3 py-1 rounded-full">
            Engineered for Reading Spaces
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Everything You Need to Run a Profitable Library
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Say goodbye to paper registers, WhatsApp reminders, and excel sheets. Library Sathi handles your daily front-desk and back-office operations seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    {feat.unverifiedType ? (
                      <UnverifiedBadge type={feat.unverifiedType} size="xs" />
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${feat.badgeColor}`}>
                        {feat.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2 group-hover:text-brand-600 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-brand-600">
                  <span>Available in Admin Panel</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
