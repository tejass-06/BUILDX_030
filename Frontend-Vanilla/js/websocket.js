/**
 * NAGARSAATHI AI — WEBSOCKET CLIENT
 * Real-time event subscription with automatic reconnection
 */

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.channel = "global";
    this.listeners = new Map();
    this.reconnectTimer = null;
    this.isConnected = false;
  }

  connect(channel = "global") {
    this.channel = channel;
    const wsBase = window.NAGARSAATHI_CONFIG ? window.NAGARSAATHI_CONFIG.WS_BASE_URL : "ws://127.0.0.1:8000/ws";
    const endpoint = channel === "global" ? `${wsBase}/global` : `${wsBase}/complaints/${channel}`;

    try {
      this.socket = new WebSocket(endpoint);

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log(`[WebSocket] Connected to ${endpoint}`);
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const eventName = payload.event || payload.type;
          if (eventName && this.listeners.has(eventName)) {
            this.listeners.get(eventName).forEach(cb => cb(payload.data || payload));
          }
          // Also call wildcard listener
          if (this.listeners.has("*")) {
            this.listeners.get("*").forEach(cb => cb(payload));
          }
        } catch {
          // Non-JSON ack
        }
      };

      this.socket.onerror = (err) => {
        console.warn("[WebSocket] Error:", err);
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        console.log("[WebSocket] Disconnected. Retrying in 5s...");
        this.reconnectTimer = setTimeout(() => this.connect(this.channel), 5000);
      };
    } catch (e) {
      console.warn("[WebSocket] Init exception:", e);
    }
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      const filtered = this.listeners.get(eventName).filter(cb => cb !== callback);
      this.listeners.set(eventName, filtered);
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

window.WSClient = new WebSocketClient();
