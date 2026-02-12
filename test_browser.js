const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting browser...');
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    console.log('Navigating to http://host.docker.internal:8080 ...');

    try {
        await page.goto('http://host.docker.internal:8080', { waitUntil: 'networkidle0', timeout: 30000 });
        console.log('Page loaded!');

        // Click on first movie card
        const cardSelector = '.movie-card';
        await page.waitForSelector(cardSelector, { timeout: 5000 });
        console.log('Found movie cards, clicking first one...');
        await page.click(cardSelector);

        // Wait for detail popup
        await page.waitForSelector('#detailPage:not(.hidden)', { timeout: 5000 });
        console.log('Detail popup opened!');

        // Click Watch Now (Play)
        const playBtnSelector = '.btn-play';
        await page.waitForSelector(playBtnSelector, { timeout: 5000 });
        console.log('Clicking Play button...');
        await page.click(playBtnSelector);

        // Wait for Watch Page
        await page.waitForSelector('#watchPage:not(.hidden)', { timeout: 5000 });
        console.log('Watch Page opened!');

        // Take screenshot of player area
        await page.screenshot({ path: 'player_screenshot.png' });
        console.log('Screenshot saved to player_screenshot.png');

    } catch (e) {
        console.error('Error:', e);
        await page.screenshot({ path: 'error_screenshot.png' });
    }

    await browser.close();
})();
