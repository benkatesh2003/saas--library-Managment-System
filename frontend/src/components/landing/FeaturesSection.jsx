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
      badge: "Core Module",
      badgeColor: "bg-neutral-100 text-neutral-700 border-neutral-200 font-mono",
      description: "Visual floor-wise desk layouts. Color-coded desk statuses with real-time occupancy. Allocate or vacate seats with a single tap."
    },
    {
      icon: Clock,
      title: "Multi-Shift Time Engine",
      badge: "Collision Proof",
      badgeColor: "bg-neutral-100 text-neutral-700 border-neutral-200 font-mono",
      description: "Support for Morning, Afternoon, Evening, and 24x7 Full Day shifts. Complete shift isolation avoids overlapping student schedules."
    },
    {
      icon: Receipt,
      title: "Automated Fee Invoicing",
      badge: "GST Compliant",
      badgeColor: "bg-neutral-100 text-neutral-700 border-neutral-200 font-mono",
      description: "Computerized invoices with unique serial numbers, GST breakdowns, discount management, and payment mode logging."
    },
    {
      icon: KeyRound,
      title: "Digital Locker Management",
      badge: "Addon Ready",
      badgeColor: "bg-neutral-100 text-neutral-700 border-neutral-200 font-mono",
      description: "Manage physical lockers digitally. Track assigned lockers, renewal dates, security deposits, and single-click checkout."
    },
    {
      icon: BookMarked,
      title: "Catalog & Lending Fines",
      badge: "Library ERP",
      badgeColor: "bg-neutral-100 text-neutral-700 border-neutral-200 font-mono",
      description: "Maintain reference book inventory with ISBN and rack locations. Automatic fine calculation for overdue lending."
    },
    {
      icon: BarChart3,
      title: "Daily Collection & Analytics",
      badge: "Real-time",
      badgeColor: "bg-neutral-100 text-neutral-700 border-neutral-200 font-mono",
      description: "Unified admin metrics covering daily fee intake, outstanding balances, seat utilization, and membership trends."
    },
    {
      icon: MessageSquare,
      title: "WhatsApp & SMS Due Alerts",
      unverifiedType: "WHATSAPP_SMS",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      description: "Automated notification reminders scheduled before fee expiration to eliminate manual follow-up overhead."
    },
    {
      icon: QrCode,
      title: "QR Code Attendance & Pass",
      unverifiedType: "QR_CODE",
      badgeColor: "bg-neutral-100 text-neutral-700 border-neutral-200",
      description: "Contactless student entry check-in with dynamic QR passes printed on personalized Library Sathi student identity cards."
    }
  ];

  return (
    <section id="features" className="py-16 bg-[#FAFAFA] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs font-mono mb-3">
            <span>ENGINEERED FOR PRODUCTIVITY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Complete management software for modern libraries.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base mt-2">
            Eliminate manual registers and spreadsheets. Library Sathi centralizes every administrative and student touchpoint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg p-5 border border-neutral-200 shadow-2xs hover:border-neutral-400 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-8 h-8 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    {feat.unverifiedType ? (
                      <UnverifiedBadge type={feat.unverifiedType} size="xs" />
                    ) : (
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${feat.badgeColor}`}>
                        {feat.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-neutral-900 tracking-tight mb-1.5">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center text-[11px] font-medium text-neutral-600 font-mono">
                  <span>Included in Core ERP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
