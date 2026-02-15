/* === PLAY & READ LOGIC === */

// Helper to normalize episode name for comparison (e.g. "01" == "1")
const normalizeEpName = (name) => {
    if (name === null || name === undefined) return '';
    return name.toString().replace(/^0+/, '').trim().toLowerCase(); // Remove leading zeros, trim, lowercase
};

// Global function for playing movie episode
window.playEp = (url, epName, slug, name, thumb, backupUrl = null) => {
    // === AUTO FIND BACKUP FROM OTHER SERVERS ===
    if (!backupUrl && window.currentDetailData?.episodes) {
        try {
            const targetName = normalizeEpName(epName);
            console.log(`🔍 Searching backup for Ep [${epName}] -> Norm: [${targetName}]`);

            for (const server of window.currentDetailData.episodes) {
                const items = server.server_data || server.items || [];
                // Find loose match
                const sameEp = items.find(i => normalizeEpName(i.name) === targetName);

                if (sameEp) {
                    const otherLink = sameEp.link_embed || sameEp.link_m3u8;
                    if (otherLink && otherLink !== url) {
                        console.log(`🔗 Found Backup from Server [${server.server_name}]:`, otherLink);
                        backupUrl = otherLink;
                        break; // Found one is enough
                    }
                }
            }
            if (!backupUrl) console.log('❌ No backup found via cross-server search.');
        } catch (e) { console.error('Error finding backup server', e); }
    }

    // 0. Chuyển view: Ẩn detail, hiện watchPage
    document.getElementById('detailPage')?.classList.add('hidden');
    const watchPage = document.getElementById('watchPage');
    if (watchPage) watchPage.classList.remove('hidden');

    // 1. Setup Header
    const titleEl = document.getElementById('watchTitle');
    if (titleEl) titleEl.textContent = `${name} - Tập ${epName}`;
    document.title = `${name} - Tập ${epName} | QPhim`; // Set Playing Title

    // Back Button Logic
    const backBtn = document.getElementById('watchBackBtn');
    if (backBtn) {
        backBtn.onclick = () => {
            watchPage.classList.add('hidden');
            document.getElementById('detailPage')?.classList.remove('hidden');
            document.title = `${name} | QPhim`; // Reset title

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
                    const isWatched = window.checkWatched ? checkWatched(slug, ep.name) : false;

                    btn.className = `ep-item ${isActive ? 'active' : ''} ${isWatched ? 'watched' : ''}`;
                    btn.innerHTML = `<span class="ep-name">Tập ${ep.name}</span>`;
                    btn.dataset.ep = ep.name;

                    const link = ep.link_embed || ep.link_m3u8;
                    const backupUrl = (ep.link_m3u8 && ep.link_embed && ep.link_m3u8 !== ep.link_embed) ? ep.link_m3u8 : null;

                    btn.onclick = () => {
                        playEp(link, ep.name, slug, name, thumb, backupUrl);
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
    if (backupUrl) console.log('🛡️ Backup Link:', backupUrl);

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
        Player.initVideo(container, url, nextEpCallback, thumb, backupUrl);
    }

    // Lưu history phim & Mark Watched
    if (slug && name) {
        if (window.markWatched) markWatched(slug, epName);
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
window.readChap = async (apiUrl, scrollToTop = false, slug = null) => {
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
            if (window.currentDetailData) document.title = `${window.currentDetailData.name} | QPhim`; // Reset Title

            if (window.Player && Player.destroy) Player.destroy();
            container.innerHTML = '';
        };
    }

    try {
        // === 1. Đảm bảo có dữ liệu truyện (cho Nav/History) ===
        // Nếu chưa có detail hoặc slug không khớp, fetch lại detail
        if (slug && (!window.currentDetailData || window.currentDetailData.slug !== slug)) {
            console.log('Fetching comic detail for navigation:', slug);
            try {
                const detailRes = await API.getTruyenDetail(slug);
                if (detailRes && (detailRes.status === 'success' || detailRes.data)) {
                    window.currentDetailData = detailRes.data.item;
                } else {
                    console.error('API Error: detailRes format unexpected', detailRes);
                }
            } catch (err) {
                console.error('Failed to fetch detail for nav:', err);
            }
        }

        const json = await API.getTruyenChapter(apiUrl);

        if (json.status === 'success') {
            let domain = json.data.domain_cdn;
            // Fix domain ảnh nếu cần
            if (domain.includes('sv1.otruyencdn.com')) {
                domain = domain.replace('https://sv1.otruyencdn.com', '/api/truyen-chapter');
            }

            const path = json.data.item.chapter_path;
            const images = json.data.item.chapter_image.map(i => `${domain}/${path}/${i.image_file}`);

            // === 2. Tìm Nav + Tên chương ===
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
                        const cSlug = window.currentDetailData.slug;
                        const cName = all[idx].chapter_name;
                        if (window.markWatched) markWatched(cSlug, cName);

                        console.log('Saving History Truyen:', cSlug); // DEBUG LOG
                        saveHistory({
                            id: window.currentDetailData._id,
                            slug: cSlug,
                            name: window.currentDetailData.name,
                            thumb_url: window.currentDetailData.thumb_url,
                            chapter_name: cName,
                            chapter_api_data: apiUrl,
                            time: Date.now()
                        });

                        document.title = `${window.currentDetailData.name} - ${cName} | QPhim`; // Set Reading Title
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
        }
    } catch (e) {
        container.innerHTML = `<div class="error-msg">Lỗi tải: ${e.message}</div>`;
        console.error(e);
    }
};
