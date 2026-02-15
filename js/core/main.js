/* ============================================
   QPhim & QTruyện - Khởi tạo ứng dụng
   File chính, gọi tất cả module khởi tạo
   ============================================ */

/**
 * Gắn lại tất cả sự kiện
 * Gọi khi khởi tạo lần đầu và sau mỗi lần chuyển mode
 */
function initAllEvents() {
    // initHeroSlider(); // Đã chuyển sang components.js
    initThemeToggle();
    initSearchBox();
    initHeaderScroll();

    initMobileMenu();
    initNavLinks();
}

/**
 * Khởi tạo toàn bộ ứng dụng
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Render giao diện theo mode đã lưu
    renderAll();

    // 2. Gắn sự kiện
    initAllEvents();

    // 3. Bắt đầu slider tự động
    // startAutoSlide();

    console.log(`🎬📚 QPhim & QTruyện đã khởi tạo! Mode: ${currentMode}`);

    // 4. Đăng ký Service Worker (PWA) + Advanced Features
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);

                // Thử đăng ký Periodic Sync (yêu cầu PWA cài đặt mới được phép)
                if ('periodicSync' in registration) {
                    registration.periodicSync.register('update-content', {
                        minInterval: 24 * 60 * 60 * 1000 // 1 ngày
                    }).catch(err => {
                        // Periodic Sync thường bị chặn nếu app chưa cài đặt, lỗi này là bình thường
                        console.log('Periodic Sync could not be registered:', err);
                    });
                }
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    }

    // Yêu cầu quyền thông báo (Optional - chỉ khi user cần)
    // if ('Notification' in window && Notification.permission !== 'granted') {
    //     Notification.requestPermission();
    // }
});
