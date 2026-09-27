import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    const [page, setPage] = useState(0);
    useEffect(() => setPage(0), [selected]);
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
                        <div className="nu-section__body detail-body">
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
                                        <img className="nu-preview" src={previews[page]} alt={`${p.name} screenshot`} />
                                        {previews.length > 1 && <button className="nu-pager" aria-label="Next screenshot" onClick={() => setPage((page + 1) % previews.length)} />}
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
                <span className="nu-render__plate">🔒 ???</span>
            </div>
            <section className="nu-section">
                <div className="nu-section__header">{site.name} Lv.1</div>
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
        <div className="nu-data">
            {rows.map(([label, v]) => (
                <React.Fragment key={label}>
                    <span className="nu-data__label">{label}</span>
                    <span className="nu-data__value">{typeof v === 'string' ? v : fmt(v)}</span>
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

const LinksTab = ({ site }) => {
    const [sel, setSel] = useState(0);
    const l = site.links[sel];
    return (
        <>
            <p className="nu-heading">Records</p>
            <div className="records-grid">
                <div className="nu-list">
                    {site.links.map((link, i) => (
                        <button key={link.url} className={`nu-row${i === sel ? ' is-selected' : ''}`} onClick={() => setSel(i)}>
                            {link.new && <span className="nu-new">!</span>}
                            <img className="nu-row__badge" src={link.icon} alt="" />
                            {link.name}
                            <span className="nu-row__no">No.{String(i + 1).padStart(2, '0')}</span>
                        </button>
                    ))}
                </div>
                {l && (
                    <div className="nu-section record-detail">
                        <span style={{ alignSelf: 'flex-end', font: '600 16px var(--nu-font)', color: 'var(--nu-text-soft)' }}>No. {sel + 1}/{site.links.length}</span>
                        <img src={l.icon} alt="" />
                        <div className="nu-ribbon">{l.name}</div>
                        <div className="record-line"><span className="nu-tag">Destination</span>{l.url.replace(/^https?:\/\//, '')}</div>
                        <div className="record-line"><span className="nu-tag nu-tag--orange">Note</span>{l.note}</div>
                        <Hint glyph="A" href={l.url}>Open</Hint>
                    </div>
                )}
            </div>
        </>
    );
};

// ── Dialogue ─────────────────────────────────────────────────────────────────

const Dialog = ({ site, onClose }) => {
    const [line, setLine] = useState(0);
    const lines = site.intro || [];
    const next = useCallback(() => (line + 1 < lines.length ? setLine(line + 1) : onClose()), [line, lines.length, onClose]);
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
                {lines[line]}
                <span className="nu-caret" />
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
    const [showIntro, setShowIntro] = useState(() => store.get(INTRO_KEY) !== '1');
    const gs = useGamingStats();
    const clStats = useChangelogStats(site?.projects);

    useEffect(() => { getJson('./data/site.json').then(setSite); }, []);
    useEffect(() => { history.replaceState(null, '', `#${tab}`); }, [tab]);
    // On phones the tab bar scrolls sideways; keep the active tab visible
    useEffect(() => {
        document.querySelector('.nu-tab.is-active')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }, [tab, site]);

    const shiftTab = useCallback((d) => {
        const i = TABS.findIndex(t => t.id === tab);
        setTab(TABS[(i + d + TABS.length) % TABS.length].id);
    }, [tab]);
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
            <nav className="nu-tabs" aria-label="Sections">
                <button className="nu-keycap" onClick={() => shiftTab(-1)} aria-label="Previous tab (Q)">LB</button>
                {TABS.map(t => (
                    <button key={t.id} className={`nu-tab${t.id === tab ? ' is-active' : ''}`} onClick={() => setTab(t.id)} aria-current={t.id === tab ? 'page' : undefined}>
                        {t.label}
                    </button>
                ))}
                <button className="nu-keycap" onClick={() => shiftTab(1)} aria-label="Next tab (E)">RB</button>
            </nav>

            <main className="menu-panel">
                <div className="nu-frame">
                    <span className="nu-frame__corner nu-frame__corner--tl" />
                    <span className="nu-frame__corner nu-frame__corner--tr" />
                    {tab === 'lineup' && <LineupTab site={site} selected={selected} setSelected={setSelected} clStats={clStats} />}
                    {tab === 'player' && <PlayerTab site={site} gs={gs} />}
                    {tab === 'data'   && <DataTab gs={gs} />}
                    {tab === 'links'  && <LinksTab site={site} />}
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
                            <span title="RetroAchievements points"><i className="nu-coin" />{fmt(gs?.raPoints)}</span>
                            <span title="Xbox gamerscore"><i className="nu-gem" />{fmt(gs?.gamerscore)}</span>
                            <span title="Achievements unlocked"><i className="nu-key" />{fmt(gs?.achievements)}</span>
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
