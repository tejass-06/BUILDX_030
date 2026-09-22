/**
 * NAGARSAATHI AI — CONFIGURATION
 * Centralized environment and API configuration
 */
window.NAGARSAATHI_CONFIG = {
  // FastAPI Backend Endpoint (matches standard default port)
  API_BASE_URL: "http://127.0.0.1:8000/api/v1",
  
  // Real-time WebSocket Endpoint
  WS_BASE_URL: "ws://127.0.0.1:8000/ws",
  
  // Storage fallback & media URL root
  MEDIA_BASE_URL: "http://127.0.0.1:8000",
  
  // Development Preview Mode (Strictly FALSE in production mode)
  DEV_PREVIEW_MODE: false,
  
  // Default Municipal Center Coordinates (Nagpur, Maharashtra, India)
  NAGPUR_COORDS: {
    lat: 21.1458,
    lng: 79.0882,
    zoom: 12
  },

  // Supported Speech Recognition Locales
  SUPPORTED_LANGUAGES: [
    { code: "mr-IN", label: "मराठी (Marathi)" },
    { code: "hi-IN", label: "हिंदी (Hindi)" },
    { code: "en-IN", label: "English" }
  ]
};
