

async function showDetail(slug) {
    const detailPage = document.getElementById('detailPage');
    const content = document.getElementById('detailContent');
    if (!detailPage || !content) return;

    detailPage.classList.remove('hidden');
    content.innerHTML = '<div class="loading-spinner">Đang tải...</div>';

    try {
        let data;
        const isPhim = currentMode === 'phim';

        if (isPhim) {
            const res = await API.getPhimDetail(slug);
            if (!res || (res.status === false)) {
                throw new Error('API trả về lỗi hoặc không có dữ liệu');
            }
            data = res.movie || res.data?.item;
            if (!data) throw new Error('Không tìm thấy res.movie hoặc res.data.item');
            window.currentDetailData = data;
            data.episodes = res.episodes || res.data?.episodes || data.episodes || [];
            if (data.episodes.length > 0) {
                data.episodes.forEach(svr => {
                    if (!svr.server_data && svr.items) svr.server_data = svr.items;
                });
            }
        } else {
            const res = await API.getTruyenDetail(slug);
            if (!res.data) throw new Error('Lỗi tải truyện');
            data = res.data.item;
            window.currentDetailData = data;
        }

        renderDetailContent(data, isPhim);
    } catch (err) {
        content.innerHTML = `<div class="error-msg">Lỗi: ${err.message}</div>`;
        console.error(err);
    }

    const closeBtn = document.getElementById('closeDetailBtn');
    if (closeBtn) closeBtn.onclick = closeDetail;
}

function closeDetail() {
    const detailPage = document.getElementById('detailPage');
    if (detailPage) detailPage.classList.add('hidden');
    const media = document.getElementById('mediaContainer');
    if (media) media.innerHTML = '';
}

