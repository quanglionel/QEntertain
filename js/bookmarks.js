/* === BOOKMARKS LOGIC === */

// Helper: Get list from LocalStorage
function getBookmarks(type) {
    // type: 'phim' | 'truyen'
    const key = (type === 'phim') ? 'qhub-bookmarks-phim' : 'qhub-bookmarks-truyen';
    try {
        const d = localStorage.getItem(key);
        return d ? JSON.parse(d) : [];
    } catch (e) { return []; }
}

// Check if item is bookmarked
function isBookmarked(slug, type) {
    const list = getBookmarks(type);
    return list.some(item => item.slug === slug);
}

// Add or Remove Bookmark (Toggle)
function toggleBookmark(item, type) {
    const key = (type === 'phim') ? 'qhub-bookmarks-phim' : 'qhub-bookmarks-truyen';
    let list = getBookmarks(type);

    const index = list.findIndex(i => i.slug === item.slug);

    if (index !== -1) {
        // Remove
        list.splice(index, 1); // Xóa khỏi danh sách
        localStorage.setItem(key, JSON.stringify(list));
        return false; // return new state: unbookmarked
    } else {
        // Add
        // Chỉ lưu thông tin cần thiết để render card
        const newItem = {
            id: item._id || item.slug,
            slug: item.slug,
            name: item.name,
            thumb_url: item.thumb_url,
            time: Date.now() // Thời gian thêm vào tủ
        };
        list.unshift(newItem); // Thêm vào đầu
        localStorage.setItem(key, JSON.stringify(list));
        return true; // return new state: bookmarked
    }
}

// Render Bookmark Page
function renderBookmarkPage() {
    const main = document.getElementById('movieSections');
    if (!main) return;

    // currentMode global variable
    const isTruyen = (typeof currentMode !== 'undefined') ? (currentMode === 'truyen') : false;
    const type = isTruyen ? 'truyen' : 'phim';
    const bookmarks = getBookmarks(type);

    if (bookmarks.length === 0) {
        main.innerHTML = `
        <section class="movie-section">
                <div class="section-header">
                    <h2 class="section-title">❤ Tủ ${isTruyen ? 'truyện' : 'phim'} yêu thích</h2>
                    <button class="see-all" onclick="handleNav('home')">← Trang chủ</button>
                </div>
                <div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.02);border-radius:12px;">
                    <div style="font-size:3rem;margin-bottom:10px;">💔</div>
                    <p>Chưa có gì trong tủ.</p>
                    <button onclick="handleNav('home')" style="margin-top:15px;padding:8px 20px;background:var(--accent);border:none;border-radius:20px;color:#fff;cursor:pointer;">Khám phá ngay</button>
                </div>
            </section>
        `;
        return;
    }

    main.innerHTML = `
        <section class="movie-section">
            <div class="section-header">
                <h2 class="section-title">❤ Tủ ${isTruyen ? 'truyện' : 'phim'} yêu thích</h2>
                <div class="section-controls">
                     <button class="see-all" onclick="handleNav('home')">← Trang chủ</button>
                </div>
            </div>
            <div class="movie-grid" id="bookmarkGrid"></div>
        </section>
    `;

    const grid = document.getElementById('bookmarkGrid');

    // Sort by added time desc
    bookmarks.sort((a, b) => b.time - a.time);

    bookmarks.forEach(item => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        card.onclick = () => {
            showDetail(item.slug);
        };

        const imgUrl = isTruyen ? API.getTruyenImageUrl(item.thumb_url) : API.getPhimImageUrl(item.thumb_url);

        // Uses formatRelativeTime if available (global)
        const timeStr = (window.formatRelativeTime) ? formatRelativeTime(item.time) : new Date(item.time).toLocaleDateString();

        card.innerHTML = `
            <div class="movie-poster">
                <img src="${imgUrl}" class="movie-poster-img" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
                <div class="movie-episode" style="background:rgba(0,0,0,0.7);bottom:auto;top:10px;right:10px;left:auto;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;padding:0;">
                    ❤
                </div>
            </div>
            <div class="movie-info">
                <div class="movie-title">${item.name}</div>
                <div class="movie-meta">
                    <span class="movie-year" style="font-size:0.75rem;color:#888;">Đã lưu ${timeStr}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Expose to window
window.getBookmarks = getBookmarks;
window.isBookmarked = isBookmarked;
window.toggleBookmark = toggleBookmark;
window.renderBookmarkPage = renderBookmarkPage;
