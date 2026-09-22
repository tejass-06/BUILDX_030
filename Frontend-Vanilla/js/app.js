/**
 * NagarSaathi AI - Global Application Shell
 * Strict Role-Based Navbar Navigation, Header/Footer, Language Switching & System Telemetry.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  init() {
    this.renderHeader();
    this.renderFooter();
    this.setupLanguageSwitcher();
    this.checkSystemHealth();
    this.highlightActiveNav();
  },

  renderHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    const currentLang = typeof Utils !== 'undefined' ? Utils.getLanguage() : 'en';
    const user = typeof AuthManager !== 'undefined' ? AuthManager.getUser() : null;
    const isAuth = !!user;
    const role = (user && user.role ? user.role.toUpperCase() : (isAuth ? 'CITIZEN' : 'GUEST'));

    // Dynamic Role-Based Navigation Links
    let navLinksHtml = '';
    let mobileLinksHtml = '';

    if (role === 'OFFICER') {
      navLinksHtml = `
        <a href="officer.html" class="nav-link" data-page="officer">
          <i data-lucide="briefcase" style="width: 16px; height: 16px;"></i>
          <span>Officer Desk</span>
        </a>
        <a href="tracking.html" class="nav-link" data-page="tracking">
          <i data-lucide="search" style="width: 16px; height: 16px;"></i>
          <span>Track Grievance</span>
        </a>
        <a href="profile.html" class="nav-link" data-page="profile">
          <i data-lucide="user" style="width: 16px; height: 16px;"></i>
          <span>Profile</span>
        </a>
      `;
      mobileLinksHtml = `
        <a href="officer.html" class="mobile-nav-link" data-page="officer">
          <i data-lucide="briefcase"></i> Officer Dashboard
        </a>
        <a href="tracking.html" class="mobile-nav-link" data-page="tracking">
          <i data-lucide="search"></i> Track Grievance
        </a>
        <a href="profile.html" class="mobile-nav-link" data-page="profile">
          <i data-lucide="user"></i> Officer Profile
        </a>
      `;
    } else if (role === 'ADMIN' || role === 'COMMAND_CENTER') {
      navLinksHtml = `
        <a href="command-center.html" class="nav-link" data-page="command-center">
          <i data-lucide="activity" style="width: 16px; height: 16px;"></i>
          <span>Command Center</span>
        </a>
        <a href="officer.html" class="nav-link" data-page="officer">
          <i data-lucide="briefcase" style="width: 16px; height: 16px;"></i>
          <span>Officer Desk</span>
        </a>
        <a href="citizen.html" class="nav-link" data-page="citizen">
          <i data-lucide="home" style="width: 16px; height: 16px;"></i>
          <span>Citizen Portal</span>
        </a>
        <a href="profile.html" class="nav-link" data-page="profile">
          <i data-lucide="user" style="width: 16px; height: 16px;"></i>
          <span>Profile</span>
        </a>
      `;
      mobileLinksHtml = `
        <a href="command-center.html" class="mobile-nav-link" data-page="command-center">
          <i data-lucide="activity"></i> Command Center
        </a>
        <a href="officer.html" class="mobile-nav-link" data-page="officer">
          <i data-lucide="briefcase"></i> Officer Desk
        </a>
        <a href="citizen.html" class="mobile-nav-link" data-page="citizen">
          <i data-lucide="home"></i> Citizen Portal
        </a>
        <a href="profile.html" class="mobile-nav-link" data-page="profile">
          <i data-lucide="user"></i> Admin Profile
        </a>
      `;
    } else {
      // Citizen or Guest Navigation (NEVER expose Officer Desk or Command Center)
      navLinksHtml = `
        <a href="citizen.html" class="nav-link" data-page="citizen">
          <i data-lucide="home" style="width: 16px; height: 16px;"></i>
          <span data-i18n="citizen_home">Citizen Home</span>
        </a>
        <a href="report.html" class="nav-link" data-page="report">
          <i data-lucide="plus-circle" style="width: 16px; height: 16px;"></i>
          <span data-i18n="report_problem">Report Problem</span>
        </a>
        <a href="tracking.html" class="nav-link" data-page="tracking">
          <i data-lucide="search" style="width: 16px; height: 16px;"></i>
          <span data-i18n="track_status">Track Status</span>
        </a>
        ${isAuth ? `
        <a href="profile.html" class="nav-link" data-page="profile">
          <i data-lucide="user" style="width: 16px; height: 16px;"></i>
          <span>Profile</span>
        </a>
        ` : ''}
      `;
      mobileLinksHtml = `
        <a href="citizen.html" class="mobile-nav-link" data-page="citizen">
          <i data-lucide="home"></i> <span data-i18n="citizen_home">Citizen Home</span>
        </a>
        <a href="report.html" class="mobile-nav-link" data-page="report">
          <i data-lucide="plus-circle"></i> <span data-i18n="report_problem">Report Problem</span>
        </a>
        <a href="tracking.html" class="mobile-nav-link" data-page="tracking">
          <i data-lucide="search"></i> <span data-i18n="track_status">Track Status</span>
        </a>
        ${isAuth ? `
        <a href="profile.html" class="mobile-nav-link" data-page="profile">
          <i data-lucide="user"></i> <span>Profile</span>
        </a>
        ` : ''}
      `;
    }

    headerContainer.innerHTML = `
      <header class="navbar">
        <div class="navbar-container">
          <a href="${isAuth ? (role === 'OFFICER' ? 'officer.html' : (role === 'ADMIN' ? 'command-center.html' : 'citizen.html')) : 'index.html'}" class="brand">
            <div class="brand-logo-icon">
              <i data-lucide="shield-check" style="width: 20px; height: 20px;"></i>
            </div>
            <div class="brand-text">
              <span class="brand-name">NagarSaathi</span>
              <span class="brand-subtitle">AI Civic Governance • Nagpur</span>
            </div>
          </a>

          <nav class="nav-links" id="nav-links">
            ${navLinksHtml}
          </nav>

          <div class="nav-actions">
            <!-- Language Switcher -->
            <div class="lang-switch" id="lang-switch-group">
              <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
              <button class="lang-btn ${currentLang === 'mr' ? 'active' : ''}" data-lang="mr">मराठी</button>
              <button class="lang-btn ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi">हिंदी</button>
            </div>

            <!-- Auth Status Widget -->
            <div class="auth-widget" id="nav-auth-widget">
              ${isAuth ? `
                <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem;">
                  <a href="profile.html" style="text-decoration: none; color: inherit; display: inline-flex; align-items: center; gap: 6px;" title="View Profile">
                    <span style="font-weight: 700; color: #1e293b; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      ${Utils.escapeHtml(user.name || user.email)}
                    </span>
                    <span class="badge ${role === 'OFFICER' ? 'badge-warning' : (role === 'ADMIN' || role === 'COMMAND_CENTER' ? 'badge-danger' : 'badge-primary')}" style="font-size: 0.68rem; padding: 2px 6px;">
                      ${role}
                    </span>
                  </a>
                  <button type="button" class="btn btn-sm btn-secondary" onclick="AuthManager.logout()" title="Sign Out" style="padding: 4px 8px; font-size: 0.75rem;">
                    <i data-lucide="log-out" style="width: 13px; height: 13px;"></i>
                  </button>
                </div>
              ` : `
                <a href="login.html" class="btn btn-sm btn-secondary" style="padding: 5px 12px; font-size: 0.8rem; font-weight: 600;">
                  <i data-lucide="log-in" style="width: 14px; height: 14px;"></i> Sign In
                </a>
              `}
            </div>

            <!-- Health Indicator -->
            <div class="status-indicator" id="system-status-indicator" title="Backend Server Status">
              <span class="status-dot"></span>
              <span class="status-text" id="system-status-text">Connecting...</span>
            </div>

            <!-- Mobile Menu Toggle Button -->
            <button class="mobile-nav-toggle" id="mobile-nav-toggle" aria-label="Toggle Navigation Menu">
              <i data-lucide="menu" style="width: 22px; height: 22px;"></i>
            </button>
          </div>
        </div>

        <!-- Mobile Drawer Navigation -->
        <div class="mobile-nav-drawer" id="mobile-nav-drawer">
          <div class="mobile-nav-header">
            <div class="mobile-nav-user">
              ${isAuth ? `
                <div style="font-weight: 700; color: #1e293b;">${Utils.escapeHtml(user.name || user.email)}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                  <span class="badge ${role === 'OFFICER' ? 'badge-warning' : (role === 'ADMIN' || role === 'COMMAND_CENTER' ? 'badge-danger' : 'badge-primary')}" style="font-size: 0.65rem; padding: 1px 6px;">${role}</span>
                  ${user.email ? `<span>${Utils.escapeHtml(user.email)}</span>` : ''}
                </div>
              ` : `
                <div style="font-weight: 700; color: #1e293b;">Welcome to NagarSaathi</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Please sign in to report and track issues</div>
              `}
            </div>
            <button class="mobile-nav-close" id="mobile-nav-close" aria-label="Close Navigation Menu">
              <i data-lucide="x" style="width: 20px; height: 20px;"></i>
            </button>
          </div>

          <div class="mobile-nav-body">
            ${mobileLinksHtml}

            <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
              ${isAuth ? `
                <button type="button" class="btn btn-secondary w-full" onclick="AuthManager.logout()" style="justify-content: center; gap: 8px;">
                  <i data-lucide="log-out" style="width: 16px; height: 16px;"></i> Sign Out
                </button>
              ` : `
                <a href="login.html" class="btn btn-primary w-full" style="justify-content: center; gap: 8px;">
                  <i data-lucide="log-in" style="width: 16px; height: 16px;"></i> Sign In / Register
                </a>
              `}
            </div>
          </div>
        </div>
      </header>
    `;

    this.setupMobileMenu();

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const closeBtn = document.getElementById('mobile-nav-close');
    const drawer = document.getElementById('mobile-nav-drawer');

    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('active');
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('active');
      });
    }

    // Close on navigation link click
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('active');
      });
    });
  },

  renderFooter() {
    const footerContainer = document.getElementById('app-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1.1rem; color: #1e293b; margin-bottom: 8px;">
                <div style="background: var(--primary-color); color: white; width: 28px; height: 28px; border-radius: 6px; display: grid; place-items: center;">
                  <i data-lucide="shield-check" style="width: 16px; height: 16px;"></i>
                </div>
                NagarSaathi AI
              </div>
              <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.5;">
                AI-Powered Multilingual Civic Grievance & Infrastructure Redressal Engine for Nagpur Municipal Corporation (NMC).
              </p>
            </div>

            <div>
              <h4 style="font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Portals</h4>
              <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
                <li><a href="citizen.html" style="color: var(--text-muted); text-decoration: none;">Citizen Grievance Redressal</a></li>
                <li><a href="report.html" style="color: var(--text-muted); text-decoration: none;">Voice & Multimodal Reporting</a></li>
                <li><a href="tracking.html" style="color: var(--text-muted); text-decoration: none;">Live Grievance Tracking</a></li>
              </ul>
            </div>

            <div>
              <h4 style="font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Supported Languages</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px;">
                मराठी (Marathi), हिंदी (Hindi), English & Hinglish/Mar-Eng dialect recognition.
              </p>
              <div style="font-size: 0.8rem; color: var(--text-muted);">
                SLA Compliance: 24h - 48h Resolution Standard
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <div>© ${new Date().getFullYear()} NagarSaathi AI • Nagpur Smart City Mission</div>
            <div>Production Vanilla Frontend • Zero External UI Framework Dependency</div>
          </div>
        </div>
      </footer>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  setupLanguageSwitcher() {
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.target.dataset.lang;
        if (typeof Utils !== 'undefined') {
          Utils.setLanguage(lang);
          buttons.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
          this.applyTranslations();
        }
      });
    });
  },

  applyTranslations() {
    if (typeof Utils === 'undefined') return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const trans = Utils.t(key);
      if (trans && trans !== key) {
        el.textContent = trans;
      }
    });
  },

  async checkSystemHealth() {
    const indicator = document.getElementById('system-status-indicator');
    const text = document.getElementById('system-status-text');
    if (!indicator || !text) return;

    try {
      if (typeof API !== 'undefined') {
        const health = await API.getHealth();
        if (health.status === 'healthy' || health.status === 'ok') {
          indicator.className = 'status-indicator online';
          text.textContent = 'NMC Live';
        } else {
          indicator.className = 'status-indicator offline';
          text.textContent = 'Degraded';
        }
      }
    } catch {
      indicator.className = 'status-indicator offline';
      text.textContent = 'Offline';
    }
  },

  highlightActiveNav() {
    const currentPath = window.location.pathname;
    const page = currentPath.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === page || (page === '' && href === 'index.html'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};

window.App = App;
