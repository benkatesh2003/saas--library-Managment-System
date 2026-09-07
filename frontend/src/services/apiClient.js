
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
 * API Service Layer mirroring exact backend routes
 */
export const api = {
  // ─── AUTH (ADMIN) ──────────────────────────────────
  auth: {
    async login(credentials) {
      

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
      

      try {
        const res = await fetch(`${BASE_URL}/admin/auth/google/login`, {
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
      
      return api.billing.createOrder({ planId, billingCycle });
    },
    verifyPayment(payload) {
      
      return api.billing.verifyPayment(payload);
    }
  },

  // ─── STUDENT SELF-SERVICE PORTAL ───────────────────
  studentPortal: {
    async login(studentId, password) {
      

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
