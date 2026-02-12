const CACHE_NAME = 'qphim-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/detail.css',
    '/css/watch.css',
    '/js/data.js',
    '/js/api.js',
    '/js/player.js',
    '/js/history.js',
    '/js/play.js',
    '/js/detail.js',
    '/js/components.js',
    '/js/ui.js',
    '/js/app.js'
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
