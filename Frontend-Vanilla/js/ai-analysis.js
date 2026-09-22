/**
 * NagarSaathi AI - AI Understanding & Intent Confirmation
 * Sends draft complaint to backend AI (/ai/analyze) and renders structured civic intent.
 */

document.addEventListener('DOMContentLoaded', () => {
  AIAnalysisController.init();
});

const AIAnalysisController = {
  draft: null,
  aiResult: null,

  async init() {
    const raw = sessionStorage.getItem('nagarsaathi_complaint_draft');
    if (!raw) {
      Utils.showToast('No complaint draft found. Redirecting to report form...', 'warning');
      setTimeout(() => window.location.href = 'report.html', 1500);
      return;
    }

    try {
      this.draft = JSON.parse(raw);
    } catch (e) {
      window.location.href = 'report.html';
      return;
    }

    this.setupListeners();
    await this.performAIAnalysis();
  },

  setupListeners() {
    const editBtn = document.getElementById('btn-edit-complaint');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        window.location.href = 'report.html';
      });
    }

    const nextBtn = document.getElementById('btn-check-duplicates');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        // Proceed to duplicate check screen
        window.location.href = 'duplicate.html';
      });
    }

    const submitDirectBtn = document.getElementById('btn-submit-direct');
    if (submitDirectBtn) {
      submitDirectBtn.addEventListener('click', async () => {
        await this.submitFinalComplaint();
      });
    }
  },

  async performAIAnalysis() {
    const loadingEl = document.getElementById('ai-loading-state');
    const resultEl = document.getElementById('ai-result-state');
    const errorEl = document.getElementById('ai-error-state');

    try {
      if (loadingEl) loadingEl.style.display = 'block';
      if (resultEl) resultEl.style.display = 'none';
      if (errorEl) errorEl.style.display = 'none';

      // Call REAL backend AI endpoint
      const response = await API.analyzeCivicIntent({
        text: this.draft.description,
        location: this.draft.locationText || 'Nagpur'
      });

      this.aiResult = response;
      // Store AI analysis with draft for subsequent steps
      sessionStorage.setItem('nagarsaathi_ai_analysis', JSON.stringify(response));

      this.renderAIResult(response);

      if (loadingEl) loadingEl.style.display = 'none';
      if (resultEl) resultEl.style.display = 'block';

      Utils.showToast('AI classification complete', 'success');
    } catch (err) {
      console.error('AI Analysis failed:', err);
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) {
        errorEl.style.display = 'block';
        const msg = document.getElementById('ai-error-message');
        if (msg) msg.textContent = err.message || 'Unable to connect to AI engine.';
      }
    }
  },

  renderAIResult(data) {
    // Exact fields from backend
    const lang = data.language || data.detected_language || 'Marathi / Multilingual';
    const problem = data.problem || data.summary || this.draft.description;
    const category = data.category || this.draft.category || 'OTHER';
    const severity = data.severity || 'MEDIUM';
    const priority = data.priority || 'P2';
    const location = data.location_text || data.location || this.draft.locationText || 'Nagpur';
    const department = data.responsible_department || data.department || 'NMC Public Works';
    const slaHours = data.sla_hours || 24;

    const setField = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setField('ai-field-language', lang);
    setField('ai-field-problem', problem);
    setField('ai-field-location', location);
    setField('ai-field-department', department);
    setField('ai-field-sla', `${slaHours} Hours`);

    const catBadge = document.getElementById('ai-field-category-badge');
    if (catBadge) catBadge.innerHTML = Utils.getCategoryBadge(category);

    const sevBadge = document.getElementById('ai-field-severity-badge');
    if (sevBadge) sevBadge.innerHTML = Utils.getPriorityBadge(severity);

    const priBadge = document.getElementById('ai-field-priority-badge');
    if (priBadge) priBadge.innerHTML = Utils.getPriorityBadge(priority);
  },

  async submitFinalComplaint() {
    const submitBtn = document.getElementById('btn-submit-direct');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span> Submitting to NMC...';
    }

    try {
      const payload = {
        title: this.aiResult?.problem || this.draft.description.substring(0, 80),
        description: this.draft.description,
        category: this.aiResult?.category || this.draft.category || 'OTHER',
        priority: this.aiResult?.priority || 'MEDIUM',
        latitude: this.draft.latitude || 21.1458,
        longitude: this.draft.longitude || 79.0882,
        address: this.draft.locationText || 'Nagpur',
        citizen_name: this.draft.citizenName || 'Anonymous',
        citizen_phone: this.draft.citizenPhone || ''
      };

      const result = await API.createComplaint(payload);

      // Clean session draft
      sessionStorage.removeItem('nagarsaathi_complaint_draft');
      sessionStorage.removeItem('nagarsaathi_ai_analysis');

      Utils.showToast('Complaint registered successfully! ID: ' + result.id.substring(0, 8), 'success');

      setTimeout(() => {
        window.location.href = `tracking.html?id=${encodeURIComponent(result.id)}`;
      }, 1000);
    } catch (err) {
      console.error('Submission failed:', err);
      Utils.showToast('Failed to submit complaint: ' + err.message, 'danger');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="check-circle"></i> Confirm & Submit Direct';
        if (window.lucide) lucide.createIcons();
      }
    }
  }
};

window.AIAnalysisController = AIAnalysisController;
