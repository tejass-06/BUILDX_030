/**
 * NAGARSAATHI AI — API CLIENT LAYER
 * Centralizes all communication with the FastAPI backend
 */

const API = {
  getBaseUrl() {
    return window.NAGARSAATHI_CONFIG ? window.NAGARSAATHI_CONFIG.API_BASE_URL : "http://127.0.0.1:8000/api/v1";
  },

  getHeaders(isMultipart = false) {
    const headers = {};
    const token = Utils.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    try {
      const response = await fetch(url, options);
      if (response.status === 204) return null;
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMsg = data.detail || `Server error (${response.status})`;
        throw new Error(errorMsg);
      }
      return data;
    } catch (err) {
      console.warn(`[API] Error on ${endpoint}:`, err.message);
      throw err;
    }
  },

  // =========================================================================
  // HEALTH
  // =========================================================================
  async checkHealth() {
    const rootUrl = this.getBaseUrl().replace("/api/v1", "");
    try {
      const res = await fetch(`${rootUrl}/health`);
      return await res.json();
    } catch (e) {
      return { status: "offline", error: e.message };
    }
  },

  // =========================================================================
  // AUTH
  // =========================================================================
  async login(email, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (data.access_token) {
      Utils.setAuthToken(data.access_token, data.user);
    }
    return data;
  },

  async register(payload) {
    const data = await this.request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (data.access_token) {
      Utils.setAuthToken(data.access_token, data.user);
    }
    return data;
  },

  async getMe() {
    return this.request("/auth/me", {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  // =========================================================================
  // COMPLAINTS
  // =========================================================================
  async createComplaint(formData) {
    return this.request("/complaints", {
      method: "POST",
      headers: this.getHeaders(true),
      body: formData
    });
  },

  async listComplaints(params = {}) {
    const query = new URLSearchParams();
    if (params.status_filter) query.append("status_filter", params.status_filter);
    if (params.category) query.append("category", params.category);
    if (params.department_code) query.append("department_code", params.department_code);
    if (params.limit) query.append("limit", params.limit);
    if (params.offset) query.append("offset", params.offset);

    const qStr = query.toString() ? `?${query.toString()}` : "";
    return this.request(`/complaints${qStr}`, {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async getMyComplaints() {
    return this.request("/complaints/my", {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async getComplaintDetail(id) {
    return this.request(`/complaints/${id}`, {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async joinComplaint(id, formData) {
    return this.request(`/complaints/${id}/join`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: formData
    });
  },

  async verifyComplaint(id, payload) {
    return this.request(`/complaints/${id}/verify`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async reopenComplaint(id, payload) {
    return this.request(`/complaints/${id}/reopen`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async getAuditLogs(id) {
    return this.request(`/complaints/${id}/audit-logs`, {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async getWhatsAppLink(id, phone = null, note = null) {
    const query = new URLSearchParams();
    if (phone) query.append("phone", phone);
    if (note) query.append("note", note);
    const qStr = query.toString() ? `?${query.toString()}` : "";
    return this.request(`/complaints/${id}/whatsapp-link${qStr}`, {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  // =========================================================================
  // MESSAGES
  // =========================================================================
  async getMessages(id) {
    return this.request(`/complaints/${id}/messages`, {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async sendMessage(id, message) {
    return this.request(`/complaints/${id}/messages`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ message })
    });
  },

  // =========================================================================
  // OFFICER
  // =========================================================================
  async getOfficerComplaints(statusFilter = null) {
    const q = statusFilter ? `?status_filter=${statusFilter}` : "";
    return this.request(`/officer/complaints${q}`, {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async updateOfficerStatus(id, status, note = null) {
    return this.request(`/officer/complaints/${id}/status`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ status, note })
    });
  },

  async resolveComplaint(id, formData) {
    return this.request(`/officer/complaints/${id}/resolve`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: formData
    });
  },

  // =========================================================================
  // AI ENGINE
  // =========================================================================
  async analyzeText(title, description) {
    return this.request("/ai/analyze", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ title, description })
    });
  },

  async checkDuplicates(payload) {
    return this.request("/ai/duplicate-check", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // =========================================================================
  // ANALYTICS & WORKS
  // =========================================================================
  async getOverview() {
    return this.request("/analytics/overview", {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async getHotspots() {
    return this.request("/analytics/hotspots", {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async getZones() {
    return this.request("/analytics/zones", {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async getDepartments() {
    return this.request("/analytics/departments", {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async getWorkConflicts() {
    return this.request("/works/conflicts", {
      method: "GET",
      headers: this.getHeaders()
    });
  }
};

window.API = API;
