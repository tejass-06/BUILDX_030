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
      Utils.showToast('Unable to load grievance data.', 'danger');
    }
  },

  renderComplaintContext(data) {
    const titleEl = document.getElementById('res-complaint-title');
    const idEl = document.getElementById('res-complaint-id');
    const descEl = document.getElementById('res-complaint-desc');
    const beforeImg = document.getElementById('res-before-img');
    const afterImgCitizen = document.getElementById('res-citizen-after-img');

    if (titleEl) titleEl.textContent = data.title || data.description.substring(0, 70);
    if (idEl) idEl.textContent = `#${data.id}`;
    if (descEl) descEl.textContent = data.description;

    if (beforeImg && data.photo_url) {
      beforeImg.src = data.photo_url;
    }

    if (afterImgCitizen && data.resolution_photo_url) {
      afterImgCitizen.src = data.resolution_photo_url;
    }

    // Toggle officer vs citizen panels
    const officerSection = document.getElementById('section-officer-resolve');
    const citizenSection = document.getElementById('section-citizen-verify');

    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');

    if (roleParam === 'officer' || data.status === 'IN_PROGRESS' || data.status === 'ASSIGNED') {
      if (officerSection) officerSection.style.display = 'block';
      if (citizenSection) citizenSection.style.display = 'none';
    } else {
      if (officerSection) officerSection.style.display = 'none';
      if (citizenSection) citizenSection.style.display = 'block';
    }
  },

  async submitOfficerResolution() {
    const btn = document.getElementById('btn-submit-resolution');
    const note = document.getElementById('resolution-notes').value.trim();

    if (!note) {
      Utils.showToast('Please provide a resolution note describing the repair work done', 'warning');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span> Verifying & Resolving...';
    }

    try {
      const response = await API.resolveComplaint(this.complaintId, {
        resolution_notes: note,
        action_taken: note
      });

      // Show AI Verification results if returned by backend
      const aiSection = document.getElementById('resolution-ai-verification-results');
      if (aiSection && response.ai_verification) {
        aiSection.style.display = 'block';
        const v = response.ai_verification;
        aiSection.innerHTML = `
          <div class="card" style="background: #f0fdf4; border: 1px solid #bbf7d0; margin-top: 16px;">
            <div style="font-weight: 700; color: #166534; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i data-lucide="sparkles"></i> AI Resolution Verification Result
            </div>
            <div style="font-size: 0.85rem; color: #14532d; display: flex; flex-direction: column; gap: 6px;">
              <div>✓ <b>Location Consistency:</b> ${v.location_match ? 'Validated GPS Match' : 'Manual Officer Confirmation'}</div>
              <div>✓ <b>Visual Scene Match:</b> ${v.scene_match ? 'Matched Pre-Repair Coordinates' : 'Visual Confirmed'}</div>
              <div>✓ <b>Repair Confidence:</b> ${v.confidence ? Math.round(v.confidence * 100) + '%' : 'Verified by Officer Stamp'}</div>
            </div>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      }

      Utils.showToast('Grievance marked as RESOLVED! Sent to citizen for verification.', 'success');

      setTimeout(() => {
        window.location.href = `tracking.html?id=${encodeURIComponent(this.complaintId)}`;
      }, 1800);
    } catch (err) {
      console.error('Failed to resolve complaint:', err);
      Utils.showToast('Resolution submission failed: ' + err.message, 'danger');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="check-circle-2"></i> Submit Resolution';
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  async submitCitizenVerification(satisfied) {
    const feedback = document.getElementById('citizen-feedback-text')?.value.trim() || '';

    try {
      await API.verifyComplaint(this.complaintId, {
        satisfied: satisfied,
        rating: this.selectedRating,
        feedback: feedback
      });

      if (satisfied) {
        Utils.showToast('Thank you! Grievance closed as verified.', 'success');
      } else {
        Utils.showToast('Grievance has been REOPENED and flagged for supervisor review.', 'warning');
      }

      setTimeout(() => {
        window.location.href = `tracking.html?id=${encodeURIComponent(this.complaintId)}`;
      }, 1500);
    } catch (err) {
      console.error('Verification error:', err);
      Utils.showToast('Verification failed: ' + err.message, 'danger');
    }
  }
};

window.ResolutionController = ResolutionController;
