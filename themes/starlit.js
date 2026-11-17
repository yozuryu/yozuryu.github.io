// Starlit Menu: a pause menu over a night sky. Thin frames, wide-set capitals, the years as a constellation.
export function render(m, { esc, num, yy }) {
    const t = m.totals;
    const top = [['Play time', t.hours == null ? '—' : `${num(t.hours)}:00`], ['Unlocks', num(t.unlocks)], ['Completed', num(t.completed)]];

    const menu = [['projects', 'Projects', m.projects.length], m.memory && ['memory', 'Memory card', m.memory.years.length],
        m.playing.length && ['playing', 'Now playing', m.playing.length], ['links', 'Links', m.links.length]].filter(Boolean);

    const proj = (p, i) => `
      <div class="pan proj${i ? '' : ' on'}"><a class="sh" href="${esc(p.url)}" aria-label="${esc(p.name)}" style="background-image:url(${esc(p.shot)})"></a><div class="in">
        <div class="no px"><span class="dia"></span>Project ${String(i + 1).padStart(2, '0')} · ${esc(p.kind)}${p.lv ? ` · Lv ${p.lv}` : ''}</div>
        <h2><img src="${esc(p.icon)}" alt="">${esc(p.name)}</h2>
        <p>${esc(p.desc)}</p>
        <div class="facts">${p.facts.map(f => `<span>${esc(f)}</span>`).join('')}</div>
        <div class="act"><a class="btn p" href="${esc(p.url)}"><i></i>${esc(p.open)}</a>${p.alt ? `<a class="btn" href="${esc(p.alt.url)}">${esc(p.alt.label)}</a>` : ''}</div></div></div>`;

    // The constellation: one star per year in its Memory Card colour; height follows that year's unlocks
    const sky = () => {
        const ys = m.memory.years, n = ys.length;
        const lg = ys.map(y => Math.log((y.unlocks ?? 0) + 1)), lo = Math.min(...lg), hi = Math.max(...lg);
        const pts = ys.map((y, i) => {
            const x = n > 1 ? 16 + i * (290 / (n - 1)) : 160;
            const k = hi > lo ? (lg[i] - lo) / (hi - lo) : (i % 2 ? .7 : .3);      // log scale: a 700-unlock year next to a 20-unlock one
            return { ...y, x: +x.toFixed(1), y: +(98 - k * 74).toFixed(1), cur: y.year === m.memory.year };
        });
        return `<svg viewBox="0 0 320 134" role="img" aria-label="One star per year, higher with more unlocks">
          <polyline fill="none" stroke="rgba(190,215,255,.4)" stroke-width="1" points="${pts.map(p => `${p.x},${p.y}`).join(' ')}"/>
          ${pts.map(p => `<a href="${esc(p.url)}"><title>${p.year}${p.title ? ` · ${esc(p.title)}` : ''}</title>
            ${p.cur ? `<circle cx="${p.x}" cy="${p.y}" r="12" fill="none" stroke="#fff" stroke-width="1"/><circle cx="${p.x}" cy="${p.y}" r="17" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1" stroke-dasharray="2 4"/>` : ''}
            <circle class="star" cx="${p.x}" cy="${p.y}" r="${p.cur ? 7 : 4.5}" fill="rgb(${p.colour})"/><circle cx="${p.x}" cy="${p.y}" r="11" fill="transparent"/>
            <text class="${p.cur ? 's' : ''}" x="${p.x}" y="${p.y + (p.cur ? 32 : 18)}">${yy(p.year)}</text></a>`).join('')}
        </svg>`;
    };

    return `<div class="wrap">
    <div class="top"><span class="dia"></span><h1>Main menu</h1><span class="px loc">${esc(m.name)}'s corner of the net</span>
      <div class="r">${top.map(([l, v]) => `<div><span class="px">${l}</span><b>${v}</b></div>`).join('')}</div></div>

    <nav class="menu">
      ${menu.map(([id, label, n], i) => `<a class="mi${i ? '' : ' on'}" href="#${id}" data-go="${id}">${label}<small>${n}</small></a>`).join('')}
      <div class="hint"><b class="px">About</b>${esc(m.about)}</div>
    </nav>

    <div class="mid">
      <div id="projects" class="grp">${m.projects.map(proj).join('')}</div>
      ${m.playing.length ? `<div id="playing" class="pan now"><div class="ph px">Now playing</div><div class="games">
        ${m.playing.map(g => `<a href="${esc(g.url)}" title="${esc(g.name)}${g.pct != null ? ` · ${g.pct}%` : ''}" style="background-image:url(${esc(g.cover)})"></a>`).join('')}</div></div>` : ''}
      <div id="links" class="pan lks"><div class="ph px">Links</div><div class="lk">
        ${m.links.map(l => `<a href="${esc(l.url)}" rel="noopener"><img src="${esc(l.icon)}" alt="">${esc(l.name)}</a>`).join('')}</div></div>
    </div>

    <div class="side">
      <div class="pan me"><img src="${esc(m.avatar)}" alt=""><div><b>${esc(m.name)}</b><div class="px t">${esc(m.title)}</div></div>
        ${m.motto ? `<p>“${esc(m.motto)}.”</p>` : ''}
        <div class="tot"><div><b>${num(t.hours)}</b><span class="px">Hours</span></div><div><b>${num(t.unlocks)}</b><span class="px">Unlocks</span></div><div><b>${num(t.completed)}</b><span class="px">Completed</span></div></div>
        ${m.plats.length ? `<div class="pl">${m.plats.map(p => `<a href="${esc(p.url)}" rel="noopener" title="${esc(p.name)}"><img src="${esc(p.icon)}" alt="${esc(p.name)}">${p.value} ${p.unit}</a>`).join('')}</div>` : ''}</div>
      ${m.memory ? `<div id="memory" class="pan sky"><div class="ph px">Memory card · ${m.memory.years.length} years</div>
        ${sky()}
        <a class="yr" href="${esc(m.memory.url)}" style="--c:${m.memory.colour}"><img src="${esc(m.memory.thumb)}" alt="" onerror="this.remove()"><div><span class="px">${m.memory.year}${m.memory.partial ? ' so far' : ''}</span><b>${esc(m.memory.title)}</b><p>${esc(m.memory.line)}</p></div></a>
      </div>` : ''}
    </div>

    <div class="keys px"><span><b>⇥</b>Select</span><span><b>↵</b>Open</span><span><b>T</b>Theme</span></div>
    </div>`;
}
