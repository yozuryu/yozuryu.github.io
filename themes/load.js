// Load Game: the save-select screen. Projects are save files, the years are blocks on a memory card.
export function render(m, { esc, num, yy }) {
    const t = m.totals;
    const slot = (p, i) => `
      <div class="slot${i ? '' : ' on'}"><a class="sh" href="${esc(p.url)}" aria-label="${esc(p.name)}" style="background-image:url(${esc(p.shot)})"></a><div class="in">
        <div class="fh px"><span class="no">File ${String(i + 1).padStart(2, '0')}</span><span>${p.saved ? `Saved ${esc(p.saved)}` : 'Save file'}</span><span class="tag">${esc(p.kind)}</span></div>
        <h2><img src="${esc(p.icon)}" alt="">${esc(p.name)}</h2><p>${esc(p.desc)}</p>
        <div class="meta"><div><span class="px">Lv</span><b>${p.lv ?? '—'}</b></div><div><span class="px">Changes</span><b>${num(p.pwr)}</b></div>${p.facts[0] ? `<div><span class="px">Trait</span><b class="tr">${esc(p.facts[0])}</b></div>` : ''}</div>
        <div class="act"><a class="btn p" href="${esc(p.url)}">▶ Continue</a>${p.alt ? `<a class="btn" href="${esc(p.alt.url)}">${esc(p.alt.label)}</a>` : ''}</div></div></div>`;

    const mem = m.memory;
    const blocks = () => {
        const pad = (5 - mem.years.length % 5) % 5 || 5;        // always a few empty blocks: the card has room for more years
        return mem.years.map(y => `<a class="blk y${y.year === mem.year ? ' sel' : ''}" href="${esc(y.url)}" title="${y.year}${y.title ? ` · ${esc(y.title)}` : ''}" style="--c:${y.colour}">${yy(y.year)}</a>`).join('')
            + '<div class="blk">—</div>'.repeat(pad);
    };

    return `<div class="wrap">
    <div class="top"><h1>Load <span>game</span></h1><p>Select a file. Each one is something I made.</p>
      <div class="me"><img src="${esc(m.avatar)}" alt=""><div><b>${esc(m.name)}</b><span>${esc(m.title)}</span></div></div></div>
    <div class="slots">
      ${m.projects.map(slot).join('')}
      <div class="slot empty"><div class="in"><div class="px">File ${String(m.projects.length + 1).padStart(2, '0')}</div><h2>— Empty slot —</h2><p>The next project saves here.</p></div></div>
    </div>
    <div class="side">
      ${mem ? `<div class="box"><h3 class="px">Memory card · ${mem.years.length} of ${mem.years.length + ((5 - mem.years.length % 5) % 5 || 5)} blocks</h3>
        <div class="blocks">${blocks()}</div>
        <a class="yr" href="${esc(mem.url)}" style="--c:${mem.colour}"><img src="${esc(mem.thumb)}" alt="" onerror="this.remove()"><div><span class="px">Block ${mem.years.length} · ${mem.year}${mem.partial ? ' so far' : ''}</span><b>${esc(mem.title)}</b><p>${esc(mem.line)}</p></div></a>
      </div>` : ''}
      <div class="box"><h3 class="px">Save data</h3>
        <div class="tot"><div><b>${num(t.hours)}</b><span class="px">Hours</span></div><div><b>${num(t.unlocks)}</b><span class="px">Unlocks</span></div><div><b>${num(t.completed)}</b><span class="px">Completed</span></div></div>
        ${m.plats.length ? `<div class="pl">${m.plats.map(p => `<a href="${esc(p.url)}" rel="noopener"><img src="${esc(p.icon)}" alt="">${esc(p.name)}<em>${p.value} ${p.unit}</em></a>`).join('')}</div>` : ''}
      </div>
      ${m.playing.length ? `<div class="box"><h3 class="px">Last played</h3><div class="now">${m.playing.map(g => `<a href="${esc(g.url)}" title="${esc(g.name)}${g.pct != null ? ` · ${g.pct}%` : ''}" style="background-image:url(${esc(g.cover)})"></a>`).join('')}</div></div>` : ''}
      <div class="box"><h3 class="px">Other saves</h3><div class="lk">${m.links.map(l => `<a href="${esc(l.url)}" rel="noopener"><img src="${esc(l.icon)}" alt="">${esc(l.name)}</a>`).join('')}</div></div>
    </div>
    <div class="keys px"><span><b>Tab</b>Select file</span><span><b>Enter</b>Continue</span><span><b>T</b>Theme</span></div>
    </div>`;
}

// The share card: the save data alone. No projects on it.
export function card(m, { esc, num, yy, site, asOf }, shape) {
    const t = m.totals, mem = m.memory;
    const pad = mem ? ((5 - mem.years.length % 5) % 5 || 5) : 0;
    return `<div class="sc sc-${shape}"><div class="in">
      <div class="top c-a"><h1>Save <span>data</span></h1><div class="me"><img src="${esc(m.avatar)}" alt=""><div><b>${esc(m.name)}</b><span>${esc(m.title)}</span></div></div></div>
      <div class="col">
        <div class="box"><h3 class="px">File 01 · ${esc(asOf)}</h3>
          <div class="tot"><div><b>${num(t.hours)}</b><span class="px">Hours</span></div><div><b>${num(t.unlocks)}</b><span class="px">Unlocks</span></div><div><b>${num(t.completed)}</b><span class="px">Completed</span></div></div>
          ${m.plats.length ? `<div class="pl">${m.plats.map(p => `<a><img src="${esc(p.icon)}" alt="">${esc(p.name)}<em>${p.value} ${p.unit}</em></a>`).join('')}</div>` : ''}</div>
        ${m.playing.length ? `<div class="box"><h3 class="px">Last played</h3><div class="now">${m.playing.map(g => `<a style="background-image:url(${esc(g.cover)})"></a>`).join('')}</div></div>` : ''}
      </div>
      <div class="col">
        ${mem ? `<div class="box"><h3 class="px">Memory card · ${mem.years.length} of ${mem.years.length + pad} blocks</h3>
          <div class="blocks">${mem.years.map(y => `<a class="blk y${y.year === mem.year ? ' sel' : ''}" style="--c:${y.colour}">${yy(y.year)}</a>`).join('')}${'<div class="blk">—</div>'.repeat(pad)}</div>
          <a class="yr" style="--c:${mem.colour}"><img src="${esc(mem.thumb)}" alt="" onerror="this.remove()"><div><span class="px">Block ${mem.years.length} · ${mem.year}${mem.partial ? ' so far' : ''}</span><b>${esc(mem.title)}</b><p>${esc(mem.line)}</p></div></a></div>` : ''}
      </div>
    </div><div class="scf px">${esc(site)}</div></div>`;
}
