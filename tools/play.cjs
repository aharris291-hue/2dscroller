// Scripted playtest: drives the game with key presses and saves screenshots.
// Usage: node tools/play.cjs <script.json> <outdir>
// Script steps: {"wait":ms} {"down":"Key"} {"up":"Key"} {"press":"Key"} {"shot":"name"} {"eval":"js"}
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [scriptPath, outDir, url = 'http://localhost:5173/'] = process.argv.slice(2);
  const steps = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('GL Driver')) console.log('[console]', m.type(), m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message, e.stack?.split('\n').slice(0, 3).join(' | ')));
  await page.goto(url);
  for (const s of steps) {
    if (s.wait) await page.waitForTimeout(s.wait);
    if (s.until) await page.waitForFunction(s.until, null, { timeout: 60000, polling: 200 });
    if (s.down) await page.keyboard.down(s.down);
    if (s.up) await page.keyboard.up(s.up);
    if (s.press) await page.keyboard.press(s.press, { delay: 80 });
    if (s.shot) await page.screenshot({ path: `${outDir}/${s.shot}.png` });
    if (s.eval) console.log('[eval]', JSON.stringify(await page.evaluate(s.eval)));
  }
  await browser.close();
})();
