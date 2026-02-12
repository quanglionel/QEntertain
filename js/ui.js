/* ============================================
   QPhim - UI Utilities
   Hiệu ứng header, nút cuộn, menu mobile, nav
   ============================================ */

/**
 * Hiệu ứng đổ bóng header khi cuộn trang
 * Thêm class "scrolled" khi cuộn xuống > 50px
 */
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}



/**
 * Menu hamburger trên mobile
 * Mở/đóng nav khi nhấn, đóng khi chọn mục
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mainNav');

    if (!menuBtn || !nav) return;

    // Toggle menu
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Đóng menu khi chọn mục
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

/**
 * Trạng thái active cho menu điều hướng
 * Highlight mục đang được chọn
 */
function initNavLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Bỏ active tất cả, thêm active cho mục được chọn
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}
