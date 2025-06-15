import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import CONFIG from './config';

precacheAndRoute(self.__WB_MANIFEST);


registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);


registerRoute(
  ({ url }) =>
    url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome'),
  new CacheFirst({
    cacheName: 'fontawesome',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);


registerRoute(
  ({ url }) => url.origin === 'https://ui-avatars.com',
  new CacheFirst({
    cacheName: 'avatars-api',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);


registerRoute(
  ({ url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && url.pathname.endsWith('/stories');
  },
  new NetworkFirst({
    cacheName: 'story-list-api',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);


registerRoute(
  ({ url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return (
      baseUrl.origin === url.origin &&
      url.pathname.startsWith('/v1/stories/') &&
      !url.pathname.endsWith('/stories')
    );
  },
  new NetworkFirst({
    cacheName: 'story-detail-api',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);


registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'story-api-images',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);


registerRoute(
  ({ request }) => ['script', 'style', 'document'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

registerRoute(
  ({ url }) =>
    url.origin.includes('tile.openstreetmap.org') ||
    url.origin.includes('server.arcgisonline.com') ||
    url.origin.includes('basemaps.cartocdn.com'),
  new CacheFirst({
    cacheName: 'leaflet-map-tiles',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');

  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('Error parsing push data:', error);
    data = {
      title: 'New Notification',
      body: 'Something new happened!',
      icon: '/icons/cat.png',
      url: '/',
    };
  }

  const title = data.title || 'Notifikasi';
  const options = {
    body: data.body || 'Ada notifikasi baru!',
    icon: data.icon || '/icons/cat.png',
    badge: '/icons/kitty.png',
    data: {
      url: data.url || '/',
    },
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});


self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received', event);
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
