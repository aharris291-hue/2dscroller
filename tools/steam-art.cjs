// Saves every Steam store and library image into steam-assets/.
// Run the dev server first (npm run dev), then: node tools/steam-art.cjs
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ASSETS = [
  ['store/header-capsule-920x430', 920, 430, 'header'],
  ['store/small-capsule-462x174', 462, 174, 'small'],
  ['store/main-capsule-1232x706', 1232, 706, 'main'],
  ['store/vertical-capsule-748x896', 748, 896, 'vertical'],
  ['store/page-background-1438x810', 1438, 810, 'background'],
  ['library/library-capsule-600x900', 600, 900, 'libcapsule'],
  ['library/library-header-920x430', 920, 430, 'header'],
  ['library/library-hero-3840x1240', 3840, 1240, 'hero'],
  ['library/library-logo-1280x720', 1280, 720, 'logo'],
];
(async () => {
  const out = path.join(__dirname, '..', 'steam-assets');
  const url = process.argv[2] || 'http://localhost:5173';
  const browser = await chromium.launch();
  for (const [name, w, h, layout] of ASSETS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    page.on('pageerror', (e) => console.log('[pageerror]', e.message));
    await page.goto(`${url}/tools/keyart/?w=${w}&h=${h}&layout=${layout}`);
    await page.waitForFunction(() => window.__done, null, { timeout: 60000 });
    // read the canvas pixels directly so the logo keeps its transparent background
    const data = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
    fs.writeFileSync(`${out}/${name}.png`, Buffer.from(data.split(',')[1], 'base64'));
    console.log('saved', name);
    await page.close();
  }
  await browser.close();
})();
