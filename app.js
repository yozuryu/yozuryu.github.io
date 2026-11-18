// yozuryu.github.io: one page, five themes.
// This file loads the content once (data/site.json, plus live numbers from Savepoint next door), keeps it as one
// plain object, and hands it to the active theme. A theme is two files, themes/<id>.css and themes/<id>.js
// (`render(model, helpers)` returns the page's HTML), loaded on their own so themes never share styles.

const HUB = '/my-savepoint/';
const THEME_KEY = 'root_theme';              // prefixed: storage is shared with the project sites
const G = 'https://fonts.googleapis.com/css2?family=';
export const THEMES = [
    { id: 'starlit', name: 'Starlit Menu', bg: '#060b1c', sw: ['#0b1736', '#86dcff', '#ecd398'], fonts: 'Josefin+Sans:wght@300;400;600&family=Figtree:wght@400;500;600&family=Silkscreen' },
    { id: 'load',    name: 'Load Game',    bg: '#0b1416', sw: ['#13292b', '#6ff2c8', '#ffc857'], fonts: 'Oxanium:wght@500;700;800&family=Figtree:wght@400;500;600;700&family=Silkscreen' },
    { id: 'quest',   name: 'Quest Board',  bg: '#231711', sw: ['#4a2f20', '#f1e2bd', '#c8452e'], fonts: 'Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700&family=Silkscreen' },
    { id: 'stylish', name: 'Stylish',      bg: '#f3efe6', sw: ['#15131a', '#f3efe6', '#ff2e63'], fonts: 'Barlow+Condensed:ital,wght@0,800;1,800;1,900&family=Barlow:ital,wght@0,500;0,600;1,600&family=Permanent+Marker&family=Silkscreen' },
    { id: 'noah',    name: 'Home Camp',    bg: '#cfe6d3', sw: ['#f2eee3', '#f99f51', '#6b554a'], fonts: 'M+PLUS+Rounded+1c:wght@500;700;800;900' },
];
const DEFAULT = 'starlit';

