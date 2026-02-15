/* ============================================
   QPhim & QTruyện - API Service
   Kết nối với các nguồn API: OPhim (Mặc định)
   Bỏ các nguồn dự phòng KKPhim, NguonC, SubNhanh theo yêu cầu.
   ============================================ */

const API = {
    // === Nguồn phim hiện tại (Mặc định là OPhim) ===
    _phimSource: 'ophim',

    // === Cấu hình các nguồn phim (Chỉ giữ OPhim) ===
    SOURCES: {
        ophim: {
            api: '/api/phim', // OPhim qua Proxy Nginx
            img: '/img/phim',
            name: 'OPhim (Mặc định)'
        }
    },

    truyen: '/api/truyen',
    imgTruyen: '/img/truyen',

    /** Lấy URL API phim hiện tại */
    get phim() {
        return this.SOURCES.ophim.api;
    },

    /** Lấy URL CDN ảnh hiện tại */
    get imgPhim() {
        return this.SOURCES.ophim.img;
    },

    /** Dummy function to maintain compatibility */
    setSource(source) {
        console.log('🔄 Chỉ hỗ trợ nguồn OPhim mặc định.');
        return true;
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

            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('API returned HTML instead of JSON.');
            }

            const data = await res.json();
            return data;
        } catch (err) {
            console.error(`❌ API Error [${url}]:`, err);
            return null;
        }
    },

    // ==========================================
    //  MOVIE API
    // ==========================================

    /** Lấy danh sách phim trang chủ */
    async getPhimHome() {
        try {
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
        let url = `${this.phim}/danh-sach/${type}?page=${page}`;
        return this.fetch(url);
    },

    /** Tìm kiếm phim */
    async searchPhim(keyword, page = 1) {
        return this.fetch(`${this.phim}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
    },

    /** Lấy chi tiết phim */
    async getPhimDetail(slug) {
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

    /** Tạo URL ảnh phim */
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
