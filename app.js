import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// Landing page, styled as a game pause menu (see STYLE.md / assets/noah-ui.css).
// Content: data/site.json. Live numbers: Gaming Hub's public data (same origin).

const TABS = [
    { id: 'player',  label: 'Player' },
    { id: 'creations', label: 'Creations' },
    { id: 'data',    label: 'Play Data' },
    { id: 'links',   label: 'Links' },
];
const INTRO_KEY = 'root_intro_seen';          // prefixed: storage is shared with the project sites
const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'));
const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
};
const getJson = (url) => fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);
const reducedMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

// Numbers count up from 0 like a game results screen — once per page visit per
// counter (`id`), so reopening a tab shows the final value straight away.
const countedUp = new Set();
const useCountUp = (id, target, ms = 600) => {
    const skip = () => typeof target !== 'number' || countedUp.has(id) || reducedMotion();
    const [v, setV] = useState(() => (skip() ? target : 0));
    useEffect(() => {
        if (skip()) { setV(target); return; }
        countedUp.add(id);
        let raf, start;
        const step = (t) => {
            start ??= t;
            const k = Math.min(1, (t - start) / ms);
            setV(k < 1 ? Math.round(target * (1 - Math.pow(1 - k, 3))) : target);   // ease-out cubic
            if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [id, target, ms]);
    return v;
};
const CountUp = ({ id, value }) => fmt(useCountUp(id, value));

// ── Data ─────────────────────────────────────────────────────────────────────

// Level / PWR / release span for a creation, derived from its public changelog:
// Lv = number of releases, PWR = number of logged changes, first/latest = oldest/newest vYY.MM.DD.
const useChangelogStats = (projects) => {
    const [stats, setStats] = useState({});
    useEffect(() => {
        (projects || []).forEach(p => {
            if (!p.changelog) return;
            fetch(p.changelog).then(r => (r.ok ? r.text() : '')).then(md => {
                if (!md) return;
                const releases = (md.match(/^## v/gm) || []).length;
                const changes  = (md.match(/^- /gm) || []).length;
                const versions = [...md.matchAll(/^## v(\d{2})\.(\d{2})\.(\d{2})/gm)];
                const toDate = (m) => m && new Date(2000 + +m[1], +m[2] - 1, +m[3]);
                setStats(s => ({ ...s, [p.id]: { releases, changes, latest: toDate(versions[0]), first: toDate(versions[versions.length - 1]) } }));
            }).catch(() => {});
        });
    }, [projects]);
    return stats;
};

// Headline numbers from Gaming Hub's data files.
const useGamingStats = () => {
    const [s, setS] = useState(null);
    useEffect(() => {
        Promise.all([
            getJson('/gaming-hub/data/ra/profile.json'),
            getJson('/gaming-hub/data/steam/profile.json'),
            getJson('/gaming-hub/data/xbox/profile.json'),
            getJson('/gaming-hub/data/hub/config.json'),
        ]).then(([ra, steam, xbox, config]) => {
            const results = ra?.gameAwardsAndProgress?.results ?? [];
            const raAch   = results.reduce((a, g) => a + (g.numAwarded ?? 0), 0);
            const st = steam?.stats ?? {}, xb = xbox?.stats ?? {};
            setS({
                raPoints:    ra?.coreProfile?.totalPoints ?? null,
                raMastered:  ra ? results.filter(g => g.highestAwardKind === 'mastered').length : null,
                raBeaten:    ra ? results.filter(g => /^beaten/.test(g.highestAwardKind || '')).length : null,
                steamHours:  st.totalPlaytimeHrs ?? null,
                steamPerfect: st.perfectCount ?? null,
                gamerscore:  xb.gamerscore ?? null,
                achievements: (ra || steam || xbox) ? raAch + (st.unlockedAchievements ?? 0) + (xb.unlockedAchievements ?? 0) : null,
                games:       (ra || steam || xbox) ? results.length + (st.totalGames ?? 0) + (xb.totalGames ?? 0) : null,
                raAchievements:   ra ? raAch : null,
                raUser:           ra?.coreProfile?.user ?? null,
                steamAchievements: st.unlockedAchievements ?? null,
                steamUser:        steam?.profile?.displayName ?? null,
                xboxAchievements: xb.unlockedAchievements ?? null,
                xboxCompleted:    xb.perfectCount ?? null,
                xboxUser:         xbox?.profile?.gamertag ?? null,
                completions: (ra || steam || xbox) ? (results.filter(g => g.highestAwardKind === 'mastered').length + (st.perfectCount ?? 0) + (xb.perfectCount ?? 0)) : null,
                profiles:    { ra, steam, xbox },   // raw, for the Play Data result screen
                motto:       config?.motto ?? null,
                genres:      config?.tags?.genre ?? [],
                styles:      config?.tags?.style ?? [],
            });
        });
    }, []);
    return s;
};

// ── Small pieces ─────────────────────────────────────────────────────────────

const Stars = ({ n }) => '★'.repeat(n || 0);

const monthYear = (d) => (d ? d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—');
// A creation is "new" (red ! on its pedestal, like the game's NEW marker) for 14 days after a release.
const isNew = (st) => !!st?.latest && (Date.now() - st.latest.getTime()) < 14 * 864e5;

// Footer button hint. `glyph` may be an array for combos, e.g. ['Q', 'E'] → "Q / E".
const Hint = ({ glyph, children, onClick, href }) => {
    const glyphs = [].concat(glyph);
    const inner = <>
        {glyphs.map((g, i) => <React.Fragment key={g}>{i > 0 && <span className="nu-hint__sep">/</span>}<span className="nu-glyph">{g}</span></React.Fragment>)}
        {children}
    </>;
    return href
        ? <a className="nu-hint" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{inner}</a>
        : <button className="nu-hint" onClick={onClick}>{inner}</button>;
};

// ── Tabs ─────────────────────────────────────────────────────────────────────

// Creations: each project shown as a crafted item. Pedestals on the left pick one (the
// Statue screen), the right panel shows it like an item-get card: glow burst, Lv 1 ▸ n,
// materials as item slots, effects as a numbered list, screenshots, Open / Source.
const CreationsTab = ({ site, selected, setSelected, clStats }) => {
    const projects = site.projects;
    const p = projects[selected] ?? projects[0];
    const [{ page, dir }, setView] = useState({ page: 0, dir: null });
    useEffect(() => setView({ page: 0, dir: null }), [selected]);
    const setPage = (i, d) => setView({ page: i, dir: d ?? (i > page ? 'right' : 'left') });
    const previews = p?.previews ?? [];
    const st = clStats[p?.id];
    const locked = site.lockedSlots ?? 0;

    return (
        <>
            <p className="nu-heading">Choose a creation to inspect.</p>
            <div className="creations-grid">
                <section className="nu-section creations-display">
                    <div className="nu-section__header">Display</div>
                    <div className="nu-section__body display-grid">
                        {projects.map((proj, i) => (
                            <button key={proj.id} className={`nu-pedestal${i === selected ? ' is-selected' : ''}`} onClick={() => setSelected(i)} aria-pressed={i === selected}>
                                {isNew(clStats[proj.id]) && <span className="nu-new" title="New release in the last 2 weeks">!</span>}
                                <span className="nu-pedestal__item"><img src={proj.icon} alt="" /></span>
                                <span className="nu-pedestal__stand" />
                                <span className="nu-pedestal__name">{proj.name}</span>
                                <span className="nu-pedestal__lv">Lv {clStats[proj.id]?.releases ?? '—'}</span>
                            </button>
                        ))}
                        {Array.from({ length: locked }, (_, i) => (
                            <div key={`l${i}`} className="nu-pedestal nu-pedestal--locked" aria-label="Locked: coming soon">
                                <span className="nu-pedestal__item">?</span>
                                <span className="nu-pedestal__stand" />
                                <span className="nu-pedestal__name">???</span>
                            </div>
                        ))}
                    </div>
                </section>

                {p && (
                    <section className="nu-section creations-details">
                        <div className="nu-section__header">
                            <span className={`nu-card__el${p.element === 'red' ? ' nu-card__el--red' : ''}`} style={{ position: 'static', width: 26, height: 26 }} />
                            {p.name} <span style={{ color: '#ffd84a' }}><Stars n={p.stars} /></span>
                        </div>
                        <div key={p.id} className="nu-section__body creation-body nu-rise">
                            <div className="creation-head">
                                <div className="nu-burst">
                                    <span className="nu-burst__spark">✦</span><span className="nu-burst__spark">✦</span><span className="nu-burst__spark">✦</span>
                                    <img src={p.icon} alt="" />
                                </div>
                                <div className="creation-facts">
                                    <span className="nu-progress" aria-label={`Level ${st?.releases ?? ''}`}>Lv 1<span className="nu-progress__arrow">▸</span><span className="nu-progress__to">{st?.releases ?? '—'}</span></span>
                                    <div className="nu-stats">
                                        <span className="nu-stat">PWR<b>{st ? fmt(st.changes) : '—'}</b></span>
                                        <span className="nu-stat">Since<b>{monthYear(st?.first)}</b></span>
                                        <span className="nu-stat">Latest<b>{monthYear(st?.latest)}</b></span>
                                    </div>
                                    <a className="nu-move detail-move" href={p.url}><span className="nu-glyph">A</span>{p.move}</a>
                                </div>
                            </div>
                            {p.description && <p className="nu-desc creation-flavor">{p.description}</p>}
                            {p.materials?.length > 0 && <>
                                <span className="nu-bar">Materials</span>
                                <div className="nu-slots">
                                    {p.materials.map(m => (
                                        <span key={m.name} className="nu-slot-item">
                                            <span className="nu-slot-item__box"><img src={m.icon} alt="" /></span>
                                            {m.name}
                                        </span>
                                    ))}
                                </div>
                            </>}
                            {p.effects?.length > 0 && <>
                                <span className="nu-bar">Effects</span>
                                <ol className="nu-effects">{p.effects.map(e => <li key={e}>{e}</li>)}</ol>
                            </>}
                        </div>
                    </section>
                )}

                {p && previews.length > 0 && (
                    <section className="nu-section creations-preview">
                        <div className="nu-section__header">Preview</div>
                        <div key={p.id} className="nu-section__body nu-rise">
                            {previews.length > 0 && (
                                <div className="detail-preview">
                                    <div className="detail-preview__frame">
                                        <img key={page} className={`nu-preview${dir ? ` nu-enter nu-enter--from-${dir}` : ''}`} src={previews[page]} alt={`${p.name} screenshot`} />
                                    </div>
                                    {previews.length > 1 && <button className="nu-pager" aria-label="Next screenshot" onClick={() => setPage((page + 1) % previews.length, 'right')} />}
                                </div>
                            )}
                            {previews.length > 1 && (
                                <div className="nu-dots">
                                    {previews.map((_, i) => (
                                        <button key={i} className={`nu-dot${i === page ? ' is-active' : ''}`} aria-label={`Screenshot ${i + 1}`} onClick={() => setPage(i)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
};

// Player: a character status screen (after the game's Anima screen + Astral House detail):
// portrait with name plate and title ribbon; Status, Background and Traits boxes; favorites shelf.
const PF_NAME = { ra: 'RA', steam: 'Steam', xbox: 'Xbox' };
const PlayerTab = ({ site, gs }) => {
    const recent = useRecentUnlocks();
    const ra = gs?.profiles?.ra;
    const since = toDate(ra?.coreProfile?.memberSince);
    const rank = ra?.userSummary?.rank, ranked = ra?.userSummary?.totalRanked;
    const mainPf = recent && Object.entries(recent.recentBy).sort((a, b) => b[1] - a[1])[0];
    const traits = [...(gs?.genres ?? []), ...(gs?.styles ?? [])];
    return (
        <>
            <p className="nu-heading">Player profile</p>
            <div className="player-grid">
                <div className="nu-render player-render">
                    <span className="nu-render__stars">★★★</span>
                    <span className="nu-render__pwr"><span>PWR</span><b>{fmt(gs?.achievements)}</b></span>
                    <div className="player-avatar"><img src={site.avatar} alt={site.name} /></div>
                    <span className="nu-render__plate">{site.name}</span>
                    {site.title && <span className="nu-ribbon-flag player-title">{site.title}</span>}
                </div>
                <div className="player-sections nu-stagger">
                    <section className="nu-section">
                        <div className="nu-section__header">Status</div>
                        <div className="nu-section__body">
                            <div className="nu-stats player-stats">
                                <span className="nu-stat">Adventuring since<b>{since ? monthYear(since) : '—'}</b></span>
                                <span className="nu-stat" title={rank ? `#${fmt(rank)} of ${fmt(ranked)} on RetroAchievements` : ''}>RA rank<b>{rank && ranked ? `Top ${(rank / ranked * 100).toFixed(1)}%` : '—'}</b></span>
                                <span className="nu-stat" title="Platform with the most unlocks in the last 3 months">Main platform<b>{mainPf && mainPf[1] > 0 ? PF_NAME[mainPf[0]] : '—'}</b></span>
                            </div>
                        </div>
                    </section>
                    <section className="nu-section">
                        <div className="nu-section__header">Background</div>
                        <div className="nu-section__body player-info">
                            <p className="nu-desc" style={{ marginTop: 0 }}>{site.about}</p>
                            {gs?.motto && <p className="player-motto">“{gs.motto}”</p>}
                        </div>
                    </section>
                    {traits.length > 0 && (
                        <section className="nu-section">
                            <div className="nu-section__header">Traits</div>
                            <div className="nu-section__body"><ul className="nu-traits">{traits.map(t => <li key={t}>{t}</li>)}</ul></div>
                        </section>
                    )}
                </div>
            </div>
            {site.favorites?.length > 0 && (
                <section className="nu-section player-favorites">
                    <div className="nu-section__header">All-time Favorites</div>
                    <div className="nu-section__body nu-covers nu-stagger">
                        {site.favorites.map(f => (
                            <a key={f.name} className="nu-cover" href={f.url} target="_blank" rel="noreferrer" title={f.name}>
                                <img className="nu-cover__art" src={f.cover} alt={f.name} />
                                <span className="nu-cover__name">{f.name}</span>
                                <span className="nu-cover__pf">{f.platform}</span>
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
};

// ── Play Data: a result screen ───────────────────────────────────────────────
// After the game's Result screen (リザルト): parchment sheet, a dark banner with the month's
// gain, an info card (now playing / streak), and item tiles (games this month, platforms).
const RA_MEDIA = 'https://media.retroachievements.org';
const PF_ICON = { ra: './assets/links/retroachievements.png', steam: './assets/links/steam.png', xbox: './assets/links/xbox.png' };
const EDS_WIDTHS = [64, 128, 150, 200, 208, 300, 424];
const xboxImg = (url, w) => !url ? url
    : url.includes('store-images.s-microsoft.com') ? `${url}${url.includes('?') ? '&' : '?'}w=${w}`
    : url.includes('images-eds') ? `${url}&w=${EDS_WIDTHS.find(x => x >= w) ?? 424}` : url;
// RA dates are UTC "YYYY-MM-DD HH:MM:SS" without a zone; Steam/Xbox are ISO.
const toDate = (v) => (v ? new Date(/^\d{4}-\d{2}-\d{2} \d/.test(v) ? v.replace(' ', 'T') + 'Z' : v) : null);
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const ago = (d) => {
    if (!d) return '';
    const m = Math.round((Date.now() - d) / 60000);
    if (m < 60) return `${Math.max(1, m)} min ago`;
    if (m < 1440) return `${Math.round(m / 60)} h ago`;
    const days = Math.round(m / 1440);
    return days === 1 ? 'yesterday' : days < 30 ? `${days} days ago` : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Last 91 days of unlocks from all platforms (Gaming Hub's chunk 1 files), fetched once when
// the tab first opens: gives "unlocked this month" and the current streak in local days.
let recentCache = null;
const useRecentUnlocks = () => {
    const [dates, setDates] = useState(recentCache);
    useEffect(() => {
        if (recentCache) return;
        Promise.all(['ra', 'steam', 'xbox'].map(pf => getJson(`/gaming-hub/data/${pf}/achievements/1.json`)))
            .then(files => {
                recentCache = files.flatMap((f, i) => (f?.recentAchievements ?? []).map(a => ({
                    pf: ['ra', 'steam', 'xbox'][i], at: toDate(a.date || a.unlockedAt),
                    id: String(a.appId ?? a.titleId ?? a.gameId ?? ''), apiName: a.apiName,
                    game: a.gameName ?? a.gameTitle, raIcon: a.gameIcon,
                }))).filter(u => u.at);
                setDates(recentCache);
            });
    }, []);
    return useMemo(() => {
        if (!dates) return null;
        const now = new Date();
        const inMonth = dates.filter(u => u.at.getFullYear() === now.getFullYear() && u.at.getMonth() === now.getMonth());
        const thisMonth = inMonth.length;
        const monthBy = { ra: 0, steam: 0, xbox: 0 };
        inMonth.forEach(u => { monthBy[u.pf]++; });
        const days = new Set(dates.map(u => dayKey(u.at)));
        const cur = new Date(now);
        if (!days.has(dayKey(cur))) cur.setDate(cur.getDate() - 1);   // a quiet today doesn't break the streak yet
        let streak = 0;
        while (days.has(dayKey(cur))) { streak++; cur.setDate(cur.getDate() - 1); }
        const recentBy = { ra: 0, steam: 0, xbox: 0 };   // last 91 days, for the Player tab's main platform
        dates.forEach(u => { recentBy[u.pf]++; });
        return { thisMonth, monthBy, recentBy, streak, unlocks: dates };
    }, [dates]);
};

// Steam / Xbox games beaten this month. A game is beaten when its hand-picked win
// condition is met (Gaming Hub's win-conditions.json): "or" = any listed achievement, dated by the
// first one; "and" = all of them, dated by the last. Only games with a listed achievement unlocked
// in the window are checked, reading exact unlock times from that game's own file.
const monthStart = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).getTime(); };
let beatenCache = null;
const useRecentBeaten = (unlocks) => {
    const [beaten, setBeaten] = useState(beatenCache);
    useEffect(() => {
        if (beatenCache || !unlocks) return;
        Promise.all(['steam', 'xbox'].map(pf => getJson(`/gaming-hub/data/${pf}/win-conditions.json`))).then(async ([steamWc, xboxWc]) => {
            const wc = { steam: steamWc ?? {}, xbox: xboxWc ?? {} };
            const since = monthStart();
            const candidates = [...new Set(unlocks
                .filter(u => (u.pf === 'steam' || u.pf === 'xbox') && u.at >= since && wc[u.pf][u.id]?.achievements?.includes(u.apiName))
                .map(u => `${u.pf}:${u.id}`))];
            const found = await Promise.all(candidates.map(async key => {
                const [pf, id] = key.split(':');
                const game = await getJson(`/gaming-hub/data/${pf}/games/${id}.json`);
                const rule = wc[pf][id];
                const times = rule.achievements.map(api => game?.achievements?.find(a => a.apiName === api)).map(a => (a?.unlocked && a.unlockedAt ? toDate(a.unlockedAt) : null));
                const at = rule.mode === 'and'
                    ? (times.every(Boolean) ? new Date(Math.max(...times)) : null)
                    : (times.some(Boolean) ? new Date(Math.min(...times.filter(Boolean))) : null);
                if (!at || at < since) return null;
                return { key: `${pf}-${id}`, name: game.gameName, at, pf, count: game.unlocked, tier: 'silver',
                         icon: pf === 'steam' ? game.iconUrl : xboxImg(game.iconUrl, 128) };
            }));
            beatenCache = found.filter(Boolean);
            setBeaten(beatenCache);
        });
    }, [unlocks]);
    return beaten ?? [];
};

const DataTab = ({ site, gs }) => {
    const recent = useRecentUnlocks();
    const beatenElsewhere = useRecentBeaten(recent?.unlocks);
    const { ra, steam, xbox } = gs?.profiles ?? {};

    // Now playing: the most recently played game across the three platforms.
    const nowPlaying = useMemo(() => {
        const r = ra?.recentlyPlayedGames?.[0], s = steam?.mostRecentGame, x = xbox?.mostRecentGame;
        return [
            r && { name: r.title, where: `RetroAchievements · ${r.consoleName}`, at: toDate(r.lastPlayed), done: r.numAchieved, total: r.numPossibleAchievements },
            s && { name: s.name, where: 'Steam', at: toDate(s.lastPlayedTs), done: s.achUnlocked, total: s.achTotal },
            x && { name: x.name, where: 'Xbox', at: toDate(x.lastPlayedTs), done: x.achUnlocked, total: x.achTotal },
        ].filter(g => g?.at).sort((a, b) => b.at - a.at)[0] ?? null;
    }, [ra, steam, xbox]);

    // Games this month: every game with an unlock this calendar month, grouped per game and ordered
    // by its latest unlock (newest first). ×N = that game's unlocks this month; the tiles add up to
    // the banner's +n. Gold rim = completed this month, silver = beaten this month.
    // Steam and Xbox icons aren't in the unlock files. Steam: the game's square store icon, from
    // profile.json when the game is there (recently played, perfect games), else from its own file.
    // Xbox: the games index.
    const [xboxIcons, setXboxIcons] = useState(null);
    const [steamIcons, setSteamIcons] = useState(null);
    const monthUnlocks = useMemo(() => (recent?.unlocks ?? []).filter(u => u.at >= monthStart()), [recent]);
    useEffect(() => {
        if (xboxIcons || !monthUnlocks.some(u => u.pf === 'xbox')) return;
        getJson('/gaming-hub/data/xbox/games/index.json').then(d => setXboxIcons(Object.fromEntries(
            Object.entries(d?.achievementProgress ?? {}).map(([id, g]) => [id, xboxImg(g.iconUrl, 128)]))));
    }, [monthUnlocks, xboxIcons]);
    useEffect(() => {
        if (steamIcons || !steam) return;
        const ids = [...new Set(monthUnlocks.filter(u => u.pf === 'steam').map(u => String(u.id)))];
        if (!ids.length) return;
        const known = Object.fromEntries([...(steam.recentlyPlayed ?? []), ...(steam.perfectGames ?? [])]
            .filter(g => g.iconUrl).map(g => [String(g.appId), g.iconUrl]));
        Promise.all(ids.map(async id => [id, known[id] ?? (await getJson(`/gaming-hub/data/steam/games/${id}.json`))?.iconUrl ?? null]))
            .then(pairs => setSteamIcons(Object.fromEntries(pairs)));
    }, [monthUnlocks, steam, steamIcons]);
    const monthGames = useMemo(() => {
        const start = monthStart();
        const tier = {};   // pf-id → 'gold' | 'silver'
        (ra?.pageAwards?.visibleUserAwards ?? []).forEach(a => {
            if (toDate(a.awardedAt) < start) return;
            if (a.awardType === 'Mastery/Completion') tier[`ra-${a.awardData}`] = 'gold';
            else if (a.awardType === 'Game Beaten' && !tier[`ra-${a.awardData}`]) tier[`ra-${a.awardData}`] = 'silver';
        });
        (steam?.perfectGames ?? []).forEach(g => { if (toDate(g.completedAt) >= start) tier[`steam-${g.appId}`] = 'gold'; });
        (xbox?.perfectGames ?? []).forEach(g => { if (toDate(g.completedAt) >= start) tier[`xbox-${g.titleId}`] = 'gold'; });
        beatenElsewhere.forEach(b => { if (!tier[b.key]) tier[b.key] = 'silver'; });
        const games = {};
        monthUnlocks.forEach(u => {
            const key = `${u.pf}-${u.id}`;
            const g = games[key] ??= { key, pf: u.pf, id: u.id, name: u.game, count: 0, last: u.at,
                icon: u.pf === 'ra' ? RA_MEDIA + u.raIcon : null };
            g.count++;
            if (u.at > g.last) g.last = u.at;
        });
        return Object.values(games).map(g => ({ ...g, tier: tier[g.key] ?? null })).sort((a, b) => b.last - a.last);
    }, [monthUnlocks, ra, steam, xbox, beatenElsewhere]);
    const MAX_TILES = 12;
    const shownGames = monthGames.length > MAX_TILES ? monthGames.slice(0, MAX_TILES - 1) : monthGames;
    const moreGames = monthGames.length - shownGames.length;

    const allPlatforms = [
        { id: 'ra',    name: 'RetroAchievements', value: gs?.raPoints,   unit: 'pts', href: '/gaming-hub/profile/ra/' },
        { id: 'steam', name: 'Steam',             value: gs?.steamHours, unit: 'h',   href: '/gaming-hub/profile/steam/' },
        { id: 'xbox',  name: 'Xbox',              value: gs?.gamerscore, unit: 'G',   href: '/gaming-hub/profile/xbox/' },
    ];
    const platforms = recent ? allPlatforms.filter(pf => recent.monthBy[pf.id] > 0) : allPlatforms;   // only platforms played this month

    return (
        <>
            <p className="nu-heading">Latest results across all platforms.</p>
            <div className="nu-result">
                <div className="nu-result__title">RESULTS</div>
                <div className="nu-result__top">
                    <span className="nu-counter" title="Completed games (RA mastered, Steam perfect, Xbox completed)"><span className="nu-counter__icon">★</span><CountUp id="res:completions" value={gs?.completions} /></span>
                </div>

                <div className="nu-result-banner">
                    <img className="nu-result-banner__art" src={site.avatar} alt="" />
                    <span className="nu-ribbon-flag">Unlocked this month</span>
                    <span className="nu-gain">+<CountUp id="res:month" value={recent?.thisMonth} /></span>
                    <span className="nu-counter" title="Achievements unlocked, all platforms"><i className="nu-key" /><CountUp id="res:total" value={gs?.achievements} /></span>
                </div>

                <div className="results-grid">
                    <div className="nu-info">
                        <span className="nu-info__label">Now playing</span>
                        <span className="nu-info__value">{nowPlaying?.name ?? '—'}</span>
                        {nowPlaying && <span className="nu-info__sub">{nowPlaying.where} · {ago(nowPlaying.at)}{nowPlaying.total ? ` · ${nowPlaying.done}/${nowPlaying.total}` : ''}</span>}
                        <span className="nu-info__label">Streak</span>
                        <span className="nu-info__value">{recent ? `${recent.streak} day${recent.streak === 1 ? '' : 's'}` : '—'}</span>
                        <span className="nu-info__sub">in a row with an unlock</span>
                        <span className="nu-info__label">Games tracked</span>
                        <span className="nu-info__value">{fmt(gs?.games)}</span>
                    </div>
                    <div className="results-sections">
                        <span className="nu-info__label">Games this month</span>
                        {recent && monthGames.length === 0 && <p className="nu-desc results-empty">No unlocks yet this month.</p>}
                        <div className="nu-tiles nu-stagger">
                            {shownGames.map(g => (
                                <span key={g.key} className={`nu-tile${g.tier ? ` nu-tile--${g.tier}` : ''}`}
                                      title={`${g.name} — ${g.count} unlock${g.count === 1 ? '' : 's'} this month${g.tier === 'gold' ? ', completed' : g.tier === 'silver' ? ', beaten' : ''}`}>
                                    <span className="nu-tile__box">
                                        {(g.icon ?? (g.pf === 'steam' ? steamIcons : xboxIcons)?.[g.id]) ? <img src={g.icon ?? (g.pf === 'steam' ? steamIcons : xboxIcons)[g.id]} alt={g.name} /> : null}
                                        <img className="nu-tile__pf" src={PF_ICON[g.pf]} alt="" />
                                        <span className="nu-tile__badge">×{g.count}</span>
                                    </span>
                                    <span className="nu-tile__count">{g.last.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                </span>
                            ))}
                            {moreGames > 0 && (
                                <a className="nu-tile" href="/gaming-hub/activity/" title="See all of this month's activity on Gaming Hub">
                                    <span className="nu-tile__box nu-tile__box--more">+{moreGames}</span>
                                    <span className="nu-tile__count">more</span>
                                </a>
                            )}
                        </div>
                        <span className="nu-info__label">Platforms</span>
                        <div className="nu-tiles nu-stagger">
                            {platforms.map(pf => (
                                <a key={pf.name} className="nu-tile" href={pf.href} title={`${pf.name} on Gaming Hub`}>
                                    <span className="nu-tile__box nu-tile__box--logo">
                                        <img src={PF_ICON[pf.id]} alt={pf.name} />
                                        {recent && <span className="nu-tile__badge">+{recent.monthBy[pf.id]}</span>}
                                    </span>
                                    <span className="nu-tile__count"><CountUp id={`res:${pf.unit}`} value={pf.value} /> {pf.unit}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Records: where to find me elsewhere. Gamer profiles show live stats from Gaming Hub;
// the developer profile (GitHub) shows the Creations count. Projects themselves live in Creations.
const LINK_GROUPS = [
    { id: 'profile',   title: 'Gamer Profiles', prefix: 'G' },
    { id: 'developer', title: 'Developer',      prefix: 'D' },
];
const PROFILE_STATS = {
    ra:    (gs) => ({ user: gs?.raUser,    stats: [['Points', gs?.raPoints], ['Mastered', gs?.raMastered], ['Beaten', gs?.raBeaten]] }),
    steam: (gs) => ({ user: gs?.steamUser, stats: [['Hours', gs?.steamHours], ['Perfect', gs?.steamPerfect], ['Achievements', gs?.steamAchievements]] }),
    xbox:  (gs) => ({ user: gs?.xboxUser,  stats: [['Gamerscore', gs?.gamerscore], ['Completed', gs?.xboxCompleted], ['Achievements', gs?.xboxAchievements]] }),
};

const LinksTab = ({ site, gs }) => {
    const groups = LINK_GROUPS.map(g => ({ ...g, items: site.links.filter(l => (l.group || 'profile') === g.id) })).filter(g => g.items.length);
    const flat = groups.flatMap(g => g.items.map((link, n) => ({ link, group: g, n })));
    const [sel, setSel] = useState(0);
    const cur = flat[sel];
    useEffect(() => {
        const onKey = (e) => {
            if (document.querySelector('.nu-dialog')) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setSel(i => (i + 1) % flat.length); }
            if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(i => (i - 1 + flat.length) % flat.length); }
            if ((e.key === 'Enter' || e.key === 'a') && cur) window.open(cur.link.url, cur.link.url.startsWith('http') ? '_blank' : '_self', 'noreferrer');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [flat.length, cur]);
    if (!cur) return null;
    const { link: l, group, n } = cur;
    const code = (g, i) => `${g.prefix}-${String(i + 1).padStart(2, '0')}`;

    // Detail stats: a gamer profile shows live numbers; GitHub shows the Creations count.
    let player = null, stats = [];
    if (group.id === 'profile' && PROFILE_STATS[l.platform]) {
        ({ user: player, stats } = PROFILE_STATS[l.platform](gs));
    } else {
        stats = [['Creations', site.projects.length], ['Coming soon', site.lockedSlots ?? 0]];
    }

    let i = -1;
    return (
        <>
            <p className="nu-heading">Records</p>
            <div className="records-grid">
                <div className="records-groups nu-stagger">
                    {groups.map(g => (
                        <section key={g.id} className="nu-section">
                            <div className="nu-section__header">{g.title}</div>
                            <div className="nu-section__body nu-list nu-stagger">
                            {g.items.map((link, gi) => {
                                i += 1;
                                const idx = i;
                                return (
                                    <button key={link.url} className={`nu-row${idx === sel ? ' is-selected' : ''}`} onClick={() => setSel(idx)}>
                                        {link.new && <span className="nu-new">!</span>}
                                        <img className="nu-row__badge" src={link.icon} alt="" />
                                        {link.name}
                                        <span className="nu-row__no">{code(g, gi)}</span>
                                    </button>
                                );
                            })}
                            </div>
                        </section>
                    ))}
                </div>
                <div key={sel} className="nu-section record-detail nu-stagger">
                    <span style={{ alignSelf: 'flex-end', font: '600 16px var(--nu-font)', color: 'var(--nu-text-soft)' }}>{code(group, n)} · {n + 1}/{group.items.length}</span>
                    <img src={l.icon} alt="" />
                    <div className="nu-ribbon">{l.name}</div>
                    {stats.length > 0 && (
                        <div className="nu-stats record-stats">
                            {stats.map(([label, v]) => <span key={label} className="nu-stat">{label}<b>{typeof v === 'number' ? fmt(v) : (v ?? '—')}</b></span>)}
                        </div>
                    )}
                    {player && <div className="record-line"><span className="nu-tag">Player</span>{player}</div>}
                    {!player && <div className="record-line"><span className="nu-tag">Destination</span>{l.url.replace(/^https?:\/\//, '')}</div>}
                    <div className="record-line"><span className="nu-tag nu-tag--orange">Note</span>{l.note}</div>
                    <Hint glyph="A" href={l.url}>{group.id === 'profile' ? 'Open profile' : 'Open'}</Hint>
                </div>
            </div>
        </>
    );
};

// ── Dialogue ─────────────────────────────────────────────────────────────────

const TYPE_MS = 25;   // per character

const Dialog = ({ site, onClose }) => {
    const [line, setLine] = useState(0);
    const lines = site.intro || [];
    const text = lines[line] || '';
    // Typewriter: letters appear one by one; the first click finishes the line, the next one advances.
    // The count is tied to its line, so a new line never flashes in full for a frame before typing.
    const [typed, setTyped] = useState({ line: -1, n: 0 });
    const shown = typed.line === line ? typed.n : (reducedMotion() ? text.length : 0);
    useEffect(() => {
        if (reducedMotion()) { setTyped({ line, n: text.length }); return; }
        setTyped({ line, n: 0 });
        const id = setInterval(() => setTyped(t => {
            if (t.line !== line || t.n >= text.length) { clearInterval(id); return t; }
            return { line, n: t.n + 1 };
        }), TYPE_MS);
        return () => clearInterval(id);
    }, [line, text]);
    const done = shown >= text.length;
    const next = useCallback(() => {
        if (!done) { setTyped({ line, n: text.length }); return; }
        line + 1 < lines.length ? setLine(line + 1) : onClose();
    }, [done, text.length, line, lines.length, onClose]);
    useEffect(() => {
        const onKey = (e) => {
            if (['Enter', ' ', 'a', 'A'].includes(e.key)) { e.preventDefault(); next(); }
            if (['Escape', 'y', 'Y'].includes(e.key)) onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [next, onClose]);
    return (
        <div className="nu-dialog" onClick={next} role="dialog" aria-label="Welcome message">
            <div className="nu-dialog__box" onClick={(e) => { e.stopPropagation(); next(); }}>
                <img className="nu-dialog__art" src={site.avatar} alt="" />
                <span className="nu-nameplate">{site.name}</span>
                <span aria-hidden="true">{text.slice(0, shown)}<span className="nu-type__rest">{text.slice(shown)}</span></span>
                <span className="sr-only">{text}</span>
                {done && <span className="nu-caret" />}
                <div className="nu-dialog__hints" onClick={e => e.stopPropagation()}>
                    <button onClick={next}><span className="nu-glyph nu-glyph--sm">A</span>Next</button>
                    <button onClick={onClose}><span className="nu-glyph nu-glyph--sm">Y</span>Skip</button>
                </div>
            </div>
        </div>
    );
};

// ── App ──────────────────────────────────────────────────────────────────────

const App = () => {
    const [site, setSite] = useState(null);
    const [tab, setTab] = useState(() => {
        const h = window.location.hash.slice(1) === 'lineup' ? 'creations' : window.location.hash.slice(1);   // old links
        return TABS.some(t => t.id === h) ? h : 'creations';
    });
    const [selected, setSelected] = useState(0);
    // Direction of the last tab change, so the new page slides in from that side (null = first load: fade only).
    const [tabDir, setTabDir] = useState(null);
    const [pressed, setPressed] = useState(null);   // 'prev' | 'next' — keycap press feedback for Q/E
    const goTab = useCallback((id, dir) => {
        if (id === tab) return;
        const a = TABS.findIndex(t => t.id === tab), b = TABS.findIndex(t => t.id === id);
        setTabDir(dir ?? (b > a ? 'right' : 'left'));
        setTab(id);
    }, [tab]);
    const [showIntro, setShowIntro] = useState(() => store.get(INTRO_KEY) !== '1');
    const gs = useGamingStats();
    const clStats = useChangelogStats(site?.projects);

    useEffect(() => { getJson('./data/site.json').then(setSite); }, []);
    useEffect(() => { history.replaceState(null, '', `#${tab}`); }, [tab]);
    // Phone tab carousel: keep the active tab centered, and when the user swipes
    // the track, make whichever tab snapped to the center the active one.
    const trackRef = useRef(null);
    useEffect(() => {
        const track = trackRef.current, el = track?.querySelector('.nu-tab.is-active');
        if (!track || !el || track.scrollWidth <= track.clientWidth) return;   // desktop: no scrolling
        track.scrollTo({ left: el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' });
    }, [tab, site]);
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        let timer;
        const onScroll = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (track.scrollWidth <= track.clientWidth) return;
                const mid = track.scrollLeft + track.clientWidth / 2;
                let best = null, bestDist = Infinity;
                track.querySelectorAll('.nu-tab').forEach(el => {
                    const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
                    if (d < bestDist) { bestDist = d; best = el.dataset.tab; }
                });
                if (best) goTab(best);
            }, 140);
        };
        track.addEventListener('scroll', onScroll, { passive: true });
        return () => { track.removeEventListener('scroll', onScroll); clearTimeout(timer); };
    }, [site, goTab]);

    const shiftTab = useCallback((d) => {
        const i = TABS.findIndex(t => t.id === tab);
        goTab(TABS[(i + d + TABS.length) % TABS.length].id, d > 0 ? 'right' : 'left');
        setPressed(d > 0 ? 'next' : 'prev');
        setTimeout(() => setPressed(null), 110);
    }, [tab, goTab]);
    const closeIntro = useCallback(() => { setShowIntro(false); store.set(INTRO_KEY, '1'); }, []);

    const project = site?.projects?.[selected];
    useEffect(() => {
        if (showIntro) return;
        const onKey = (e) => {
            if (e.target.closest?.('input, textarea')) return;
            if (e.key === 'q' || e.key === 'Q' || e.key === '[') shiftTab(-1);
            if (e.key === 'e' || e.key === 'E' || e.key === ']') shiftTab(1);
            if (tab === 'creations' && site) {
                if (e.key === 'ArrowRight') setSelected(s => (s + 1) % site.projects.length);
                if (e.key === 'ArrowLeft')  setSelected(s => (s - 1 + site.projects.length) % site.projects.length);
                if ((e.key === 'Enter' || e.key === 'a') && project) window.location.href = project.url;
                if (e.key === 'y' && project?.repo) window.open(project.repo, '_blank', 'noreferrer');
            }
            if (e.key === 'x') setShowIntro(true);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showIntro, shiftTab, tab, site, project]);

    if (!site) return null;
    const hpPct = 20;

    return (
        <div className="page">
            <div className="nu-tabbar">
                <nav className="nu-tabs" aria-label="Sections">
                    <button className={`nu-keycap${pressed === 'prev' ? ' is-pressed' : ''}`} onClick={() => shiftTab(-1)} aria-label="Previous tab (Q)">LB</button>
                    <div className="nu-tabs__track" ref={trackRef}>
                        {TABS.map(t => (
                            <button key={t.id} data-tab={t.id} className={`nu-tab${t.id === tab ? ' is-active' : ''}`} onClick={() => goTab(t.id)} aria-current={t.id === tab ? 'page' : undefined}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <button className={`nu-keycap${pressed === 'next' ? ' is-pressed' : ''}`} onClick={() => shiftTab(1)} aria-label="Next tab (E)">RB</button>
                </nav>
                <div className="nu-tabs__dots" aria-hidden="true">
                    {TABS.map(t => <button key={t.id} tabIndex={-1} className={`nu-dot${t.id === tab ? ' is-active' : ''}`} onClick={() => goTab(t.id)} />)}
                </div>
            </div>

            <main className="menu-panel">
                <div className="nu-frame">
                    <span className="nu-frame__corner nu-frame__corner--tl" />
                    <span className="nu-frame__corner nu-frame__corner--tr" />
                    {/* Keyed by tab: each change remounts, so the entry animation replays. The new page
                        slides in from the side you moved toward; its blocks rise in one after another. */}
                    <div key={tab} className={`nu-enter nu-stagger${tabDir ? ` nu-enter--from-${tabDir}` : ''}`}>
                        {tab === 'creations' && <CreationsTab site={site} selected={selected} setSelected={setSelected} clStats={clStats} />}
                        {tab === 'player' && <PlayerTab site={site} gs={gs} />}
                        {tab === 'data'   && <DataTab site={site} gs={gs} />}
                        {tab === 'links'  && <LinksTab site={site} gs={gs} />}
                    </div>
                </div>
            </main>

            <div className="bottom-row">
                <div className="nu-hud" aria-label="Player status">
                    <div className="nu-hud__portrait" style={{ '--nu-hp': `${hpPct}%` }}><img src={site.avatar} alt="" /></div>
                    <div>
                        <div className="nu-hud__code">{site.name}</div>
                        <div className="nu-hud__bar" title="Site construction progress">
                            <div className="nu-hud__fill" style={{ width: `${hpPct}%` }} />
                            <span className="nu-hud__hp">{hpPct}/100</span>
                        </div>
                        <div className="nu-hud__counters">
                            <span title="RetroAchievements points"><i className="nu-coin" /><CountUp id="hud:ra" value={gs?.raPoints} /></span>
                            <span title="Xbox gamerscore"><i className="nu-gem" /><CountUp id="hud:gs" value={gs?.gamerscore} /></span>
                            <span title="Achievements unlocked"><i className="nu-key" /><CountUp id="hud:ach" value={gs?.achievements} /></span>
                        </div>
                    </div>
                </div>
                <div className="nu-hints">
                    <Hint glyph={['Q', 'E']} onClick={() => shiftTab(1)}>Tabs</Hint>
                    {tab === 'creations' && project && <Hint glyph="A" href={project.url}>Open</Hint>}
                    {tab === 'creations' && project?.repo && <Hint glyph="Y" href={project.repo}>Source</Hint>}
                    <Hint glyph="X" onClick={() => setShowIntro(true)}>Intro</Hint>
                </div>
            </div>

            {showIntro && <Dialog site={site} onClose={closeIntro} />}
        </div>
    );
};

createRoot(document.getElementById('root')).render(<App />);
