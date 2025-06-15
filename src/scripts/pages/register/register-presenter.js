import { register } from '../../data/api';

export default class RegisterPresenter {
  constructor({ view }) {
    this.view = view;
  }

  async handleRegister(name, email, password) {
    if (!name || !email || !password) {
      this.view.showError('Harap isi semua kolom');
      return;
    }

    if (password.length < 6) {
      this.view.showError('Kata sandi harus minimal 6 karakter');
      return;
    }

    this.view.showLoading('Creating your account...');

    try {
      const result = await register(name, email, password);

      if (result.error) {
        this.view.showError(result.message);
      } else {
        this.view.showSuccess(`${result.message} <a href="#/login">Login here</a>`);
        this.view.resetForm();
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 2000);
      }
    } catch (error) {
      this.view.showError(error.message || 'An unknown error occurred');
    }
  }
}
