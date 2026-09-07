import { mockStore } from '../mock/mockStore';
import { INITIAL_PLANS } from '../mock/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function isMockEnabled() {
  return import.meta.env.VITE_USE_MOCK === 'true';
}

export function getStoredAdminToken() {
  try {
    const sessionStr = sessionStorage.getItem('ls_session_admin');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      return parsed?.token || null;
    }
  } catch (e) {}
  return null;
}

export function getStoredStudentToken() {
  try {
    const sessionStr = sessionStorage.getItem('ls_session_student');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      return parsed?.token || null;
    }
  } catch (e) {}
  return null;
}

export function getStoredSuperAdminToken() {
  try {
    const sessionStr = sessionStorage.getItem('ls_session_superadmin');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      return parsed?.token || null;
    }
  } catch (e) {}
  return null;
}

/**
 * Standard backend response envelope
 */
function mockResponse(data, message = "Success", status = 200) {
  return Promise.resolve({
    status,
    data: {
      success: true,
      message,
      data
    }
  });
}

/**
 * API Service Layer mirroring exact backend routes
 */
export const api = {
  // ─── AUTH (ADMIN) ──────────────────────────────────
  auth: {
    async login(credentials) {
      if (isMockEnabled()) {
        const admin = mockStore.getAdmin();
        return {
          success: true,
          message: "Login successful (Mock Mode)",
          data: {
            token: "mock_jwt_admin_token_" + Date.now(),
            admin
          }
        };
      }

      try {
        const res = await fetch(`${BASE_URL}/admin/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async register(data) {
      if (isMockEnabled()) {
        const admin = mockStore.updateAdmin(data);
        return {
          success: true,
          message: "Admin registered successfully (Mock Mode)",
          data: {
            token: "mock_jwt_admin_token_" + Date.now(),
            admin
          }
        };
      }

      try {
        const res = await fetch(`${BASE_URL}/admin/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const resData = await res.json();
        return resData;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async googleLogin(token) {
      // Endpoint is exactly POST /api/admin/auth/google as requested
      if (isMockEnabled()) {
        const admin = mockStore.getAdmin();
        return {
          success: true,
          message: "Google login (Mock Mode) successful",
          data: {
            token: "mock_google_jwt_" + Date.now(),
            admin
          }
        };
      }

      try {
        const res = await fetch(`${BASE_URL}/admin/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const resData = await res.json();
        return resData;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async getProfile(token = null) {
      if (isMockEnabled()) {
        return {
          success: true,
          message: "Profile retrieved (Mock Mode)",
          data: { admin: mockStore.getAdmin() }
        };
      }

      const authToken = token || getStoredAdminToken();
      try {
        const headers = {};
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        const res = await fetch(`${BASE_URL}/admin/auth/profile`, {
          method: 'GET',
          headers
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async updateProfile(data, file = null, token = null) {
      if (isMockEnabled()) {
        const updated = mockStore.updateAdmin(data);
        return {
          success: true,
          message: "Profile updated (Mock Mode)",
          data: { admin: updated }
        };
      }

      const authToken = token || getStoredAdminToken();
      try {
        const headers = {};
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        let body;
        // Correctly support multipart/form-data with uploadSingle field 'image'
        if (data instanceof FormData) {
          body = data;
          if (file && !body.has('image')) {
            body.append('image', file);
          }
        } else if (file) {
          body = new FormData();
          Object.entries(data || {}).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
              if (key === 'address' && typeof val === 'object') {
                Object.entries(val).forEach(([addrKey, addrVal]) => {
                  if (addrVal !== undefined && addrVal !== null) {
                    body.append(`address[${addrKey}]`, addrVal);
                  }
                });
              } else {
                body.append(key, typeof val === 'object' ? JSON.stringify(val) : val);
              }
            }
          });
          body.append('image', file);
        } else {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(data);
        }

        const res = await fetch(`${BASE_URL}/admin/auth/profile`, {
          method: 'PUT',
          headers,
          body
        });
        const resData = await res.json();
        return resData;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    }
  },

  // ─── STUDENTS ──────────────────────────────────────
  students: {
    async getAll(filters = {}) {
      if (isMockEnabled()) {
        let students = mockStore.getStudents();
        if (filters.search) {
          const q = filters.search.toLowerCase();
          students = students.filter(s =>
            s.name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.studentId?.toLowerCase().includes(q) ||
            s.phone?.includes(q)
          );
        }
        if (filters.isActive !== undefined && filters.isActive !== 'all') {
          students = students.filter(s => String(s.isActive) === String(filters.isActive));
        }
        if (filters.paymentStatus && filters.paymentStatus !== 'all') {
          students = students.filter(s => s.paymentStatus === filters.paymentStatus);
        }
        return {
          success: true,
          message: "Students retrieved (Mock Mode)",
          data: {
            students,
            pagination: {
              total: students.length,
              page: 1,
              pages: 1
            }
          }
        };
      }

      const token = getStoredAdminToken();
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.isActive !== undefined && filters.isActive !== 'all') params.append('isActive', filters.isActive);
        if (filters.paymentStatus && filters.paymentStatus !== 'all') params.append('paymentStatus', filters.paymentStatus);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
        const qs = params.toString() ? `?${params.toString()}` : '';

        const res = await fetch(`${BASE_URL}/admin/student/all${qs}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async search(q) {
      if (isMockEnabled()) {
        const students = mockStore.searchStudents(q);
        return {
          success: true,
          message: "Search results (Mock Mode)",
          data: { students }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/student/search?q=${encodeURIComponent(q)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async getById(id) {
      if (isMockEnabled()) {
        const student = mockStore.getStudents().find(s => s._id === id);
        return {
          success: !!student,
          message: student ? "Student retrieved (Mock Mode)" : "Student not found",
          data: { student }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/student/get/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async admit(studentData, file = null) {
      if (isMockEnabled()) {
        const res = mockStore.admitStudent(studentData);
        return {
          success: true,
          message: "Student admitted successfully (Mock Mode)",
          data: {
            student: res.student || res,
            payment: res.payment || null,
            invoice: res.invoice || null,
            tempPassword: res.tempPassword || 'mock1234'
          }
        };
      }

      const token = getStoredAdminToken();
      try {
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        let body;
        if (studentData instanceof FormData) {
          body = studentData;
          if (file && !body.has('image')) {
            body.append('image', file);
          }
        } else if (file) {
          body = new FormData();
          Object.entries(studentData || {}).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
              body.append(key, val);
            }
          });
          body.append('image', file);
        } else {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(studentData);
        }

        const res = await fetch(`${BASE_URL}/admin/student/admit`, {
          method: 'POST',
          headers,
          body
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async update(id, updates, file = null) {
      if (isMockEnabled()) {
        const updated = mockStore.updateStudent(id, updates);
        return {
          success: !!updated,
          message: updated ? "Student updated (Mock Mode)" : "Student not found",
          data: { student: updated }
        };
      }

      const token = getStoredAdminToken();
      try {
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        let body;
        if (updates instanceof FormData) {
          body = updates;
          if (file && !body.has('image')) {
            body.append('image', file);
          }
        } else if (file) {
          body = new FormData();
          Object.entries(updates || {}).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
              body.append(key, val);
            }
          });
          body.append('image', file);
        } else {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(updates);
        }

        const res = await fetch(`${BASE_URL}/admin/student/update/${id}`, {
          method: 'PUT',
          headers,
          body
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async delete(id) {
      if (isMockEnabled()) {
        mockStore.deleteStudent(id);
        return {
          success: true,
          message: "Student deleted (Mock Mode)"
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/student/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    }
  },

  // ─── SEATS ─────────────────────────────────────────
  seats: {
    async getAll(filters = {}) {
      if (isMockEnabled()) {
        let seats = mockStore.getSeats();
        if (filters.status && filters.status !== 'all') {
          seats = seats.filter(s => s.status === filters.status);
        }
        if (filters.floor && filters.floor !== 'all') {
          seats = seats.filter(s => String(s.floor) === String(filters.floor));
        }
        return {
          success: true,
          message: "Seats retrieved (Mock Mode)",
          data: { seats, total: seats.length }
        };
      }

      const token = getStoredAdminToken();
      try {
        const params = new URLSearchParams();
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.floor && filters.floor !== 'all') params.append('floor', filters.floor);
        const qs = params.toString() ? `?${params.toString()}` : '';

        const res = await fetch(`${BASE_URL}/admin/seat/all${qs}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async getAvailable() {
      if (isMockEnabled()) {
        const seats = mockStore.getSeats().filter(s => s.status === 'available');
        return {
          success: true,
          message: "Available seats retrieved (Mock Mode)",
          data: { seats }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/seat/available`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async getById(id) {
      if (isMockEnabled()) {
        const seat = mockStore.getSeats().find(s => s._id === id);
        return {
          success: !!seat,
          message: seat ? "Seat retrieved (Mock Mode)" : "Seat not found",
          data: { seat }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/seat/get/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async create(seatData) {
      if (isMockEnabled()) {
        const seat = mockStore.createSeat(seatData);
        return {
          success: true,
          message: "Seat created successfully (Mock Mode)",
          data: { seat }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/seat/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(seatData)
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async bulkCreate(payloadOrCount, floor = 'Ground', prefix = 'S') {
      let payload;
      if (typeof payloadOrCount === 'object' && payloadOrCount !== null) {
        payload = {
          ...payloadOrCount,
          prefix: payloadOrCount.prefix ? String(payloadOrCount.prefix).replace(/-+$/, '') : 'S'
        };
      } else {
        const count = Number(payloadOrCount) || 10;
        payload = {
          prefix: prefix ? String(prefix).replace(/-+$/, '') : 'S',
          start: 1,
          end: count,
          floor: String(floor || 'Ground'),
          section: null
        };
      }

      if (isMockEnabled()) {
        const created = mockStore.bulkCreateSeats(payload);
        return {
          success: true,
          message: "Seats created successfully (Mock Mode)",
          data: { seats: created, count: created.length }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/seat/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async update(id, updates) {
      if (isMockEnabled()) {
        const updated = mockStore.updateSeat(id, updates);
        return {
          success: !!updated,
          message: updated ? "Seat updated successfully (Mock Mode)" : "Seat not found",
          data: { seat: updated }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/seat/update/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updates)
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async delete(id) {
      if (isMockEnabled()) {
        const res = mockStore.deleteSeat(id);
        return res;
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/seat/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    }
  },

  // ─── SHIFTS ────────────────────────────────────────
  shifts: {
    async getAll() {
      if (isMockEnabled()) {
        const shifts = mockStore.getShifts();
        return {
          success: true,
          message: "Shifts retrieved (Mock Mode)",
          data: { shifts }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/shift/all`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async getById(id) {
      if (isMockEnabled()) {
        const shift = mockStore.getShifts().find(s => s._id === id);
        return {
          success: !!shift,
          message: shift ? "Shift retrieved (Mock Mode)" : "Shift not found",
          data: { shift }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/shift/get/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async create(shiftData) {
      if (isMockEnabled()) {
        const shift = mockStore.addShift(shiftData);
        return {
          success: true,
          message: "Shift created (Mock Mode)",
          data: { shift }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/shift/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(shiftData)
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async update(id, updates) {
      if (isMockEnabled()) {
        const shift = mockStore.updateShift(id, updates);
        return {
          success: true,
          message: "Shift updated (Mock Mode)",
          data: { shift }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/shift/update/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updates)
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async toggle(id) {
      if (isMockEnabled()) {
        const shift = mockStore.toggleShift(id);
        return {
          success: true,
          message: "Shift status toggled (Mock Mode)",
          data: { shift }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/shift/toggle/${id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async delete(id) {
      if (isMockEnabled()) {
        mockStore.deleteShift(id);
        return {
          success: true,
          message: "Shift deleted (Mock Mode)",
          data: null
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/shift/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    }
  },

  // ─── LOCKERS ───────────────────────────────────────
  lockers: {
    async getAll(filters = {}) {
      if (isMockEnabled()) {
        let lockers = mockStore.getLockers();
        if (filters.status && filters.status !== 'all') {
          lockers = lockers.filter(l => l.status === filters.status);
        }
        if (filters.isOccupied !== undefined && filters.isOccupied !== 'all') {
          const isOcc = filters.isOccupied === true || filters.isOccupied === 'true';
          lockers = lockers.filter(l => l.isOccupied === isOcc || (l.status === 'occupied') === isOcc);
        }
        return {
          success: true,
          message: "Lockers retrieved (Mock Mode)",
          data: { lockers }
        };
      }

      const token = getStoredAdminToken();
      try {
        const params = new URLSearchParams();
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.isOccupied !== undefined && filters.isOccupied !== 'all') {
          params.append('isOccupied', String(filters.isOccupied));
        }
        const qs = params.toString() ? `?${params.toString()}` : '';

        const res = await fetch(`${BASE_URL}/admin/locker/all${qs}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async getById(id) {
      if (isMockEnabled()) {
        const locker = mockStore.getLockers().find(l => l._id === id || l.id === id);
        return {
          success: !!locker,
          message: locker ? "Locker retrieved (Mock Mode)" : "Locker not found",
          data: { locker }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/locker/get/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async create(lockerData) {
      if (isMockEnabled()) {
        const locker = mockStore.createLocker(lockerData);
        return {
          success: true,
          message: "Locker created (Mock Mode)",
          data: { locker }
        };
      }

      const token = getStoredAdminToken();
      try {
        const payload = {
          lockerNumber: lockerData.lockerNumber,
          price: Number(lockerData.price) || 0,
          status: lockerData.status || 'available'
        };
        const res = await fetch(`${BASE_URL}/admin/locker/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async bulkCreate(payload) {
      if (isMockEnabled()) {
        const created = mockStore.bulkCreateLockers(payload);
        return {
          success: true,
          message: `${created.length} lockers created successfully (Mock Mode)`,
          data: { count: created.length }
        };
      }

      const token = getStoredAdminToken();
      try {
        const cleanPrefix = payload.prefix ? String(payload.prefix).replace(/-+$/, '') : 'L';
        const body = {
          prefix: cleanPrefix,
          start: parseInt(payload.start, 10),
          end: parseInt(payload.end, 10),
          price: Number(payload.price) || 0
        };

        const res = await fetch(`${BASE_URL}/admin/locker/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async update(id, updates) {
      if (isMockEnabled()) {
        const locker = mockStore.updateLocker(id, updates);
        return {
          success: !!locker,
          message: locker ? "Locker updated (Mock Mode)" : "Locker not found",
          data: { locker }
        };
      }

      const token = getStoredAdminToken();
      try {
        const payload = {
          lockerNumber: updates.lockerNumber,
          price: updates.price !== undefined ? Number(updates.price) : undefined,
          status: updates.status
        };
        const res = await fetch(`${BASE_URL}/admin/locker/update/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async delete(id) {
      if (isMockEnabled()) {
        const res = mockStore.deleteLocker(id);
        return res;
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/locker/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async assign(lockerId, studentId, studentName) {
      if (isMockEnabled()) {
        const locker = mockStore.assignLocker(lockerId, studentName || "Student");
        return {
          success: !!locker,
          message: "Locker assigned successfully (Mock Mode)",
          data: { locker }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/locker/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ lockerId, studentId })
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async release(lockerId) {
      if (isMockEnabled()) {
        const locker = mockStore.releaseLocker(lockerId);
        return {
          success: !!locker,
          message: "Locker released successfully (Mock Mode)",
          data: { locker }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/locker/release`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ lockerId })
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    }
  },

  // ─── BOOKS ─────────────────────────────────────────
  books: {
    async getAll(params = {}) {
      if (isMockEnabled()) {
        let books = mockStore.getBooks();
        if (params.category && params.category !== 'all') {
          books = books.filter(b => b.category === params.category);
        }
        if (params.search) {
          const s = params.search.toLowerCase();
          books = books.filter(b =>
            b.title?.toLowerCase().includes(s) ||
            b.author?.toLowerCase().includes(s) ||
            b.isbn?.toLowerCase().includes(s) ||
            b.ISBN?.toLowerCase().includes(s)
          );
        }
        return {
          success: true,
          message: "Books retrieved (Mock Mode)",
          data: { books, pagination: { total: books.length, page: 1, pages: 1 } }
        };
      }

      const token = getStoredAdminToken();
      try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        if (params.category && params.category !== 'all') queryParams.append('category', params.category);
        const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

        const res = await fetch(`${BASE_URL}/admin/book/all${qs}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async getById(id) {
      if (isMockEnabled()) {
        const book = mockStore.getBooks().find(b => b._id === id || b.id === id);
        return {
          success: !!book,
          message: book ? "Book retrieved (Mock Mode)" : "Book not found",
          data: { book }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/book/get/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async add(bookData, file = null) {
      if (isMockEnabled()) {
        const book = mockStore.addBook(bookData);
        return {
          success: true,
          message: "Book added (Mock Mode)",
          data: { book }
        };
      }

      const token = getStoredAdminToken();
      try {
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        let body;
        if (bookData instanceof FormData) {
          body = bookData;
          if (file && !body.has('image')) {
            body.append('image', file);
          }
        } else if (file) {
          body = new FormData();
          Object.entries(bookData || {}).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
              body.append(key, val);
            }
          });
          body.append('image', file);
        } else {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(bookData);
        }

        const res = await fetch(`${BASE_URL}/admin/book/add`, {
          method: 'POST',
          headers,
          body
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async update(id, updates, file = null) {
      if (isMockEnabled()) {
        const book = mockStore.updateBook(id, updates);
        return {
          success: !!book,
          message: book ? "Book updated (Mock Mode)" : "Book not found",
          data: { book }
        };
      }

      const token = getStoredAdminToken();
      try {
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        let body;
        if (updates instanceof FormData) {
          body = updates;
          if (file && !body.has('image')) {
            body.append('image', file);
          }
        } else if (file) {
          body = new FormData();
          Object.entries(updates || {}).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
              body.append(key, val);
            }
          });
          body.append('image', file);
        } else {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(updates);
        }

        const res = await fetch(`${BASE_URL}/admin/book/update/${id}`, {
          method: 'PUT',
          headers,
          body
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async delete(id) {
      if (isMockEnabled()) {
        const res = mockStore.deleteBook(id);
        return res;
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/book/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async issue(issueData) {
      if (isMockEnabled()) {
        const issue = mockStore.issueBook(issueData);
        return {
          success: true,
          message: "Book issued (Mock Mode)",
          data: { issue }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/book/issue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(issueData)
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async returnBook(issueId, finePaid = 0) {
      if (isMockEnabled()) {
        const issue = mockStore.returnBook(issueId);
        return {
          success: true,
          message: "Book returned (Mock Mode)",
          data: { issue, fineAmount: finePaid }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/book/return`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ issueId, finePaid })
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async getIssues(params = {}) {
      if (isMockEnabled()) {
        let issues = mockStore.getBookIssues();
        if (params.status && params.status !== 'all') {
          issues = issues.filter(i => i.status === params.status);
        }
        return {
          success: true,
          message: "Book issues retrieved (Mock Mode)",
          data: { issues }
        };
      }

      const token = getStoredAdminToken();
      try {
        const queryParams = new URLSearchParams();
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);
        const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

        const res = await fetch(`${BASE_URL}/admin/book/issues${qs}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    }
  },

  // ─── DASHBOARD ─────────────────────────────────────
  dashboard: {
    async getStats(token = null) {
      if (isMockEnabled()) {
        const stats = mockStore.getDashboardStats();
        return {
          success: true,
          message: "Dashboard stats retrieved (Mock Mode)",
          data: stats
        };
      }

      const authToken = token || getStoredAdminToken();
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        const res = await fetch(`${BASE_URL}/admin/dashboard/stats`, {
          method: 'GET',
          headers
        });
        const resData = await res.json();
        return resData;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    }
  },

  // ─── BILLING & PAYMENT (RAZORPAY) ───────────────────
  billing: {
    async getPlans() {
      if (isMockEnabled()) {
        return {
          success: true,
          message: "Plans retrieved (Mock Mode)",
          data: { plans: INITIAL_PLANS }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/plan/all`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 404 || res.status === 403) {
          return {
            success: false,
            unavailable: true,
            message: "Plan catalog unavailable for library administrators on the backend"
          };
        }
        return await res.json();
      } catch (err) {
        return {
          success: false,
          unavailable: true,
          message: `Plan catalog unavailable: ${err.message}`
        };
      }
    },

    async createOrder(data = {}) {
      if (isMockEnabled()) {
        return {
          success: true,
          message: "Mock order created",
          data: {
            orderId: "order_mock_" + Math.random().toString(36).substring(2, 10),
            amount: 119900,
            currency: "INR",
            key: "rzp_test_mock_key_unverified"
          }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/payment/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        const resData = await res.json();
        return resData;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to payment gateway: ${err.message}`,
          error: err.message
        };
      }
    },

    async verifyPayment(paymentData = {}) {
      if (isMockEnabled()) {
        return {
          success: true,
          message: "Payment verified (Mock mode)",
          data: {
            subscription: {
              id: "sub_mock_" + Date.now(),
              status: "paid",
              active: true
            }
          }
        };
      }

      const token = getStoredAdminToken();
      try {
        const res = await fetch(`${BASE_URL}/admin/payment/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(paymentData)
        });
        const resData = await res.json();
        return resData;
      } catch (err) {
        return {
          success: false,
          message: `Network error verifying payment: ${err.message}`,
          error: err.message
        };
      }
    }
  },

  payments: {
    createOrder(planId, billingCycle = 'monthly') {
      if (isMockEnabled()) {
        return mockResponse({
          orderId: "order_mock_" + Math.random().toString(36).substring(2, 10),
          amount: 119900,
          currency: "INR",
          key: "rzp_test_mock_key_unverified"
        }, "Mock order created");
      }
      return api.billing.createOrder({ planId, billingCycle });
    },
    verifyPayment(payload) {
      if (isMockEnabled()) {
        return mockResponse({
          subscription: {
            id: "sub_mock_" + Date.now(),
            status: "paid",
            active: true
          }
        }, "Payment verified (Mock mode)");
      }
      return api.billing.verifyPayment(payload);
    }
  },

  // ─── STUDENT SELF-SERVICE PORTAL ───────────────────
  studentPortal: {
    async login(studentId, password) {
      if (isMockEnabled()) {
        const student = mockStore.getStudents().find(s =>
          s.studentId?.toLowerCase() === studentId?.toLowerCase() ||
          (s.phone && s.phone.includes(studentId))
        ) || mockStore.getStudents()[0];
        return {
          success: true,
          message: "Student login successful (Mock Mode)",
          data: {
            token: "mock_student_jwt_" + Date.now(),
            student
          }
        };
      }

      try {
        const res = await fetch(`${BASE_URL}/student/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, password })
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async getProfile(token = null) {
      if (isMockEnabled()) {
        const student = mockStore.getStudents()[0];
        return {
          success: true,
          message: "Student profile retrieved (Mock Mode)",
          data: student
        };
      }

      const authToken = token || getStoredStudentToken();
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        const res = await fetch(`${BASE_URL}/student/profile`, {
          method: 'GET',
          headers
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async getInvoices(params = {}, token = null) {
      if (isMockEnabled()) {
        return {
          success: true,
          message: "Invoices retrieved (Mock Mode)",
          data: {
            invoices: [
              {
                _id: "inv_101",
                invoiceNumber: "INV-048123",
                issueDate: "2026-08-01",
                totalPayable: 1800,
                amountPaidNow: 1800,
                status: "paid",
                period: "01 Aug 2026 - 01 Nov 2026 (3 Months)"
              },
              {
                _id: "inv_102",
                invoiceNumber: "INV-048991",
                issueDate: "2026-05-01",
                totalPayable: 1800,
                amountPaidNow: 1800,
                status: "paid",
                period: "01 May 2026 - 01 Aug 2026 (3 Months)"
              }
            ],
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1
          }
        };
      }

      const authToken = token || getStoredStudentToken();
      try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', params.page);
        if (params.limit) queryParams.set('limit', params.limit);

        const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const res = await fetch(`${BASE_URL}/student/invoices${qs}`, {
          method: 'GET',
          headers
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    },

    async getPayments(params = {}, token = null) {
      if (isMockEnabled()) {
        return {
          success: true,
          message: "Payment history retrieved (Mock Mode)",
          data: {
            payments: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
          }
        };
      }

      const authToken = token || getStoredStudentToken();
      try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', params.page);
        if (params.limit) queryParams.set('limit', params.limit);

        const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const res = await fetch(`${BASE_URL}/student/payments${qs}`, {
          method: 'GET',
          headers
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          success: false,
          message: `Network error connecting to backend: ${err.message}`,
          error: err.message
        };
      }
    }
  },

  // ─── SUPER ADMIN ───────────────────────────────────
  superAdmin: {
    auth: {
      async login(credentials) {
        if (isMockEnabled()) {
          const inputEmail = (credentials.email || '').trim().toLowerCase();
          const inputPass = (credentials.password || '').trim();
          if (
            (inputEmail === 'superadmin@librarysathi.in' || inputEmail === 'superadmin@apexlibrary.in') &&
            inputPass === 'superadmin123'
          ) {
            return {
              success: true,
              message: "Login successful (Mock Mode)",
              data: {
                token: "mock_jwt_superadmin_" + Date.now(),
                user: { email: inputEmail, name: "System Super Admin", role: "super-admin" }
              }
            };
          }
          return {
            success: false,
            message: "Invalid Super Admin credentials. (Hint: superadmin@librarysathi.in / superadmin123)"
          };
        }

        try {
          const res = await fetch(`${BASE_URL}/super-admin/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });
          const data = await res.json();
          return data;
        } catch (err) {
          return {
            success: false,
            message: `Network error connecting to backend: ${err.message}`,
            error: err.message
          };
        }
      },

      async register(userData) {
        if (isMockEnabled()) {
          return {
            success: true,
            message: "Super Admin registered successfully (Mock Mode)",
            data: {
              token: "mock_jwt_superadmin_" + Date.now(),
              user: { email: userData.email, name: userData.name, role: "super-admin" }
            }
          };
        }

        try {
          const res = await fetch(`${BASE_URL}/super-admin/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          const data = await res.json();
          return data;
        } catch (err) {
          return {
            success: false,
            message: `Network error connecting to backend: ${err.message}`,
            error: err.message
          };
        }
      },

      async getProfile(token = null) {
        if (isMockEnabled()) {
          return {
            success: true,
            message: "Profile fetched successfully (Mock Mode)",
            data: {
              user: { email: "superadmin@librarysathi.in", name: "System Super Admin", role: "super-admin" }
            }
          };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const res = await fetch(`${BASE_URL}/super-admin/auth/profile`, {
            method: 'GET',
            headers
          });
          const data = await res.json();
          return data;
        } catch (err) {
          return {
            success: false,
            message: `Network error connecting to backend: ${err.message}`,
            error: err.message
          };
        }
      }
    },

    features: {
      async getAll(params = {}, token = null) {
        if (isMockEnabled()) {
          let feats = mockStore.getFeatures();
          if (params.type && params.type !== 'all') {
            feats = feats.filter(f => f.type === params.type);
          }
          if (params.isActive !== undefined) {
            feats = feats.filter(f => f.isActive === (params.isActive === 'true' || params.isActive === true));
          }
          return {
            success: true,
            message: "Features fetched successfully (Mock Mode)",
            data: {
              features: feats,
              pagination: { total: feats.length, page: 1, limit: feats.length, pages: 1 }
            }
          };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const queryParams = new URLSearchParams();
          if (params.type && params.type !== 'all') queryParams.set('type', params.type);
          if (params.isActive !== undefined && params.isActive !== '') queryParams.set('isActive', params.isActive);
          if (params.page) queryParams.set('page', params.page);
          if (params.limit) queryParams.set('limit', params.limit);

          const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

          const res = await fetch(`${BASE_URL}/super-admin/feature/all${qs}`, {
            method: 'GET',
            headers
          });
          const data = await res.json();
          return data;
        } catch (err) {
          return {
            success: false,
            message: `Network error connecting to backend: ${err.message}`,
            error: err.message
          };
        }
      },

      async getById(id, token = null) {
        if (isMockEnabled()) {
          const feats = mockStore.getFeatures();
          const feat = feats.find(f => f._id === id);
          if (!feat) return { success: false, message: "Feature not found" };
          return { success: true, message: "Feature fetched successfully", data: { feature: feat } };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const res = await fetch(`${BASE_URL}/super-admin/feature/get/${id}`, {
            method: 'GET',
            headers
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      },

      async create(featureData, file = null, token = null) {
        if (isMockEnabled()) {
          const created = mockStore.addFeature(featureData);
          return {
            success: true,
            message: "Feature created successfully (Mock Mode)",
            data: { feature: created }
          };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          let body;
          const headers = {};
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

          if (file) {
            body = new FormData();
            Object.entries(featureData).forEach(([k, v]) => {
              if (typeof v === 'object' && v !== null) {
                body.append(k, JSON.stringify(v));
              } else {
                body.append(k, v);
              }
            });
            body.append('file', file);
          } else {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(featureData);
          }

          const res = await fetch(`${BASE_URL}/super-admin/feature/create`, {
            method: 'POST',
            headers,
            body
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      },

      async update(id, updates, file = null, token = null) {
        if (isMockEnabled()) {
          const updated = mockStore.updateFeature(id, updates);
          if (!updated) return { success: false, message: "Feature not found" };
          return {
            success: true,
            message: "Feature updated successfully (Mock Mode)",
            data: { feature: updated }
          };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          let body;
          const headers = {};
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

          if (file) {
            body = new FormData();
            Object.entries(updates).forEach(([k, v]) => {
              if (typeof v === 'object' && v !== null) {
                body.append(k, JSON.stringify(v));
              } else {
                body.append(k, v);
              }
            });
            body.append('file', file);
          } else {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(updates);
          }

          const res = await fetch(`${BASE_URL}/super-admin/feature/update/${id}`, {
            method: 'PUT',
            headers,
            body
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      },

      async delete(id, token = null) {
        if (isMockEnabled()) {
          mockStore.deleteFeature(id);
          return { success: true, message: "Feature deleted successfully (Mock Mode)" };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const res = await fetch(`${BASE_URL}/super-admin/feature/delete/${id}`, {
            method: 'DELETE',
            headers
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      },

      async toggle(id, token = null) {
        if (isMockEnabled()) {
          const feat = mockStore.toggleFeature(id);
          if (!feat) return { success: false, message: "Feature not found" };
          return {
            success: true,
            message: "Feature status updated successfully (Mock Mode)",
            data: { feature: feat }
          };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const res = await fetch(`${BASE_URL}/super-admin/feature/toggle/${id}`, {
            method: 'PATCH',
            headers
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      }
    },

    plans: {
      async getAll(params = {}, token = null) {
        if (isMockEnabled()) {
          let plans = mockStore.getPlans();
          if (params.isActive !== undefined) {
            plans = plans.filter(p => p.isActive === (params.isActive === 'true' || params.isActive === true));
          }
          return {
            success: true,
            message: "Plans fetched successfully (Mock Mode)",
            data: {
              plans,
              pagination: { total: plans.length, page: 1, limit: plans.length, pages: 1 }
            }
          };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const queryParams = new URLSearchParams();
          if (params.isActive !== undefined && params.isActive !== '') queryParams.set('isActive', params.isActive);
          if (params.page) queryParams.set('page', params.page);
          if (params.limit) queryParams.set('limit', params.limit);

          const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

          const res = await fetch(`${BASE_URL}/super-admin/plan/all${qs}`, {
            method: 'GET',
            headers
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      },

      async getById(id, token = null) {
        if (isMockEnabled()) {
          const plans = mockStore.getPlans();
          const plan = plans.find(p => p._id === id);
          if (!plan) return { success: false, message: "Plan not found" };
          return { success: true, message: "Plan fetched successfully", data: { plan } };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const res = await fetch(`${BASE_URL}/super-admin/plan/get/${id}`, {
            method: 'GET',
            headers
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      },

      async create(planData, token = null) {
        if (isMockEnabled()) {
          const created = mockStore.createPlan(planData);
          return {
            success: true,
            message: "Plan created successfully (Mock Mode)",
            data: { plan: created }
          };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const res = await fetch(`${BASE_URL}/super-admin/plan/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify(planData)
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      },

      async update(id, updates, token = null) {
        if (isMockEnabled()) {
          const updated = mockStore.updatePlan(id, updates);
          if (!updated) return { success: false, message: "Plan not found" };
          return {
            success: true,
            message: "Plan updated successfully (Mock Mode)",
            data: { plan: updated }
          };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const res = await fetch(`${BASE_URL}/super-admin/plan/update/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updates)
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      },

      async delete(id, token = null) {
        if (isMockEnabled()) {
          mockStore.deletePlan(id);
          return { success: true, message: "Plan deleted successfully (Mock Mode)" };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const res = await fetch(`${BASE_URL}/super-admin/plan/delete/${id}`, {
            method: 'DELETE',
            headers
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      },

      async toggle(id, token = null) {
        if (isMockEnabled()) {
          const plans = mockStore.getPlans();
          const plan = plans.find(p => p._id === id);
          if (plan) {
            plan.isActive = !plan.isActive;
            mockStore.updatePlan(id, { isActive: plan.isActive });
            return {
              success: true,
              message: "Plan status updated successfully (Mock Mode)",
              data: { plan }
            };
          }
          return { success: false, message: "Plan not found" };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const res = await fetch(`${BASE_URL}/super-admin/plan/toggle/${id}`, {
            method: 'PATCH',
            headers
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      }
    },

    subscriptions: {
      async getAll(params = {}, token = null) {
        if (isMockEnabled()) {
          let subs = mockStore.getSubscriptions();
          if (params.paymentStatus && params.paymentStatus !== 'all') {
            subs = subs.filter(s => s.paymentStatus === params.paymentStatus);
          }
          return {
            success: true,
            message: "Subscriptions fetched successfully (Mock Mode)",
            data: {
              subscriptions: subs,
              pagination: { total: subs.length, page: 1, limit: subs.length, pages: 1 }
            }
          };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const queryParams = new URLSearchParams();
          if (params.paymentStatus && params.paymentStatus !== 'all') {
            queryParams.set('paymentStatus', params.paymentStatus);
          }
          if (params.page) queryParams.set('page', params.page);
          if (params.limit) queryParams.set('limit', params.limit);

          const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

          const res = await fetch(`${BASE_URL}/super-admin/subscription/all${qs}`, {
            method: 'GET',
            headers
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      },

      async getById(id, token = null) {
        if (isMockEnabled()) {
          const subs = mockStore.getSubscriptions();
          const sub = subs.find(s => s._id === id);
          if (!sub) return { success: false, message: "Subscription not found" };
          return { success: true, message: "Subscription fetched successfully", data: { subscription: sub } };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const res = await fetch(`${BASE_URL}/super-admin/subscription/get/${id}`, {
            method: 'GET',
            headers
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      },

      async updateStatus(id, paymentStatus, token = null) {
        if (isMockEnabled()) {
          const sub = mockStore.updateSubscriptionStatus(id, paymentStatus);
          if (!sub) return { success: false, message: "Subscription not found" };
          return {
            success: true,
            message: "Subscription status updated successfully (Mock Mode)",
            data: { subscription: sub }
          };
        }

        const authToken = token || getStoredSuperAdminToken();
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const res = await fetch(`${BASE_URL}/super-admin/subscription/status/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ paymentStatus })
          });
          return await res.json();
        } catch (err) {
          return { success: false, message: `Network error: ${err.message}`, error: err.message };
        }
      }
    }
  }
};
