/* ============================================
   QPhim & QTruyện - API Service
   Kết nối với OPhim, KKPhim và OTruyen API
   Qua Nginx reverse proxy (tránh CORS)
   ============================================ */

const API = {
    // === Nguồn phim hiện tại (Lấy từ Storage) ===
    _phimSource: QStorage.get('qphim-source', 'ophim'),

    // === Base URLs (qua Nginx proxy) ===
    ophim: '/api/phim',
    kkphim: '/api/kkphim',
    truyen: '/api/truyen',

    // === CDN ảnh (qua Nginx proxy) ===
    imgOPhim: '/img/phim',
    imgKKPhim: '/img/kkphim',
    imgTruyen: '/img/truyen',

    /** Lấy URL API phim hiện tại */
    get phim() {
        return this._phimSource === 'kkphim' ? this.kkphim : this.ophim;
    },

    /** Lấy URL CDN ảnh hiện tại */
    get imgPhim() {
        return this._phimSource === 'kkphim' ? this.imgKKPhim : this.imgOPhim;
    },

    /** Thay đổi nguồn phim */
    setSource(source) {
        if (['ophim', 'kkphim'].includes(source)) {
            this._phimSource = source;
            QStorage.save('qphim-source', source);
            console.log('🔄 Phim Source changed to:', source);
            return true;
        }
        return false;
    },

    /**
     * Gọi API và parse JSON
     * @param {string} url - URL API
     * @returns {Promise<Object>} - Dữ liệu JSON
     */
    async fetch(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error(`❌ API Error [${url}]:`, err);
            return null;
        }
    },

    // ==========================================
    //  MOVIE API (Supports multiple sources)
    // ==========================================

    /** Lấy danh sách phim trang chủ */
    async getPhimHome() {
        try {
            // Đối với KKPhim, danh sách phim mới trang chủ là đủ phong phú
            if (this._phimSource === 'kkphim') {
                const res = await this.getPhimList('phim-moi-cap-nhat', 1);
                return res;
            }

            // Đối với OPhim, gộp nhiều loại để đa dạng
            const [r1, r2, r3] = await Promise.all([
                this.getPhimList('phim-moi-cap-nhat', 1),
                this.getPhimList('phim-le', 1),
                this.getPhimList('phim-bo', 1)
            ]);

            const items = [
                ...(r1?.items || r1?.data?.items || []),
                ...(r2?.items || r2?.data?.items || []),
                ...(r3?.items || r3?.data?.items || [])
            ];

            const uniqueItems = Array.from(new Map(items.map(item => [item._id || item.slug, item])).values());
            return { status: true, data: { items: uniqueItems } };
        } catch (e) {
            return this.getPhimList('phim-moi-cap-nhat', 1);
        }
    },

    /** Lấy danh sách phim có bộ lọc */
    async getPhimList(type = 'phim-moi', page = 1) {
        // Cấu trúc URL OPhim: /api/phim/danh-sach/{type}?page={page}
        // Cấu trúc URL KKPhim: /api/kkphim/danh-sach/{type}?page={page}
        let url = `${this.phim}/danh-sach/${type}?page=${page}`;

        // Fix cho KKPhim nếu type là mặc định
        if (this._phimSource === 'kkphim' && type === 'phim-moi') {
            url = `${this.phim}/danh-sach/phim-moi-cap-nhat?page=${page}`;
        }

        return this.fetch(url);
    },

    /** Tìm kiếm phim */
    async searchPhim(keyword, page = 1) {
        return this.fetch(`${this.phim}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
    },

    /** Lấy chi tiết phim */
    async getPhimDetail(slug) {
        // OPhim: /api/phim/phim/{slug}
        // KKPhim: /api/kkphim/phim/{slug}
        return this.fetch(`${this.phim}/phim/${slug}`);
    },

    /** Lấy danh sách thể loại phim */
    async getPhimCategories() {
        return this.fetch(`${this.phim}/the-loai`);
    },

    /** Lấy phim theo thể loại */
    async getPhimByCategory(slug, page = 1) {
        return this.fetch(`${this.phim}/the-loai/${slug}?page=${page}`);
    },

    /** Lấy danh sách quốc gia */
    async getPhimCountries() {
        return this.fetch(`${this.phim}/quoc-gia`);
    },

    /** Lấy phim theo quốc gia */
    async getPhimByCountry(slug, page = 1) {
        return this.fetch(`${this.phim}/quoc-gia/${slug}?page=${page}`);
    },

    /**
     * Tạo URL ảnh phim
     */
    getPhimImageUrl(thumbUrl) {
        if (!thumbUrl) return '';
        if (thumbUrl.startsWith('http')) return thumbUrl;
        return `${this.imgPhim}/${thumbUrl}`;
    },

    // ==========================================
    //  OTRUYEN - TRUYỆN
    // ==========================================

    async getTruyenHome() {
        try {
            const [r1, r2, r3] = await Promise.all([
                this.getTruyenList('truyen-moi', 1),
                this.getTruyenList('dang-phat-hanh', 1),
                this.getTruyenList('hoan-thanh', 1)
            ]);

            const items = [
                ...(r1?.data?.items || []),
                ...(r2?.data?.items || []),
                ...(r3?.data?.items || [])
            ];
            const uniqueItems = Array.from(new Map(items.map(item => [item._id || item.slug, item])).values());
            return { status: true, data: { items: uniqueItems } };
        } catch (e) {
            return this.getTruyenList('truyen-moi', 1);
        }
    },

    async getTruyenList(type = 'truyen-moi', page = 1) {
        return this.fetch(`${this.truyen}/danh-sach/${type}?page=${page}`);
    },

    async searchTruyen(keyword, page = 1) {
        return this.fetch(`${this.truyen}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
    },

    async getTruyenDetail(slug) {
        return this.fetch(`${this.truyen}/truyen-tranh/${slug}`);
    },

    async getTruyenCategories() {
        return this.fetch(`${this.truyen}/the-loai`);
    },

    async getTruyenByCategory(slug, page = 1) {
        return this.fetch(`${this.truyen}/the-loai/${slug}?page=${page}`);
    },

    getTruyenImageUrl(thumbUrl) {
        if (!thumbUrl) return '';
        if (thumbUrl.startsWith('http')) return thumbUrl;
        return `${this.imgTruyen}/${thumbUrl}`;
    },

    async getTruyenChapter(apiUrl) {
        if (!apiUrl) return null;
        let url = apiUrl;
        if (url.includes('sv1.otruyencdn.com')) {
            url = url.replace('https://sv1.otruyencdn.com', '/api/truyen-chapter');
        }
        return this.fetch(url);
    },
};

window.API = API;
