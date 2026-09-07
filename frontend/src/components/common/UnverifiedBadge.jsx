import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { UNVERIFIED_NOTICES } from '../../utils/constants';

/**
 * Visual badge & tooltip indicating unverified/mock integration
 */
export function UnverifiedBadge({ type = 'RAZORPAY', size = 'sm', showBanner = false }) {
  const notice = UNVERIFIED_NOTICES[type] || {
    title: "Unverified Integration",
    badge: "Mock Feature",
    description: "This feature is running in frontend mock mode.",
    type: "warning"
  };

  const [isOpen, setIsOpen] = useState(showBanner);

  const isWarning = notice.type === 'warning';
  const badgeClasses = isWarning
    ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
    : "bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200";

  return (
    <div className="inline-flex items-center gap-1.5 relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={notice.description}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium transition-colors ${
          size === 'xs' ? 'text-[10px]' : 'text-xs'
        } ${badgeClasses}`}
      >
        {isWarning ? <AlertTriangle className="w-3 h-3 text-amber-700" /> : <Info className="w-3 h-3 text-blue-700" />}
        <span>{notice.badge}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full mb-2 left-0 w-72 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {notice.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed">{notice.description}</p>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Status: Mock / Standalone</span>
            <span className="text-amber-300 font-mono">VITE_USE_MOCK=true</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Top-level Banner for pages with unverified integrations
 */
export function UnverifiedBanner({ type = 'RAZORPAY', onDismiss }) {
  const notice = UNVERIFIED_NOTICES[type];
  if (!notice) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-3 rounded-r-xl my-3 text-amber-900 text-xs shadow-sm flex items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <strong className="font-semibold text-amber-950">{notice.title}</strong>: {notice.description}
          <div className="text-[11px] text-amber-700 mt-0.5">
            Safe to demo and test locally. Zero live charges or external API dependencies.
          </div>
        </div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-amber-600 hover:text-amber-900">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
