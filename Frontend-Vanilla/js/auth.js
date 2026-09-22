/**
 * NagarSaathi AI - Centralized Authentication & Session Management
 * Strict Role-Based Access Control (RBAC):
 * Roles: CITIZEN, OFFICER, COMMAND_CENTER / ADMIN
 */

class AuthManager {
  static TOKEN_KEY = 'nagarsaathi_access_token';
  static USER_KEY = 'nagarsaathi_user';

  /**
   * Determine primary dashboard URL based on role
   */
  static getRoleDashboardUrl(role) {
    const r = (role || '').toUpperCase().trim();
    if (r === 'OFFICER') return 'officer.html';
    if (r === 'ADMIN' || r === 'COMMAND_CENTER') return 'command-center.html';
    return 'citizen.html';
  }

  /**
   * Register a new Citizen or submit an Officer Registration Request
   */
  static async signup(data) {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      password: data.password,
      role: data.role || 'CITIZEN',
      department_code: data.department_code || null,
      zone: data.zone || 'North Zone',
      designation: data.designation || 'Junior Engineer',
      employee_id: data.employee_id || null
    };

    const response = await fetch(`${window.NAGARSAATHI_CONFIG.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || 'Registration failed');
    }

    // If citizen and active token returned, save session
    if (result.access_token && result.access_token !== 'PENDING_ADMIN_APPROVAL') {
      this.setSession(result.access_token, result.user);
    }

    return result;
  }

  /**
   * Authenticate User (Citizen, Officer, or Admin)
   */
  static async login(email, password) {
    const response = await fetch(`${window.NAGARSAATHI_CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || 'Invalid email or password');
    }

    this.setSession(result.access_token, result.user);
    return result;
  }

  /**
   * Store token and profile safely
   */
  static setSession(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get currently stored JWT access token
   */
  static getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get currently authenticated user object
   */
  static getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is currently logged in
   */
  static isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Get user role (CITIZEN, OFFICER, ADMIN, COMMAND_CENTER)
   */
  static getRole() {
    const user = this.getUser();
    return user ? (user.role || 'CITIZEN').toUpperCase() : null;
  }

  /**
   * Invalidate local session and redirect
   */
  static logout(redirectUrl = 'login.html') {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = redirectUrl;
  }

  /**
   * If user is already authenticated on auth pages (login/signup), redirect to their role dashboard
   */
  static redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      const role = this.getRole();
      window.location.href = this.getRoleDashboardUrl(role);
      return true;
    }
    return false;
  }

  /**
   * Route Guard: Enforce authentication and role permissions
   */
  static requireAuth(allowedRoles = []) {
    if (!this.isAuthenticated()) {
      const currentUrl = encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
      window.location.href = `login.html?redirect=${currentUrl}`;
      return false;
    }

    if (allowedRoles.length > 0) {
      const currentRole = this.getRole();
      const rolesUpper = allowedRoles.map(r => r.toUpperCase());
      const hasPermission = rolesUpper.includes(currentRole) || currentRole === 'ADMIN';

      if (!hasPermission) {
        console.warn(`[RBAC] Access Denied: User role ${currentRole} cannot access this resource.`);
        // Redirect directly to their own dashboard
        window.location.href = this.getRoleDashboardUrl(currentRole);
        return false;
      }
    }

    return true;
  }

  /**
   * Fetch live profile from backend /auth/me
   */
  static async fetchCurrentProfile() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${window.NAGARSAATHI_CONFIG.API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const user = await response.json();
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        return user;
      } else if (response.status === 401) {
        this.logout();
      }
    } catch (e) {
      console.warn('Profile fetch error:', e);
    }
    return this.getUser();
  }

  // ================= ADMIN OFFICER APPROVAL API WRAPPERS =================

  static async getPendingOfficerRequests() {
    const token = this.getToken();
    const response = await fetch(`${window.NAGARSAATHI_CONFIG.API_BASE_URL}/auth/officer-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to fetch pending officer requests');
    }
    return await response.json();
  }

  static async approveOfficerRequest(userId) {
    const token = this.getToken();
    const response = await fetch(`${window.NAGARSAATHI_CONFIG.API_BASE_URL}/auth/officer-requests/${userId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to approve officer');
    }
    return await response.json();
  }

  static async rejectOfficerRequest(userId) {
    const token = this.getToken();
    const response = await fetch(`${window.NAGARSAATHI_CONFIG.API_BASE_URL}/auth/officer-requests/${userId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to reject officer');
    }
    return await response.json();
  }
}

window.AuthManager = AuthManager;
