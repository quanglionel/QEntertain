# Tài liệu API & Hướng dẫn Test (QPhim & QTruyện)

Bạn có thể sử dụng trực tiếp các lệnh dưới đây trong **Console** của trình duyệt (F12 > Console) để kiểm tra hoạt động của website.

## 1. Đối tượng toàn cục (Global Objects)
Các đối tượng sau có thể truy cập từ bất kỳ đâu:

| Tên | Mô tả | File |
|---|---|---|
| `window.API` | Module chứa tất cả hàm gọi API (Mô tả chi tiết bên dưới) | `js/api.js` |
| `window.Player` | Đối tượng quản lý trình phát video và đọc truyện | `js/player.js` |
| `window.playEp(url, ...)` | Hàm kích hoạt xem phim (chuyển sang Watch Page) | `js/play.js` |
| `window.readChap(url)` | Hàm kích hoạt đọc truyện (chuyển sang Reader Page) | `js/play.js` |
| `window.showDetail(slug)` | Hiển thị Popup chi tiết phim/truyện | `js/detail.js` |
| `window.renderAll()` | Hàm khởi tạo lại toàn bộ giao diện trang chủ | `js/components.js` |

---

## 2. API Phim (OPhim)

### Lấy dữ liệu trang chủ
```javascript
await API.getPhimHome();
```

### Lấy danh sách phim (Mới, Lẻ, Bộ, Hoạt hình...)
```javascript
// Các loại: 'phim-moi-cap-nhat', 'phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows', 'phim-vietsub', 'phim-thuyet-minh', 'phim-long-tieng', ...
await API.getPhimList('phim-moi-cap-nhat', 1); 
```

### Tìm kiếm phim
```javascript
await API.searchPhim('iron man', 1);
```

### Lấy chi tiết phim
```javascript
await API.getPhimDetail('iron-man-1'); // slug của phim
```

### Lấy danh sách thể loại & quốc gia
```javascript
await API.getPhimCategories();
await API.getPhimCountries();
```

---

## 3. API Truyện (OTruyen)

### Lấy dữ liệu trang chủ
```javascript
await API.getTruyenHome();
```

### Lấy danh sách truyện
```javascript
// Các loại: 'truyen-moi', 'sap-ra-mat', 'dang-phat-hanh', 'hoan-thanh'
await API.getTruyenList('truyen-moi', 1);
```

### Tìm kiếm truyện
```javascript
await API.searchTruyen('one piece', 1);
```

### Lấy chi tiết truyện
```javascript
await API.getTruyenDetail('one-piece'); // slug của truyện
```

### Lấy nội dung chương (Chapter)
```javascript
// apiUrl lấy từ dữ liệu chi tiết truyện (chapter_api_data)
await API.getTruyenChapter('https://sv1.otruyencdn.com/v1/api/chapter/...');
```

---

## 4. Ví dụ Test Nhanh (Copy & Paste vào Console)

### Test 1: Lấy thông tin phim "Mai" và hiển thị Popup
```javascript
// 1. Chuyển sang chế độ Phim
if(currentMode !== 'phim') switchMode('phim');

// 2. Gọi API chi tiết
API.getPhimDetail('mai').then(res => {
    console.log('Kết quả API:', res);
    if(res.status) {
        // 3. Hiển thị popup
        showDetail('mai'); 
    } else {
        console.error('Không tìm thấy phim');
    }
});
```

### Test 2: Phát video tập 1 của phim đang xem
```javascript
// Giả sử đang mở popup phim
if(window.currentDetailData && window.currentDetailData.episodes) {
    const ep = window.currentDetailData.episodes[0].server_data[0];
    console.log('Đang phát tập:', ep.name);
    // Gọi hàm play
    playEp(ep.link_m3u8, ep.name, window.currentDetailData.slug, window.currentDetailData.name, window.currentDetailData.thumb_url);
} else {
    console.log('Bạn cần mở chi tiết phim trước (dùng Test 1)');
}
```

### Test 3: Kiểm tra tính năng Lưu Lịch Sử
```javascript
// Lưu thử một item giả
saveHistory({
    slug: 'test-movie',
    name: 'Phim Test API',
    episode_name: '1',
    episode_url: 'http://sample.vodobox.net/skate_phantom_flex_4k/skate_phantom_flex_4k.m3u8',
    time: Date.now(),
    thumb_url: 'https://via.placeholder.com/200'
});

console.log('Lịch sử hiện tại:', getHistory('phim'));

// Reload lại trang để xem item này có hiện trong phần "Xem tiếp" không
// location.reload();
```
