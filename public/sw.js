self.addEventListener('install', event => {
    console.log('Service worker is installing');
})

self.addEventListener('activate', event => {
    console.log('Activating Service Worker', event);
    return self.clients.claim();
})