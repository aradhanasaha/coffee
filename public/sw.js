self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    if (!event.data) {
        console.log('Push event but no data');
        return;
    }

    try {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icon-192x192.png', // Ensure this exists or use a valid path
            badge: '/icon-192x192.png', // valid badge
            data: {
                url: data.url || '/',
            },
            vibrate: [100, 50, 100],
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (e) {
        console.error('Error parsing push data', e);
        // Fallback for simple text support if needed
        const options = {
            body: event.data.text(),
            icon: '/icon-192x192.png',
        };
        event.waitUntil(
            self.registration.showNotification('New Notification', options)
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Focus window if open, otherwise open new URL
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there is already a window open
            for (const client of clientList) {
                // You could check if the client.url matches the destination, 
                // but usually focusing any open tab is a good starting point for a PWA
                if (client.url && 'focus' in client) {
                    // Navigate the focused tab to the destination URL
                    if (event.notification.data.url) {
                        client.navigate(event.notification.data.url);
                    }
                    return client.focus();
                }
            }
            if (clients.openWindow && event.notification.data.url) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Pass through requests
    // In a real PWA, you'd cache assets here. 
    // For now, valid fetch handler is enough for PWA criteria.
});
