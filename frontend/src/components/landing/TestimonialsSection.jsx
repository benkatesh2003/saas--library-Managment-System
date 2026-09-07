import React from 'react';
import { Star, Quote } from 'lucide-react';
import { INITIAL_TESTIMONIALS } from '../../mock/mockData';

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-600 font-extrabold text-xs tracking-wider uppercase bg-brand-100/70 border border-brand-200 px-3 py-1 rounded-full">
            Real Stories From Real Owners
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Trusted by 500+ Indian Library Entrepreneurs
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Read how reading hall managers across major education hubs in India modernized their operations with Library Sathi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {INITIAL_TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover border border-brand-200 shadow-sm"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">{t.name}</div>
                  <div className="text-[11px] text-brand-600 font-medium">{t.role}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
