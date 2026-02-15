/* ============================================
   QPhim - Chuyển đổi Theme
   Xử lý chuyển đổi giữa Dark mode và Light mode
   Lưu lựa chọn vào localStorage
   ============================================ */

/**
 * Khởi tạo nút chuyển đổi theme
 * - Đọc theme đã lưu từ localStorage
 * - Gắn sự kiện click để chuyển đổi
 */
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Đọc theme đã lưu (mặc định: dark)
    const savedTheme = localStorage.getItem('qphim-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Xử lý khi nhấn nút chuyển theme
    toggle.addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');

        // Đổi theme ngược lại
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);

        // Lưu vào localStorage để nhớ lần sau
        localStorage.setItem('qphim-theme', newTheme);
    });
}

// Expose to window
window.initThemeToggle = initThemeToggle;
