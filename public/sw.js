self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
});

self.addEventListener('fetch', (event) => {
    // Pass through requests
    // In a real PWA, you'd cache assets here. 
    // For now, valid fetch handler is enough for PWA criteria.
});
