// Service Worker for LNCTShares Push Notifications

const APP_ORIGIN = self.location.origin;

self.addEventListener('install', (event) => {
  console.log('[SW] Service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {
    title: 'LNCTShares',
    body: 'You have a new notification',
    url: '/',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    tag: 'lnctshares-notification',
    renotify: true,
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle user click on notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked. Action:', event.action);
  event.notification.close();

  // If user clicked "Dismiss", don't navigate
  if (event.action === 'close') {
    return;
  }

  // Build absolute URL from notification data
  const path = event.notification.data?.url || '/';
  const targetUrl = path.startsWith('http')
    ? path
    : APP_ORIGIN + (path.startsWith('/') ? path : '/' + path);

  console.log('[SW] Navigating to:', targetUrl);

  event.waitUntil(
    (async () => {
      // Try to find an existing LNCTShares tab and focus it
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of clientList) {
        // Match any tab from our origin
        if (client.url.startsWith(APP_ORIGIN) && 'focus' in client) {
          // Navigate the existing tab to the target URL
          if ('navigate' in client) {
            await client.navigate(targetUrl);
          }
          return client.focus();
        }
      }

      // No tab found — open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});