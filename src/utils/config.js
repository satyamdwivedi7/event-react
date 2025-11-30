// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://event--management.vercel.app/api",
  TIMEOUT: 30000,
  ENDPOINTS: {
    // User endpoints (Admin)
    REGISTER: "/users/register",
    LOGIN: "/users/login",
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",

    // Event endpoints
    EVENTS: "/events",
    EVENT_BY_ID: (id) => `/events/${id}`,
    CREATE_EVENT: "/events",
    UPDATE_EVENT: (id) => `/events/${id}`,
    DELETE_EVENT: (id) => `/events/${id}`,

    // Registration endpoints
    CREATE_REGISTRATION: "/registrations",
    EVENT_REGISTRATIONS: (eventId) => `/registrations/event/${eventId}`,
    USER_REGISTRATIONS: (userId) => `/registrations/user/${userId}`,
    REGISTRATION_BY_ID: (id) => `/registrations/${id}`,
  },
};

export default API_CONFIG;
