// Real wheel input test (desktop, Lenis): scroll down, then back up, capture frames along the way + check frame pacing.
const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 810 } });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://localhost:4173/', { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.mouse.move(720, 400);
  await page.evaluate(() => { window.__f = []; let l = performance.now(); (function t(n) { __f.push(n - l); l = n; requestAnimationFrame(t) })(l); });
  const shots = [], ys = [];
  const wheel = async (dy, n) => { for (let i = 0; i < n; i++) { await page.mouse.wheel(0, dy); await page.waitForTimeout(16); } };
  const snap = async () => { await page.waitForTimeout(900); ys.push(await page.evaluate(() => Math.round(scrollY))); shots.push((await page.screenshot({ type: 'jpeg', quality: 68 })).toString('base64')); };
  await wheel(100, 14); await snap();           // mid-unweave
  await wheel(100, 52); await snap();           // drawing
  await wheel(100, 16); await snap();           // materialised?
  await wheel(-100, 10); await snap();          // back up: un-materialise
  await wheel(-100, 26); await snap();          // back to early draw
  await wheel(-100, 46); await snap();          // back in bleach
  const f = await page.evaluate(() => { const a = __f.slice(5).sort((x, y) => x - y); return { n: a.length, med: a[a.length >> 1].toFixed(1), p95: a[Math.floor(a.length * .95)].toFixed(1), max: a[a.length - 1].toFixed(1) } });
  const sheet = await ctx.newPage(); await sheet.setViewportSize({ width: 1200, height: 450 });
  await sheet.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(3,400px)">${shots.map(s => `<img src="data:image/jpeg;base64,${s}" style="width:400px;height:225px;display:block;outline:1px solid #f0f">`).join('')}</body>`);
  require('fs').writeFileSync(out, await sheet.screenshot({ type: 'jpeg', quality: 60 }));
  console.log('scrollY at snaps', ys.join(','), 'frame ms', JSON.stringify(f), errs.length ? errs : 'no errors');
  await b.close();
})();
