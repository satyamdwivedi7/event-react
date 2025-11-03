// API Utility Module
import API_CONFIG from "./config.js";
import AUTH from "./auth.js";

class APIClient {
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
      const token = AUTH.getToken();
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

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        AUTH.logout();
        throw new Error("Session expired. Please login again.");
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");

      // Try to get response text first
      const responseText = await response.text();

      // If not OK status, handle error
      if (!response.ok) {
        // Try to parse as JSON for error message
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.message || `HTTP Error: ${response.status}`);
          } catch (parseError) {
            throw new Error(`HTTP Error: ${response.status} - ${responseText.substring(0, 200)}`);
          }
        } else {
          throw new Error(`Invalid response from server (${response.status}). Expected JSON but got ${contentType || 'unknown'}`);
        }
      }

      // Parse successful response
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Invalid response from server (${response.status}). Expected JSON but got ${contentType || 'unknown'}`);
      }

      const data = JSON.parse(responseText);
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please try again.");
      }
      throw error;
    }
  }

  // GET request
  async get(endpoint, includeAuth = true) {
    return this.request(endpoint, { method: "GET", includeAuth });
  }

  // POST request
  async post(endpoint, body, includeAuth = true) {
    return this.request(endpoint, { method: "POST", body, includeAuth });
  }

  // PUT request
  async put(endpoint, body, includeAuth = true) {
    return this.request(endpoint, { method: "PUT", body, includeAuth });
  }

  // PATCH request
  async patch(endpoint, body, includeAuth = true) {
    return this.request(endpoint, { method: "PATCH", body, includeAuth });
  }

  // DELETE request
  async delete(endpoint, includeAuth = true) {
    return this.request(endpoint, { method: "DELETE", includeAuth });
  }

  // ===== USER ENDPOINTS =====
  async register(userData) {
    return this.post(API_CONFIG.ENDPOINTS.REGISTER, userData, false);
  }

  async login(credentials) {
    return this.post(API_CONFIG.ENDPOINTS.LOGIN, credentials, false);
  }

  async getProfile() {
    return this.get(API_CONFIG.ENDPOINTS.PROFILE);
  }

  async updateProfile(profileData) {
    return this.put(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, profileData);
  }

  async changePassword(passwordData) {
    return this.put(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, passwordData);
  }

  async getAllUsers() {
    return this.get(API_CONFIG.ENDPOINTS.ALL_USERS);
  }

  async getUserById(id) {
    return this.get(API_CONFIG.ENDPOINTS.USER_BY_ID(id));
  }

  async updateUser(id, userData) {
    return this.put(API_CONFIG.ENDPOINTS.USER_BY_ID(id), userData);
  }

  async deleteUser(id) {
    return this.delete(API_CONFIG.ENDPOINTS.USER_BY_ID(id));
  }

  // ===== EVENT ENDPOINTS =====
  async createEvent(eventData) {
    return this.post(API_CONFIG.ENDPOINTS.EVENTS, eventData);
  }

  async getAllEvents() {
    return this.get(API_CONFIG.ENDPOINTS.EVENTS);
  }

  async getEventById(id) {
    return this.get(API_CONFIG.ENDPOINTS.EVENT_BY_ID(id));
  }

  async updateEvent(id, eventData) {
    return this.put(API_CONFIG.ENDPOINTS.EVENT_BY_ID(id), eventData);
  }

  async deleteEvent(id) {
    return this.delete(API_CONFIG.ENDPOINTS.EVENT_BY_ID(id));
  }

  async publishEvent(id) {
    return this.patch(API_CONFIG.ENDPOINTS.PUBLISH_EVENT(id), {});
  }

  // ===== REGISTRATION ENDPOINTS =====
  async createRegistration(registrationData) {
    return this.post(API_CONFIG.ENDPOINTS.REGISTRATIONS, registrationData);
  }

  async getRegistration(id) {
    return this.get(API_CONFIG.ENDPOINTS.REGISTRATION_BY_ID(id), false);
  }

  async getEventRegistrations(eventId) {
    return this.get(API_CONFIG.ENDPOINTS.EVENT_REGISTRATIONS(eventId));
  }

  async getUserRegistrations(userId) {
    return this.get(API_CONFIG.ENDPOINTS.USER_REGISTRATIONS(userId));
  }

  async updateRegistrationStatus(id, status) {
    return this.patch(API_CONFIG.ENDPOINTS.UPDATE_REGISTRATION_STATUS(id), {
      status,
    });
  }

  async checkInParticipant(id) {
    return this.patch(API_CONFIG.ENDPOINTS.CHECK_IN(id), {});
  }

  async cancelRegistration(id, reason) {
    return this.patch(API_CONFIG.ENDPOINTS.CANCEL_REGISTRATION(id), {
      cancellationReason: reason,
    });
  }

  async updateRegistration(id, registrationData) {
    return this.put(API_CONFIG.ENDPOINTS.UPDATE_REGISTRATION(id), registrationData);
  }

  // ===== ANALYTICS ENDPOINTS =====
  async getEventAnalytics(eventId) {
    return this.get(API_CONFIG.ENDPOINTS.EVENT_ANALYTICS(eventId));
  }

  async getAnalyticsSummary(eventId) {
    return this.get(API_CONFIG.ENDPOINTS.ANALYTICS_SUMMARY(eventId));
  }

  async generateRealTimeAnalytics(eventId) {
    return this.post(API_CONFIG.ENDPOINTS.GENERATE_ANALYTICS(eventId), {});
  }

  async trackEventView(eventId) {
    return this.post(API_CONFIG.ENDPOINTS.TRACK_VIEW(eventId), {});
  }

  // ===== SESSION ENDPOINTS =====
  async createSession(sessionData) {
    return this.post(API_CONFIG.ENDPOINTS.SESSIONS, sessionData);
  }

  async getEventSessions(eventId) {
    return this.get(API_CONFIG.ENDPOINTS.EVENT_SESSIONS(eventId));
  }

  async getSessionById(id) {
    return this.get(API_CONFIG.ENDPOINTS.SESSION_BY_ID(id));
  }

  async updateSession(id, sessionData) {
    return this.put(API_CONFIG.ENDPOINTS.SESSION_BY_ID(id), sessionData);
  }

  async deleteSession(id) {
    return this.delete(API_CONFIG.ENDPOINTS.SESSION_BY_ID(id));
  }

  async addSpeakerToSession(sessionId, speakerId) {
    return this.post(
      API_CONFIG.ENDPOINTS.ADD_SPEAKER(sessionId, speakerId),
      {}
    );
  }

  async removeSpeakerFromSession(sessionId, speakerId) {
    return this.delete(API_CONFIG.ENDPOINTS.REMOVE_SPEAKER(sessionId, speakerId));
  }

  async getSessionsByType(eventId, type) {
    return this.get(API_CONFIG.ENDPOINTS.SESSIONS_BY_TYPE(eventId, type));
  }

  // ===== SPEAKER ENDPOINTS =====
  async createSpeaker(speakerData) {
    return this.post(API_CONFIG.ENDPOINTS.SPEAKERS, speakerData);
  }

  async getAllSpeakers() {
    return this.get(API_CONFIG.ENDPOINTS.SPEAKERS);
  }

  async getSpeakerById(id) {
    return this.get(API_CONFIG.ENDPOINTS.SPEAKER_BY_ID(id));
  }

  async updateSpeaker(id, speakerData) {
    return this.put(API_CONFIG.ENDPOINTS.SPEAKER_BY_ID(id), speakerData);
  }

  async deleteSpeaker(id) {
    return this.delete(API_CONFIG.ENDPOINTS.SPEAKER_BY_ID(id));
  }

  async getSpeakersByExpertise(expertise) {
    return this.get(API_CONFIG.ENDPOINTS.SPEAKERS_BY_EXPERTISE(expertise));
  }

  async getSpeakerUpcomingSessions(speakerId) {
    return this.get(API_CONFIG.ENDPOINTS.SPEAKER_SESSIONS(speakerId));
  }

  // ===== HEALTH CHECK =====
  async healthCheck() {
    return this.get(API_CONFIG.ENDPOINTS.HEALTH, false);
  }
}

// Create and export a single instance
const API = new APIClient();
export { API };
export default API;
