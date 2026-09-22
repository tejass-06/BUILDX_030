/**
 * NagarSaathi AI - Resolution & Citizen Verification Controller
 * Handles officer after-photo proof upload, AI repair verification, and citizen before/after feedback.
 */

document.addEventListener('DOMContentLoaded', () => {
  ResolutionController.init();
});

const ResolutionController = {
  complaintId: null,
  complaintData: null,
  afterPhotoFile: null,
  selectedRating: 5,

  async init() {
    const params = new URLSearchParams(window.location.search);
    this.complaintId = params.get('id');

    if (!this.complaintId) {
      Utils.showToast('No complaint ID specified.', 'warning');
      return;
    }

    this.setupListeners();
    await this.loadComplaintData();
  },

  setupListeners() {
    // Photo preview for officer
    const afterFileInput = document.getElementById('resolution-after-photo');
    const afterPreview = document.getElementById('resolution-after-preview');
    const afterPreviewImg = document.getElementById('resolution-after-img');

    if (afterFileInput) {
      afterFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.afterPhotoFile = file;
          const reader = new FileReader();
          reader.onload = (re) => {
            if (afterPreviewImg) afterPreviewImg.src = re.target.result;
            if (afterPreview) afterPreview.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Officer Submit Resolution Form
    const officerForm = document.getElementById('officer-resolution-form');
    if (officerForm) {
      officerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitOfficerResolution();
      });
    }

    // Citizen Rating Stars
    const starBtns = document.querySelectorAll('.star-btn');
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating, 10);
        this.selectedRating = rating;
        starBtns.forEach(b => {
          const r = parseInt(b.dataset.rating, 10);
          b.classList.toggle('active', r <= rating);
        });
      });
    });

    // Citizen Verification Buttons
    const btnConfirmFixed = document.getElementById('btn-citizen-confirm-fixed');
    const btnReopenIssue = document.getElementById('btn-citizen-reopen-issue');

    if (btnConfirmFixed) {
      btnConfirmFixed.addEventListener('click', async () => {
        await this.submitCitizenVerification(true);
      });
    }

    if (btnReopenIssue) {
      btnReopenIssue.addEventListener('click', async () => {
        await this.submitCitizenVerification(false);
      });
    }
  },

  async loadComplaintData() {
    try {
      const data = await API.getComplaintById(this.complaintId);
      this.complaintData = data;
      this.renderComplaintContext(data);
    } catch (err) {
      console.error('Failed to load complaint for resolution:', err);
      Utils.showToast('Unable to load grievance data: ' + err.message, 'danger');
    }
  },

  renderComplaintContext(data) {
    const titleEl = document.getElementById('res-complaint-title');
    const idEl = document.getElementById('res-complaint-id');
    const descEl = document.getElementById('res-complaint-desc');
    const beforeImg = document.getElementById('res-before-img');
    const afterImgCitizen = document.getElementById('res-citizen-after-img');

    const displayId = Utils.formatComplaintId ? Utils.formatComplaintId(data) : `#${data.public_id || data.id}`;
    if (titleEl) titleEl.textContent = data.title || (data.description ? String(data.description).substring(0, 70) : 'Civic Grievance');
    if (idEl) idEl.textContent = displayId;
    if (descEl) descEl.textContent = data.description || '';

    // Normalize image URLs
    const beforePhotoUrl = data.image_url || (data.reports && data.reports[0] && data.reports[0].image_url) || data.photo_url;
    const afterPhotoUrl = (data.resolutions && data.resolutions[0] && data.resolutions[0].after_photo_url) || data.resolution_photo_url;

    if (beforeImg && beforePhotoUrl) {
      beforeImg.src = beforePhotoUrl;
    }

    if (afterImgCitizen && afterPhotoUrl) {
      afterImgCitizen.src = afterPhotoUrl;
    }

    // Toggle officer vs citizen panels
    const officerSection = document.getElementById('section-officer-resolve');
    const citizenSection = document.getElementById('section-citizen-verify');

    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    const user = typeof AuthManager !== 'undefined' ? AuthManager.getUser() : null;
    const userRole = (user && user.role) ? user.role.toUpperCase() : (roleParam ? roleParam.toUpperCase() : 'CITIZEN');

    const isResolvedOrVerified = data.status === 'RESOLVED' || data.status === 'CITIZEN_VERIFICATION' || data.status === 'CLOSED';

    if (userRole === 'OFFICER' || roleParam === 'officer') {
      if (isResolvedOrVerified) {
        // Officer viewing already resolved complaint
        this.renderOfficerAlreadyResolved(data);
      } else {
        if (officerSection) officerSection.style.display = 'block';
        if (citizenSection) citizenSection.style.display = 'none';
      }
    } else {
      // Citizen viewing verification
      if (officerSection) officerSection.style.display = 'none';
      if (citizenSection) citizenSection.style.display = 'block';
    }

    if (window.lucide) lucide.createIcons();
  },

  renderOfficerAlreadyResolved(data) {
    const officerSection = document.getElementById('section-officer-resolve');
    const citizenSection = document.getElementById('section-citizen-verify');
    if (citizenSection) citizenSection.style.display = 'none';

    if (officerSection) {
      const displayId = Utils.formatComplaintId ? Utils.formatComplaintId(data) : `#${data.public_id || data.id}`;
      officerSection.style.display = 'block';
      officerSection.innerHTML = `
        <div style="text-align: center; padding: 20px 10px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #ecfdf5; color: #059669; display: grid; place-items: center; margin: 0 auto 14px auto;">
            <i data-lucide="check-circle-2" style="width: 32px; height: 32px;"></i>
          </div>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #1e293b; margin-bottom: 6px;">
            Resolution Proof Recorded
          </h2>
          <div style="display: inline-block; margin-bottom: 12px;">
            ${Utils.getStatusBadge ? Utils.getStatusBadge(data.status) : '<span class="badge badge-resolved">Resolved — Awaiting Verification</span>'}
          </div>
          <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 20px auto; line-height: 1.5;">
            Resolution evidence for complaint <b>${Utils.escapeHtml(displayId)}</b> has been safely submitted. The grievance is currently awaiting citizen confirmation or closure.
          </p>
          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <a href="officer.html" class="btn btn-primary">
              <i data-lucide="briefcase"></i> Officer Dashboard
            </a>
            <a href="tracking.html?id=${encodeURIComponent(data.public_id || data.id)}" class="btn btn-secondary">
              <i data-lucide="search"></i> View Grievance Tracking
            </a>
          </div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
  },

  async submitOfficerResolution() {
    const btn = document.getElementById('btn-submit-resolution');
    const noteEl = document.getElementById('resolution-notes');
    const note = noteEl ? noteEl.value.trim() : '';

    if (!note) {
      Utils.showToast('Please provide a resolution note describing the repair work done', 'warning');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span> Submitting resolution proof...';
    }

    try {
      const formData = new FormData();
      formData.append('resolution_note', note);
      if (this.afterPhotoFile) {
        formData.append('after_photo', this.afterPhotoFile);
      }

      const response = await API.resolveComplaint(this.complaintId, formData);
      const displayId = Utils.formatComplaintId ? Utils.formatComplaintId(response || this.complaintData) : `#${this.complaintId}`;

      Utils.showToast('Resolution proof submitted successfully!', 'success');

      // Replace officer resolution form with clean confirmation UI (preventing form reload loop)
      const officerSection = document.getElementById('section-officer-resolve');
      if (officerSection) {
        officerSection.innerHTML = `
          <div style="text-align: center; padding: 24px 12px;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: #ecfdf5; color: #059669; display: grid; place-items: center; margin: 0 auto 16px auto;">
              <i data-lucide="check-circle-2" style="width: 36px; height: 36px;"></i>
            </div>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: #1e293b; margin-bottom: 8px;">
              ✓ Resolution Submitted
            </h2>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--primary-color); margin-bottom: 8px;">
              Complaint ID: ${Utils.escapeHtml(displayId)}
            </div>
            <div style="display: inline-block; margin-bottom: 14px;">
              <span class="badge badge-resolved" style="font-size: 0.85rem; padding: 4px 10px;">
                Resolved — Awaiting Citizen Verification
              </span>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 24px auto; line-height: 1.5;">
              After-repair photo and resolution notes have been recorded in Supabase and broadcast to the citizen for quality verification.
            </p>
            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
              <a href="officer.html" class="btn btn-primary" style="gap: 6px;">
                <i data-lucide="briefcase"></i> Go to Officer Dashboard
              </a>
              <a href="tracking.html?id=${encodeURIComponent(this.complaintId)}" class="btn btn-secondary" style="gap: 6px;">
                <i data-lucide="search"></i> View Citizen Tracking
              </a>
            </div>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      }
    } catch (err) {
      console.error('Failed to resolve complaint:', err);
      Utils.showToast('Resolution submission failed: ' + err.message, 'danger');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="check-circle-2"></i> Submit Resolution Proof';
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  async submitCitizenVerification(satisfied) {
    const feedback = document.getElementById('citizen-feedback-text')?.value.trim() || '';
    const btnFixed = document.getElementById('btn-citizen-confirm-fixed');
    const btnReopen = document.getElementById('btn-citizen-reopen-issue');

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
        Utils.showToast('Thank you! Grievance verified and closed.', 'success');
      } else {
        Utils.showToast('Grievance has been REOPENED and routed back to the officer.', 'warning');
      }

      setTimeout(() => {
        window.location.href = `tracking.html?id=${encodeURIComponent(this.complaintId)}`;
      }, 1500);
    } catch (err) {
      console.error('Verification error:', err);
      Utils.showToast('Verification failed: ' + err.message, 'danger');
      if (btnFixed) btnFixed.disabled = false;
      if (btnReopen) btnReopen.disabled = false;
    }
  }
};

window.ResolutionController = ResolutionController;
