// MenuFid Service Worker - Web Push & Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  let data = {
    title: 'MenuFid',
    body: 'Nouvelle notification fidélité',
    icon: '/logo.png',
    badge: '/favicon.ico',
    url: '/wallet',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: data.badge || '/favicon.ico',
    vibrate: [150, 80, 150],
    data: {
      dateOfArrival: Date.now(),
      url: data.url || '/wallet',
    },
    actions: [
      { action: 'open', title: 'Voir ma carte ➔' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MenuFid', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/wallet';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si une fenêtre est déjà ouverte sur MenuFid, la mettre au premier plan
      for (let client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl) || client.url.includes('/wallet')) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
