export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * @param {string} base64String 
 * @returns {Uint8Array} 
 */
export function convertBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.bundle.js');
    console.log('Service worker berhasil terpasang', registration);
    return registration;
  } catch (error) {
    console.error('Failed to install service worker:', error);
    return null;
  }
}

const initializeServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.bundle.js');
      console.log('Service Worker berhasil didaftarkan dengan scope:', registration.scope);
    
      if (registration.installing) {
        const worker = registration.installing;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'activated') {
            console.log('Service worker active and ready!');
          }
        });
      }
      
      return registration;
    } catch (error) {
      console.error('Service Worker pendaftaran gagal:', error);
      return null;
    }
  }
  return null;
};

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Browser ini tidak mendukung notifikasi');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    console.log('Izin notifikasi sudah diberikan');
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

const initializeNotificationFeatures = async () => {
  const swRegistration = await initializeServiceWorker();
  const notificationPermission = await requestNotificationPermission();
  
  if (swRegistration && notificationPermission) {
    console.log('Aplikasi siap menerima notifikasi');
    return true;
  }
  
  console.warn('Notifikasi mungkin tidak berfungsi karena service worker atau izin notifikasi tidak tersedia');
  return false;
};

export { 
  initializeServiceWorker, 
  requestNotificationPermission, 
  initializeNotificationFeatures 
};