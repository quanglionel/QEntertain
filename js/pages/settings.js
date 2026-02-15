/* ============================================
   QPhim & QTruyện - Settings Logic
   Quản lý cấu hình, giao diện cài đặt, Backup/Restore
   ============================================ */

const DEFAULT_SETTINGS = {
    autoNext: true,       // Tự động chuyển tập/chương
    smoothScroll: true,   // Cuộn mượt
    dataSaver: false,     // Tiết kiệm data (Load ảnh chất lượng thấp nếu có)
};

function getSettings() {
    return QStorage.get('qhub-settings', DEFAULT_SETTINGS);
}

function saveSettings(newSettings) {
    QStorage.save('qhub-settings', newSettings);
    applySettings(newSettings);
}

function applySettings(settings) {
    window.APP_SETTINGS = settings;
    document.documentElement.style.scrollBehavior = settings.smoothScroll ? 'smooth' : 'auto';
}

// Init Global Settings
window.APP_SETTINGS = getSettings();
applySettings(window.APP_SETTINGS);

function openSettings() {
    let modal = document.getElementById('settingsModal');
    if (!modal) {
        createSettingsModal();
        modal = document.getElementById('settingsModal');
    }
    modal.classList.remove('hidden');
    renderSettingsContent();
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('hidden');
}

const SETTINGS_CSS = `
.switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #444; transition: .4s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; top: 50%; transform: translateY(-50%); background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: var(--accent); }
input:focus + .slider { box-shadow: 0 0 1px var(--accent); }
input:checked + .slider:before { transform: translate(20px, -50%); }
.setting-item { display: flex; align-items: center; justify-content: space-between; padding: 15px 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.action-btn { background: var(--bg-hover); color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.9rem; transition: 0.2s; }
.action-btn:hover { opacity: 0.9; transform: translateY(-1px); }
`;
const style = document.createElement('style');
style.textContent = SETTINGS_CSS;
document.head.appendChild(style);

function createSettingsModal() {
    const div = document.createElement('div');
    div.id = 'settingsModal';
    div.className = 'detail-page hidden';
    div.style.zIndex = '9999';
    div.innerHTML = `
        <div class="detail-backdrop" onclick="closeSettings()"></div>
        <button class="close-detail" onclick="closeSettings()">✕</button>
        <div class="detail-container">
            <div class="detail-content" style="max-width: 500px; margin: 50px auto; background: var(--bg-card); padding: 20px; border-radius: 12px;">
                <h2 style="text-align:center; margin-bottom: 20px;">⚙️ Cài đặt</h2>
                
                <div id="settingsList" class="settings-list"></div>

                <div style="margin-top: 30px; border-top: 1px solid var(--border); padding-top: 20px;">
                    <h3 style="margin-bottom: 10px; font-size: 1rem;">Dữ liệu & Sao lưu</h3>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <button class="action-btn" onclick="exportAppData()" style="background: var(--accent); color: white;">⬇️ Sao lưu (.json)</button>
                        <button class="action-btn" onclick="document.getElementById('importFile').click()" style="background: #2ecc71; color: white;">⬆️ Khôi phục</button>
                        <input type="file" id="importFile" style="display:none" accept=".json" onchange="importAppData(this)">
                    </div>

                    <div style="display:flex; gap:10px; margin-top:20px;">
                         <button class="action-btn" onclick="cleanCache()" style="flex:1; background: #3498db;">🧹 Dọn dẹp Cache</button>
                         <button class="action-btn" onclick="clearAppData()" style="flex:1; background: #ff4757;">🗑️ Reset App</button>
                    </div>
                    <p style="font-size: 0.8rem; color: #888; margin-top: 5px; text-align: center;">Dọn dẹp Cache giúp app nhẹ hơn mà không mất dữ liệu.</p>
                </div>
                
                <div style="margin-top: 20px; text-align: center; color: #666; font-size: 0.8rem;">
                    QPhim v2.3 - Clean & Fast
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

function renderSettingsContent() {
    let container = document.getElementById('settingsList');
    if (!container) container = document.getElementById('settingsBody');
    if (!container) return; // Safety check
    const settings = getSettings();

    const items = [
        { key: 'autoNext', label: 'Tự động chuyển tập/chương', icon: '⏩' },
        { key: 'smoothScroll', label: 'Cuộn mượt (Smooth Scroll)', icon: '🌊' },
        { key: 'dataSaver', label: 'Tiết kiệm dữ liệu (Ảnh nhỏ hơn)', icon: '📉' },
    ];

    container.innerHTML = items.map(item => `
        <div class="setting-item">
            <div style="display:flex; align-items:center; gap: 10px;">
                <span style="font-size: 1.2rem;">${item.icon}</span>
                <span>${item.label}</span>
            </div>
            <label class="switch">
                <input type="checkbox" ${settings[item.key] ? 'checked' : ''} onchange="toggleSetting('${item.key}', this.checked)">
                <span class="slider round"></span>
            </label>
        </div>
    `).join('');
}

window.toggleSetting = (key, value) => {
    const s = getSettings();
    s[key] = value;
    saveSettings(s);
};

window.cleanCache = async () => {
    if ('caches' in window) {
        try {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
            alert('Đã dọn dẹp Cache thành công! App sẽ tải lại để cập nhật.');
            window.location.reload();
        } catch (e) {
            alert('Lỗi xóa cache: ' + e);
        }
    } else {
        alert('Trình duyệt này không hỗ trợ Cache API.');
    }
};

window.clearAppData = () => {
    if (confirm('NGUY HIỂM: Bạn có chắc muốn xóa toàn bộ dữ liệu?\n- Lịch sử xem/đọc sẽ mất vĩnh viễn.\n- Tủ đồ sẽ bị xóa.')) {
        localStorage.clear();
        if ('caches' in window) {
            caches.keys().then(names => names.forEach(name => caches.delete(name)));
        }
        alert('Đã xóa dữ liệu! Ứng dụng sẽ tải lại.');
        window.location.reload();
    }
};

// === Backup & Restore Functions ===

window.exportAppData = () => {
    const data = {};
    // Collect all qhub keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('qhub-')) {
            try {
                data[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                data[key] = localStorage.getItem(key);
            }
        }
    }

    // Add metadata
    const exportObj = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: data
    };

    // Download file
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qphim-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.importAppData = (input) => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target.result);
            if (!json.data) throw new Error('File không hợp lệ');

            // Confirm restore
            if (confirm(`Tìm thấy bản sao lưu ngày ${new Date(json.timestamp).toLocaleString()}.\nBạn có muốn khôi phục không? (Dữ liệu hiện tại sẽ bị ghi đè)`)) {

                // Restore logic
                Object.keys(json.data).forEach(key => {
                    QStorage.save(key, json.data[key]);
                });

                alert('Khôi phục thành công! Đang tải lại trang...');
                window.location.reload();
            }
        } catch (err) {
            alert('Lỗi: File restore bị hỏng hoặc không đúng định dạng!');
            console.error(err);
        }
    };
    reader.readAsText(file);
    // Reset input
    input.value = '';
};

// Expose
window.openSettings = openSettings;
window.closeSettings = closeSettings;
