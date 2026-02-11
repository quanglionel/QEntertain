/* ============================================
   QPhim - Hero Slider
   ============================================ */

let currentSlide = 0;
let slideInterval;
let cachedSlides = [];
let cachedDots = [];

function initSlider() {
    stopAutoSlide();
    cachedSlides = document.querySelectorAll('.hero-slide');
    cachedDots = document.querySelectorAll('.hero-dot');

    // Reset index
    currentSlide = 0;

    // Add events
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    if (prevBtn) prevBtn.onclick = prevSlide;
    if (nextBtn) nextBtn.onclick = nextSlide;

    cachedDots.forEach((dot, index) => {
        dot.onclick = () => goToSlide(index);
    });

    if (cachedSlides.length > 1) startAutoSlide();
}

function showSlide(index) {
    if (!cachedSlides.length) return;

    // Remove active
    cachedSlides.forEach(s => s.classList.remove('active'));
    cachedDots.forEach(d => d && d.classList.remove('active'));

    // Set active
    if (cachedSlides[index]) cachedSlides[index].classList.add('active');
    if (cachedDots[index]) cachedDots[index].classList.add('active');
}

function nextSlide() {
    if (!cachedSlides.length) return;
    let next = currentSlide + 1;
    if (next >= cachedSlides.length) next = 0;
    goToSlide(next);
}

function prevSlide() {
    if (!cachedSlides.length) return;
    let prev = currentSlide - 1;
    if (prev < 0) prev = cachedSlides.length - 1;
    goToSlide(prev);
}

function goToSlide(index) {
    currentSlide = index;
    showSlide(currentSlide);
    startAutoSlide(); // Reset timer
}

function startAutoSlide() {
    stopAutoSlide();
    if (cachedSlides.length > 1) {
        slideInterval = setInterval(nextSlide, 5000);
    }
}

function stopAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
}

// Export global
window.initSlider = initSlider;
window.startAutoSlide = startAutoSlide;
window.stopAutoSlide = stopAutoSlide;
