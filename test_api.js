const http = require('http');

const BASE_URL = 'http://localhost/api'; // Trong container gọi chính nó qua localhost (port 80)

function testEndpoint(path) {
    return new Promise((resolve) => {
        const url = `${BASE_URL}${path}`;
        console.log(`\n🔍 Checking: ${path}`);

        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    console.log(`❌ FAIL: HTTP ${res.statusCode}`);
                    console.log(`   Response: ${data.substring(0, 50)}...`);
                    return resolve(null);
                }

                try {
                    const json = JSON.parse(data);
                    console.log('✅ PASS: Valid JSON');
                    resolve(json);
                } catch (e) {
                    console.log(`❌ FAIL: Invalid JSON (${e.message})`);
                    console.log(`   Data: ${data.substring(0, 100)}...`);
                    resolve(null);
                }
            });
        }).on('error', (err) => {
            console.log(`❌ NETWORK ERROR: ${err.message}`);
            resolve(null);
        });
    });
}

(async () => {
    console.log('🚀 STARTING API TEST (Inside Docker)...');

    // 1. OPhim Home
    const phimHome = await testEndpoint('/phim/danh-sach/phim-moi-cap-nhat');
    if (phimHome && phimHome.items && phimHome.items.length > 0) {
        const first = phimHome.items[0];
        console.log(`✅ PASS: Found ${phimHome.items.length} items`);
        console.log(`   Item: ${first.name} (${first.slug})`);

        // 2. OPhim Detail
        const detail = await testEndpoint(`/phim/phim/${first.slug}`);
        if (detail) {
            if (detail.status === true && detail.movie) {
                console.log('✅ PASS: Movie content detected');
                if (detail.episodes && detail.episodes.length > 0) {
                    console.log(`✅ PASS: Found ${detail.episodes[0].server_data.length} episodes`);
                } else {
                    console.log('⚠️ WARN: No episodes found');
                }
            } else {
                console.log('❌ FAIL: Movie structure invalid', detail);
            }
        }
    } else {
        console.log('❌ FAIL: No items in Phim Home');
        console.log('Response Object:', JSON.stringify(phimHome, null, 2)); // Debug log
    }

    // 3. OTruyen Home
    const truyenHome = await testEndpoint('/truyen/home');
    if (truyenHome && truyenHome.data && truyenHome.data.items) {
        const first = truyenHome.data.items[0];
        console.log(`   Item: ${first.name} (${first.slug})`);

        // 4. OTruyen Detail
        const detail = await testEndpoint(`/truyen/truyen-tranh/${first.slug}`);
        if (detail) {
            if (detail.data && detail.data.item) {
                console.log('✅ PASS: Comic content detected');
                if (detail.data.item.chapters && detail.data.item.chapters.length > 0) {
                    console.log(`✅ PASS: Found chapters`);

                    // Test Chapter Content
                    const firstChap = detail.data.item.chapters[0].server_data[0];
                    let chapApi = firstChap.chapter_api_data;
                    console.log(`   Testing Chapter: ${firstChap.chapter_name}`);

                    if (chapApi.includes('sv1.otruyencdn.com')) {
                        const proxyUrl = chapApi.replace('https://sv1.otruyencdn.com', '/truyen-chapter');
                        const chapContent = await testEndpoint(proxyUrl);

                        if (chapContent && chapContent.status === 'success') {
                            console.log(`✅ PASS: Chapter Content Loaded`);
                            console.log(`   Images: ${chapContent.data.item.chapter_image.length} files`);
                            console.log(`   CDN: ${chapContent.data.domain_cdn}`);
                        } else {
                            console.log('❌ FAIL: Chapter Content Error');
                        }
                    } else {
                        console.log('⚠️ WARN: Chapter URL not from expected CDN, skipping proxy test');
                    }
                } else {
                    console.log('⚠️ WARN: No chapters found');
                }
            } else {
                console.log('❌ FAIL: Comic structure invalid', detail);
            }
        }
    } else {
        console.log('❌ FAIL: No items in Truyen Home');
    }

    console.log('\n🏁 TEST FINISHED');
})();
