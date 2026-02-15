/* ============================================
   QPhim & QTruyện - Player & Reader Logic
   Xử lý phát video (ArtPlayer) và đọc truyện
   ============================================ */

const Player = {
    art: null,

    /**
     * Khởi tạo trình phát video ArtPlayer
     * @param {HTMLElement} container - Nơi chứa player
     * @param {string} url - URL video (m3u8 hoặc embed)
     * @param {Function} nextEpCallback - Hàm gọi khi hết phim (Auto Next)
     * @param {string} poster - URL ảnh thumb
     * @param {string} backupUrl - URL dự phòng (nếu có)
     */
    initVideo(container, url, nextEpCallback, poster, backupUrl = null) {
        console.log('🎬 ArtPlayer init:', url);
        this.destroy();
        if (container) container.innerHTML = '';

        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'video-container';
        videoWrapper.style.width = '100%';
        videoWrapper.style.height = '100%';
        container.appendChild(videoWrapper);

        // UI function to show error
        this.showError = (msg) => {
            videoWrapper.innerHTML = `
                <div style="width:100%;height:100%;background:#000;display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;text-align:center;gap:15px;padding:20px;">
                    <div style="font-size:3rem;">⚠️</div>
                    <div style="font-size:1.1rem;color:#f55;max-width:80%;">${msg}</div>
                    <div style="display:flex;gap:10px;">
                        <button onclick="location.reload()" style="padding:8px 16px;border-radius:4px;border:none;background:#333;color:white;cursor:pointer;">Tải lại trang</button>
                        ${backupUrl ? `<button id="retryBackup" style="padding:8px 16px;border-radius:4px;border:none;background:var(--accent);color:white;cursor:pointer;">Thử server dự phòng</button>` : ''}
                    </div>
                </div>
            `;
            const retryBtn = videoWrapper.querySelector('#retryBackup');
            if (retryBtn) retryBtn.onclick = () => this.initVideo(container, backupUrl, nextEpCallback, poster, null);
        };

        if (!url || url.trim() === '') {
            if (backupUrl) return this.initVideo(container, backupUrl, nextEpCallback, poster, null);
            return this.showError('Link phim bị lỗi hoặc rỗng.');
        }

        // --- XỬ LÝ M3U8 (Native) ---
        if (url.includes('.m3u8')) {
            const saveKey = `qhub-playback-${url}`;
            const savedTime = parseFloat(QStorage.get(saveKey, 0));

            this.art = new Artplayer({
                container: videoWrapper,
                url: url,
                poster: poster || '',
                volume: 0.7,
                isLive: false,
                muted: false,
                autoplay: true,
                autoSize: true,
                autoMini: true,
                playbackRate: true,
                aspectRatio: true,
                setting: true,
                pip: true,
                fullscreen: true,
                fullscreenWeb: true,
                subtitleOffset: true,
                miniProgressBar: true,
                mutex: true,
                backdrop: true,
                playsInline: true,
                autoPlayback: true,
                airplay: true,
                lock: true,
                fastForward: true,
                theme: '#e50914', // Netflix Red
                moreVideoAttr: {
                    crossOrigin: 'anonymous',
                },
                customType: {
                    m3u8: function (video, url, art) {
                        if (Hls.isSupported()) {
                            if (art.hls) art.hls.destroy();
                            const hls = new Hls({
                                fragLoadingMaxRetry: 3,
                                manifestLoadingMaxRetry: 2
                            });
                            hls.loadSource(url);
                            hls.attachMedia(video);
                            art.hls = hls;

                            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                                // Cập nhật Quality Menu từ levels
                                const levels = hls.levels;
                                if (levels && levels.length > 1) {
                                    art.setting.update({
                                        name: 'quality',
                                        width: 150,
                                        html: 'Chất lượng',
                                        selector: [
                                            {
                                                html: 'Auto',
                                                level: -1,
                                                default: true,
                                            },
                                            ...levels.map((level, index) => ({
                                                html: level.height + 'p',
                                                level: index,
                                            }))
                                        ],
                                        onSelect: function (item) {
                                            hls.currentLevel = item.level;
                                            return item.html;
                                        }
                                    });
                                }
                            });

                            // Lỗi HLS
                            hls.on(Hls.Events.ERROR, (event, data) => {
                                if (data.fatal) {
                                    console.warn('HLS Fatal Error, checking backup...');
                                    if (backupUrl) {
                                        art.destroy();
                                        Player.initVideo(container, backupUrl, nextEpCallback, poster, null);
                                    }
                                }
                            });
                        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                            video.src = url;
                        } else {
                            art.notice.show = 'Trình duyệt không hỗ trợ HLS';
                        }
                    },
                },
                controls: [
                    {
                        position: 'right',
                        html: 'S.Shot',
                        click: function () {
                            this.screenshot();
                        },
                    },
                ],
            });

            // --- Events & Logic ---
            this.art.on('ready', () => {
                if (savedTime > 10) {
                    this.art.currentTime = savedTime;
                    this.art.notice.show = `▶ Tiếp tục xem từ ${Math.floor(savedTime / 60)}:${Math.floor(savedTime % 60)}`;
                }
            });

            this.art.on('video:ended', () => {
                console.log('🎬 Film ended, calling next...');
                if (nextEpCallback) nextEpCallback();
            });

            this.art.on('video:timeupdate', () => {
                const currentTime = this.art.currentTime;
                if (currentTime > 10) {
                    QStorage.save(saveKey, currentTime);
                }
            });

            // Xử lý lỗi load ban đầu
            this.art.on('video:error', () => {
                console.error('ArtPlayer Video Error');
                if (backupUrl) {
                    this.art.destroy();
                    this.initVideo(container, backupUrl, nextEpCallback, poster, null);
                }
            });

        } else {
            // --- XỬ LÝ EMBED / IFRAME ---
            console.log('🔗 Playing Embed Iframe:', url);
            videoWrapper.innerHTML = `
                <iframe src="${url}" style="width:100%;height:100%;border:none;" allowfullscreen allow="autoplay; encrypted-media"></iframe>
            `;

            // Notify loss of features
            const toastId = 'embed-warning-toast';
            if (!document.getElementById(toastId)) {
                const toast = document.createElement('div');
                toast.id = toastId;
                toast.innerHTML = '⚠️ Chế độ Embed: Một số tính năng thông minh có thể bị hạn chế.';
                toast.style.cssText = 'position:fixed;top:80px;right:20px;background:rgba(255,165,0,0.9);color:#000;padding:10px 15px;border-radius:5px;z-index:9999;font-size:0.85rem;font-weight:bold;pointer-events:none;animation:fadeInOut 5s forwards;';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 5000);
            }
        }

        videoWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    /**
     * Khởi tạo trình đọc truyện (Premium)
     */
    initReader(container, images, nav = {}, chapterName = '') {
        console.log('📖 Reader init:', chapterName);
        this.destroy(); // Clear old content
        this._autoNextTriggered = false; // Reset auto-next state
        if (container) container.innerHTML = '';

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
            container.scrollTo({ top: 0, behavior: 'smooth' });
        };

        // ===== Container chính =====
        const readingContainer = document.createElement('div');
        readingContainer.className = 'reading-container';

        // Xử lý scroll
        const onScroll = () => {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.width = percent + '%';
            scrollTopBtn.classList.toggle('visible', scrollTop > 500);

            // AUTO NEXT CHAPTER
            if (nav.next && !this._autoNextTriggered) {
                if (scrollTop + container.clientHeight >= container.scrollHeight - 100) {
                    this._autoNextTriggered = true;
                    let toast = document.getElementById('auto-next-toast');
                    if (!toast) {
                        toast = document.createElement('div');
                        toast.id = 'auto-next-toast';
                        toast.innerText = 'Đang chuyển chương tiếp theo... ⏳';
                        toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(20,20,30,0.95);color:#fff;padding:12px 24px;border-radius:50px;z-index:10000;border:1px solid var(--accent);font-weight:600;animation:fadeInUp 0.3s ease;';
                        document.body.appendChild(toast);
                    }
                    setTimeout(() => {
                        if (toast) toast.remove();
                        window.readChap(nav.next, true);
                    }, 500);
                }
            }
        };

        container.addEventListener('scroll', onScroll);

        this._readerCleanup = () => {
            container.removeEventListener('scroll', onScroll);
            if (progressBar) progressBar.remove();
            if (scrollTopBtn) scrollTopBtn.remove();
            const lmb = document.querySelector('.reader-load-mode');
            if (lmb) lmb.remove();
        };

        // Navigation Helper
        const currentApiUrl = this._currentApiUrl || '';
        const createNav = () => {
            const navDiv = document.createElement('div');
            navDiv.className = 'reader-nav';

            const prevBtn = document.createElement('button');
            prevBtn.className = 'nav-btn';
            prevBtn.innerHTML = '❮ Trước';
            prevBtn.disabled = !nav.prev;
            if (nav.prev) prevBtn.onclick = () => window.readChap(nav.prev, true);

            const indicatorWrap = document.createElement('div');
            indicatorWrap.className = 'chapter-indicator-wrap';

            const indicator = document.createElement('button');
            indicator.className = 'chapter-indicator';
            indicator.textContent = (chapterName || '📖') + ' ▾';

            const dropdown = document.createElement('div');
            dropdown.className = 'chapter-dropdown';

            if (window.currentDetailData?.chapters) {
                window.currentDetailData.chapters.forEach(server => {
                    if (!server.server_data) return;
                    server.server_data.forEach(chap => {
                        const item = document.createElement('button');
                        item.className = 'chapter-dropdown-item';
                        item.textContent = `Ch. ${chap.chapter_name}`;
                        if (chap.chapter_api_data === currentApiUrl) item.classList.add('active');
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
                if (dropdown.classList.contains('open')) {
                    const activeItem = dropdown.querySelector('.active');
                    if (activeItem) activeItem.scrollIntoView({ block: 'center' });
                }
            };

            document.addEventListener('click', () => dropdown.classList.remove('open'), { once: false });

            const nextBtn = document.createElement('button');
            nextBtn.className = 'nav-btn';
            nextBtn.innerHTML = 'Sau ❯';
            nextBtn.disabled = !nav.next;
            if (nav.next) nextBtn.onclick = () => window.readChap(nav.next, true);

            indicatorWrap.appendChild(indicator);
            indicatorWrap.appendChild(dropdown);
            navDiv.appendChild(prevBtn);
            navDiv.appendChild(indicatorWrap);
            navDiv.appendChild(nextBtn);
            return navDiv;
        };

        readingContainer.appendChild(createNav());

        // Render Images
        if (!images || images.length === 0) {
            readingContainer.innerHTML += '<p style="color:#fff;text-align:center;padding:40px;">Không có nội dung chương này.</p>';
        } else {
            const fragment = document.createDocumentFragment();
            images.forEach((imgUrl, idx) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'img-skeleton';
                const img = document.createElement('img');
                img.className = 'chapter-image';
                img.loading = idx < 5 ? 'eager' : 'lazy';
                img.decoding = 'async';
                img.src = imgUrl;
                img.onload = () => {
                    img.classList.add('loaded');
                    wrapper.classList.remove('img-skeleton');
                };
                wrapper.appendChild(img);
                fragment.appendChild(wrapper);
            });
            readingContainer.appendChild(fragment);
        }

        readingContainer.appendChild(createNav());
        container.appendChild(readingContainer);
    },

    destroy() {
        if (this.art) {
            console.log('Destroying ArtPlayer...');
            if (this.art.hls) this.art.hls.destroy();
            this.art.destroy(true);
            this.art = null;
        }

        // Clear containers
        ['mediaContainer', 'watchPlayerContainer', 'readerContainer'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });

        if (this._readerCleanup) {
            this._readerCleanup();
            this._readerCleanup = null;
        }
    }
};

window.Player = Player;
