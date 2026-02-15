/* ============================================
   QPhim & QTruyện - Components v2 (Cleaned)
   Main Controller & UI Rendering
   ============================================ */



const currentMode = localStorage.getItem('qhub-mode') || 'phim';
window.currentDetailData = null;

// Infinite Scroll State
let infiniteScrollState = {
    active: false,
    section: null,
    page: 1,
    isLoading: false,
    hasMore: true,
    keyword: '' // For search
};

function getModeConfig() { return APP_MODES[currentMode]; }

// Infinite Scroll Listener
window.addEventListener('scroll', () => {
    if (!infiniteScrollState.active || infiniteScrollState.isLoading || !infiniteScrollState.hasMore) return;

    // Check if near bottom
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        loadMoreContent();
    }
});

async function loadMoreContent() {
    infiniteScrollState.isLoading = true;
    infiniteScrollState.page++;

    // Show spinner at bottom
    let loader = document.getElementById('infinite-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'infinite-loader';
        loader.className = 'loading-spinner';
        loader.style.margin = '20px auto';
        const grid = document.getElementById('gridContent');
        if (grid) grid.parentNode.appendChild(loader);
    }
    loader.style.display = 'block';

    try {
        const { section, page, keyword } = infiniteScrollState;
        let res;

        // Search Logic
        if (section === 'search') {
            res = (currentMode === 'phim') ? await API.searchPhim(keyword, page) : await API.searchTruyen(keyword, page);
        } else {
            // Category / List Logic
            const isListType = ['phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows', 'truyen-moi', 'sap-ra-mat', 'dang-phat-hanh', 'hoan-thanh'].includes(section);
            if (isListType) {
                res = (currentMode === 'phim') ? await API.getPhimList(section, page) : await API.getTruyenList(section, page);
            } else {
                res = (currentMode === 'phim') ? await API.getPhimByCategory(section, page) : await API.getTruyenByCategory(section, page);
            }
        }

        const items = res?.data?.items || [];
        if (items.length > 0) {
            const grid = document.getElementById('gridContent');
            if (grid) {
                items.forEach(item => grid.appendChild(createCard(item)));
            }
        } else {
            infiniteScrollState.hasMore = false;
        }

    } catch (e) {
        console.error('Load more failed:', e);
        infiniteScrollState.hasMore = false;
    } finally {
        infiniteScrollState.isLoading = false;
        if (loader) loader.style.display = 'none';
    }
}

/* === HEADER & NAV === */
/* === HEADER & NAV (SIDEBAR MODE) === */
const SIDEBAR_CSS = `
.sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 10000; opacity: 0; visibility: hidden; transition: 0.3s; }
.sidebar-overlay.active { opacity: 1; visibility: visible; }
.sidebar-content { position: absolute; top: 0; left: 0; bottom: 0; width: 280px; background: var(--bg-card); transform: translateX(-100%); transition: 0.3s; padding: 20px; display: flex; flex-direction: column; overflow-y: auto; box-shadow: 2px 0 10px rgba(0,0,0,0.5); }
.sidebar-overlay.active .sidebar-content { transform: translateX(0); }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
.sidebar-nav a { display: block; padding: 12px 15px; color: var(--text-secondary); text-decoration: none; border-radius: 8px; margin-bottom: 5px; font-weight: 500; transition: 0.2s; }
.sidebar-nav a:hover, .sidebar-nav a.active { background: var(--bg-hover); color: var(--accent); }
.sidebar-mode { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border); }
.sidebar-mode button { width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 10px; justify-content: center; }
.sidebar-mode button.active { background: var(--accent); color: white; border-color: var(--accent); }
`;
const sbStyle = document.createElement('style');
sbStyle.textContent = SIDEBAR_CSS;
document.head.appendChild(sbStyle);

function toggleSidebar(show) {
    const sb = document.getElementById('appSidebar');
    if (sb) {
        if (show) sb.classList.add('active');
        else sb.classList.remove('active');
    }
}

function renderHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    const config = getModeConfig();

    // 1. Sidebar HTML
    const navHTML = config.navLinks.map(link =>
        `<a href="#" class="nav-link ${link.active ? 'active' : ''}" data-section="${link.section}" onclick="handleNav('${link.section}');toggleSidebar(false);return false;">${link.label}</a>`
    ).join('');

    const modeTabsHTML = Object.values(APP_MODES).map(mode =>
        `<button class="${mode.id === currentMode ? 'active' : ''}" onclick="switchMode('${mode.id}')">
            <span>${mode.icon}</span> ${mode.label}
        </button>`
    ).join('');

    // Remove old sidebar if exists (to re-render)
    const oldSb = document.getElementById('appSidebar');
    if (oldSb) oldSb.remove();

    const sidebar = document.createElement('div');
    sidebar.id = 'appSidebar';
    sidebar.className = 'sidebar-overlay';
    sidebar.onclick = (e) => { if (e.target === sidebar) toggleSidebar(false); };
    sidebar.innerHTML = `
        <div class="sidebar-content">
            <div class="sidebar-header">
                <h2 style="margin:0;font-size:1.2rem;color:var(--accent);">MENU</h2>
                <button onclick="toggleSidebar(false)" style="background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;">✕</button>
            </div>
            <nav class="sidebar-nav">${navHTML}</nav>
        </div>
    `;
    document.body.appendChild(sidebar);

    // 2. Header HTML
    const isTruyen = currentMode === 'truyen';

    // Segmented Control HTML
    const modeSwitchHTML = `
        <div class="mode-segmented-control">
            <div class="mode-option ${!isTruyen ? 'active' : ''}" onclick="toggleMode('phim')">
                <span>🎬</span> Phim
            </div>
            <div class="mode-option ${isTruyen ? 'active' : ''}" onclick="toggleMode('truyen')">
                <span>📚</span> Truyện
            </div>
        </div>
    `;

    header.innerHTML = `
        <div class="header-inner">
            <div class="header-left">
                <button class="header-icon-btn" onclick="toggleSidebar(true)" style="margin-right:10px;font-size:1.4rem;">☰</button>
                <a href="#" class="logo" onclick="handleNav('home'); return false;">
                    <span class="logo-text">${config.label}</span>
                </a>
                <div class="header-mode-container" style="margin-left: 20px;">
                    ${modeSwitchHTML}
                </div>
            </div>
            <div class="header-right">
                <div class="mobile-shortcuts">
                    <button class="header-icon-btn" onclick="handleNav('history')" aria-label="Lịch sử">${ICONS.history}</button>
                    <button class="header-icon-btn" onclick="openSettings()" aria-label="Cài đặt">⚙️</button>
                    <button class="header-icon-btn" onclick="handleNav('bookmarks')" aria-label="Tủ đồ" style="color:#ff5555;">❤</button>
                </div>
                <div class="search-box">
                    <input type="text" class="search-input" placeholder="Tìm kiếm...">
                    <button class="search-toggle">${ICONS.search}</button>
                </div>
            </div>
        </div>
    `;

    if (window.initSearchBox) window.initSearchBox();
}

// Keep toggleMode logic
window.toggleMode = (targetMode) => {
    if (targetMode !== currentMode) switchMode(targetMode);
};

window.handleNav = async (section, label) => {
    if (section === 'home') { renderAll(); return; }

    const hero = document.getElementById('hero');
    if (hero) hero.style.display = 'none';

    const main = document.getElementById('movieSections');
    if (!main) return;

    main.innerHTML = `<div class="loading-spinner-container" style="padding:100px 0;text-align:center;"><div class="loading-spinner"></div><p style="margin-top:10px;color:#888;">Đang tải ${label}...</p></div>`;
    main.style.paddingTop = '80px';

    // Reset Infinite Scroll
    infiniteScrollState = {
        active: false,
        section: section,
        page: 1,
        isLoading: false,
        hasMore: true,
        keyword: ''
    };

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

        if (section === 'bookmarks') {
            if (window.renderBookmarkPage) renderBookmarkPage();
            else main.innerHTML = '<p>Bookmarks module missing.</p>';
            return;
        }

        let res; // Moved up

        if (section === 'search') {
            const keyword = infiniteScrollState.keyword;
            label = `Kết quả tìm kiếm: "${keyword}"`;

            // Enable Infinite Scroll tracking
            infiniteScrollState.active = true;

            res = (currentMode === 'phim') ? await API.searchPhim(keyword) : await API.searchTruyen(keyword);
        }

        // List Handling
        const isListType = ['phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows', 'truyen-moi', 'sap-ra-mat', 'dang-phat-hanh', 'hoan-thanh'].includes(section);

        if (!res && section !== 'search') {
            // Enable Infinite Scroll tracking
            infiniteScrollState.active = true;

            if (isListType) {
                res = currentMode === 'phim' ? await API.getPhimList(section) : await API.getTruyenList(section);
            } else {
                // Category Slug
                res = currentMode === 'phim' ? await API.getPhimByCategory(section) : await API.getTruyenByCategory(section);
            }
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
