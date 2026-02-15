/* === Shorts Page Logic (TikTok Style) === */

window.shortsState = {
    active: false,
    items: [],
    currentIndex: 0
};

// Main Entry Point
window.renderShortsPage = (items) => {
    // 1. Hide Main Content
    const main = document.getElementById('movieSections');
    if (main) main.style.display = 'none';

    const hero = document.getElementById('hero');
    if (hero) hero.style.display = 'none';

    // 2. Create Shorts Container if not exists
    let container = document.getElementById('shortsContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'shortsContainer';
        container.className = 'shorts-container active';
        document.getElementById('app').appendChild(container); // Append to App root
    } else {
        container.innerHTML = '';
        container.className = 'shorts-container active';
        container.style.display = 'block';
    }

    window.shortsState.active = true;
    window.shortsState.items = items;

    // 3. Render Items
    items.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'shorts-item';

        const imgUrl = API.getPhimImageUrl(item.thumb_url);
        const quality = item.quality || 'HD';
        const eps = item.episode_current || '??';

        slide.innerHTML = `
            <img class="shorts-poster" src="${imgUrl}" loading="lazy">
            <div class="shorts-gradient"></div>

            <div class="shorts-info">
                <span class="shorts-quality">${quality} • ${eps}</span>
                <h3 class="shorts-title">${item.name}</h3>
                <div class="shorts-meta">
                     <span>${item.year}</span> • <span>${item.origin_name || 'Quốc gia'}</span>
                </div>
            </div>

            <div class="shorts-actions">
                <button class="shorts-btn play-btn" onclick="playShort('${item.slug}')">▶</button>
                <button class="shorts-btn" onclick="likeShort(this)">❤</button>
                <button class="shorts-btn" onclick="showDetail('${item.slug}')">ℹ</button>
            </div>
        `;
        container.appendChild(slide);
    });

    // 4. Adjust Header/Nav (Optional: Hide Header for immersive experience?)
    // For now we keep header but maybe transparent?

    // 5. Scroll Listener (for auto-paging or analytics)
    container.addEventListener('scroll', handleShortsScroll);
};

// Play Logic: Go to Watch Page directly (Auto Next supported)
window.playShort = async (slug) => {
    try {
        // 1. Fetch Detail Data first
        const res = await API.getPhimDetail(slug);
        if (!res || !res.status) {
            console.error('Fetch detail failed');
            return;
        }

        const data = res.movie;
        if (!data) return;

        // 2. Set global context for Watch Page to use
        window.currentDetailData = data;
        window.currentDetailData.episodes = res.episodes;

        // 3. Get First Episode
        let firstEp = null;
        if (res.episodes && res.episodes.length > 0) {
            const sv = res.episodes[0];
            const items = sv.server_data || sv.items;
            if (items && items.length > 0) {
                firstEp = items[0];
            }
        }

        if (firstEp) {
            const link = firstEp.link_m3u8 || firstEp.link_embed;
            // Use API helper to get full image url
            const thumb = API.getPhimImageUrl(data.thumb_url);
            const backupUrl = (firstEp.link_m3u8 && firstEp.link_embed && firstEp.link_m3u8 !== firstEp.link_embed) ? firstEp.link_embed : null;

            // 4. Call PlayEp (Handles UI switching and Player init)
            playEp(link, firstEp.name, slug, data.name, thumb, backupUrl);
        } else {
            alert('Phim đang cập nhật, vui lòng thử lại sau!');
        }

    } catch (e) {
        console.error('Play Short Error:', e);
    }
};

window.likeShort = (btn) => {
    btn.classList.toggle('active');
    btn.style.color = btn.classList.contains('active') ? '#e50914' : '#fff';
    btn.style.animation = 'pulse 0.3s';
};

function handleShortsScroll(e) {
    // Detect current slide index if needed
}

// Exit Shorts
window.closeShorts = () => {
    const container = document.getElementById('shortsContainer');
    if (container) {
        container.style.display = 'none';
        container.classList.remove('active');
    }
    window.shortsState.active = false;

    // Restore Main
    const main = document.getElementById('movieSections');
    if (main) main.style.display = 'block';
};
