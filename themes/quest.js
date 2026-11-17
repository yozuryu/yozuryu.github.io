// Quest Board: the guild's notice board. Projects are posted quests, the owner is a guild card.
export function render(m, { esc, num }) {
    const t = m.totals;
    const quest = (p, i) => `
      <div class="note${i % 2 ? ' t' : ''} quest"><a class="sh" href="${esc(p.url)}" aria-label="${esc(p.name)}" style="background-image:url(${esc(p.shot)})">${p.lv ? `<div class="rank${i % 2 ? ' a' : ''} lv">${p.lv}<small>Level</small></div>` : ''}</a><div class="in"><span class="px ty">Posted quest · ${esc(p.kind)}</span><h3><img src="${esc(p.icon)}" alt="">${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="rw">${p.reward ? `<div><span>Reward</span>${esc(p.reward)}</div>` : ''}${p.party ? `<div><span>Party</span>${esc(p.party)}</div>` : ''}</div>
        <div class="go"><a class="btn p" href="${esc(p.url)}">${esc(p.open)} ›</a>${p.alt ? `<a class="btn" href="${esc(p.alt.url)}">${esc(p.alt.label)}</a>` : ''}</div></div></div>`;

    return `<div class="wrap">
    <div class="sign"><h1>Quest Board</h1><span class="px">Adventurers’ guild · ${esc(m.name)}’s branch</span></div>
    <div class="note g card"><div class="hd"><img class="av" src="${esc(m.avatar)}" alt=""><div><span class="px" style="color:var(--soft)">Guild card · No. 0001</span><h2>${esc(m.name)}</h2><span class="rk px">${esc(m.title)}</span></div></div>
      ${m.motto ? `<p>“${esc(m.motto)}.”</p>` : `<p>${esc(m.about)}</p>`}
      <div class="tot"><div><b>${num(t.hours)}</b><span>Hours</span></div><div><b>${num(t.unlocks)}</b><span>Unlocks</span></div><div><b>${num(t.completed)}</b><span>Cleared</span></div></div>
      ${m.plats.length ? `<div class="pl">${m.plats.map(p => `<a href="${esc(p.url)}" rel="noopener"><img src="${esc(p.icon)}" alt="">${esc(p.name)}<em>${p.value} ${p.unit}</em></a>`).join('')}</div>` : ''}
      <div style="height:56px"></div><div class="seal">Guild<br>approved</div>
    </div>
    <div class="board">
      ${m.projects.map(quest).join('')}
      <div class="note g strip"><span class="px">Notice</span><b>${m.links.length} more boards:</b><span class="lk">${m.links.map(l => `<a href="${esc(l.url)}" rel="noopener">${esc(l.name)}</a>`).join(' · ')}</span></div>
    </div>
    <div class="side">
      ${m.playing.length ? `<div class="note t act"><h4 class="px">Quests in progress</h4>
        ${m.playing.map(g => `<a class="aq" href="${esc(g.url)}"><div style="background-image:url(${esc(g.tall)})"></div><div><b>${esc(g.name)}</b>${g.pct != null ? `<i><u style="width:${g.pct}%"></u></i><small>${g.pct}% cleared</small>` : ''}</div></a>`).join('')}</div>` : ''}
      ${m.memory ? `<a class="note chr" href="${esc(m.memory.url)}"><h4 class="px">Chronicle · ${m.memory.year}</h4><img src="${esc(m.memory.thumb)}" alt="" onerror="this.remove()"><div><b>${esc(m.memory.title)}</b><p>${esc(m.memory.line)}</p></div></a>` : ''}
    </div>
    </div>`;
}
