import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Building2,
  Layers,
  Sparkles,
  CreditCard,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sliders,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { superAdminUser, logoutSuperAdmin } = useAuth();

  const handleLogout = () => {
    logoutSuperAdmin();
    navigate('/super-admin/login');
  };

  const navigation = [
    { name: 'Platform Overview', href: '/super-admin/dashboard', icon: LayoutDashboard },
    { name: 'Demo Leads', href: '/super-admin/leads', icon: PhoneCall },
    { name: 'Onboarded Libraries', href: '/super-admin/tenants', icon: Building2 },
    { name: 'SaaS Plans', href: '/super-admin/plans', icon: Layers },
    { name: 'Feature Flags', href: '/super-admin/features', icon: Sliders },
    { name: 'Subscriptions Log', href: '/super-admin/subscriptions', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-100 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Super Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white text-neutral-950 flex items-center justify-center font-bold shadow-2xs">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight">LibrarySathi</span>
                <span className="text-[10px] font-mono font-medium text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.2 rounded">SuperAdmin</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-neutral-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-0.5">
            <div className="px-2.5 py-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
              Control Center
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
                      ? 'bg-neutral-800 text-white shadow-2xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/60 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
            <span>Root Session</span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Active
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-neutral-800 hover:border-rose-900/40 rounded-md transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Super Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-neutral-950/70 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-900"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-xs text-neutral-400 font-medium hidden sm:block">
              Multi-Tenant SaaS Control Center
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle (Black / White) */}
            <ThemeToggle showLabel={true} />

            <Link
              to="/"
              className="text-xs font-medium text-neutral-400 hover:text-white flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-md transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              <span>Public Website</span>
            </Link>

            <div className="w-7 h-7 rounded-full bg-neutral-800 text-white font-semibold text-xs flex items-center justify-center border border-neutral-700">
              SA
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
