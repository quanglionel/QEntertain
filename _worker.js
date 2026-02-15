export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        // === 1. Proxy API Phim (OPhim) ===
        // Client: /api/phim/... -> Server: https://ophim1.com/v1/api/...
        if (pathname.startsWith('/api/phim/')) {
            const path = pathname.replace('/api/phim/', '');
            const targetUrl = `https://ophim1.com/v1/api/${path}${url.search}`;
            return proxyRequest(targetUrl);
        }

        // === 2. Proxy API Truyện (OTruyen) ===
        // Client: /api/truyen/... -> Server: https://otruyenapi.com/v1/api/...
        if (pathname.startsWith('/api/truyen/')) {
            const path = pathname.replace('/api/truyen/', '');
            const targetUrl = `https://otruyenapi.com/v1/api/${path}${url.search}`;
            return proxyRequest(targetUrl);
        }

        // === 3. Proxy Chapter API (CDN Truyện) ===
        // Client: /api/truyen-chapter/... -> Server: https://sv1.otruyencdn.com/...
        if (pathname.startsWith('/api/truyen-chapter/')) {
            const path = pathname.replace('/api/truyen-chapter/', '');
            // Lưu ý: path ở đây thường là v1/api/chapter/...
            const targetUrl = `https://sv1.otruyencdn.com/${path}${url.search}`;
            return proxyRequest(targetUrl);
        }

        // === 4. Proxy Ảnh Phim ===
        if (pathname.startsWith('/img/phim/')) {
            const path = pathname.replace('/img/phim/', '');
            const targetUrl = `https://img.ophim.live/uploads/movies/${path}`;
            return proxyRequest(targetUrl, true);
        }

        // === 5. Proxy Ảnh Truyện ===
        if (pathname.startsWith('/img/truyen/')) {
            const path = pathname.replace('/img/truyen/', '');
            const targetUrl = `https://img.otruyenapi.com/uploads/comics/${path}`;
            return proxyRequest(targetUrl, true);
        }

        // === Default: Serve Static Assets ===
        // Yêu cầu Cloudflare Pages phục vụ file tĩnh (HTML, CSS, JS)
        return env.ASSETS.fetch(request);
    }
};

/**
 * Hàm Proxy request generic
 * @param {string} targetUrl URL đích cần fetch
 * @param {boolean} isImage Có phải là ảnh không (để cache lâu)
 */
async function proxyRequest(targetUrl, isImage = false) {
    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Compatible; CloudflareWorker/1.0)',
                'Referer': targetUrl // Fake referer nếu cần
            }
        });

        // Copy headers từ response gốc
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*'); // Allow All CORS
        newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

        // Xử lý cache
        if (isImage) {
            newHeaders.set('Cache-Control', 'public, max-age=86400'); // Cache ảnh 1 ngày
        } else {
            // API JSON cache ngắn hơn (ví dụ 5 phút)
            newHeaders.set('Cache-Control', 'public, max-age=300');
        }

        // Trả về response mới
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: 'Worker Proxy Error', details: e.message, url: targetUrl }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