// ── helpers handed to the themes ─────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'));
const short = (n) => (n == null ? '—' : n >= 10000 ? `${(n / 1000).toFixed(0)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const yy = (y) => String(y).slice(-2);
const helpers = { esc, num, short, yy };

const getJson = (url) => fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);
const getText = (url) => fetch(url).then(r => (r.ok ? r.text() : '')).catch(() => '');

// ── the model: everything a theme may show. Unknown values are null and themes print "—" ────────────
const model = {
    name: 'Yozuryu', title: '', avatar: './assets/avatar.png', motto: '', about: '',
    totals: { hours: null, unlocks: null, completed: null, beaten: null, games: null },
    plats: [],            // { id, name, icon, url, value, unit }
    projects: [],         // { id, name, kind, icon, shot, url, desc, facts, tags, open, alt, repo, reward, party, lv, pwr, saved }
    memory: null,         // { year, title, colour, partial, line, url, thumb, years: [{ year, colour, title, unlocks, url }] }
    playing: [],          // { name, cover, tall, pct, url }
    links: [],            // { name, url, icon, note }
};

// Year colours until the hub's years.json carries its list (a fallback only: the live file wins)
const YEAR_COLOURS = { 2015: '30, 212, 195', 2016: '143, 127, 253', 2017: '33, 202, 207', 2018: '255, 139, 137', 2019: '253, 186, 84', 2020: '224, 211, 2',
    2021: '11, 166, 254', 2022: '119, 138, 253', 2023: '253, 172, 116', 2024: '253, 142, 138', 2025: '253, 173, 115', 2026: '50, 162, 252' };

function fromSite(site) {
    Object.assign(model, { name: site.name, title: site.title, avatar: site.avatar, about: site.about });
    model.projects = (site.projects ?? []).map(p => ({
        id: p.id, name: p.name, kind: p.kind, icon: p.icon, shot: p.shot, url: p.url, desc: p.description, facts: p.facts ?? [], tags: p.tags ?? [],
        open: p.move ?? 'Open', alt: p.alt ?? (p.repo && { label: 'Source', url: p.repo }), repo: p.repo, reward: p.reward, party: p.party,
        changelog: p.changelog, lv: null, pwr: null, saved: null,
    }));
    model.links = (site.links ?? []).map(l => ({ name: l.name, url: l.url, icon: l.icon, note: l.note, platform: l.platform }));
}

async function loadStats() {
    const [ra, steam, xbox, config] = await Promise.all(['ra/profile', 'steam/profile', 'xbox/profile', 'hub/config'].map(f => getJson(`${HUB}data/${f}.json`)));
    if (!ra && !steam && !xbox) return;
    const results = ra?.gameAwardsAndProgress?.results ?? [];
    const st = steam?.stats ?? {}, xb = xbox?.stats ?? {};
    const mastered = results.filter(g => g.highestAwardKind === 'mastered').length;
    const minutes = results.reduce((n, g) => n + (g.playtime ?? 0), 0) + (st.totalPlaytimeMin ?? 0);
    model.totals = {
        hours: Math.round(minutes / 60),
        unlocks: results.reduce((n, g) => n + (g.numAwarded ?? 0), 0) + (st.unlockedAchievements ?? 0) + (xb.unlockedAchievements ?? 0),
        completed: mastered + (st.perfectCount ?? 0) + (xb.perfectCount ?? 0),
        beaten: results.filter(g => /^beaten/.test(g.highestAwardKind || '')).length,
        games: results.length + (st.totalGames ?? 0) + (xb.totalGames ?? 0),
    };
    if (config?.motto) model.motto = config.motto.charAt(0).toUpperCase() + config.motto.slice(1);
    const link = (p) => model.links.find(l => l.platform === p) ?? {};
    const shown = (k) => config?.platforms?.[k]?.visible !== false;
    model.plats = [
        ra && shown('retroachievements') && { id: 'ra', name: 'RetroAchievements', value: num(ra.coreProfile?.totalPoints), unit: 'pts', label: 'RA points', ...pick(link('ra')) },
        steam && shown('steam') && { id: 'steam', name: 'Steam', value: short(Math.round((st.totalPlaytimeMin ?? 0) / 60)), unit: 'h', label: 'Steam hours', ...pick(link('steam')) },
        xbox && shown('xbox') && { id: 'xbox', name: 'Xbox', value: num(xb.gamerscore), unit: 'G', label: 'Gamerscore', ...pick(link('xbox')) },
    ].filter(Boolean);
}
const pick = (l) => ({ icon: l.icon, url: l.url });

async function loadMemory() {
    const y = await getJson(`${HUB}memory-card/years.json`);
    if (!y?.latest) return;
    const list = y.list ?? y.years.map(year => ({ year, colour: YEAR_COLOURS[year] ?? '134, 220, 255' }));
    const last = list.find(x => x.year === y.latest.year) ?? {};
    const bits = [last.minutes ? `${num(Math.round(last.minutes / 60))} hours` : null, last.unlocks != null ? `${num(last.unlocks)} unlocks` : null,
        last.games != null ? `${num(last.games)} games` : null, last.finished ? `${num(last.finished)} finished` : null].filter(Boolean);
    model.memory = {
        year: y.latest.year, title: y.latest.title, colour: y.latest.colour, partial: y.latest.partial, line: bits.join(' · '),
        url: `${HUB}memory-card/`, thumb: `${HUB}memory-card/share/${y.latest.year}-story.jpg`,
        years: list.map(x => ({ year: x.year, colour: x.colour, title: x.title ?? '', unlocks: x.unlocks ?? null, url: `${HUB}memory-card/${x.year}/` })),
    };
}

// Lv = releases and PWR = logged changes in a project's public changelog; saved = its newest release date
async function loadChangelogs() {
    await Promise.all(model.projects.map(async p => {
        const md = p.changelog && await getText(p.changelog);
        if (!md) return;
        p.lv = (md.match(/^## v/gm) || []).length;
        p.pwr = (md.match(/^- /gm) || []).length;
        const v = md.match(/^## v(\d{2})\.(\d{2})\.(\d{2})/m);
        if (v) p.saved = new Date(2000 + +v[1], +v[2] - 1, +v[3]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }));
}

// The games in rotation, by Savepoint's own rule (its module, so the two never disagree)
async function loadPlaying() {
    try {
        const mod = await import(`${HUB}assets/playing.js`);
        const { games } = await mod.loadPlaying(getJson, HUB);
        model.playing = games.filter(g => g.group === 'playing').slice(0, 3).map(g => ({
            name: g.name, cover: g.cover ?? g.icon,
            tall: g.platform === 'steam' ? `https://cdn.akamai.steamstatic.com/steam/apps/${g.gameId}/library_600x900.jpg` : (g.icon ?? g.cover),
            pct: g.progress?.total ? Math.round(g.progress.unlocked / g.progress.total * 100) : null,
            url: `${HUB}activity/?view=playing`,
        }));
    } catch { /* no hub next door (local dev): the section stays hidden */ }
}

