# 🎬 OPhim API Documentation & Testing Guide

Tài liệu này liệt kê các API của OPhim (Phim Ảnh) được sử dụng trong dự án qua Reverse Proxy.

**Base Domain (Local):** `http://localhost:8080`

---

## 1. 🏠 Trang Chủ (Danh sách mới)
Lấy danh sách phim mới cập nhật.

- **Proxy URL:** `/api/phim/danh-sach/phim-moi-cap-nhat`
- **Gốc:** `https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat`
- **Cách test:**
  - Mở trình duyệt: [http://localhost:8080/api/phim/danh-sach/phim-moi-cap-nhat](http://localhost:8080/api/phim/danh-sach/phim-moi-cap-nhat)
  - Hoặc cURL:
    ```bash
    curl http://localhost:8080/api/phim/danh-sach/phim-moi-cap-nhat
    ```

---

## 2. 📑 Danh Sách (Theo loại)
Lấy danh sách phim theo bộ lọc (phim lẻ, phim bộ, hoạt hình...).

- **Proxy URL:** `/api/phim/danh-sach/{slug}`
  - `phim-le`: Phim lẻ
  - `phim-bo`: Phim bộ
  - `hoat-hinh`: Anime/Hoạt hình
  - `tv-shows`: TV Shows
- **Gốc:** `https://ophim1.com/v1/api/danh-sach/phim-le`
- **Cách test:**
  - [http://localhost:8080/api/phim/danh-sach/phim-le](http://localhost:8080/api/phim/danh-sach/phim-le)

---

## 3. 🔍 Tìm Kiếm
Tìm phim theo từ khóa.

- **Proxy URL:** `/api/phim/tim-kiem?keyword={tu-khoa}`
- **Gốc:** `https://ophim1.com/v1/api/tim-kiem?...`
- **Cách test:**
  - [http://localhost:8080/api/phim/tim-kiem?keyword=iron](http://localhost:8080/api/phim/tim-kiem?keyword=iron)

---

## 4. 🎞️ Chi Tiết Phim
Lấy thông tin phim và danh sách tập.

- **Proxy URL:** `/api/phim/phim/{slug}`
- **Ví dụ Slug:** `mai`, `dao-pho-va-piano`, `dune-2`
- **Gốc:** `https://ophim1.com/v1/api/phim/{slug}`
- **Cách test:**
  - [http://localhost:8080/api/phim/phim/mai](http://localhost:8080/api/phim/phim/mai)
  - **Dữ liệu quan trọng:** Kiểm tra trường `episodes`.
    - `server_data` chứa danh sách tập.
    - `link_m3u8`: Link stream HLS.
    - `link_embed`: Link iframe dự phòng.

---

## 5. 📺 Link Stream (M3U8)
OPhim trả về trực tiếp link `m3u8` trong API chi tiết. Player sẽ sử dụng link này để phát (qua HLS.js).

- **Ví dụ link:** `https://s1.phim123.xyz/hls/mai/index.m3u8` (link này thường thay đổi).
- **Lưu ý:** Link m3u8 thường hỗ trợ CORS, có thể phát trực tiếp mà không cần Proxy đặc biệt, miễn là trang web có Referrer Policy phù hợp (`no-referrer` hoặc allow-list).

---

## 6. 🖼️ Proxy Ảnh (Poster & Thumbnail)
Load ảnh bìa hoặc poster phim.

- **Proxy URL:** `/img/phim/{filename}`
- **Gốc:** `https://img.ophim.live/uploads/movies/{filename}`
- **Cách test:**
  - Lấy `thumb_url` hoặc `poster_url` từ mục 1 hoặc 4.
  - Truy cập: `http://localhost:8080/img/phim/{thumb_url}`
  - Ví dụ: [http://localhost:8080/img/phim/mai-thumb.jpg](http://localhost:8080/img/phim/mai-thumb.jpg) (Check API để lấy tên file chính xác).

---

## 7. 🌍 Quốc Gia & Thể Loại
Lấy danh sách bổ trợ.

- **Thể loại:** [http://localhost:8080/api/phim/the-loai](http://localhost:8080/api/phim/the-loai)
- **Quốc gia:** [http://localhost:8080/api/phim/quoc-gia](http://localhost:8080/api/phim/quoc-gia)

---

### 🛠️ Ghi chú Debug
- Nếu gặp lỗi **404**, kiểm tra lại URL endpoint.
- Nếu gặp lỗi **500/502**, kiểm tra Docker Log (`docker logs qphim`).
- Nếu Player báo lỗi `Network Error` hoặc `Manifest Load Error`:
  - Kiểm tra tab Network xem request m3u8 có bị 403 Forbidden không.
  - Đảm bảo `index.html` có thẻ `<meta name="referrer" content="no-referrer">`.
