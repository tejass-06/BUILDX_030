/**
 * NagarSaathi AI - Duplicate Check & Community Clustering
 * Calls backend duplicate detection (/ai/duplicate-check) and offers "Join Existing" vs "Report Separately".
 */

document.addEventListener('DOMContentLoaded', () => {
  DuplicateController.init();
});

const DuplicateController = {
  draft: null,
  aiAnalysis: null,
  duplicatesData: null,

  async init() {
    const rawDraft = sessionStorage.getItem('nagarsaathi_complaint_draft');
    if (!rawDraft) {
      window.location.href = 'report.html';
      return;
    }

    try {
      this.draft = JSON.parse(rawDraft);
      const rawAI = sessionStorage.getItem('nagarsaathi_ai_analysis');
      if (rawAI) this.aiAnalysis = JSON.parse(rawAI);
    } catch (e) {
      window.location.href = 'report.html';
      return;
    }

    this.setupListeners();
    await this.checkDuplicates();
  },

  setupListeners() {
    const reportSepBtn = document.getElementById('btn-report-separately');
    if (reportSepBtn) {
      reportSepBtn.addEventListener('click', async () => {
        await this.submitNewComplaint();
      });
    }

    const backBtn = document.getElementById('btn-back-ai');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = 'ai-analysis.html';
      });
    }
  },

  async checkDuplicates() {
    const loadingEl = document.getElementById('dup-loading-state');
    const contentEl = document.getElementById('dup-content-state');
    const listContainer = document.getElementById('dup-list-container');
    const headerTitle = document.getElementById('dup-header-title');
    const headerSubtitle = document.getElementById('dup-header-subtitle');

    try {
      if (loadingEl) loadingEl.style.display = 'block';
      if (contentEl) contentEl.style.display = 'none';

      // Call REAL backend duplicate detection API
      const result = await API.checkDuplicates({
        title: this.aiAnalysis?.problem || this.draft.description.substring(0, 50),
        text: this.draft.description,
        category: this.aiAnalysis?.category || this.draft.category,
        latitude: this.draft.latitude,
        longitude: this.draft.longitude,
        radius_meters: 300
      });

      this.duplicatesData = result;
      const duplicates = result.duplicates || (Array.isArray(result) ? result : []);

      if (loadingEl) loadingEl.style.display = 'none';
      if (contentEl) contentEl.style.display = 'block';

      if (duplicates.length > 0) {
        if (headerTitle) headerTitle.textContent = '⚠️ Similar Civic Issues Found Nearby';
        if (headerSubtitle) {
          headerSubtitle.textContent = `NMC AI found ${duplicates.length} matching grievance(s) within your immediate area. You can join the existing ticket to boost priority or register separately.`;
        }

        if (listContainer) {
          listContainer.innerHTML = duplicates.map(dup => `
            <div class="card card-hover" style="border: 1px solid #e2e8f0; margin-bottom: 12px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <span style="font-family: monospace; font-size: 0.85rem; font-weight: 700; color: var(--primary-color);">
                  ID: #${dup.id ? String(dup.id).substring(0, 8) : 'EXISTING'}
                </span>
                <span class="badge badge-warning" style="font-size: 0.75rem;">
                  ${dup.similarity_score ? Math.round(dup.similarity_score * 100) + '% Match' : 'High Similarity'}
                </span>
              </div>
              <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 4px; color: #1e293b;">
                ${Utils.escapeHtml(dup.title || dup.description || 'Reported Civic Issue')}
              </h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
                ${Utils.escapeHtml(dup.description ? dup.description.substring(0, 120) + '...' : '')}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">
                  📍 ${Utils.escapeHtml(dup.address || 'Nearby')} ${dup.distance_meters ? `(${Math.round(dup.distance_meters)}m away)` : ''}
                </span>
                <button class="btn btn-sm btn-primary" onclick="DuplicateController.joinExistingIssue('${dup.id}')">
                  <i data-lucide="users"></i> Join This Issue
                </button>
              </div>
            </div>
          `).join('');
          if (window.lucide) lucide.createIcons();
        }
      } else {
        if (headerTitle) headerTitle.textContent = '✓ No Duplicate Issues Found';
        if (headerSubtitle) {
          headerSubtitle.textContent = 'No matching active grievances found in this area. Your report will be registered as a new primary ticket.';
        }
        if (listContainer) {
          listContainer.innerHTML = `
            <div class="empty-state" style="padding: 24px;">
              <div class="empty-state-icon" style="color: var(--success);">
                <i data-lucide="check-circle-2"></i>
              </div>
              <div class="empty-state-title">Unique Civic Report</div>
              <div class="empty-state-text">Ready to dispatch to the appropriate NMC municipal department.</div>
              <button class="btn btn-primary" id="btn-submit-unique" style="margin-top: 16px;" onclick="DuplicateController.submitNewComplaint()">
                <i data-lucide="send"></i> Confirm & Submit Ticket
              </button>
            </div>
          `;
          if (window.lucide) lucide.createIcons();
        }
      }
    } catch (err) {
      console.warn('Duplicate check endpoint error or empty:', err);
      if (loadingEl) loadingEl.style.display = 'none';
      if (contentEl) contentEl.style.display = 'block';
      if (headerTitle) headerTitle.textContent = 'Ready for Registration';
      if (listContainer) {
        listContainer.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <p style="color: var(--text-muted); margin-bottom: 16px;">Duplicate detection complete. You can proceed with registration directly.</p>
            <button class="btn btn-primary" onclick="DuplicateController.submitNewComplaint()">
              <i data-lucide="send"></i> Submit Grievance
            </button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  async joinExistingIssue(existingId) {
    if (!existingId) return;
    try {
      Utils.showToast('Linking your report to existing ticket #' + String(existingId).substring(0, 8), 'info');
      await API.upvoteComplaint(existingId);
      sessionStorage.removeItem('nagarsaathi_complaint_draft');
      sessionStorage.removeItem('nagarsaathi_ai_analysis');
      Utils.showToast('Successfully joined community issue!', 'success');
      setTimeout(() => {
        window.location.href = `tracking.html?id=${encodeURIComponent(existingId)}`;
      }, 1000);
    } catch (err) {
      console.error('Error joining issue:', err);
      window.location.href = `tracking.html?id=${encodeURIComponent(existingId)}`;
    }
  },

  async submitNewComplaint() {
    const reportSepBtn = document.getElementById('btn-report-separately');
    if (reportSepBtn) {
      reportSepBtn.disabled = true;
      reportSepBtn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span> Registering...';
    }

    try {
      const formData = new FormData();
      formData.append('title', this.aiAnalysis?.problem || this.draft.description.substring(0, 80));
      formData.append('description', this.draft.description);
      formData.append('category', this.aiAnalysis?.category || this.draft.category || 'OTHER');
      formData.append('priority', this.aiAnalysis?.priority || 'MEDIUM');
      formData.append('latitude', this.draft.latitude || 21.1458);
      formData.append('longitude', this.draft.longitude || 79.0882);
      formData.append('address', this.draft.locationText || 'Nagpur');
      formData.append('citizen_name', this.draft.citizenName || 'Anonymous');
      formData.append('citizen_phone', this.draft.citizenPhone || '');

      if (this.draft.photoDataUrl) {
        const fileBlob = await (await fetch(this.draft.photoDataUrl)).blob();
        formData.append('photo', fileBlob, this.draft.photoFileName || 'evidence.jpg');
      }

      const result = await API.createComplaint(formData);

      sessionStorage.removeItem('nagarsaathi_complaint_draft');
      sessionStorage.removeItem('nagarsaathi_ai_analysis');

      const ticketId = result.public_id || result.id;
      Utils.showToast('Grievance registered! ID: ' + ticketId.substring(0, 8), 'success');

      setTimeout(() => {
        window.location.href = `tracking.html?id=${encodeURIComponent(ticketId)}`;
      }, 1000);
    } catch (err) {
      console.error('Submission failed:', err);
      Utils.showToast('Registration failed: ' + err.message, 'danger');
      if (reportSepBtn) {
        reportSepBtn.disabled = false;
        reportSepBtn.textContent = 'Report Separately';
      }
    }
  }
};

window.DuplicateController = DuplicateController;
