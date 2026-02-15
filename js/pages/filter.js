/* ============================================
   Filter/Discovery Page Logic
   Handle Advanced Filter UI & Routing
   ============================================ */

const FilterPage = {
    genres: [],
    countries: [],
    years: Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i), // Last 15 years

    async init() {
        document.title = 'Bộ Lọc Phim - QPhim';
        const main = document.getElementById('movieSections');
        if (!main) return;

        main.innerHTML = '<div class="loading-spinner"></div>';
        main.style.paddingTop = '80px';

        // Hide Hero
        const hero = document.getElementById('hero');
        if (hero) hero.style.display = 'none';

        // Check cache or fetch
        if (this.genres.length === 0 || this.countries.length === 0) {
            try {
                if (currentMode === 'phim') {
                    const [gRes, cRes] = await Promise.all([API.getPhimCategories(), API.getPhimCountries()]);
                    this.genres = gRes?.data?.items || [];
                    this.countries = cRes?.data?.items || [];
                } else {
                    const gRes = await API.getTruyenCategories();
                    this.genres = gRes?.data?.items || [];
                    this.countries = []; // Truyen API usually has no country list
                }
            } catch (e) {
                console.error('Filter Init Error', e);
            }
        }

        this.render(main);
    },

    render(container) {
        const isPhim = currentMode === 'phim';

        // Options HTML
        const genreOpts = this.genres.map(g => `<option value="${g.slug}">${g.name}</option>`).join('');
        const countryOpts = this.countries.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
        const yearOpts = this.years.map(y => `<option value="${y}">${y}</option>`).join('');

        const html = `
            <section class="movie-section" id="filterSection">
                <div class="section-header">
                    <h2 class="section-title">🔍 Bộ Lọc ${isPhim ? 'Phim' : 'Truyện'}</h2>
                    <button class="see-all" onclick="handleNav('home')">← Trang chủ</button>
                </div>

                <div class="filter-container" style="background:var(--bg-card); padding:20px; border-radius:12px; margin-bottom:30px;">
                    <div class="filter-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px; margin-bottom:20px;">
                        
                        <!-- Loại phim (Static) -->
                        <div class="filter-group">
                            <label style="display:block; margin-bottom:8px; color:#aaa; font-size:0.9rem;">Danh mục</label>
                            <select id="f-type" class="filter-select" style="width:100%; padding:10px; border-radius:8px; background:var(--bg-main); border:1px solid var(--border); color:white;">
                                <option value="">-- Tất cả --</option>
                                ${isPhim ? `
                                    <option value="phim-le">Phim Lẻ</option>
                                    <option value="phim-bo">Phim Bộ</option>
                                    <option value="hoat-hinh">Hoạt Hình</option>
                                    <option value="tv-shows">TV Shows</option>
                                    <option value="phim-moi-cap-nhat">Mới Cập Nhật</option>
                                ` : `
                                    <option value="truyen-moi">Truyện Mới</option>
                                    <option value="sap-ra-mat">Sắp Ra Mắt</option>
                                    <option value="dang-phat-hanh">Đang Phát Hành</option>
                                    <option value="hoan-thanh">Hoàn Thành</option>
                                `}
                            </select>
                        </div>

                        <!-- Thể loại -->
                        <div class="filter-group">
                            <label style="display:block; margin-bottom:8px; color:#aaa; font-size:0.9rem;">Thể loại</label>
                            <select id="f-genre" class="filter-select" style="width:100%; padding:10px; border-radius:8px; background:var(--bg-main); border:1px solid var(--border); color:white;">
                                <option value="">-- Tất cả --</option>
                                ${genreOpts}
                            </select>
                        </div>

                        <!-- Quốc gia -->
                        ${isPhim ? `
                        <div class="filter-group">
                            <label style="display:block; margin-bottom:8px; color:#aaa; font-size:0.9rem;">Quốc gia</label>
                            <select id="f-country" class="filter-select" style="width:100%; padding:10px; border-radius:8px; background:var(--bg-main); border:1px solid var(--border); color:white;">
                                <option value="">-- Tất cả --</option>
                                ${countryOpts}
                            </select>
                        </div>
                        ` : ''}

                        <!-- Năm (Chỉ mang tính tham khảo nếu API ko fetch được) -->
                        <!-- <div class="filter-group">
                             <label>Năm</label>
                             <select id="f-year" class="filter-select">
                                <option value="">-- Tất cả --</option>
                                ${yearOpts}
                             </select>
                        </div> -->
                    </div>

                    <button onclick="FilterPage.apply()" style="width:100%; padding:12px; background:var(--accent); color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:1rem; transition:0.2s;">
                        🚀 Lọc Ngay
                    </button>
                    <p style="margin-top:10px; font-size:0.8rem; color:#666; text-align:center;">
                        Lưu ý: Do giới hạn của nguồn phim, hệ thống sẽ ưu tiên tiêu chí cụ thể nhất (Thể loại > Quốc gia > Danh mục).
                    </p>
                </div>

                <div id="filterResults"></div>
            </section>
        `;

        container.innerHTML = html;
        this.loadQuickSuggest(container);
    },

    loadQuickSuggest(container) {
        // Show some popular genres as quick tags below
        const tags = this.genres.slice(0, 10).map(g =>
            `<button onclick="handleNav('${g.slug}', '${g.name}')" class="genre-tag-large" style="font-size:0.85rem; padding:8px 15px;">${g.name}</button>`
        ).join('');

        const div = document.createElement('div');
        div.innerHTML = `
            <h3 style="margin-bottom:15px; font-size:1.1rem; color:var(--text-secondary);">🔥 Phổ biến</h3>
            <div class="genre-grid-page">${tags}</div>
        `;
        container.querySelector('#filterResults').appendChild(div);
    },

    apply() {
        const type = document.getElementById('f-type').value;
        const genre = document.getElementById('f-genre').value;
        const country = document.getElementById('f-country')?.value;

        // Logic ưu tiên: Genre > Country > Type
        // Vì API không cho kết hợp.

        let slug = '';
        let label = '';

        if (genre) {
            slug = genre;
            // Get Name
            const n = this.genres.find(g => g.slug === slug)?.name;
            label = `Thể loại: ${n}`;
        } else if (country) {
            slug = country;
            const n = this.countries.find(c => c.slug === slug)?.name;
            label = `Quốc gia: ${n}`;
        } else if (type) {
            slug = type;
            label = `Danh sách: ${slug}`;
        } else {
            alert('Vui lòng chọn ít nhất 1 tiêu chí!');
            return;
        }

        // Call global handleNav
        handleNav(slug, label);
    }
};

window.renderFilterPage = () => FilterPage.init();
