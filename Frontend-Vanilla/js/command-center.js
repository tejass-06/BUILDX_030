/**
 * NagarSaathi AI - Municipal Command & Control Center
 * Citywide analytics, Leaflet hotspot intelligence, recurring issue detection, department conflicts, and officer approval queue.
 */

document.addEventListener('DOMContentLoaded', () => {
  CommandCenter.init();
});

const CommandCenter = {
  mapEngine: null,
  hotspotsData: [],
  conflictsData: [],

  async init() {
    if (typeof AuthManager !== 'undefined') {
      const isAuth = AuthManager.requireAuth(['ADMIN', 'COMMAND_CENTER']);
      if (!isAuth) return;
    }

    this.setupListeners();
    this.initMap();
    await Promise.all([
      this.loadCityKPIs(),
      this.loadHotspots(),
      this.loadWorkConflicts(),
      this.loadRecurringIssues(),
      this.loadZoneBreakdown(),
      this.loadPendingOfficers()
    ]);
  },

  setupListeners() {
    const refreshBtn = document.getElementById('btn-cc-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadCityKPIs();
        this.loadHotspots();
        this.loadWorkConflicts();
        this.loadRecurringIssues();
        this.loadZoneBreakdown();
        this.loadPendingOfficers();
        Utils.showToast('Command Center telemetry refreshed', 'info');
      });
    }

    const filterCategory = document.getElementById('cc-filter-category');
    if (filterCategory) {
      filterCategory.addEventListener('change', (e) => {
        const cat = e.target.value;
        const filtered = cat ? this.hotspotsData.filter(h => (h.category || '').toUpperCase() === cat.toUpperCase()) : this.hotspotsData;
        if (this.mapEngine) this.mapEngine.renderHotspots(filtered);
      });
    }
  },

  initMap() {
    this.mapEngine = new MapEngine('cc-hotspot-map', {
      center: [21.1458, 79.0882],
      zoom: 12
    });
  },

  async loadCityKPIs() {
    const kpiContainer = document.getElementById('cc-kpi-grid');
    if (!kpiContainer) return;

    try {
      const stats = await API.getPublicStats();
      const resolutionRate = stats.resolution_rate_percent || 
        (stats.total_complaints > 0 ? Math.round((stats.resolved_complaints / stats.total_complaints) * 100) : 0);

      kpiContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-value" style="color: var(--primary-color);">${stats.total_complaints.toLocaleString()}</div>
          <div class="stat-label">Total Citywide Grievances</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--success);">${stats.resolved_complaints.toLocaleString()}</div>
          <div class="stat-label">Resolved & Closed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--warning);">${stats.pending_complaints.toLocaleString()}</div>
          <div class="stat-label">Active / In Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--danger);">${stats.urgent_complaints || 0}</div>
          <div class="stat-label">High Priority / Urgent</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--primary-color);">${resolutionRate}%</div>
          <div class="stat-label">SLA Compliance Rate</div>
        </div>
      `;
    } catch (e) {
      console.warn('Command center stats failed:', e);
    }
  },

  async loadHotspots() {
    try {
      const response = await API.getHotspots();
      this.hotspotsData = response.hotspots || (Array.isArray(response) ? response : []);
      if (this.mapEngine && this.hotspotsData.length > 0) {
        this.mapEngine.renderHotspots(this.hotspotsData);
      }
    } catch (e) {
      console.warn('Hotspots load error:', e);
    }
  },

  async loadWorkConflicts() {
    const container = document.getElementById('cc-conflicts-container');
    if (!container) return;

    try {
      const response = await API.getWorkConflicts();
      const conflicts = response.conflicts || (Array.isArray(response) ? response : []);
      this.conflictsData = conflicts;

      if (this.mapEngine && conflicts.length > 0) {
        this.mapEngine.renderWorkConflicts(conflicts);
      }

      if (conflicts.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 24px;">
            <div class="empty-state-icon" style="color: var(--success);">
              <i data-lucide="check-circle"></i>
            </div>
            <div class="empty-state-title">No Active Work Conflicts</div>
            <div class="empty-state-text">All department excavation and infrastructure schedules are synchronized across Nagpur wards.</div>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      container.innerHTML = conflicts.map(c => `
        <div class="card" style="border-left: 4px solid var(--danger); margin-bottom: 12px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <span class="badge badge-danger">⚠️ WORK CONFLICT</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">
              RAD: ${c.radius_meters || 150}m
            </span>
          </div>
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
            ${(c.departments || ['Road Dept', 'Water Supply']).join(' ⚡ ')}
          </h4>
          <p style="font-size: 0.85rem; color: #475569; margin-bottom: 8px;">
            ${Utils.escapeHtml(c.reason || 'Overlapping road resurfacing and water pipeline excavation schedules detected.')}
          </p>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
            <span>📍 ${Utils.escapeHtml(c.location || 'Nagpur Zone')}</span>
            <span style="color: var(--danger); font-weight: 600;">Action: Coordinate work schedule</span>
          </div>
        </div>
      `).join('');

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.warn('Conflicts load error:', e);
      container.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 16px;">
          Conflict intelligence feed unavailable.
        </div>
      `;
    }
  },

  async loadRecurringIssues() {
    const container = document.getElementById('cc-recurring-container');
    if (!container) return;

    try {
      const response = await API.getRecurringIssues();
      const recurring = response.recurring_issues || response.hotspots || (Array.isArray(response) ? response : []);

      if (recurring.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 24px;">
            <div class="empty-state-icon" style="color: var(--success);">
              <i data-lucide="shield-check"></i>
            </div>
            <div class="empty-state-title">No Chronic Failures Detected</div>
            <div class="empty-state-text">No recurring infrastructure failure clusters detected in recent 30-day window.</div>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      container.innerHTML = recurring.map(r => `
        <div class="card" style="border-left: 4px solid var(--warning); margin-bottom: 12px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span class="badge badge-warning">Chronic Failure Cluster</span>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--danger);">${r.count || r.complaint_count || 3}+ Reports</span>
          </div>
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
            ${Utils.escapeHtml(r.zone_name || r.location_name || r.location || 'Ashi Nagar, Nagpur')}
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px;">
            <b>Pattern:</b> ${Utils.escapeHtml(r.problem || r.category || 'Recurring Infrastructure Issue')}
          </p>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            <b>Suggested Civic Action:</b> Preventative capital overhaul suggested instead of spot patching.
          </div>
        </div>
      `).join('');

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.warn('Recurring issues error:', e);
      container.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 16px;">
          Recurring issue analytics feed currently offline.
        </div>
      `;
    }
  },

  async loadZoneBreakdown() {
    const tbody = document.getElementById('cc-zone-table-body');
    if (!tbody) return;

    try {
      const response = await API.getZoneBreakdown();
      const zones = response.zones || (Array.isArray(response) ? response : []);

      if (zones.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">
              No zone breakdown data available.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = zones.map(z => `
        <tr>
          <td style="font-weight: 700; color: #1e293b;">${Utils.escapeHtml(z.zone_name || z.name)}</td>
          <td>${(z.total_complaints || 0).toLocaleString()}</td>
          <td style="color: var(--success); font-weight: 600;">${(z.resolved_complaints || 0).toLocaleString()}</td>
          <td style="color: var(--warning); font-weight: 600;">${(z.pending_complaints || 0).toLocaleString()}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${z.sla_compliance || 85}%; height: 100%; background: var(--primary-color);"></div>
              </div>
              <span style="font-size: 0.8rem; font-weight: 600;">${z.sla_compliance || 85}%</span>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.warn('Zone breakdown error:', e);
    }
  },

  // ================= OFFICER APPROVAL WORKFLOW =================
  async loadPendingOfficers() {
    const tbody = document.getElementById('cc-officer-approval-tbody');
    if (!tbody) return;

    try {
      const requests = await API.getPendingOfficerRequests();
      if (!requests || requests.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">
              No pending officer registration requests.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = requests.map(req => `
        <tr>
          <td style="font-weight: 700; color: #1e293b;">${Utils.escapeHtml(req.name)}</td>
          <td>${Utils.escapeHtml(req.email)}</td>
          <td>${Utils.escapeHtml(req.department_name || req.department_code || 'General')}</td>
          <td>${Utils.escapeHtml(req.zone || 'Nagpur')}</td>
          <td>
            <span class="badge badge-warning">Pending Approval</span>
          </td>
          <td>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-sm btn-success" onclick="CommandCenter.approveOfficer(${req.id})" title="Approve and activate officer">
                <i data-lucide="check"></i> Approve
              </button>
              <button class="btn btn-sm btn-danger" onclick="CommandCenter.rejectOfficer(${req.id})" title="Reject request">
                <i data-lucide="x"></i> Reject
              </button>
            </div>
          </td>
        </tr>
      `).join('');

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 16px; color: var(--text-muted); font-size: 0.85rem;">
            Officer request verification feed active. Log in with Administrator credentials to authorize field officers.
          </td>
        </tr>
      `;
    }
  },

  async approveOfficer(userId) {
    try {
      await API.approveOfficerRequest(userId);
      Utils.showToast('Officer registration approved successfully!', 'success');
      this.loadPendingOfficers();
    } catch (err) {
      Utils.showToast('Approval failed: ' + err.message, 'danger');
    }
  },

  async rejectOfficer(userId) {
    try {
      await API.rejectOfficerRequest(userId);
      Utils.showToast('Officer request rejected.', 'info');
      this.loadPendingOfficers();
    } catch (err) {
      Utils.showToast('Rejection failed: ' + err.message, 'danger');
    }
  }
};

window.CommandCenter = CommandCenter;
