/* ============================================
   QPhim & QTruyện - Player & Reader Logic
   Xử lý phát video (HLS) và đọc truyện
   ============================================ */

const Player = {
    hls: null,

    /**
     * Khởi tạo trình phát video
     * @param {HTMLElement} container - Nơi chứa player
     * @param {string} url - URL video (m3u8 hoặc embed)
     */
    initVideo(container, url) {
        this.destroy(); // Dọn dẹp cũ

        // Tạo container video
        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'video-container';
        container.appendChild(videoWrapper);

        // Kiểm tra loại link
        if (url.includes('.m3u8')) {
            const video = document.createElement('video');
            video.className = 'video-player';
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            videoWrapper.appendChild(video);

            if (Hls.isSupported()) {
                this.hls = new Hls();
                this.hls.loadSource(url);
                this.hls.attachMedia(video);
                this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => console.log('Autoplay blocked'));
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Safari native HLS
                video.src = url;
                video.addEventListener('loadedmetadata', () => {
                    video.play().catch(() => console.log('Autoplay blocked'));
                });
            } else {
                videoWrapper.innerHTML = '<p style="color:#fff;text-align:center;padding:20px;">Trình duyệt không hỗ trợ phát video này.</p>';
            }
        } else {
            // Embed Iframe
            videoWrapper.innerHTML = `<iframe src="${url}" class="video-player" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
        }

        // Cuộn xuống player
        videoWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    /**
     * Khởi tạo trình đọc truyện
     * @param {HTMLElement} container - Nơi chứa reader
     * @param {Array} images - Danh sách URL ảnh
     */
    initReader(container, images) {
        this.destroy();

        const readingContainer = document.createElement('div');
        readingContainer.className = 'reading-container';

        if (!images || images.length === 0) {
            readingContainer.innerHTML = '<p style="color:#fff;text-align:center;padding:20px;">Không có nội dung chương này.</p>';
        } else {
            images.forEach(imgUrl => {
                const img = document.createElement('img');
                img.className = 'chapter-image';
                img.loading = 'lazy';
                img.alt = 'Trang truyện';

                // Xử lý URL ảnh qua proxy nếu cần
                // (Giả sử imgs đã được xử lý full URL từ component)
                img.src = imgUrl;

                // Fallback nếu lỗi
                img.onerror = () => {
                    img.style.display = 'none';
                };

                readingContainer.appendChild(img);
            });
        }

        container.appendChild(readingContainer);
        // Cuộn xuống reader
        readingContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    /**
     * Dọn dẹp player/reader
     */
    destroy() {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
        // Các container player/reader sẽ được clear khi render lại nội dung chi tiết
        // Nhưng nếu cần reset cụ thể:
        // const container = document.getElementById('mediaContainer');
        // if (container) container.innerHTML = '';
    }
};
