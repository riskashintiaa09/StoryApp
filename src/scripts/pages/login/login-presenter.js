import { login } from '../../data/api';

export default class LoginPresenter {
  constructor({ view }) {
    this.view = view;
  }

  async handleLogin(email, password) {
    if (!email || !password) {
      this.view.showError('Harap isi semua kolom');
      return;
    }

    this.view.showLoading('Sign in to your account');

    try {
      const result = await login(email, password);

      if (result.error) {
        this.view.showError(result.message);
      } else {
        this.view.showSuccess(result.message);
        setTimeout(() => {
          window.location.hash = '#/';
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      this.view.showError(error.message || 'Terjadi kesalahan yang tidak diketahui');
    }
  }
}
