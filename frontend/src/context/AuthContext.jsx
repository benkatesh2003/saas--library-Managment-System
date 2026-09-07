import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../services/apiClient';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  ADMIN: 'ls_session_admin',
  STUDENT: 'ls_session_student',
  SUPER_ADMIN: 'ls_session_superadmin'
};

function getSessionItem(key) {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
}

function setSessionItem(key, val) {
  try {
    if (val) {
      sessionStorage.setItem(key, JSON.stringify(val));
    } else {
      sessionStorage.removeItem(key);
    }
  } catch (e) {}
}

export function AuthProvider({ children }) {
  // Purge any legacy auto-authenticated sessions stored in localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('ls_auth_admin');
      localStorage.removeItem('ls_auth_student');
      localStorage.removeItem('ls_auth_superadmin');
    } catch (e) {}
  }, []);

  // Admin auth state: strictly null on application start unless explicitly logged in this session
  const [adminUser, setAdminUser] = useState(() => getSessionItem(STORAGE_KEYS.ADMIN));

  // Student auth state: strictly null on application start unless explicitly logged in this session
  const [studentUser, setStudentUser] = useState(() => getSessionItem(STORAGE_KEYS.STUDENT));

  // Super Admin auth state: strictly null on application start unless explicitly logged in this session
  const [superAdminUser, setSuperAdminUser] = useState(() => getSessionItem(STORAGE_KEYS.SUPER_ADMIN));

  // Sync state changes to sessionStorage
  useEffect(() => {
    setSessionItem(STORAGE_KEYS.ADMIN, adminUser);
  }, [adminUser]);

  useEffect(() => {
    setSessionItem(STORAGE_KEYS.STUDENT, studentUser);
  }, [studentUser]);

  useEffect(() => {
    setSessionItem(STORAGE_KEYS.SUPER_ADMIN, superAdminUser);
  }, [superAdminUser]);

  // Auth actions for Admin (Live Backend API)
  const loginAdmin = async ({ email, password }) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res && res.success && res.data) {
        const userObj = {
          token: res.data.token,
          admin: res.data.admin
        };
        setAdminUser(userObj);
        setSessionItem(STORAGE_KEYS.ADMIN, userObj);
        return { success: true, user: userObj, message: res.message };
      }
      return {
        success: false,
        message: res?.message || res?.error || 'Invalid email or password.'
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error connecting to backend: ${err.message}`
      };
    }
  };

  const registerAdmin = async (adminData) => {
    try {
      const res = await api.auth.register(adminData);
      if (res && res.success && res.data) {
        const userObj = {
          token: res.data.token,
          admin: res.data.admin
        };
        setAdminUser(userObj);
        setSessionItem(STORAGE_KEYS.ADMIN, userObj);
        return { success: true, user: userObj, message: res.message };
      }

      let errorMsg = res?.message || 'Registration failed.';
      if (Array.isArray(res?.error)) {
        errorMsg = res.error.map(e => e.msg).join(', ');
      } else if (res?.error && typeof res.error === 'string') {
        errorMsg = `${errorMsg}: ${res.error}`;
      }
      return {
        success: false,
        message: errorMsg
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error connecting to backend: ${err.message}`
      };
    }
  };

  const loginAdminWithGoogle = async (googleToken) => {
    try {
      const res = await api.auth.googleLogin(googleToken);
      if (res && res.success && res.data) {
        const userObj = {
          token: res.data.token,
          admin: res.data.admin
        };
        setAdminUser(userObj);
        setSessionItem(STORAGE_KEYS.ADMIN, userObj);
        return { success: true, user: userObj };
      }
      return {
        success: false,
        message: res?.message || res?.error || 'Google login failed.'
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error connecting to backend: ${err.message}`
      };
    }
  };

  const updateAdminProfile = async (data, file = null) => {
    try {
      const res = await api.auth.updateProfile(data, file, adminUser?.token);
      if (res && res.success && res.data?.admin) {
        const newUserObj = {
          token: adminUser?.token || res.data.token,
          admin: res.data.admin
        };
        setAdminUser(newUserObj);
        setSessionItem(STORAGE_KEYS.ADMIN, newUserObj);
        return res;
      }
      return {
        success: false,
        message: res?.message || res?.error || 'Failed to update profile'
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error updating profile: ${err.message}`
      };
    }
  };

  const refreshAdminProfile = useCallback(async () => {
    const currentToken = adminUser?.token || getSessionItem(STORAGE_KEYS.ADMIN)?.token;
    if (!currentToken) {
      return { success: false, message: 'No active session' };
    }

    try {
      const res = await api.auth.getProfile(currentToken);
      if (res && res.success && res.data?.admin) {
        const newUserObj = {
          token: currentToken,
          admin: res.data.admin
        };
        setAdminUser(newUserObj);
        setSessionItem(STORAGE_KEYS.ADMIN, newUserObj);
        return { success: true, admin: res.data.admin };
      }
      return {
        success: false,
        message: res?.message || 'Failed to fetch admin profile'
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error fetching profile: ${err.message}`
      };
    }
  }, [adminUser?.token]);

  const logoutAdmin = () => {
    setAdminUser(null);
    setSessionItem(STORAGE_KEYS.ADMIN, null);
  };

  // Auth actions for Student (Live Backend API)
  const loginStudent = async (studentIdOrPhone, password) => {
    const idOrPhone = (studentIdOrPhone || '').trim();
    const inputPass = (password || '').trim();

    if (!idOrPhone) {
      return { success: false, message: 'Please enter your Student ID or Registered Mobile number.' };
    }

    try {
      const res = await api.studentPortal.login(idOrPhone, inputPass);
      if (res && res.success && res.data) {
        const userObj = {
          token: res.data.token,
          student: res.data.student
        };
        setStudentUser(userObj);
        setSessionItem(STORAGE_KEYS.STUDENT, userObj);
        return { success: true, user: userObj, message: res.message };
      }
      return {
        success: false,
        message: res?.message || res?.error || 'Invalid credentials'
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error connecting to backend: ${err.message}`
      };
    }
  };

  const refreshStudentProfile = useCallback(async () => {
    const currentToken = studentUser?.token || getSessionItem(STORAGE_KEYS.STUDENT)?.token;
    if (!currentToken) {
      return { success: false, message: 'No active student session' };
    }

    try {
      const res = await api.studentPortal.getProfile(currentToken);
      if (res && res.success && res.data) {
        const fullStudent = res.data;
        const newUserObj = {
          token: currentToken,
          student: fullStudent
        };
        setStudentUser(newUserObj);
        setSessionItem(STORAGE_KEYS.STUDENT, newUserObj);
        return { success: true, student: fullStudent };
      }
      return {
        success: false,
        message: res?.message || 'Failed to fetch student profile'
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error fetching profile: ${err.message}`
      };
    }
  }, [studentUser?.token]);

  const logoutStudent = () => {
    setStudentUser(null);
    setSessionItem(STORAGE_KEYS.STUDENT, null);
  };

  // Auth actions for Super Admin (Live Backend API)
  const loginSuperAdmin = async ({ email, password }) => {
    const inputEmail = (email || '').trim().toLowerCase();
    const inputPass = (password || '').trim();

    try {
      const res = await api.superAdmin.auth.login({ email: inputEmail, password: inputPass });
      if (res && res.success && res.data) {
        const userObj = {
          token: res.data.token,
          user: res.data.user
        };
        setSuperAdminUser(userObj);
        setSessionItem(STORAGE_KEYS.SUPER_ADMIN, userObj);
        return { success: true, user: userObj, message: res.message };
      }
      return {
        success: false,
        message: res?.message || res?.error || 'Invalid Super Admin email or password.'
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error connecting to backend: ${err.message}`
      };
    }
  };

  const registerSuperAdmin = async (userData) => {
    try {
      const res = await api.superAdmin.auth.register(userData);
      if (res && res.success && res.data) {
        const userObj = {
          token: res.data.token,
          user: res.data.user
        };
        setSuperAdminUser(userObj);
        setSessionItem(STORAGE_KEYS.SUPER_ADMIN, userObj);
        return { success: true, user: userObj, message: res.message };
      }
      return {
        success: false,
        message: res?.message || res?.error || 'Failed to register Super Admin.'
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error connecting to backend: ${err.message}`
      };
    }
  };

  const refreshSuperAdminProfile = useCallback(async () => {
    const currentToken = superAdminUser?.token || getSessionItem(STORAGE_KEYS.SUPER_ADMIN)?.token;
    if (!currentToken) {
      return { success: false, message: 'No active super admin session' };
    }

    try {
      const res = await api.superAdmin.auth.getProfile(currentToken);
      if (res && res.success && res.data?.user) {
        const newUserObj = {
          token: currentToken,
          user: res.data.user
        };
        setSuperAdminUser(newUserObj);
        setSessionItem(STORAGE_KEYS.SUPER_ADMIN, newUserObj);
        return { success: true, user: res.data.user };
      }
      return {
        success: false,
        message: res?.message || 'Failed to fetch super admin profile'
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error fetching profile: ${err.message}`
      };
    }
  }, [superAdminUser?.token]);

  const logoutSuperAdmin = () => {
    setSuperAdminUser(null);
    setSessionItem(STORAGE_KEYS.SUPER_ADMIN, null);
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        loginAdmin,
        registerAdmin,
        loginAdminWithGoogle,
        updateAdminProfile,
        refreshAdminProfile,
        logoutAdmin,
        studentUser,
        loginStudent,
        refreshStudentProfile,
        logoutStudent,
        superAdminUser,
        loginSuperAdmin,
        registerSuperAdmin,
        refreshSuperAdminProfile,
        logoutSuperAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Route Guards for the 3 distinct portals
 */
export function RequireAdminAuth({ children }) {
  const { adminUser } = useAuth();
  const location = useLocation();

  if (!adminUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RequireStudentAuth({ children }) {
  const { studentUser } = useAuth();
  const location = useLocation();

  if (!studentUser) {
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RequireSuperAdminAuth({ children }) {
  const { superAdminUser } = useAuth();
  const location = useLocation();

  if (!superAdminUser) {
    return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
  }

  return children;
}
