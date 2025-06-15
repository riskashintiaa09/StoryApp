import { isLoggedIn } from '../../data/api';
import RegisterPresenter from './register-presenter';

export default class RegisterPage {
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
          <a href="#/" class="back-link">
           
          </a>
        </div>

        <div class="auth-form">
          <h1 id="content" tabindex="0">Daftar Akun</h1>
          

          <form id="register-form">
            <div class="form-group">
              <label for="name"> Nama Lengkap</label>
              <input type="text" id="name" name="name" required placeholder="Masukkan nama lengkap Anda" autocomplete="name">
            </div>

            <div class="form-group">
              <label for="email"> Alamat Email</label>
              <input type="email" id="email" name="email" required placeholder="Masukkan Alamat Email Anda" autocomplete="email">
            </div>

            <div class="form-group">
              <label for="password"> Kata Sandi</label>
              <input type="password" id="password" name="password" required minlength="6" placeholder="Buat kata sandi (min. 6 karakter)" autocomplete="new-password">
              <p class="password-hint">Kata sandi harus minimal 6 karakter</p>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary register-btn">
                <i class="fas fa-user-plus"></i> Daftar Akun
              </button>
            </div>
          </form>

          <div class="auth-links">
            <p>Sudah punya akun? <a href="#/login">Masuk di sini</a></p>
          </div>

          <div id="register-status" class="status-message"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._presenter = new RegisterPresenter({ view: this });
    this._initRegisterForm();
    this._updateAuthUI();
  }

  _initRegisterForm() {
    const form = document.getElementById('register-form');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      this._presenter.handleRegister(name, email, password);
    });
  }

  showLoading(message) {
    document.getElementById('register-status').innerHTML = `
      <div class="loading-indicator">
        <div class="loading-spinner"></div>
        <span>${message}</span>
      </div>
    `;
  }

  showError(message) {
    document.getElementById('register-status').innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i> ${message}
      </div>
    `;
  }

  showSuccess(message) {
    document.getElementById('register-status').innerHTML = `
      <div class="success-message">
        <i class="fas fa-check-circle"></i> ${message}
      </div>
    `;
  }

  resetForm() {
    const form = document.getElementById('register-form');
    if (form) form.reset();
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