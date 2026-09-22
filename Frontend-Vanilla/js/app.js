/**
 * NagarSaathi AI - Global Application Shell
 * Manages unified header/footer, language switching, role navigation, and system status.
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

    const currentLang = Utils.getLanguage();
    const userRole = Utils.getAuthRole() || 'citizen';

    headerContainer.innerHTML = `
      <header class="navbar">
        <div class="navbar-container">
          <a href="index.html" class="brand">
            <div class="brand-logo">
              <i data-lucide="shield-check"></i>
            </div>
            <div class="brand-text">
              <span>NagarSaathi</span>
              <span class="brand-subtitle">AI Civic Governance • Nagpur</span>
            </div>
          </a>

          <nav class="nav-links" id="nav-links">
            <a href="citizen.html" class="nav-link" data-page="citizen">
              <i data-lucide="home"></i>
              <span data-i18n="citizen_home">Citizen Portal</span>
            </a>
            <a href="report.html" class="nav-link" data-page="report">
              <i data-lucide="plus-circle"></i>
              <span data-i18n="report_problem">Report Problem</span>
            </a>
            <a href="tracking.html" class="nav-link" data-page="tracking">
              <i data-lucide="search"></i>
              <span data-i18n="track_status">Track Status</span>
            </a>
            <a href="officer.html" class="nav-link" data-page="officer">
              <i data-lucide="briefcase"></i>
              <span>Officer Desk</span>
            </a>
            <a href="command-center.html" class="nav-link" data-page="command-center">
              <i data-lucide="activity"></i>
              <span>Command Center</span>
            </a>
          </nav>

          <div class="nav-actions">
            <!-- Language Switcher -->
            <div class="lang-switch" id="lang-switch-group">
              <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
              <button class="lang-btn ${currentLang === 'mr' ? 'active' : ''}" data-lang="mr">मराठी</button>
              <button class="lang-btn ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi">हिंदी</button>
            </div>

            <!-- Health Indicator -->
            <div class="status-indicator" id="system-status-indicator" title="Backend Server Status">
              <span class="status-dot"></span>
              <span class="status-text" id="system-status-text">Connecting...</span>
            </div>
          </div>
        </div>
      </header>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
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
                <li><a href="officer.html" style="color: var(--text-muted); text-decoration: none;">NMC Officer Resolution Workspace</a></li>
                <li><a href="command-center.html" style="color: var(--text-muted); text-decoration: none;">Citywide Command & Analytics</a></li>
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
            <div>Official Fallback Production Frontend • Zero Dependency Vanilla Stack</div>
          </div>
        </div>
      </footer>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  setupLanguageSwitcher() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.lang-btn');
      if (btn && btn.dataset.lang) {
        const lang = btn.dataset.lang;
        Utils.setLanguage(lang);

        document.querySelectorAll('.lang-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.lang === lang);
        });

        // Trigger i18n update on all [data-i18n] elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.dataset.i18n;
          const translated = Utils.t(key);
          if (translated) el.textContent = translated;
        });

        Utils.showToast(`Language switched to ${lang.toUpperCase()}`, 'info');
      }
    });
  },

  async checkSystemHealth() {
    const dot = document.querySelector('.status-dot');
    const text = document.getElementById('system-status-text');
    if (!dot || !text) return;

    try {
      const health = await API.getHealth();
      if (health && health.status === 'healthy') {
        dot.style.background = '#10b981';
        text.textContent = 'Backend Online';
      } else {
        dot.style.background = '#f59e0b';
        text.textContent = 'Backend Degraded';
      }
    } catch (e) {
      dot.style.background = '#ef4444';
      text.textContent = 'Offline (127.0.0.1:8000)';
    }
  },

  highlightActiveNav() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';

    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.page === page || (page === 'index' && link.dataset.page === 'citizen')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};

window.App = App;
