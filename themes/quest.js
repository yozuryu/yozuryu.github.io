// Quest Board: the guild's notice board. Projects are posted quests, the owner is a guild card.

// The textures: rough = torn paper edges, age / age2 = paper grain and stains, wood = plank grain
const DEFS = `<svg class="defs" aria-hidden="true"><defs>
  <filter id="qb-rough" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G"/></filter>
  ${[['age', 7, 12], ['age2', 21, 5]].map(([id, a, b]) => `<filter id="qb-${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="${a}" result="f"/><feColorMatrix in="f" values="0 0 0 0 .3  0 0 0 0 .18  0 0 0 0 .07  0 0 0 .62 -.14" result="g"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="3" seed="${b}" result="b"/><feColorMatrix in="b" values="0 0 0 0 .4  0 0 0 0 .23  0 0 0 0 .08  0 0 0 1.9 -.86" result="s"/>
    <feMerge><feMergeNode in="s"/><feMergeNode in="g"/></feMerge></filter>`).join('')}
  <filter id="qb-rough2" x="-4%" y="-20%" width="108%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id="qb-woodh" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.5" numOctaves="4" seed="15"/><feColorMatrix values="0 0 0 0 .06  0 0 0 0 .03  0 0 0 0 .01  0 0 0 1.9 -.5"/></filter>
  <filter id="qb-wood" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.35 0.004" numOctaves="4" seed="3"/><feColorMatrix values="0 0 0 0 .07  0 0 0 0 .035  0 0 0 0 .015  0 0 0 1.5 -.42"/></filter>
</defs></svg>`;
const SIGN = '<i class="sw"></i><i class="sg"></i><i class="ch l"></i><i class="ch r"></i>';      // the hanging sign: plank, grain, two chains
const P = '<i class="pp"></i><i class="pg"></i>';          // the sheet and its grain, first inside every .note
export function render(m, { esc, num }) {
    const t = m.totals;
    const quest = (p, i) => `
      <div class="note${i % 2 ? ' t' : ''} quest">${P}<div class="hdr px">Quest</div><a class="sh" href="${esc(p.url)}" aria-label="${esc(p.name)}" style="background-image:url(${esc(p.shot)})">${p.lv ? `<div class="rank${i % 2 ? ' a' : ''} lv">${p.lv}<small>Level</small></div>` : ''}</a><div class="in"><span class="px ty">Posted quest · ${esc(p.kind)}</span><h3><img src="${esc(p.icon)}" alt="">${esc(p.name)}</h3><div class="fl"></div>
        <p>${esc(p.desc)}</p>
        <div class="rw">${p.reward ? `<div><span>Reward</span>${esc(p.reward)}</div>` : ''}${p.party ? `<div><span>Party</span>${esc(p.party)}</div>` : ''}</div>
        <div class="go"><a class="btn p" href="${esc(p.url)}">${esc(p.open)} ›</a>${p.alt ? `<a class="btn" href="${esc(p.alt.url)}">${esc(p.alt.label)}</a>` : ''}</div></div><span class="stp">Posted</span></div>`;

    return `${DEFS}<div class="wrap"><i class="wd"></i><i class="scrap s1"><b></b></i><i class="scrap s2"><b></b></i><i class="scrap s3"><b></b></i><i class="br tl"></i><i class="br tr"></i><i class="br rb"></i><i class="br lb"></i>
    <div class="sign">${SIGN}<h1>Quest Board</h1><span class="px">Adventurers’ guild · ${esc(m.name)}’s branch</span></div>
    <div class="note g card">${P}<div class="crest"></div><div class="lic px">Adventurer’s licence</div><div class="hd"><img class="av" src="${esc(m.avatar)}" alt=""><div><span class="px" style="color:var(--soft)">No. 0001</span><h2>${esc(m.name)}</h2><span class="rk px">${esc(m.title)}</span></div></div>
      ${m.motto ? `<p>“${esc(m.motto)}.”</p>` : `<p>${esc(m.about)}</p>`}
      <div class="tot"><div><b>${num(t.hours)}</b><span>Hours</span></div><div><b>${num(t.unlocks)}</b><span>Unlocks</span></div><div><b>${num(t.completed)}</b><span>Cleared</span></div></div>
      ${m.plats.length ? `<div class="pl">${m.plats.map(p => `<a href="${esc(p.url)}" rel="noopener"><img src="${esc(p.icon)}" alt="">${esc(p.name)}<em>${p.value} ${p.unit}</em></a>`).join('')}</div>` : ''}
      <div class="sg">Sworn before the guild<b>Guildmaster</b></div><div class="seal">Guild<br>approved</div>
    </div>
    <div class="board">
      ${m.projects.map(quest).join('')}
      <div class="note g strip">${P}<span class="px">Notice</span><b>${m.links.length} more boards:</b><span class="lk">${m.links.map(l => `<a href="${esc(l.url)}" rel="noopener">${esc(l.name)}</a>`).join(' · ')}</span></div>
    </div>
    <div class="side">
      ${m.playing.length ? `<div class="note t act">${P}<h4 class="px">Quests in progress</h4>
        ${m.playing.map(g => `<a class="aq" href="${esc(g.url)}"><div style="background-image:url(${esc(g.tall)})"></div><div><b>${esc(g.name)}</b>${g.pct != null ? `<i><u style="width:${g.pct}%"></u></i><small>${g.pct}% cleared</small>` : ''}</div></a>`).join('')}</div>` : ''}
      ${m.memory ? `<a class="note chr" href="${esc(m.memory.url)}">${P}<h4 class="px">Chronicle · ${m.memory.year}</h4><img src="${esc(m.memory.thumb)}" alt="" onerror="this.remove()"><div><b>${esc(m.memory.title)}</b><p>${esc(m.memory.line)}</p></div></a>` : ''}
    </div>
    </div>`;
}

