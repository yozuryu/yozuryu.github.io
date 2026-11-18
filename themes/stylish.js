// Stylish: a status screen. The player on a slanted slab down the left (portrait, name, results); on the right the
// party (projects) as two tall cards with their level, the turn order (games in rotation), the year as a ticket
// and a dialogue box with the links.
export function render(m, { esc, num }) {
    const t = m.totals;
    const tabs = [['party', 'Party', m.projects.length], m.playing.length && ['turn', 'Turn order', m.playing.length], m.memory && ['memory', 'Memory card', m.memory.year], ['links', 'Links', m.links.length]].filter(Boolean);
    const ord = ['1st', '2nd', '3rd', '4th'];
    const pc = (p, i) => `
      <div class="pcw"><div class="pc"><a class="sh" href="${esc(p.url)}" aria-label="${esc(p.name)}" style="background-image:url(${esc(p.shot)})"></a>
        ${p.lv ? `<div class="lv"><small>Lv</small>${p.lv}<svg class="scr" viewBox="0 0 120 80" preserveAspectRatio="none"><path d="M12 44 C6 16 50 4 86 9 C118 14 118 58 86 70 C52 82 4 72 10 40 C14 20 58 6 100 18"/></svg></div>` : ''}
        <div class="in"><span class="px no">Party ${String(i + 1).padStart(2, '0')} · ${esc(p.kind)}${p.pwr ? ` · PWR ${num(p.pwr)}` : ''}</span>
          <h2><img src="${esc(p.icon)}" alt="">${esc(p.name)}</h2><p>${esc(p.desc)}</p>
          <div class="chips">${p.facts.map(f => `<span>${esc(f)}</span>`).join('')}</div>
          <div class="go"><a class="btn" href="${esc(p.url)}"><span>${esc(p.open)}</span></a>${p.alt ? `<a class="btn o" href="${esc(p.alt.url)}"><span>${esc(p.alt.label)}</span></a>` : ''}</div></div></div></div>`;

    return `<div class="bg"><i class="burst"></i><i class="dots"></i><b class="g1">Status</b><b class="g2">Party</b><i class="blot"></i><i class="blot b2"></i><i class="bar"></i>
      <s>✦</s><s>×</s><s>+</s><s>✕</s><s>✦</s><i class="edge2"></i><i class="edge"></i><i class="slab"></i></div><div class="wrap">
    <div class="hero">
      <span class="tag px">Player 1</span>
      <div class="pt"><i></i><img src="${esc(m.avatar)}" alt=""><span class="note">that's me</span><svg class="scr arrow" viewBox="0 0 44 34"><path d="M40 4 C30 4 16 10 6 26 M6 26 L8 13 M6 26 L19 23"/></svg></div>
      <h1 class="name" style="--n:${Math.max(4, m.name.length) + 1}" aria-label="${esc(m.name)}">${[...m.name].map(c => `<span aria-hidden="true">${esc(c)}</span>`).join('')}</h1>
      <div class="ttl px">${esc(m.title)}</div>
      ${m.motto ? `<p class="motto">${esc(m.motto)}.</p>` : ''}
      <div class="res"><div><span class="px">Hours</span><b>${num(t.hours)}</b></div><div><span class="px">Unlocks</span><b>${num(t.unlocks)}</b></div><div><span class="px">Completed</span><b>${num(t.completed)}</b></div></div>
      ${m.plats.length ? `<div class="pl">${m.plats.map(p => `<a href="${esc(p.url)}" rel="noopener" title="${esc(p.name)}"><img src="${esc(p.icon)}" alt="${esc(p.name)}">${p.value} ${p.unit}</a>`).join('')}</div>` : ''}
    </div>
    <div class="main">
      <nav class="tabs">${tabs.map(([id, label, n], i) => `<a class="tab${i ? '' : ' on'}" href="#${id}" data-go="${id}"><span>${label}<em>${n}</em></span></a>`).join('')}</nav>
      <div class="party" id="party"><span class="note n1 p">made these!</span><svg class="scr n1" viewBox="0 0 46 40"><path d="M4 6 C20 4 34 14 38 34 M38 34 L26 26 M38 34 L42 20" style="stroke:var(--a)"/></svg>${m.projects.map(pc).join('')}</div>
      <div class="row">
        ${m.playing.length ? `<div class="turn" id="turn"><span class="note">still playing…</span><h3 class="hd px">Turn order</h3><div class="tl">
          ${m.playing.map((g, i) => `<a class="tn" href="${esc(g.url)}"><div class="cv" style="background-image:url(${esc(g.cover)})"></div><em>${ord[i]}</em><b>${esc(g.name)}</b>${g.pct != null ? `<u><i style="width:${g.pct}%"></i></u><small>${g.pct}% done</small>` : ''}</a>`).join('')}</div></div>` : ''}
        ${m.memory ? `<div class="memw" id="memory"><a class="mem" href="${esc(m.memory.url)}"><span class="yr">${m.memory.year}</span><img src="${esc(m.memory.thumb)}" alt="" onerror="this.remove()"><div><span class="px">Memory card · ${m.memory.year}${m.memory.partial ? ' so far' : ''}</span><h3>${esc(m.memory.title)}</h3><p>${esc(m.memory.line)}</p></div></a><div class="stamp"><span>Saved<small>${m.memory.year}</small></span></div></div>` : ''}
      </div>
      <div class="dlgo" id="links"><span class="note">find me here ↓</span><div class="dlgw"><div class="dn"><span>${esc(m.name)}</span></div><div class="dlg">
        <p>${esc(m.about)}</p>
        <div class="lk">${m.links.map(l => `<a href="${esc(l.url)}" rel="noopener"><span><img src="${esc(l.icon)}" alt="">${esc(l.name)}</span></a>`).join('')}</div>
        <i class="nx">▼</i></div></div></div>
    </div>
    </div>`;
}

