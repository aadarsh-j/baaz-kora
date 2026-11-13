// Usage: node tools/shots.js <outPrefix> <width> <height> <query> <frac1,frac2,...> [wheel]
// Captures viewport frames at scroll fractions and writes one contact sheet JPEG (<=1200px, <250KB).
const { chromium } = require('playwright');
const [,, out, w, h, query, fr, mode] = process.argv;
(async () => {
  const b = await chromium.launch();
  const W = +w, H = +h, mobile = W < 800;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: mobile, isMobile: mobile, reducedMotion: query.includes('rm') ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await page.goto('http://localhost:4173/' + (query.startsWith('?') ? query : ''), { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const fracs = fr.split(',').map(Number), shots = [];
  for (const f of fracs) {
    const y = Math.round(f <= 1 ? f * max : f);
    await page.evaluate(y => window.scrollTo(0, y), y);
    await page.waitForTimeout(mode === 'slow' ? 1900 : 1100);
    shots.push((await page.screenshot({ type: 'jpeg', quality: 70 })).toString('base64'));
  }
  const cols = Math.min(shots.length, mobile ? 6 : 3), rows = Math.ceil(shots.length / cols);
  const cw = Math.floor(1200 / cols), ch = Math.round(cw * H / W);
  const sheet = await ctx.newPage(); await sheet.setViewportSize({ width: cols * cw, height: rows * ch });
  await sheet.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(${cols},${cw}px);background:#444">${shots.map(s => `<img src="data:image/jpeg;base64,${s}" style="width:${cw}px;height:${ch}px;display:block;outline:1px solid #f0f">`).join('')}</body>`);
  let q = 62; let buf;
  do { buf = await sheet.screenshot({ type: 'jpeg', quality: q }); q -= 8; } while (buf.length > 245000 && q > 20);
  require('fs').writeFileSync(out, buf);
  console.log(out, cols * cw, rows * ch, Math.round(buf.length / 1024) + 'KB', 'max', max, errs.length ? 'ERRORS ' + errs.join(' | ') : 'no errors');
  await b.close();
})();
