// frontend/lib/api-client.js
// ZameenTrace API Client with full error handling and real auth endpoints

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

class APIClient {
  // Rehydrate the saved auth token in the browser so sessions survive refreshes.
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = null;

    // Auto-initialize token from localStorage in browser context
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('authToken');
      if (stored) {
        this.token = stored;
      }
    }
  }

  // Store or clear the auth token so other requests can use it automatically.
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  clearToken() {
    this.setToken(null);
  }

  // Send a request to the backend and normalize the result for the UI.
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type') || '';
      let data = null;

      if (response.status !== 204) {
        if (contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch {
            data = null;
          }
        } else {
          data = await response.text();
        }
      }

      if (!response.ok) {
        const message =
          (typeof data === 'object' && data?.message) ||
          `API Error: ${response.status} ${response.statusText}`;
        return { success: false, error: message, statusCode: response.status };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  }

  // ─── Authentication ───────────────────────────────────────────────────────

  /**
   * Real login — validates email + password against DB.
   */
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Real registration — creates a user account in DB.
   */
  async register(email, password, fullName, role = 'operator') {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, role }),
    });
  }

  /**
   * Demo session — issues a JWT without password verification.
   * Requires DEMO_AUTH_ENABLED=true on the backend.
   */
  async createDemoSession(userId, email, role = 'operator', fullName = '') {
    return this.request('/auth/session', {
      method: 'POST',
      body: JSON.stringify({ userId, email, role, fullName }),
    });
  }

  // ─── Parcels ──────────────────────────────────────────────────────────────

  async createParcel(parcelData) {
    return this.request('/parcels', {
      method: 'POST',
      body: JSON.stringify(parcelData),
    });
  }

  async getParcel(parcelId) {
    return this.request(`/parcels/${parcelId}`);
  }

  async searchParcels(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters });
    return this.request(`/parcels?${params.toString()}`);
  }

  async listParcels(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    return this.request(`/parcels?${params.toString()}`);
  }

  async updateParcelBoundary(parcelId, payload) {
    return this.request(`/parcels/${parcelId}/boundary`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async verifyParcel(parcelId, verificationData) {
    return this.request(`/parcels/${parcelId}/verify`, {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  // ─── Reports ─────────────────────────────────────────────────────────────

  async generateReport(parcelId) {
    return this.request(`/reports/parcel/${parcelId}`);
  }

  async getReportHistory(parcelId) {
    return this.request(`/reports/history/${parcelId}`);
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getAlerts(limit = 10) {
    return this.request(`/dashboard/alerts?limit=${limit}`);
  }

  // ─── Market ──────────────────────────────────────────────────────────────

  async getMarketTrends(region, timeRange = '7d') {
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    params.set('range', timeRange);
    return this.request(`/market/trends?${params.toString()}`);
  }

  async getComparables(parcelId, radiusMeters = 5000) {
    return this.request(`/market/comparable/${parcelId}?radius=${radiusMeters}`);
  }

  // ─── Users ───────────────────────────────────────────────────────────────

  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserProperties() {
    return this.request('/users/properties');
  }

  // ─── Leads ───────────────────────────────────────────────────────────────

  async submitLead(type, fields) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify({ type, fields }),
    });
  }
}

// Singleton instance
export const apiClient = new APIClient();
export default apiClient;
