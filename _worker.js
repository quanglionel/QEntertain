/* ============================================
   QPhim & QTruyện - Cloudflare Pages Worker
   Proxy API + Serve static files
   ============================================ */

// Cấu hình proxy routes
const PROXY_ROUTES = {
    '/api/phim/': { target: 'https://ophim1.com/v1/api/', host: 'ophim1.com', cache: 300 },
    '/api/truyen/': { target: 'https://otruyenapi.com/v1/api/', host: 'otruyenapi.com', cache: 300 },
    '/img/phim/': { target: 'https://img.ophim.live/uploads/movies/', host: 'img.ophim.live', cache: 86400 },
    '/img/truyen/': { target: 'https://img.otruyenapi.com/uploads/comics/', host: 'img.otruyenapi.com', cache: 86400 },
    // Route riêng cho JSON chapter data
    '/api/truyen-chapter/v1/api/': { target: 'https://sv1.otruyencdn.com/v1/api/', host: 'sv1.otruyencdn.com', cache: 1800 },
    // Route chung cho ảnh truyện (CDN)
    '/api/truyen-chapter/': { target: 'https://sv1.otruyencdn.com/', host: 'sv1.otruyencdn.com', cache: 7200 },
};

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Match route dài nhất trước
        const routes = Object.entries(PROXY_ROUTES).sort((a, b) => b[0].length - a[0].length);

        for (const [prefix, config] of routes) {
            if (url.pathname.startsWith(prefix)) {
                return handleProxy(url, prefix, config);
            }
        }

        // Không match → serve static file bình thường
        return env.ASSETS.fetch(request);
    }
};

/**
 * Xử lý proxy request
 */
async function handleProxy(url, prefix, config) {
    const path = url.pathname.slice(prefix.length);
    const targetUrl = `${config.target}${path}${url.search}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Referer': config.target,
                'Origin': new URL(config.target).origin,
            },
        });

        // Xác định content type
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        const isImage = contentType.startsWith('image/');

        // Lấy body
        const body = isImage ? await response.arrayBuffer() : await response.text();

        return new Response(body, {
            status: response.status,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': `public, max-age=${config.cache}`,
            },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Proxy error', message: err.message }), {
            status: 502,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
