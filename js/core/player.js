/* ============================================
   QPhim & QTruyện - Player & Reader Logic
   Xử lý phát video (HLS) và đọc truyện
   ============================================ */

const Player = {
    plyr: null,

    /**
     * Khởi tạo trình phát video
     * @param {HTMLElement} container - Nơi chứa player
     * @param {string} url - URL video (m3u8 hoặc embed)
     * @param {Function} nextEpCallback - Hàm gọi khi hết phim (Auto Next)
     * @param {string} poster - URL ảnh thumb
     * @param {string} backupUrl - URL dự phòng (nếu có)
     */
    initVideo(container, url, nextEpCallback, poster, backupUrl = null) {
        console.log('🎬 initVideo:', url, 'Backup:', backupUrl);
        this.destroy();
        if (container) container.innerHTML = '';

        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'video-container';
        container.appendChild(videoWrapper);

        // UI function to show error
        this.showError = (msg) => {
            videoWrapper.innerHTML = '';
            const errDiv = document.createElement('div');
            errDiv.style.cssText = 'width:100%;height:100%;background:#000;display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;text-align:center;gap:15px;';
            errDiv.innerHTML = `
                <div style="font-size:3rem;">⚠️</div>
                <div style="font-size:1.1rem;color:#f55;">${msg}</div>
                <div style="display:flex;gap:10px;">
                    <button onclick="location.reload()" style="padding:8px 16px;border-radius:4px;border:none;background:#333;color:white;cursor:pointer;">Tải lại trang</button>
                    ${backupUrl ? `<button id="retryBackup" style="padding:8px 16px;border-radius:4px;border:none;background:var(--accent);color:white;cursor:pointer;">Thử server dự phòng</button>` : ''}
                </div>
            `;
            videoWrapper.appendChild(errDiv);

            const retryBtn = errDiv.querySelector('#retryBackup');
            if (retryBtn) retryBtn.onclick = () => this.initVideo(container, backupUrl, nextEpCallback, poster, null);
        };

        if (url && url.includes('.m3u8')) {
            const video = document.createElement('video');
            video.className = 'video-player';
            if (poster) video.poster = poster;
            video.playsInline = true;
            video.autoplay = true;
            video.muted = true; // Start muted
            videoWrapper.appendChild(video);

            if (Hls.isSupported()) {
                // ① Plyr Setup
                this.plyr = new Plyr(video, {
                    autoplay: true,
                    muted: true,
                    controls: [
                        'play-large', 'play', 'progress', 'current-time', 'duration',
                        'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'
                    ],
                    settings: ['quality', 'speed']
                });

                this.plyr.on('ended', () => { if (nextEpCallback) nextEpCallback(); });
                video.addEventListener('playing', () => { video.muted = false; if (this.plyr) this.plyr.muted = false; }, { once: true });

                // ② HLS Setup
                this.hls = new Hls({
                    enableWorker: false,
                    maxBufferLength: 30,
                    startLevel: -1
                });

                // Error Handling
                this.hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.warn(`HLS Fatal: ${data.type} - ${data.details}`);
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.log('Network error, recovering...');
                                this.hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log('Media error, recovering...');
                                this.hls.recoverMediaError();
                                break;
                            default:
                                this.hls.destroy();
                                if (backupUrl && url !== backupUrl) {
                                    console.log('Switching to Backup URL');
                                    this.initVideo(container, backupUrl, nextEpCallback, poster, null);
                                } else {
                                    this.showError('Không thể phát video này.<br>Vui lòng thử tập khác hoặc server khác.');
                                }
                                break;
                        }
                    }
                });

                // Manifest Loaded
                this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    const levels = this.hls.levels;
                    const qualities = levels.map(l => l.height);
                    if (qualities.length > 0) this._createQualitySelector(videoWrapper, qualities);
                });

                this.hls.loadSource(url);
                this.hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Safari
                video.src = url;
                this.plyr = new Plyr(video);
                this.plyr.on('ended', () => { if (nextEpCallback) nextEpCallback(); });

                video.addEventListener('error', () => {
                    if (backupUrl) this.initVideo(container, backupUrl, nextEpCallback, poster, null);
                    else this.showError('Lỗi phát video trên trình duyệt này.');
                });
            } else {
                this.showError('Trình duyệt không hỗ trợ phát HLS.');
            }
        } else {
            // Embed Iframe
            if (!url) {
                this.showError('Link phim bị lỗi hoặc rỗng.');
                return;
            }
            videoWrapper.innerHTML = `<div class="plyr__video-embed" id="player">
                <iframe src="${url}" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>
            </div>`;
        }

        // Resume Logic

        if (typeof video !== 'undefined' && video) {
            const saveKey = `qhub-playback-${url}`;
            const savedTime = parseFloat(localStorage.getItem(saveKey) || '0');

            if (savedTime > 10) {
                video.addEventListener('loadedmetadata', () => {
                    video.currentTime = savedTime;

                    const toast = document.createElement('div');
                    // Format Time: HH:MM:SS
                    const date = new Date(0);
                    date.setSeconds(savedTime);
                    const timeString = date.toISOString().substr(11, 8);

                    toast.textContent = `▶ Tiếp tục xem từ ${timeString}`;
                    toast.style.cssText = `
                        position: absolute; top: 20px; left: 20px; z-index: 99;
                        background: rgba(0,0,0,0.7); color: #fff; padding: 5px 10px;
                        border-radius: 4px; pointer-events: none; opacity: 0; transition: opacity 0.5s;
                    `;
                    videoWrapper.appendChild(toast);
                    setTimeout(() => toast.style.opacity = 1, 100);
                    setTimeout(() => toast.remove(), 4000);
                }, { once: true });
            }

            // Save progress every 5s
            this._saveInterval = setInterval(() => {
                // Check plyr instance
                if (this.plyr && !this.plyr.paused) {
                    localStorage.setItem(saveKey, this.plyr.currentTime);
                }
            }, 5000);
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
        this._autoNextTriggered = false; // Reset auto-next state
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

            // === AUTO NEXT CHAPTER ===
            if (nav.next && !this._autoNextTriggered) {
                // Khi cuộn xuống gần đáy (còn 50px)
                if (scrollTop + container.clientHeight >= container.scrollHeight - 50) {
                    this._autoNextTriggered = true;

                    // Hiển thị thông báo
                    let toast = document.getElementById('auto-next-toast');
                    if (!toast) {
                        toast = document.createElement('div');
                        toast.id = 'auto-next-toast';
                        toast.innerText = 'Đang chuyển chương tiếp theo... ⏳';
                        toast.style.cssText = `
                            position: fixed;
                            bottom: 100px;
                            left: 50%;
                            transform: translateX(-50%);
                            background: rgba(20, 20, 30, 0.95);
                            color: #fff;
                            padding: 12px 24px;
                            border-radius: 50px;
                            z-index: 10000;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                            border: 1px solid var(--accent);
                            font-weight: 600;
                            animation: fadeInUp 0.3s ease;
                        `;
                        document.body.appendChild(toast);
                    }

                    // Chuyển chương sau 1s (để người dùng kịp nhận ra)
                    setTimeout(() => {
                        if (toast) toast.remove();
                        window.readChap(nav.next, true);
                    }, 500);
                }
            }
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
        // ⚠️ QUAN TRỌNG: Phải detach video src TRƯỚC khi destroy HLS
        // Nếu không, blob URL của MediaSource bị revoke trong khi browser
        // vẫn đang load → gây lỗi GET blob:ERR_FILE_NOT_FOUND
        if (this.hls) {
            const video = this.hls.media;
            if (video) {
                video.pause();
                video.removeAttribute('src');
                video.load(); // Reset trạng thái video
            }
            this.hls.destroy();
            this.hls = null;
        }
        if (this.plyr) {
            this.plyr.destroy();
            this.plyr = null;
        }

        // Cleanup reader elements
        if (this._readerCleanup) {
            this._readerCleanup();
            this._readerCleanup = null;
        }

        // Clear DOM containers
        const clear = (id) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        };
        clear('mediaContainer');
        clear('watchPlayerContainer');
        clear('readerContainer');
    },

    /**
     * Tạo quality selector overlay cho video player
     */
    _createQualitySelector(container, qualities) {
        // Xóa selector cũ nếu có
        const old = container.querySelector('.quality-selector');
        if (old) old.remove();

        const wrapper = document.createElement('div');
        wrapper.className = 'quality-selector';
        wrapper.innerHTML = `
            <button class="quality-btn" title="Chất lượng">
                <span>⚙</span>
                <span class="quality-label">Auto</span>
            </button>
            <div class="quality-menu hidden">
                <div class="quality-option active" data-level="-1">Auto</div>
                ${qualities.map((q, i) => `
                    <div class="quality-option" data-level="${i}">${q}p</div>
                `).join('')}
            </div>
        `;

        // Toggle menu
        const btn = wrapper.querySelector('.quality-btn');
        const menu = wrapper.querySelector('.quality-menu');
        const label = wrapper.querySelector('.quality-label');

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });

        // Chọn quality
        menu.addEventListener('click', (e) => {
            const opt = e.target.closest('.quality-option');
            if (!opt) return;

            const level = parseInt(opt.dataset.level);
            if (this.hls) {
                this.hls.currentLevel = level;
            }

            // Update UI
            menu.querySelectorAll('.quality-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            label.textContent = level === -1 ? 'Auto' : opt.textContent;
            menu.classList.add('hidden');
        });

        // Đóng menu khi click bên ngoài
        document.addEventListener('click', () => menu.classList.add('hidden'));

        container.appendChild(wrapper);
    }
};

window.Player = Player;
