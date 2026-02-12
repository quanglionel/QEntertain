/* ============================================
   QPhim & QTruyện - Components v2
   Render giao diện & Xử lý chi tiết
   ============================================ */

const currentMode = localStorage.getItem('qhub-mode') || 'phim';
window.currentDetailData = null; // Lưu dữ liệu chi tiết (global để reader dùng)

function getModeConfig() { return APP_MODES[currentMode]; }

/* === HEADER === */
function renderHeader() {
    try {
        const header = document.getElementById('header');
        if (!header) return;

        const config = getModeConfig();
        const navHTML = config.navLinks.map(link =>
            `<a href="#" class="nav-link ${link.active ? 'active' : ''}" data-section="${link.section}">${link.label}</a>`
        ).join('');

        const modeTabsHTML = Object.values(APP_MODES).map(mode =>
            `<button class="mode-tab ${mode.id === currentMode ? 'active' : ''}" data-mode="${mode.id}">
                <span>${mode.icon}</span> ${mode.label}
            </button>`
        ).join('');

        header.innerHTML = `
            <div class="header-inner">
                <div class="header-left">
                    <a href="#" class="logo" onclick="handleNav('home'); return false;">
                        <span class="logo-icon">▶</span>
                        <span class="logo-text">${config.label}</span>
                    </a>
                    <div class="mode-switcher">${modeTabsHTML}</div>
                    <nav class="nav mobile-hidden">${navHTML}</nav>
                </div>
                <div class="header-right">
                    <!-- Mobile Shortcuts: Chỉ hiện trên mobile -->
                    <div class="mobile-shortcuts">
                        <button class="header-icon-btn" onclick="handleNav('genres')" aria-label="Thể loại">
                            ${ICONS.category}
                        </button>
                        <button class="header-icon-btn" onclick="handleNav('history')" aria-label="Lịch sử">
                            ${ICONS.history}
                        </button>
                    </div>
                    
                    <div class="search-box">
                        <input type="text" class="search-input" placeholder="Tìm kiếm phim, truyện...">
                        <button class="search-toggle">${ICONS.search}</button>
                    </div>
                </div>
            </div>
        `;

        // Khởi tạo chức năng tìm kiếm
        if (window.initSearchBox) window.initSearchBox();

        // Events
        header.querySelectorAll('.mode-tab').forEach(tab => {
            tab.onclick = () => {
                if (tab.dataset.mode !== currentMode) switchMode(tab.dataset.mode);
            };
        });

        // Event click nav links
        header.querySelectorAll('.nav-link').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                // Active state
                header.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                const section = link.dataset.section;
                const label = link.textContent;
                handleNav(section, label);
            };
        });

    } catch (e) {
        console.error('Render Header Error', e);
    }
}

