import CONFIG from '../config';
import {
  subscribeToPushNotification as subscribePushNotification,
  unsubscribeFromPushNotification as unsubscribePushNotification,
  setNotificationStatus,
} from '../data/api';
import { convertBase64ToUint8Array } from './index';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker tidak didukung di browser ini');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Push notification telah aktif.');
    return;
  }

  console.log('Mengaktifkan push notification...');

  const failureSubscribeMessage = 'Gagal mengaktifkan push notification.';
  const successSubscribeMessage = 'Notifikasi push berhasil diaktifkan.';

  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.ready;
    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

    const subscription = pushSubscription.toJSON();
    const response = await subscribePushNotification(subscription);

    if (response.error) {
      console.error('subscribe: response:', response);
      alert(failureSubscribeMessage);
      await pushSubscription.unsubscribe();
      return;
    }

    localStorage.setItem('push-subscription', JSON.stringify(subscription));
    setNotificationStatus(true);
    
    alert(successSubscribeMessage);
  } catch (error) {
    console.error('subscribe: error:', error);
    alert(failureSubscribeMessage);

    if (pushSubscription) {
      await pushSubscription.unsubscribe();
    }
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage = 'Gagal mengaktifkan push notification.';
  const successUnsubscribeMessage = 'Notifikasi push berhasil diaktifkan.';

  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      alert('Push notification belum diaktifkan, tidak ada yang perlu dihentikan.');
      return;
    }

    const response = await unsubscribePushNotification();

    if (response.error) {
      alert(failureUnsubscribeMessage);
      console.error('unsubscribe: response:', response);
      return;
    }

    const unsubscribed = await pushSubscription.unsubscribe();

    if (!unsubscribed) {
      alert(failureUnsubscribeMessage);
      return;
    }
    
    localStorage.removeItem('push-subscription');
    setNotificationStatus(false);

    alert(successUnsubscribeMessage);
  } catch (error) {
    alert(failureUnsubscribeMessage);
    console.error('unsubscribe: error:', error);
  }
}