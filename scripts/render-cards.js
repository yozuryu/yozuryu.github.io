// Share cards: one tall and one wide picture per theme, with the numbers of the day they were made.
//   node scripts/render-cards.js [--base https://yozuryu.github.io/] [theme …]
// Opens <base>?theme=<id>&card=story|link in headless Chrome (no npm dependency: Chrome is driven over
// --remote-debugging-pipe) and saves assets/share/<id>-story.jpg (1080 × 1920) and <id>-link.jpg (1200 × 630).
// The page must be reachable with Savepoint beside it (the live site, or a local server laid out the same way).
const fs = require('fs'), os = require('os'), path = require('path'), { spawn } = require('child_process');

const args = process.argv.slice(2);
const bi = args.indexOf('--base');
const base = (bi >= 0 ? args.splice(bi, 2)[1] : 'https://yozuryu.github.io/').replace(/\/?$/, '/');
const THEMES = args.length ? args : ['starlit', 'load', 'quest', 'stylish', 'noah'];
const SHAPES = { story: { w: 450, h: 800, scale: 2.4 }, link: { w: 800, h: 420, scale: 1.5 } };
const OUT = path.join(__dirname, '..', 'assets', 'share');
const CHROME = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium']
    .find(p => p && fs.existsSync(p));

(async () => {
    if (!CHROME) throw new Error('Chrome not found: set CHROME to its path');
    fs.mkdirSync(OUT, { recursive: true });
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cards-'));
    const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-pipe', `--user-data-dir=${profile}`, '--no-sandbox', '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
    let seq = 0, buf = '';
    const waiting = new Map();
    chrome.stdio[4].on('data', d => {
        buf += d;
        for (let i; (i = buf.indexOf('\0')) >= 0; buf = buf.slice(i + 1)) {
            const m = JSON.parse(buf.slice(0, i)), x = waiting.get(m.id);
            if (m.method === 'Runtime.exceptionThrown') console.error('  page error:', m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
            if (!x) continue;
            waiting.delete(m.id);
            m.error ? x.reject(new Error(m.error.message)) : x.resolve(m.result);
        }
    });
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const id = ++seq; waiting.set(id, { resolve, reject }); chrome.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0'); });
    try {
        const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
        const tab = (m, p) => send(m, p, sessionId);
        const ev = async (expression) => (await tab('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
        await tab('Page.enable'); await tab('Runtime.enable');
        for (const theme of THEMES) for (const [shape, s] of Object.entries(SHAPES)) {
            await tab('Emulation.setDeviceMetricsOverride', { width: s.w, height: s.h, deviceScaleFactor: s.scale, mobile: false });
            await tab('Page.navigate', { url: `${base}?theme=${theme}&card=${shape}` });
            // ready = the card is drawn with all its data; then the fonts and every picture on it have to be in
            let ok = false;
            for (let i = 0; i < 60 && !ok; i++) { await new Promise(r => setTimeout(r, 250)); ok = await ev(`document.body?.dataset.ready === '1' && !!document.querySelector('.sc')`).catch(() => false); }
            if (!ok) { console.error(`  ${theme}-${shape}: the card never drew, skipped`); continue; }
            await ev(`Promise.race([Promise.all([document.fonts.ready, ...[...document.querySelectorAll('.sc *')].map(el => {
                const u = el.tagName === 'IMG' ? el.currentSrc || el.src : (getComputedStyle(el).backgroundImage.match(/url\\("?(.+?)"?\\)/) || [])[1];
                return u ? new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = u; }) : null; })]), new Promise(r => setTimeout(r, 8000))]).then(() => 1)`);
            await new Promise(r => setTimeout(r, 400));
            const fit = await ev(`(() => { const sc = document.querySelector('.sc'), inn = sc.querySelector('.in'); return Math.round(inn.getBoundingClientRect().height) + '/' + sc.clientHeight + ' px, zoom ' + (+inn.style.zoom || 1).toFixed(2); })()`);
            const shot = await tab('Page.captureScreenshot', { format: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: s.w, height: s.h, scale: 1 } });
            fs.writeFileSync(path.join(OUT, `${theme}-${shape}.jpg`), Buffer.from(shot.data, 'base64'));
            console.log(`${theme}-${shape}.jpg  (content ${fit})`);
        }
    } finally {
        await new Promise(r => { chrome.once('exit', r); chrome.kill(); });
        try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* ignore */ }
    }
})().catch(e => { console.error(e.message); process.exit(1); });