// The share card: the player's status page torn out of the zine. No projects on it.
export function card(m, { esc, num, site, asOf }, shape) {
    const t = m.totals, mem = m.memory, ord = ['1st', '2nd', '3rd', '4th'];
    return `<div class="sc sc-${shape}"><div class="bg"><i class="burst"></i><i class="dots"></i><b class="g2">Status</b><i class="blot"></i><s>✦</s><s>×</s><s>+</s></div><div class="in">
      <div class="col">
        <div class="hero">
          <span class="tag px">Player 1</span>
          <div class="pt"><i></i><img src="${esc(m.avatar)}" alt=""></div>
          <h1 class="name" style="--n:${Math.max(4, m.name.length) + 1}">${[...m.name].map(c => `<span>${esc(c)}</span>`).join('')}</h1>
          <div class="ttl px">${esc(m.title)}</div>
          ${m.motto ? `<p class="motto">${esc(m.motto)}.</p>` : ''}
          <div class="res"><div><span class="px">Hours</span><b>${num(t.hours)}</b></div><div><span class="px">Unlocks</span><b>${num(t.unlocks)}</b></div><div><span class="px">Completed</span><b>${num(t.completed)}</b></div></div>
          ${m.plats.length ? `<div class="pl">${m.plats.map(p => `<a><img src="${esc(p.icon)}" alt="">${p.value} ${p.unit}</a>`).join('')}</div>` : ''}
        </div>
      </div>
      <div class="col">
        ${m.playing.length ? `<div class="turn"><span class="note">still playing…</span><h3 class="hd px">Turn order</h3><div class="tl">
          ${m.playing.map((g, i) => `<a class="tn"><div class="cv" style="background-image:url(${esc(g.cover)})"></div><em>${ord[i]}</em><b>${esc(g.name)}</b>${g.pct != null ? `<u><i style="width:${g.pct}%"></i></u><small>${g.pct}% done</small>` : ''}</a>`).join('')}</div></div>` : ''}
        ${mem ? `<div class="memw"><a class="mem"><span class="yr">${mem.year}</span><img src="${esc(mem.thumb)}" alt="" onerror="this.remove()"><div><span class="px">Memory card · ${mem.year}${mem.partial ? ' so far' : ''}</span><h3>${esc(mem.title)}</h3><p>${esc(mem.line)}</p></div></a><div class="stamp"><span>Saved<small>${esc(asOf)}</small></span></div></div>` : ''}
        <div class="scf px">${esc(site)}</div>
      </div>
    </div></div>`;
}
