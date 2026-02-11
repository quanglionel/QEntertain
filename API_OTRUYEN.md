# 📚 OTruyen API Documentation & Testing Guide

Tài liệu này liệt kê các API của OTruyen (Truyện Tranh) được sử dụng trong dự án qua Reverse Proxy.

**Base Domain (Local):** `http://localhost:8080`

---

## 1. 🏠 Trang Chủ (Danh sách mới)
Lấy danh sách truyện mới cập nhật.

- **Proxy URL:** `/api/truyen/home`
- **Gốc:** `https://otruyenapi.com/v1/api/home`
- **Cách test:**
  - Mở trình duyệt: [http://localhost:8080/api/truyen/home](http://localhost:8080/api/truyen/home)
  - Hoặc cURL:
    ```bash
    curl http://localhost:8080/api/truyen/home
    ```

---

## 2. 📑 Danh Sách (Theo loại)
Lấy danh sách truyện theo bộ lọc (mới, sắp có, hoàn thành).

- **Proxy URL:** `/api/truyen/danh-sach/{slug}`
  - `truyen-moi`: Truyện mới
  - `hoan-thanh`: Truyện đã full
- **Gốc:** `https://otruyenapi.com/v1/api/danh-sach/truyen-moi`
- **Cách test:**
  - [http://localhost:8080/api/truyen/danh-sach/truyen-moi](http://localhost:8080/api/truyen/danh-sach/truyen-moi)

---

## 3. 🔍 Tìm Kiếm
Tìm truyện theo từ khóa.

- **Proxy URL:** `/api/truyen/tim-kiem?keyword={tu-khoa}`
- **Gốc:** `https://otruyenapi.com/v1/api/tim-kiem?...`
- **Cách test:**
  - [http://localhost:8080/api/truyen/tim-kiem?keyword=dragon](http://localhost:8080/api/truyen/tim-kiem?keyword=dragon)

---

## 4. 📖 Chi Tiết Truyện
Lấy thông tin truyện và danh sách chương.

- **Proxy URL:** `/api/truyen/truyen-tranh/{slug}`
- **Ví dụ Slug:** `one-piece`, `dao-hai-tac`, `naruto`
- **Gốc:** `https://otruyenapi.com/v1/api/truyen-tranh/{slug}`
- **Cách test:**
  - [http://localhost:8080/api/truyen/truyen-tranh/one-piece](http://localhost:8080/api/truyen/truyen-tranh/one-piece)
  - **Dữ liệu quan trọng:** Kiểm tra trường `item.chapters`.

---

## 5. 🖼️ API Chapter (Lấy ảnh) - QUAN TRỌNG
Lấy danh sách link ảnh của một chương cụ thể. API này nằm ở CDN khác (`sv1.otruyencdn.com`) nên cần qua Proxy đặc biệt.

- **Proxy URL:** `/api/truyen-chapter/v1/api/chapter/{id}`
- **Lấy ID ở đâu?** Từ API Chi Tiết Truyện (mục 4), trong mảng `chapters` -> `server_data` -> `chapter_api_data`.
- **Ví dụ full URL gốc:** `https://sv1.otruyencdn.com/v1/api/chapter/649c69...`
- **Cách test:**
  1. Lấy một link `chapter_api_data` từ mục 4.
  2. Thay `https://sv1.otruyencdn.com` bằng `http://localhost:8080/api/truyen-chapter`.
  3. Truy cập thử trên trình duyệt.

  **URL Test Mẫu (Nếu chưa đổi ID):**
  - [http://localhost:8080/api/truyen-chapter/v1/api/chapter/65901d64ac52820f564b3741](http://localhost:8080/api/truyen-chapter/v1/api/chapter/67ab815d2a890a0720516fc9) 
  *(Lưu ý: ID này có thể hết hạn hoặc sai, bạn nên lấy ID thật từ mục 4).*

---

## 6. 🖼️ Proxy Ảnh (Bìa & Nội dung)
Load ảnh bìa hoặc ảnh nội dung truyện.

- **Proxy URL:** `/img/truyen/{filename}`
- **Gốc:** `https://img.otruyenapi.com/uploads/comics/{filename}`
- **Cách test:**
  - Lấy `thumb_url` từ mục 1 hoặc 4.
  - Truy cập: `http://localhost:8080/img/truyen/{thumb_url}`
  - Ví dụ: [http://localhost:8080/img/truyen/dao-hai-tac-thumb.jpg](http://localhost:8080/img/truyen/one-piece.jpg)

---

### 🛠️ Ghi chú Debug
- Nếu gặp lỗi **404**, kiểm tra lại URL endpoint.
- Nếu gặp lỗi **500/502**, kiểm tra Docker Log (`docker logs qphim`).
- Nếu ảnh không hiện, thử mở trực tiếp Link Ảnh Proxy xem có ra hình không.