// === Xử lý Navigation ===
window.handleNav = async (section, label) => {
    // 1. Home: Reload lại trang chủ
    if (section === 'home') {
        renderAll();
        return;
    }

    // 2. Ẩn Hero & Xóa nội dung cũ
    const hero = document.getElementById('hero');
    if (hero) hero.style.display = 'none';

    const main = document.getElementById('movieSections');
    if (!main) return;

    main.innerHTML = `
        <div class="loading-spinner-container" style="padding:100px 0;text-align:center;">
            <div class="loading-spinner"></div>
            <p style="margin-top:10px;color:var(--text-muted);">Đang tải ${label}...</p>
        </div>
    `;
    main.style.paddingTop = '80px'; // Header height

    try {
        // 3. Xử lý Thể loại
        if (section === 'genres') {
            const apiRes = currentMode === 'phim'
                ? await API.getPhimCategories()
                : await API.getTruyenCategories();

            if (apiRes?.data?.items) {
                renderGenreList(apiRes.data.items);
            } else {
                main.innerHTML = '<p class="text-center p-5">Không tải được danh sách thể loại.</p>';
            }
            return;
        }

        // 4. Xử lý Lịch sử
        if (section === 'history') {
            renderHistoryPage();
            return;
        }

        // 4. Xử lý Danh mục (Manga, Manhwa...)
        let items = [];
        // Gọi API tương ứng
        // Kiểm tra xem section có phải là một loại danh sách không
        const isListType = ['phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows', 'truyen-moi', 'sap-ra-mat', 'dang-phat-hanh', 'hoan-thanh'].includes(section);

        let res;
        if (isListType) {
            res = currentMode === 'phim'
                ? await API.getPhimList(section)
                : await API.getTruyenList(section);
        } else {
            // Ngược lại thử gọi theo thể loại (category)
            res = currentMode === 'phim'
                ? await API.getPhimByCategory(section)
                : await API.getTruyenByCategory(section);
        }

        if (res?.data?.items) {
            items = res.data.items;

            // Render Grid View
            main.innerHTML = `
                <section class="movie-section">
                    <div class="section-header">
                        <h2 class="section-title">${label}</h2>
                    </div>
                    <div class="movie-grid" id="gridContent"></div>
                </section>
            `;

            const grid = document.getElementById('gridContent');
            if (items.length === 0) {
                grid.innerHTML = '<p>Chưa có dữ liệu.</p>';
            } else {
                items.forEach(item => {
                    grid.appendChild(createCard(item));
                });
            }
        } else {
            main.innerHTML = `<p style="text-align:center;padding:50px;">Không tìm thấy dữ liệu cho mục "${label}".</p>`;
        }

    } catch (e) {
        console.error(e);
        main.innerHTML = `<p style="text-align:center;padding:50px;color:red;">Lỗi tải dữ liệu: ${e.message}</p>`;
    }
};

function renderGenreList(genres) {
    const main = document.getElementById('movieSections');
    main.innerHTML = `
        <section class="movie-section">
            <div class="section-header">
                <h2 class="section-title">Danh sách Thể loại</h2>
                <button class="see-all" onclick="handleNav('home')">← Trang chủ</button>
            </div>
            <div class="genre-grid-page" id="genreGrid"></div>
        </section>
    `;
    const grid = document.getElementById('genreGrid');
    genres.forEach(g => {
        const btn = document.createElement('button');
        btn.className = 'genre-tag-large';
        btn.textContent = g.name;
        btn.onclick = () => handleNav(g.slug, g.name);
        grid.appendChild(btn);
    });
}

