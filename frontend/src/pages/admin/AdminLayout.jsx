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
import { ThemeToggle } from '../../components/common/ThemeToggle';

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
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 text-neutral-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-neutral-200">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-neutral-950 flex items-center justify-center text-white font-bold shadow-2xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-neutral-900 tracking-tight">LibrarySathi</span>
                <span className="text-[10px] font-mono font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 px-1.5 py-0.2 rounded">Admin</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-neutral-400 hover:text-neutral-900 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Library Card */}
          <div className="p-3.5 border-b border-neutral-150 bg-neutral-50/70">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white border border-neutral-200 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-neutral-900 truncate">{admin.libraryName || 'My Library'}</h4>
                <span className="text-[10px] text-neutral-500 font-mono block truncate">ID: {admin.libraryId || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-0.5">
            <div className="px-2.5 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Management
            </div>
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

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50/50 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1 py-0.5">
            <span className="font-normal">Backend</span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Live: 5000
            </span>
          </div>

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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Header */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
              <span className="text-neutral-900 font-semibold">{admin.libraryName || 'Library Console'}</span>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-600 font-mono text-[11px]">{admin.address?.city || 'Portal'}</span>
            </div>
          </div>

            {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle (Black / White) */}
            <ThemeToggle showLabel={true} />

            <Link
              to="/admin/students?action=admit"
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 rounded-md shadow-2xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admit Student</span>
            </Link>

            {/* Admin Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <Link
                to="/admin/profile"
                className="flex items-center gap-2 p-1 hover:bg-neutral-100 rounded-md transition-colors"
                title="Manage Admin Profile"
              >
                {admin.avatar?.url ? (
                  <img
                    src={admin.avatar.url}
                    alt={admin.firstName}
                    className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center justify-center font-medium text-xs">
                    {(admin.firstName || 'A')[0]}
                  </div>
                )}
                <div className="hidden md:block text-left pr-1">
                  <div className="text-xs font-medium text-neutral-900 leading-none">{admin.firstName} {admin.lastName}</div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{admin.role || 'Administrator'}</div>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                title="Sign Out Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
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
