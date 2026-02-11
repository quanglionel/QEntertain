/* ============================================
   QPhim & QTruyện - Components
   Render giao diện & Xử lý chi tiết
   ============================================ */

let currentMode = localStorage.getItem('qhub-mode') || 'phim';
let currentDetailData = null; // Lưu dữ liệu chi tiết đang xem

function getModeConfig() { return APP_MODES[currentMode]; }

/* === HEADER === */
function renderHeader() {
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
                <a href="#" class="logo" onclick="location.reload()">
                    <span class="logo-icon">▶</span>
                    <span class="logo-text">${config.label}</span>
                </a>
                <div class="mode-switcher">${modeTabsHTML}</div>
                <nav class="nav mobile-hidden">${navHTML}</nav>
            </div>
            <div class="header-right">
                <div class="search-box" id="searchBox">
                    <button class="search-toggle">${ICONS.search}</button>
                    <input type="text" class="search-input" placeholder="${config.searchPlaceholder}">
                </div>
                <button class="theme-toggle" id="themeToggle">
                    <span class="theme-icon moon">🌙</span>
                    <span class="theme-icon sun">☀️</span>
                    <span class="theme-slider"></span>
                </button>
            </div>
        </div>
    `;

    // Events
    header.querySelectorAll('.mode-tab').forEach(tab => {
        tab.onclick = () => {
            if (tab.dataset.mode !== currentMode) switchMode(tab.dataset.mode);
        };
    });
}

/* === HERO === */
function renderHero(apiItems) {
    const slidesContainer = document.getElementById('heroSlides');
    const dotsContainer = document.getElementById('heroNav');
    if (!slidesContainer) return;

    let slides = [];
    if (apiItems && apiItems.length > 0) {
        const top3 = apiItems.slice(0, 3);
        slides = top3.map((item, i) => {
            const isPhim = currentMode === 'phim';
            return {
                badge: i === 0 ? '🔥 Hot' : '💎 Đề cử',
                title: item.name,
                slug: item.slug,
                desc: isPhim ? item.origin_name : (item.chaptersLatest?.[0]?.filename || item.origin_name),
                bgImage: isPhim ? API.getPhimImageUrl(item.thumb_url) : API.getTruyenImageUrl(item.thumb_url),
                gradient: ['linear-gradient(135deg, #1a1a2e, #16213e)', 'linear-gradient(135deg, #2d1b69, #11998e)', 'linear-gradient(135deg, #4a0e0e, #c0392b)'][i],
                btnText: isPhim ? 'Xem ngay' : 'Đọc ngay',
                btnIcon: isPhim ? 'play' : 'book'
            };
        });
    } else {
        // Fallback data
        slides = currentMode === 'phim' ? PHIM_HERO_SLIDES : TRUYEN_HERO_SLIDES;
    }

    slidesContainer.innerHTML = slides.map((slide, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}" data-slide="${i}">
            <div class="hero-bg" style="background: url('${slide.bgImage}') center/cover no-repeat, ${slide.gradient};"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <span class="hero-badge">${slide.badge}</span>
                <h1 class="hero-title">${slide.title}</h1>
                <p class="hero-desc">${slide.desc}</p>
                <div class="hero-actions">
                    <button class="btn-primary" onclick="showDetail('${slide.slug}')">
                        ${ICONS[slide.btnIcon]} ${slide.btnText}
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Render dots
    if (dotsContainer) {
        dotsContainer.innerHTML = slides.map((_, i) =>
            `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>`
        ).join('');
    }
}

/* === SECTIONS === */
function renderSections() {
    const container = document.getElementById('movieSections');
    if (!container) return;
    const sections = currentMode === 'phim' ? PHIM_SECTIONS : TRUYEN_SECTIONS;
    container.innerHTML = sections.map(section => `
        <section class="movie-section">
            <div class="section-header">
                <h2 class="section-title"><span class="title-icon">${section.icon}</span> ${section.title}</h2>
            </div>
            <div class="movie-list" id="${section.listId}"></div>
        </section>
    `).join('');
}

/* === CARDS === */
function createCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => showDetail(item.slug);

    const isPhim = currentMode === 'phim';
    const imgUrl = isPhim ? API.getPhimImageUrl(item.thumb_url) : API.getTruyenImageUrl(item.thumb_url);
    const sub = isPhim ? (item.year || '') : `Ch. ${item.chaptersLatest?.[0]?.chapter_name || '?'}`;

    card.innerHTML = `
        <div class="movie-poster">
            <img class="movie-poster-img" src="${imgUrl}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
            <div class="movie-poster-overlay">
                <div class="play-icon">${ICONS[isPhim ? 'play' : 'book']}</div>
            </div>
            <span class="movie-quality">${isPhim ? (item.quality || 'HD') : (item.status === 'completed' ? 'Full' : 'On')}</span>
            <span class="movie-rating">${sub}</span>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${item.name}</h3>
        </div>
    `;
    return card;
}

function renderList(containerId, items) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
        items.forEach(item => container.appendChild(createCard(item)));
    }
}

/* === DETAIL VIEW === */
async function showDetail(slug) {
    const detailPage = document.getElementById('detailPage');
    const content = document.getElementById('detailContent');
    const closeBtn = document.getElementById('closeDetailBtn');

    detailPage.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    content.innerHTML = '<div class="loading-spinner">Đang tải thông tin...</div>';

    try {
        let data;
        if (currentMode === 'phim') {
            const res = await API.getPhimDetail(slug);
            if (!res.status) throw new Error('Không tìm thấy phim');
            data = res.movie;
            data.episodes = res.episodes || [];
        } else {
            const res = await API.getTruyenDetail(slug);
            if (!res.data) throw new Error('Không tìm thấy truyện');
            data = res.data.item;
        }

        currentDetailData = data;
        renderDetailContent(data);
    } catch (err) {
        content.innerHTML = `<div class="error-msg">Lỗi: ${err.message}</div>`;
    }

    closeBtn.onclick = closeDetail;
}

function closeDetail() {
    document.getElementById('detailPage').classList.add('hidden');
    document.body.style.overflow = '';
    // Stop player defined in player.js if accessible, or rebuild container
    const container = document.getElementById('mediaContainer');
    if (container) container.innerHTML = '';
    // Reset global data if needed
    currentDetailData = null;
}

function renderDetailContent(item) {
    const content = document.getElementById('detailContent');
    const isPhim = currentMode === 'phim';

    const imgUrl = isPhim ? API.getPhimImageUrl(item.thumb_url) : API.getTruyenImageUrl(item.thumb_url);
    const date = new Date(item.modified?.time || item.updatedAt).toLocaleDateString('vi-VN');

    // Build categories
    const cats = (item.category || []).map(c => `<span class="meta-badge">${c.name}</span>`).join('');

    // Build Action Buttons
    // Phim: Nút 'Xem ngay' (tập 1)
    // Truyện: Nút 'Đọc ngay' (chương đầu hoặc mới nhất)
    let actionBtn = '';

    if (isPhim && item.episodes.length > 0) {
        const firstEp = item.episodes[0].server_data[0];
        actionBtn = `<button class="btn-large btn-play" onclick="playEpisode('${firstEp.slug}', '${firstEp.link_m3u8 || firstEp.link_embed}')">
            ${ICONS.play} Xem Ngay
        </button>`;
    } else if (!isPhim && item.chapters.length > 0) {
        const firstChap = item.chapters[0].server_data[0]; // Logic show chapters
        // OTruyen chapters structure: chapters: [{ server_name, server_data: [ { chapter_name, chapter_api_data } ] }]
        // Cần truy cập đúng chapter API data để đọc
        actionBtn = `<button class="btn-large btn-play" onclick="readChapter('${firstChap.chapter_api_data}')">
            ${ICONS.book} Đọc Ngay
        </button>`;
    }

    content.innerHTML = `
        <div class="detail-header">
            <div class="detail-poster">
                <img src="${imgUrl}" alt="${item.name}">
            </div>
            <div class="detail-info">
                <h1 class="detail-title">${item.name}</h1>
                <h3 class="detail-org-title">${item.origin_name || ''}</h3>
                
                <div class="detail-meta-row">
                    <span class="meta-badge high">${isPhim ? item.quality : item.status}</span>
                    <span class="meta-badge">${item.lang || (item.time || '')}</span>
                    <span class="meta-badge">📅 ${item.year || date}</span>
                </div>
                
                <div class="detail-meta-row">${cats}</div>
                
                <div class="detail-actions">${actionBtn}</div>
                
                <div class="detail-desc" id="detailDesc">${item.content || 'Chưa có mô tả.'}</div>
                
                <!-- Media Container (Video / Reader) -->
                <div id="mediaContainer" class="player-section"></div>
                
                <!-- List Episodes / Chapters -->
                <div class="server-list-container">
                    <h3>${isPhim ? 'Danh sách tập' : 'Danh sách chương'}</h3>
                    <div class="server-list" id="serverList"></div>
                </div>
            </div>
        </div>
    `;

    // Render list episodes/chapters
    renderServerList(item, isPhim);
}

function renderServerList(item, isPhim) {
    const listContainer = document.getElementById('serverList');
    if (!listContainer) return;

    if (isPhim) {
        // Render Episodes
        // item.episodes: [{ server_name, server_data: [...] }]
        item.episodes.forEach(server => {
            server.server_data.forEach(ep => {
                const btn = document.createElement('button');
                btn.className = 'server-btn';
                btn.innerText = ep.name;
                // Ưu tiên m3u8, fallback embed
                const link = ep.link_m3u8 || ep.link_embed;
                btn.onclick = () => {
                    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    playEpisode(ep.slug, link);
                };
                listContainer.appendChild(btn);
            });
        });
    } else {
        // Render Chapters
        // item.chapters: [{ server_name, server_data: [...] }]
        item.chapters.forEach(server => {
            server.server_data.slice().reverse().forEach(chap => { // Đảo ngược để chương mới nhất lên đầu? Tuỳ user
                const btn = document.createElement('button');
                btn.className = 'server-btn';
                btn.innerText = `Chương ${chap.chapter_name}`;
                btn.onclick = () => {
                    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    readChapter(chap.chapter_api_data);
                };
                listContainer.appendChild(btn);
            });
        });
    }
}

/* === PLAYER ACTIONS === */
function playEpisode(slug, url) {
    const container = document.getElementById('mediaContainer');
    if (!container) return;
    container.innerHTML = `<h3 style="color:#fff;margin-bottom:10px;">Đang phát: ${slug}</h3>`;
    Player.initVideo(container, url);
}

async function readChapter(apiUrl) {
    const container = document.getElementById('mediaContainer');
    if (!container) return;
    container.innerHTML = '<div class="loading-spinner">Đang tải truyện...</div>';

    try {
        // Fetch ảnh chương
        // API.getTruyenChapter cần fetch URL -> response JSON -> image_path
        // URL apiUrl ví dụ: https://sv1.otruyencdn.com/v1/api/chapter/...
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (json.status === 'success') {
            const domain = json.data.domain_cdn;
            const path = json.data.item.chapter_path;
            const images = json.data.item.chapter_image.map(img => `${domain}/${path}/${img.image_file}`);

            Player.initReader(container, images);
        } else {
            throw new Error('Lỗi tải ảnh');
        }
    } catch (err) {
        container.innerHTML = `<div class="error-msg">Không tải được chương: ${err.message}</div>`;
    }
}

/* === SWITCH MODE === */
function switchMode(mode) {
    currentMode = mode;
    localStorage.setItem('qhub-mode', mode);

    // Theme color
    const root = document.documentElement;
    if (mode === 'truyen') {
        root.style.setProperty('--accent', '#e879a0');
        root.style.setProperty('--accent-glow', 'rgba(232, 121, 160, 0.3)');
    } else {
        root.style.removeProperty('--accent');
        root.style.removeProperty('--accent-glow');
    }

    stopAutoSlide();
    renderAll();
    initAllEvents();
    startAutoSlide();
}

/* === INIT === */
async function renderAll() {
    renderHeader();
    renderSections();
    renderFooter();

    const isPhim = currentMode === 'phim';
    const apiData = isPhim ? await API.getPhimHome() : await API.getTruyenHome();

    if (apiData && apiData.data?.items) {
        const items = apiData.data.items;
        renderHero(items);

        const sections = isPhim ? PHIM_SECTIONS : TRUYEN_SECTIONS;
        const chunkSize = Math.ceil(items.length / sections.length);
        sections.forEach((sec, i) => {
            renderList(sec.listId, items.slice(i * chunkSize, (i + 1) * chunkSize));
        });
    } else {
        // Fallback data
        console.warn('API Fail, using Mock');
        renderHero(null);
        // ... (Render mock data logic omitted for brevity in this step)
    }
}
