// frontend/lib/api.js
// ZameenTrace API Client with error handling

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

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

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Request Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Authentication endpoints
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async signup(email, password, name) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // Parcel endpoints
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
    const params = new URLSearchParams({
      q: query,
      ...filters,
    });
    return this.request(`/parcels?${params.toString()}`);
  }

  async updateParcelBoundary(parcelId, coordinates) {
    return this.request(`/parcels/${parcelId}/boundary`, {
      method: 'PUT',
      body: JSON.stringify({ coordinates }),
    });
  }

  async verifyParcel(parcelId, verificationData) {
    return this.request(`/parcels/${parcelId}/verify`, {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  // Report endpoints
  async generateReport(parcelId) {
    return this.request(`/reports/parcel/${parcelId}`);
  }

  async getReportHistory(parcelId) {
    return this.request(`/reports/history/${parcelId}`);
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getAlerts(limit = 10) {
    return this.request(`/dashboard/alerts?limit=${limit}`);
  }

  async getMarketTrends(region, timeRange = '7d') {
    return this.request(`/market/trends?region=${region}&range=${timeRange}`);
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserProperties() {
    return this.request('/user/properties');
  }
}

export const apiClient = new APIClient();
export default apiClient;