// ── themes ───────────────────────────────────────────────────────────────────
const root = document.getElementById('root');
const cssEl = document.getElementById('theme-css');
const cache = {};
let active = null;

function loadTheme(id) {
    const t = THEMES.find(x => x.id === id) ?? THEMES[0];
    cache[t.id] ??= Promise.all([import(`./themes/${t.id}.js`), getText(`./themes/${t.id}.css`)]).then(([mod, css]) => ({ t, mod, css }));
    if (!document.querySelector(`link[data-fonts="${t.id}"]`)) {
        const l = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `${G}${t.fonts}&display=swap` });
        l.dataset.fonts = t.id;
        document.head.append(l);
    }
    return cache[t.id];
}

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = () => matchMedia('(max-width: 900px)').matches;

// Every change of the page goes through here. Where the browser has view transitions the old page is held as a
// picture while `change` runs, then the new one comes in: `kind` picks the animation in root.css ("theme" = a
// circle opening from the switcher, "data" = a short cross-fade). Elsewhere, and with reduced motion, it just changes.
function paint(kind, change) {
    if (!document.startViewTransition || calm()) { change(); return; }
    const html = document.documentElement;
    html.dataset.vt = kind;
    const t = document.startViewTransition(change);
    t.finished.finally(() => { if (html.dataset.vt === kind) delete html.dataset.vt; });
}

let inTimer = 0;
async function setTheme(id, { save = false, first = false } = {}) {
    const next = await loadTheme(id);
    const html = document.documentElement;
    const btn = sw.querySelector('.rt-btn')?.getBoundingClientRect();      // the circle opens from the Theme button
    html.style.setProperty('--rx', `${btn ? btn.left + btn.width / 2 : innerWidth - 60}px`);
    html.style.setProperty('--ry', `${btn ? btn.top + btn.height / 2 : innerHeight - 34}px`);
    const change = () => {
        active = next;
        cssEl.textContent = next.css;              // styles and markup change in the same frame
        html.dataset.theme = next.t.id;
        html.style.background = next.t.bg;
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next.t.bg);
        activeGo = null;
        draw();
        window.scrollTo(0, 0);
        drawSwitch();
        // the pieces of the new page rise in one after another; the class is dropped so a later redraw doesn't replay it
        root.classList.remove('rt-in'); void root.offsetWidth; root.classList.add('rt-in');
        clearTimeout(inTimer); inTimer = setTimeout(() => root.classList.remove('rt-in'), 1100);
    };
    if (first) change(); else paint('theme', change);
    if (save) { try { localStorage.setItem(THEME_KEY, next.t.id); } catch { /* private mode */ } }
}

let queued = false;
function redraw() {                            // several loaders finishing together make one redraw
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; root.classList.remove('rt-in'); paint('data', draw); });
}
function draw() {
    if (!active) return;
    root.innerHTML = active.mod.render(model, helpers);
    document.body.dataset.ready = '1';
    if (activeGo) mark(activeGo, false);
    spy();
}

// ── section menus inside a theme ─────────────────────────────────────────────
// <a data-go="memory"> lights itself and brings #memory into view; while the page scrolls, the entry of the section
// on screen is the lit one (the menus are pinned on phones). The lit entry survives a redraw.
let activeGo = null, spyOn = null, spyHold = 0;
function mark(id, follow = true) {
    activeGo = id;
    root.querySelectorAll('[data-go]').forEach(x => {
        const on = x.dataset.go === id;
        x.classList.toggle('on', on);
        const bar = x.parentElement;
        if (on && follow && bar.scrollWidth > bar.clientWidth + 4) {       // a menu that scrolls sideways keeps its lit entry in view
            bar.scrollTo({ left: x.offsetLeft - (bar.clientWidth - x.offsetWidth) / 2, behavior: calm() ? 'auto' : 'smooth' });
        }
    });
}
function spy() {
    spyOn?.disconnect();
    const targets = [...new Set([...root.querySelectorAll('[data-go]')].map(x => x.dataset.go))].map(id => document.getElementById(id)).filter(Boolean);
    if (!targets.length || !('IntersectionObserver' in window)) return;
    const seen = new Map();
    spyOn = new IntersectionObserver((entries) => {
        entries.forEach(e => seen.set(e.target.id, e.isIntersecting));
        if (Date.now() < spyHold) return;                                   // a tap decides for a moment, not the scroll it causes
        if (atBottom()) return;                                             // the bottom of the page belongs to the last section (below)
        // several sections can be in the band at once: the one that entered last (lowest on screen) is the one being read
        const cur = targets.filter(t => seen.get(t.id)).sort((x, y) => y.getBoundingClientRect().top - x.getBoundingClientRect().top)[0];
        if (cur && cur.id !== activeGo && scrollY > 8) mark(cur.id);
    }, { rootMargin: '-25% 0px -60% 0px' });
    targets.forEach(t => spyOn.observe(t));
    spyLast = targets.sort((x, y) => x.getBoundingClientRect().top - y.getBoundingClientRect().top).at(-1)?.id ?? null;
}
// The last section may be too short to ever reach the band: at the very bottom of the page it is the one
let spyLast = null, spyTick = false;
const atBottom = () => scrollY > 8 && innerHeight + scrollY >= document.documentElement.scrollHeight - 6;
addEventListener('scroll', () => {
    if (spyTick) return;
    spyTick = true;
    requestAnimationFrame(() => {
        spyTick = false;
        if (spyLast && Date.now() >= spyHold && atBottom() && activeGo !== spyLast) mark(spyLast);
    });
}, { passive: true });

