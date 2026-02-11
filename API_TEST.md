# 🧪 API Documentation & Testing Guide

Tài liệu này hướng dẫn cách kiểm tra (test) các API Endpoint của dự án **QPhim & QTruyện**.
Hệ thống sử dụng **Reverse Proxy** để bypass CORS.

---

## 🌐 Base URL

| Môi trường | Base URL | Ghi chú |
|------------|----------|---------|
| **Local (Docker)** | `http://localhost:8080/api` | Chạy qua Nginx |
| **Online (Cloudflare)** | `https://qentertain.pages.dev/api` | Chạy qua Worker |

---

## 🎬 1. OPhim API (Phim)

Prefix: `/phim` (Map tới `https://ophim1.com/v1/api`)

### 1.1. Trang chủ (Phim mới cập nhật)
- **Endpoint:** `/phim/home`
- **Test URL (Local):** [http://localhost:8080/api/phim/home](http://localhost:8080/api/phim/home)
- **Method:** `GET`
- **Response mẫu:**
  ```json
  {
    "status": true,
    "items": [
      { "name": "Tên phim", "slug": "ten-phim", "thumb_url": "slug-thumb.jpg", ... }
    ],
    "pathImage": "https://img.ophim.live/uploads/movies/"
  }
  ```

### 1.2. Chi tiết phim
- **Endpoint:** `/phim/phim/{slug}`
- **Ví dụ:** `/phim/phim/cuu-long-thanh-trai-vay-thanh`
- **Test URL (Local):** [http://localhost:8080/api/phim/phim/cuu-long-thanh-trai-vay-thanh](http://localhost:8080/api/phim/phim/cuu-long-thanh-trai-vay-thanh)
- **Quan trọng:** Kiểm tra trường `movie` và `episodes`.
- **Response mẫu:**
  ```json
  {
    "status": true,
    "movie": { "name": "...", "content": "...", ... },
    "episodes": [
      { "server_name": "Vietsub #1", "server_data": [ { "link_m3u8": "..." } ] }
    ]
  }
  ```

### 1.3. Tìm kiếm phim
- **Endpoint:** `/phim/tim-kiem?keyword={từ-khóa}`
- **Test URL:** [http://localhost:8080/api/phim/tim-kiem?keyword=ma](http://localhost:8080/api/phim/tim-kiem?keyword=ma)

---

## 📚 2. OTruyen API (Truyện)

Prefix: `/truyen` (Map tới `https://otruyenapi.com/v1/api`)

### 2.1. Trang chủ (Truyện mới)
- **Endpoint:** `/truyen/home`
- **Test URL:** [http://localhost:8080/api/truyen/home](http://localhost:8080/api/truyen/home)
- **Response mẫu:**
  ```json
  {
    "status": "success",
    "data": {
      "items": [ ... ]
    }
  }
  ```

### 2.2. Chi tiết truyện
- **Endpoint:** `/truyen/truyen-tranh/{slug}`
- **Ví dụ:** `/truyen/truyen-tranh/one-piece`
- **Test URL:** [http://localhost:8080/api/truyen/truyen-tranh/one-piece](http://localhost:8080/api/truyen/truyen-tranh/one-piece)
- **Quan trọng:** Kiểm tra `item.chapters`.

### 2.3. Chi tiết chương (Ảnh)
- **Endpoint gốc:** URL trong `chapter_api_data` (thường là `https://sv1.otruyencdn.com/...`)
- **Lưu ý:** Client fetch trực tiếp URL này. Nếu lỗi CORS, cần dùng Proxy.

---

## 🖼️ 3. Image Proxy Test

Hệ thống proxy ảnh để tránh lỗi 403 từ server gốc.

### 3.1. Ảnh Phim
- **Format:** `/img/phim/{tên-ảnh}`
- **Test URL:** [http://localhost:8080/img/phim/hoat-hinh-thumb.jpg](http://localhost:8080/img/phim/hoat-hinh-thumb.jpg) (Thay bằng tên file thật lấy từ API Home)

### 3.2. Ảnh Truyện
- **Format:** `/img/truyen/{tên-ảnh}`
- **Test URL:** [http://localhost:8080/img/truyen/one-piece.jpg](http://localhost:8080/img/truyen/one-piece.jpg)

---

## 🛠️ Debugging

Nếu API trả về lỗi, hãy kiểm tra:

1. **HTTP 404:** URL sai hoặc API gốc thay đổi.
2. **HTTP 500/502/504:**
   - **Local:** Do Nginx không kết nối được OPhim/OTruyen (Lỗi SSL/DNS). Check `docker logs qphim`.
   - **Online:** Do Cloudflare Worker lỗi code hoặc bị chặn.
3. **CORS Error:**
   - Kiểm tra Header response có `Access-Control-Allow-Origin: *` không.
   - F12 Network tab -> Check request headers.

### Lệnh test nhanh bằng cURL (Terminal)

```powershell
# Test Phim Home
curl -I http://localhost:8080/api/phim/home

# Test Phim Detail
curl http://localhost:8080/api/phim/phim/cuu-long-thanh-trai-vay-thanh
```
