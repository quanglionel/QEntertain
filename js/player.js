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

            if (window.Hls && Hls.isSupported()) {
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
     * @param {Object} nav - { prev: url, next: url }
     */
    initReader(container, images, nav = {}) {
        this.destroy(); // Clear old content

        const readingContainer = document.createElement('div');
        readingContainer.className = 'reading-container';

        // Helper tạo thanh Nav
        const createNav = () => {
            const navDiv = document.createElement('div');
            navDiv.className = 'reader-nav';
            navDiv.style.cssText = 'display:flex;justify-content:space-between;padding:10px 0;gap:10px;margin-bottom:10px;';

            const prevBtn = document.createElement('button');
            prevBtn.innerHTML = '❮ Chap Trước';
            prevBtn.className = 'server-btn'; // Tận dụng style có sẵn
            prevBtn.disabled = !nav.prev;
            prevBtn.style.flex = '1';
            if (nav.prev) {
                prevBtn.onclick = () => {
                    console.log('Nav Click Prev:', nav.prev);
                    window.readChap(nav.prev, true);
                };
            } else {
                prevBtn.style.opacity = '0.5';
                prevBtn.style.cursor = 'not-allowed';
            }

            const nextBtn = document.createElement('button');
            nextBtn.innerHTML = 'Chap Sau ❯';
            nextBtn.className = 'server-btn';
            nextBtn.disabled = !nav.next;
            nextBtn.style.flex = '1';
            if (nav.next) {
                nextBtn.onclick = () => {
                    console.log('Nav Click Next:', nav.next);
                    window.readChap(nav.next, true);
                };
            } else {
                nextBtn.style.opacity = '0.5';
                nextBtn.style.cursor = 'not-allowed';
            }

            navDiv.appendChild(prevBtn);
            navDiv.appendChild(nextBtn);
            return navDiv;
        };

        // Top Nav
        readingContainer.appendChild(createNav());

        if (!images || images.length === 0) {
            const msg = document.createElement('p');
            msg.innerText = 'Không có nội dung chương này.';
            msg.style.cssText = 'color:#fff;text-align:center;padding:20px;';
            readingContainer.appendChild(msg);
        } else {
            images.forEach(imgUrl => {
                const img = document.createElement('img');
                img.className = 'chapter-image';
                img.loading = 'lazy';
                img.src = imgUrl; // Ảnh đã được xử lý full URL
                img.style.cssText = 'display:block;margin:0 auto;max-width:100%;height:auto;margin-bottom:5px;';
                img.onerror = () => { img.style.display = 'none'; };
                readingContainer.appendChild(img);
            });
        }

        // Bottom Nav
        readingContainer.appendChild(createNav());

        container.appendChild(readingContainer);
        // Cuộn xuống reader (nếu cần, nhưng thường readChap đã scroll rồi)
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
        const media = document.getElementById('mediaContainer');
        if (media) media.innerHTML = '';
    }
};

window.Player = Player;
