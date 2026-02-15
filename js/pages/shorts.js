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
        slide.dataset.slug = item.slug;
        slide.dataset.index = index;

        const imgUrl = API.getPhimImageUrl(item.thumb_url);
        const quality = item.quality || 'HD';
        const eps = item.episode_current || '??';

        slide.innerHTML = `
            <div class="shorts-video-container" id="player-${item.slug}"></div>
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
                <button class="shorts-btn play-btn" onclick="playShortInSlide('${item.slug}', this, true)">▶</button>
                <button class="shorts-btn" onclick="likeShort(this)">❤</button>
                <button class="shorts-btn" onclick="showDetail('${item.slug}')">ℹ</button>
            </div>
        `;
        container.appendChild(slide);
    });

    // 4. Init Auto-Play Observer
    initShortsObserver();
};

// Intersection Observer for AutoPlay
function initShortsObserver() {
    const options = { threshold: 0.7 }; // 70% visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const slug = entry.target.dataset.slug;
                console.log('👀 Active Short:', slug);
                // Call global function to ensure it exists
                if (window.playShortInSlide) {
                    window.playShortInSlide(slug, entry.target.querySelector('.play-btn'), false);
                }
            } else {
                // Stop player if not visible
                const playerContainer = entry.target.querySelector('.shorts-video-container');
                if (playerContainer) {
                    playerContainer.innerHTML = '';
                    playerContainer.classList.remove('active');
                    entry.target.querySelector('.shorts-poster')?.classList.remove('hidden');
                }
            }
        });
    }, options);

    document.querySelectorAll('.shorts-item').forEach(item => observer.observe(item));
}

// Fixed Play Logic for Slide
window.playShortInSlide = async (slug, btn, isManual = false) => {
    const slide = btn.closest('.shorts-item');
    const playerContainer = slide.querySelector('.shorts-video-container');
    const poster = slide.querySelector('.shorts-poster');

    // Only skip if already active AND this is an auto-play trigger
    if (!isManual && playerContainer.classList.contains('active')) return;

    try {
        const res = await API.getPhimDetail(slug);
        if (!res || !res.status) return;

        const data = res.movie;
        const episodes = res.episodes;

        let firstEp = null;
        if (episodes && episodes.length > 0) {
            const sv = episodes[0];
            const items = sv.server_data || sv.items;
            if (items && items.length > 0) firstEp = items[0];
        }

        if (firstEp) {
            let link = firstEp.link_embed || firstEp.link_m3u8;

            // Force autoplay for shorts if embed
            if (link.includes('embed') || link.includes('share')) {
                link += (link.includes('?') ? '&' : '?') + 'autoplay=1';
            }

            const backupUrl = (firstEp.link_m3u8 && firstEp.link_embed && firstEp.link_m3u8 !== firstEp.link_embed) ? firstEp.link_m3u8 : null;
            const thumb = API.getPhimImageUrl(data.thumb_url);

            // Show player container
            playerContainer.classList.add('active');
            poster.classList.add('hidden');

            // Initialize Player directly in slide
            if (window.Player) {
                // Note: We use null for nextEpCallback because Shorts usually loop or manual swipe
                Player.initVideo(playerContainer, link, null, thumb, backupUrl);
            }
        }
    } catch (e) {
        console.error('Play Slide Error:', e);
    }
};

window.playShort = (slug) => {
    // Legacy support if needed, but we use playShortInSlide now
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