/* === HERO === */
function renderHero(apiItems) {
    const slidesContainer = document.getElementById('heroSlides');
    if (!slidesContainer) return;

    if (!apiItems || apiItems.length === 0) {
        slidesContainer.innerHTML = '<div class="error-msg">Không có dữ liệu nổi bật</div>';
        return;
    }

    const slides = apiItems.slice(0, 5).map((item, i) => {
        const isPhim = currentMode === 'phim';
        return {
            title: item.name,
            slug: item.slug,
            bgImage: isPhim ? API.getPhimImageUrl(item.thumb_url) : API.getTruyenImageUrl(item.thumb_url),
            btnText: isPhim ? 'Xem ngay' : 'Đọc ngay',
            btnIcon: isPhim ? 'play' : 'book'
        };
    });

    slidesContainer.innerHTML = slides.map((slide, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}" data-slide="${i}">
            <div class="hero-bg" style="background-image: url('${slide.bgImage}');"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">${slide.title}</h1>
                <button class="btn-primary" onclick="showDetail('${slide.slug}')">
                    ${ICONS[slide.btnIcon]} ${slide.btnText}
                </button>
            </div>
        </div>
    `).join('');
}

/* === CARDS === */
function createCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => showDetail(item.slug);

    const isPhim = currentMode === 'phim';
    const imgUrl = isPhim ? API.getPhimImageUrl(item.thumb_url) : API.getTruyenImageUrl(item.thumb_url);

    card.innerHTML = `
        <div class="movie-poster">
            <img class="movie-poster-img" src="${imgUrl}" loading="lazy" onerror="this.parentElement.style.backgroundColor='#333'">
            <div class="movie-poster-overlay">
                <div class="play-icon">${ICONS[isPhim ? 'play' : 'book']}</div>
            </div>
            <span class="movie-quality">${isPhim ? (item.quality || 'HD') : 'Truyện'}</span>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${item.name}</h3>
        </div>
    `;
    return card;
}

function renderList(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.innerHTML = '<div>Trống</div>';
        return;
    }

    items.forEach(item => {
        if (item) container.appendChild(createCard(item));
    });
}

function renderSections() {
    const container = document.getElementById('movieSections');
    if (!container) return;
    container.innerHTML = '';

    const isTruyen = currentMode === 'truyen';

    // 1. Render Lịch sử (Nếu có & là Truyện)
    if (isTruyen) {
        const history = JSON.parse(localStorage.getItem('qhub-history') || '[]');
        if (history.length > 0) {
            const items = history.slice(0, 10); // Lấy 10 truyện gần nhất

            const section = document.createElement('section');
            section.className = 'movie-section';
            section.innerHTML = `
                <div class="section-header">
                    <h2 class="section-title">🕒 Đọc tiếp</h2>
                    <button class="see-all" onclick="handleNav('history')">Xem tất cả</button>
                </div>
                <div class="movie-list" id="homeHistoryList"></div>
            `;
            container.appendChild(section);

            const list = section.querySelector('#homeHistoryList');
            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'movie-card';
                // Click vào là đọc tiếp luôn chapter đó
                card.onclick = () => readChap(item.chapter_api_data);

                const imgUrl = API.getTruyenImageUrl(item.thumb_url);

                card.innerHTML = `
                    <div class="movie-poster">
                        <img class="movie-poster-img" src="${imgUrl}" loading="lazy" onerror="this.parentElement.style.backgroundColor='#333'">
                        <div class="movie-poster-overlay">
                            <div class="play-icon">${ICONS.book}</div>
                        </div>
                        <span class="movie-quality" style="background:var(--accent);">Ch.${item.chapter_name}</span>
                    </div>
                    <div class="movie-info">
                        <h3 class="movie-title">${item.name}</h3>
                    </div>
                `;
                list.appendChild(card);
            });
        }
    }

    // 2. Render các section chính
    const sections = currentMode === 'phim' ? PHIM_SECTIONS : TRUYEN_SECTIONS;
    // Append tiếp các section khác
    const mainHTML = sections.map(section => `
        <section class="movie-section">
            <div class="section-header">
                <h2 class="section-title">${section.title}</h2>
                <div class="section-controls">
                    <button class="scroll-btn" onclick="scrollList('${section.listId}', -1)">❮</button>
                    <button class="scroll-btn" onclick="scrollList('${section.listId}', 1)">❯</button>
                </div>
            </div>
            <div class="movie-list" id="${section.listId}">
                <div class="loading-spinner">...</div>
            </div>
        </section>
    `).join('');

    // Dùng insertAdjacentHTML để không mất section Lịch sử đã append
    container.insertAdjacentHTML('beforeend', mainHTML);
}

// Hàm cuộn danh sách (Global)
window.scrollList = (listId, direction) => {
    const list = document.getElementById(listId);
    if (list) {
        const scrollAmount = list.clientWidth * 0.8; // Cuộn 80% chiều rộng
        list.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
};

/* === DETAIL & PLAY === */
async function showDetail(slug) {
    const detailPage = document.getElementById('detailPage');
    const content = document.getElementById('detailContent');
    if (!detailPage || !content) return;

    detailPage.classList.remove('hidden');
    content.innerHTML = '<div class="loading-spinner">Đang tải...</div>';

    try {
        let data;
        const isPhim = currentMode === 'phim';

        if (isPhim) {
            const res = await API.getPhimDetail(slug);
            console.log('Phim Detail Res:', JSON.stringify(res));

            // Check lỏng hơn: có thể API thay đổi cấu trúc
            if (!res || (res.status === false)) {
                throw new Error('API trả về lỗi hoặc không có dữ liệu');
            }
            // Fallback nếu res.movie không có nhưng có res.data.item (giống OTruyen?)
            data = res.movie || res.data?.item;

            if (!data) throw new Error('Không tìm thấy res.movie hoặc res.data.item');

            // Lưu data để dùng cho Next/Prev
            window.currentDetailData = data;

            // Gán episodes vào data để render
            data.episodes = res.episodes || [];
        } else {
            const res = await API.getTruyenDetail(slug);
            if (!res.data) throw new Error('Lỗi tải truyện');
            data = res.data.item;
            window.currentDetailData = data; // Lưu data
        }

        renderDetailContent(data, isPhim);
    } catch (err) {
        content.innerHTML = `<div class="error-msg">Lỗi: ${err.message}</div>`;
        console.error(err);
    }

    // Close btn
    const closeBtn = document.getElementById('closeDetailBtn');
    if (closeBtn) closeBtn.onclick = closeDetail;
}

function closeDetail() {
    const detailPage = document.getElementById('detailPage');
    if (detailPage) detailPage.classList.add('hidden');
    // Stop player
    const media = document.getElementById('mediaContainer');
    if (media) media.innerHTML = '';
}

function renderDetailContent(item, isPhim) {
    const content = document.getElementById('detailContent');
    const imgUrl = isPhim ? API.getPhimImageUrl(item.thumb_url) : API.getTruyenImageUrl(item.thumb_url);

    // Nút Play/Read primary
    let primaryBtn = '';
    if (isPhim && item.episodes?.length > 0) {
        const ep = item.episodes[0].server_data[0];
        primaryBtn = `<button class="btn-large btn-play" onclick="playEp('${ep.link_m3u8 || ep.link_embed}')">Xem Ngay</button>`;
    } else if (!isPhim && item.chapters?.length > 0) {
        const chap = item.chapters[0].server_data[0];
        primaryBtn = `<button class="btn-large btn-play" onclick="readChap('${chap.chapter_api_data}')">Đọc Ngay</button>`;
    }

    content.innerHTML = `
        <div class="detail-header">
            <div class="detail-poster"><img src="${imgUrl}"></div>
            <div class="detail-info">
                <h1 class="detail-title">${item.name}</h1>
                <div class="detail-actions">${primaryBtn}</div>
                <div class="detail-desc">${item.content || item.description || ''}</div>
                
                <div id="mediaContainer" class="player-section"></div>
                
                <div class="server-list-container">
                    <h3>${isPhim ? 'Tập' : 'Chương'}</h3>
                    <div id="serverList" class="server-list"></div>
                </div>
            </div>
        </div>
    `;

    renderListButtons(item, isPhim);
}

function renderListButtons(item, isPhim) {
    const list = document.getElementById('serverList');
    if (!list) return;
    list.innerHTML = ''; // Clear old content

    if (isPhim) {
        list.className = 'server-list episode-list'; // Grid layout for movies
        item.episodes.forEach(server => {
            if (item.episodes.length > 1) {
                const title = document.createElement('h4');
                title.className = 'server-title';
                title.textContent = server.server_name;
                list.appendChild(title);
            }
            const grid = document.createElement('div');
            grid.className = 'episode-grid';

            server.server_data.forEach(ep => {
                const btn = document.createElement('button');
                btn.className = 'server-btn';
                btn.innerText = ep.name;
                btn.onclick = () => playEp(ep.link_m3u8 || ep.link_embed);
                grid.appendChild(btn);
            });
            list.appendChild(grid);
        });
    } else {
        list.className = 'chapter-list-vertical'; // Vertical list for manga

        // Flatten chapters if multiple servers (rare for OTruyen but handle it)
        item.chapters.forEach(server => {
            // Hiển thị từ mới nhất -> cũ nhất
            const chapters = [...server.server_data].reverse();

            chapters.forEach(chap => {
                const row = document.createElement('div');
                row.className = 'chapter-item';
                row.onclick = () => readChap(chap.chapter_api_data);

                // Chỉ lấy thời gian từ chính chapter (nếu có)
                const timeStr = chap.updated_at || chap.created_at;
                const timeDisplay = timeStr ? formatRelativeTime(timeStr) : '';

                row.innerHTML = `
                    <div class="chapter-info">
                        <span class="chapter-name">Chương ${chap.chapter_name}</span>
                        ${chap.chapter_title ? `<span class="chapter-sub">${chap.chapter_title}</span>` : ''}
                    </div>
                    ${timeDisplay ? `
                    <div class="chapter-meta">
                        <span class="chapter-time">${timeDisplay}</span>
                    </div>` : ''}
                `;
                list.appendChild(row);
            });
        });
    }
}

function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = (now - date) / 1000;

        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
        if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
        return date.toLocaleDateString('vi-VN');
    } catch (e) { return ''; }
}

// Global functions for onclick HTML
window.playEp = (url) => {
    const container = document.getElementById('mediaContainer');
    if (container && window.Player) Player.initVideo(container, url);
};

window.readChap = async (apiUrl, scrollToTop = false) => {
    const readerPage = document.getElementById('readerPage');
    const container = document.getElementById('readerContainer');
    if (!container || !readerPage) return;

    // Mở reader page, ẩn detail page
    readerPage.classList.remove('hidden');
    document.getElementById('detailPage')?.classList.add('hidden');

    container.innerHTML = '<div class="loading-spinner">Đang tải trang...</div>';

    // Nút quay lại → đóng reader, mở lại detail
    const backBtn = document.getElementById('readerBackBtn');
    if (backBtn) {
        backBtn.onclick = () => {
            readerPage.classList.add('hidden');
            document.getElementById('detailPage')?.classList.remove('hidden');
            Player.destroy();
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

            // Tìm Nav + tên chương (1 lần duyệt duy nhất)
            let nav = { prev: null, next: null };
            let currentChapterName = '';

            if (window.currentDetailData?.chapters) {
                const all = [];
                window.currentDetailData.chapters.forEach(s => {
                    if (s.server_data) all.push(...s.server_data);
                });
                const idx = all.findIndex(c => c.chapter_api_data === apiUrl);
                if (idx !== -1) {
                    if (idx > 0) nav.prev = all[idx - 1].chapter_api_data;
                    if (idx < all.length - 1) nav.next = all[idx + 1].chapter_api_data;
                    currentChapterName = `Ch. ${all[idx].chapter_name}`;

                    // === LƯU LỊCH SỬ ===
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

/* === SWITCH MODE === */
function switchMode(mode) {
    // Save mode
    localStorage.setItem('qhub-mode', mode);
    // Reload page to apply changes cleanly (simple approach)
    location.reload();
}

/* === GENRES SECTION === */
// (Removed renderGenresSection and loadGenre)

// window.loadGenre = loadGenre; // Removed


window.showDetail = showDetail;
window.switchMode = switchMode;
window.clearHistory = clearHistory;

/* === HISTORY STORAGE & RENDER === */
function saveHistory(data) {
    if (!data.slug) return;
    try {
        let history = JSON.parse(localStorage.getItem('qhub-history') || '[]');
        history = history.filter(h => h.slug !== data.slug);
        history.unshift(data);
        if (history.length > 50) history.pop();
        localStorage.setItem('qhub-history', JSON.stringify(history));
    } catch (e) { console.error('History Save Error', e); }
}

function renderHistoryPage() {
    const main = document.getElementById('movieSections');
    const history = JSON.parse(localStorage.getItem('qhub-history') || '[]');

    if (history.length === 0) {
        main.innerHTML = `
            <section class="movie-section">
                <div class="section-header">
                    <h2 class="section-title">🕒 Lịch sử đọc truyện</h2>
                    <button class="see-all" onclick="handleNav('home')">← Trang chủ</button>
                </div>
                <div style="text-align:center;padding:60px 20px;color:var(--text-muted);background:rgba(255,255,255,0.02);border-radius:12px;">
                    <div style="font-size:3rem;margin-bottom:10px;">📭</div>
                    <p>Bạn chưa đọc truyện nào.</p>
                </div>
            </section>
        `;
        return;
    }

    main.innerHTML = `
        <section class="movie-section">
            <div class="section-header">
                <h2 class="section-title">🕒 Lịch sử đọc truyện</h2>
                <div class="section-controls">
                    <button class="see-all" onclick="clearHistory()" style="color:#ff5555;margin-right:10px;">Xóa tất cả</button>
                    <button class="see-all" onclick="handleNav('home')">← Trang chủ</button>
                </div>
            </div>
            <div class="movie-grid" id="historyGrid"></div>
        </section>
    `;

    const grid = document.getElementById('historyGrid');
    history.forEach(item => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => readChap(item.chapter_api_data);

        const imgUrl = API.getTruyenImageUrl(item.thumb_url);

        card.innerHTML = `
            <div class="movie-poster">
                <img src="${imgUrl}" class="movie-poster-img" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
                <div class="movie-episode" style="background:var(--accent);bottom:0;left:0;right:0;text-align:center;border-radius:0;">
                    Đọc tiếp Ch.${item.chapter_name}
                </div>
            </div>
            <div class="movie-info">
                <div class="movie-title">${item.name}</div>
                <div class="movie-meta">
                    <span class="movie-year" style="font-size:0.75rem;color:var(--text-muted);">${formatRelativeTime(item.time)}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function clearHistory() {
    if (confirm('Xóa toàn bộ lịch sử đọc truyện?')) {
        localStorage.removeItem('qhub-history');
        renderHistoryPage();
    }
}

/* === INIT === */
async function renderAll() {
    console.log('Init App...');
    renderHeader();
    renderSections();

    const isPhim = currentMode === 'phim';
    try {
        const apiData = isPhim ? await API.getPhimHome() : await API.getTruyenHome();
        if (apiData && apiData.data?.items) {
            const items = apiData.data.items;
            console.log('API loaded:', items.length);

            // Xử lý Hero Banner: Chỉ hiện khi xem Phim
            const heroSection = document.getElementById('hero');
            if (isPhim) {
                if (heroSection) heroSection.style.display = 'block';
                renderHero(items);
                if (window.initSlider) window.initSlider();
            } else {
                if (heroSection) heroSection.style.display = 'none';
                const main = document.getElementById('movieSections');
                if (main) main.style.paddingTop = '100px'; // Header height + padding
            }

            const sections = isPhim ? PHIM_SECTIONS : TRUYEN_SECTIONS;

            // Render full list items vào từng section để giao diện đầy đặn
            sections.forEach((sec, i) => {
                // Clone mảng item để không ảnh hưởng gốc
                let secItems = [...items];

                // Đảo thứ tự hoặc cắt bớt tùy ý để tạo sự khác biệt giả
                if (i === 1) secItems.reverse();
                else if (i === 2) secItems.sort(() => Math.random() - 0.5); // Shuffle nhẹ

                renderList(sec.listId, secItems);
            });

            // Render thể loại section (Removed)
            // renderGenresSection();
        } else {
            console.log('No API Data');
        }
    } catch (e) {
        console.error('API Init Error', e);
    }
}

// Expose renderAll for app.js
window.renderAll = renderAll;
