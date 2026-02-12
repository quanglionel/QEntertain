/* ============================================
   QPhim - Tìm kiếm (Nâng cao)
   Xử lý tìm kiếm Phim & Truyện với Gợi ý (Dropdown)
   ============================================ */

let searchTimeout = null;

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

    console.log('Init Search:', { searchBox, searchToggle, searchInput });

    // Tạo container kết quả
    let resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        searchBox.appendChild(resultsContainer);
    }

    if (!searchToggle || !searchInput) {
        console.warn('Search Elements Missing!');
        return;
    }

    // Toggle Input
    searchToggle.addEventListener('click', (e) => {
        console.log('🔍 Click Search Toggle!');
        e.stopPropagation();

        searchBox.classList.toggle('active');

        const isActive = searchBox.classList.contains('active');
        console.log('Search Box Active State:', isActive);

        if (isActive) {
            console.log('Trying to focus input...');

            // Ép hiển thị bằng Inline Style (Fix lỗi CSS Cache)
            Object.assign(searchInput.style, {
                visibility: 'visible',
                opacity: '1',
                width: '280px',
                padding: '10px 20px 10px 44px',
                background: 'var(--bg-input)',
                border: '1px solid var(--accent)',
                right: '0',
                position: 'absolute',
                zIndex: '5'
            });

            searchInput.focus();
        } else {
            resultsContainer.classList.remove('show');
            // Ẩn lại
            Object.assign(searchInput.style, {
                width: '0',
                opacity: '0',
                visibility: 'hidden',
                padding: '0'
            });
        }
    });

    // Handle Input (Debounce)
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchTimeout);

        if (query.length < 2) {
            resultsContainer.classList.remove('show');
            return;
        }

        searchTimeout = setTimeout(() => performSearch(query, resultsContainer), 500);
    });

    // Close when click outside
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) {
            searchBox.classList.remove('active');
            resultsContainer.classList.remove('show');
        }
    });
}

// Hàm tìm kiếm chính
async function performSearch(query, container) {
    const isPhim = localStorage.getItem('qhub-mode') !== 'truyen';
    const apiUrl = isPhim
        ? `/api/phim/tim-kiem?keyword=${encodeURIComponent(query)}`
        : `/api/truyen/tim-kiem?keyword=${encodeURIComponent(query)}`;

    container.innerHTML = '<div class="loading-spinner">Đang tìm...</div>';
    container.classList.add('show');

    try {
        const res = await fetch(apiUrl);
        const json = await res.json();
        const items = json.data?.items || [];

        if (items.length === 0) {
            container.innerHTML = '<div style="padding:15px;text-align:center;color:#888;">Không tìm thấy kết quả</div>';
            return;
        }

        // Render items
        container.innerHTML = items.map(item => {
            let imgUrl = item.thumb_url;
            if (!imgUrl.startsWith('http')) {
                // Dùng Nginx proxy thay vì domain gốc (tránh CORS/blocked)
                const proxyPath = isPhim ? '/img/phim' : '/img/truyen';
                imgUrl = `${proxyPath}/${item.thumb_url}`;
            } else {
                // Nếu URL đầy đủ, rewrite qua proxy
                imgUrl = imgUrl
                    .replace('https://img.ophim.live/uploads/movies', '/img/phim')
                    .replace('https://img.otruyenapi.com/uploads/comics', '/img/truyen');
            }
            const meta = isPhim ? (item.year || 'N/A') : (item.status === 'completed' ? 'Hoàn thành' : 'Đang ra');
            const sub = isPhim
                ? `<span style="color:${item.lang?.includes('Vietsub') ? '#00d4aa' : '#fbbf24'}">${item.lang || ''}</span>`
                : `${item.chaptersLatest ? item.chaptersLatest.length + ' chương' : 'Nhiều chương'}`;

            return `
                <div class="search-item" onclick="selectSearchResult('${item.slug}')">
                    <img src="${imgUrl}" class="s-thumb" onerror="this.style.background='#333';this.alt='Ảnh lỗi'">
                    <div class="s-info">
                        <div class="s-title">${item.name}</div>
                        <div class="s-meta">${item.origin_name || ''}</div>
                        <div class="s-meta" style="margin-top:2px;">${meta} • ${sub}</div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Search Error:', e);
        container.innerHTML = '<div style="padding:15px;text-align:center;color:#f55;">Lỗi tìm kiếm</div>';
    }
}

// Chọn kết quả
window.selectSearchResult = (slug) => {
    // Đóng search box
    const searchBox = document.querySelector('.search-box');
    const results = document.querySelector('.search-results');
    if (searchBox) searchBox.classList.remove('active');
    if (results) results.classList.remove('show');

    // Gọi showDetail global (từ components.js)
    if (window.showDetail) window.showDetail(slug);
};

// Init khi tải xong
window.initSearchBox = initSearchBox;
// Không gọi tự động nữa vì Header render bằng JS
// document.addEventListener('DOMContentLoaded', initSearchBox);
