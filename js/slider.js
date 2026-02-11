/* ============================================
   QPhim - Hero Slider
   Quản lý slideshow banner phim nổi bật
   ============================================ */

let currentSlide = 0;         // Slide hiện tại
let heroInterval = null;      // ID của setInterval
const SLIDE_INTERVAL = 6000;  // Thời gian giữa các slide (6 giây)

/**
 * Chuyển đến slide theo index
 * @param {number} index - Vị trí slide cần hiển thị
 */
function goToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const totalSlides = slides.length;

    // Đảm bảo index nằm trong khoảng hợp lệ (vòng lặp)
    currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;

    // Ẩn tất cả slide và dot
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    // Hiện slide và dot hiện tại
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

/** Chuyển sang slide tiếp theo */
function nextSlide() {
    goToSlide(currentSlide + 1);
}

/** Quay lại slide trước */
function prevSlide() {
    goToSlide(currentSlide - 1);
}

/** Bắt đầu tự động chuyển slide */
function startAutoSlide() {
    stopAutoSlide();
    heroInterval = setInterval(nextSlide, SLIDE_INTERVAL);
}

/** Dừng tự động chuyển slide */
function stopAutoSlide() {
    if (heroInterval) {
        clearInterval(heroInterval);
        heroInterval = null;
    }
}

/**
 * Khởi tạo Hero Slider
 * Gắn sự kiện cho nút mũi tên và chấm tròn
 */
function initHeroSlider() {
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');

    // Nút mũi tên trái
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide(); // Reset bộ đếm tự động
        });
    }

    // Nút mũi tên phải
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide();
        });
    }

    // Các chấm tròn điều hướng
    document.querySelectorAll('.hero-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            goToSlide(parseInt(dot.dataset.slide));
            startAutoSlide();
        });
    });

    // Bắt đầu tự động chuyển slide
    startAutoSlide();
}
