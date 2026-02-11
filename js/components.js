/* ============================================
   QPhim & QTruyện - Components
   Render giao diện từ dữ liệu API thật
   Fallback sang dữ liệu mẫu nếu API lỗi
   ============================================ */

// === Chế độ hiện tại (mặc định: phim) ===
let currentMode = localStorage.getItem('qhub-mode') || 'phim';

/**
 * Lấy config của mode hiện tại
 */
function getModeConfig() { return APP_MODES[currentMode]; }

/**
 * Render Header với nút chuyển đổi QPhim / QTruyện
 */
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
                <a href="#" class="logo" id="logo">
                    <span class="logo-icon">▶</span>
                    <span class="logo-text">${config.label}</span>
                </a>
                <div class="mode-switcher" id="modeSwitcher">${modeTabsHTML}</div>
                <nav class="nav" id="mainNav">${navHTML}</nav>
            </div>
            <div class="header-right">
                <div class="search-box" id="searchBox">
                    <button class="search-toggle" id="searchToggle" aria-label="Tìm kiếm">${ICONS.search}</button>
                    <input type="text" class="search-input" id="searchInput" placeholder="${config.searchPlaceholder}">
                </div>
                <button class="theme-toggle" id="themeToggle" aria-label="Đổi theme">
                    <span class="theme-icon moon">🌙</span>
                    <span class="theme-icon sun">☀️</span>
                    <span class="theme-slider"></span>
                </button>
                <button class="btn-user" id="btnUser" aria-label="Tài khoản">${ICONS.user}</button>
                <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    `;

    // Gắn sự kiện chuyển mode
    header.querySelectorAll('.mode-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const newMode = tab.dataset.mode;
            if (newMode !== currentMode) switchMode(newMode);
        });
    });
}

/**
 * Render Hero Slides
 * Ưu tiên dữ liệu API, fallback sang data mẫu
 */
function renderHero(apiItems) {
    const slidesContainer = document.getElementById('heroSlides');
    const dotsContainer = document.getElementById('heroNav');
    if (!slidesContainer || !dotsContainer) return;

    let slides;

    if (apiItems && apiItems.length > 0) {
        // Dùng dữ liệu API thật (lấy 3 phim/truyện đầu tiên)
        const top3 = apiItems.slice(0, 3);
        slides = top3.map((item, i) => {
            if (currentMode === 'phim') {
                // === OPhim ===
                const bgImg = API.getPhimImageUrl(item.thumb_url);
                const cats = (item.category || []).map(c => c.name);
                return {
                    badge: i === 0 ? '🔥 Nổi bật' : i === 1 ? '🎬 Mới cập nhật' : '💎 Đề cử',
                    title: item.name,
                    rating: item.tmdb?.vote_average || '?',
                    year: item.year,
                    duration: item.time || '?',
                    quality: item.quality || 'HD',
                    desc: `${item.origin_name} — ${item.episode_current || ''} — ${item.lang || ''}`,
                    genres: cats.length > 0 ? cats : ['Phim'],
                    bgImage: bgImg,
                    gradient: ['linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', 'linear-gradient(135deg, #2d1b69, #11998e)', 'linear-gradient(135deg, #4a0e0e, #c0392b)'][i],
                    btnPrimary: 'Xem ngay', btnPrimaryIcon: 'play',
                    slug: item.slug
                };
            } else {
                // === OTruyen ===
                const bgImg = API.getTruyenImageUrl(item.thumb_url);
                const cats = (item.category || []).map(c => c.name);
                const latestChap = item.chaptersLatest?.[0]?.chapter_name || '?';
                return {
                    badge: i === 0 ? '🔥 Hot' : i === 1 ? '📖 Mới cập nhật' : '💎 Đề cử',
                    title: item.name,
                    rating: '?',
                    year: '',
                    duration: `Ch. ${latestChap}`,
                    quality: item.status === 'completed' ? 'Full' : 'Đang ra',
                    desc: (item.origin_name || []).join(', '),
                    genres: cats.length > 0 ? cats : ['Truyện'],
                    bgImage: bgImg,
                    gradient: ['linear-gradient(135deg, #1a0533, #4a1a8a, #7c3aed)', 'linear-gradient(135deg, #1c1c1c, #8b0000)', 'linear-gradient(135deg, #0c0c1d, #1a3a5c, #2980b9)'][i],
                    btnPrimary: 'Đọc ngay', btnPrimaryIcon: 'book',
                    slug: item.slug
                };
            }
        });
    } else {
        // Fallback: dữ liệu mẫu
        slides = currentMode === 'phim' ? PHIM_HERO_SLIDES : TRUYEN_HERO_SLIDES;
    }

    slidesContainer.innerHTML = slides.map((slide, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}" data-slide="${i}">
            <div class="hero-bg" style="background: ${slide.bgImage
            ? `url('${slide.bgImage}') center/cover no-repeat, ${slide.gradient}`
            : slide.gradient};"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <span class="hero-badge">${slide.badge}</span>
                <h1 class="hero-title">${slide.title}</h1>
                <div class="hero-meta">
                    <span class="meta-rating">⭐ ${slide.rating}</span>
                    ${slide.year ? `<span class="meta-year">${slide.year}</span>` : ''}
                    <span class="meta-duration">${slide.duration}</span>
                    <span class="meta-quality">${slide.quality}</span>
                </div>
                <p class="hero-desc">${slide.desc}</p>
                <div class="hero-actions">
                    <button class="btn-primary">${ICONS[slide.btnPrimaryIcon || 'play']} ${slide.btnPrimary || 'Xem ngay'}</button>
                    <button class="btn-secondary">${ICONS.info} Chi tiết</button>
                </div>
                <div class="hero-genres">
                    ${slide.genres.map(g => `<span class="genre-tag">${g}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    dotsContainer.innerHTML = slides.map((_, i) =>
        `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>`
    ).join('');
}

