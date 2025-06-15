import CONFIG from '../config';

const ENDPOINTS = {
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  NOTIFICATIONS_SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

const AUTH_KEY = 'storyapp-token';
const USER_KEY = 'storyapp-user';
const NOTIFICATION_STATUS_KEY = 'storyapp-notification-status';

const getToken = () => {
  return localStorage.getItem(AUTH_KEY);
};

const setToken = (token) => {
  localStorage.setItem(AUTH_KEY, token);
};

const setUserData = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const getUserData = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

const clearAuthData = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isLoggedIn = () => {
  return !!getToken();
};

export async function login(email, password) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const responseJson = await response.json();
    
    if (responseJson.error) {
      return { error: true, message: responseJson.message || 'Login failed' };
    }
    
    setToken(responseJson.loginResult.token);
    setUserData({
      id: responseJson.loginResult.userId,
      name: responseJson.loginResult.name,
      email: email
    });
    
    return { 
      error: false, 
      data: responseJson.loginResult,
      message: 'Login successful' 
    };
  } catch (error) {
    return { error: true, message: error.message || 'Network error occurred' };
  }
}

export async function register(name, email, password) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    const responseJson = await response.json();
    
    if (responseJson.error) {
      return { error: true, message: responseJson.message || 'Registration failed' };
    }
    
    return { 
      error: false, 
      message: responseJson.message || 'Registration successful' 
    };
  } catch (error) {
    return { error: true, message: error.message || 'Network error occurred' };
  }
}

export function logout() {
  clearAuthData();
  clearFavoriteData();
  return { error: false, message: 'Logout successful' };
}

const clearFavoriteData = async () => {
  try {
    // Option 1: Clear all favorites when logging out
    const db = await openDB('storyshare-favorite-db', 1);
    const tx = db.transaction('favorites', 'readwrite');
    await tx.objectStore('favorites').clear();
    await tx.done;
    console.log('Favorite data cleared successfully');
  } catch (error) {
    console.error('Error clearing favorite data:', error);
  }
};

export async function getStories() {
  try {
    if (!isLoggedIn()) {
      return { error: true, message: 'Authentication required' };
    }
    
    const response = await fetch(`${ENDPOINTS.STORIES}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const responseJson = await response.json();
    
    if (responseJson.error) {
      return { error: true, message: responseJson.message || 'Failed to fetch stories' };
    }
    
    return { error: false, data: responseJson.listStory || [] };
  } catch (error) {
    return { error: true, message: error.message || 'Network error occurred' };
  }
}

export async function getStoryDetail(id) {
  try {
    if (!isLoggedIn()) {
      return { error: true, message: 'Authentication required' };
    }
    
    const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const responseJson = await response.json();
    
    if (responseJson.error) {
      return { error: true, message: responseJson.message || 'Failed to fetch story details' };
    }
    
    return { error: false, data: responseJson.story };
  } catch (error) {
    return { error: true, message: error.message || 'Network error occurred' };
  }
}

export const setNotificationStatus = (isSubscribed) => {
  localStorage.setItem(NOTIFICATION_STATUS_KEY, JSON.stringify(isSubscribed));
};

export const getNotificationStatus = () => {
  const status = localStorage.getItem(NOTIFICATION_STATUS_KEY);
  return status ? JSON.parse(status) : false;
};

export const isSubscribedToPushNotification = async () => {
  const notificationStatus = getNotificationStatus();
  if (!notificationStatus) {
    console.log('User has explicitly unsubscribed from notifications');
    return false;
  }
  
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Error checking push subscription:', error);
      return false;
    }
  }
  return false;
};

export async function addStory({ name, description, photo, lat, lon }) {
  try {
    if (!isLoggedIn()) {
      return { error: true, message: 'Authentication required' };
    }
    
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    
    if (lat !== undefined && lon !== undefined) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }
    
    const response = await fetch(ENDPOINTS.ADD_STORY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData,
    });
    
    const responseJson = await response.json();
    
    if (responseJson.error) {
      return { error: true, message: responseJson.message || 'Failed to add story' };
    }
    
    const notificationStatus = getNotificationStatus();
    console.log('Notification subscription status:', notificationStatus);
    
    if (!notificationStatus) {
      console.log('User has unsubscribed from notifications, skipping all notifications');
    } 
    else {
      console.log('User is subscribed to notifications, sending local notification as fallback');
      _sendLocalNotification('Cerita Baru Ditambahkan', `Cerita berhasil ditambahkan: ${description.substring(0, 30)}...`);
    }
    
    return { error: false, message: responseJson.message || 'Story added successfully' };
  } catch (error) {
    return { error: true, message: error.message || 'Network error occurred' };
  }
}

const _sendLocalNotification = (title, body) => {
  const notificationStatus = getNotificationStatus();
  if (!notificationStatus) {
    console.log('User has unsubscribed from notifications, not sending local notification');
    return;
  }
  
  if ('Notification' in window && Notification.permission === 'granted') {
    const options = {
      body: body,
      icon: '/icons/icon-192x192.png',
    };
    
    new Notification(title, options);
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body: body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
        });
      });
    }
  }
};

export const subscribeToPushNotification = async (subscription) => {
  const token = getToken(); 
  console.log('Token yang diambil untuk subscribe:', token);
  console.log('Subscription data yang dikirim:', subscription);

  if (!token) return { error: true, message: 'Authentication required.' };

  try {
    const res = await fetch(ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      }),
    });

    const data = await res.json();
    console.log('Respons dari subscribe:', data);

    if (!res.ok) throw new Error(data.message || 'Failed to subscribe to notifications');

    setNotificationStatus(true);
    
    localStorage.setItem('push-subscription', JSON.stringify(subscription));

    return {
      error: false,
      message: 'Successfully subscribed to push notifications. You will now receive notifications.',
      data: data.data,
    };
  } catch (err) {
    console.error('Terjadi error saat subscribe:', err);
    return { error: true, message: err.message };
  }
};

export const unsubscribeFromPushNotification = async () => {
  const token = getToken();
  if (!token) return { error: true, message: 'Authentication required.' };

  try {
    const subscriptionData = localStorage.getItem('push-subscription');
    if (!subscriptionData) {
      setNotificationStatus(false);
      return { error: false, message: 'Successfully unsubscribed from push notifications. You will no longer receive notifications.' };
    }
    
    const subscription = JSON.parse(subscriptionData);
    
    const res = await fetch(ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to unsubscribe from notifications');
    setNotificationStatus(false);
    localStorage.removeItem('push-subscription');

    return { 
      error: false, 
      message: 'Successfully unsubscribed from push notifications. You will no longer receive notifications.' 
    };
  } catch (err) {
    console.error('Error during unsubscribe:', err);
    setNotificationStatus(false);
    return { error: true, message: err.message };
  }
};