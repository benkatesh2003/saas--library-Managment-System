import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Armchair,
  Clock,
  KeyRound,
  BookOpen,
  CreditCard,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Search,
  UserPlus,
  Shield,
  Building2,
  AlertTriangle,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UnverifiedBadge } from '../../components/common/UnverifiedBadge';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logoutAdmin } = useAuth();
  const admin = adminUser?.admin || {};

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Seat Matrix', href: '/admin/seats', icon: Armchair },
    { name: 'Shift Schedules', href: '/admin/shifts', icon: Clock },
    { name: 'Students Directory', href: '/admin/students', icon: Users },
    { name: 'Digital Lockers', href: '/admin/lockers', icon: KeyRound },
    { name: 'Book Inventory', href: '/admin/books', icon: BookOpen },
    { name: 'Plan & Billing', href: '/admin/billing', icon: CreditCard },
    { name: 'Profile & Library', href: '/admin/profile', icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 bg-slate-950 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-extrabold shadow-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-white tracking-tight">Library<span className="text-brand-400">Sathi</span></span>
                <span className="text-[9px] text-slate-400 -mt-1 font-mono uppercase">Admin Console</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Library Card */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-300 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white truncate">{admin.libraryName}</h4>
                <span className="text-[10px] text-slate-400 font-mono block truncate">ID: {admin.libraryId}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="font-medium">Mode: Live Backend</span>
            <span className="text-emerald-400 font-mono font-bold">
              ● Port 5000
            </span>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span>View Public Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/40 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-slate-800 font-bold">{admin.libraryName}</span>
              <span>•</span>
              <span className="text-brand-600 font-semibold">{admin.address?.city || 'Delhi Central'}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">

            <Link
              to="/admin/students?action=admit"
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admit Student</span>
            </Link>

            {/* Admin Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/admin/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title="Manage Admin Profile"
              >
                {admin.avatar?.url ? (
                  <img
                    src={admin.avatar.url}
                    alt={admin.firstName}
                    className="w-8 h-8 rounded-full object-cover border border-brand-200 shadow-2xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 border border-brand-200 flex items-center justify-center font-bold text-xs">
                    {(admin.firstName || 'A')[0]}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-900">{admin.firstName} {admin.lastName}</div>
                  <div className="text-[10px] text-slate-400 -mt-0.5">{admin.role || 'Administrator'}</div>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="ml-1 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign Out Admin Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Child Routes */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
