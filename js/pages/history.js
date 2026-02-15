/* === History Helper Functions === */
function getHistory(type) {
    // type: 'phim' | 'truyen'
    // Defaulting to 'phim' if undefined, though caller should specify.
    // If type matches currentMode (global), we can infer? Better to be explicit.

    // Using keys consistent with legacy code
    const key = (type === 'phim') ? 'qhub-history-phim' : 'qhub-history-truyen';
    return QStorage.get(key, []);
}

function saveHistory(item) {
    // Add category for recommendations
    if (!item.category && window.currentDetailData && window.currentDetailData.slug === item.slug) {
        item.category = window.currentDetailData.category || [];
    }

    const isPhim = !!item.episode_url;
    const type = isPhim ? 'phim' : 'truyen';
    const key = isPhim ? 'qhub-history-phim' : 'qhub-history-truyen';

    let list = getHistory(type);
    // getHistory returns [] if empty.

    // Remove duplicate by slug
    if (list.length > 0) {
        list = list.filter(h => h.slug !== item.slug);
    }

    // Add to top
    list.unshift(item);

    if (list.length > 50) list.pop();

    QStorage.save(key, list);
}

function renderHistoryPage() {
    const main = document.getElementById('movieSections');
    if (!main) return;

    // currentMode global variable assumed from app.js/components.js
    const isTruyen = (typeof currentMode !== 'undefined') ? (currentMode === 'truyen') : false;
    const type = isTruyen ? 'truyen' : 'phim';
    const history = getHistory(type);

    if (history.length === 0) {
        main.innerHTML = `
        <section class="movie-section">
                <div class="section-header">
                    <h2 class="section-title">🕒 Lịch sử ${isTruyen ? 'đọc truyện' : 'xem phim'}</h2>
                    <button class="see-all" onclick="handleNav('home')">← Trang chủ</button>
                </div>
                <div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.02);border-radius:12px;">
                    <div style="font-size:3rem;margin-bottom:10px;">📭</div>
                    <p>Bạn chưa ${isTruyen ? 'đọc truyện' : 'xem phim'} nào.</p>
                </div>
            </section>
        `;
        return;
    }

    main.innerHTML = `
        <section class="movie-section">
            <div class="section-header">
                <h2 class="section-title">🕒 Lịch sử ${isTruyen ? 'đọc truyện' : 'xem phim'}</h2>
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

        if (isTruyen) {
            // Updated: pass slug to ensure nav works
            card.onclick = () => {
                console.log('Clicked History Item:', item); // DEBUG LOG
                readChap(item.chapter_api_data, true, item.slug);
            }
        } else {
            card.onclick = () => {
                showDetail(item.slug).then(() => {
                    playEp(item.episode_url, item.episode_name, item.slug, item.name, item.thumb_url);
                });
            };
        }

        const imgUrl = isTruyen ? API.getTruyenImageUrl(item.thumb_url) : API.getPhimImageUrl(item.thumb_url);
        const label = isTruyen ? `Ch.${item.chapter_name}` : `Tập ${item.episode_name}`;

        // Uses formatRelativeTime if available (global)
        const timeStr = (window.formatRelativeTime) ? formatRelativeTime(item.time) : new Date(item.time).toLocaleDateString();

        card.innerHTML = `
            <div class="movie-poster">
                <img src="${imgUrl}" class="movie-poster-img" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
                <div class="movie-episode" style="background:var(--accent);bottom:0;left:0;right:0;text-align:center;border-radius:0;">
                    ${isTruyen ? 'Đọc tiếp' : 'Xem tiếp'} ${label}
                </div>
                <button class="delete-history-btn" onclick="deleteHistoryItem('${item.slug}', event)" style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;">✕</button>
            </div>
            <div class="movie-info">
                <div class="movie-title">${item.name}</div>
                <div class="movie-meta">
                    <span class="movie-year" style="font-size:0.75rem;color:#888;">${timeStr}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function deleteHistoryItem(slug, event) {
    if (event) event.stopPropagation();

    // Determine type from current mode
    const isTruyen = (typeof currentMode !== 'undefined') ? (currentMode === 'truyen') : false;
    const type = isTruyen ? 'truyen' : 'phim';
    const key = isTruyen ? 'qhub-history-truyen' : 'qhub-history-phim';

    let list = getHistory(type);
    list = list.filter(h => h.slug !== slug);
    QStorage.save(key, list);

    // Re-render
    renderHistoryPage();
}

function clearHistory() {
    const isTruyen = (typeof currentMode !== 'undefined') ? (currentMode === 'truyen') : false;
    if (confirm(`Xóa toàn bộ lịch sử ${isTruyen ? 'đọc truyện' : 'xem phim'}?`)) {
        const key = isTruyen ? 'qhub-history-truyen' : 'qhub-history-phim';
        localStorage.removeItem(key);
        renderHistoryPage();
    }
}

window.getHistory = getHistory;
window.saveHistory = saveHistory;
window.renderHistoryPage = renderHistoryPage;
window.clearHistory = clearHistory;
window.deleteHistoryItem = deleteHistoryItem;

// ============================================
// Watched Episodes / Chapters Tracking
// ============================================
function getWatchedList(slug) {
    const store = QStorage.get('qhub-watched-episodes', {});
    return store[slug] || [];
}

function markWatched(slug, episodeId) {
    const store = QStorage.get('qhub-watched-episodes', {});
    if (!store[slug]) store[slug] = [];

    // Add if not exists
    if (!store[slug].includes(episodeId)) {
        store[slug].push(episodeId);
        QStorage.save('qhub-watched-episodes', store);
    }
}

function checkWatched(slug, episodeId) {
    const list = getWatchedList(slug);
    return list.includes(episodeId);
}

// Expose
window.getWatchedList = getWatchedList;
window.markWatched = markWatched;
window.checkWatched = checkWatched;
