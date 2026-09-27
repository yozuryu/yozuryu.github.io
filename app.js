import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// Landing page, styled as a game pause menu (see STYLE.md / assets/noah-ui.css).
// Content: data/site.json. Live numbers: Gaming Hub's public data (same origin).

const TABS = [
    { id: 'player',  label: 'Player' },
    { id: 'lineup',  label: 'Lineup' },
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

// Level / PWR for a project card, derived from its public changelog:
// Lv = number of releases, PWR = number of logged changes.
const useChangelogStats = (projects) => {
    const [stats, setStats] = useState({});
    useEffect(() => {
        (projects || []).forEach(p => {
            if (!p.changelog) return;
            fetch(p.changelog).then(r => (r.ok ? r.text() : '')).then(md => {
                if (!md) return;
                const releases = (md.match(/^## v/gm) || []).length;
                const changes  = (md.match(/^- /gm) || []).length;
                setStats(s => ({ ...s, [p.id]: { releases, changes } }));
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

const ProjectCard = ({ p, lv, selected, onClick }) => (
    <button className={`nu-card${selected ? ' is-selected' : ''}`} onClick={onClick} title={p.name} aria-pressed={selected}>
        <img className="nu-card__img" src={p.icon} alt={p.name} />
        <span className={`nu-card__el${p.element === 'red' ? ' nu-card__el--red' : ''}`} />
        {lv != null && <span className="nu-card__lv">{lv}</span>}
        <span className="nu-card__stars"><Stars n={p.stars} /></span>
    </button>
);

const LockedCard = () => (
    <div className="nu-card nu-card--locked" aria-label="Locked slot">
        <div className="nu-card__img">???</div>
    </div>
);

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

const LineupTab = ({ site, selected, setSelected, clStats }) => {
    const projects = site.projects;
    const p = projects[selected] ?? projects[0];
    const [{ page, dir }, setView] = useState({ page: 0, dir: null });
    useEffect(() => setView({ page: 0, dir: null }), [selected]);
    const setPage = (i, d) => setView({ page: i, dir: d ?? (i > page ? 'right' : 'left') });
    const previews = p?.previews ?? [];
    const st = clStats[p?.id];
    const locked = site.lockedSlots ?? 0;
    const emptySlots = Math.max(0, 18 - projects.length - locked);   // 3 rows of 6, like the game's stock grid

    return (
        <>
            <p className="nu-heading">Choose a project to explore.</p>

            <div className="nu-band lineup-band">
                <div className="lineup-group">
                    <span className="nu-label">Live</span>
                    <span className="nu-glyph">A</span>
                    {projects.map((proj, i) => (
                        <React.Fragment key={proj.id}>
                            {i > 0 && <span className="nu-arrow" />}
                            <ProjectCard p={proj} lv={clStats[proj.id]?.releases} selected={i === selected} onClick={() => setSelected(i)} />
                        </React.Fragment>
                    ))}
                </div>
                <div className="lineup-group">
                    <span className="nu-label">Soon</span>
                    <span className="nu-glyph">Y</span>
                    <LockedCard /><LockedCard />
                </div>
            </div>

            <div className="lineup-grid">
                <section className="nu-section">
                    <div className="nu-section__header">Stock</div>
                    <div className="nu-section__body">
                        <div className="stock-grid">
                            {projects.map((proj, i) => (
                                <div key={proj.id}>
                                    <ProjectCard p={proj} lv={clStats[proj.id]?.releases} selected={i === selected} onClick={() => setSelected(i)} />
                                    <span className="nu-count">Live</span>
                                </div>
                            ))}
                            {Array.from({ length: locked }, (_, i) => (
                                <div key={`l${i}`}><LockedCard /><span className="nu-count">Soon</span></div>
                            ))}
                            {Array.from({ length: emptySlots }, (_, i) => <div key={`e${i}`} className="nu-slot" />)}
                        </div>
                    </div>
                </section>

                {p && (
                    <section className="nu-section">
                        <div className="nu-section__header">
                            <span className={`nu-card__el${p.element === 'red' ? ' nu-card__el--red' : ''}`} style={{ position: 'static', width: 26, height: 26 }} />
                            {p.name}{st ? ` Lv.${st.releases}` : ''}
                        </div>
                        <div key={p.id} className="nu-section__body detail-body nu-rise">
                            <div className="nu-render">
                                <span className="nu-render__stars"><Stars n={p.stars} /></span>
                                <span className="nu-render__pwr"><span>PWR</span><b>{st ? st.changes : '—'}</b></span>
                                <div className="detail-render-icon"><img src={p.icon} alt="" /></div>
                                <span className="nu-render__plate">{p.url}</span>
                            </div>
                            <div>
                                <span className="nu-bar">Info</span>
                                <a className="nu-move detail-move" href={p.url}><span className="nu-glyph">A</span>{p.move}</a>
                                <div className="nu-stats">
                                    {(p.tags || []).map(t => <span key={t.label} className="nu-stat">{t.label}<b>{t.value}</b></span>)}
                                </div>
                                {previews.length > 0 && (
                                    <div className="detail-preview">
                                        <div className="detail-preview__frame">
                                            <img key={page} className={`nu-preview${dir ? ` nu-enter nu-enter--from-${dir}` : ''}`} src={previews[page]} alt={`${p.name} screenshot`} />
                                        </div>
                                        {previews.length > 1 && <button className="nu-pager" aria-label="Next screenshot" onClick={() => setPage((page + 1) % previews.length, 'right')} />}
                                    </div>
                                )}
                                <p className="nu-desc">{p.description}</p>
                                <div className="nu-dots">
                                    {(previews.length ? previews : [0]).map((_, i) => (
                                        <button key={i} className={`nu-dot${i === page ? ' is-active' : ''}`} aria-label={`Screenshot ${i + 1}`} onClick={() => setPage(i)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
};

const PlayerTab = ({ site, gs }) => (
    <>
        <p className="nu-heading">Player profile</p>
        <div className="player-grid">
            <div className="nu-render">
                <span className="nu-render__stars">★★★</span>
                <span className="nu-render__pwr"><span>PWR</span><b>{fmt(gs?.achievements)}</b></span>
                <div className="player-avatar"><img src={site.avatar} alt={site.name} /></div>
                <span className="nu-render__plate">{site.name}</span>
            </div>
            <section className="nu-section">
                <div className="nu-section__header">Background</div>
                <div className="nu-section__body player-info">
                    <span className="nu-bar">About</span>
                    <p className="nu-desc" style={{ marginTop: 0 }}>{site.about}</p>
                    {gs?.motto && <p className="player-motto">“{gs.motto}”</p>}
                    {(gs?.genres?.length > 0) && (
                        <>
                            <span className="nu-bar">Favorite genres</span>
                            <div className="nu-stats">{gs.genres.map(g => <span key={g} className="nu-stat" style={{ justifyContent: 'center' }}>{g}</span>)}</div>
                        </>
                    )}
                    {(gs?.styles?.length > 0) && (
                        <>
                            <span className="nu-bar">Favorite styles</span>
                            <div className="nu-stats">{gs.styles.map(g => <span key={g} className="nu-stat" style={{ justifyContent: 'center' }}>{g}</span>)}</div>
                        </>
                    )}
                </div>
            </section>
        </div>
    </>
);

const DataTab = ({ gs }) => {
    const left = [
        ['RetroAchievements points', gs?.raPoints],
        ['Mastered (RA)',            gs?.raMastered],
        ['Beaten (RA)',              gs?.raBeaten],
        ['Steam hours played',       gs?.steamHours],
        ['Perfect games (Steam)',    gs?.steamPerfect],
    ];
    const right = [
        ['Xbox gamerscore',          gs?.gamerscore],
        ['Achievements unlocked',    gs?.achievements],
        ['Games tracked',            gs?.games],
        ['Platforms',                3],
        ['Site progress',            '20%'],
    ];
    const col = (rows) => (
        <div className="nu-data nu-stagger">
            {rows.map(([label, v], i) => (
                <React.Fragment key={label}>
                    <span className="nu-data__label" style={{ '--i': i }}>{label}</span>
                    <span className="nu-data__value" style={{ '--i': i }}>{typeof v === 'string' ? v : <CountUp id={`data:${label}`} value={v} />}</span>
                </React.Fragment>
            ))}
        </div>
    );
    return (
        <>
            <p className="nu-heading">Play data — live from Gaming Hub</p>
            <div className="data-columns">{col(left)}{col(right)}</div>
        </>
    );
};

// Records, grouped: your projects (with the Lineup's Lv / PWR) and your gamer profiles
// (with live stats from Gaming Hub). Two section boxes on the left; the detail card adapts to the group.
const LINK_GROUPS = [
    { id: 'project', title: 'Projects',       prefix: 'P' },
    { id: 'profile', title: 'Gamer Profiles', prefix: 'G' },
];
const PROFILE_STATS = {
    ra:    (gs) => ({ user: gs?.raUser,    stats: [['Points', gs?.raPoints], ['Mastered', gs?.raMastered], ['Beaten', gs?.raBeaten]] }),
    steam: (gs) => ({ user: gs?.steamUser, stats: [['Hours', gs?.steamHours], ['Perfect', gs?.steamPerfect], ['Achievements', gs?.steamAchievements]] }),
    xbox:  (gs) => ({ user: gs?.xboxUser,  stats: [['Gamerscore', gs?.gamerscore], ['Completed', gs?.xboxCompleted], ['Achievements', gs?.xboxAchievements]] }),
};

const LinksTab = ({ site, gs, clStats }) => {
    const groups = LINK_GROUPS.map(g => ({ ...g, items: site.links.filter(l => (l.group || 'project') === g.id) })).filter(g => g.items.length);
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

    // Detail stats: a profile shows live numbers; a project shows its Lineup Lv / PWR and first tag.
    let player = null, stats = [];
    if (group.id === 'profile' && PROFILE_STATS[l.platform]) {
        ({ user: player, stats } = PROFILE_STATS[l.platform](gs));
    } else if (l.project) {
        const proj = site.projects.find(p => p.id === l.project), cl = clStats[l.project];
        stats = [['Lv', cl?.releases], ['PWR', cl?.changes], ...(proj?.tags?.[0] ? [[proj.tags[0].label, proj.tags[0].value]] : [])];
    } else {
        stats = [['Live', site.projects.length], ['Soon', site.lockedSlots ?? 0]];   // GitHub: mirrors the Lineup's Live / Soon
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
        const h = window.location.hash.slice(1);
        return TABS.some(t => t.id === h) ? h : 'lineup';
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
            if (tab === 'lineup' && site) {
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
                        {tab === 'lineup' && <LineupTab site={site} selected={selected} setSelected={setSelected} clStats={clStats} />}
                        {tab === 'player' && <PlayerTab site={site} gs={gs} />}
                        {tab === 'data'   && <DataTab gs={gs} />}
                        {tab === 'links'  && <LinksTab site={site} gs={gs} clStats={clStats} />}
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
                    {tab === 'lineup' && project && <Hint glyph="A" href={project.url}>Open</Hint>}
                    {tab === 'lineup' && project?.repo && <Hint glyph="Y" href={project.repo}>Source</Hint>}
                    <Hint glyph="X" onClick={() => setShowIntro(true)}>Intro</Hint>
                </div>
            </div>

            {showIntro && <Dialog site={site} onClose={closeIntro} />}
        </div>
    );
};

createRoot(document.getElementById('root')).render(<App />);
