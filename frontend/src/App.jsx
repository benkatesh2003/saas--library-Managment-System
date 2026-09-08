import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Landing Page (librarysathi.in clone)
import { HomePage } from './pages/landing/HomePage';

// Auth Login & Register Pages (3 separate portals)
import { AdminLogin } from './pages/auth/AdminLogin';
import { AdminRegister } from './pages/auth/AdminRegister';
import { StudentLogin } from './pages/student/StudentLogin';
import { SuperAdminLogin } from './pages/superAdmin/SuperAdminLogin';

// Guards from AuthContext
import {
  RequireAdminAuth,
  RequireStudentAuth,
  RequireSuperAdminAuth
} from './context/AuthContext';

// 1. Admin Portal Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SeatsManagement } from './pages/admin/SeatsManagement';
import { ShiftsManagement } from './pages/admin/ShiftsManagement';
import { StudentsManagement } from './pages/admin/StudentsManagement';
import { LockersManagement } from './pages/admin/LockersManagement';
import { BooksManagement } from './pages/admin/BooksManagement';
import { BillingManagement } from './pages/admin/BillingManagement';
import { AdminProfile } from './pages/admin/AdminProfile';

// 2. Student Portal Pages
import { StudentLayout } from './pages/student/StudentLayout';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentInvoices } from './pages/student/StudentInvoices';
import { StudentProfile } from './pages/student/StudentProfile';

// 3. Super Admin Portal Pages
import { SuperAdminLayout } from './pages/superAdmin/SuperAdminLayout';
import { SuperAdminDashboard } from './pages/superAdmin/SuperAdminDashboard';
import { SuperAdminTenants } from './pages/superAdmin/SuperAdminTenants';
import { SuperAdminPlans } from './pages/superAdmin/SuperAdminPlans';
import { SuperAdminFeatures } from './pages/superAdmin/SuperAdminFeatures';
import { SuperAdminSubscriptions } from './pages/superAdmin/SuperAdminSubscriptions';
import { SuperAdminLeads } from './pages/superAdmin/SuperAdminLeads';

export function App() {
  return (
    <Routes>
      {/* ========================================================================= */}
      {/* 1. PUBLIC MARKETING WEBSITE (librarysathi.in clone)                       */}
      {/* ========================================================================= */}
      <Route path="/" element={<HomePage />} />

      {/* ========================================================================= */}
      {/* AUTHENTICATION ENTRY POINTS FOR THE 3 SEPARATE ROLES                      */}
      {/* ========================================================================= */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/student/login" element={<StudentLogin />} />
      {/* Non-prominent Super Admin login route */}
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />

      {/* ========================================================================= */}
      {/* 2. AUTHENTICATED ADMIN PORTAL (/admin/*)                                  */}
      {/* ========================================================================= */}
      <Route
        path="/admin"
        element={
          <RequireAdminAuth>
            <AdminLayout />
          </RequireAdminAuth>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="seats" element={<SeatsManagement />} />
        <Route path="shifts" element={<ShiftsManagement />} />
        <Route path="students" element={<StudentsManagement />} />
        <Route path="lockers" element={<LockersManagement />} />
        <Route path="books" element={<BooksManagement />} />
        <Route path="billing" element={<BillingManagement />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* ========================================================================= */}
      {/* 3. AUTHENTICATED STUDENT PORTAL (/student/*)                              */}
      {/* ========================================================================= */}
      <Route
        path="/student"
        element={
          <RequireStudentAuth>
            <StudentLayout />
          </RequireStudentAuth>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="invoices" element={<StudentInvoices />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* ========================================================================= */}
      {/* 4. AUTHENTICATED SUPER ADMIN PORTAL (/super-admin/*)                      */}
      {/* ========================================================================= */}
      <Route
        path="/super-admin"
        element={
          <RequireSuperAdminAuth>
            <SuperAdminLayout />
          </RequireSuperAdminAuth>
        }
      >
        <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="leads" element={<SuperAdminLeads />} />
        <Route path="tenants" element={<SuperAdminTenants />} />
        <Route path="plans" element={<SuperAdminPlans />} />
        <Route path="features" element={<SuperAdminFeatures />} />
        <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
      </Route>

      {/* Catch-all redirect to public homepage */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
