/**
 * NAGARSAATHI AI — PRODUCTION UTILITIES & DESIGN HELPERS
 * Centralized formatting, badges, multilingual translations, and UI helpers.
 */

const Utils = {
  // =========================================================================
  // HTML SANITIZATION & SAFE STRINGS
  // =========================================================================
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  safeString(val, fallback = '') {
    if (val === null || val === undefined) return fallback;
    return String(val);
  },

  formatComplaintId(complaintOrId) {
    if (complaintOrId === null || complaintOrId === undefined) return '—';
    if (typeof complaintOrId === 'object') {
      if (complaintOrId.public_id) return String(complaintOrId.public_id);
      if (complaintOrId.complaint_id) return String(complaintOrId.complaint_id);
      if (complaintOrId.id != null) {
        const idStr = String(complaintOrId.id);
        return idStr.startsWith('NS-') ? idStr : (idStr.length > 8 ? '#' + idStr.substring(0, 8) : '#' + idStr);
      }
      return '—';
    }
    const val = String(complaintOrId);
    if (!val || val === 'undefined' || val === 'null') return '—';
    if (val.startsWith('NS-')) return val;
    return val.length > 8 ? '#' + val.substring(0, 8) : '#' + val;
  },

  // =========================================================================
  // CATEGORY BADGE HELPER
  // =========================================================================
  getCategoryBadge(category) {
    if (!category) {
      return '<span class="badge badge-submitted">Other</span>';
    }

    const cat = String(category).toUpperCase().trim();
    let label = cat.replace(/_/g, ' ');
    let cls = 'badge-submitted';

    if (cat.includes('WATER') || cat.includes('LEAK')) {
      label = 'Water Leakage';
      cls = 'badge-assigned';
    } else if (cat.includes('POTHOLE') || cat.includes('ROAD')) {
      label = 'Pothole / Road';
      cls = 'badge-high';
    } else if (cat.includes('GARBAGE') || cat.includes('WASTE') || cat.includes('SANITATION')) {
      label = 'Garbage & Waste';
      cls = 'badge-resolved';
    } else if (cat.includes('DRAIN') || cat.includes('SEWER')) {
      label = 'Drainage / Sewage';
      cls = 'badge-citizen_verification';
    } else if (cat.includes('STREETLIGHT') || cat.includes('LIGHT')) {
      label = 'Streetlight';
      cls = 'badge-in_progress';
    } else if (cat.includes('ELECTRIC') || cat.includes('POWER')) {
      label = 'Electricity Hazard';
      cls = 'badge-critical';
    } else if (cat === 'OTHER') {
      label = 'Other Civic Issue';
      cls = 'badge-submitted';
    } else {
      label = cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      cls = 'badge-submitted';
    }

    return `<span class="badge ${cls}">${this.escapeHtml(label)}</span>`;
  },

  formatCategory(cat) {
    if (!cat) return 'Other';
    return String(cat).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  },

  // =========================================================================
  // PRIORITY & SEVERITY BADGES
  // =========================================================================
  getPriorityBadge(priority) {
    if (!priority) {
      return '<span class="badge badge-medium">MEDIUM</span>';
    }

    const p = String(priority).toUpperCase().trim();
    let cls = 'badge-medium';
    let label = p;

    if (p === 'CRITICAL' || p === 'P1' || p === 'URGENT') {
      cls = 'badge-critical';
      label = 'CRITICAL';
    } else if (p === 'HIGH' || p === 'P2') {
      cls = 'badge-high';
      label = 'HIGH';
    } else if (p === 'MEDIUM' || p === 'NORMAL' || p === 'P3') {
      cls = 'badge-medium';
      label = 'MEDIUM';
    } else if (p === 'LOW' || p === 'P4') {
      cls = 'badge-low';
      label = 'LOW';
    }

    return `<span class="badge ${cls}">${this.escapeHtml(label)}</span>`;
  },

  renderPriorityBadge(priority) {
    return this.getPriorityBadge(priority);
  },

  // =========================================================================
  // STATUS BADGES
  // =========================================================================
  getStatusBadge(status) {
    if (!status) {
      return '<span class="badge badge-submitted">SUBMITTED</span>';
    }

    const s = String(status).toUpperCase().trim();
    let cls = 'badge-submitted';
    let label = s.replace(/_/g, ' ');

    switch (s) {
      case 'SUBMITTED':
      case 'PENDING':
        cls = 'badge-submitted';
        label = 'Pending / Registered';
        break;
      case 'AI_CLASSIFIED':
        cls = 'badge-assigned';
        label = 'AI Classified';
        break;
      case 'ASSIGNED':
        cls = 'badge-assigned';
        label = 'Assigned';
        break;
      case 'IN_PROGRESS':
        cls = 'badge-in_progress';
        label = 'In Progress';
        break;
      case 'RESOLVED':
        cls = 'badge-resolved';
        label = 'Resolved';
        break;
      case 'CITIZEN_VERIFICATION':
      case 'VERIFIED':
        cls = 'badge-citizen_verification';
        label = 'Verified';
        break;
      case 'CLOSED':
        cls = 'badge-closed';
        label = 'Closed';
        break;
      case 'REOPENED':
        cls = 'badge-reopened';
        label = 'Reopened';
        break;
      default:
        cls = 'badge-submitted';
    }

    return `<span class="badge ${cls}">${this.escapeHtml(label)}</span>`;
  },

  renderStatusBadge(status) {
    return this.getStatusBadge(status);
  },

  // =========================================================================
  // SLA COUNTDOWN & BADGES
  // =========================================================================
  getSlaBadge(deadlineStr, status) {
    const timer = this.computeSLATimer(deadlineStr, status);
    return `<span class="badge ${timer.className}">${this.escapeHtml(timer.text)}</span>`;
  },

  computeSLATimer(deadlineStr, status) {
    const s = (status || '').toUpperCase();
    if (['RESOLVED', 'CLOSED', 'VERIFIED'].includes(s)) {
      return { text: '✓ SLA Met', className: 'badge-resolved', overdue: false };
    }
    if (!deadlineStr) {
      return { text: '24h SLA Standard', className: 'badge-submitted', overdue: false };
    }

    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline - now;

    if (diffMs <= 0) {
      const overdueHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
      return {
        text: `⚠️ Overdue ${overdueHours}h`,
        className: 'badge-reopened',
        overdue: true
      };
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let className = 'badge-assigned';
    if (hours < 6) className = 'badge-in_progress';

    return {
      text: `⏱️ ${hours}h ${mins}m remaining`,
      className: className,
      overdue: false
    };
  },

  // =========================================================================
  // DATE FORMATTING
  // =========================================================================
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateStr);
    }
  },

  formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now - d) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return '';
    }
  },

  // =========================================================================
  // WHATSAPP FREE DEEP-LINK
  // =========================================================================
  generateWhatsAppUrl(complaint) {
    if (!complaint) return 'https://wa.me/';
    const id = complaint.public_id || complaint.id || '';
    const formattedId = this.formatComplaintId(complaint);
    const title = complaint.title || (complaint.description ? String(complaint.description).substring(0, 50) : 'Civic Issue');
    const status = complaint.status || 'SUBMITTED';
    const location = complaint.address || complaint.zone || 'Nagpur';

    const message = `*NagarSaathi Civic Update*\nTicket ID: ${formattedId}\nProblem: ${title}\nStatus: ${status}\nLocation: ${location}\nTrack Live: ${window.location.origin}/tracking.html?id=${encodeURIComponent(id)}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  },

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger' || type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `<span style="font-size: 1.1rem;">${icon}</span> <span style="font-size: 0.875rem; font-weight: 500;">${this.escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // =========================================================================
  // MULTILINGUAL STRINGS & PREFERENCES
  // =========================================================================
  translations: {
    en: {
      citizen_home: "Citizen Portal",
      report_problem: "Report Problem",
      track_status: "Track Status",
      listening: "Listening... Speak naturally in Marathi, Hindi, or English",
      start_speaking: "Start Speaking",
      stop_speaking: "Stop Speaking"
    },
    mr: {
      citizen_home: "नागरिक पोर्टल",
      report_problem: "तक्रार नोंदवा",
      track_status: "स्थिती तपासा",
      listening: "ऐकत आहे... मराठी, हिंदी किंवा इंग्रजीत बोला",
      start_speaking: "बोलायला सुरुवात करा",
      stop_speaking: "थांबवा"
    },
    hi: {
      citizen_home: "नागरिक पोर्टल",
      report_problem: "शिकायत दर्ज करें",
      track_status: "स्थिति देखें",
      listening: "सुन रहे हैं... मराठी, हिंदी या अंग्रेजी में बोलें",
      start_speaking: "बोलना शुरू करें",
      stop_speaking: "रोकें"
    }
  },

  getLanguage() {
    return localStorage.getItem('ns_lang') || 'en';
  },

  setLanguage(lang) {
    localStorage.setItem('ns_lang', lang);
  },

  t(key) {
    const lang = this.getLanguage();
    return (this.translations[lang] && this.translations[lang][key]) || (this.translations.en && this.translations.en[key]) || key;
  },

  // =========================================================================
  // LEGACY AUTH HELPERS (Backwards compatibility)
  // =========================================================================
  getAuthToken() {
    return localStorage.getItem('nagarsaathi_access_token') || localStorage.getItem('ns_token') || null;
  },

  setAuthToken(token, user) {
    if (token) {
      localStorage.setItem('nagarsaathi_access_token', token);
      localStorage.setItem('ns_token', token);
    }
    if (user) {
      localStorage.setItem('nagarsaathi_user', JSON.stringify(user));
      localStorage.setItem('ns_user', JSON.stringify(user));
    }
  },

  getAuthRole() {
    const raw = localStorage.getItem('nagarsaathi_user') || localStorage.getItem('ns_user');
    if (!raw) return 'citizen';
    try {
      const u = JSON.parse(raw);
      return (u.role || 'citizen').toLowerCase();
    } catch {
      return 'citizen';
    }
  }
};

window.Utils = Utils;
