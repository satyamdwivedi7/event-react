// Script to generate config.js from .env file
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get BASE_URI from environment variable (works with Vercel)
// Priority: 1. process.env.BASE_URI (Vercel env), 2. .env file, 3. fallback
let baseUri = process.env.BASE_URI || 'https://event--management.vercel.app/api';

// If not found in process.env, try reading from .env file directly
if (!process.env.BASE_URI) {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/BASE_URI=(.+)/);
    if (match) {
      baseUri = match[1].trim();
    }
  }
}

// Generate config.js content
const configContent = `// API Configuration
// This file is auto-generated from .env - DO NOT EDIT MANUALLY
const API_CONFIG = {
  BASE_URL: "${baseUri}",
  TIMEOUT: 30000,
  ENDPOINTS: {
    // User endpoints
    REGISTER: "/users/register",
    LOGIN: "/users/login",
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    ALL_USERS: "/users",
    USER_BY_ID: (id) => \`/users/\${id}\`,

    // Event endpoints
    EVENTS: "/events",
    EVENT_BY_ID: (id) => \`/events/\${id}\`,
    PUBLISH_EVENT: (id) => \`/events/\${id}/publish\`,

    // Registration endpoints
    REGISTRATIONS: "/registrations",
    REGISTRATION_BY_ID: (id) => \`/registrations/\${id}\`,
    EVENT_REGISTRATIONS: (eventId) => \`/registrations/event/\${eventId}\`,
    USER_REGISTRATIONS: (userId) => \`/registrations/user/\${userId}\`,
    UPDATE_REGISTRATION: (id) => \`/registrations/\${id}\`,
    UPDATE_REGISTRATION_STATUS: (id) => \`/registrations/\${id}/status\`,
    CHECK_IN: (id) => \`/registrations/\${id}/checkin\`,
    CANCEL_REGISTRATION: (id) => \`/registrations/\${id}/cancel\`,

    // Analytics endpoints
    EVENT_ANALYTICS: (eventId) => \`/analytics/event/\${eventId}\`,
    ANALYTICS_SUMMARY: (eventId) => \`/analytics/event/\${eventId}/summary\`,
    GENERATE_ANALYTICS: (eventId) => \`/analytics/event/\${eventId}/generate\`,
    TRACK_VIEW: (eventId) => \`/analytics/event/\${eventId}/track-view\`,

    // Session endpoints
    SESSIONS: "/sessions",
    EVENT_SESSIONS: (eventId) => \`/sessions/event/\${eventId}\`,
    SESSION_BY_ID: (id) => \`/sessions/\${id}\`,
    ADD_SPEAKER: (sessionId, speakerId) =>
      \`/sessions/\${sessionId}/speakers/\${speakerId}\`,
    REMOVE_SPEAKER: (sessionId, speakerId) =>
      \`/sessions/\${sessionId}/speakers/\${speakerId}\`,
    SESSIONS_BY_TYPE: (eventId, type) =>
      \`/sessions/event/\${eventId}/type/\${type}\`,

    // Speaker endpoints
    SPEAKERS: "/speakers",
    SPEAKER_BY_ID: (id) => \`/speakers/\${id}\`,
    SPEAKERS_BY_EXPERTISE: (expertise) => \`/speakers/expertise/\${expertise}\`,
    SPEAKER_SESSIONS: (speakerId) => \`/speakers/\${speakerId}/sessions/upcoming\`,

    // Health check
    HEALTH: "/health",
  },
};

export default API_CONFIG;
`;

// Write to config.js
const configPath = path.join(__dirname, 'public', 'js', 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✅ config.js generated successfully from .env');
console.log(`   BASE_URL: ${baseUri}`);
