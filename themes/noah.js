// Home Camp: the cream-and-gold pause menu this site started with (styled after Little Noah's menus,
// style only), opened up into one screen. HUD on top, the creations as the stage, the adventure log beside them.
export function render(m, { esc, num }) {
    const t = m.totals;
    const tabs = [['creations', 'Creations'], m.playing.length && ['party', 'Party'], ['log', 'Adventure Log'], ['links', 'Links']].filter(Boolean);
    const pj = (p, i) => `
      <div class="pj${i ? '' : ' sel'}"><a class="shot" href="${esc(p.url)}" aria-label="${esc(p.name)}" style="background-image:url(${esc(p.shot)})"><span class="star out">★★★</span>${p.pwr ? `<span class="pwr out">PWR ${num(p.pwr)}</span>` : ''}<img class="ic" src="${esc(p.icon)}" alt=""></a>
        <div class="in"><h3>${esc(p.name)}${p.lv ? `<small>Lv ${p.lv}</small>` : ''}</h3><p>${esc(p.desc)}</p>
          <div class="stats">${p.tags.map(s => `<span class="stat">${esc(s.label)}<b>${esc(s.value)}</b></span>`).join('')}</div>
          <div class="move"><a href="${esc(p.url)}"><span class="gl">A</span>${esc(p.open)}</a>${p.alt ? `<a href="${esc(p.alt.url)}"><span class="gl y">Y</span>${esc(p.alt.label)}</a>` : ''}</div></div></div>`;
    const mem = m.memory;
    const mc = mem ? `<a class="mc" id="memory" href="${esc(mem.url)}"><img src="${esc(mem.thumb)}" alt="" onerror="this.remove()"><div><h4>MEMORY CARD · ${mem.year}</h4><b>${esc(mem.title)}</b><p>${esc(mem.line)}</p><div class="move" style="margin-top:6px;font-size:13px"><span><span class="gl">X</span>Play the year</span></div></div></a>` : '';

    return `<div class="wrap">
    <div class="hud">
      <div class="port"><img src="${esc(m.avatar)}" alt="">${t.completed != null ? `<b title="Games completed">★ ${num(t.completed)}</b>` : ''}</div>
      <div class="who"><h1 class="out">${esc(m.name)}</h1><p class="out">${esc(m.title)}</p></div>
      <nav class="tabs">${tabs.map(([id, label], i) => `<a class="tab${i ? '' : ' on'}${i > 1 ? ' far' : ''}" href="#${id}" data-go="${id}">${label}</a>`).join('')}</nav>
    </div>
    <div class="frame"><div class="main">
      <div style="display:grid;gap:14px">
        <div class="band" id="creations"><div class="lab">❧ Creations · choose one to explore</div>
          <div class="line">${m.projects.map(pj).join('')}</div></div>
        ${m.playing.length || mem ? `<div class="band" id="party"><div class="lab">❧ ${m.playing.length ? 'Party · playing now' : 'Memory card'}</div>
          <div class="party">
            ${m.playing.map(g => `<a class="card" href="${esc(g.url)}"><div style="background-image:url(${esc(g.tall)})"></div>${g.pct != null ? `<em class="out">${g.pct}%</em>` : ''}<span>${esc(g.name)}</span></a>`).join('<span class="arrow">▸</span>')}
            ${mc}
          </div></div>` : ''}
      </div>
      <div class="sec" id="log"><h2>Adventure Log</h2><div>
        <div class="data">
          <div class="row"><span class="l">Hours played</span><span class="v">${num(t.hours)}</span></div>
          <div class="row"><span class="l">Unlocks</span><span class="v">${num(t.unlocks)}</span></div>
          <div class="row"><span class="l">Completed</span><span class="v">${num(t.completed)}${t.beaten ? `<small>+ ${num(t.beaten)} beaten</small>` : ''}</span></div>
          <div class="row"><span class="l">Games tracked</span><span class="v">${num(t.games)}</span></div>
        </div>
        ${m.plats.length ? `<div class="plats">${m.plats.map(p => `<a class="plat" href="${esc(p.url)}" rel="noopener"><img src="${esc(p.icon)}" alt=""><b>${p.value}</b><span>${esc(p.label)}</span></a>`).join('')}</div>` : ''}
        <div class="lab" style="margin:16px 0 8px">❧ About</div>
        <p style="margin:0;color:var(--soft);font-size:13px">${esc(m.about)}</p>
        <div class="lab" id="links" style="margin:16px 0 8px">❧ Links</div>
        <div class="lk">${m.links.map(l => `<a href="${esc(l.url)}" rel="noopener"><img src="${esc(l.icon)}" alt="">${esc(l.name)}</a>`).join('')}</div>
      </div></div>
    </div></div>
    <div class="hints"><span class="hint"><span class="key" style="width:44px">Tab</span>Select</span><span class="hint"><span class="key" style="width:52px">Enter</span>Open</span><span class="hint"><span class="gl">T</span>Theme</span></div>
    </div>`;
}
