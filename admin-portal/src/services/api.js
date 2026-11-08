const rawUrl = import.meta.env.VITE_API_URL || '';
const API_BASE = rawUrl ? (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`) : '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('apex_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  // KPI & Dashboard
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  // 1. Gaming Setups / Stations Controller
  getSetups: async () => {
    const res = await fetch(`${API_BASE}/admin/setups`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch gaming setups');
    return res.json();
  },

  createSetup: async (data) => {
    const res = await fetch(`${API_BASE}/admin/setups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create station');
    }
    return res.json();
  },

  updateSetup: async (setupId, data) => {
    const res = await fetch(`${API_BASE}/admin/setups/${setupId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update station');
    }
    return res.json();
  },

  toggleSetupStatus: async (setupId) => {
    const res = await fetch(`${API_BASE}/admin/setups/${setupId}/toggle-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle status');
    return res.json();
  },

  // 2. Live Gaming Sessions
  getSessions: async (activeOnly = true) => {
    const res = await fetch(`${API_BASE}/admin/sessions?active_only=${activeOnly}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  startSession: async (data) => {
    const res = await fetch(`${API_BASE}/admin/sessions/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to start session');
    }
    return res.json();
  },

  endSession: async (sessionId, data = {}) => {
    const res = await fetch(`${API_BASE}/admin/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to end session');
    }
    return res.json();
  },

  // 3. Customers & Wallet Topup
  getCustomers: async (search = '') => {
    const res = await fetch(`${API_BASE}/admin/customers?search=${encodeURIComponent(search)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  createCustomer: async (data) => {
    const res = await fetch(`${API_BASE}/admin/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create customer');
    }
    return res.json();
  },

  topupWallet: async (customerId, data) => {
    const res = await fetch(`${API_BASE}/admin/customers/${customerId}/wallet/topup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to top up wallet');
    }
    return res.json();
  },

  rechargeCustomerPlan: async (customerId, data) => {
    const res = await fetch(`${API_BASE}/admin/customers/${customerId}/recharge-plan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to recharge plan');
    }
    return res.json();
  },

  getCustomerPasses: async (customerId) => {
    const res = await fetch(`${API_BASE}/admin/customers/${customerId}/passes`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch customer passes');
    return res.json();
  },

  // 4. Gaming Plans & Offers
  getPlans: async () => {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch plans');
    return res.json();
  },

  createPlan: async (data) => {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create plan');
    }
    return res.json();
  },

  updatePlan: async (planId, data) => {
    const res = await fetch(`${API_BASE}/admin/plans/${planId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update plan');
    }
    return res.json();
  },

  // 5. Online Bookings Desk
  getAllBookings: async (date = '', status = '') => {
    let url = `${API_BASE}/admin/bookings?`;
    if (date) url += `date=${encodeURIComponent(date)}&`;
    if (status) url += `status=${encodeURIComponent(status)}&`;

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  checkinBooking: async (bookingId) => {
    const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/checkin`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to check in booking');
    }
    return res.json();
  },

  updateBookingStatus: async (bookingId, status) => {
    const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/status?status=${status}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Status update failed');
    }
    return res.json();
  },

  // 6. Reports Summary
  getReportsSummary: async () => {
    const res = await fetch(`${API_BASE}/admin/reports/summary`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch reports summary');
    return res.json();
  },
};
