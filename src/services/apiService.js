// API Service Module
import API_CONFIG from "../utils/config.js";
import authService from "./authService.js";

class APIService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Get authorization headers
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = authService.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const { method = "GET", body, headers = {}, includeAuth = true } = options;

    const config = {
      method,
      headers: {
        ...this.getHeaders(includeAuth),
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const url = `${this.baseURL}${endpoint}`;

    console.log(`🌐 API Request: ${method} ${url}`);
    console.log('📤 Request Body:', body);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`📥 Response Status: ${response.status} ${response.statusText}`);

      // Try to parse response as JSON
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error(`Server returned invalid response. Status: ${response.status}`);
      }

      if (!response.ok) {
        console.error('❌ API Error:', responseData);
        throw new Error(responseData.message || responseData.error || `Request failed with status ${response.status}`);
      }

      console.log('✅ API Response:', responseData);
      return responseData;
    } catch (error) {
      if (error.name === "AbortError") {
        console.error('⏱️ Request timeout');
        throw new Error("Request timeout - server took too long to respond");
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error('🔌 Network Error:', error);
        throw new Error("Network error - please check your internet connection and API URL");
      }
      console.error('❌ Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  // POST request
  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  // PUT request
  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  // PATCH request
  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PATCH", body });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // User API methods
  async register(userData) {
    return this.post(API_CONFIG.ENDPOINTS.REGISTER, userData, {
      includeAuth: false,
    });
  }

  async login(credentials) {
    return this.post(API_CONFIG.ENDPOINTS.LOGIN, credentials, {
      includeAuth: false,
    });
  }

  async getProfile() {
    return this.get(API_CONFIG.ENDPOINTS.PROFILE);
  }

  async updateProfile(userData) {
    return this.put(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, userData);
  }

  async changePassword(passwordData) {
    return this.put(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, passwordData);
  }

  // Event API methods
  async getEvents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `${API_CONFIG.ENDPOINTS.EVENTS}?${queryString}`
      : API_CONFIG.ENDPOINTS.EVENTS;
    return this.get(endpoint);
  }

  async getEventById(id) {
    return this.get(API_CONFIG.ENDPOINTS.EVENT_BY_ID(id));
  }

  async createEvent(eventData) {
    return this.post(API_CONFIG.ENDPOINTS.EVENTS, eventData);
  }

  async updateEvent(id, eventData) {
    return this.put(API_CONFIG.ENDPOINTS.EVENT_BY_ID(id), eventData);
  }

  async deleteEvent(id) {
    return this.delete(API_CONFIG.ENDPOINTS.EVENT_BY_ID(id));
  }

  async publishEvent(id) {
    return this.patch(API_CONFIG.ENDPOINTS.PUBLISH_EVENT(id));
  }

  // Registration API methods
  async getRegistrations() {
    return this.get(API_CONFIG.ENDPOINTS.REGISTRATIONS);
  }

  async getEventRegistrations(eventId) {
    return this.get(API_CONFIG.ENDPOINTS.EVENT_REGISTRATIONS(eventId));
  }

  async getUserRegistrations(userId) {
    return this.get(API_CONFIG.ENDPOINTS.USER_REGISTRATIONS(userId));
  }

  async createRegistration(registrationData) {
    return this.post(API_CONFIG.ENDPOINTS.REGISTRATIONS, registrationData);
  }

  async updateRegistration(id, registrationData) {
    return this.put(API_CONFIG.ENDPOINTS.UPDATE_REGISTRATION(id), registrationData);
  }

  async updateRegistrationStatus(id, status) {
    return this.patch(API_CONFIG.ENDPOINTS.UPDATE_REGISTRATION_STATUS(id), { status });
  }

  async checkInRegistration(id) {
    return this.patch(API_CONFIG.ENDPOINTS.CHECK_IN(id));
  }

  async cancelRegistration(id) {
    return this.delete(API_CONFIG.ENDPOINTS.CANCEL_REGISTRATION(id));
  }

  // Analytics API methods
  async getEventAnalytics(eventId) {
    return this.get(API_CONFIG.ENDPOINTS.EVENT_ANALYTICS(eventId));
  }

  async getAnalyticsSummary(eventId) {
    return this.get(API_CONFIG.ENDPOINTS.ANALYTICS_SUMMARY(eventId));
  }

  async generateAnalytics(eventId) {
    return this.post(API_CONFIG.ENDPOINTS.GENERATE_ANALYTICS(eventId));
  }

  async trackView(eventId) {
    return this.post(API_CONFIG.ENDPOINTS.TRACK_VIEW(eventId));
  }
}

export default new APIService();
