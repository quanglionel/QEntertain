/* ============================================
   Bảo vệ mã nguồn (Cơ bản)
   Chặn chuột phải, F12, Ctrl+U để hạn chế xem source
   ============================================ */

// Config enable/disable protection
window.appConfig = { protect: false };

// 1. Chặn chuột phải (Context Menu)
document.addEventListener('contextmenu', function (e) {
    if (!window.appConfig.protect) return;
    e.preventDefault();
}, false);

// 2. Chặn các phím tắt Developer Tools
document.addEventListener('keydown', function (e) {
    if (!window.appConfig.protect) return;

    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+I (Open DevTools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.keyCode === 73)) {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+J (Open Console)
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.keyCode === 74)) {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+C (Element Inspector)
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.keyCode === 67)) {
        e.preventDefault();
        return false;
    }

    // Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
    }

    // Ctrl+S (Save Page)
    if (e.ctrlKey && (e.key === 'S' || e.keyCode === 83)) {
        e.preventDefault();
        return false;
    }
});

// 3. Cảnh báo trong Console (nếu họ vẫn mở được)
console.log("%cDừng lại!", "color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0 #000;");
console.log("%cĐây là tính năng dành cho nhà phát triển. Việc sao chép/dán bất kỳ nội dung nào vào đây có thể làm lộ thông tin của bạn.", "font-size: 18px; color: #fff; background: #333; padding: 10px; border-radius: 5px;");
