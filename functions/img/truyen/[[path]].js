/* ============================================
   Cloudflare Pages Function
   Proxy ảnh truyện từ OTruyen CDN → /img/truyen/*
   ============================================ */

export async function onRequest(context) {
    const url = new URL(context.request.url);

    // Lấy phần path sau /img/truyen/
    const imgPath = url.pathname.replace('/img/truyen/', '');
    const targetUrl = `https://img.otruyenapi.com/uploads/comics/${imgPath}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });

        const imageData = await response.arrayBuffer();

        return new Response(imageData, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=86400', // Cache 1 ngày
            },
        });
    } catch (err) {
        return new Response('Image not found', { status: 404 });
    }
}