/**
 * Render tất cả sections
 */
function renderSections() {
    const container = document.getElementById('movieSections');
    if (!container) return;

    const sections = currentMode === 'phim' ? PHIM_SECTIONS : TRUYEN_SECTIONS;

    container.innerHTML = sections.map(section => `
        <section class="movie-section" id="${section.id}">
            <div class="section-header">
                <h2 class="section-title">
                    <span class="title-icon">${section.icon}</span> ${section.title}
                </h2>
                <div class="section-controls">
                    <button class="scroll-btn scroll-left" data-target="${section.listId}" aria-label="Cuộn trái">‹</button>
                    <button class="scroll-btn scroll-right" data-target="${section.listId}" aria-label="Cuộn phải">›</button>
                    <a href="#" class="see-all">Xem tất cả →</a>
                </div>
            </div>
            <div class="movie-list" id="${section.listId}">
                <div class="loading-placeholder">Đang tải...</div>
            </div>
        </section>
    `).join('');
}

/**
 * Tạo card từ dữ liệu API OPhim
 */
function createPhimCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('data-slug', item.slug);

    const imgUrl = API.getPhimImageUrl(item.thumb_url);
    const cats = (item.category || []).map(c => c.name).join(', ');
    const countries = (item.country || []).map(c => c.name).join(', ');

    card.innerHTML = `
        <div class="movie-poster">
            <img class="movie-poster-img" src="${imgUrl}" alt="${item.name}" loading="lazy"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="movie-poster-fallback" style="display:none; background:linear-gradient(135deg,#1a1a2e,#0f3460); align-items:center; justify-content:center; position:absolute; inset:0;">
                <span style="font-size:3rem;">🎬</span>
            </div>
            <div class="movie-poster-overlay">
                <div class="play-icon">
                    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
            </div>
            <span class="movie-quality">${item.quality || 'HD'}</span>
            <span class="movie-rating">${item.lang || 'Vietsub'}</span>
            ${item.episode_current ? `<span class="movie-episode">${item.episode_current}</span>` : ''}
        </div>
        <div class="movie-info">
            <h3 class="movie-title" title="${item.name}">${item.name}</h3>
            <div class="movie-meta">
                <span class="movie-year">${item.year || ''}</span>
                <span class="movie-genre">${cats || countries || ''}</span>
            </div>
        </div>
    `;
    return card;
}

/**
 * Tạo card từ dữ liệu API OTruyen
 */
function createTruyenCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('data-slug', item.slug);

    const imgUrl = API.getTruyenImageUrl(item.thumb_url);
    const cats = (item.category || []).map(c => c.name).join(', ');
    const latestChap = item.chaptersLatest?.[0]?.chapter_name || '?';
    const statusLabel = item.status === 'completed' ? 'Full' : 'Đang ra';

    card.innerHTML = `
        <div class="movie-poster">
            <img class="movie-poster-img" src="${imgUrl}" alt="${item.name}" loading="lazy"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="movie-poster-fallback" style="display:none; background:linear-gradient(135deg,#4a1a8a,#7c3aed); align-items:center; justify-content:center; position:absolute; inset:0;">
                <span style="font-size:3rem;">📚</span>
            </div>
            <div class="movie-poster-overlay">
                <div class="play-icon">
                    ${ICONS.book}
                </div>
            </div>
            <span class="movie-quality">${statusLabel}</span>
            <span class="movie-rating">Ch. ${latestChap}</span>
        </div>
        <div class="movie-info">
            <h3 class="movie-title" title="${item.name}">${item.name}</h3>
            <div class="movie-meta">
                <span class="movie-year"></span>
                <span class="movie-genre">${cats || ''}</span>
            </div>
        </div>
    `;
    return card;
}

