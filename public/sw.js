// Nama cache yang unik. Ganti versi jika Anda mengupdate aset statis.
const STATIC_CACHE_NAME = 'yolo-static-cache-v1.2'; // Versi dinaikkan untuk memicu update
const DYNAMIC_CACHE_NAME = 'yolo-dynamic-cache-v1.2';

// Daftar Aset Statis (App Shell) yang akan di-cache saat instalasi.
// Disesuaikan dengan manifest.json terbaru Anda.
const STATIC_ASSETS = [
    '/', // Halaman utama
    '/index.html', // Fallback untuk halaman utama
    '/offline.html', // Halaman untuk fallback saat benar-benar offline
    '/manifest.json', // File manifest itu sendiri

    // --- MULAI PERUBAHAN ---
    // Semua ikon dari manifest.json dengan format nama baru
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',

    // Ikon untuk shortcut, disesuaikan dengan manifest
    '/icons/Dashboard.png',
    // --- AKHIR PERUBAHAN ---

    // Halaman yang ada di shortcut
    '/dashboard'
];

// --- INSTALL EVENT ---
// Dipanggil saat Service Worker pertama kali diinstal.
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    // Tunggu sampai semua aset statis berhasil di-cache.
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching App Shell...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // Langsung aktifkan Service Worker baru tanpa menunggu.
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Gagal melakukan caching App Shell:', error);
            })
    );
});

// --- ACTIVATE EVENT ---
// Dipanggil saat Service Worker diaktifkan.
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    // Tunggu sampai cache lama berhasil dihapus.
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Hapus cache jika namanya bukan cache yang sedang dipakai.
                    if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Ambil alih kontrol semua klien (tab) yang terbuka.
            return self.clients.claim();
        })
    );
});

// --- FETCH EVENT ---
self.addEventListener('fetch', event => {
    // --- FILTER PENTING ---
    // Abaikan request yang bukan GET dan bukan dari domain kita.
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return; 
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then(networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(DYNAMIC_CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    });
            })
            .catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
            })
    );
});