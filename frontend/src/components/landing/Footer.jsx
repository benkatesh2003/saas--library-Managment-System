import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Heart, Shield, AlertTriangle } from 'lucide-react';
import { SUPPORT_EMAIL, SUPPORT_PHONE } from '../../utils/constants';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-neutral-400 pt-14 pb-10 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-neutral-800">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shadow-2xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white tracking-tight">
                  LibrarySathi
                </span>
                <span className="bg-neutral-900 text-neutral-400 border border-neutral-800 text-[10px] font-mono px-1.5 py-0.5 rounded">v2.0</span>
              </div>
            </Link>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Cloud operating software for Indian study libraries, reading rooms, and co-working hubs. Complete shift automation, visual seat matrices, and automated fee invoicing.
            </p>

            <div className="pt-1 space-y-1.5 text-xs text-neutral-400 font-mono">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>{SUPPORT_EMAIL}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>{SUPPORT_PHONE} (Mon - Sat, 9am - 8pm)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>Karol Bagh, New Delhi 110005, India</span>
              </div>
            </div>
          </div>

          {/* Solution Links */}
          <div>
            <h4 className="text-xs font-mono uppercase text-neutral-200 tracking-wider mb-3">Modules</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><a href="#seat-demo" className="hover:text-white transition-colors">Seat & Shift Matrix</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Student Admissions</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Digital Locker Grid</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Fee Receipts & Invoicing</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Book Lending & Fines</a></li>
            </ul>
          </div>

          {/* Portals Links */}
          <div>
            <h4 className="text-xs font-mono uppercase text-neutral-200 tracking-wider mb-3">Portals</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link to="/admin/dashboard" className="text-neutral-200 hover:text-white font-medium flex items-center gap-1">
                  <span>Admin Dashboard</span>
                </Link>
              </li>
              <li><Link to="/admin/students" className="hover:text-white transition-colors">Admit Student</Link></li>
              <li><Link to="/admin/seats" className="hover:text-white transition-colors">Manage Seats</Link></li>
              <li>
                <Link to="/student/login" className="hover:text-white transition-colors">
                  <span>Student Self-Service</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Notice */}
          <div>
            <h4 className="text-xs font-mono uppercase text-neutral-200 tracking-wider mb-3">Security & Trust</h4>
            <div className="bg-neutral-900/80 p-3 rounded-md border border-neutral-800 text-xs text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>Encrypted & Verified</span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                Automated daily cloud backups. Role-based access control for administrative staff and students.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Status Notice */}
        <div className="my-5 p-2.5 bg-neutral-950 rounded-md border border-neutral-800 text-[11px] text-neutral-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>BACKEND ACTIVE ON PORT 5000</span>
          </div>
          <span className="text-neutral-500 text-[10px] font-mono">
            REST API services connected (`/api/admin/*`, `/api/student/*`, `/api/super-admin/*`).
          </span>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <div>
            © {new Date().getFullYear()} Library Sathi Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Engineered for Indian Study Centers 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
