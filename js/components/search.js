/* ============================================
   QPhim - Tìm kiếm (Nâng cao)
   Xử lý tìm kiếm Phim & Truyện với Gợi ý (Dropdown) & Lịch sử
   ============================================ */

let searchTimeout = null;

// === History Logic ===
function getSearchHistory() {
    return QStorage.get('qhub-search-history', []);
}

function saveSearchHistory(query) {
    if (!query) return;
    let history = getSearchHistory();
    // Remove if exists (to move to top)
    history = history.filter(item => item !== query);
    // Add to top
    history.unshift(query);
    // Limit to 10
    if (history.length > 10) history.pop();
    QStorage.save('qhub-search-history', history);
}

function removeSearchHistory(query, e) {
    if (e) e.stopPropagation();
    let history = getSearchHistory();
    history = history.filter(item => item !== query);
    QStorage.save('qhub-search-history', history);

    // Re-render if input is empty
    const searchInput = document.querySelector('.search-input');
    const resultsContainer = document.querySelector('.search-results');
    if (searchInput && resultsContainer && searchInput.value.trim() === '') {
        renderSearchHistory(resultsContainer);
    }
}

function renderSearchHistory(container) {
    const history = getSearchHistory();
    if (history.length === 0) {
        container.classList.remove('show');
        return;
    }

    container.innerHTML = `
        <div style="padding:10px 15px;font-size:0.8rem;color:var(--text-secondary);display:flex;justify-content:space-between;align-items:center;">
            <span>Lịch sử tìm kiếm</span>
            <span style="cursor:pointer;color:var(--accent);" onclick="QStorage.save('qhub-search-history', []); document.querySelector('.search-results').classList.remove('show');">Xóa tất cả</span>
        </div>
    `;

    history.forEach(query => {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.style.alignItems = 'center';
        item.style.justifyContent = 'space-between';

        item.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;flex:1;" onclick="handleHistoryClick('${query}')">
                <span style="color:var(--text-secondary);">🕒</span>
                <span class="s-title" style="margin:0;font-weight:400;">${query}</span>
            </div>
            <button onclick="removeSearchHistory('${query}', event)" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;padding:5px;">×</button>
        `;
        container.appendChild(item);
    });
    container.classList.add('show');
}

window.handleHistoryClick = (query) => {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = query;
        // Trigger search or navigate
        if (window.handleNav) window.handleNav('search', query);
        // Save again (move to top)
        saveSearchHistory(query);
        // Hide dropdown
        document.querySelector('.search-results')?.classList.remove('show');
    }
};

function initSearchBox() {
    // Inject CSS Dropdown nếu chưa có
    if (!document.getElementById('search-style')) {
        const style = document.createElement('style');
        style.id = 'search-style';
        style.textContent = `
            .search-results {
                position: absolute;
                top: 100%;
                right: 0;
                width: 350px;
                max-height: 400px;
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-lg);
                overflow-y: auto;
                z-index: 1001;
                display: none;
                margin-top: 10px;
            }
            .search-results.show { display: block; }
            .search-item {
                display: flex;
                gap: 12px;
                padding: 10px;
                cursor: pointer;
                transition: background 0.2s;
                border-bottom: 1px solid var(--border);
            }
            .search-item:last-child { border-bottom: none; }
            .search-item:hover { background: var(--bg-input); }
            .s-thumb {
                width: 50px;
                height: 75px;
                object-fit: cover;
                border-radius: var(--radius-sm);
                background: #333;
            }
            .s-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
            .s-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
            .s-meta { font-size: 0.8rem; color: var(--text-secondary); }
            
            /* Responsive */
            @media (max-width: 480px) {
                .search-results { width: 300px; right: -50px; }
            }
        `;
        document.head.appendChild(style);
    }

    const searchBox = document.querySelector('.search-box'); // Container
    const searchToggle = document.querySelector('.search-toggle'); // Button
    const searchInput = document.querySelector('.search-input'); // Input

    // Tạo container kết quả
    let resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer && searchBox) {
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        searchBox.appendChild(resultsContainer);
    }

    if (!searchToggle || !searchInput) {
        // console.warn('Search Elements Missing!');
        return;
    }

    // Event Click Toggle (Mobile/Tablet)
    searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const query = searchInput.value.trim();
        if (query) {
            saveSearchHistory(query);
            if (window.handleNav) window.handleNav('search', query);
            resultsContainer.classList.remove('show');
        } else {
            searchInput.focus();
        }
    });

    // Handle Enter Key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                saveSearchHistory(query);
                // Close dropdown
                resultsContainer.classList.remove('show');
                // Navigate to search page
                if (window.handleNav) window.handleNav('search', query);
            }
        }
    });

    // Show history on focus
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim() === '') {
            renderSearchHistory(resultsContainer);
        }
    });

    // Handle Input (Debounce)
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchTimeout);

        if (query.length === 0) {
            renderSearchHistory(resultsContainer);
            return;
        }

        if (query.length < 2) {
            // resultsContainer.classList.remove('show');
            // Show history filtered? No, stick to raw input for now
            return;
        }

        searchTimeout = setTimeout(() => performSearch(query, resultsContainer), 500);
    });

    // Close when click outside
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) {
            // searchBox.classList.remove('active'); // Không cần thiết nữa
            resultsContainer.classList.remove('show');
        }
    });
}

// Hàm tìm kiếm chính
async function performSearch(query, container) {
    const isPhim = localStorage.getItem('qhub-mode') !== 'truyen';

    // container.innerHTML = '<div class="loading-spinner" style="padding:20px;text-align:center;">Đang tìm...</div>';
    // Don't fully clear if we want to keep feel responsive, but standard practice:
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">Đang tìm...</div>';
    container.classList.add('show');

    try {
        let res;
        if (isPhim) {
            res = await API.searchPhim(query);
        } else {
            res = await API.searchTruyen(query);
        }

        const items = res?.data?.items || [];

        if (items.length === 0) {
            container.innerHTML = '<div style="padding:15px;text-align:center;color:var(--text-muted);">Không tìm thấy kết quả</div>';
            return;
        }

        // Render items
        const listHTML = items.map(item => {
            const imgUrl = isPhim
                ? API.getPhimImageUrl(item.thumb_url)
                : API.getTruyenImageUrl(item.thumb_url);

            const meta = isPhim
                ? (item.year || 'N/A')
                : (item.status === 'completed' ? 'Hoàn thành' : 'Đang ra');

            // Highlight keyword logic optional

            return `
                <div class="search-item" onclick="selectSearchResult('${item.slug}', '${item.name}')">
                    <img src="${imgUrl}" class="s-thumb" onerror="this.style.background='#333';this.style.display='none'">
                    <div class="s-info">
                        <div class="s-title">${item.name}</div>
                        <div class="s-meta">${item.origin_name || ''}</div>
                        <div class="s-meta" style="margin-top:2px;">${meta}</div>
                    </div>
                </div>
            `;
        }).join('');
        container.innerHTML = listHTML;

    } catch (e) {
        console.error('Search Error:', e);
        container.innerHTML = '<div style="padding:15px;text-align:center;color:#f55;">Lỗi kết nối</div>';
    }
}

// Chọn kết quả
window.selectSearchResult = (slug, name) => {
    // Save to history
    if (name) saveSearchHistory(name);

    // Đóng search box
    const searchBox = document.querySelector('.search-box');
    const results = document.querySelector('.search-results');
    if (searchBox) searchBox.classList.remove('active');
    if (results) results.classList.remove('show');

    // Gọi showDetail global (từ components.js)
    if (window.showDetail) window.showDetail(slug);
};

// Expose internal history functions for onclick handlers in HTML string
window.removeSearchHistory = removeSearchHistory;
window.saveSearchHistory = saveSearchHistory;

// Init khi tải xong
window.initSearchBox = initSearchBox;
