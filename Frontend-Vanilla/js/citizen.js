/**
 * NagarSaathi AI - Citizen Home Logic
 * Fetches real city metrics, recent complaints, and handles quick search.
 */

document.addEventListener('DOMContentLoaded', () => {
  CitizenHome.init();
});

const CitizenHome = {
  async init() {
    this.setupListeners();
    await Promise.all([
      this.loadLiveStats(),
      this.loadRecentComplaints()
    ]);
  },

  setupListeners() {
    const searchForm = document.getElementById('citizen-search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('search-complaint-id');
        const id = input ? input.value.trim() : '';
        if (id) {
          window.location.href = `tracking.html?id=${encodeURIComponent(id)}`;
        }
      });
    }
  },

  async loadLiveStats() {
    const statsContainer = document.getElementById('citizen-stats-grid');
    if (!statsContainer) return;

    try {
      const stats = await API.getPublicStats();
      const resolvedPercent = stats.resolution_rate_percent || 
        (stats.total_complaints > 0 ? Math.round((stats.resolved_complaints / stats.total_complaints) * 100) : 0);

      statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-value">${stats.total_complaints.toLocaleString()}</div>
          <div class="stat-label">Total Grievances Registered</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--success);">${stats.resolved_complaints.toLocaleString()}</div>
          <div class="stat-label">Successfully Resolved</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--warning);">${stats.pending_complaints.toLocaleString()}</div>
          <div class="stat-label">In Progress / Assigned</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--primary-color);">${resolvedPercent}%</div>
          <div class="stat-label">SLA Compliance Rate</div>
        </div>
      `;
    } catch (e) {
      statsContainer.innerHTML = `
        <div class="stat-card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">
          <i data-lucide="info" style="margin-bottom: 4px;"></i>
          <div>Live city statistics currently unavailable from server.</div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
  },

  async loadRecentComplaints() {
    const listContainer = document.getElementById('citizen-complaints-list');
    if (!listContainer) return;

    try {
      listContainer.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Fetching grievances from NMC Registry...</p>
        </div>
      `;

      const response = await API.getComplaints({ limit: 6 });
      const items = response.items || (Array.isArray(response) ? response : []);

      if (items.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">
              <i data-lucide="inbox"></i>
            </div>
            <div class="empty-state-title">No Civic Grievances Registered Yet</div>
            <div class="empty-state-text">Be the first to report a civic issue in your ward.</div>
            <a href="report.html" class="btn btn-primary" style="margin-top: 16px;">
              <i data-lucide="plus-circle"></i> Report Problem
            </a>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      listContainer.innerHTML = items.map(c => {
        const targetId = c.public_id || c.id;
        const formattedDisplayId = Utils.formatComplaintId ? Utils.formatComplaintId(c) : `#${c.public_id || c.id}`;
        const titleText = c.title || (c.description ? String(c.description).substring(0, 60) : 'Civic Grievance');
        const addressText = c.address || c.zone || 'Nagpur';

        return `
          <div class="card card-hover" style="cursor: pointer;" onclick="window.location.href='tracking.html?id=${encodeURIComponent(targetId)}'">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span style="font-family: monospace; font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">
                ${Utils.escapeHtml(formattedDisplayId)}
              </span>
              ${Utils.getStatusBadge(c.status)}
            </div>
            <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 6px; color: #1e293b;">
              ${Utils.escapeHtml(titleText)}
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
              ${Utils.getCategoryBadge(c.category)}
              ${Utils.getPriorityBadge(c.priority)}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 8px;">
              <span style="display: flex; align-items: center; gap: 4px;">
                <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
                ${Utils.escapeHtml(addressText)}
              </span>
              <span>${Utils.formatDate(c.created_at)}</span>
            </div>
          </div>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.error('Error loading complaints:', e);
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color: var(--danger);">
            <i data-lucide="alert-circle"></i>
          </div>
          <div class="empty-state-title">Unable to Connect to Server</div>
          <div class="empty-state-text">Please ensure the NagarSaathi backend is running on 127.0.0.1:8000.</div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
  }
};

window.CitizenHome = CitizenHome;
