/**
 * app.js — Main application controller
 */
const Toast = {
  show: (message, type = 'info', duration = 3500) => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration + 400);
  }
};

const App = {
  currentView: 'editor',

  init() {
    // Check existing session
    if (Auth.isLoggedIn()) {
      this.showApp();
    } else {
      this.showAuth();
    }

    // Auth form handlers
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const result = Auth.login(
        document.getElementById('loginEmail').value,
        document.getElementById('loginPassword').value
      );
      if (result.ok) { this.showApp(); }
      else { Toast.show(result.error, 'error'); }
    });

    document.getElementById('registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const result = Auth.register(
        document.getElementById('regName').value,
        document.getElementById('regEmail').value,
        document.getElementById('regPassword').value
      );
      if (result.ok) { this.showApp(); }
      else { Toast.show(result.error, 'error'); }
    });

    // Auth tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
      });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      Auth.logout();
      this.showAuth();
      Toast.show('Signed out', 'info');
    });

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setView(btn.dataset.view));
    });
  },

  showAuth() {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('authModal').classList.add('active');
  },

  showApp() {
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('app').classList.remove('hidden');
    const user = Auth.getUser();
    if (user) {
      document.getElementById('userName').textContent = user.name;
      document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
      document.getElementById('userCredits').textContent = user.credits;
    }
    // Init canvas after DOM is visible
    setTimeout(() => {
      CanvasManager.init();
      CanvasManager.fitToView();
    }, 100);
  },

  setView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(viewName + 'View')?.classList.add('active');
    document.querySelector(`.nav-btn[data-view="${viewName}"]`)?.classList.add('active');
    this.currentView = viewName;
    if (viewName === 'projects') Projects.renderProjects();
    if (viewName === 'gallery') Projects.renderGallery();
  }
};

// Bootstrap
document.addEventListener('DOMContentLoaded', () => App.init());
