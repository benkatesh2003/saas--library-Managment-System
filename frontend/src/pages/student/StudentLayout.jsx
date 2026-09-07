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
import { mockStore } from '../../mock/mockStore';
import { UnverifiedBadge } from '../../components/common/UnverifiedBadge';

export function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { studentUser, logoutStudent } = useAuth();
  const admin = mockStore.getAdmin();

  // Fallback to first student if not in state
  const student = studentUser?.student || mockStore.getStudents()[0];

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
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-extrabold shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight">Library<span className="text-brand-600">Sathi</span></span>
              <span className="text-[10px] text-slate-500 font-medium">Student Portal • {admin.libraryName}</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Student Membership</span>
          </div>

          <div className="hidden lg:block">
            <UnverifiedBadge type="STUDENT_AUTH" size="xs" />
          </div>

          {/* Student Avatar and Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-300">
              {student?.name?.[0] || 'S'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{student?.name || 'Rahul Kumar'}</div>
              <div className="text-[10px] text-slate-500 font-mono">{student?.studentId || 'LS-2401'}</div>
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out Student Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 md:static md:inset-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between md:hidden pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Navigation</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Student Card in Sidebar */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Assigned Space</div>
              <div className="text-sm font-extrabold text-slate-900">
                Desk <span className="text-brand-600 font-mono">{student?.seatNumber || 'S-03'}</span>
              </div>
              <div className="text-xs text-slate-600 font-medium">
                {student?.shiftName || 'Morning Shift'}
              </div>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100 space-y-2">
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