root.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (!go) return;
    const target = document.getElementById(go.dataset.go);
    if (!target) return;
    e.preventDefault();
    spyHold = Date.now() + 900;
    mark(go.dataset.go);
    target.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: phone() ? 'start' : 'nearest' });
    target.classList.remove('hit'); void target.offsetWidth; target.classList.add('hit');
});

// ── the switcher ─────────────────────────────────────────────────────────────
const sw = document.getElementById('switch');
let open = false;
function drawSwitch() {
    const cur = active?.t ?? THEMES[0];
    sw.innerHTML = `
        <div class="rt-shade" ${open ? '' : 'hidden'}></div>
        <div class="rt-menu" role="menu" aria-label="Theme" ${open ? '' : 'hidden'}>
            <div class="rt-head">Theme</div>
            ${THEMES.map(t => `<button class="rt-opt" role="menuitemradio" aria-checked="${t.id === cur.id}" data-theme-id="${t.id}">
                <span class="rt-sw" style="background:linear-gradient(135deg, ${t.sw[0]} 0 50%, ${t.sw[1]} 50% 78%, ${t.sw[2]} 78%)"></span>${esc(t.name)}</button>`).join('')}
        </div>
        <button class="rt-btn" aria-haspopup="menu" aria-expanded="${open}" title="Change theme (T)">
            <span class="rt-dots">${cur.sw.map(c => `<i style="background:${c}"></i>`).join('')}</span>Theme</button>`;
}
const toggle = (to = !open) => { open = to; drawSwitch(); if (open) sw.querySelector('[aria-checked="true"]')?.focus(); };
sw.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-theme-id]');
    if (opt) {            // the list folds away first, then the new theme opens from the button
        const id = opt.dataset.themeId;
        toggle(false);
        loadTheme(id);
        setTimeout(() => setTheme(id, { save: true }), calm() ? 0 : 180);
        return;
    }
    if (e.target.closest('.rt-btn')) toggle();
    else if (e.target.closest('.rt-shade')) toggle(false);
});
sw.addEventListener('pointerover', (e) => { const o = e.target.closest('[data-theme-id]'); if (o) loadTheme(o.dataset.themeId); });   // warm it up
// composedPath, not contains(): the switcher redraws itself on a click, so the clicked node is already gone from it
document.addEventListener('click', (e) => { if (open && !e.composedPath().includes(sw)) toggle(false); });
document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === 'Escape' && open) { toggle(false); sw.querySelector('.rt-btn')?.focus(); }
    else if (e.key === 't' || e.key === 'T') toggle();
    else if (open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        const opts = [...sw.querySelectorAll('.rt-opt')];
        const i = opts.indexOf(document.activeElement);
        opts[(i + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length]?.focus();
    }
});

// ── start ────────────────────────────────────────────────────────────────────
const wanted = document.documentElement.dataset.theme || DEFAULT;      // set before first paint in index.html
const [site] = await Promise.all([getJson('./data/site.json'), loadTheme(wanted)]);
if (site) fromSite(site);
drawSwitch();
// The first picture waits a moment for the live data, so the page arrives whole instead of growing piece by piece.
// Whatever is later than that fades in when it lands.
const loads = [loadStats, loadMemory, loadChangelogs, loadPlaying].map(load => load().catch(() => {}));
let painted = false;
loads.forEach(l => l.then(() => { if (painted) redraw(); }));
await Promise.race([Promise.all(loads), new Promise(r => setTimeout(r, 900))]);
await setTheme(wanted, { first: true });
painted = true;
