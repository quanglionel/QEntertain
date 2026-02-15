const CACHE_NAME = 'qphim-v25';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/img/icon.svg',
    '/img/icon-192.png',
    '/img/icon-512.png',

    // CSS
    '/css/variables.css',
    '/css/base.css',
    '/css/header.css',
    '/css/hero.css',
    '/css/movies.css',
    '/css/footer.css',
    '/css/detail.css',
    '/css/watch.css',
    '/css/chapter_list.css',
    '/css/responsive.css',
    '/css/mobile-nav.css',
    '/css/notification.css',

    // JS - Core
    '/js/core/config.js',
    '/js/core/api.js',
    '/js/core/player.js',
    '/js/core/ui.js',
    '/js/core/theme.js',
    '/js/core/main.js',
    '/js/core/protect.js',

    // JS - Pages
    '/js/pages/history.js',
    '/js/pages/watch.js',
    '/js/pages/bookmarks.js',
    '/js/pages/settings.js',
    '/js/pages/detail.js',

    // JS - Components
    '/js/components/notification.js',
    '/js/components/slider.js',
    '/js/components/search.js'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: Xóa cache cũ
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // API requests: always network (don't cache)
    if (url.pathname.startsWith('/ophim') || url.pathname.startsWith('/otruyen')) {
        return;
    }

    // Fix: Không cache request từ chrome-extension:// hoặc scheme lạ
    if (!url.protocol.startsWith('http')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response.ok && event.request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Offline: serve from cache
                return caches.match(event.request);
            })
    );
});

// 1. Background Sync: Xử lý các tác vụ khi có mạng trở lại
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-history') {
        // Code để đồng bộ lịch sử xem phim (placeholder)
        // event.waitUntil(syncHistory()); 
        console.log('Background Sync: Syncing history...');
    }
});

// 2. Periodic Sync: Cập nhật dữ liệu nền định kỳ (ví dụ: mỗi 24h)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-content') {
        event.waitUntil(
            // Tự động fetch trang chủ để cache mới nhất
            fetch('/')
                .then(res => caches.open(CACHE_NAME).then(cache => cache.put('/', res)))
                .catch(console.error)
        );
        console.log('Periodic Sync: Content updated');
    }
});

// 3. Push Notifications: Nhận thông báo từ server
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'QPhim & QTruyện';
    const options = {
        body: data.body || 'Có nội dung mới cập nhật!',
        icon: '/img/icon-192.png',
        badge: '/img/icon-192.png',
        data: { url: data.url || '/' }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Xử lý khi user click vào thông báo
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
