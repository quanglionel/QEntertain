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
            { label: "Phim lẻ", section: "movies", active: false },
            { label: "Phim bộ", section: "series", active: false },
            { label: "Anime", section: "anime", active: false },
            { label: "Thể loại", section: "genres", active: false },
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
//  DỮ LIỆU QPHIM
// ============================================================

// === Hero Slides - Phim ===
const PHIM_HERO_SLIDES = [
    {
        badge: "🔥 Nổi bật", title: "Vùng Đất Linh Hồn",
        rating: 9.2, year: 2025, duration: "2h 15m", quality: "4K",
        desc: "Một hành trình kỳ diệu qua thế giới thần thoại, nơi ranh giới giữa sự sống và cái chết trở nên mong manh.",
        genres: ["Phiêu lưu", "Giả tưởng", "Hành động"],
        gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        btnPrimary: "Xem ngay", btnPrimaryIcon: "play"
    },
    {
        badge: "🎬 Mới cập nhật", title: "Mật Mã Thời Gian",
        rating: 8.8, year: 2026, duration: "1h 58m", quality: "HD",
        desc: "Khi một nhà khoa học phát hiện ra cách du hành thời gian, mỗi thay đổi trong quá khứ đều tạo ra một tương lai đen tối hơn...",
        genres: ["Khoa học viễn tưởng", "Kịch tính"],
        gradient: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
        btnPrimary: "Xem ngay", btnPrimaryIcon: "play"
    },
    {
        badge: "💎 Đề cử", title: "Bóng Tối Cuối Cùng",
        rating: 9.0, year: 2025, duration: "2h 32m", quality: "4K",
        desc: "Trong một thế giới hậu tận thế, nhóm người sống sót phải chiến đấu chống lại thế lực bóng tối đang nuốt chửng mọi thứ.",
        genres: ["Kinh dị", "Hành động", "Viễn tưởng"],
        gradient: "linear-gradient(135deg, #4a0e0e 0%, #c0392b 50%, #e74c3c 100%)",
        btnPrimary: "Xem ngay", btnPrimaryIcon: "play"
    }
];

// === Sections - Phim ===
const PHIM_SECTIONS = [
    { id: "sectionTrending", listId: "trendingList", icon: "🔥", title: "Xu hướng", dataKey: "trending" },
    { id: "sectionNew", listId: "newList", icon: "🆕", title: "Phim mới cập nhật", dataKey: "newMovies" },
    { id: "sectionSeries", listId: "seriesList", icon: "📺", title: "Phim bộ hay", dataKey: "series" },
    { id: "sectionAnime", listId: "animeList", icon: "🎌", title: "Anime", dataKey: "anime" },
    { id: "sectionCinema", listId: "cinemaList", icon: "🎬", title: "Phim chiếu rạp", dataKey: "cinema" },
];

