import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, ArrowRight, UserCheck, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UnverifiedBadge } from '../common/UnverifiedBadge';

export function Navbar({ onOpenDemoModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { adminUser, studentUser } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Seat Matrix", href: "#seat-demo" },
    { label: "Fee Calculator", href: "#calculator" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">New</span>
        <span>India's #1 Cloud Software for Libraries & Co-Working Spaces</span>
        <span className="hidden md:inline text-brand-200">| Helpline: librarysathi07@gmail.com</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Library<span className="text-brand-600">Sathi</span></span>
                <span className="bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold px-1.5 py-0.2 rounded">SaaS</span>
              </div>
              <span className="text-[10px] text-slate-600 -mt-1 font-medium hidden sm:inline">Management Software</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-brand-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Student Portal Link */}
            <div className="relative group">
              <Link
                to={studentUser ? "/student/dashboard" : "/student/login"}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Student Portal</span>
              </Link>
            </div>

            {/* Admin Portal Button */}
            <Link
              to={adminUser ? "/admin/dashboard" : "/admin/login"}
              className="text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-brand-600" />
              <span>Admin Portal</span>
            </Link>

            {/* Book Demo Button */}
            <button
              type="button"
              onClick={onOpenDemoModal}
              className="text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/25 px-4 py-2 rounded-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Book Free Demo</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-xl">
          <nav className="flex flex-col space-y-2 pt-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to={studentUser ? "/student/dashboard" : "/student/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 p-2.5 rounded-lg"
            >
              <UserCheck className="w-4 h-4 text-brand-600" />
              <span>Student Portal</span>
            </Link>
            <Link
              to={adminUser ? "/admin/dashboard" : "/admin/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-brand-700 bg-brand-50 border border-brand-200 p-2.5 rounded-lg"
            >
              <Shield className="w-4 h-4 text-brand-600" />
              <span>Admin Portal</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemoModal();
              }}
              className="w-full text-center text-sm font-bold text-white bg-brand-600 p-2.5 rounded-lg shadow-md"
            >
              Book Free Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
