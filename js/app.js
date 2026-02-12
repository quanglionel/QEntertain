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

    // 4. Đăng ký Service Worker (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => { });
    }
});