// === Dữ liệu phim ===
const PHIM_DATA = {
    trending: [
        { id: 1, title: "Vùng Đất Linh Hồn", year: 2025, rating: 9.2, quality: "4K", genre: "Phiêu lưu", episode: null, gradient: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", emoji: "🏔️" },
        { id: 2, title: "Mật Mã Thời Gian", year: 2026, rating: 8.8, quality: "HD", genre: "Viễn tưởng", episode: null, gradient: "linear-gradient(135deg, #2d1b69, #11998e)", emoji: "⏳" },
        { id: 3, title: "Bóng Tối Cuối Cùng", year: 2025, rating: 9.0, quality: "4K", genre: "Kinh dị", episode: null, gradient: "linear-gradient(135deg, #4a0e0e, #c0392b)", emoji: "🌑" },
        { id: 4, title: "Thiên Đường Mất Tích", year: 2025, rating: 8.5, quality: "FHD", genre: "Tình cảm", episode: null, gradient: "linear-gradient(135deg, #0d7377, #14a085)", emoji: "🏝️" },
        { id: 5, title: "Chiến Binh Bóng Đêm", year: 2026, rating: 8.7, quality: "4K", genre: "Hành động", episode: null, gradient: "linear-gradient(135deg, #1e3c72, #2a5298)", emoji: "⚔️" },
        { id: 6, title: "Lời Thì Thầm Gió", year: 2025, rating: 8.3, quality: "HD", genre: "Tâm lý", episode: null, gradient: "linear-gradient(135deg, #4b6cb7, #182848)", emoji: "🍃" },
        { id: 7, title: "Vương Quốc Phép Thuật", year: 2026, rating: 9.1, quality: "4K", genre: "Giả tưởng", episode: null, gradient: "linear-gradient(135deg, #6a3093, #a044ff)", emoji: "🏰" },
        { id: 8, title: "Sóng Ngầm", year: 2025, rating: 8.6, quality: "FHD", genre: "Hình sự", episode: null, gradient: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", emoji: "🌊" },
        { id: 9, title: "Ngôi Sao Lạc Lối", year: 2026, rating: 8.9, quality: "HD", genre: "Hài hước", episode: null, gradient: "linear-gradient(135deg, #f5af19, #f12711)", emoji: "⭐" },
        { id: 10, title: "Hành Trình Vô Tận", year: 2025, rating: 8.4, quality: "4K", genre: "Phiêu lưu", episode: null, gradient: "linear-gradient(135deg, #ad5389, #3c1053)", emoji: "🚀" },
    ],
    newMovies: [
        { id: 11, title: "Bí Mật Đại Dương", year: 2026, rating: 8.1, quality: "FHD", genre: "Khoa học", episode: null, gradient: "linear-gradient(135deg, #0052d4, #4364f7, #6fb1fc)", emoji: "🐋" },
        { id: 12, title: "Mặt Trăng Đỏ", year: 2026, rating: 8.9, quality: "4K", genre: "Viễn tưởng", episode: null, gradient: "linear-gradient(135deg, #c31432, #240b36)", emoji: "🌕" },
        { id: 13, title: "Đường Đua Tử Thần", year: 2026, rating: 7.8, quality: "HD", genre: "Hành động", episode: null, gradient: "linear-gradient(135deg, #403a3e, #be5869)", emoji: "🏎️" },
        { id: 14, title: "Giấc Mơ Nửa Đêm", year: 2026, rating: 8.5, quality: "FHD", genre: "Tâm lý", episode: null, gradient: "linear-gradient(135deg, #232526, #414345)", emoji: "🌃" },
        { id: 15, title: "Kẻ Săn Bóng Tối", year: 2026, rating: 8.2, quality: "4K", genre: "Kinh dị", episode: null, gradient: "linear-gradient(135deg, #200122, #6f0000)", emoji: "🦇" },
        { id: 16, title: "Tình Yêu Vượt Thời Gian", year: 2026, rating: 8.7, quality: "HD", genre: "Tình cảm", episode: null, gradient: "linear-gradient(135deg, #ee9ca7, #ffdde1)", emoji: "💕" },
        { id: 17, title: "Gió Mùa Đông Bắc", year: 2026, rating: 8.0, quality: "FHD", genre: "Việt Nam", episode: null, gradient: "linear-gradient(135deg, #3a7bd5, #00d2ff)", emoji: "🌬️" },
        { id: 18, title: "Đế Chế Ngầm", year: 2026, rating: 8.6, quality: "4K", genre: "Hình sự", episode: null, gradient: "linear-gradient(135deg, #141e30, #243b55)", emoji: "🏙️" },
        { id: 19, title: "Nữ Thần Chiến Tranh", year: 2026, rating: 9.0, quality: "HD", genre: "Hành động", episode: null, gradient: "linear-gradient(135deg, #b24592, #f15f79)", emoji: "🛡️" },
        { id: 20, title: "Cánh Rừng Bí Ẩn", year: 2026, rating: 8.3, quality: "FHD", genre: "Phiêu lưu", episode: null, gradient: "linear-gradient(135deg, #134e5e, #71b280)", emoji: "🌲" },
    ],
    series: [
        { id: 21, title: "Huyền Thoại Biển Xanh", year: 2025, rating: 9.3, quality: "FHD", genre: "Tình cảm", episode: "Tập 16/20", gradient: "linear-gradient(135deg, #396afc, #2948ff)", emoji: "🧜‍♀️" },
        { id: 22, title: "Trò Chơi Sinh Tồn", year: 2026, rating: 9.1, quality: "4K", genre: "Kịch tính", episode: "Tập 8/12", gradient: "linear-gradient(135deg, #f83600, #f9d423)", emoji: "🎲" },
        { id: 23, title: "Gia Tộc Quyền Lực", year: 2025, rating: 8.8, quality: "HD", genre: "Hình sự", episode: "Tập 24/30", gradient: "linear-gradient(135deg, #373b44, #4286f4)", emoji: "👑" },
        { id: 24, title: "Học Đường Kỳ Bí", year: 2026, rating: 8.5, quality: "FHD", genre: "Kinh dị", episode: "Tập 6/10", gradient: "linear-gradient(135deg, #000428, #004e92)", emoji: "🏫" },
        { id: 25, title: "Bác Sĩ Thiên Tài", year: 2025, rating: 9.0, quality: "HD", genre: "Y khoa", episode: "Tập 20/24", gradient: "linear-gradient(135deg, #0f9b8e, #26d0ce)", emoji: "🩺" },
        { id: 26, title: "Cung Đấu Huyền Bí", year: 2026, rating: 8.9, quality: "4K", genre: "Cổ trang", episode: "Tập 32/48", gradient: "linear-gradient(135deg, #c94b4b, #4b134f)", emoji: "🏯" },
        { id: 27, title: "Thám Tử Lừng Danh", year: 2025, rating: 9.2, quality: "FHD", genre: "Trinh thám", episode: "Tập 10/16", gradient: "linear-gradient(135deg, #544a7d, #ffd452)", emoji: "🔍" },
        { id: 28, title: "Pháp Sư Tối Thượng", year: 2026, rating: 8.7, quality: "HD", genre: "Giả tưởng", episode: "Tập 14/20", gradient: "linear-gradient(135deg, #7303c0, #ec38bc)", emoji: "🧙" },
        { id: 29, title: "Vệ Sĩ Thành Phố", year: 2025, rating: 8.4, quality: "FHD", genre: "Hành động", episode: "Tập 18/22", gradient: "linear-gradient(135deg, #434343, #000000)", emoji: "🕶️" },
        { id: 30, title: "Mùa Hè Rực Rỡ", year: 2026, rating: 8.6, quality: "HD", genre: "Tình cảm", episode: "Tập 4/12", gradient: "linear-gradient(135deg, #ff9966, #ff5e62)", emoji: "☀️" },
    ],
    anime: [
        { id: 31, title: "Thanh Gươm Diệt Quỷ", year: 2025, rating: 9.5, quality: "4K", genre: "Hành động", episode: "Tập 26/26", gradient: "linear-gradient(135deg, #c31432, #240b36)", emoji: "⚔️" },
        { id: 32, title: "Thợ Săn x Thợ Săn", year: 2026, rating: 9.3, quality: "HD", genre: "Phiêu lưu", episode: "Tập 148/??", gradient: "linear-gradient(135deg, #11998e, #38ef7d)", emoji: "🏹" },
        { id: 33, title: "Đại Chiến Titan", year: 2025, rating: 9.4, quality: "FHD", genre: "Hành động", episode: "Hoàn tất", gradient: "linear-gradient(135deg, #2c3e50, #3498db)", emoji: "🗡️" },
        { id: 34, title: "One Piece", year: 2026, rating: 9.6, quality: "4K", genre: "Phiêu lưu", episode: "Tập 1120/??", gradient: "linear-gradient(135deg, #1c92d2, #f2fcfe)", emoji: "🏴‍☠️" },
        { id: 35, title: "Jujutsu Kaisen", year: 2025, rating: 9.2, quality: "FHD", genre: "Hành động", episode: "Tập 48/??", gradient: "linear-gradient(135deg, #0f0c29, #302b63)", emoji: "👁️" },
        { id: 36, title: "Spy x Family", year: 2026, rating: 9.0, quality: "HD", genre: "Hài hước", episode: "Tập 37/??", gradient: "linear-gradient(135deg, #ee9ca7, #ffdde1)", emoji: "🕵️" },
        { id: 37, title: "Dragon Ball Super", year: 2026, rating: 8.9, quality: "4K", genre: "Hành động", episode: "Tập 24/??", gradient: "linear-gradient(135deg, #f83600, #f9d423)", emoji: "🐉" },
        { id: 38, title: "My Hero Academia", year: 2026, rating: 8.8, quality: "HD", genre: "Hành động", episode: "Tập 156/??", gradient: "linear-gradient(135deg, #2193b0, #6dd5ed)", emoji: "💪" },
    ],
    cinema: [
        { id: 41, title: "Avatar: Huyền Thoại", year: 2026, rating: 9.0, quality: "4K", genre: "Viễn tưởng", episode: null, gradient: "linear-gradient(135deg, #005c97, #363795)", emoji: "🌍" },
        { id: 42, title: "Fast & Furious X", year: 2026, rating: 8.2, quality: "4K", genre: "Hành động", episode: null, gradient: "linear-gradient(135deg, #eb3349, #f45c43)", emoji: "🚗" },
        { id: 43, title: "Người Nhện: Đa Vũ Trụ", year: 2026, rating: 9.2, quality: "4K", genre: "Siêu anh hùng", episode: null, gradient: "linear-gradient(135deg, #c0392b, #1c2833)", emoji: "🕷️" },
        { id: 44, title: "Frozen III", year: 2026, rating: 8.8, quality: "4K", genre: "Hoạt hình", episode: null, gradient: "linear-gradient(135deg, #74ebd5, #acb6e5)", emoji: "❄️" },
        { id: 45, title: "Mission Impossible 9", year: 2026, rating: 8.9, quality: "4K", genre: "Hành động", episode: null, gradient: "linear-gradient(135deg, #373b44, #4286f4)", emoji: "💣" },
        { id: 46, title: "The Batman: Shadows", year: 2026, rating: 9.1, quality: "4K", genre: "Hành động", episode: null, gradient: "linear-gradient(135deg, #000000, #1a1a2e)", emoji: "🦇" },
        { id: 47, title: "Kung Fu Panda 5", year: 2026, rating: 8.7, quality: "4K", genre: "Hoạt hình", episode: null, gradient: "linear-gradient(135deg, #f7971e, #ffd200)", emoji: "🐼" },
        { id: 48, title: "Star Wars: New Dawn", year: 2026, rating: 8.6, quality: "4K", genre: "Viễn tưởng", episode: null, gradient: "linear-gradient(135deg, #0f0c29, #302b63)", emoji: "🌟" },
    ]
};


// ============================================================
//  DỮ LIỆU QTRUYỆN
// ============================================================

// === Hero Slides - Truyện ===
const TRUYEN_HERO_SLIDES = [
    {
        badge: "🔥 Hot", title: "Solo Leveling",
        rating: 9.5, year: 2025, duration: "380 chương", quality: "Full",
        desc: "Sung Jin-Woo, thợ săn yếu nhất thế giới, nhận được sức mạnh bí ẩn cho phép anh tăng cấp không giới hạn. Từ rank E, anh vươn lên trở thành thợ săn mạnh nhất nhân loại.",
        genres: ["Hành động", "Giả tưởng", "Manhwa"],
        gradient: "linear-gradient(135deg, #1a0533 0%, #4a1a8a 50%, #7c3aed 100%)",
        btnPrimary: "Đọc ngay", btnPrimaryIcon: "book"
    },
    {
        badge: "📖 Mới cập nhật", title: "Thanh Gươm Diệt Quỷ",
        rating: 9.3, year: 2026, duration: "205 chương", quality: "Full màu",
        desc: "Tanjiro Kamado quyết tâm tìm cách chữa trị cho em gái đã biến thành quỷ, đồng thời trở thành một kiếm sĩ diệt quỷ tài ba nhất thời đại.",
        genres: ["Hành động", "Siêu nhiên", "Manga"],
        gradient: "linear-gradient(135deg, #1c1c1c 0%, #8b0000 100%)",
        btnPrimary: "Đọc ngay", btnPrimaryIcon: "book"
    },
    {
        badge: "💎 Đề cử", title: "Tower of God",
        rating: 9.1, year: 2025, duration: "590+ chương", quality: "Đang ra",
        desc: "Baam bước vào Tháp Thần bí ẩn để tìm lại người bạn duy nhất. Tại đây, anh phải vượt qua những thử thách chết người để leo lên đỉnh tháp.",
        genres: ["Phiêu lưu", "Giả tưởng", "Manhwa"],
        gradient: "linear-gradient(135deg, #0c0c1d 0%, #1a3a5c 50%, #2980b9 100%)",
        btnPrimary: "Đọc ngay", btnPrimaryIcon: "book"
    }
];

// === Sections - Truyện ===
const TRUYEN_SECTIONS = [
    { id: "sectionHot", listId: "hotList", icon: "🔥", title: "Truyện hot", dataKey: "hot" },
    { id: "sectionUpdated", listId: "updatedList", icon: "🆕", title: "Mới cập nhật", dataKey: "updated" },
    { id: "sectionManga", listId: "mangaList", icon: "🇯🇵", title: "Manga", dataKey: "manga" },
    { id: "sectionManhwa", listId: "manhwaList", icon: "🇰🇷", title: "Manhwa", dataKey: "manhwa" },
    { id: "sectionManhua", listId: "manhuaList", icon: "🇨🇳", title: "Manhua", dataKey: "manhua" },
];

// === Dữ liệu truyện ===
const TRUYEN_DATA = {
    hot: [
        { id: 101, title: "Solo Leveling", year: 2025, rating: 9.5, quality: "Full", genre: "Hành động", episode: "380 chương", gradient: "linear-gradient(135deg, #4a1a8a, #7c3aed)", emoji: "⚔️" },
        { id: 102, title: "One Piece", year: 2026, rating: 9.8, quality: "Đang ra", genre: "Phiêu lưu", episode: "Ch. 1120", gradient: "linear-gradient(135deg, #1c92d2, #f2fcfe)", emoji: "🏴‍☠️" },
        { id: 103, title: "Jujutsu Kaisen", year: 2025, rating: 9.2, quality: "Full", genre: "Siêu nhiên", episode: "271 chương", gradient: "linear-gradient(135deg, #0f0c29, #302b63)", emoji: "👁️" },
        { id: 104, title: "Chainsaw Man", year: 2026, rating: 9.0, quality: "Đang ra", genre: "Hành động", episode: "Ch. 185", gradient: "linear-gradient(135deg, #c0392b, #e74c3c)", emoji: "🪚" },
        { id: 105, title: "Lookism", year: 2026, rating: 8.8, quality: "Đang ra", genre: "Hành động", episode: "Ch. 500", gradient: "linear-gradient(135deg, #2d1b69, #11998e)", emoji: "👊" },
        { id: 106, title: "Blue Lock", year: 2026, rating: 9.1, quality: "Đang ra", genre: "Thể thao", episode: "Ch. 280", gradient: "linear-gradient(135deg, #1e3c72, #2a5298)", emoji: "⚽" },
        { id: 107, title: "Spy x Family", year: 2026, rating: 9.0, quality: "Đang ra", genre: "Hài hước", episode: "Ch. 105", gradient: "linear-gradient(135deg, #ee9ca7, #ffdde1)", emoji: "🕵️" },
        { id: 108, title: "Omniscient Reader", year: 2025, rating: 9.4, quality: "Full", genre: "Giả tưởng", episode: "551 chương", gradient: "linear-gradient(135deg, #134e5e, #71b280)", emoji: "📖" },
    ],
    updated: [
        { id: 111, title: "Martial Peak", year: 2026, rating: 8.5, quality: "Đang ra", genre: "Tiên hiệp", episode: "Ch. 3800", gradient: "linear-gradient(135deg, #f83600, #f9d423)", emoji: "🏔️" },
        { id: 112, title: "Return of Mount Hua", year: 2026, rating: 9.2, quality: "Đang ra", genre: "Võ thuật", episode: "Ch. 185", gradient: "linear-gradient(135deg, #373b44, #4286f4)", emoji: "🗡️" },
        { id: 113, title: "Sousou no Frieren", year: 2026, rating: 9.3, quality: "Đang ra", genre: "Phiêu lưu", episode: "Ch. 136", gradient: "linear-gradient(135deg, #74ebd5, #acb6e5)", emoji: "🧝" },
        { id: 114, title: "Sakamoto Days", year: 2026, rating: 8.9, quality: "Đang ra", genre: "Hành động", episode: "Ch. 190", gradient: "linear-gradient(135deg, #232526, #414345)", emoji: "🔫" },
        { id: 115, title: "Dandadan", year: 2026, rating: 8.7, quality: "Đang ra", genre: "Siêu nhiên", episode: "Ch. 178", gradient: "linear-gradient(135deg, #ad5389, #3c1053)", emoji: "👽" },
        { id: 116, title: "Eleceed", year: 2026, rating: 8.8, quality: "Đang ra", genre: "Hành động", episode: "Ch. 310", gradient: "linear-gradient(135deg, #0052d4, #6fb1fc)", emoji: "⚡" },
        { id: 117, title: "Kaiju No. 8", year: 2026, rating: 8.6, quality: "Đang ra", genre: "Hành động", episode: "Ch. 115", gradient: "linear-gradient(135deg, #0f2027, #2c5364)", emoji: "🦎" },
        { id: 118, title: "Wind Breaker", year: 2026, rating: 8.5, quality: "Đang ra", genre: "Hành động", episode: "Ch. 510", gradient: "linear-gradient(135deg, #3a7bd5, #00d2ff)", emoji: "🚴" },
    ],
    manga: [
        { id: 121, title: "Thanh Gươm Diệt Quỷ", year: 2025, rating: 9.3, quality: "Full", genre: "Hành động", episode: "205 chương", gradient: "linear-gradient(135deg, #8b0000, #1c1c1c)", emoji: "⚔️" },
        { id: 122, title: "Tokyo Revengers", year: 2025, rating: 8.8, quality: "Full", genre: "Hành động", episode: "278 chương", gradient: "linear-gradient(135deg, #000000, #434343)", emoji: "🏍️" },
        { id: 123, title: "Naruto", year: 2025, rating: 9.5, quality: "Full", genre: "Hành động", episode: "700 chương", gradient: "linear-gradient(135deg, #f46b45, #eea849)", emoji: "🍥" },
        { id: 124, title: "Dragon Ball", year: 2025, rating: 9.4, quality: "Full", genre: "Hành động", episode: "520 chương", gradient: "linear-gradient(135deg, #f83600, #f9d423)", emoji: "🐉" },
        { id: 125, title: "Attack on Titan", year: 2025, rating: 9.6, quality: "Full", genre: "Hành động", episode: "139 chương", gradient: "linear-gradient(135deg, #2c3e50, #3498db)", emoji: "🗡️" },
        { id: 126, title: "Death Note", year: 2025, rating: 9.3, quality: "Full", genre: "Tâm lý", episode: "108 chương", gradient: "linear-gradient(135deg, #141e30, #243b55)", emoji: "📓" },
        { id: 127, title: "Fullmetal Alchemist", year: 2025, rating: 9.5, quality: "Full", genre: "Phiêu lưu", episode: "116 chương", gradient: "linear-gradient(135deg, #b24592, #f15f79)", emoji: "⚗️" },
        { id: 128, title: "Vinland Saga", year: 2026, rating: 9.2, quality: "Full", genre: "Lịch sử", episode: "210 chương", gradient: "linear-gradient(135deg, #396afc, #2948ff)", emoji: "🛡️" },
    ],
    manhwa: [
        { id: 131, title: "Tower of God", year: 2025, rating: 9.1, quality: "Đang ra", genre: "Giả tưởng", episode: "Ch. 590", gradient: "linear-gradient(135deg, #1a3a5c, #2980b9)", emoji: "🗼" },
        { id: 132, title: "The Beginning After End", year: 2026, rating: 9.3, quality: "Đang ra", genre: "Giả tưởng", episode: "Ch. 210", gradient: "linear-gradient(135deg, #6a3093, #a044ff)", emoji: "👑" },
        { id: 133, title: "Noblesse", year: 2025, rating: 8.9, quality: "Full", genre: "Hành động", episode: "544 chương", gradient: "linear-gradient(135deg, #c31432, #240b36)", emoji: "🧛" },
        { id: 134, title: "God of High School", year: 2025, rating: 8.7, quality: "Đang ra", genre: "Võ thuật", episode: "Ch. 580", gradient: "linear-gradient(135deg, #0d7377, #14a085)", emoji: "🥊" },
        { id: 135, title: "Weak Hero", year: 2026, rating: 9.0, quality: "Đang ra", genre: "Hành động", episode: "Ch. 280", gradient: "linear-gradient(135deg, #434343, #000000)", emoji: "🎭" },
        { id: 136, title: "Nano Machine", year: 2026, rating: 8.8, quality: "Đang ra", genre: "Võ thuật", episode: "Ch. 200", gradient: "linear-gradient(135deg, #005c97, #363795)", emoji: "🤖" },
        { id: 137, title: "Tomb Raider King", year: 2025, rating: 8.6, quality: "Full", genre: "Hành động", episode: "406 chương", gradient: "linear-gradient(135deg, #544a7d, #ffd452)", emoji: "💎" },
        { id: 138, title: "Mercenary Enrollment", year: 2026, rating: 8.5, quality: "Đang ra", genre: "Hành động", episode: "Ch. 180", gradient: "linear-gradient(135deg, #4b6cb7, #182848)", emoji: "🎖️" },
    ],
    manhua: [
        { id: 141, title: "Martial Peak", year: 2026, rating: 8.5, quality: "Đang ra", genre: "Tiên hiệp", episode: "Ch. 3800", gradient: "linear-gradient(135deg, #f83600, #f9d423)", emoji: "🏔️" },
        { id: 142, title: "Tales of Demons & Gods", year: 2026, rating: 8.7, quality: "Đang ra", genre: "Tiên hiệp", episode: "Ch. 450", gradient: "linear-gradient(135deg, #7303c0, #ec38bc)", emoji: "🐲" },
        { id: 143, title: "Battle Through Heavens", year: 2026, rating: 8.8, quality: "Đang ra", genre: "Hành động", episode: "Ch. 400", gradient: "linear-gradient(135deg, #eb3349, #f45c43)", emoji: "🔥" },
        { id: 144, title: "Soul Land", year: 2026, rating: 8.6, quality: "Đang ra", genre: "Tiên hiệp", episode: "Ch. 350", gradient: "linear-gradient(135deg, #0f9b8e, #26d0ce)", emoji: "💫" },
        { id: 145, title: "Apotheosis", year: 2026, rating: 8.3, quality: "Đang ra", genre: "Tiên hiệp", episode: "Ch. 900", gradient: "linear-gradient(135deg, #c94b4b, #4b134f)", emoji: "🌟" },
        { id: 146, title: "The Great Ruler", year: 2025, rating: 8.4, quality: "Full", genre: "Hành động", episode: "452 chương", gradient: "linear-gradient(135deg, #200122, #6f0000)", emoji: "⚡" },
        { id: 147, title: "Spirit Sword Sovereign", year: 2026, rating: 8.2, quality: "Đang ra", genre: "Tiên hiệp", episode: "Ch. 600", gradient: "linear-gradient(135deg, #1e3c72, #2a5298)", emoji: "🗡️" },
        { id: 148, title: "Versatile Mage", year: 2026, rating: 8.5, quality: "Đang ra", genre: "Giả tưởng", episode: "Ch. 500", gradient: "linear-gradient(135deg, #403a3e, #be5869)", emoji: "🧙" },
    ]
};
