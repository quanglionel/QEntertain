# 🎬📚 QPhim & QTruyện

Nền tảng giải trí trực tuyến - Xem phim & Đọc truyện miễn phí.

## 🚀 Chạy local (Docker)

```bash
docker-compose up -d --build
```

Mở trình duyệt: **http://localhost:8080**

## ☁️ Deploy online

### Cách 1: Railway (Khuyên dùng - Miễn phí)

1. Push code lên GitHub
2. Vào [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Railway tự detect Dockerfile và deploy
4. Thêm biến môi trường `PORT=80` (nếu cần)

### Cách 2: Render

1. Push code lên GitHub
2. Vào [render.com](https://render.com) → New Web Service
3. Chọn repo, Runtime: **Docker**
4. Deploy tự động

### Cách 3: VPS (DigitalOcean, Vultr, AWS...)

```bash
# SSH vào server
git clone <repo-url> qphim
cd qphim
docker-compose up -d --build
```

Cấu hình domain với Nginx reverse proxy hoặc Cloudflare Tunnel.

## 📁 Cấu trúc

```
QPhim/
├── index.html          # Trang chính (khung sườn)
├── Dockerfile          # Build image
├── docker-compose.yml  # Chạy container
├── nginx.conf          # Nginx: static + API proxy
├── css/                # 7 file CSS
│   ├── variables.css   # Biến theme Dark/Light
│   ├── base.css        # Reset, font
│   ├── header.css      # Header, mode switcher
│   ├── hero.css        # Hero banner
│   ├── movies.css      # Movie/manga cards
│   ├── footer.css      # Footer
│   └── responsive.css  # Responsive breakpoints
└── js/                 # 8 file JS
    ├── data.js         # Dữ liệu mẫu + config
    ├── api.js          # API service (OPhim + OTruyen)
    ├── components.js   # Render UI components
    ├── slider.js       # Hero slider
    ├── theme.js        # Dark/Light toggle
    ├── search.js       # Tìm kiếm
    ├── ui.js           # UI utilities
    └── app.js          # Khởi tạo app
```

## 🔌 API Sources

| Service | API | Dữ liệu |
|---------|-----|----------|
| OPhim   | `ophim1.com/v1/api` | Phim vietsub |
| OTruyen | `otruyenapi.com/v1/api` | Truyện tranh |

## ✨ Tính năng

- 🎬📚 Hai chế độ: QPhim (xem phim) & QTruyện (đọc truyện)
- 🌙☀️ Dark/Light theme
- 🖼️ Poster ảnh thật từ API
- 📱 Responsive (PC + Mobile)
- 🔍 Tìm kiếm
- 🐳 Docker ready
