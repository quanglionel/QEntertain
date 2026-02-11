/* ============================================
   Cloudflare Pages Function
   Proxy OTruyen API → /api/truyen/*
   ============================================ */

export async function onRequest(context) {
    const url = new URL(context.request.url);

    // Lấy phần path sau /api/truyen/
    const apiPath = url.pathname.replace('/api/truyen/', '');
    const targetUrl = `https://otruyenapi.com/v1/api/${apiPath}${url.search}`;

    try {
        const response = await fetch(targetUrl, {
            method: context.request.method,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
            },
        });

        const data = await response.text();

        return new Response(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300', // Cache 5 phút
            },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
