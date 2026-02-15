/* === History Helper Functions === */
function getHistory(type) {
    // type: 'phim' | 'truyen'
    // Defaulting to 'phim' if undefined, though caller should specify.
    // If type matches currentMode (global), we can infer? Better to be explicit.

    // Using keys consistent with legacy code
    const key = (type === 'phim') ? 'qhub-history-phim' : 'qhub-history-truyen';
    try {
        const d = localStorage.getItem(key);
        return d ? JSON.parse(d) : [];
    } catch (e) { return []; }
}

function saveHistory(item) {
    // Determine type: if it has episode_url -> phim, else truyen
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

    localStorage.setItem(key, JSON.stringify(list));
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
