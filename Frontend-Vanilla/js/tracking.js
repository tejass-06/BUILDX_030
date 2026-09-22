/**
 * NagarSaathi AI - Complaint Tracking & Realtime Updates
 * Tracks grievance timeline, SLA countdown, assigned department/officer, and real-time WebSocket events.
 */

document.addEventListener('DOMContentLoaded', () => {
  TrackingController.init();
});

const TrackingController = {
  complaintId: null,
  complaintData: null,
  wsClient: null,
  refreshInterval: null,

  init() {
    const params = new URLSearchParams(window.location.search);
    this.complaintId = params.get('id');

    this.setupListeners();

    if (this.complaintId) {
      const searchInput = document.getElementById('tracking-search-input');
      if (searchInput) searchInput.value = this.complaintId;
      this.loadComplaint(this.complaintId);
      this.setupRealtime(this.complaintId);
    } else {
      this.showSearchPrompt();
    }
  },

  setupListeners() {
    const form = document.getElementById('tracking-search-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('tracking-search-input');
        const id = input ? input.value.trim() : '';
        if (id) {
          window.location.href = `tracking.html?id=${encodeURIComponent(id)}`;
        }
      });
    }

    const refreshBtn = document.getElementById('btn-manual-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (this.complaintId) {
          this.loadComplaint(this.complaintId);
          Utils.showToast('Grievance status refreshed', 'info');
        }
      });
    }
  },

  showSearchPrompt() {
    const mainCard = document.getElementById('tracking-main-content');
    if (mainCard) {
      mainCard.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i data-lucide="search"></i>
          </div>
          <div class="empty-state-title">Track Civic Grievance Status</div>
          <div class="empty-state-text">Enter your Ticket / Complaint ID above to view live progress, officer assignment, and SLA timeline.</div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
  },

  async loadComplaint(id) {
    const container = document.getElementById('tracking-main-content');
    if (!container) return;

    try {
      const data = await API.getComplaintById(id);
      this.complaintData = data;
      this.renderTrackingDetails(data);
    } catch (err) {
      console.error('Failed to load complaint:', err);
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color: var(--danger);">
            <i data-lucide="alert-triangle"></i>
          </div>
          <div class="empty-state-title">Complaint Not Found</div>
          <div class="empty-state-text">Unable to find grievance with ID: <code>${Utils.escapeHtml(id)}</code>. Please check the ID and try again.</div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
  },

  renderTrackingDetails(data) {
    const container = document.getElementById('tracking-main-content');
    if (!container) return;

    const timelineSteps = [
      { key: 'SUBMITTED', label: 'Registered', date: data.created_at },
      { key: 'AI_CLASSIFIED', label: 'AI Classified', date: data.ai_processed_at || data.created_at },
      { key: 'ASSIGNED', label: 'Assigned to Dept', date: data.assigned_at },
      { key: 'IN_PROGRESS', label: 'Work in Progress', date: data.started_at },
      { key: 'RESOLVED', label: 'Officer Resolved', date: data.resolved_at },
      { key: 'VERIFIED', label: 'Citizen Verified', date: data.verified_at },
      { key: 'CLOSED', label: 'Case Closed', date: data.closed_at }
    ];

    const currentStatusIndex = this.getStatusIndex(data.status);
    const whatsappUrl = Utils.generateWhatsAppUrl(data);

    container.innerHTML = `
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">GRIEVANCE TICKET</div>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: #1e293b; margin: 2px 0;">
              ${Utils.escapeHtml(data.title || data.description.substring(0, 60))}
            </h2>
            <div style="font-family: monospace; font-size: 0.85rem; color: var(--text-muted);">
              ID: #${data.id} • Registered ${Utils.formatDate(data.created_at)}
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            ${Utils.getStatusBadge(data.status)}
            ${Utils.getSlaBadge(data.sla_deadline, data.status)}
          </div>
        </div>

        <!-- Lifecycle Timeline -->
        <div style="margin: 24px 0;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 16px;">
            Redressal Timeline
          </h4>
          <div class="timeline">
            ${timelineSteps.map((step, idx) => {
              const isCompleted = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              return `
                <div class="timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}">
                  <div class="timeline-point">
                    ${isCompleted ? '✓' : idx + 1}
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-title">${step.label}</div>
                    <div class="timeline-time">${step.date ? Utils.formatDate(step.date) : (isCurrent ? 'Current Stage' : 'Pending')}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Details Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; background: #f8fafc; padding: 16px; border-radius: var(--border-radius-sm); margin-bottom: 20px;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Category</div>
            <div style="margin-top: 4px;">${Utils.getCategoryBadge(data.category)}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Priority</div>
            <div style="margin-top: 4px;">${Utils.getPriorityBadge(data.priority)}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Department</div>
            <div style="font-weight: 600; color: #1e293b; margin-top: 4px;">${Utils.escapeHtml(data.department || 'NMC Public Works')}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Location / Ward</div>
            <div style="font-weight: 600; color: #1e293b; margin-top: 4px;">📍 ${Utils.escapeHtml(data.address || data.zone || 'Nagpur')}</div>
          </div>
        </div>

        <!-- Description -->
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Description</h4>
          <p style="font-size: 0.95rem; color: #334155; line-height: 1.6; background: white; border: 1px solid #e2e8f0; padding: 12px; border-radius: var(--border-radius-sm);">
            ${Utils.escapeHtml(data.description)}
          </p>
        </div>

        <!-- Resolution Call-to-action if RESOLVED -->
        ${data.status === 'RESOLVED' ? `
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--border-radius-sm); padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #065f46; font-weight: 700; font-size: 1rem; margin-bottom: 6px;">
              <i data-lucide="check-circle"></i> Officer Has Resolved This Issue
            </div>
            <p style="font-size: 0.85rem; color: #047857; margin-bottom: 12px;">
              Please review the resolution details and verify whether the issue has been satisfactorily fixed.
            </p>
            <a href="resolution.html?id=${encodeURIComponent(data.id)}" class="btn btn-success">
              <i data-lucide="shield-check"></i> Verify Resolution / Give Feedback
            </a>
          </div>
        ` : ''}

        <!-- Actions footer -->
        <div style="display: flex; gap: 12px; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px; flex-wrap: wrap;">
          <a href="${whatsappUrl}" target="_blank" class="btn btn-secondary" style="color: #059669; border-color: #a7f3d0;">
            <i data-lucide="message-circle"></i> Share on WhatsApp (Free Deep-Link)
          </a>
          <button class="btn btn-secondary" onclick="TrackingController.loadComplaint('${data.id}')">
            <i data-lucide="refresh-cw"></i> Refresh Status
          </button>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  getStatusIndex(status) {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING' || s === 'SUBMITTED') return 0;
    if (s === 'AI_CLASSIFIED') return 1;
    if (s === 'ASSIGNED') return 2;
    if (s === 'IN_PROGRESS') return 3;
    if (s === 'RESOLVED') return 4;
    if (s === 'VERIFIED') return 5;
    if (s === 'CLOSED') return 6;
    return 1;
  },

  setupRealtime(id) {
    if (this.wsClient) this.wsClient.disconnect();

    this.wsClient = new RealtimeWS({
      complaintId: id,
      onMessage: (msg) => {
        if (msg.event === 'status_change' || msg.event === 'complaint_updated') {
          Utils.showToast(`Live update: Status changed to ${msg.data.status}`, 'info');
          this.loadComplaint(id);
        }
      }
    });
    this.wsClient.connect();

    // Fallback periodic refresh every 15s
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => {
      this.loadComplaint(id);
    }, 15000);
  }
};

window.TrackingController = TrackingController;