// The share card: the guild card and what's in progress. No projects on it.
export function card(m, { esc, num, site, asOf }, shape) {
    const t = m.totals, mem = m.memory;
    return `${DEFS}<div class="sc sc-${shape}"><i class="wd"></i><div class="in">
      <div class="sign c-a">${SIGN}<h1>Guild Card</h1><span class="px">${esc(site)}</span></div>
      <div class="col">
        <div class="note g card">${P}<div class="crest"></div><div class="lic px">Adventurer’s licence</div><div class="hd"><img class="av" src="${esc(m.avatar)}" alt=""><div><span class="px" style="color:var(--soft)">No. 0001 · ${esc(asOf)}</span><h2>${esc(m.name)}</h2><span class="rk px">${esc(m.title)}</span></div></div>
          ${m.motto ? `<p>“${esc(m.motto)}.”</p>` : ''}
          <div class="tot"><div><b>${num(t.hours)}</b><span>Hours</span></div><div><b>${num(t.unlocks)}</b><span>Unlocks</span></div><div><b>${num(t.completed)}</b><span>Cleared</span></div></div>
          ${m.plats.length ? `<div class="pl">${m.plats.map(p => `<a><img src="${esc(p.icon)}" alt="">${esc(p.name)}<em>${p.value} ${p.unit}</em></a>`).join('')}</div>` : ''}
          <div class="sg">Sworn before the guild<b>Guildmaster</b></div><div class="seal">Guild<br>approved</div></div>
      </div>
      <div class="col">
        ${m.playing.length ? `<div class="note t act">${P}<h4 class="px">Quests in progress</h4>
          ${m.playing.map(g => `<a class="aq"><div style="background-image:url(${esc(g.tall)})"></div><div><b>${esc(g.name)}</b>${g.pct != null ? `<i><u style="width:${g.pct}%"></u></i><small>${g.pct}% cleared</small>` : ''}</div></a>`).join('')}</div>` : ''}
        ${mem ? `<a class="note chr">${P}<h4 class="px">Chronicle · ${mem.year}</h4><img src="${esc(mem.thumb)}" alt="" onerror="this.remove()"><div><b>${esc(mem.title)}</b><p>${esc(mem.line)}</p></div></a>` : ''}
      </div>
    </div></div>`;
}
