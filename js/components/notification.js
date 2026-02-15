/* === Notification System === */

// === 1. TOAST NOTIFICATION ===
// Tạo container cho toast nếu chưa có
function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'info') {
    const container = getToastContainer();
    const toast = document.createElement('div');

    // Icon
    let icon = 'ℹ️';
    let color = 'var(--accent)';
    if (type === 'success') { icon = '✅'; color = '#4caf50'; }
    if (type === 'error') { icon = '❌'; color = '#f44336'; }
    if (type === 'warning') { icon = '⚠️'; color = '#ff9800'; }

    toast.className = 'toast-item';
    toast.style.cssText = `
        background: rgba(20, 20, 30, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 4px solid ${color};
        padding: 12px 20px;
        border-radius: 8px;
        color: #fff;
        font-size: 0.9rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
        opacity: 0;
        transform: translateX(50px);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        pointer-events: auto;
    `;

    toast.innerHTML = `<span style="font-size:1.2rem;">${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    // Animation In
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });

    // Auto Remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


// === 2. NOTIFICATION CENTER (Chuông) ===
const NOTI_KEY = 'qhub-notifications';
const LAST_CHECK_KEY = 'qhub-last-check-update';

function getNotifications() {
    try {
        return JSON.parse(localStorage.getItem(NOTI_KEY) || '[]');
    } catch (e) { return []; }
}

function saveNotification(title, body, link, thumb) {
    const list = getNotifications();

    // Tránh trùng lặp (ví dụ cùng link)
    if (list.some(n => n.link === link)) return;

    const noti = {
        id: Date.now() + Math.random(),
        title,
        body,
        link,
        thumb,
        time: Date.now(),
        read: false
    };

    list.unshift(noti);
    // Giới hạn 50 thông báo
    if (list.length > 50) list.pop();

    localStorage.setItem(NOTI_KEY, JSON.stringify(list));
    updateBellBadge();
    showToast(`🔔 ${title}: ${body}`);
}

function markAllRead() {
    const list = getNotifications();
    list.forEach(n => n.read = true);
    localStorage.setItem(NOTI_KEY, JSON.stringify(list));
    updateBellBadge();
}

function getUnreadCount() {
    return getNotifications().filter(n => !n.read).length;
}

function updateBellBadge() {
    const badges = [
        document.getElementById('noti-badge'),
        document.getElementById('noti-badge-mobile')
    ];
    const count = getUnreadCount();

    badges.forEach(badge => {
        if (badge) {
            if (count > 0) {
                badge.style.display = 'flex';
                badge.textContent = count > 9 ? '9+' : count;
            } else {
                badge.style.display = 'none';
            }
        }
    });
}

// === 3. CHECK UPDATE LOGIC ===
// Kiểm tra truyện trong Bookmark & History xem có chap mới không
async function checkNewChapters() {
    const now = Date.now();
    const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0');

    // Chỉ check mỗi 30 phút một lần để tránh spam API
    if (now - lastCheck < 30 * 60 * 1000) {
        console.log('Skipping update check (cooldown active)');
        return;
    }

    console.log('Checking for new chapters...');
    localStorage.setItem(LAST_CHECK_KEY, now.toString());

    // Lấy danh sách bookmark truyện
    const bookmarks = JSON.parse(localStorage.getItem('qhub-bookmarks-truyen') || '[]');
    // Lấy danh sách history truyện (để check truyện đang đọc dở)
    const history = JSON.parse(localStorage.getItem('qhub-history-truyen') || '[]');

    // Merge danh sách (unique slug)
    const uniqueSlugs = new Set([...bookmarks.map(b => b.slug), ...history.map(h => h.slug)]);
    const slugs = Array.from(uniqueSlugs).slice(0, 10); // Giới hạn check 10 truyện gần nhất để nhẹ

    if (slugs.length === 0) return;

    // Fetch detail từng truyện để check
    for (const slug of slugs) {
        try {
            const res = await API.getTruyenDetail(slug);
            if (res && res.data && res.data.item) {
                const item = res.data.item;
                const latestChap = item.chapters[0]?.server_data?.slice(-1)[0]; // Chap cuối cùng

                if (latestChap) {
                    const latestChapName = latestChap.chapter_name;

                    // Kiểm tra xem user đã đọc chap này chưa (trong history)
                    // Hoặc đơn giản là lưu "last_known_chapter" vào localStorage riêng để so sánh
                    const knownKey = `qhub-last-chap-${slug}`;
                    const lastKnown = localStorage.getItem(knownKey);

                    if (lastKnown && lastKnown !== latestChapName) {
                        // Có chương mới!
                        saveNotification(
                            'Chương mới',
                            `${item.name} - Ch.${latestChapName}`,
                            slug, // Link slug để mở detail
                            item.thumb_url
                        );
                    }

                    // Cập nhật last known
                    localStorage.setItem(knownKey, latestChapName);
                }
            }
        } catch (e) {
            console.error('Check update failed for', slug, e);
        }
    }
}

// === 4. RENDER NOTIFICATION MODAL ===
function toggleNotiModal() {
    let modal = document.getElementById('noti-modal');
    if (!modal) {
        // Create Noti Modal
        modal = document.createElement('div');
        modal.id = 'noti-modal';
        modal.className = 'noti-modal hidden';
        modal.innerHTML = `
            <div class="noti-header">
                <h3>Thông báo</h3>
                <button onclick="markAllRead()" style="font-size:0.8rem;color:var(--accent);background:none;border:none;cursor:pointer;">Đã đọc tất cả</button>
            </div>
            <div class="noti-list" id="noti-list"></div>
        `;
        // Append to header right container usually, or body absolute
        const btn = document.querySelector('.header-icon-btn.noti-btn');
        if (btn) {
            btn.parentElement.style.position = 'relative'; // Ensure parent relative
            btn.parentElement.appendChild(modal);
        } else {
            document.body.appendChild(modal);
            modal.style.position = 'fixed';
            modal.style.top = '60px';
            modal.style.right = '10px';
        }
    }

    // Toggle
    const isHidden = modal.classList.contains('hidden');
    if (isHidden) {
        renderNotiList();
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function renderNotiList() {
    const list = document.getElementById('noti-list');
    const notis = getNotifications();
    list.innerHTML = '';

    if (notis.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">Không có thông báo mới</div>';
        return;
    }

    notis.forEach(n => {
        const item = document.createElement('div');
        item.className = `noti-item ${n.read ? 'read' : 'unread'}`;

        // Thời gian
        const timeStr = window.formatRelativeTime ? formatRelativeTime(n.time) : 'Vừa xong';

        // Ảnh thumb
        const imgUrl = API.getTruyenImageUrl(n.thumb);

        item.innerHTML = `
            <img src="${imgUrl}" onerror="this.src='/favicon.ico'" class="noti-thumb">
            <div class="noti-content">
                <div class="noti-title">${n.title}</div>
                <div class="noti-body">${n.body}</div>
                <div class="noti-time">${timeStr}</div>
            </div>
            ${!n.read ? '<div class="noti-dot"></div>' : ''}
        `;

        item.onclick = () => {
            // Mark read logic implied
            // Redirect logic
            if (window.showDetail) {
                showDetail(n.link);
            }
            toggleNotiModal(); // close
        };

        list.appendChild(item);
    });

    // Mark as read visually? Or wait user action? 
    // Usually opening the list doesn't mark all read immediately, clicking does.
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('noti-modal');
    const btn = document.querySelector('.noti-btn');
    if (modal && !modal.classList.contains('hidden') && !modal.contains(e.target) && (!btn || !btn.contains(e.target))) {
        modal.classList.add('hidden');
    }
});

// Expose
window.showToast = showToast;
window.checkNewChapters = checkNewChapters;
window.toggleNotiModal = toggleNotiModal;
window.updateBellBadge = updateBellBadge;