function renderDetailContent(item, isPhim) {
    const content = document.getElementById('detailContent');
    document.title = `${item.name} | QPhim`; // Dynamic Title
    const imgUrl = isPhim ? API.getPhimImageUrl(item.thumb_url) : API.getTruyenImageUrl(item.thumb_url);
    const safeName = item.name ? item.name.replace(/'/g, "\\'") : '';
    const safeThumb = item.thumb_url ? item.thumb_url.replace(/'/g, "\\'") : '';

    const history = getHistory(isPhim ? 'phim' : 'truyen');
    const hItem = history.find(h => h.slug === item.slug);

    let primaryBtn = '';

    if (isPhim && item.episodes && item.episodes.length > 0) {
        let targetEp = null;
        let btnLabel = "Xem Ngay";

        if (hItem && hItem.episode_name) {
            for (let s of item.episodes) {
                const d = s.server_data || s.items;
                if (d) {
                    const match = d.find(e => e.name == hItem.episode_name);
                    if (match) {
                        targetEp = match;
                        btnLabel = `Tiếp tục: Tập ${hItem.episode_name}`;
                        break;
                    }
                }
            }
        }

        if (!targetEp && item.episodes[0].server_data && item.episodes[0].server_data.length > 0) {
            targetEp = item.episodes[0].server_data[0];
        }

        if (targetEp) {
            const link = targetEp.link_m3u8 || targetEp.link_embed;
            if (link) {
                primaryBtn = `<button class="btn-large btn-play" onclick="playEp('${link}', '${targetEp.name}', '${item.slug}', '${safeName}', '${safeThumb}')">
                    ${ICONS.play} ${btnLabel}
                 </button>`;
            }
        }
    } else if (!isPhim && item.chapters && item.chapters.length > 0) {
        const firstServer = item.chapters[0];
        if (firstServer && firstServer.server_data && firstServer.server_data.length > 0) {
            const chap = firstServer.server_data[0];
            primaryBtn = `<button class="btn-large btn-play" onclick="readChap('${chap.chapter_api_data}', true, '${item.slug}')">
                ${ICONS.book} Đọc Ngay
            </button>`;
        }
    }

    const bgUrl = (isPhim && item.poster_url) ? API.getPhimImageUrl(item.poster_url) : imgUrl;

    // Meta strings
    const categories = item.category ? item.category.map(c => c.name).join(', ') : '';
    const countries = item.country ? item.country.map(c => c.name).join(', ') : '';
    const year = item.year || '';
    const time = item.time || '';
    const quality = item.quality || '';
    const lang = item.lang || '';

    const type = isPhim ? 'phim' : 'truyen';
    const isFav = window.isBookmarked ? window.isBookmarked(item.slug, type) : false;

    content.innerHTML = `
        <div class="detail-bg" style="background-image: url('${bgUrl}')"></div>
        <div class="detail-header">
            <div class="detail-poster">
                <img src="${imgUrl}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            </div>
            <div class="detail-info">
                <h1 class="detail-title">${item.name}</h1>
                <h3 class="detail-org-title">${item.origin_name || ''}</h3>

                <div class="detail-meta-row">
                    ${year ? `<span class="meta-badge">${year}</span>` : ''}
                    ${quality ? `<span class="meta-badge high">${quality}</span>` : ''}
                    ${lang ? `<span class="meta-badge">${lang}</span>` : ''}
                    ${time ? `<span class="meta-badge">${time}</span>` : ''}
                </div>

                <div class="detail-meta-text" style="margin-bottom:20px;color: #ddd;font-size:0.95rem;">
                    ${countries ? `<p><strong>Quốc gia:</strong> ${countries}</p>` : ''}
                    ${categories ? `<p><strong>Thể loại:</strong> ${categories}</p>` : ''}
                    ${item.actor && item.actor.length > 0 ? `<p><strong>Diễn viên:</strong> ${item.actor.join(', ')}</p>` : ''}
                </div>

                <div class="detail-actions">
                    ${primaryBtn}
                    <button class="btn-large btn-bookmark ${isFav ? 'active' : ''}" id="detailBookmarkBtn" style="background:#444;margin-left:10px;">
                        ${isFav ? '❤️ Đã lưu' : '♡ Yêu thích'}
                    </button>
                </div>

                <div class="detail-desc">
                    <strong>Nội dung:</strong><br />
                    ${item.content || item.description || 'Đang cập nhật...'}
                </div>
                
                <div class="server-list-container">
                    <h3>${isPhim ? 'Danh sách tập' : 'Danh sách chương'}</h3>
                    <div id="serverList" class="server-list"></div>
                </div>
            </div>
        </div>
    `;

    // Bind Event Bookmark
    const bmBtn = document.getElementById('detailBookmarkBtn');
    if (bmBtn && window.toggleBookmark) {
        bmBtn.onclick = () => {
            const newState = window.toggleBookmark(item, type);
            bmBtn.classList.toggle('active', newState);
            bmBtn.innerHTML = newState ? '❤️ Đã lưu' : '♡ Yêu thích';
            bmBtn.style.background = newState ? 'var(--accent)' : '#444';
        };
        // Init state style
        if (isFav) bmBtn.style.background = 'var(--accent)';
    }

    renderListButtons(item, isPhim);
}

function renderListButtons(item, isPhim) {
    const list = document.getElementById('serverList');
    if (!list) return;
    list.innerHTML = '';

    let items = [];
    if (isPhim) {
        if (item.episodes) {
            item.episodes.forEach(server => {
                const svData = server.server_data || server.items || [];
                items = items.concat(svData.map(ep => ({
                    label: `Tập ${ep.name}`,
                    value: ep.link_m3u8 || ep.link_embed,
                    id: ep.name,
                    data: ep,
                    onClick: () => {
                        const safeName = item.name.replace(/'/g, "\\'");
                        const safeThumb = item.thumb_url.replace(/'/g, "\\'");
                        playEp(ep.link_m3u8 || ep.link_embed, ep.name, item.slug, safeName, safeThumb);
                    }
                })));
            });
        }
    } else {
        if (item.chapters && item.chapters.length > 0) {
            const svData = item.chapters[0].server_data || [];
            items = svData.map(chap => ({
                label: `Chương ${chap.chapter_name}`,
                value: chap.chapter_api_data,
                id: chap.chapter_name,
                onClick: () => readChap(chap.chapter_api_data, true, item.slug)
            }));
        }
    }

    if (items.length === 0) {
        list.innerHTML = '<div style="color:#888;font-style:italic;">Đang cập nhật...</div>';
        return;
    }

    const groupSize = 50;
    const totalGroups = Math.ceil(items.length / groupSize);
    list.className = 'chapter-list-container';

    if (totalGroups > 1) {
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'chapter-tabs';
        tabsContainer.style.cssText = 'display:flex;gap:10px;overflow-x:auto;margin-bottom:15px;padding-bottom:5px;';

        const listContainer = document.createElement('div');
        listContainer.className = 'chapter-groups';

        for (let i = 0; i < totalGroups; i++) {
            const start = i * groupSize;
            const end = Math.min((i + 1) * groupSize, items.length);

            const tabBtn = document.createElement('button');
            tabBtn.className = `tab-btn ${i === 0 ? 'active' : ''}`;
            const sLab = items[start].label;
            const eLab = items[end - 1].label;
            // Try to extract number
            const sNum = isPhim ? sLab.replace('Tập ', '') : sLab.replace('Chương ', '');
            const eNum = isPhim ? eLab.replace('Tập ', '') : eLab.replace('Chương ', '');

            tabBtn.textContent = `${sNum} - ${eNum}`;
            if (tabBtn.textContent.includes('undefined')) tabBtn.textContent = `Nhóm ${i + 1}`;

            tabBtn.style.cssText = 'padding:5px 15px;background:#333;border:none;border-radius:4px;color:#ccc;cursor:pointer;white-space:nowrap;';
            if (i === 0) tabBtn.style.background = 'var(--accent)';

            const groupDiv = document.createElement('div');
            groupDiv.className = `chapter-group ${i === 0 ? '' : 'hidden'}`;
            groupDiv.dataset.group = i;
            groupDiv.style.cssText = i === 0 ? 'display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;' : 'display:none;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;';

            items.slice(start, end).forEach(dataItem => {
                const btn = document.createElement('button');
                btn.className = 'chapter-item';
                if (window.checkWatched && checkWatched(item.slug, dataItem.id)) {
                    btn.classList.add('watched');
                }
                btn.textContent = dataItem.label;
                btn.onclick = dataItem.onClick;
                btn.style.cssText = 'padding:10px;background:#252525;border:1px solid #333;color:#ccc;border-radius:4px;text-align:center;cursor:pointer;';
                groupDiv.appendChild(btn);
            });

            listContainer.appendChild(groupDiv);

            tabBtn.onclick = () => {
                Array.from(tabsContainer.children).forEach(t => {
                    t.classList.remove('active');
                    t.style.background = '#333';
                });
                tabBtn.classList.add('active');
                tabBtn.style.background = 'var(--accent)';

                Array.from(listContainer.children).forEach(g => {
                    g.style.display = 'none';
                });
                groupDiv.style.display = 'grid';
            };
            tabsContainer.appendChild(tabBtn);
        }
        list.appendChild(tabsContainer);
        list.appendChild(listContainer);
    } else {
        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;';
        items.forEach(dataItem => {
            const btn = document.createElement('button');
            btn.className = 'chapter-item';
            if (window.checkWatched && checkWatched(item.slug, dataItem.id)) {
                btn.classList.add('watched');
            }
            btn.innerText = dataItem.label;
            btn.onclick = dataItem.onClick;
            btn.style.cssText = 'padding:10px;background:#252525;border:1px solid #333;color:#ccc;border-radius:4px;text-align:center;cursor:pointer;';
            grid.appendChild(btn);
        });
        list.appendChild(grid);
    }
}

// Expose Show/Close
window.showDetail = showDetail;
window.closeDetail = closeDetail;
