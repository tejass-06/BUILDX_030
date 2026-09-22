/**
 * NagarSaathi AI - Profile Controller
 * Strictly authenticated role-based profile manager for Citizen, Officer, and Admin.
 * Genuinely persisted with Supabase Auth, PostgreSQL, and Supabase Storage.
 */

document.addEventListener('DOMContentLoaded', async () => {
  await ProfileController.init();
});

const ProfileController = {
  user: null,
  stats: {},
  complaints: [],
  selectedPhotoFile: null,

  async init() {
    try {
      // 1. Guard check - redirect to login if session is invalid
      const user = await AuthManager.requireAuth(['citizen', 'officer', 'admin', 'command_center']);
      if (!user) return;

      this.user = user;

      // 2. Fetch fresh profile data directly from source-of-truth backend
      await this.loadProfileData();

      // 3. Setup event listeners
      this.setupEventListeners();
    } catch (err) {
      console.error('Profile initialization error:', err);
      this.renderErrorState(err.message || 'Unable to load profile. Please sign in again.');
    }
  },

  async loadProfileData() {
    const container = document.getElementById('profile-container');
    if (!container) return;

    try {
      // Fetch fresh authenticated user
      const freshUser = await API.getMe();
      if (freshUser) {
        this.user = freshUser;
        // Update cached session user if name or photo updated
        const session = AuthManager.getSession();
        if (session && session.user) {
          session.user = { ...session.user, ...freshUser };
          localStorage.setItem('ns_session', JSON.stringify(session));
        }
      }

      // Fetch role-specific statistics and complaints
      const role = (this.user.role || 'CITIZEN').toUpperCase();

      if (role === 'OFFICER') {
        const complaintsData = await API.getComplaints();
        this.complaints = Array.isArray(complaintsData) ? complaintsData : (complaintsData?.complaints || []);
        this.computeOfficerStats();
      } else if (role === 'ADMIN' || role === 'COMMAND_CENTER') {
        try {
          const stats = await API.getSystemStats();
          this.stats = stats || {};
        } catch {
          this.stats = {};
        }
        const complaintsData = await API.getComplaints();
        this.complaints = Array.isArray(complaintsData) ? complaintsData : (complaintsData?.complaints || []);
      } else {
        // Citizen
        const myComplaints = await API.getMyComplaints();
        this.complaints = Array.isArray(myComplaints) ? myComplaints : (myComplaints?.complaints || []);
        this.computeCitizenStats();
      }

      this.renderProfile();
    } catch (err) {
      console.error('Failed to load profile data:', err);
      this.renderErrorState('Unable to load profile data from the server. Please check your network connection.');
    }
  },

  computeCitizenStats() {
    const total = this.complaints.length;
    let active = 0, resolved = 0, closed = 0, reopened = 0;

    this.complaints.forEach(c => {
      const status = (c.status || '').toUpperCase();
      if (status === 'RESOLVED') resolved++;
      else if (status === 'CLOSED') closed++;
      else if (status === 'REOPENED') reopened++;
      else active++;
    });

    this.stats = { total, active, resolved, closed, reopened };
  },

  computeOfficerStats() {
    const total = this.complaints.length;
    let active = 0, resolved = 0, closed = 0, reopened = 0, urgent = 0, breached = 0;

    const now = new Date();
    this.complaints.forEach(c => {
      const status = (c.status || '').toUpperCase();
      const priority = (c.priority || '').toUpperCase();

      if (status === 'RESOLVED') resolved++;
      else if (status === 'CLOSED') closed++;
      else if (status === 'REOPENED') reopened++;
      else active++;

      if (priority === 'URGENT' || priority === 'HIGH') urgent++;

      if (c.sla_deadline) {
        const deadline = new Date(c.sla_deadline);
        if (deadline < now && status !== 'RESOLVED' && status !== 'CLOSED') {
          breached++;
        }
      }
    });

    this.stats = { total, active, resolved, closed, reopened, urgent, breached };
  },

  renderProfile() {
    const container = document.getElementById('profile-container');
    if (!container) return;

    const role = (this.user.role || 'CITIZEN').toUpperCase();
    const isOfficer = role === 'OFFICER';
    const isAdmin = role === 'ADMIN' || role === 'COMMAND_CENTER';
    const initials = (this.user.name || this.user.email || 'U').substring(0, 2).toUpperCase();

    const roleBadgeClass = isOfficer ? 'badge-warning' : (isAdmin ? 'badge-danger' : 'badge-primary');
    const joinedDate = this.user.created_at ? new Date(this.user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified Resident';

    const langNames = { en: 'English', mr: 'मराठी (Marathi)', hi: 'हिंदी (Hindi)' };
    const preferredLang = langNames[this.user.preferred_language] || this.user.preferred_language || 'English';

    container.innerHTML = `
      <!-- Profile Header Card -->
      <div class="card profile-card" style="margin-bottom: 24px; padding: 28px;">
        <div class="profile-header-layout" style="display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
            <div class="profile-avatar-wrapper" style="position: relative; width: 84px; height: 84px; border-radius: 50%; overflow: hidden; background: #e2e8f0; border: 3px solid var(--primary-color); display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              ${this.user.profile_photo_url ? `
                <img src="${Utils.escapeHtml(this.user.profile_photo_url)}" alt="${Utils.escapeHtml(this.user.name || 'User')}" style="width: 100%; height: 100%; object-fit: cover;">
              ` : `
                <span style="font-size: 1.8rem; font-weight: 800; color: #475569;">${initials}</span>
              `}
            </div>

            <div>
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 6px;">
                <h1 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0;">
                  ${Utils.escapeHtml(this.user.name || 'Citizen User')}
                </h1>
                <span class="badge ${roleBadgeClass}" style="font-size: 0.75rem; padding: 4px 10px; font-weight: 700;">
                  ${role}
                </span>
                <span class="badge badge-success" style="font-size: 0.75rem; padding: 4px 10px;">
                  <i data-lucide="check-circle" style="width: 12px; height: 12px;"></i> Active
                </span>
              </div>

              <div style="font-size: 0.88rem; color: var(--text-muted); display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                <span><i data-lucide="mail" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${Utils.escapeHtml(this.user.email || 'N/A')}</span>
                <span><i data-lucide="calendar" style="width: 14px; height: 14px; vertical-align: middle;"></i> Joined ${joinedDate}</span>
                ${isOfficer && this.user.department_name ? `
                  <span class="badge badge-info" style="font-size: 0.75rem;"><i data-lucide="building-2" style="width: 12px; height: 12px;"></i> ${Utils.escapeHtml(this.user.department_name)}</span>
                ` : ''}
              </div>
            </div>
          </div>

          <div>
            <button type="button" class="btn btn-primary" id="open-edit-modal-btn" style="gap: 8px;">
              <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i> Edit Details
            </button>
          </div>
        </div>
      </div>

      <!-- 2-Column Info & Telemetry Grid -->
      <div class="grid grid-2" style="gap: 24px; margin-bottom: 32px;">
        <!-- Column 1: Account Information -->
        <div class="card" style="padding: 24px;">
          <h2 style="font-size: 1.15rem; font-weight: 700; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
            <i data-lucide="user-check" style="width: 18px; height: 18px; color: var(--primary-color);"></i>
            ${isOfficer ? 'Officer Credentials' : (isAdmin ? 'Admin Governance Profile' : 'Citizen Information')}
          </h2>

          <div class="profile-info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Full Name</div>
              <div style="font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-top: 2px;">${Utils.escapeHtml(this.user.name || 'Not specified')}</div>
            </div>

            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Official Email</div>
              <div style="font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-top: 2px;">${Utils.escapeHtml(this.user.email || 'N/A')}</div>
            </div>

            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Phone Number</div>
              <div style="font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-top: 2px;">${Utils.escapeHtml(this.user.phone || '+91 Not provided')}</div>
            </div>

            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Preferred Language</div>
              <div style="font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-top: 2px;">${preferredLang}</div>
            </div>

            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Jurisdiction / City</div>
              <div style="font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-top: 2px;">Nagpur Municipal Corporation</div>
            </div>

            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Assigned Zone / Ward</div>
              <div style="font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-top: 2px;">${Utils.escapeHtml(this.user.zone || 'Central Nagpur (All Zones)')}</div>
            </div>

            ${isOfficer ? `
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Department (Database Linked)</div>
                <div style="font-size: 0.95rem; font-weight: 700; color: #1e40af; margin-top: 2px;">${Utils.escapeHtml(this.user.department_name || 'Municipal Works')}</div>
              </div>

              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Department ID / Code</div>
                <div style="font-size: 0.95rem; font-weight: 600; color: #64748b; margin-top: 2px;">${Utils.escapeHtml(this.user.department_id ? String(this.user.department_id).substring(0, 8) : 'NMC-DEPT')}</div>
              </div>

              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Officer ID / Designation</div>
                <div style="font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-top: 2px;">${Utils.escapeHtml(this.user.designation || 'NMC Field Officer')}</div>
              </div>
            ` : ''}

            ${isAdmin ? `
              <div style="grid-column: 1 / -1; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin-top: 6px;">
                <div style="font-size: 0.8rem; font-weight: 700; color: #1e40af; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                  <i data-lucide="shield-alert" style="width: 14px; height: 14px;"></i> Super Admin Authority
                </div>
                <div style="font-size: 0.78rem; color: #1e3a8a; line-height: 1.5;">
                  • Multi-Department Complaint Dispatch & SLA Escalation<br>
                  • Officer Assignment & Realtime Workflow Automation<br>
                  • Supabase Master Database Sync & Analytics Telemetry
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Column 2: Statistics & Performance Cards -->
        <div class="card" style="padding: 24px;">
          <h2 style="font-size: 1.15rem; font-weight: 700; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
            <i data-lucide="bar-chart-2" style="width: 18px; height: 18px; color: var(--primary-color);"></i>
            ${isOfficer ? 'Officer Redressal Statistics' : (isAdmin ? 'City Governance Overview' : 'My Grievance Redressal Stats')}
          </h2>

          <div class="grid grid-2" style="gap: 14px;">
            <div class="stat-card" style="padding: 16px; border-radius: 10px; background: #f8fafc; border: 1px solid var(--border-color); text-align: center;">
              <div style="font-size: 1.8rem; font-weight: 800; color: #1e293b;">${this.stats.total || this.stats.total_complaints || 0}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; margin-top: 4px;">Total Complaints</div>
            </div>

            <div class="stat-card" style="padding: 16px; border-radius: 10px; background: #eff6ff; border: 1px solid #bfdbfe; text-align: center;">
              <div style="font-size: 1.8rem; font-weight: 800; color: #2563eb;">${this.stats.active || this.stats.active_complaints || 0}</div>
              <div style="font-size: 0.8rem; color: #1e40af; font-weight: 600; margin-top: 4px;">Active / In Progress</div>
            </div>

            <div class="stat-card" style="padding: 16px; border-radius: 10px; background: #ecfdf5; border: 1px solid #a7f3d0; text-align: center;">
              <div style="font-size: 1.8rem; font-weight: 800; color: #059669;">${this.stats.resolved || this.stats.resolved_complaints || 0}</div>
              <div style="font-size: 0.8rem; color: #065f46; font-weight: 600; margin-top: 4px;">Resolved Successfully</div>
            </div>

            ${isOfficer ? `
              <div class="stat-card" style="padding: 16px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca; text-align: center;">
                <div style="font-size: 1.8rem; font-weight: 800; color: #dc2626;">${this.stats.breached || this.stats.sla_breached || 0}</div>
                <div style="font-size: 0.8rem; color: #991b1b; font-weight: 600; margin-top: 4px;">SLA Breached</div>
              </div>
            ` : `
              <div class="stat-card" style="padding: 16px; border-radius: 10px; background: #faf5ff; border: 1px solid #e9d5ff; text-align: center;">
                <div style="font-size: 1.8rem; font-weight: 800; color: #7c3aed;">${this.stats.closed || 0}</div>
                <div style="font-size: 0.8rem; color: #5b21b6; font-weight: 600; margin-top: 4px;">Closed Grievances</div>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Recent Complaints Section -->
      <div class="card" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h2 style="font-size: 1.15rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="history" style="width: 18px; height: 18px; color: var(--primary-color);"></i>
              ${isOfficer ? 'Recent Assigned Redressals' : (isAdmin ? 'Recent NMC Grievances' : 'My Recent Grievance Submissions')}
            </h2>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin: 4px 0 0 0;">
              Live authenticated complaint records from Supabase PostgreSQL
            </p>
          </div>
          ${!isOfficer && !isAdmin ? `
            <a href="report.html" class="btn btn-sm btn-primary">
              <i data-lucide="plus-circle"></i> File New Problem
            </a>
          ` : ''}
        </div>

        <div id="recent-complaints-container">
          ${this.renderRecentComplaintsTable()}
        </div>
      </div>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  renderRecentComplaintsTable() {
    if (!this.complaints || this.complaints.length === 0) {
      return `
        <div style="padding: 40px 20px; text-align: center; color: var(--text-muted);">
          <i data-lucide="inbox" style="width: 48px; height: 48px; stroke-width: 1.5; color: #94a3b8; margin-bottom: 12px;"></i>
          <p style="font-size: 0.95rem; font-weight: 600; color: #475569;">No complaints on record</p>
          <p style="font-size: 0.85rem;">New civic complaints submitted or assigned will show up here in real time.</p>
        </div>
      `;
    }

    const recent = this.complaints.slice(0, 8);

    return `
      <div class="table-responsive">
        <table class="table table-mobile-cards">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${recent.map(c => {
              const idShort = c.id ? String(c.id).substring(0, 8) : 'N/A';
              const catBadge = Utils.getCategoryBadge ? Utils.getCategoryBadge(c.category) : `<span class="badge">${Utils.escapeHtml(c.category || 'General')}</span>`;
              const statusBadge = Utils.getStatusBadge ? Utils.getStatusBadge(c.status) : `<span class="badge">${Utils.escapeHtml(c.status || 'PENDING')}</span>`;
              const dateStr = c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
              const locationStr = c.location_address || c.address || (c.latitude ? `${c.latitude.toFixed(3)}, ${c.longitude.toFixed(3)}` : 'Nagpur');

              return `
                <tr>
                  <td data-label="ID"><span style="font-family: monospace; font-weight: 700; color: #2563eb;">#${idShort}</span></td>
                  <td data-label="Category">${catBadge}</td>
                  <td data-label="Location" style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <i data-lucide="map-pin" style="width: 13px; height: 13px; vertical-align: middle; color: #dc2626;"></i>
                    ${Utils.escapeHtml(locationStr)}
                  </td>
                  <td data-label="Status">${statusBadge}</td>
                  <td data-label="Submitted" style="font-size: 0.85rem; color: var(--text-muted);">${dateStr}</td>
                  <td data-label="Action">
                    <a href="tracking.html?id=${c.id}" class="btn btn-sm btn-secondary" style="padding: 4px 10px; font-size: 0.78rem; font-weight: 600;">
                      <i data-lucide="external-link" style="width: 12px; height: 12px;"></i> View Details
                    </a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  setupEventListeners() {
    // Open Edit Modal
    document.addEventListener('click', (e) => {
      const openBtn = e.target.closest('#open-edit-modal-btn');
      if (openBtn) {
        this.openEditModal();
      }

      const closeBtn = e.target.closest('#close-modal-btn') || e.target.closest('#cancel-edit-btn');
      if (closeBtn) {
        this.closeEditModal();
      }
    });

    // Handle Photo Input Preview
    const photoInput = document.getElementById('profile-photo-input');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (file.size > 5 * 1024 * 1024) {
          Utils.showToast('Photo must be less than 5MB', 'error');
          e.target.value = '';
          return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          Utils.showToast('Please select a JPG, PNG, or WEBP image', 'error');
          e.target.value = '';
          return;
        }

        this.selectedPhotoFile = file;

        // Preview
        const previewContainer = document.getElementById('modal-avatar-preview');
        if (previewContainer) {
          const reader = new FileReader();
          reader.onload = (re) => {
            previewContainer.innerHTML = `<img src="${re.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Handle Edit Profile Form Submission
    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSaveProfile();
      });
    }
  },

  openEditModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;

    // Pre-populate
    const nameInput = document.getElementById('edit-full-name');
    const phoneInput = document.getElementById('edit-phone');
    const langSelect = document.getElementById('edit-language');
    const previewContainer = document.getElementById('modal-avatar-preview');
    const statusMsg = document.getElementById('modal-status-msg');

    if (nameInput) nameInput.value = this.user.name || '';
    if (phoneInput) phoneInput.value = this.user.phone || '';
    if (langSelect) langSelect.value = this.user.preferred_language || 'en';

    if (previewContainer) {
      if (this.user.profile_photo_url) {
        previewContainer.innerHTML = `<img src="${Utils.escapeHtml(this.user.profile_photo_url)}" style="width: 100%; height: 100%; object-fit: cover;">`;
      } else {
        const initials = (this.user.name || this.user.email || 'U').substring(0, 2).toUpperCase();
        previewContainer.innerHTML = `<span style="font-size: 1.2rem; font-weight: 700;">${initials}</span>`;
      }
    }

    if (statusMsg) {
      statusMsg.style.display = 'none';
      statusMsg.textContent = '';
    }

    this.selectedPhotoFile = null;
    modal.style.display = 'flex';
  },

  closeEditModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) modal.style.display = 'none';
  },

  async handleSaveProfile() {
    const nameInput = document.getElementById('edit-full-name');
    const phoneInput = document.getElementById('edit-phone');
    const langSelect = document.getElementById('edit-language');
    const saveBtn = document.getElementById('save-profile-btn');
    const saveBtnText = document.getElementById('save-btn-text');
    const statusMsg = document.getElementById('modal-status-msg');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const preferred_language = langSelect ? langSelect.value : 'en';

    if (!name) {
      Utils.showToast('Please enter your full name', 'warning');
      return;
    }

    // Set Saving state
    if (saveBtn) saveBtn.disabled = true;
    if (saveBtnText) saveBtnText.textContent = 'Saving...';
    if (statusMsg) {
      statusMsg.style.display = 'block';
      statusMsg.style.background = '#eff6ff';
      statusMsg.style.color = '#1e40af';
      statusMsg.textContent = 'Saving profile updates to Supabase...';
    }

    try {
      // 1. Upload photo if selected
      if (this.selectedPhotoFile) {
        if (statusMsg) statusMsg.textContent = 'Uploading profile photo to Supabase Storage...';
        const photoResult = await API.uploadProfilePhoto(this.selectedPhotoFile);
        if (photoResult && photoResult.profile_photo_url) {
          this.user.profile_photo_url = photoResult.profile_photo_url;
        }
      }

      // 2. Update profile fields
      if (statusMsg) statusMsg.textContent = 'Persisting profile fields...';
      const updatedUser = await API.updateProfile({
        name,
        phone,
        preferred_language
      });

      if (updatedUser) {
        this.user = { ...this.user, ...updatedUser };
      }

      // Update session
      const session = AuthManager.getSession();
      if (session && session.user) {
        session.user = { ...session.user, ...this.user };
        localStorage.setItem('ns_session', JSON.stringify(session));
      }

      // Update global UI language if changed
      if (preferred_language && typeof Utils !== 'undefined') {
        Utils.setLanguage(preferred_language);
      }

      Utils.showToast('Profile updated successfully!', 'success');
      this.closeEditModal();

      // Refresh UI dynamically without page reload
      this.renderProfile();

      // Re-render header to reflect new name/avatar
      if (typeof App !== 'undefined' && App.renderHeader) {
        App.renderHeader();
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      if (statusMsg) {
        statusMsg.style.background = '#fef2f2';
        statusMsg.style.color = '#991b1b';
        statusMsg.textContent = `Update failed: ${err.message || 'Server error'}`;
      }
      Utils.showToast(`Update failed: ${err.message || 'Please try again.'}`, 'error');
    } finally {
      if (saveBtn) saveBtn.disabled = false;
      if (saveBtnText) saveBtnText.textContent = 'Save Changes';
    }
  },

  renderErrorState(message) {
    const container = document.getElementById('profile-container');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="padding: 48px 24px; text-align: center; max-width: 520px; margin: 40px auto;">
        <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: #dc2626; margin-bottom: 16px;"></i>
        <h2 style="font-size: 1.3rem; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Profile Access Issue</h2>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5;">
          ${Utils.escapeHtml(message)}
        </p>
        <div style="display: flex; justify-content: center; gap: 12px;">
          <a href="login.html" class="btn btn-primary">
            <i data-lucide="log-in"></i> Sign In Again
          </a>
          <a href="citizen.html" class="btn btn-secondary">
            <i data-lucide="home"></i> Home
          </a>
        </div>
      </div>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  }
};

window.ProfileController = ProfileController;
