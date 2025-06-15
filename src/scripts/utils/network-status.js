const NetworkStatus = {
  isOnline() {
    return navigator.onLine;
  },

  init({ onOffline, onOnline }) {
    window.addEventListener('online', () => {
      if (onOnline) onOnline();
    });
    
    window.addEventListener('offline', () => {
      if (onOffline) onOffline();
    });
  }
};

export default NetworkStatus;