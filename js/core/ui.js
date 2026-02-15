/* ============================================
   QPhim & QTruyện - Components v2 (Cleaned)
   Main Controller & UI Rendering
   ============================================ */



const currentMode = localStorage.getItem('qhub-mode') || 'phim';
window.currentMode = currentMode;
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

    // Sidebar Mode Switch HTML
    const sidebarModeHTML = `
        <div class="sidebar-mode">
            <button class="${currentMode === 'phim' ? 'active' : ''}" onclick="toggleMode('phim')">
                <span>🎬</span> Phim
            </button>
            <button class="${currentMode === 'truyen' ? 'active' : ''}" onclick="toggleMode('truyen')">
                <span>📚</span> Truyện
            </button>
        </div>
    `;

    sidebar.innerHTML = `
        <div class="sidebar-content">
            <div class="sidebar-header">
                <h2 style="margin:0;font-size:1.2rem;color:var(--accent);">MENU</h2>
                <button onclick="toggleSidebar(false)" style="background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;">✕</button>
            </div>
            <nav class="sidebar-nav">${navHTML}</nav>
            ${sidebarModeHTML}
        </div>
    `;
    document.body.appendChild(sidebar);

    // 2. Header HTML
    const isTruyen = currentMode === 'truyen';

    // Segmented Control HTML for Desktop
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
                <button class="header-icon-btn mobile-only" onclick="toggleSidebar(true)" style="margin-right:10px;font-size:1.4rem; display:none;">☰</button>
                <a href="#" class="logo" onclick="handleNav('home'); return false;">
                    <span class="logo-text">${config.label}</span>
                </a>
                <div class="header-mode-container" style="margin-left: 20px;">
                    ${modeSwitchHTML}
                </div>
            </div>
            <div class="header-right">
                <div class="search-box">
                    <input type="text" class="search-input" placeholder="Tìm kiếm...">
                    <button class="search-toggle">🔍</button>
                </div>
                <div class="mobile-shortcuts">
                    <button class="header-icon-btn noti-btn" onclick="toggleNotiModal()" aria-label="Thông báo">
                        🔔
                        <span class="noti-badge" id="noti-badge">0</span>
                    </button>
                    <button class="header-icon-btn" onclick="handleNav('history')" aria-label="Lịch sử">🕒</button>
                    <button class="header-icon-btn" onclick="openSettings()" aria-label="Cài đặt">⚙️</button>
                    <button class="header-icon-btn" onclick="handleNav('bookmarks')" aria-label="Tủ đồ" style="color:#ff5555;">❤</button>
                </div>
            </div>
        </div>
    `;

    if (window.initSearchBox) window.initSearchBox();

    // Render Bottom Nav (new)
    renderBottomNav();

    // Init Header Scroll Effect
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

function renderBottomNav() {
    // Remove old nav if exists
    const oldNav = document.getElementById('bottomNav');
    if (oldNav) oldNav.remove();

    const nav = document.createElement('nav');
    nav.id = 'bottomNav';
    nav.className = 'mobile-bottom-nav';
    nav.innerHTML = `
        <button class="bottom-nav-item active" onclick="handleNav('home');updateBottomNav(this)">
            <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> 
            <span>Trang chủ</span>
        </button>
        <button class="bottom-nav-item" onclick="renderDiscoveryPage();updateBottomNav(this)">
            <svg viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg>
            <span>Khám phá</span>
        </button>
        <button class="bottom-nav-item" onclick="toggleSearchMobile();updateBottomNav(this)">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <span>Tìm kiếm</span>
        </button>
        <button class="bottom-nav-item" onclick="handleNav('bookmarks');updateBottomNav(this)">
             <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
            <span>Tủ đồ</span>
        </button>
        <button class="bottom-nav-item" onclick="toggleSidebar(true);updateBottomNav(this)">
            <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
            <span>Menu</span>
        </button>
    `;
    document.body.appendChild(nav);
}

window.updateBottomNav = (el) => {
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
};

window.toggleSearchMobile = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const input = document.querySelector('.search-input');
    if (input) {
        setTimeout(() => input.focus(), 300);
    }
};

// Keep toggleMode logic
window.toggleMode = (targetMode) => {
    if (targetMode !== currentMode) switchMode(targetMode);
};

window.handleNav = async (section, label) => {
    if (section === 'home') {
        document.title = 'QPhim - Trang chủ';
        renderAll();
        return;
    }

    const hero = document.getElementById('hero');
    if (hero) hero.style.display = 'none';

    const main = document.getElementById('movieSections');
    if (!main) return;

    // Use Skeleton instead of Spinner
    if (typeof showGridSkeleton === 'function') {
        showGridSkeleton(main);
    } else {
        main.innerHTML = `<div class="loading-spinner-container" style="padding:100px 0;text-align:center;"><div class="loading-spinner"></div><p style="margin-top:10px;color:#888;">Đang tải ${label}...</p></div>`;
    }
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


/* === SKELETON LOADING UI === */
function createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'movie-card skeleton-card';
    card.style.pointerEvents = 'none';
    card.innerHTML = `
        <div class="skeleton-poster"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
    `;
    return card;
}

function renderSkeleton(containerId, count = 10, isGrid = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    // Grid layout vs List layout styling
    if (isGrid) {
        // Assume container is a grid
    } else {
        // Horizontal list
    }

    for (let i = 0; i < count; i++) {
        container.appendChild(createSkeletonCard());
    }
}

// Update renderSections to use skeleton
function renderSections() {
    const container = document.getElementById('movieSections');
    if (!container) return;
    container.innerHTML = '';

    const sections = currentMode === 'phim' ? PHIM_SECTIONS : TRUYEN_SECTIONS;
    const isPhim = currentMode === 'phim';

    // Render History if exists
    if (window.getHistory) {
        const history = getHistory(isPhim ? 'phim' : 'truyen');
        if (history.length > 0) {
            const hSec = document.createElement('section');
            hSec.className = 'movie-section';
            hSec.innerHTML = `
                <div class="section-header">
                    <h2 class="section-title">🕒 ${isPhim ? 'Xem tiếp' : 'Đọc tiếp'}</h2>
                    <button class="see-all" onclick="handleNav('history')">Xem tất cả</button>
                </div>
                <div class="movie-list" id="homeHistoryList"></div>
           `;
            container.appendChild(hSec);

            const list = hSec.querySelector('#homeHistoryList');
            history.slice(0, 10).forEach(item => {
                const card = document.createElement('div');
                card.className = 'movie-card';
                card.onclick = isPhim ?
                    () => showDetail(item.slug).then(() => playEp(item.episode_url, item.episode_name, item.slug, item.name, item.thumb_url)) :
                    () => readChap(item.chapter_api_data, true, item.slug);

                const imgUrl = isPhim ? API.getPhimImageUrl(item.thumb_url) : API.getTruyenImageUrl(item.thumb_url);
                const label = isPhim ? `Tập ${item.episode_name}` : `Ch.${item.chapter_name}`;
                card.innerHTML = `
                    <div class="movie-poster">
                        <img class="movie-poster-img" src="${imgUrl}" loading="lazy" onerror="this.parentElement.style.backgroundColor='#333'">
                        <div class="movie-poster-overlay"><div class="play-icon">${isPhim ? ICONS.play : ICONS.book}</div></div>
                        <span class="movie-quality" style="background:var(--accent);">${label}</span>
                    </div>
                    <div class="movie-info"><h3 class="movie-title">${item.name}</h3></div>
                `;
                list.appendChild(card);
            });
        }
    }

    // Render Main Sections
    sections.forEach(section => {
        const sec = document.createElement('section');
        sec.className = 'movie-section';
        sec.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">${section.title}</h2>
                <div class="section-controls">
                    <button class="see-all" onclick="handleNav('${section.listId}')">Xem thêm</button>
                </div>
            </div>
            <div class="movie-list" id="${section.listId}"></div>
        `;
        container.appendChild(sec);
        // Render Skeleton immediately
        renderSkeleton(section.listId, 6);
    });
}
window.renderSections = renderSections; // Expose override

