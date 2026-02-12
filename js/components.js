/* ============================================
   QPhim & QTruyện - Components v2 (Cleaned)
   Main Controller & UI Rendering
   ============================================ */



// Global State
const currentMode = localStorage.getItem('qhub-mode') || 'phim';
window.currentDetailData = null;

function getModeConfig() { return APP_MODES[currentMode]; }

/* === HEADER & NAV === */
function renderHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    const config = getModeConfig();

    // Nav Links
    const navHTML = config.navLinks.map(link =>
        `<a href="#" class="nav-link ${link.active ? 'active' : ''}" data-section="${link.section}">${link.label}</a>`
    ).join('');

    // Mode Tabs
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
                <div class="mobile-shortcuts">
                    <button class="header-icon-btn" onclick="handleNav('genres')" aria-label="Thể loại">${ICONS.category}</button>
                    <button class="header-icon-btn" onclick="handleNav('history')" aria-label="Lịch sử">${ICONS.history}</button>
                </div>
                <div class="search-box">
                    <input type="text" class="search-input" placeholder="Tìm kiếm phim, truyện...">
                    <button class="search-toggle">${ICONS.search}</button>
                </div>
            </div>
        </div>
    `;

    if (window.initSearchBox) window.initSearchBox();

    // Events
    header.querySelectorAll('.mode-tab').forEach(tab => {
        tab.onclick = () => { if (tab.dataset.mode !== currentMode) switchMode(tab.dataset.mode); };
    });
    header.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            header.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            handleNav(link.dataset.section, link.textContent);
        };
    });
}

window.handleNav = async (section, label) => {
    if (section === 'home') { renderAll(); return; }

    const hero = document.getElementById('hero');
    if (hero) hero.style.display = 'none';

    const main = document.getElementById('movieSections');
    if (!main) return;

    main.innerHTML = `<div class="loading-spinner-container" style="padding:100px 0;text-align:center;"><div class="loading-spinner"></div><p style="margin-top:10px;color:#888;">Đang tải ${label}...</p></div>`;
    main.style.paddingTop = '80px';

    try {
        if (section === 'genres') {
            const apiRes = currentMode === 'phim' ? await API.getPhimCategories() : await API.getTruyenCategories();
            if (apiRes?.data?.items) renderGenreList(apiRes.data.items);
            else main.innerHTML = '<p class="text-center p-5">Lỗi tải thể loại.</p>';
            return;
        }

        if (section === 'history') {
            if (window.renderHistoryPage) renderHistoryPage(); // From history.js
            else main.innerHTML = '<p>History module missing.</p>';
            return;
        }

        // List Handling
        const isListType = ['phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows', 'truyen-moi', 'sap-ra-mat', 'dang-phat-hanh', 'hoan-thanh'].includes(section);
        let res;
        if (isListType) {
            res = currentMode === 'phim' ? await API.getPhimList(section) : await API.getTruyenList(section);
        } else {
            res = currentMode === 'phim' ? await API.getPhimByCategory(section) : await API.getTruyenByCategory(section);
        }

        if (res?.data?.items) {
            main.innerHTML = `
                <section class="movie-section">
                    <div class="section-header">
                        <h2 class="section-title">${label}</h2>
                        <button class="see-all" onclick="handleNav('home')">← Trang chủ</button>
                    </div>
                    <div class="movie-grid" id="gridContent"></div>
                </section>
            `;
            const grid = document.getElementById('gridContent');
            const items = res.data.items;
            if (items.length === 0) grid.innerHTML = '<p>Trống.</p>';
            else items.forEach(item => grid.appendChild(createCard(item)));
        } else {
            main.innerHTML = `<p style="text-align:center;padding:50px;">Không có dữ liệu "${label}".</p>`;
        }
    } catch (e) {
        console.error(e);
        main.innerHTML = `<p style="text-align:center;padding:50px;color:red;">Lỗi: ${e.message}</p>`;
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

/* === CARD & LIST === */
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
    items.forEach(item => { if (item) container.appendChild(createCard(item)); });
}

function renderSections() {
    const container = document.getElementById('movieSections');
    if (!container) return;
    container.innerHTML = '';

    // Render Main Sections
    const sections = currentMode === 'phim' ? PHIM_SECTIONS : TRUYEN_SECTIONS;
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

    // Render History Section (Using history.js helper if available)
    if (window.getHistory) {
        const isPhim = currentMode === 'phim';
        const history = getHistory(isPhim ? 'phim' : 'truyen');
        if (history.length > 0) {
            const hSec = `
                <section class="movie-section">
                    <div class="section-header">
                        <h2 class="section-title">🕒 ${isPhim ? 'Xem tiếp' : 'Đọc tiếp'}</h2>
                        <button class="see-all" onclick="handleNav('history')">Xem tất cả</button>
                    </div>
                    <div class="movie-list" id="homeHistoryList"></div>
                </section>
             `;
            container.innerHTML = hSec + mainHTML;

            // Render history items
            const list = container.querySelector('#homeHistoryList');
            history.slice(0, 10).forEach(item => {
                const card = document.createElement('div');
                card.className = 'movie-card';
                if (!isPhim) {
                    card.onclick = () => readChap(item.chapter_api_data);
                } else {
                    card.onclick = () => {
                        showDetail(item.slug).then(() => {
                            playEp(item.episode_url, item.episode_name, item.slug, item.name, item.thumb_url);
                        });
                    };
                }
                const imgUrl = isPhim ? API.getPhimImageUrl(item.thumb_url) : API.getTruyenImageUrl(item.thumb_url);
                const label = isPhim ? `Tập ${item.episode_name}` : `Ch.${item.chapter_name}`;

                card.innerHTML = `
                    <div class="movie-poster">
                        <img class="movie-poster-img" src="${imgUrl}" loading="lazy" onerror="this.parentElement.style.backgroundColor='#333'">
                        <div class="movie-poster-overlay">
                            <div class="play-icon">${isPhim ? ICONS.play : ICONS.book}</div>
                        </div>
                        <span class="movie-quality" style="background:var(--accent);">${label}</span>
                    </div>
                    <div class="movie-info"><h3 class="movie-title">${item.name}</h3></div>
                 `;
                list.appendChild(card);
            });
        } else {
            container.innerHTML = mainHTML;
        }
    } else {
        container.innerHTML = mainHTML;
    }
}

// Global scroll function
window.scrollList = (listId, direction) => {
    const list = document.getElementById(listId);
    if (list) {
        list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: 'smooth' });
    }
};

/* === MAIN INIT === */
async function renderAll() {
    console.log('Init App V2...');
    renderHeader();
    renderSections();

    const isPhim = currentMode === 'phim';
    try {
        const apiData = isPhim ? await API.getPhimHome() : await API.getTruyenHome();
        if (apiData && apiData.data?.items) {
            const items = apiData.data.items;
            const main = document.getElementById('movieSections');
            if (main) main.style.paddingTop = '120px';

            const sections = isPhim ? PHIM_SECTIONS : TRUYEN_SECTIONS;
            sections.forEach((sec, i) => {
                let secItems = [...items];
                if (i === 1) secItems.reverse();
                else if (i === 2) secItems.sort(() => Math.random() - 0.5);
                renderList(sec.listId, secItems);
            });
        }
    } catch (e) { console.error('API Init Error', e); }
}

function switchMode(mode) {
    localStorage.setItem('qhub-mode', mode);
    location.reload();
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
        return date.toLocaleDateString();
    } catch (e) { return ''; }
}

window.renderAll = renderAll;
window.formatRelativeTime = formatRelativeTime;