/**
 * Tạo card tuỳ theo mode
 */
function createCard(item) {
    return currentMode === 'phim' ? createPhimCard(item) : createTruyenCard(item);
}

/**
 * Render danh sách items vào container
 */
function renderList(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="loading-placeholder">Không có dữ liệu</div>';
        return;
    }
    items.forEach(item => container.appendChild(createCard(item)));
}

/**
 * Render Footer
 */
function renderFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    const columnsHTML = FOOTER_DATA.columns.map(col => `
        <div class="footer-col">
            <h4>${col.title}</h4>
            ${col.links.map(link => `<a href="#">${link}</a>`).join('')}
        </div>
    `).join('');

    footer.innerHTML = `
        <div class="footer-inner">
            <div class="footer-brand">
                <a href="#" class="logo">
                    <span class="logo-icon">▶</span>
                    <span class="logo-text">${getModeConfig().label}</span>
                </a>
                <p class="footer-desc">${FOOTER_DATA.desc}</p>
            </div>
            <div class="footer-links">${columnsHTML}</div>
        </div>
        <div class="footer-bottom">
            <p>${FOOTER_DATA.copyright}</p>
        </div>
    `;
}

/**
 * Chuyển đổi mode QPhim ↔ QTruyện
 */
function switchMode(mode) {
    currentMode = mode;
    localStorage.setItem('qhub-mode', mode);

    // Đổi accent color
    const root = document.documentElement;
    if (mode === 'truyen') {
        root.style.setProperty('--accent', '#e879a0');
        root.style.setProperty('--accent-hover', '#f09cb8');
        root.style.setProperty('--accent-glow', 'rgba(232, 121, 160, 0.3)');
    } else {
        root.style.removeProperty('--accent');
        root.style.removeProperty('--accent-hover');
        root.style.removeProperty('--accent-glow');
    }

    // Re-render
    stopAutoSlide();
    renderAll();
    initAllEvents();
    startAutoSlide();
}

/**
 * Render toàn bộ giao diện + tải dữ liệu API
 */
async function renderAll() {
    renderHeader();
    renderSections();
    renderFooter();

    // Tải dữ liệu từ API
    let apiData = null;

    if (currentMode === 'phim') {
        apiData = await API.getPhimHome();
    } else {
        apiData = await API.getTruyenHome();
    }

    if (apiData && apiData.status === 'success' && apiData.data?.items) {
        const items = apiData.data.items;

        // Render Hero từ dữ liệu API
        renderHero(items);

        // Chia dữ liệu vào các sections
        const sections = currentMode === 'phim' ? PHIM_SECTIONS : TRUYEN_SECTIONS;
        const chunkSize = Math.ceil(items.length / sections.length);

        sections.forEach((section, i) => {
            const chunk = items.slice(i * chunkSize, (i + 1) * chunkSize);
            renderList(section.listId, chunk);
        });

        console.log(`✅ Đã tải ${items.length} ${currentMode === 'phim' ? 'phim' : 'truyện'} từ API`);
    } else {
        // Fallback: dữ liệu mẫu
        console.warn('⚠️ API không khả dụng, dùng dữ liệu mẫu');
        renderHero(null);

        const sections = currentMode === 'phim' ? PHIM_SECTIONS : TRUYEN_SECTIONS;
        const data = currentMode === 'phim' ? PHIM_DATA : TRUYEN_DATA;
        sections.forEach(section => {
            const items = data[section.dataKey];
            if (items) {
                const container = document.getElementById(section.listId);
                if (container) {
                    container.innerHTML = '';
                    items.forEach(item => {
                        // Dữ liệu mẫu: dùng createCard cũ với gradient/emoji
                        const card = document.createElement('div');
                        card.className = 'movie-card';
                        card.innerHTML = `
                            <div class="movie-poster">
                                <div class="movie-poster-img" style="${item.gradient}; display:flex; align-items:center; justify-content:center;">
                                    <span style="font-size:3.5rem; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.3));">${item.emoji}</span>
                                </div>
                                <div class="movie-poster-overlay">
                                    <div class="play-icon">
                                        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                    </div>
                                </div>
                                <span class="movie-quality">${item.quality}</span>
                                <span class="movie-rating">⭐ ${item.rating}</span>
                                ${item.episode ? `<span class="movie-episode">${item.episode}</span>` : ''}
                            </div>
                            <div class="movie-info">
                                <h3 class="movie-title" title="${item.title}">${item.title}</h3>
                                <div class="movie-meta">
                                    <span class="movie-year">${item.year}</span>
                                    <span class="movie-genre">${item.genre}</span>
                                </div>
                            </div>
                        `;
                        container.appendChild(card);
                    });
                }
            }
        });
    }
}
