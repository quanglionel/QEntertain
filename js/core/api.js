/* ============================================
   QPhim & QTruyện - API Service
   Kết nối với OPhim và OTruyen API
   Qua Nginx reverse proxy (tránh CORS)
   ============================================ */

const API = {
    // === Base URLs (qua Nginx proxy) ===
    phim: '/api/phim',
    truyen: '/api/truyen',

    // === CDN ảnh (qua Nginx proxy) ===
    imgPhim: '/img/phim',
    imgTruyen: '/img/truyen',

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
            // console.log('✅ API Res:', data); // Uncomment nếu cần debug full data
            return data;
        } catch (err) {
            console.error(`❌ API Error [${url}]:`, err);
            return null;
        }
    },

    // ==========================================
    //  OPHIM - PHIM
    // ==========================================

    /** Lấy danh sách phim trang chủ (Gộp nhiều nguồn) */
    async getPhimHome() {
        try {
            // Lấy từ 3 nguồn khác nhau để đảm bảo nội dung đa dạng và đủ số lượng
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

            // Lọc trùng
            const uniqueItems = Array.from(new Map(items.map(item => [item._id || item.slug, item])).values());

            return { status: true, data: { items: uniqueItems } };
        } catch (e) {
            console.error('Error fetching Home Pages', e);
            return this.getPhimList('phim-moi-cap-nhat', 1);
        }
    },

    /** Lấy danh sách phim có bộ lọc */
    async getPhimList(type = 'phim-moi', page = 1) {
        return this.fetch(`${this.phim}/danh-sach/${type}?page=${page}`);
    },

    /** Tìm kiếm phim */
    async searchPhim(keyword, page = 1) {
        return this.fetch(`${this.phim}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
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

    /** Lấy danh sách truyện trang chủ (Gộp Truyện Mới, Đang phát hành, Hoàn thành) */
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
            // Lọc trùng
            const uniqueItems = Array.from(new Map(items.map(item => [item._id || item.slug, item])).values());

            return { status: true, data: { items: uniqueItems } };
        } catch (e) {
            return this.getTruyenList('truyen-moi', 1);
        }
    },

    /** Lấy danh sách truyện mới
     * @param {number} page - trang
     */
    async getTruyenList(type = 'truyen-moi', page = 1) {
        return this.fetch(`${this.truyen}/danh-sach/${type}?page=${page}`);
    },

    /** Tìm kiếm truyện
     * @param {string} keyword - từ khoá
     * @param {number} page - trang
     */
    async searchTruyen(keyword, page = 1) {
        return this.fetch(`${this.truyen}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
    },

    /** Lấy chi tiết truyện
     * @param {string} slug - slug truyện
     */
    async getTruyenDetail(slug) {
        return this.fetch(`${this.truyen}/truyen-tranh/${slug}`);
    },

    /** Lấy danh sách thể loại truyện */
    async getTruyenCategories() {
        return this.fetch(`${this.truyen}/the-loai`);
    },

    /** Lấy truyện theo thể loại */
    async getTruyenByCategory(slug, page = 1) {
        return this.fetch(`${this.truyen}/the-loai/${slug}?page=${page}`);
    },

    /**
     * Tạo URL ảnh truyện
     * @param {string} thumbUrl - tên file ảnh từ API
     * @returns {string} - URL đầy đủ
     */
    getTruyenImageUrl(thumbUrl) {
        if (!thumbUrl) return '';
        if (thumbUrl.startsWith('http')) return thumbUrl;
        return `${this.imgTruyen}/${thumbUrl}`;
    },
    /**
     * Lấy nội dung chương (danh sách ảnh)
     * @param {string} apiUrl - URL API gốc (từ chapter_api_data)
     * @returns {Promise<Object>} - Dữ liệu JSON chứa link ảnh
     */
    async getTruyenChapter(apiUrl) {
        if (!apiUrl) return null;

        // Rewrite URL để chạy qua Nginx Proxy
        // Gốc: https://sv1.otruyencdn.com/v1/api/chapter/...
        // Proxy: /api/truyen-chapter/v1/api/chapter/...
        let url = apiUrl;
        if (url.includes('sv1.otruyencdn.com')) {
            url = url.replace('https://sv1.otruyencdn.com', '/api/truyen-chapter');
        }

        return this.fetch(url);
    },
};
