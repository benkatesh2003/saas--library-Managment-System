import React from 'react';
import { Star, Quote } from 'lucide-react';
import { LANDING_TESTIMONIALS } from '../../data/landingContent';

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 bg-[#FAFAFA] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs font-mono mb-3">
            <span>OPERATOR STORIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Trusted by library entrepreneurs nationwide.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base mt-2">
            Read how reading hall managers across major student clusters modernized their operations with Library Sathi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LANDING_TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs hover:border-neutral-400 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed italic mb-5">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3.5 border-t border-neutral-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                />
                <div>
                  <div className="text-xs font-semibold text-neutral-900">{t.name}</div>
                  <div className="text-[11px] text-neutral-500">{t.role}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
