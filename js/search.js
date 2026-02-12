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

    // Toggle Input -> Giờ là nút Submit tìm kiếm
    searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query, resultsContainer);
        } else {
            searchInput.focus();
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
            // searchBox.classList.remove('active'); // Không cần thiết nữa
            resultsContainer.classList.remove('show');
        }
    });
}

// Hàm tìm kiếm chính
// Hàm tìm kiếm chính
async function performSearch(query, container) {
    const isPhim = localStorage.getItem('qhub-mode') !== 'truyen';

    container.innerHTML = '<div class="loading-spinner" style="padding:20px;text-align:center;">Đang tìm...</div>';
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
        container.innerHTML = items.map(item => {
            const imgUrl = isPhim
                ? API.getPhimImageUrl(item.thumb_url)
                : API.getTruyenImageUrl(item.thumb_url);

            const meta = isPhim
                ? (item.year || 'N/A')
                : (item.status === 'completed' ? 'Hoàn thành' : 'Đang ra');

            const sub = isPhim
                ? `<span style="color:${item.lang?.includes('Vietsub') ? '#00d4aa' : '#fbbf24'}">${item.lang || ''}</span>`
                : `${item.chaptersLatest ? item.chaptersLatest.length + ' chương' : 'Nhiều chương'}`;

            return `
                <div class="search-item" onclick="selectSearchResult('${item.slug}')">
                    <img src="${imgUrl}" class="s-thumb" onerror="this.style.background='#333';this.style.display='none'">
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
        container.innerHTML = '<div style="padding:15px;text-align:center;color:#f55;">Lỗi kết nối</div>';
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
