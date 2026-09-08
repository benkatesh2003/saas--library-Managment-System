import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, PhoneCall, Building2, User, Mail, MapPin } from 'lucide-react';

import { api } from '../../services/apiClient';

export function BookDemoModal({ isOpen, onClose, selectedPlan }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    libraryName: '',
    city: '',
    seatCount: '50-100',
    preferredTime: 'morning',
    selectedPlan: selectedPlan?.name || 'General Demo'
  });

  // Keep selectedPlan synced when prop changes
  React.useEffect(() => {
    if (selectedPlan?.name) {
      setFormData(prev => ({
        ...prev,
        selectedPlan: selectedPlan.name,
        seatCount: selectedPlan.maxSeats ? `${selectedPlan.maxSeats} Desks` : prev.seatCount
      }));
    }
  }, [selectedPlan]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError('');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        libraryName: formData.libraryName,
        city: formData.city,
        seatCount: formData.seatCount,
        preferredTime: formData.preferredTime,
        selectedPlan: selectedPlan?.name || formData.selectedPlan || 'General Demo'
      };

      const res = await api.demo.create(payload);

      if (res && res.success) {
        setSubmitted(true);
      } else {
        setApiError(res?.message || 'Failed to submit demo request. Please check your details and try again.');
      }
    } catch (err) {
      setApiError(err.message || 'Network error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setApiError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-card border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-start justify-between bg-[#FAFAFA]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-neutral-100 text-neutral-700 text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-neutral-200">
                1-ON-1 DEMONSTRATION
              </span>
              {selectedPlan && (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-emerald-200">
                  Plan: {selectedPlan.name}
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-neutral-900 tracking-tight">Experience Library Sathi Live</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {selectedPlan
                ? `Tailored demonstration and setup for the ${selectedPlan.name} tier (${selectedPlan.maxSeats} desks).`
                : '15-minute tailored walkthrough of our multi-shift and seat matrix platform.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-md hover:bg-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {apiError && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {apiError}
            </div>
          )}

          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-neutral-900">Walkthrough Request Received</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Thank you, <strong className="text-neutral-800 font-medium">{formData.name}</strong>. Your inquiry for <strong className="text-neutral-800 font-medium">{selectedPlan?.name || formData.selectedPlan || 'Library Sathi'}</strong> has been submitted. Our team will call you on <strong className="text-neutral-800 font-medium">{formData.phone}</strong> shortly.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-5 py-2 rounded-md bg-neutral-900 text-white font-medium text-xs hover:bg-neutral-800 transition-colors shadow-2xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Your Full Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Vikram Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Phone (WhatsApp) *</label>
                  <div className="relative">
                    <PhoneCall className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      required
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Study Center Name *</label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Apex Reading Lounge"
                      value={formData.libraryName}
                      onChange={(e) => setFormData({ ...formData, libraryName: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">City / Hub *</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Delhi, Patna, Kota..."
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="e.g. contact@library.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Number of Desks / Seats</label>
                  <select
                    value={formData.seatCount}
                    onChange={(e) => setFormData({ ...formData, seatCount: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-2xs"
                  >
                    <option value="1-50">Under 50 Desks</option>
                    <option value="50-100">50 to 100 Desks</option>
                    <option value="100-200">100 to 200 Desks</option>
                    <option value="200+">200+ Desks (Multi-Branch)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-md bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white font-medium text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{isSubmitting ? 'Submitting Request...' : 'Request Live Walkthrough'}</span>
                </button>
                <p className="text-[10px] text-neutral-400 text-center mt-2 font-mono">
                  Guaranteed privacy. Directly notified to SuperAdmin console.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
