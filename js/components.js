/* ============================================
   QPhim & QTruyện - Components v2
   Render giao diện & Xử lý chi tiết
   ============================================ */

const currentMode = localStorage.getItem('qhub-mode') || 'phim';
let currentDetailData = null; // Lưu dữ liệu chi tiết

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
                    <a href="#" class="logo" onclick="location.reload()">
                        <span class="logo-icon">▶</span>
                        <span class="logo-text">${config.label}</span>
                    </a>
                    <div class="mode-switcher">${modeTabsHTML}</div>
                    <nav class="nav mobile-hidden">${navHTML}</nav>
                </div>
                <div class="header-right">
                    <div class="search-box">
                        <button class="search-toggle">${ICONS.search}</button>
                    </div>
                </div>
            </div>
        `;

        // Events
        header.querySelectorAll('.mode-tab').forEach(tab => {
            tab.onclick = () => {
                if (tab.dataset.mode !== currentMode) switchMode(tab.dataset.mode);
            };
        });
    } catch (e) {
        console.error('Render Header Error', e);
    }
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

    const sections = currentMode === 'phim' ? PHIM_SECTIONS : TRUYEN_SECTIONS;
    container.innerHTML = sections.map(section => `
        <section class="movie-section">
            <div class="section-header">
                <h2 class="section-title">${section.title}</h2>
            </div>
            <div class="movie-list" id="${section.listId}">
                <div class="loading-spinner">...</div>
            </div>
        </section>
    `).join('');
}

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
            // Gán episodes vào data để render
            data.episodes = res.episodes || [];
        } else {
            const res = await API.getTruyenDetail(slug);
            if (!res.data) throw new Error('Lỗi tải truyện');
            data = res.data.item;
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

    if (isPhim) {
        item.episodes.forEach(server => {
            server.server_data.forEach(ep => {
                const btn = document.createElement('button');
                btn.className = 'server-btn';
                btn.innerText = ep.name;
                btn.onclick = () => playEp(ep.link_m3u8 || ep.link_embed);
                list.appendChild(btn);
            });
        });
    } else {
        item.chapters.forEach(server => {
            server.server_data.forEach(chap => {
                const btn = document.createElement('button');
                btn.className = 'server-btn';
                btn.innerText = chap.chapter_name;
                btn.onclick = () => readChap(chap.chapter_api_data);
                list.appendChild(btn);
            });
        });
    }
}

// Global functions for onclick HTML
window.playEp = (url) => {
    const container = document.getElementById('mediaContainer');
    if (container && window.Player) Player.initVideo(container, url);
};

window.readChap = async (apiUrl) => {
    const container = document.getElementById('mediaContainer');
    if (!container) return;
    container.innerHTML = 'Loading images...';

    // Rewrite URL để qua Proxy
    // Gốc: https://sv1.otruyencdn.com/v1/api/chapter/...
    // Proxy: /api/truyen-chapter/chapter/...
    let proxyUrl = apiUrl;
    if (apiUrl.includes('sv1.otruyencdn.com/v1/api/')) {
        proxyUrl = apiUrl.replace('https://sv1.otruyencdn.com/v1/api/', '/api/truyen-chapter/');
    }

    try {
        const res = await fetch(proxyUrl);
        const json = await res.json();
        if (json.status === 'success') {
            const domain = json.data.domain_cdn;
            const path = json.data.item.chapter_path;
            const images = json.data.item.chapter_image.map(i => `${domain}/${path}/${i.image_file}`);
            if (window.Player) Player.initReader(container, images);
        }
    } catch (e) {
        container.innerHTML = 'Error loading content';
    }
};

/* === SWITCH MODE === */
function switchMode(mode) {
    // Save mode
    localStorage.setItem('qhub-mode', mode);
    // Reload page to apply changes cleanly (simple approach)
    location.reload();
}

window.showDetail = showDetail;
window.switchMode = switchMode;

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
            renderHero(items);
            if (window.initSlider) window.initSlider();

            const sections = isPhim ? PHIM_SECTIONS : TRUYEN_SECTIONS;
            // Chia item đơn giản
            const perSec = Math.floor(items.length / sections.length);
            sections.forEach((sec, i) => {
                renderList(sec.listId, items.slice(i * perSec, (i + 1) * perSec));
            });
        } else {
            console.log('No API Data');
        }
    } catch (e) {
        console.error('API Init Error', e);
    }
}

// Expose renderAll for app.js
window.renderAll = renderAll;
