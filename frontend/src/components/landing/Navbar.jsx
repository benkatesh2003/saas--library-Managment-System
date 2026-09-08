import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, ArrowRight, UserCheck, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UnverifiedBadge } from '../common/UnverifiedBadge';
import { ThemeToggle } from '../common/ThemeToggle';

export function Navbar({ onOpenDemoModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { adminUser, studentUser } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Seat Matrix", href: "#seat-demo" },
    { label: "ROI Calculator", href: "#calculator" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200 transition-all">
      {/* Top Notification Bar */}
      <div className="bg-neutral-950 text-neutral-300 text-xs py-1.5 px-4 text-center font-normal flex items-center justify-center gap-2 border-b border-neutral-800">
        <span className="bg-neutral-800 text-neutral-200 text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">Cloud ERP</span>
        <span>Modern SaaS for Indian Study Libraries & Co-Working Hubs</span>
        <span className="hidden md:inline text-neutral-500">| Helpline: librarysathi07@gmail.com</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-neutral-900 flex items-center justify-center text-white shadow-2xs group-hover:bg-neutral-800 transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-neutral-900 tracking-tight">LibrarySathi</span>
              <span className="bg-neutral-100 text-neutral-600 border border-neutral-200 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded">v2.0</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-neutral-600">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-neutral-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Student Portal Link */}
            <Link
              to={studentUser ? "/student/dashboard" : "/student/login"}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-md transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-neutral-500" />
              <span>Student Portal</span>
            </Link>

            {/* Admin Portal Button */}
            <Link
              to={adminUser ? "/admin/dashboard" : "/admin/login"}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-md transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-neutral-500" />
              <span>Admin Portal</span>
            </Link>

            {/* Book Demo Button */}
            <button
              type="button"
              onClick={onOpenDemoModal}
              className="text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-3.5 py-1.5 rounded-md transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span>Book Demo</span>
            </button>

            {/* Theme Toggle (Black / White) */}
            <ThemeToggle showLabel={true} />
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded-md border border-neutral-200 hover:bg-neutral-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-3 shadow-sm">
          <nav className="flex flex-col space-y-1 pt-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 rounded-md"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
            <Link
              to={studentUser ? "/student/dashboard" : "/student/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 text-xs font-medium text-neutral-700 bg-neutral-100 p-2.5 rounded-md"
            >
              <UserCheck className="w-4 h-4 text-neutral-500" />
              <span>Student Portal</span>
            </Link>
            <Link
              to={adminUser ? "/admin/dashboard" : "/admin/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 p-2.5 rounded-md"
            >
              <Shield className="w-4 h-4 text-neutral-500" />
              <span>Admin Portal</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemoModal();
              }}
              className="w-full text-center text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 p-2.5 rounded-md shadow-2xs"
            >
              Book Free Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
