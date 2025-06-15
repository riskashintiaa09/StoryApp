import 'regenerator-runtime';
import '../styles/styles.css';
import { registerServiceWorker, initializeNotificationFeatures } from './utils/index';
import App from './pages/app';
import NetworkStatus from './utils/network-status';
import PWAInstaller from './utils/pwa-installer';

const app = new App({
  content: document.querySelector('#main-content'),
  drawerButton: document.querySelector('#drawer-button'),
  navigationDrawer: document.querySelector('#navigation-drawer'),
});

window.addEventListener('load', async () => {
  try {
    await registerServiceWorker();
    await initializeNotificationFeatures();
    await app.renderPage();
    
    NetworkStatus.init({
      onOffline: () => {
        console.log('App is offline');
        document.getElementById('offline-notification').style.display = 'block';
      },
      onOnline: () => {
        console.log('App is online');
        document.getElementById('offline-notification').style.display = 'none';
      }
    });
    
    const headerElement = document.querySelector('.main-header');
    if (headerElement) {
      const installButtonContainer = document.createElement('div');
      installButtonContainer.classList.add('install-button-container');
      headerElement.appendChild(installButtonContainer);
      
      PWAInstaller.init({
        installButton: document.getElementById('installButton')
      });
    }
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
});

window.addEventListener('hashchange', async () => {
  await app.renderPage();
});




  document.addEventListener('DOMContentLoaded', function () {
    const skipLink = document.querySelector('.skip-link');
    skipLink.addEventListener('click', function (event) {
      event.preventDefault(); // Mencegah scroll ke #main-content
      window.location.hash = '#/'; // Navigasi ke Beranda
    });
  });




 let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Cek jika user sudah login, baru munculkan tombol install
  const isLoggedIn = document.querySelector('#user-info')?.style.display !== 'none';
  const installBtn = document.getElementById('install-btn');
  const installContainer = document.getElementById('install-container');

  if (isLoggedIn && installBtn && installContainer) {
    installContainer.style.display = 'inline-block';
  }

  if (installBtn) {
    installBtn.addEventListener('click', () => {
      deferredPrompt.prompt();
      installBtn.disabled = true;

      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ User accepted the install prompt');
        } else {
          console.log('❌ User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    });
  }
});


function showInstallButtonIfReady() {
  const installContainer = document.getElementById('install-container');
  if (deferredPrompt && installContainer) {
    installContainer.style.display = 'inline-block';
  }
}


document.addEventListener('user-logged-in', () => {
  showInstallButtonIfReady();
});

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('🟢 Event beforeinstallprompt diterima:', e);
  e.preventDefault();
  
  window.deferredPrompt = e;
});

function showError(message) {
  const container = document.getElementById('notification-container');
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.innerText = message;
  container.appendChild(notif);

  setTimeout(() => {
    notif.remove();
  }, 5000); 
}


if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.addEventListener('load', function () {
        window.scrollTo(0, 0);
      });

if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker
            .register('/sw.js')
            .then(function (registration) {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function (error) {
              console.log('ServiceWorker registration failed: ', error);
            });
        });
      }

      function updateOnlineStatus() {
        const notification = document.getElementById('offline-notification');
        if (navigator.onLine) {
          notification.style.display = 'none';
        } else {
          notification.style.display = 'block';
        }
      }

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      updateOnlineStatus();

      document.addEventListener('DOMContentLoaded', function () {
        const mainContent = document.querySelector('#main-content');
        const skipLink = document.querySelector('.skip-link');

        skipLink.addEventListener('click', function (event) {
          event.preventDefault();
          skipLink.blur();
          mainContent.focus();
          mainContent.scrollIntoView();
        });
      });