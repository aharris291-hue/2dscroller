// Usage: node tools/shot.cjs <url> <out.png> [waitMs] [w] [h]
const { chromium } = require('playwright');
(async () => {
  const [url, out, wait = '1500', w = '1200', h = '700'] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: +w, height: +h } });
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('GL Driver')) console.log('[console]', m.type(), m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(url);
  await page.waitForTimeout(+wait);
  await page.screenshot({ path: out });
  await browser.close();
})();
