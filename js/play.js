/* === PLAY & READ LOGIC === */

// Global function for playing movie episode
window.playEp = (url, epName, slug, name, thumb) => {
    // 0. Chuyển view: Ẩn detail, hiện watchPage
    document.getElementById('detailPage')?.classList.add('hidden');
    const watchPage = document.getElementById('watchPage');
    if (watchPage) watchPage.classList.remove('hidden');

    // 1. Setup Header
    const titleEl = document.getElementById('watchTitle');
    if (titleEl) titleEl.textContent = `${name} - Tập ${epName}`;

    // Back Button Logic
    const backBtn = document.getElementById('watchBackBtn');
    if (backBtn) {
        backBtn.onclick = () => {
            watchPage.classList.add('hidden');
            document.getElementById('detailPage')?.classList.remove('hidden');

            // Stop video
            if (window.Player) Player.destroy();
        };
    }

    // 2. Render List Episodes (Vertical List)
    const listContainer = document.getElementById('watchEpisodeList');
    if (listContainer) {
        listContainer.innerHTML = ''; // Reset list

        const data = window.currentDetailData;
        if (data && data.episodes) {
            data.episodes.forEach(server => {
                // Server Header (nếu có nhiều server)
                if (data.episodes.length > 1) {
                    const h = document.createElement('div');
                    h.innerText = server.server_name || 'Server';
                    h.style.cssText = 'padding:8px 12px;color:#888;font-size:0.75rem;text-transform:uppercase;font-weight:700;margin-top:5px;';
                    listContainer.appendChild(h);
                }

                const svData = server.server_data || server.items || [];
                svData.forEach(ep => {
                    const btn = document.createElement('div');
                    const isActive = (ep.name.toString() === epName.toString());
                    btn.className = `ep-item ${isActive ? 'active' : ''}`;
                    btn.innerHTML = `<span class="ep-name">Tập ${ep.name}</span>`;
                    btn.dataset.ep = ep.name;

                    const link = ep.link_m3u8 || ep.link_embed;

                    btn.onclick = () => {
                        playEp(link, ep.name, slug, name, thumb);
                    };

                    listContainer.appendChild(btn);

                    // Scroll playing item into view
                    if (isActive) {
                        setTimeout(() => btn.scrollIntoView({ block: 'center', behavior: 'smooth' }), 200);
                    }
                });
            });
        }
    }

    // 3. Init Player
    const container = document.getElementById('watchPlayerContainer');

    // Auto Next Callback
    const nextEpCallback = () => {
        const toggle = document.getElementById('autoNextToggle');
        const isAuto = toggle ? toggle.checked : true;

        if (!isAuto) return;

        // Tìm tập đang active
        const activeItem = listContainer.querySelector('.ep-item.active');
        if (activeItem) {
            let next = activeItem.nextElementSibling;
            while (next && !next.classList.contains('ep-item')) {
                next = next.nextElementSibling;
            }

            if (next) {
                console.log('Auto Next:', next.textContent);
                next.click();
            }
        }
    };

    if (container && window.Player) {
        Player.initVideo(container, url, nextEpCallback, thumb);
    }

    // Lưu history phim
    if (slug && name) {
        saveHistory({
            id: slug,
            slug: slug,
            name: name,
            thumb_url: thumb,
            episode_name: epName,
            episode_url: url,
            time: Date.now()
        });
    }
};

// Global function for reading comic chapter
window.readChap = async (apiUrl, scrollToTop = false) => {
    const readerPage = document.getElementById('readerPage');
    const container = document.getElementById('readerContainer');
    if (!container || !readerPage) return;

    // Mở reader page, ẩn detail page
    readerPage.classList.remove('hidden');
    document.getElementById('detailPage')?.classList.add('hidden');

    container.innerHTML = '<div class="loading-spinner">Đang tải trang...</div>';

    // Nút quay lại
    const backBtn = document.getElementById('readerBackBtn');
    if (backBtn) {
        backBtn.onclick = () => {
            readerPage.classList.add('hidden');
            document.getElementById('detailPage')?.classList.remove('hidden');
            if (window.Player && Player.destroy) Player.destroy();
            container.innerHTML = '';
        };
    }

    try {
        const json = await API.getTruyenChapter(apiUrl);

        if (json.status === 'success') {
            let domain = json.data.domain_cdn;
            if (domain.includes('sv1.otruyencdn.com')) {
                domain = domain.replace('https://sv1.otruyencdn.com', '/api/truyen-chapter');
            }

            const path = json.data.item.chapter_path;
            const images = json.data.item.chapter_image.map(i => `${domain}/${path}/${i.image_file}`);

            // Tìm Nav + tên chương
            let nav = { prev: null, next: null };
            let currentChapterName = '';

            if (window.currentDetailData?.chapters) {
                const all = [];
                window.currentDetailData.chapters.forEach(s => {
                    if (s.server_data) all.push(...s.server_data);
                });

                // Sort tăng dần theo số chapter để tính Next/Prev đúng
                all.sort((a, b) => parseFloat(a.chapter_name) - parseFloat(b.chapter_name));

                const idx = all.findIndex(c => c.chapter_api_data === apiUrl);
                if (idx !== -1) {
                    // Prev: Chap nhỏ hơn (index - 1)
                    if (idx > 0) nav.prev = all[idx - 1].chapter_api_data;
                    // Next: Chap lớn hơn (index + 1)
                    if (idx < all.length - 1) nav.next = all[idx + 1].chapter_api_data;

                    currentChapterName = `Ch.${all[idx].chapter_name}`;

                    // === LƯU LỊCH SỬ TRUYỆN ===
                    if (window.currentDetailData) {
                        saveHistory({
                            id: window.currentDetailData._id,
                            slug: window.currentDetailData.slug,
                            name: window.currentDetailData.name,
                            thumb_url: window.currentDetailData.thumb_url,
                            chapter_name: all[idx].chapter_name,
                            chapter_api_data: apiUrl,
                            time: Date.now()
                        });
                    }
                }
            }

            if (window.Player) {
                Player._currentApiUrl = apiUrl;
                Player.initReader(container, images, nav, currentChapterName);
                container.scrollTo({ top: 0, behavior: 'instant' });
            } else {
                container.innerHTML = 'Lỗi: Không tìm thấy trình đọc.';
            }
        } else {
            container.innerHTML = `<div class="error-msg">Lỗi API: ${json.message || 'Unknown'}</div>`;
        }
    } catch (e) {
        container.innerHTML = `<div class="error-msg">Lỗi tải: ${e.message}</div>`;
        console.error(e);
    }
};
