import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Heart, Shield, AlertTriangle } from 'lucide-react';
import { SUPPORT_EMAIL, SUPPORT_PHONE } from '../../utils/constants';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Library<span className="text-brand-500">Sathi</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India's leading all-in-one software platform for study libraries, coaching centers, reading rooms, and co-working spaces. Digitize your seat matrix, shifts, student fees, and lockers with zero hassle.
            </p>

            <div className="pt-1 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>{SUPPORT_EMAIL}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>{SUPPORT_PHONE} (Mon - Sat, 9am - 8pm)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Karol Bagh, New Delhi 110005, India</span>
              </div>
            </div>
          </div>

          {/* Solution Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Solution</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#seat-demo" className="hover:text-brand-400 transition-colors">Seat & Shift Matrix</a></li>
              <li><a href="#features" className="hover:text-brand-400 transition-colors">Student Admissions</a></li>
              <li><a href="#features" className="hover:text-brand-400 transition-colors">Digital Locker Grid</a></li>
              <li><a href="#features" className="hover:text-brand-400 transition-colors">Fee Receipts & Invoicing</a></li>
              <li><a href="#features" className="hover:text-brand-400 transition-colors">Book Lending & Fines</a></li>
            </ul>
          </div>

          {/* Portals Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/admin/dashboard" className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
                  <span>Admin Dashboard</span>
                </Link>
              </li>
              <li><Link to="/admin/students" className="hover:text-brand-400 transition-colors">Admit Student</Link></li>
              <li><Link to="/admin/seats" className="hover:text-brand-400 transition-colors">Manage Seats</Link></li>
              <li>
                <Link to="/student/login" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <span>Student Self-Service</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Notice */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Security & Trust</h4>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>100% Encrypted & Secure</span>
              </div>
              <p className="leading-relaxed">
                Daily cloud backups. Your library membership records and fee books are protected with role-based access.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Status Notice */}
        <div className="my-6 p-3 bg-slate-900/80 rounded-xl border border-emerald-900/40 text-[11px] text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Connected to Live Backend API (Port 5000)</span>
          </div>
          <span className="text-slate-500 text-[10px]">
            Express REST APIs on MongoDB Atlas (`/api/admin/*`, `/api/student/*`, `/api/super-admin/*`).
          </span>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Library Sathi. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Indian Library Entrepreneurs 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
