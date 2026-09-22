// Service Worker for LNCTShares Push Notifications

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
    event.notification.close();

    if (event.action === 'close') {
      return;
    }

    const targetUrl = new URL(
      event.notification.data?.url || '/',
      self.location.origin
    ).href;

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
        for (const client of clientList) {
          if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
            await client.navigate(targetUrl);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }

        return undefined;
      })
    );
  });
