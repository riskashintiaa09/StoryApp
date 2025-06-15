import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { isLoggedIn, logout, getUserData } from '../data/api';
import { subscribe, unsubscribe, isCurrentPushSubscriptionAvailable } from '../utils/notification-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipToContentTriggered = false;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupLogout();
    this._setupSkipToContent();
    this._bindSubscribeButton();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _setupSkipToContent() {
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('skip-to-content')) {
        this.#skipToContentTriggered = true;
        setTimeout(() => {
          this.#skipToContentTriggered = false;
        }, 1000);
      }
    });
  }

  _setupLogout() {
    document.addEventListener('click', (event) => {
      if (event.target.id === 'logout-link' || event.target.parentElement?.id === 'logout-link') {
        event.preventDefault();
        const result = logout();
        if (!result.error) {
          this._clearAuthUI();
          window.location.hash = '#/login';
        }
      }
    });
  }

  _clearAuthUI() {
    const loginLink = document.querySelector('.login-menu');
    const registerLink = document.querySelector('.register-menu');
    const logoutLink = document.querySelector('.logout-menu');
    const userInfoElement = document.getElementById('user-info');
    const authRequiredLinks = document.querySelectorAll('.auth-required-link');

    if (loginLink) loginLink.style.display = 'block';
    if (registerLink) registerLink.style.display = 'block';
    if (logoutLink) logoutLink.style.display = 'none';
    if (userInfoElement) userInfoElement.style.display = 'none';
    authRequiredLinks.forEach(link => link.classList.add('hidden'));
  }

  _toggleAuthLinks() {
    const loginLink = document.querySelector('.login-menu');
    const registerLink = document.querySelector('.register-menu');
    const logoutLink = document.querySelector('.logout-menu');
    const userInfoElement = document.getElementById('user-info');
    const authRequiredLinks = document.querySelectorAll('.auth-required-link');

    if (isLoggedIn()) {
      if (loginLink) loginLink.style.display = 'none';
      if (registerLink) registerLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'block';
      
      const userData = getUserData();
      if (userInfoElement && userData) {
        userInfoElement.style.display = 'block';
        userInfoElement.innerHTML = `
          <span class="user-name">${userData.name || 'User'}</span>
        `;
      }
      authRequiredLinks.forEach(link => link.classList.remove('hidden'));
    } else {
      if (loginLink) loginLink.style.display = 'block';
      if (registerLink) registerLink.style.display = 'block';
      if (logoutLink) logoutLink.style.display = 'none';
      if (userInfoElement) userInfoElement.style.display = 'none';
      authRequiredLinks.forEach(link => link.classList.add('hidden'));
    }
  }

  async _bindSubscribeButton() {
    const subscribePlaceholder = document.getElementById('subscribe-placeholder');
    if (!subscribePlaceholder) {
      console.warn('Element with id "subscribe-placeholder" not found');
      return;
    }
    
    subscribePlaceholder.style.display = 'block';
  
    subscribePlaceholder.innerHTML = `
      <a href="#" id="subscribe-button" class="nav-link">
        <i class="fas fa-bell"></i> Subscribe
      </a>
    `;
    
    const subscribeButton = document.getElementById('subscribe-button');
    if (subscribeButton) {
      const newSubscribeButton = subscribeButton.cloneNode(true);
      subscribeButton.parentNode.replaceChild(newSubscribeButton, subscribeButton);

      newSubscribeButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await this._handleSubscribeButtonClick(newSubscribeButton);
      });
      
      await this._updateSubscribeButtonText(newSubscribeButton);
    } else {
      console.warn('Element with id "subscribe-button" not found after insertion');
    }
  }

  async _handleSubscribeButtonClick(subscribeButton) {
    if (!isLoggedIn()) {
      alert('You must be logged in to subscribe.');
      return;
    }

    try {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
      await this._updateSubscribeButtonText(subscribeButton);
    } catch (error) {
      console.error('Error while handling subscription:', error);
    }
  }

  async _updateSubscribeButtonText(button) {
    try {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();
      button.innerHTML = isSubscribed
        ? `<i class="fas fa-bell-slash"></i> Unsubscribe`
        : `<i class="fas fa-bell"></i> Subscribe`;
      button.dataset.subscribed = isSubscribed;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      button.innerHTML = `<i class="fas fa-bell"></i> Push Notifications`;
    }
  }


async renderPage() {
  const url = getActiveRoute();
  const page = routes[url];
  if (!page) {
    this.#content.innerHTML = `
      <div class="container error-page">
        <div class="error-content">
          <h2>404</h2>
          <p>Maaf Halaman Tidak Ditemukan!</p>
          <a href="#/" class="btn btn-primary">Kembali Ke Beranda</a>
        </div>
      </div>
    `;
    return;
  }

    try {
      if (page.needsAuth && !isLoggedIn()) {
        window.location.hash = '#/login';
        return;
      }
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      if (!this.#skipToContentTriggered) {
        window.scrollTo(0, 0);
      }
      this._toggleAuthLinks();
    } catch (error) {
      console.error('Error rendering page:', error);
      this.#content.innerHTML = `
        <div class="container error-page">
          <h2>Something went wrong</h2>
          <p>An error occurred while loading the page.</p>
          <a href="#/" class="btn btn-primary">Back to Home</a>
        </div>
      `;
    }
  }
}

export default App;