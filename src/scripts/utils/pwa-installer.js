let deferredPrompt = null;

const PWAInstaller = {
  init({ installButton }) {
    this._installButton = installButton;
    
    if (this._installButton) {
      this._installButton.style.display = 'none';
    }
    
    this._registerEvents();
    
    if (deferredPrompt) {
      this._showInstallButton();
    }
  },

  _showInstallButton() {
    if (this._installButton) {
      this._installButton.style.display = 'block';
    }
  },

  _hideInstallButton() {
    if (this._installButton) {
      this._installButton.style.display = 'none';
    }
  },

  _registerEvents() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      
      deferredPrompt = e;
      
      this._showInstallButton();
    });

    if (this._installButton) {
      this._installButton.addEventListener('click', () => {
        if (!deferredPrompt) {
          console.log('No installation prompt available');
          return;
        }
        
        this._hideInstallButton();
        
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
            this._showInstallButton();
          }
          deferredPrompt = null;
        });
      });
    }

    window.addEventListener('appinstalled', (e) => {
      console.log('App installed successfully');
      
      // Hide the install button
      this._hideInstallButton();
      
      deferredPrompt = null;
    });
  }
};

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('Captured beforeinstallprompt event before initialization');
});

export default PWAInstaller;