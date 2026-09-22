/**
 * NAGARSAATHI AI — CENTRALIZED API CLIENT LAYER
 * Connects all vanilla pages to the production FastAPI + Supabase backend.
 */

const API = {
  getBaseUrl() {
    return window.NAGARSAATHI_CONFIG ? window.NAGARSAATHI_CONFIG.API_BASE_URL : "http://127.0.0.1:8000/api/v1";
  },

  getHeaders(isMultipart = false) {
    const headers = {};
    const token = (typeof AuthManager !== 'undefined' && AuthManager.getToken()) || (typeof Utils !== 'undefined' && Utils.getAuthToken());
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
  // HEALTH & SYSTEM
  // =========================================================================
  async getHealth() {
    const rootUrl = this.getBaseUrl().replace("/api/v1", "");
    try {
      const res = await fetch(`${rootUrl}/health`);
      return await res.json();
    } catch (e) {
      return { status: "offline", error: e.message };
    }
  },
  async checkHealth() {
    return this.getHealth();
  },

  // =========================================================================
  // AUTHENTICATION & OFFICER RBAC
  // =========================================================================
  async login(email, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (data.access_token && typeof AuthManager !== 'undefined') {
      AuthManager.setSession(data.access_token, data.user);
    }
    return data;
  },

  async register(payload) {
    return this.request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  },

  async getMe() {
    return this.request("/auth/me", {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async getPendingOfficerRequests() {
    return this.request("/auth/officer-requests", {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async approveOfficerRequest(userId) {
    return this.request(`/auth/officer-requests/${userId}/approve`, {
      method: "POST",
      headers: this.getHeaders()
    });
  },

  async rejectOfficerRequest(userId) {
    return this.request(`/auth/officer-requests/${userId}/reject`, {
      method: "POST",
      headers: this.getHeaders()
    });
  },

  async deactivateOfficer(userId) {
    return this.request(`/auth/officers/${userId}/deactivate`, {
      method: "POST",
      headers: this.getHeaders()
    });
  },

  // =========================================================================
  // COMPLAINTS & GRIEVANCE REDRESSAL
  // =========================================================================
  async createComplaint(payload) {
    // If FormData passed
    if (payload instanceof FormData) {
      return this.request("/complaints", {
        method: "POST",
        headers: this.getHeaders(true),
        body: payload
      });
    }

    // If JSON object passed
    const formData = new FormData();
    formData.append("title", payload.title || "Civic Grievance");
    formData.append("description", payload.description);
    if (payload.category) formData.append("category", payload.category);
    if (payload.priority) formData.append("priority", payload.priority);
    if (payload.latitude) formData.append("latitude", payload.latitude);
    if (payload.longitude) formData.append("longitude", payload.longitude);
    if (payload.address) formData.append("address", payload.address);
    if (payload.citizen_name) formData.append("citizen_name", payload.citizen_name);
    if (payload.citizen_phone) formData.append("citizen_phone", payload.citizen_phone);
    if (payload.photo) formData.append("photo", payload.photo);

    return this.request("/complaints", {
      method: "POST",
      headers: this.getHeaders(true),
      body: formData
    });
  },

  async getComplaints(params = {}) {
    const query = new URLSearchParams();
    if (params.status_filter || params.status) query.append("status_filter", params.status_filter || params.status);
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
  async listComplaints(params = {}) {
    return this.getComplaints(params);
  },

  async getComplaintById(id) {
    return this.request(`/complaints/${id}`, {
      method: "GET",
      headers: this.getHeaders()
    });
  },
  async getComplaintDetail(id) {
    return this.getComplaintById(id);
  },

  async getMyComplaints() {
    return this.request("/complaints/my", {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async upvoteComplaint(id) {
    const formData = new FormData();
    formData.append("description", "Community citizen confirmation / upvote.");
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
  // OFFICER DESK
  // =========================================================================
  async getOfficerComplaints(statusFilter = null) {
    const q = statusFilter ? `?status_filter=${statusFilter}` : "";
    return this.request(`/officer/complaints${q}`, {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async updateComplaintStatus(id, status, note = null) {
    return this.request(`/officer/complaints/${id}/status`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ status, note })
    });
  },
  async updateOfficerStatus(id, status, note = null) {
    return this.updateComplaintStatus(id, status, note);
  },

  async resolveComplaint(id, payload) {
    let formData = payload;
    if (!(payload instanceof FormData)) {
      formData = new FormData();
      formData.append("resolution_note", payload.resolution_notes || payload.resolution_note || payload.action_taken || "Issue resolved.");
      if (payload.latitude) formData.append("latitude", payload.latitude);
      if (payload.longitude) formData.append("longitude", payload.longitude);
      if (payload.after_photo) formData.append("after_photo", payload.after_photo);
    }
    return this.request(`/officer/complaints/${id}/resolve`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: formData
    });
  },

  // =========================================================================
  // AI INTENT & DUPLICATES
  // =========================================================================
  async analyzeCivicIntent(payload) {
    const text = payload.text || payload.description || "";
    const title = payload.title || text.substring(0, 50);
    return this.request("/ai/analyze", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ title, description: text })
    });
  },
  async analyzeText(title, description) {
    return this.analyzeCivicIntent({ title, description });
  },

  async checkDuplicates(payload) {
    return this.request("/ai/duplicate-check", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        title: payload.title || payload.text?.substring(0, 50) || "Civic Issue",
        description: payload.text || payload.description || "",
        category: payload.category || null,
        latitude: payload.latitude || null,
        longitude: payload.longitude || null,
        radius_meters: payload.radius_meters || 300
      })
    });
  },

  // =========================================================================
  // COMMAND CENTER & TELEMETRY
  // =========================================================================
  async getPublicStats() {
    return this.request("/analytics/overview", {
      method: "GET",
      headers: this.getHeaders()
    });
  },
  async getOverview() {
    return this.getPublicStats();
  },

  async getHotspots() {
    return this.request("/analytics/hotspots", {
      method: "GET",
      headers: this.getHeaders()
    });
  },

  async getZoneBreakdown() {
    return this.request("/analytics/zones", {
      method: "GET",
      headers: this.getHeaders()
    });
  },
  async getZones() {
    return this.getZoneBreakdown();
  },

  async getRecurringIssues() {
    // Return chronic hotspot clusters
    return this.request("/analytics/hotspots", {
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
