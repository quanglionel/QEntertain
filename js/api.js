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
            console.log('🌐 API Req:', url);
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

    /** Lấy danh sách phim trang chủ */
    async getPhimHome() {
        return this.fetch(`${this.phim}/danh-sach/phim-moi-cap-nhat`);
    },

    /** Lấy danh sách phim có bộ lọc
     * @param {string} type - loại: 'phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows'
     * @param {number} page - trang
     */
    async getPhimList(type = 'phim-moi', page = 1) {
        return this.fetch(`${this.phim}/danh-sach/${type}?page=${page}`);
    },

    /** Tìm kiếm phim
     * @param {string} keyword - từ khoá
     * @param {number} page - trang
     */
    async searchPhim(keyword, page = 1) {
        return this.fetch(`${this.phim}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
    },

    /** Lấy chi tiết phim
     * @param {string} slug - slug phim
     */
    async getPhimDetail(slug) {
        return this.fetch(`${this.phim}/phim/${slug}`);
    },

    /** Lấy danh sách thể loại phim */
    async getPhimCategories() {
        return this.fetch(`${this.phim}/the-loai`);
    },

    /** Lấy phim theo thể loại
     * @param {string} slug - slug thể loại
     * @param {number} page - trang
     */
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
     * @param {string} thumbUrl - tên file ảnh từ API (vd: "ten-phim-thumb.jpg")
     * @returns {string} - URL đầy đủ
     */
    getPhimImageUrl(thumbUrl) {
        if (!thumbUrl) return '';
        if (thumbUrl.startsWith('http')) return thumbUrl;
        return `${this.imgPhim}/${thumbUrl}`;
    },

    // ==========================================
    //  OTRUYEN - TRUYỆN
    // ==========================================

    /** Lấy danh sách truyện trang chủ */
    async getTruyenHome() {
        return this.fetch(`${this.truyen}/home`);
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
};
