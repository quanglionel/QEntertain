/* ============================================
   QPhim & QTruyện - Settings Logic
   Quản lý cấu hình, giao diện cài đặt
   ============================================ */

const DEFAULT_SETTINGS = {
    autoNext: true,       // Tự động chuyển tập/chương
    smoothScroll: true,   // Cuộn mượt
    dataSaver: false,     // Tiết kiệm data (Load ảnh chất lượng thấp nếu có)
};

function getSettings() {
    try {
        const s = localStorage.getItem('qhub-settings');
        return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
    } catch (e) { return DEFAULT_SETTINGS; }
}

function saveSettings(newSettings) {
    localStorage.setItem('qhub-settings', JSON.stringify(newSettings));
    applySettings(newSettings);
}

function applySettings(settings) {
    // Apply logic here inside app components (e.g. update global variables)
    window.APP_SETTINGS = settings;

    // Example: Toggle smooth scroll on html
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
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #444; transition: .4s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: var(--accent); }
input:focus + .slider { box-shadow: 0 0 1px var(--accent); }
input:checked + .slider:before { transform: translateX(20px); }
.setting-item { display: flex; align-items: center; justify-content: space-between; padding: 15px 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
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
                    <h3 style="margin-bottom: 10px; font-size: 1rem;">Dữ liệu</h3>
                    <button class="action-btn" onclick="clearAppData()" style="width:100%; background: #ff4757;">🗑️ Xóa bộ nhớ đệm (Reset App)</button>
                    <p style="font-size: 0.8rem; color: #888; margin-top: 5px; text-align: center;">Dùng khi app bị lỗi hoặc không tải được.</p>
                </div>
                
                <div style="margin-top: 20px; text-align: center; color: #666; font-size: 0.8rem;">
                    QPhim v2.1 - Build 2026
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

function renderSettingsContent() {
    const container = document.getElementById('settingsList');
    const settings = getSettings();

    const items = [
        { key: 'autoNext', label: 'Tự động chuyển tập/chương', icon: '⏩' },
        { key: 'smoothScroll', label: 'Cuộn mượt (Smooth Scroll)', icon: '🌊' },
        { key: 'dataSaver', label: 'Tiết kiệm dữ liệu (Ảnh nhỏ hơn)', icon: '📉' },
    ];

    container.innerHTML = items.map(item => `
        <div class="setting-item" style="display:flex; justify-content:space-between; align-items:center; padding: 15px 0; border-bottom: 1px solid var(--border);">
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

window.clearAppData = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu (Lịch sử, Tủ đồ, Cài đặt)?')) {
        localStorage.clear();
        // Clear Cache Storage (Service Workers)
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        alert('Đã xóa dữ liệu! Ứng dụng sẽ tải lại.');
        window.location.reload();
    }
};

// Expose
window.openSettings = openSettings;
