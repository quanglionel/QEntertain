/* ============================================
   QPhim & QTruyện - Dữ liệu
   Chứa tất cả dữ liệu cho cả 2 chế độ
   ============================================ */

// === SVG Icons dùng chung ===
const ICONS = {
    search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    user: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    play: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    book: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    history: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    category: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
};

// === Cấu hình 2 chế độ ===
const APP_MODES = {
    phim: {
        id: "phim",
        label: "QPhim",
        icon: "🎬",
        searchPlaceholder: "Tìm phim, diễn viên...",
        navLinks: [
            { label: "Trang chủ", section: "home", active: true },
            { label: "Phim lẻ", section: "phim-le", active: false },
            { label: "Phim bộ", section: "phim-bo", active: false },
            { label: "Anime", section: "hoat-hinh", active: false },
            { label: "Thể loại", section: "genres", active: false },
            { label: "Lịch sử", section: "history", active: false },
        ],
    },
    truyen: {
        id: "truyen",
        label: "QTruyện",
        icon: "📚",
        searchPlaceholder: "Tìm truyện, tác giả...",
        navLinks: [
            { label: "Trang chủ", section: "home", active: true },
            { label: "Manga", section: "manga", active: false },
            { label: "Manhwa", section: "manhwa", active: false },
            { label: "Manhua", section: "manhua", active: false },
            { label: "Thể loại", section: "genres", active: false },
            { label: "Lịch sử", section: "history", active: false },
        ],
    }
};

// === Dữ liệu Footer ===
const FOOTER_DATA = {
    desc: "Nền tảng giải trí trực tuyến miễn phí. Xem phim chất lượng cao và đọc truyện tranh hấp dẫn từ khắp nơi trên thế giới.",
    columns: [
        { title: "QPhim", links: ["Phim lẻ", "Phim bộ", "Anime", "Phim chiếu rạp"] },
        { title: "QTruyện", links: ["Manga", "Manhwa", "Manhua", "Light Novel"] },
        { title: "Hỗ trợ", links: ["Liên hệ", "FAQ", "Điều khoản", "Bảo mật"] },
    ],
    copyright: "© 2026 QPhim & QTruyện. Mọi quyền được bảo lưu."
};


// ============================================================
//  DỮ LIỆU CẤU HÌNH (Gọn nhẹ)
// ============================================================

// === Sections - Phim ===
const PHIM_SECTIONS = [
    { id: "sectionTrending", listId: "trendingList", icon: "🔥", title: "Xu hướng" },
    { id: "sectionNew", listId: "newList", icon: "🆕", title: "Phim mới cập nhật" },
    { id: "sectionSeries", listId: "seriesList", icon: "📺", title: "Phim bộ hay" },
    { id: "sectionAnime", listId: "animeList", icon: "🎌", title: "Anime" },
    { id: "sectionCinema", listId: "cinemaList", icon: "🎬", title: "Phim chiếu rạp" },
];

// === Sections - Truyện ===
const TRUYEN_SECTIONS = [
    { id: "sectionHot", listId: "hotList", icon: "🔥", title: "Truyện hot" },
    { id: "sectionUpdated", listId: "updatedList", icon: "🆕", title: "Mới cập nhật" },
    { id: "sectionManga", listId: "mangaList", icon: "🇯🇵", title: "Manga" },
    { id: "sectionManhwa", listId: "manhwaList", icon: "🇰🇷", title: "Manhwa" },
    { id: "sectionManhua", listId: "manhuaList", icon: "🇨🇳", title: "Manhua" },
];
