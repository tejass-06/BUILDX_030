/**
 * NagarSaathi AI - Officer Dashboard Controller
 * Displays assigned complaints, department workload, SLA performance, and status management.
 */

document.addEventListener('DOMContentLoaded', () => {
  OfficerDashboard.init();
});

const OfficerDashboard = {
  complaints: [],
  filters: {
    status: '',
    priority: '',
    zone: '',
    search: ''
  },

  async init() {
    if (typeof AuthManager !== 'undefined') {
      const isAuth = AuthManager.requireAuth(['OFFICER', 'ADMIN', 'COMMAND_CENTER']);
      if (!isAuth) return;
    }

    this.setupListeners();
    await Promise.all([
      this.loadDashboardKPIs(),
      this.loadComplaints()
    ]);
  },

  setupListeners() {
    const statusFilter = document.getElementById('officer-filter-status');
    const priorityFilter = document.getElementById('officer-filter-priority');
    const zoneFilter = document.getElementById('officer-filter-zone');
    const searchInput = document.getElementById('officer-search-input');

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.applyFilters();
      });
    }

    if (priorityFilter) {
      priorityFilter.addEventListener('change', (e) => {
        this.filters.priority = e.target.value;
        this.applyFilters();
      });
    }

    if (zoneFilter) {
      zoneFilter.addEventListener('change', (e) => {
        this.filters.zone = e.target.value;
        this.applyFilters();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value.toLowerCase().trim();
        this.applyFilters();
      });
    }

    const refreshBtn = document.getElementById('btn-officer-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadComplaints();
        this.loadDashboardKPIs();
        Utils.showToast('Officer dashboard refreshed', 'info');
      });
    }
  },

  async loadDashboardKPIs() {
    const kpiContainer = document.getElementById('officer-kpi-grid');
    if (!kpiContainer) return;

    try {
      const stats = await API.getPublicStats();

      kpiContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-value" style="color: var(--primary-color);">${stats.pending_complaints || 0}</div>
          <div class="stat-label">Active Assigned Issues</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--danger);">${stats.urgent_complaints || 0}</div>
          <div class="stat-label">Urgent / High Priority</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--warning);">${stats.sla_delayed_count || 0}</div>
          <div class="stat-label">SLA Overdue Warning</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--success);">${stats.resolved_complaints || 0}</div>
          <div class="stat-label">Resolved (This Month)</div>
        </div>
      `;
    } catch (e) {
      console.warn('KPI load error:', e);
    }
  },

  async loadComplaints() {
    const tbody = document.getElementById('officer-table-body');
    const emptyState = document.getElementById('officer-empty-state');
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 32px;">
          <div class="spinner" style="margin: 0 auto 12px auto;"></div>
          <div style="color: var(--text-muted);">Loading department complaints from NMC registry...</div>
        </td>
      </tr>
    `;

    try {
      const response = await API.getComplaints({ limit: 50 });
      this.complaints = response.items || (Array.isArray(response) ? response : []);
      this.applyFilters();
    } catch (err) {
      console.error('Failed to load officer complaints:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 24px; color: var(--danger);">
            <i data-lucide="alert-circle" style="margin-bottom: 6px;"></i>
            <div>Unable to fetch complaints from backend.</div>
          </td>
        </tr>
      `;
      if (window.lucide) lucide.createIcons();
    }
  },

  applyFilters() {
    const tbody = document.getElementById('officer-table-body');
    const emptyState = document.getElementById('officer-empty-state');
    if (!tbody) return;

    let filtered = [...this.complaints];

    if (this.filters.status) {
      filtered = filtered.filter(c => String(c.status || '').toUpperCase() === this.filters.status.toUpperCase());
    }

    if (this.filters.priority) {
      filtered = filtered.filter(c => String(c.priority || '').toUpperCase() === this.filters.priority.toUpperCase());
    }

    if (this.filters.zone) {
      filtered = filtered.filter(c => String(c.zone || c.address || '').toLowerCase().includes(this.filters.zone.toLowerCase()));
    }

    if (this.filters.search) {
      filtered = filtered.filter(c =>
        String(c.public_id || c.id || '').toLowerCase().includes(this.filters.search) ||
        String(c.title || '').toLowerCase().includes(this.filters.search) ||
        String(c.description || '').toLowerCase().includes(this.filters.search) ||
        String(c.address || '').toLowerCase().includes(this.filters.search)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
            No grievances match the selected filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(c => {
      const targetId = c.public_id || c.id;
      const formattedDisplayId = Utils.formatComplaintId ? Utils.formatComplaintId(c) : `#${c.public_id || c.id}`;
      const titleText = c.title || (c.description ? String(c.description).substring(0, 60) : 'Civic Grievance');
      const addressText = c.address || c.zone || 'Nagpur';

      return `
        <tr style="cursor: pointer;" onclick="window.location.href='officer-complaint.html?id=${encodeURIComponent(targetId)}'">
          <td style="font-family: monospace; font-weight: 700; color: var(--primary-color);">
            ${Utils.escapeHtml(formattedDisplayId)}
          </td>
          <td>
            <div style="font-weight: 600; color: #1e293b; max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${Utils.escapeHtml(titleText)}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              ${Utils.escapeHtml(addressText)}
            </div>
          </td>
          <td>${Utils.getCategoryBadge(c.category)}</td>
          <td>${Utils.getPriorityBadge(c.priority)}</td>
          <td>${Utils.getStatusBadge(c.status)}</td>
          <td>${Utils.getSlaBadge(c.sla_deadline, c.status)}</td>
          <td onclick="event.stopPropagation();">
            <div style="display: flex; gap: 6px;">
              <a href="officer-complaint.html?id=${encodeURIComponent(targetId)}" class="btn btn-sm btn-secondary" title="Open Workspace">
                <i data-lucide="external-link"></i>
              </a>
              ${c.status !== 'RESOLVED' && c.status !== 'CLOSED' ? `
                <a href="resolution.html?id=${encodeURIComponent(targetId)}&role=officer" class="btn btn-sm btn-success" title="Mark Resolved">
                  <i data-lucide="check"></i>
                </a>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  }
};

window.OfficerDashboard = OfficerDashboard;
