/**
 * NagarSaathi AI - Complaint Tracking & Realtime Updates
 * Official Citizen Tracking Experience with Realtime Timeline,
 * Live Photo Comparison, Inline Verification, and WebSocket/Polling synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
  TrackingController.init();
});

const TrackingController = {
  complaintId: null,
  complaintData: null,
  wsClient: null,
  refreshInterval: null,
  selectedRating: 5,

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

    // Dynamic delegate for inline citizen verification
    document.addEventListener('click', async (e) => {
      // Star rating click
      const starBtn = e.target.closest('.track-star-btn');
      if (starBtn) {
        const rating = parseInt(starBtn.dataset.rating, 10);
        this.selectedRating = rating;
        document.querySelectorAll('.track-star-btn').forEach(b => {
          const r = parseInt(b.dataset.rating, 10);
          b.classList.toggle('active', r <= rating);
        });
      }

      // Confirm Fixed
      const btnFixed = e.target.closest('#btn-track-confirm-fixed');
      if (btnFixed) {
        await this.handleInlineVerification(true);
      }

      // Reopen Issue
      const btnReopen = e.target.closest('#btn-track-reopen-issue');
      if (btnReopen) {
        await this.handleInlineVerification(false);
      }
    });
  },

  showSearchPrompt() {
    const mainCard = document.getElementById('tracking-main-content');
    if (mainCard) {
      mainCard.innerHTML = `
        <div class="empty-state" style="padding: 48px 24px; text-align: center;">
          <div class="empty-state-icon" style="color: var(--primary-color); margin-bottom: 12px;">
            <i data-lucide="search" style="width: 48px; height: 48px;"></i>
          </div>
          <h2 style="font-size: 1.3rem; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Track Civic Grievance Status</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 480px; margin: 0 auto;">Enter your Ticket / Complaint ID above to view live progress, officer assignment, and SLA timeline.</p>
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
        <div class="empty-state" style="padding: 48px 24px; text-align: center;">
          <div class="empty-state-icon" style="color: var(--danger); margin-bottom: 12px;">
            <i data-lucide="alert-triangle" style="width: 48px; height: 48px;"></i>
          </div>
          <h2 style="font-size: 1.3rem; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Complaint Not Found</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Unable to find grievance with ID: <code>${Utils.escapeHtml(id)}</code>. Please check the ID and try again.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
  },

  renderTrackingDetails(data) {
    const container = document.getElementById('tracking-main-content');
    if (!container) return;

    const displayId = Utils.formatComplaintId ? Utils.formatComplaintId(data) : `#${data.public_id || data.id}`;
    const deptName = data.department_name || (typeof data.department === 'object' ? data.department?.name : data.department) || (data.department_code || 'NMC Public Works');
    const officerName = data.officer_name || (data.officer?.user?.name) || 'Assigned Field Officer';
    const officerPhone = data.officer_phone || (data.officer?.user?.phone) || '';

    // Photos & Resolutions
    const beforePhoto = data.image_url || (data.reports && data.reports[0] && data.reports[0].image_url) || data.photo_url;
    const latestResolution = data.resolutions && data.resolutions.length > 0 ? data.resolutions[data.resolutions.length - 1] : null;
    const afterPhoto = latestResolution ? latestResolution.after_photo_url : data.resolution_photo_url;
    const resolutionNote = latestResolution ? latestResolution.resolution_note : (data.resolution_notes || '');

    const currentStatus = (data.status || 'SUBMITTED').toUpperCase();
    const isResolvedOrVerifying = currentStatus === 'RESOLVED' || currentStatus === 'CITIZEN_VERIFICATION';
    const isClosed = currentStatus === 'CLOSED';
    const isReopened = currentStatus === 'REOPENED';

    // Official Operational Status Flow
    const timelineSteps = [
      { key: 'SUBMITTED', label: 'Complaint Submitted', date: data.created_at },
      { key: 'RECEIVED', label: 'Received by Department', date: data.created_at },
      { key: 'ASSIGNED', label: `Officer Assigned (${officerName})`, date: data.created_at },
      { key: 'IN_PROGRESS', label: 'Work In Progress', date: (currentStatus !== 'SUBMITTED' && currentStatus !== 'ASSIGNED') ? data.updated_at : null },
      { key: 'RESOLVED', label: 'Resolved (Proof Uploaded)', date: latestResolution ? latestResolution.created_at : (isResolvedOrVerifying || isClosed ? data.updated_at : null) },
      { key: 'CLOSED', label: 'Citizen Verified & Closed', date: isClosed ? data.updated_at : null }
    ];

    const currentStepIdx = this.getStatusStepIndex(currentStatus);
    const whatsappUrl = Utils.generateWhatsAppUrl ? Utils.generateWhatsAppUrl(data) : `https://wa.me/?text=${encodeURIComponent(`Grievance #${displayId} Status: ${currentStatus}`)}`;

    container.innerHTML = `
      <div class="card" style="margin-bottom: 24px; padding: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">GRIEVANCE REDRESSAL TICKET</div>
            <h1 style="font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 4px 0;">
              ${Utils.escapeHtml(data.title || (data.description ? String(data.description).substring(0, 60) : 'Civic Grievance'))}
            </h1>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 4px;">
              <span style="font-family: monospace; font-size: 0.95rem; font-weight: 800; color: var(--primary-color);">
                ${Utils.escapeHtml(displayId)}
              </span>
              <span style="font-size: 0.82rem; color: var(--text-muted);">
                • Registered on ${Utils.formatDate ? Utils.formatDate(data.created_at) : new Date(data.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            ${Utils.getStatusBadge ? Utils.getStatusBadge(data.status) : `<span class="badge">${data.status}</span>`}
            ${Utils.getSlaBadge ? Utils.getSlaBadge(data.sla_deadline, data.status) : ''}
          </div>
        </div>

        <!-- Official Redressal Timeline -->
        <div style="margin: 24px 0;">
          <h3 style="font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="git-commit" style="width: 18px; height: 18px; color: var(--primary-color);"></i>
            Redressal Progression Timeline
          </h3>
          <div class="timeline" style="margin-left: 8px;">
            ${timelineSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return `
                <div class="timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}">
                  <div class="timeline-point" style="font-weight: 700;">
                    ${isCompleted ? '✓' : idx + 1}
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-title" style="font-weight: 700; font-size: 0.95rem; color: ${isCurrent ? 'var(--primary-color)' : '#1e293b'};">
                      ${step.label}
                    </div>
                    <div class="timeline-time" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                      ${step.date ? (Utils.formatDate ? Utils.formatDate(step.date) : new Date(step.date).toLocaleString()) : (isCurrent ? 'Active Stage' : 'Pending')}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Details Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; background: #f8fafc; padding: 18px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 24px;">
          <div>
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Category</div>
            <div style="margin-top: 4px;">${Utils.getCategoryBadge ? Utils.getCategoryBadge(data.category) : data.category}</div>
          </div>
          <div>
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Priority</div>
            <div style="margin-top: 4px;">${Utils.getPriorityBadge ? Utils.getPriorityBadge(data.priority) : data.priority}</div>
          </div>
          <div>
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Responsible Department</div>
            <div style="font-weight: 700; color: #1e293b; margin-top: 4px; font-size: 0.95rem;">
              <i data-lucide="building-2" style="width: 14px; height: 14px; vertical-align: middle; color: var(--primary-color);"></i>
              ${Utils.escapeHtml(deptName)}
            </div>
          </div>
          <div>
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Assigned Officer</div>
            <div style="font-weight: 600; color: #1e293b; margin-top: 4px; font-size: 0.95rem;">
              👤 ${Utils.escapeHtml(officerName)} ${officerPhone ? `<span style="color: var(--text-muted); font-size: 0.8rem;">(${officerPhone})</span>` : ''}
            </div>
          </div>
          <div style="grid-column: 1 / -1;">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Grievance Location</div>
            <div style="font-weight: 600; color: #1e293b; margin-top: 4px; font-size: 0.9rem;">
              📍 ${Utils.escapeHtml(data.address || 'Nagpur Municipal Corporation Area')}
            </div>
          </div>
        </div>

        <!-- Problem Description -->
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Problem Description</h4>
          <p style="font-size: 0.95rem; color: #334155; line-height: 1.6; background: #ffffff; border: 1px solid var(--border-color); padding: 14px; border-radius: 8px; margin: 0;">
            ${Utils.escapeHtml(data.description)}
          </p>
        </div>

        <!-- INLINE CITIZEN VERIFICATION CARD (When Resolved / Awaiting Verification) -->
        ${(isResolvedOrVerifying) ? `
          <div style="background: #ecfdf5; border: 2px solid #6ee7b7; border-radius: 10px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);">
            <div style="display: flex; align-items: center; gap: 8px; color: #065f46; font-weight: 800; font-size: 1.2rem; margin-bottom: 6px;">
              <i data-lucide="check-circle" style="width: 24px; height: 24px; color: #059669;"></i>
              Grievance Resolved — Awaiting Your Quality Confirmation
            </div>
            <p style="font-size: 0.92rem; color: #047857; margin-bottom: 18px; line-height: 1.5;">
              The assigned NMC officer has completed repair work. Please review the after-repair photo proof below and confirm if the issue has been satisfactorily fixed.
            </p>

            <!-- Before vs After Comparison -->
            <div class="grid grid-2" style="gap: 16px; margin-bottom: 20px;">
              <div>
                <div style="font-weight: 700; font-size: 0.78rem; color: #b91c1c; text-transform: uppercase; margin-bottom: 6px;">
                  1. Reported Problem Photo (Before)
                </div>
                <div style="background: #ffffff; border: 1px solid #fecaca; border-radius: 8px; height: 190px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                  ${beforePhoto ? `
                    <img src="${beforePhoto}" alt="Before Repair" style="width: 100%; height: 100%; object-fit: cover;">
                  ` : `
                    <div style="color: var(--text-muted); font-size: 0.85rem;">No before photo attached</div>
                  `}
                </div>
              </div>

              <div>
                <div style="font-weight: 700; font-size: 0.78rem; color: #047857; text-transform: uppercase; margin-bottom: 6px;">
                  2. Officer Repair Proof (After)
                </div>
                <div style="background: #ffffff; border: 1px solid #a7f3d0; border-radius: 8px; height: 190px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                  ${afterPhoto ? `
                    <img src="${afterPhoto}" alt="After Repair Proof" style="width: 100%; height: 100%; object-fit: cover;">
                  ` : `
                    <div style="color: #065f46; font-size: 0.85rem; font-weight: 600;">Repair Verified by Officer Stamp</div>
                  `}
                </div>
              </div>
            </div>

            ${resolutionNote ? `
              <div style="background: #ffffff; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #065f46; text-transform: uppercase; margin-bottom: 2px;">Officer Resolution Note</div>
                <div style="font-size: 0.9rem; color: #1e293b;">${Utils.escapeHtml(resolutionNote)}</div>
              </div>
            ` : ''}

            <!-- Rating & Feedback Controls -->
            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
              <label class="form-label" style="font-weight: 700; font-size: 0.9rem;">Rate Repair Quality (1–5 Stars)</label>
              <div style="display: flex; gap: 8px; font-size: 1.8rem; margin-bottom: 14px;">
                <button type="button" class="star-btn track-star-btn active" data-rating="1" style="background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                <button type="button" class="star-btn track-star-btn active" data-rating="2" style="background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                <button type="button" class="star-btn track-star-btn active" data-rating="3" style="background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                <button type="button" class="star-btn track-star-btn active" data-rating="4" style="background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                <button type="button" class="star-btn track-star-btn active" data-rating="5" style="background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="track-feedback-input" style="font-size: 0.85rem;">Feedback or Reason if Not Fixed (Optional)</label>
                <textarea id="track-feedback-input" class="form-control" rows="2" placeholder="Let NMC know if the repair was satisfactory or what needs further work..."></textarea>
              </div>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap;">
              <button type="button" class="btn btn-danger" id="btn-track-reopen-issue" style="gap: 6px;">
                <i data-lucide="x-circle"></i> No, Problem Not Fixed (Reopen)
              </button>
              <button type="button" class="btn btn-success" id="btn-track-confirm-fixed" style="gap: 6px; font-weight: 700;">
                <i data-lucide="check-circle-2"></i> Yes, Problem Fixed (Close Ticket)
              </button>
            </div>
          </div>
        ` : ''}

        ${isClosed ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 14px;">
            <div style="background: #22c55e; color: white; border-radius: 50%; width: 36px; height: 36px; display: grid; place-items: center; flex-shrink: 0;">
              <i data-lucide="check" style="width: 22px; height: 22px;"></i>
            </div>
            <div>
              <div style="font-weight: 800; color: #15803d; font-size: 1.05rem;">Case Successfully Verified & Closed</div>
              <div style="font-size: 0.85rem; color: #166534; margin-top: 2px;">This complaint has been redressed and approved. Thank you for making Nagpur cleaner and safer!</div>
            </div>
          </div>
        ` : ''}

        ${isReopened ? `
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 14px;">
            <div style="background: #f59e0b; color: white; border-radius: 50%; width: 36px; height: 36px; display: grid; place-items: center; flex-shrink: 0;">
              <i data-lucide="alert-circle" style="width: 22px; height: 22px;"></i>
            </div>
            <div>
              <div style="font-weight: 800; color: #92400e; font-size: 1.05rem;">Grievance Reopened for Supervision</div>
              <div style="font-size: 0.85rem; color: #b45309; margin-top: 2px;">The citizen indicated the issue was not fully resolved. Re-assigned to department officer for immediate rectification.</div>
            </div>
          </div>
        ` : ''}

        <!-- Actions footer -->
        <div style="display: flex; gap: 12px; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 18px; flex-wrap: wrap;">
          <a href="${whatsappUrl}" target="_blank" class="btn btn-secondary" style="color: #059669; border-color: #a7f3d0; gap: 6px;">
            <i data-lucide="message-circle"></i> Open WhatsApp
          </a>
          <button type="button" class="btn btn-secondary" onclick="TrackingController.loadComplaint('${data.public_id || data.id}')" style="gap: 6px;">
            <i data-lucide="refresh-cw"></i> Refresh Status
          </button>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  getStatusStepIndex(status) {
    const s = (status || '').toUpperCase();
    if (s === 'SUBMITTED' || s === 'PENDING') return 0;
    if (s === 'RECEIVED') return 1;
    if (s === 'ASSIGNED') return 2;
    if (s === 'IN_PROGRESS' || s === 'ACKNOWLEDGED' || s === 'WORK_STARTED' || s === 'REOPENED') return 3;
    if (s === 'RESOLVED' || s === 'CITIZEN_VERIFICATION') return 4;
    if (s === 'CLOSED' || s === 'VERIFIED') return 5;
    return 2;
  },

  async handleInlineVerification(satisfied) {
    const feedback = document.getElementById('track-feedback-input')?.value.trim() || '';
    const btnFixed = document.getElementById('btn-track-confirm-fixed');
    const btnReopen = document.getElementById('btn-track-reopen-issue');

    if (btnFixed) btnFixed.disabled = true;
    if (btnReopen) btnReopen.disabled = true;

    try {
      await API.verifyComplaint(this.complaintId, {
        result: satisfied ? 'FIXED' : 'NOT_FIXED',
        satisfied: satisfied,
        rating: this.selectedRating,
        feedback: feedback,
        reopen_reason: satisfied ? null : (feedback || 'Problem not resolved')
      });

      if (satisfied) {
        Utils.showToast('Thank you! Complaint verified and closed.', 'success');
      } else {
        Utils.showToast('Complaint reopened and routed to supervisor.', 'warning');
      }

      await this.loadComplaint(this.complaintId);
    } catch (err) {
      console.error('Verification error:', err);
      Utils.showToast('Verification failed: ' + err.message, 'danger');
      if (btnFixed) btnFixed.disabled = false;
      if (btnReopen) btnReopen.disabled = false;
    }
  },

  setupRealtime(id) {
    if (this.wsClient) this.wsClient.disconnect();

    if (typeof RealtimeWS !== 'undefined') {
      this.wsClient = new RealtimeWS({
        complaintId: id,
        onMessage: (msg) => {
          if (
            msg.event === 'COMPLAINT_STATUS_UPDATED' ||
            msg.event === 'resolution_submitted' ||
            msg.event === 'status_changed' ||
            msg.event === 'status_change' ||
            msg.event === 'complaint_closed' ||
            msg.event === 'complaint_reopened' ||
            msg.event === 'complaint_updated'
          ) {
            Utils.showToast(`Live Update: Status is now ${msg.data?.status || 'UPDATED'}`, 'info');
            this.loadComplaint(id);
          }
        }
      });
      this.wsClient.connect();
    }

    // Fallback periodic refresh every 10s
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => {
      this.loadComplaint(id);
    }, 10000);
  }
};

window.TrackingController = TrackingController;
