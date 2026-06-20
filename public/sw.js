// Public VAPID key — safe to ship to browsers (it is the applicationServerKey).
// MUST match NEXT_PUBLIC_VAPID_PUBLIC_KEY / the edge functions' VAPID_PUBLIC_KEY.
const VAPID_PUBLIC_KEY = 'BKntPVco71jin1umb6iMv8Ct8SDzt0kcq70TUT0W8ata_FXHUVTadyLiRH9vV4FJWatELUzzaLhIWEgr4z6flnY';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

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
            icon: '/logo.png',
            badge: '/logo.png',
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
            icon: '/logo.png',
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

// When the browser rotates the push subscription, re-subscribe immediately and
// persist the new one — even if the app isn't open — so delivery never silently
// breaks. We pass the OLD endpoint as a capability proof to the save endpoint.
self.addEventListener('pushsubscriptionchange', (event) => {
    event.waitUntil((async () => {
        try {
            const oldEndpoint = event.oldSubscription ? event.oldSubscription.endpoint : null;

            let newSub = event.newSubscription;
            if (!newSub) {
                newSub = await self.registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });
            }

            const json = newSub.toJSON();
            await fetch('/api/push/resubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oldEndpoint,
                    endpoint: newSub.endpoint,
                    p256dh: json.keys && json.keys.p256dh,
                    auth: json.keys && json.keys.auth,
                }),
            });
        } catch (e) {
            console.error('pushsubscriptionchange re-subscribe failed', e);
        }
    })());
});

self.addEventListener('fetch', (event) => {
    // Pass through requests
    // In a real PWA, you'd cache assets here.
    // For now, valid fetch handler is enough for PWA criteria.
});
