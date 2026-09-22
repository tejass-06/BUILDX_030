/**
 * NAGARSAATHI AI — UTILITIES & HELPERS
 */

const Utils = {
  // Session / Token Management
  getAuthToken() {
    return localStorage.getItem("ns_token") || null;
  },

  setAuthToken(token, user) {
    if (token) localStorage.setItem("ns_token", token);
    if (user) localStorage.setItem("ns_user", JSON.stringify(user));
  },

  getCurrentUser() {
    const raw = localStorage.getItem("ns_user");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearAuth() {
    localStorage.removeItem("ns_token");
    localStorage.removeItem("ns_user");
  },

  // Toast Notifications
  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "⚠️";

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // Date Formatting
  formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  },

  // Format Relative Time
  formatTimeAgo(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  },

  // SLA Countdown & Status
  computeSLATimer(deadlineStr, status) {
    if (["RESOLVED", "CLOSED"].includes(status)) {
      return { text: "Completed", className: "badge-closed", overdue: false };
    }
    if (!deadlineStr) return { text: "24h SLA", className: "badge-submitted", overdue: false };

    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline - now;

    if (diffMs <= 0) {
      const overdueHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
      return {
        text: `Overdue by ${overdueHours}h`,
        className: "badge-reopened",
        overdue: true
      };
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let className = "badge-assigned";
    if (hours < 4) className = "badge-in_progress";

    return {
      text: `${hours}h ${mins}m left`,
      className: className,
      overdue: false
    };
  },

  // Status Badge HTML
  renderStatusBadge(status) {
    const s = (status || "SUBMITTED").toUpperCase();
    const label = s.replace(/_/g, " ");
    const cls = `badge-${s.toLowerCase()}`;
    return `<span class="badge ${cls}">${label}</span>`;
  },

  // Priority / Severity Badge HTML
  renderPriorityBadge(priority) {
    const p = (priority || "MEDIUM").toUpperCase();
    const cls = `badge-${p.toLowerCase()}`;
    return `<span class="badge ${cls}">${p}</span>`;
  },

  // Clean Category Label
  formatCategory(cat) {
    if (!cat) return "Other";
    return cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  },

  // Multilingual Strings
  translations: {
    en: {
      hero_title: "Smarter Citizens. Cleaner Cities. A Better Nagpur.",
      hero_sub: "AI-Powered Civic Redressal, Multi-Signal Routing, and Transparent SLA Governance.",
      btn_report: "Report a Civic Problem",
      btn_my_complaints: "My Complaints",
      btn_map: "City Hotspot Map",
      recent_title: "Recent Grievances in Nagpur",
      listening: "Listening... Speak naturally in Marathi, Hindi, or English",
      start_speaking: "Start Speaking",
      stop_speaking: "Stop Speaking"
    },
    mr: {
      hero_title: "स्मार्ट नागरिक. स्वच्छ शहर. सुंदर नागपूर.",
      hero_sub: "कृत्रिम बुद्धिमत्ता आधारित तक्रार निवारण आणि जलद पालिका प्रशासन.",
      btn_report: "नागरी समस्या नोंदवा",
      btn_my_complaints: "माझ्या तक्रारी",
      btn_map: "शहर नकाशा",
      recent_title: "नागपुरातील ताज्या नागरी तक्रारी",
      listening: "ऐकत आहे... मराठी, हिंदी किंवा इंग्रजीत बोला",
      start_speaking: "बोलायला सुरुवात करा",
      stop_speaking: "थांबवा"
    },
    hi: {
      hero_title: "स्मार्ट नागरिक. स्वच्छ शहर. बेहतर नागपुर.",
      hero_sub: "एआई संचालित नागरिक शिकायत निवारण और पारदर्शी नगरपालिका शासन.",
      btn_report: "समस्या दर्ज करें",
      btn_my_complaints: "मेरी शिकायतें",
      btn_map: "शहर का नक्शा",
      recent_title: "नागपुर में हालिया शिकायतें",
      listening: "सुन रहे हैं... मराठी, हिंदी या अंग्रेजी में बोलें",
      start_speaking: "बोलना शुरू करें",
      stop_speaking: "रोकें"
    }
  },

  getLanguage() {
    return localStorage.getItem("ns_lang") || "en";
  },

  setLanguage(lang) {
    localStorage.setItem("ns_lang", lang);
  },

  t(key) {
    const lang = this.getLanguage();
    return (this.translations[lang] && this.translations[lang][key]) || this.translations.en[key] || key;
  }
};

window.Utils = Utils;
