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
     * Khởi tạo trình đọc truyện (Premium)
     * @param {HTMLElement} container - Nơi chứa reader
     * @param {Array} images - Danh sách URL ảnh
     * @param {Object} nav - { prev: url, next: url }
     * @param {string} chapterName - Tên chương hiện tại
     */
    initReader(container, images, nav = {}, chapterName = '') {
        this.destroy(); // Clear old content
        container.innerHTML = ''; // Xóa loading spinner

        // ===== Thanh tiến trình đọc =====
        let progressBar = document.querySelector('.reader-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'reader-progress';
            document.body.appendChild(progressBar);
        }
        progressBar.style.width = '0%';

        // ===== Nút cuộn lên đầu =====
        let scrollTopBtn = document.querySelector('.reader-scroll-top');
        if (!scrollTopBtn) {
            scrollTopBtn = document.createElement('button');
            scrollTopBtn.className = 'reader-scroll-top';
            scrollTopBtn.innerHTML = '↑';
            scrollTopBtn.title = 'Lên đầu';
            document.body.appendChild(scrollTopBtn);
        }
        scrollTopBtn.onclick = () => {
            // Cuộn reader container về đầu
            container.scrollTo({ top: 0, behavior: 'smooth' });
        };

        // ===== Container chính =====
        const readingContainer = document.createElement('div');
        readingContainer.className = 'reading-container';

        // Xử lý scroll trên container (readerContainer): cập nhật progress + nút scroll-to-top
        const onScroll = () => {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.width = percent + '%';
            scrollTopBtn.classList.toggle('visible', scrollTop > 500);
        };

        // Gắn scroll listener trực tiếp (container đã tồn tại trong DOM)
        container.addEventListener('scroll', onScroll);

        // Lưu cleanup function
        this._readerCleanup = () => {
            container.removeEventListener('scroll', onScroll);
            if (progressBar) progressBar.remove();
            if (scrollTopBtn) scrollTopBtn.remove();
            const lmb = document.querySelector('.reader-load-mode');
            if (lmb) lmb.remove();
        };

        // ===== Helper tạo thanh Nav =====
        const currentApiUrl = this._currentApiUrl || '';
        const createNav = () => {
            const navDiv = document.createElement('div');
            navDiv.className = 'reader-nav';

            // Nút Prev
            const prevBtn = document.createElement('button');
            prevBtn.className = 'nav-btn';
            prevBtn.innerHTML = '❮ Trước';
            prevBtn.disabled = !nav.prev;
            if (nav.prev) {
                prevBtn.onclick = () => window.readChap(nav.prev, true);
            }

            // Chỉ báo chương + dropdown
            const indicatorWrap = document.createElement('div');
            indicatorWrap.className = 'chapter-indicator-wrap';

            const indicator = document.createElement('button');
            indicator.className = 'chapter-indicator';
            indicator.textContent = (chapterName || '📖') + ' ▾';
            indicator.title = 'Danh sách chương';

            // Tạo dropdown
            const dropdown = document.createElement('div');
            dropdown.className = 'chapter-dropdown';

            // Populate dropdown từ currentDetailData
            if (window.currentDetailData?.chapters) {
                window.currentDetailData.chapters.forEach(server => {
                    if (!server.server_data) return;
                    server.server_data.forEach(chap => {
                        const item = document.createElement('button');
                        item.className = 'chapter-dropdown-item';
                        item.textContent = `Ch. ${chap.chapter_name}`;
                        if (chap.chapter_api_data === currentApiUrl) {
                            item.classList.add('active');
                        }
                        item.onclick = (e) => {
                            e.stopPropagation();
                            dropdown.classList.remove('open');
                            window.readChap(chap.chapter_api_data);
                        };
                        dropdown.appendChild(item);
                    });
                });
            }

            indicator.onclick = (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
                // Cuộn tới chương đang đọc
                if (dropdown.classList.contains('open')) {
                    const activeItem = dropdown.querySelector('.active');
                    if (activeItem) {
                        activeItem.scrollIntoView({ block: 'center' });
                    }
                }
            };

            // Click bên ngoài → đóng dropdown
            document.addEventListener('click', () => {
                dropdown.classList.remove('open');
            }, { once: false });

            indicatorWrap.appendChild(indicator);
            indicatorWrap.appendChild(dropdown);

            // Nút Next
            const nextBtn = document.createElement('button');
            nextBtn.className = 'nav-btn';
            nextBtn.innerHTML = 'Sau ❯';
            nextBtn.disabled = !nav.next;
            if (nav.next) {
                nextBtn.onclick = () => window.readChap(nav.next, true);
            }

            navDiv.appendChild(prevBtn);
            navDiv.appendChild(indicatorWrap);
            navDiv.appendChild(nextBtn);
            return navDiv;
        };

        // ===== Top Nav =====
        readingContainer.appendChild(createNav());

        // ===== Load mode (Eager/Lazy) =====
        const savedMode = localStorage.getItem('reader-load-mode') || 'smart';
        let loadMode = savedMode; // 'smart' (8 eager + lazy), 'eager' (all), 'lazy' (all lazy)

        // Nút toggle load mode
        let loadModeBtn = document.querySelector('.reader-load-mode');
        if (loadModeBtn) loadModeBtn.remove();
        loadModeBtn = document.createElement('button');
        loadModeBtn.className = 'reader-load-mode';
        loadModeBtn.title = 'Chế độ tải ảnh';
        const modeLabels = { smart: '⚡ Smart', eager: '🔥 Eager', lazy: '🐢 Lazy' };
        loadModeBtn.textContent = modeLabels[loadMode];
        document.body.appendChild(loadModeBtn);

        const applyLoadMode = (mode) => {
            const imgs = readingContainer.querySelectorAll('.chapter-image');
            imgs.forEach((img, idx) => {
                if (mode === 'eager') {
                    img.loading = 'eager';
                } else if (mode === 'lazy') {
                    img.loading = 'lazy';
                } else {
                    img.loading = idx < 8 ? 'eager' : 'lazy';
                }
            });
        };

        loadModeBtn.onclick = () => {
            // Cycle: smart → eager → lazy → smart
            if (loadMode === 'smart') loadMode = 'eager';
            else if (loadMode === 'eager') loadMode = 'lazy';
            else loadMode = 'smart';

            localStorage.setItem('reader-load-mode', loadMode);
            loadModeBtn.textContent = modeLabels[loadMode];
            applyLoadMode(loadMode);
        };

        // ===== Render ảnh =====
        if (!images || images.length === 0) {
            const msg = document.createElement('p');
            msg.innerText = 'Không có nội dung chương này.';
            msg.style.cssText = 'color:#fff;text-align:center;padding:40px;';
            readingContainer.appendChild(msg);
        } else {
            // Preconnect CDN để tăng tốc DNS + TLS
            const firstUrl = images[0];
            try {
                const cdnOrigin = new URL(firstUrl, location.origin).origin;
                if (cdnOrigin !== location.origin) {
                    const link = document.createElement('link');
                    link.rel = 'preconnect';
                    link.href = cdnOrigin;
                    document.head.appendChild(link);
                }
            } catch (e) { }

            // Dùng DocumentFragment để batch insert (1 reflow thay vì N)
            const fragment = document.createDocumentFragment();

            images.forEach((imgUrl, idx) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'img-skeleton';

                const img = document.createElement('img');
                img.className = 'chapter-image';
                img.alt = `Trang ${idx + 1}`;
                img.decoding = 'async';

                // Áp dụng load mode
                if (loadMode === 'eager') {
                    img.loading = 'eager';
                } else if (loadMode === 'lazy') {
                    img.loading = 'lazy';
                } else {
                    img.loading = idx < 8 ? 'eager' : 'lazy';
                }

                img.onload = () => {
                    img.classList.add('loaded');
                    wrapper.classList.remove('img-skeleton');
                };
                img.onerror = () => {
                    wrapper.classList.remove('img-skeleton');
                    wrapper.style.minHeight = '60px';
                    wrapper.innerHTML = `<p style="color:#f55;text-align:center;padding:10px;font-size:0.85rem;">⚠ Ảnh ${idx + 1} lỗi</p>`;
                };

                img.src = imgUrl;
                wrapper.appendChild(img);
                fragment.appendChild(wrapper);
            });

            readingContainer.appendChild(fragment);
        }

        // ===== Bottom Nav =====
        readingContainer.appendChild(createNav());

        container.appendChild(readingContainer);
    },

    /**
     * Dọn dẹp player/reader
     */
    destroy() {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
        // Cleanup reader elements (progress bar, scroll-to-top button)
        if (this._readerCleanup) {
            this._readerCleanup();
            this._readerCleanup = null;
        }
        // Clear media container
        const media = document.getElementById('mediaContainer');
        if (media) media.innerHTML = '';
    }
};

window.Player = Player;
