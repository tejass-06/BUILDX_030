/**
 * NagarSaathi AI - Complaint Tracking & Realtime Updates
 * Official Citizen Tracking Experience:
 * Submitted -> Received by Department -> Officer Assigned -> Officer Acknowledged -> Work Started -> In Progress -> Resolved -> Citizen Verification -> Closed
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

    // Official Operational Status Flow
    const timelineSteps = [
      { key: 'SUBMITTED', label: 'Complaint Submitted', date: data.created_at },
      { key: 'RECEIVED', label: 'Received by Department', date: data.created_at },
      { key: 'ASSIGNED', label: 'Officer Assigned', date: data.assigned_at || (data.status !== 'SUBMITTED' ? data.created_at : null) },
      { key: 'ACKNOWLEDGED', label: 'Officer Acknowledged', date: data.acknowledged_at },
      { key: 'WORK_STARTED', label: 'Work Started', date: data.started_at },
      { key: 'IN_PROGRESS', label: 'Work In Progress', date: data.in_progress_at || data.started_at },
      { key: 'RESOLVED', label: 'Resolved (Awaiting Confirmation)', date: data.resolved_at },
      { key: 'VERIFIED', label: 'Citizen Verification', date: data.verified_at },
      { key: 'CLOSED', label: 'Closed', date: data.closed_at }
    ];

    const currentStatusIndex = this.getStatusIndex(data.status);
    const whatsappUrl = Utils.generateWhatsAppUrl(data);
    const displayId = Utils.formatComplaintId ? Utils.formatComplaintId(data) : (data.public_id || (data.id ? `NS-${data.id}` : id));
    const deptName = data.department ? (typeof data.department === 'object' ? data.department.name : data.department) : (data.department_code || 'NMC Public Works');

    container.innerHTML = `
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">GRIEVANCE TICKET</div>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: #1e293b; margin: 2px 0;">
              ${Utils.escapeHtml(data.title || (data.description ? String(data.description).substring(0, 60) : 'Civic Grievance'))}
            </h2>
            <div style="font-family: monospace; font-size: 0.9rem; font-weight: 700; color: var(--primary-color);">
              Complaint ID: ${Utils.escapeHtml(displayId)}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              Registered on ${Utils.formatDate(data.created_at)}
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            ${Utils.getStatusBadge(data.status)}
            ${Utils.getSlaBadge(data.sla_deadline, data.status)}
          </div>
        </div>

        <!-- Official Redressal Timeline -->
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
                    <div class="timeline-time">${step.date ? Utils.formatDate(step.date) : (isCurrent ? 'Active Stage' : 'Pending')}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Details Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; background: #f8fafc; padding: 16px; border-radius: var(--border-radius-sm); margin-bottom: 20px;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Category</div>
            <div style="margin-top: 4px;">${Utils.getCategoryBadge(data.category)}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Priority</div>
            <div style="margin-top: 4px;">${Utils.getPriorityBadge(data.priority)}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Assigned Department</div>
            <div style="font-weight: 700; color: #1e293b; margin-top: 4px;">${Utils.escapeHtml(deptName)}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Location / Ward</div>
            <div style="font-weight: 600; color: #1e293b; margin-top: 4px;">📍 ${Utils.escapeHtml(data.address || data.zone || 'Nagpur')}</div>
          </div>
        </div>

        <!-- Problem Description & Attached Photo -->
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Problem Description</h4>
          <p style="font-size: 0.95rem; color: #334155; line-height: 1.6; background: white; border: 1px solid #e2e8f0; padding: 12px; border-radius: var(--border-radius-sm); margin: 0 0 12px 0;">
            ${Utils.escapeHtml(data.description)}
          </p>

          ${data.photo_url ? `
            <div style="margin-top: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Reported Photo</div>
              <img src="${data.photo_url}" alt="Problem Photo" style="max-width: 240px; max-height: 180px; border-radius: 6px; border: 1px solid #e2e8f0; object-fit: cover;">
            </div>
          ` : ''}
        </div>

        <!-- Resolution Call-to-action & Verification Card if RESOLVED -->
        ${data.status === 'RESOLVED' ? `
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--border-radius-sm); padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #065f46; font-weight: 700; font-size: 1.1rem; margin-bottom: 6px;">
              <i data-lucide="check-circle"></i> Complaint Resolved — Awaiting Your Confirmation
            </div>
            <p style="font-size: 0.9rem; color: #047857; margin-bottom: 16px;">
              The field officer has submitted resolution proof. Please review the repair and verify if your problem was fixed.
            </p>

            ${data.resolution_photo_url ? `
              <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
                ${data.photo_url ? `
                  <div>
                    <div style="font-size: 0.75rem; font-weight: 700; color: #dc2626; margin-bottom: 4px;">BEFORE REPAIR</div>
                    <img src="${data.photo_url}" alt="Before" style="width: 180px; height: 130px; object-fit: cover; border-radius: 6px; border: 1px solid #fca5a5;">
                  </div>
                ` : ''}
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: #059669; margin-bottom: 4px;">AFTER REPAIR (OFFICER PROOF)</div>
                  <img src="${data.resolution_photo_url}" alt="After" style="width: 180px; height: 130px; object-fit: cover; border-radius: 6px; border: 1px solid #86efac;">
                </div>
              </div>
            ` : ''}

            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <a href="resolution.html?id=${encodeURIComponent(data.public_id || data.id)}" class="btn btn-success" style="font-weight: 700;">
                <i data-lucide="shield-check"></i> Verify Resolution (Yes / No)
              </a>
            </div>
          </div>
        ` : ''}

        ${data.status === 'CLOSED' ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--border-radius-sm); padding: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
            <div style="background: #22c55e; color: white; border-radius: 50%; width: 32px; height: 32px; display: grid; place-items: center; flex-shrink: 0;">
              <i data-lucide="check" style="width: 20px; height: 20px;"></i>
            </div>
            <div>
              <div style="font-weight: 700; color: #15803d; font-size: 0.95rem;">Case Successfully Closed</div>
              <div style="font-size: 0.85rem; color: #166534;">Thank you for helping keep Nagpur clean, safe, and livable.</div>
            </div>
          </div>
        ` : ''}

        <!-- Actions footer -->
        <div style="display: flex; gap: 12px; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px; flex-wrap: wrap;">
          <a href="${whatsappUrl}" target="_blank" class="btn btn-secondary" style="color: #059669; border-color: #a7f3d0;">
            <i data-lucide="message-circle"></i> Share on WhatsApp (Free Deep-Link)
          </a>
          <button class="btn btn-secondary" onclick="TrackingController.loadComplaint('${data.public_id || data.id}')">
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
    if (s === 'RECEIVED') return 1;
    if (s === 'ASSIGNED') return 2;
    if (s === 'ACKNOWLEDGED') return 3;
    if (s === 'WORK_STARTED') return 4;
    if (s === 'IN_PROGRESS') return 5;
    if (s === 'RESOLVED') return 6;
    if (s === 'VERIFIED') return 7;
    if (s === 'CLOSED') return 8;
    if (s === 'REOPENED') return 4;
    return 2;
  },

  setupRealtime(id) {
    if (this.wsClient) this.wsClient.disconnect();

    if (typeof RealtimeWS !== 'undefined') {
      this.wsClient = new RealtimeWS({
        complaintId: id,
        onMessage: (msg) => {
          if (msg.event === 'status_change' || msg.event === 'complaint_updated') {
            Utils.showToast(`Live update: Status changed to ${msg.data?.status || 'UPDATED'}`, 'info');
            this.loadComplaint(id);
          }
        }
      });
      this.wsClient.connect();
    }

    // Fallback periodic refresh every 15s
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => {
      this.loadComplaint(id);
    }, 15000);
  }
};

window.TrackingController = TrackingController;
