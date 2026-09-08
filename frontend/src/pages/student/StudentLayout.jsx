import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  Receipt,
  IdCard,
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UnverifiedBadge } from '../../components/common/UnverifiedBadge';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { studentUser, logoutStudent } = useAuth();
  const student = studentUser?.student || null;
  const admin = student?.adminId || {};

  const handleLogout = () => {
    logoutStudent();
    navigate('/student/login');
  };

  const navigation = [
    { name: 'My Desk & Shift', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Fee Invoices & Receipts', href: '/student/invoices', icon: Receipt },
    { name: 'Digital ID & Pass', href: '/student/profile', icon: IdCard },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top Header */}
      <header className="h-14 bg-white border-b border-neutral-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-neutral-950 flex items-center justify-center text-white font-bold shadow-2xs">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-neutral-900 tracking-tight">LibrarySathi</span>
              <span className="text-[10px] font-mono font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 px-1.5 py-0.2 rounded">Student</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle (Black / White) */}
          <ThemeToggle showLabel={true} />

          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Member</span>
          </div>

          {/* Student Avatar and Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
            <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-800 font-semibold text-xs flex items-center justify-center border border-neutral-200">
              {student?.name?.[0] || 'S'}
            </div>
            <div className="hidden md:block text-left pr-1">
              <div className="text-xs font-medium text-neutral-900 leading-tight">{student?.name || 'Student'}</div>
              <div className="text-[10px] text-neutral-400 font-mono">{student?.admissionNumber || student?.studentId || 'Member'}</div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Sign Out Student Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 md:static md:inset-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-3.5 space-y-3">
            <div className="flex items-center justify-between md:hidden pb-2 border-b border-neutral-150">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Navigation</span>
              <button onClick={() => setSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Student Card in Sidebar */}
            <div className="bg-neutral-50/80 p-3 rounded-md border border-neutral-200 space-y-1">
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Assigned Space</div>
              <div className="text-xs font-semibold text-neutral-900">
                Desk <span className="text-neutral-900 font-mono font-bold">{student?.seat?.seatNumber || student?.seatNumber || '—'}</span>
              </div>
              <div className="text-[11px] text-neutral-500">
                {student?.shift?.name || student?.shiftName || 'Standard Access'}
              </div>
            </div>

            {/* Nav links */}
            <nav className="space-y-0.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-3 border-t border-neutral-200 bg-neutral-50/50 space-y-1.5">
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
              <span>Public Website</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
