const rawUrl = import.meta.env.VITE_API_URL || '';
const API_BASE = rawUrl ? (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`) : '/api';

function getAuthHeader() {
  const token = localStorage.getItem('apex_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async sendOtp(email) {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to send verification code');
    }
    return res.json();
  },

  async verifyOtp(email, otp, full_name, phone) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, full_name, phone }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Verification failed');
    }
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Stations & Plans
  async getStations() {
    const res = await fetch(`${API_BASE}/stations/`);
    if (!res.ok) throw new Error('Failed to fetch stations');
    return res.json();
  },

  async getGamingPlans() {
    try {
      const res = await fetch(`${API_BASE}/stations/plans`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  // Bookings & Availability
  async getAvailability(date, stationId = null) {
    let url = `${API_BASE}/bookings/availability?date=${date}`;
    if (stationId) url += `&station_id=${stationId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to check availability');
    return res.json();
  },

  async createBooking(bookingData) {
    const res = await fetch(`${API_BASE}/bookings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Booking failed');
    }
    return res.json();
  },

  async getMyBookings() {
    const res = await fetch(`${API_BASE}/bookings/my`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch user bookings');
    return res.json();
  },

  async cancelBooking(bookingId) {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Cancellation failed');
    }
    return res.json();
  },

  // Admin APIs
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async getAllBookings(date = '', status = '') {
    let url = `${API_BASE}/admin/bookings?`;
    if (date) url += `date=${date}&`;
    if (status) url += `status=${status}&`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async updateBookingStatus(bookingId, newStatus) {
    const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/status?status=${newStatus}`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Status update failed');
    }
    return res.json();
  }
};

export function calculateStationPrice(station, duration, gamingPlans = []) {
  if (!station) return { originalPrice: 0, finalPrice: 0, discount: 0, plan: null };
  const standardTotal = Number(station.hourly_rate) * Number(duration);
  if (!gamingPlans || gamingPlans.length === 0) {
    return { originalPrice: standardTotal, finalPrice: standardTotal, discount: 0, plan: null };
  }

  const durationPlans = gamingPlans.filter(p => Number(p.duration_hours) === Number(duration) && p.type === 0);
  
  // 1. Try matching original standard price
  let matchedPlan = durationPlans.find(p => Math.abs(Number(p.original_price) - standardTotal) < 1.0);

  // 2. Fallback to setup type
  if (!matchedPlan) {
    const isPS5 = station.specs?.toUpperCase().includes('PS5') || station.name?.toUpperCase().includes('PS5');
    const isPS4 = station.specs?.toUpperCase().includes('PS4') || station.name?.toUpperCase().includes('PS4');
    matchedPlan = durationPlans.find(p => {
      const target = (p.target_setup_type || '').toUpperCase();
      if (isPS5 && target.includes('PS5')) return true;
      if (isPS4 && target.includes('PS4')) return true;
      if (!isPS5 && !isPS4 && (target.includes('PC') || target.includes('PC 1'))) return true;
      return false;
    });
  }

  if (matchedPlan) {
    const finalPrice = Number(matchedPlan.price);
    const origPrice = Number(matchedPlan.original_price) || standardTotal;
    const discount = Math.max(0, origPrice - finalPrice);
    return {
      originalPrice: origPrice,
      finalPrice,
      discount,
      plan: matchedPlan,
    };
  }

  return { originalPrice: standardTotal, finalPrice: standardTotal, discount: 0, plan: null };
}