// Helper for handleNav skeleton
function showGridSkeleton(mainElement) {
    mainElement.innerHTML = `
        <section class="movie-section">
            <div class="movie-grid" id="skeletonGrid"></div>
        </section>
    `;
    renderSkeleton('skeletonGrid', 12, true);
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

    // Check Notifications
    if (window.updateBellBadge) window.updateBellBadge();
    if (window.checkNewChapters) window.checkNewChapters();

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

                // Clear skeleton and render real items
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

/* === DISCOVERY PAGE (FILTER) === */
async function renderDiscoveryPage() {
    document.title = 'Khám phá - QPhim & QTruyện';
    const hero = document.getElementById('hero');
    if (hero) hero.style.display = 'none';

    const main = document.getElementById('movieSections');
    if (!main) return;

    main.innerHTML = '<div class="loading-spinner"></div>';
    main.style.paddingTop = '80px';

    // Reset Infinite Scroll
    infiniteScrollState.active = false;

    try {
        const isPhim = currentMode === 'phim';
        let genres = [];
        let countries = [];

        // Fetch Data
        if (isPhim) {
            const [gRes, cRes] = await Promise.all([API.getPhimCategories(), API.getPhimCountries()]);
            genres = gRes?.data?.items || [];
            countries = cRes?.data?.items || [];
        } else {
            const gRes = await API.getTruyenCategories();
            genres = gRes?.data?.items || [];
        }

        let html = `
            <section class="movie-section">
                <div class="section-header">
                    <h2 class="section-title">🧭 Khám phá ${isPhim ? 'Phim' : 'Truyện'}</h2>
                     <button class="see-all" onclick="handleNav('home')">← Trang chủ</button>
                </div>
                
                <div style="background:var(--bg-card); padding:20px; border-radius:12px; margin-bottom:20px;">
                    <h3 style="color:var(--accent); margin-bottom:15px; font-size:1.1rem;">📂 Thể loại</h3>
                    <div class="genre-grid-page">
                        ${genres.map(g => `<button class="genre-tag-large" onclick="handleNav('${g.slug}', '${g.name}')">${g.name}</button>`).join('')}
                    </div>
                </div>
        `;

        if (isPhim && countries.length > 0) {
            html += `
                <div style="background:var(--bg-card); padding:20px; border-radius:12px;">
                    <h3 style="color:#2ecc71; margin-bottom:15px; font-size:1.1rem;">🌍 Quốc gia</h3>
                    <div class="genre-grid-page">
                        ${countries.map(c => `<button class="genre-tag-large" onclick="handleNav('${c.slug}', '${c.name}')">${c.name}</button>`).join('')}
                    </div>
                </div>
            `;
        }

        html += '</section>';
        main.innerHTML = html;

    } catch (e) {
        console.error(e);
        main.innerHTML = '<p class="text-center p-5">Lỗi tải dữ liệu khám phá.</p>';
    }
}
window.renderDiscoveryPage = renderDiscoveryPage;

window.renderAll = renderAll;
window.formatRelativeTime = formatRelativeTime;
