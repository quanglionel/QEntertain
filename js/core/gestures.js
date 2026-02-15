/* ============================================
   QPhim Gestures - Mobile Swipe Navigation
   Vuốt từ cạnh trái để quay lại (iOS Style)
   ============================================ */

const Gestures = {
    startX: 0,
    startY: 0,
    isSwiping: false,
    threshold: 100, // Khoảng cách tối thiểu để kích hoạt Back
    edgeThreshold: 40, // Chỉ bắt đầu vuốt từ 40px mép trái
    indicator: null,

    init() {
        // Chỉ chạy trên Mobile/Tablet
        if (window.innerWidth > 1024) return;

        this.createIndicator();

        document.addEventListener('touchstart', (e) => this.onStart(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.onMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onEnd(e), { passive: true });
    },

    createIndicator() {
        const div = document.createElement('div');
        div.id = 'swipe-back-indicator';
        div.style.cssText = `
            position: fixed; top: 0; bottom: 0; left: -50px; width: 50px;
            background: linear-gradient(to right, rgba(0,0,0,0.5), transparent);
            z-index: 99999; display: flex; align-items: center; justify-content: center;
            pointer-events: none; transition: transform 0.1s linear;
        `;
        div.innerHTML = `<div style="background:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
            <svg viewBox="0 0 24 24" style="width:24px; height:24px; color:#333;"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </div>`;
        document.body.appendChild(div);
        this.indicator = div;
    },

    onStart(e) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;

        // Chỉ trigger khi vuốt từ mép trái
        if (this.startX <= this.edgeThreshold) {
            this.isSwiping = true;
        } else {
            this.isSwiping = false;
        }
    },

    onMove(e) {
        if (!this.isSwiping) return;

        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const diffX = x - this.startX;
        const diffY = Math.abs(y - this.startY);

        // Nếu vuốt dọc nhiều hơn ngang -> Hủy (để user cuộn trang)
        if (diffY > diffX) {
            this.isSwiping = false;
            this.resetIndicator();
            return;
        }

        // Chặn hành động mặc định (để ko bị reload trang trên Chrome Android)
        if (e.cancelable && diffX > 0) {
            // e.preventDefault(); // (Optional: Chrome might complain active listener)
        }

        // Di chuyển indicator
        if (diffX > 0) {
            const move = Math.min(diffX, 100); // Max visual move
            this.indicator.style.transform = `translateX(${move}px)`;
            this.indicator.style.opacity = move / 100;
        }
    },

    onEnd(e) {
        if (!this.isSwiping) return;

        const endX = e.changedTouches[0].clientX;
        const diffX = endX - this.startX;

        if (diffX > this.threshold) {
            this.triggerBack();
        }

        this.resetIndicator();
        this.isSwiping = false;
    },

    resetIndicator() {
        if (this.indicator) {
            this.indicator.style.transform = 'translateX(0)';
            this.indicator.style.opacity = '0';
        }
    },

    triggerBack() {
        // Logic Back thông minh
        // 1. Nếu đang xem Fullscreen Video/Truyện -> Thoát
        // 2. Nếu đang ở trang xem phim (Watch/Reader) -> Về Detail
        // 3. Nếu đang ở Detail -> Về Home
        // 4. Nếu Sidebar đang mở -> Đóng Sidebar

        const sidebarOverlay = document.querySelector('.sidebar-overlay.active');
        if (sidebarOverlay) {
            toggleSidebar(false);
            return;
        }

        const watchPage = document.getElementById('watchPage');
        const readerPage = document.getElementById('readerPage');
        const detailPage = document.getElementById('detailPage');

        // Check Watch Page visible?
        if (watchPage && !watchPage.classList.contains('hidden')) {
            watchPage.classList.add('hidden');
            detailPage?.classList.remove('hidden');
            // Stop player logic if needed
            if (window.Player && Player.destroy) Player.destroy();
            // Reset title
            if (window.currentDetailData) document.title = `${window.currentDetailData.name} | QPhim`;
            return;
        }

        // Check Reader Page visible?
        if (readerPage && !readerPage.classList.contains('hidden')) {
            readerPage.classList.add('hidden');
            detailPage?.classList.remove('hidden');
            // Reset title
            if (window.currentDetailData) document.title = `${window.currentDetailData.name} | QPhim`;
            return;
        }

        // Check Detail Page visible?
        const detailHidden = detailPage ? detailPage.classList.contains('hidden') : true;
        if (!detailHidden) {
            // Go Back Home
            handleNav('home');
            return;
        }

        // If not at Home (Hero hidden), go Home
        const hero = document.getElementById('hero');
        if (hero && hero.style.display === 'none') {
            handleNav('home');
            return;
        }

        // Check Filter Page or other sections
        const filterSection = document.getElementById('filterSection');
        if (filterSection) {
            handleNav('home');
            return;
        }

        console.log('Swipe Back: Already at Home');
    }
};

window.initGestures = () => Gestures.init();
