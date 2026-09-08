import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { LANDING_FAQ } from '../../data/landingContent';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-16 bg-white border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-mono mb-3">
            <span>COMMON QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Frequently asked questions.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base mt-2">
            Everything you need to know about setting up and running Library Sathi.
          </p>
        </div>

        <div className="space-y-2.5">
          {LANDING_FAQ.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-neutral-200 rounded-md overflow-hidden transition-all bg-white shadow-2xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 bg-white hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transform transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-neutral-900' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-2 text-xs text-neutral-600 leading-relaxed bg-[#FAFAFA] border-t border-neutral-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
