import { isLoggedIn } from '../../data/api';
import LoginPresenter from './login-presenter';

export default class LoginPage {
  async render() {
    if (isLoggedIn()) {
      window.location.hash = '#/';
      return '';
    }

    return `
      <section class="container fade-in">
        <div class="skip-link">
          <a href="#content" class="skip-to-content">Skip to content</a>
        </div>
        <div class="navigation-back">
          
            
          </a>
        </div>

        <div class="auth-form">
          <h1 id="content" tabindex="0">Masuk</h1>
          
          <form id="login-form">
            <div class="form-group">
              <label for="email"> Alamat Email</label>
              <input type="email" id="email" name="email" required placeholder="Masukkan email Anda" autocomplete="email">
            </div>

            <div class="form-group">
              <label for="password"> Kata sandi</label>
              <input type="password" id="password" name="password" required placeholder="Masukkan Kata sandi Anda" autocomplete="current-password">
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary login-btn">
                <i class="fas fa-sign-in-alt"></i> Masuk
              </button>
            </div>
          </form>

          <div class="auth-links">
            <p> Belum punya akun? <a href="#/register">Daftar di sini</a></p>
          </div>

          <div id="login-status" class="status-message"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._presenter = new LoginPresenter({ view: this });
    this._initLoginForm();
    this._updateAuthUI();
  }

  _initLoginForm() {
    const form = document.getElementById('login-form');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      this._presenter.handleLogin(email, password);
    });
  }

  showLoading(message) {
    document.getElementById('login-status').innerHTML = `
      <div class="loading-indicator">
        <div class="loading-spinner"></div>
        <span>${message}</span>
      </div>
    `;
  }

  showError(message) {
    document.getElementById('login-status').innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i> ${message}
      </div>
    `;
  }

  showSuccess(message) {
    document.getElementById('login-status').innerHTML = `
      <div class="success-message">
        <i class="fas fa-check-circle"></i> ${message}
      </div>
    `;
  }

  _updateAuthUI() {
    const loginMenuItems = document.querySelectorAll('.login-menu');
    const registerMenuItems = document.querySelectorAll('.register-menu');
    const logoutMenuItem = document.querySelector('.logout-menu');
    const userInfoElement = document.getElementById('user-info');

    if (logoutMenuItem) logoutMenuItem.style.display = 'none';
    loginMenuItems.forEach(item => item.style.display = 'block');
    registerMenuItems.forEach(item => item.style.display = 'block');
    if (userInfoElement) userInfoElement.style.display = 'none';
  }
}
