/* ============================================
   QPhim - Tìm kiếm
   Xử lý thanh tìm kiếm mở rộng và tìm phim
   ============================================ */

/**
 * Khởi tạo chức năng tìm kiếm
 * - Mở/đóng thanh tìm kiếm khi click icon
 * - Đóng khi click ra ngoài
 * - Tìm kiếm khi nhấn Enter
 */
function initSearchBox() {
    const searchBox = document.getElementById('searchBox');
    const searchToggle = document.getElementById('searchToggle');
    const searchInput = document.getElementById('searchInput');

    if (!searchToggle || !searchInput) return;

    // Mở/đóng ô tìm kiếm
    searchToggle.addEventListener('click', () => {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) {
            searchInput.focus();
        }
    });

    // Đóng khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) {
            searchBox.classList.remove('active');
        }
    });

    // Tìm kiếm khi nhấn Enter
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                // TODO: Kết nối với backend để tìm kiếm thực tế
                alert(`Tìm kiếm: "${query}"\n(Chức năng sẽ được phát triển sau)`);
            }
        }
    });
}
