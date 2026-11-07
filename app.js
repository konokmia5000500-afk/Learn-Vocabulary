'use strict';
/* Learn Vocabulary – offline PWA. Data: data/words.json (see README for credits). */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => new Date().toLocaleDateString('en-CA');
const KEY = 'lv_state_v1';
const DEF = { font: 17, theme: 'light', daily: 10, time: '08:00', notif: false };

const IC = {
  home: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  learn: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M9 7h6M9 11h6"/>',
  score: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  words: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  quiz: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
  settings: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  check: '<path d="M4 12l5 5L20 6"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5"/>',
  flame: '<path d="M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'
};
const ico = (n, c) => `<svg class="i ${c || ''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const TITLES = { home: 'Home', learn: 'Learn', score: 'Score', words: 'Words', quiz: 'Quiz', settings: 'Settings' };
const SCENES = {
  home: "<circle cx='310' cy='90' r='36' fill='rgba(200,150,60,.25)'/><path d='M0 230Q90 160 170 220T320 200T400 220V320H0Z' fill='rgba(120,90,50,.13)'/><path d='M0 270Q110 220 200 265T400 250V320H0Z' fill='rgba(120,90,50,.18)'/>",
  learn: "<path d='M0 240L90 140L150 210L230 110L320 220L400 170V320H0Z' fill='rgba(120,90,50,.14)'/><path d='M0 280L120 220L230 270L400 215V320H0Z' fill='rgba(120,90,50,.18)'/><circle cx='70' cy='70' r='22' fill='rgba(200,150,60,.22)'/>",
  score: "<path d='M0 300H70V250H140V210H210V170H280V120H400V320H0Z' fill='rgba(120,90,50,.14)'/><path d='M0 300H100V270H200V240H300V210H400V320H0Z' fill='rgba(120,90,50,.16)'/>",
  words: "<g fill='rgba(70,110,70,.2)'><path d='M60 300V230L30 230L75 160L120 230L90 230V300Z'/><path d='M200 300V210L165 210L215 130L265 210L230 210V300Z'/><path d='M330 300V240L305 240L345 180L385 240L360 240V300Z'/></g><path d='M0 290Q200 260 400 290V320H0Z' fill='rgba(120,90,50,.16)'/>",
  quiz: "<g fill='rgba(230,190,90,.45)'><circle cx='50' cy='50' r='2'/><circle cx='140' cy='90' r='1.6'/><circle cx='250' cy='40' r='2'/><circle cx='340' cy='110' r='2.2'/><circle cx='300' cy='200' r='1.5'/><circle cx='90' cy='170' r='1.8'/></g><circle cx='330' cy='60' r='24' fill='rgba(230,190,90,.22)'/><path d='M0 280Q120 230 220 275T400 260V320H0Z' fill='rgba(80,60,40,.2)'/>",
  settings: "<g fill='rgba(255,255,255,.35)'><ellipse cx='90' cy='70' rx='50' ry='16'/><ellipse cx='130' cy='62' rx='34' ry='16'/><ellipse cx='300' cy='130' rx='56' ry='17'/><ellipse cx='340' cy='120' rx='36' ry='15'/></g><path d='M0 270Q100 235 210 268T400 250V320H0Z' fill='rgba(120,90,50,.15)'/>"
};

let S, W = [], byId = new Map(), page = 'home', lq = [], Q = null, timer = null, shown = 30;
let sq = { mode: 'en', text: '' };

/* ---------- state ---------- */
function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  S = Object.assign({ set: {}, prog: {}, custom: [], days: {}, start: today(), xp: 0, cid: 0, lastNotif: '' }, S || {});
  S.set = Object.assign({}, DEF, S.set);
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} syncSW(); }
const P = id => S.prog[id] || (S.prog[id] = { st: 0, box: 0, ok: 0, bad: 0, d: 0, again: false, seen: 0 });
const Pr = id => S.prog[id] || {};
const day = () => S.days[today()] || (S.days[today()] = { l: 0, ok: 0, bad: 0 });
const learnedCount = () => Object.values(S.prog).filter(p => p.st === 1).length;
function streak() {
  const f = x => x.toLocaleDateString('en-CA'), act = k => { const r = S.days[k]; return r && (r.l || r.ok || r.bad); };
  let n = 0, d = new Date();
  if (!act(f(d))) d.setDate(d.getDate() - 1);
  while (act(f(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function levelOf(w) { const p = Pr(w.i); return p.d === 1 ? 0 : p.d === 2 ? 2 : w.l; }
const LVN = ['Easy', 'Medium', 'Hard'];
function rebuildWords(base) {
  W = (base || W.filter(w => w.i >= 0)).concat(S.custom.map(c => ({ i: c.i, w: c.w, b: c.b, e: c.e || '', l: 1, z: 0, c: 1 })));
  byId = new Map(W.map(w => [w.i, w]));
}
function applyTheme() {
  document.documentElement.setAttribute('data-theme', S.set.theme);
  document.documentElement.style.fontSize = S.set.font + 'px';
  const m = document.querySelector('meta[name=theme-color]');
  if (m) m.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#f7f0e1';
}

/* ---------- navigation ---------- */
function go(p) { const f = document.getElementById('fb'); if (f) f.remove(); page = p; if (p !== 'quiz') Q = null; render(); window.scrollTo(0, 0); }
function renderNav() {
  $('#nav').innerHTML = ['home', 'learn', 'score', 'words', 'quiz', 'settings'].map(p => `<button class="${p === page ? 'on' : ''}" data-act="go" data-p="${p}" aria-label="${TITLES[p]}">${ico(p)}</button>`).join('');
}
function render() {
  $('#title').textContent = TITLES[page];
  $('#scene').style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 320' preserveAspectRatio='xMidYMax slice'>${SCENES[page]}</svg>`)}")`;
  renderNav();
  ({ home: rHome, learn: rLearn, score: rScore, words: rWords, quiz: rQuiz, settings: rSettings })[page]();
  document.querySelectorAll('.fab').forEach(x => x.remove());
  if (page === 'words') { const b = document.createElement('button'); b.className = 'fab'; b.dataset.act = 'addform'; b.setAttribute('aria-label', 'Add word'); b.innerHTML = ico('plus'); document.body.appendChild(b); }
}
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }

/* ---------- learning queue ---------- */
function buildQ() {
  const out = [];
  Object.keys(S.prog).map(Number).filter(i => S.prog[i].again && S.prog[i].st !== 1 && byId.has(i)).forEach(i => out.length < 10 && out.push(i));
  S.custom.forEach(c => { if (out.length < 20 && Pr(c.i).st !== 1 && !out.includes(c.i)) out.push(c.i); });
  for (const w of W) { if (out.length >= 40) break; if (w.i >= 0 && Pr(w.i).st !== 1 && !out.includes(w.i)) out.push(w.i); }
  lq = out;
}
const nextWord = () => { if (!lq.length) buildQ(); return byId.get(lq[0]); };
const reviewIds = () => Object.keys(S.prog).map(Number).filter(i => byId.has(i) && S.prog[i].st !== 1 && (S.prog[i].again || S.prog[i].seen));
function hl(text, word) {
  const t = esc(text); if (!word) return t;
  try { return t.replace(new RegExp('\\b(' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*)', 'ig'), '<mark>$1</mark>'); } catch (e) { return t; }
}

/* ---------- pages ---------- */
const LOGO = `<svg class="logo" viewBox="0 0 300 100" role="img" aria-label="Learn Vocabulary"><circle cx="46" cy="50" r="36" fill="none" stroke="var(--acc)" stroke-width="3"/><circle cx="46" cy="50" r="30" fill="none" stroke="var(--acc2)" stroke-width="1.2"/><text x="46" y="63" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="700" font-size="36" fill="var(--acc)">LV</text><text x="94" y="46" font-family="Georgia,'Times New Roman',serif" font-size="25" font-weight="700" letter-spacing="1" fill="currentColor">Learn</text><text x="94" y="74" font-family="Georgia,'Times New Roman',serif" font-size="25" font-style="italic" fill="var(--acc)">Vocabulary</text><path d="M94 82h190" stroke="var(--acc2)" stroke-width="1.5"/></svg>`;
function rHome() {
  const d = S.days[today()] || { l: 0 }, goal = S.set.daily, y = new Date(); y.setDate(y.getDate() - 1);
  const ya = S.days[y.toLocaleDateString('en-CA')], missed = S.start < today() && !(ya && (ya.l || ya.ok || ya.bad));
  let ids = reviewIds().slice(0, 15), title = 'Continue where you left off';
  if (!ids.length) { if (!lq.length) buildQ(); ids = lq.slice(0, 8); title = 'Up next'; }
  $('#main').innerHTML = `${LOGO}
  ${missed ? `<div class="banner">You skipped yesterday. A short session will get you back on track.</div>` : ''}
  <div class="card"><div class="row" style="justify-content:space-between"><h3>Today</h3><span class="mute">${d.l} / ${goal} words</span></div>
  <div class="bar"><i style="width:${Math.min(100, d.l / goal * 100)}%"></i></div><br>
  <button class="btn block" data-act="go" data-p="learn">${ico('learn')} Start learning</button></div>
  <div class="grid" style="margin-bottom:14px"><div class="stat"><b>${streak()}</b><span>Day streak</span></div><div class="stat"><b>${learnedCount()}</b><span>Words learned</span></div></div>
  <h3>${title}</h3>
  <div class="slider">${ids.map(i => { const w = byId.get(i); return `<button class="slide" data-act="openw" data-id="${i}"><b>${esc(w.w)}</b><span>${esc(w.b[0])}</span></button>`; }).join('') || '<p class="mute">Nothing pending.</p>'}</div>`;
}
function rLearn() {
  const w = nextWord(), d = day(), goal = S.set.daily;
  if (!w) { $('#main').innerHTML = `<div class="card"><h2>All done</h2><p>You have learned every word in the list.</p></div>`; return; }
  const p = P(w.i); p.seen = 1;
  $('#main').innerHTML = `<div class="ring"><div class="bar" style="flex:1"><i style="width:${Math.min(100, d.l / goal * 100)}%"></i></div><span class="mute">${d.l}/${goal} today</span></div>
  <article class="card"><span class="lv">${LVN[levelOf(w)]}</span>${p.again ? ' <span class="lv">Review</span>' : ''}
  <div class="word">${esc(w.w)}</div>
  <ul class="mean">${w.b.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
  ${w.e ? `<p class="ex">${hl(w.e, w.w)}</p>` : ''}
  <div class="row"><button class="chip ${p.d === 1 ? 'on' : ''}" data-act="diff" data-v="1">Easy</button><button class="chip ${p.d === 2 ? 'on' : ''}" data-act="diff" data-v="2">Hard</button></div></article>
  <div class="actions"><button class="btn again" data-act="again">${ico('refresh')} Learn again</button><button class="btn ok" data-act="learned">${ico('check')} Learned</button></div>`;
}
function rScore() {
  const L = learnedCount(), total = W.length, rem = Math.max(0, total - L), daily = S.set.daily;
  const all = Object.values(S.days), ok = all.reduce((a, r) => a + (r.ok || 0), 0), bad = all.reduce((a, r) => a + (r.bad || 0), 0);
  const since = Math.floor((new Date(today()) - new Date(S.start)) / 864e5) + 1, active = all.filter(r => r.l || r.ok || r.bad).length;
  const acc = ok + bad ? Math.round(ok / (ok + bad) * 100) : 0;
  const days7 = [...Array(7)].map((_, k) => { const x = new Date(); x.setDate(x.getDate() - 6 + k); const r = S.days[x.toLocaleDateString('en-CA')]; return { n: x.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2), v: r ? r.l : 0 }; });
  const mx = Math.max(1, ...days7.map(x => x.v));
  const byL = [0, 0, 0]; W.forEach(w => { if (Pr(w.i).st === 1) byL[levelOf(w)]++; });
  const hard = W.filter(w => Pr(w.i).bad).sort((a, b) => Pr(b.i).bad - Pr(a.i).bad).slice(0, 5);
  $('#main').innerHTML = `<div class="grid" style="margin-bottom:14px">
  <div class="stat"><b>${since}</b><span>Days since start</span></div><div class="stat"><b>${active}</b><span>Active days</span></div>
  <div class="stat"><b>${streak()}</b><span>Streak</span></div><div class="stat"><b>${S.xp}</b><span>XP</span></div>
  <div class="stat"><b>${ok}</b><span>Quiz correct</span></div><div class="stat"><b>${bad}</b><span>Quiz wrong</span></div></div>
  <div class="card"><h3>Progress</h3><div class="bar"><i style="width:${total ? L / total * 100 : 0}%"></i></div>
  <p class="mute">${L} of ${total} words learned. At ${daily} words/day, about <b>${Math.ceil(rem / daily)}</b> days remain.</p>
  <p class="mute">Quiz accuracy: <b>${acc}%</b></p></div>
  <div class="card"><h3>Last 7 days (words learned)</h3><div class="chart">${days7.map(x => `<div><i style="height:${x.v / mx * 80}px"></i>${x.v}<br>${x.n}</div>`).join('')}</div></div>
  <div class="card"><h3>Learned by level</h3><p class="mute">Easy ${byL[0]} · Medium ${byL[1]} · Hard ${byL[2]}</p></div>
  ${hard.length ? `<div class="card"><h3>Most missed</h3>${hard.map(w => `<div class="res" data-act="detail" data-id="${w.i}"><b>${esc(w.w)}</b><span>${Pr(w.i).bad}× wrong</span></div>`).join('')}</div>` : ''}`;
}
function searchList() {
  const q = sq.text.trim().toLowerCase();
  if (!q) return { list: W.slice(0, 400), n: Math.min(400, W.length) };
  let a = [], b = [];
  for (const w of W) {
    if (sq.mode === 'en') { if (w.w.startsWith(q)) a.push(w); else if (w.w.includes(q)) b.push(w); }
    else { if (w.b.some(x => x.startsWith(sq.text.trim()))) a.push(w); else if (w.b.some(x => x.includes(sq.text.trim()))) b.push(w); }
  }
  const l = a.concat(b); return { list: l, n: l.length };
}
function resRows() {
  const { list, n } = searchList();
  return list.slice(0, shown).map(w => `<div class="res" data-act="detail" data-id="${w.i}"><b>${esc(w.w)}</b><span>${esc(w.b.slice(0, 2).join(', '))}</span></div>`).join('') + (n > shown ? `<button class="btn ghost block" style="margin-top:10px" data-act="more">Show more (${n - shown})</button>` : '') + (n ? '' : '<p class="mute">No results.</p>');
}
function rWords() {
  $('#main').innerHTML = `<div class="seg"><button class="${sq.mode === 'en' ? 'on' : ''}" data-act="smode" data-m="en">English</button><button class="${sq.mode === 'bn' ? 'on' : ''}" data-act="smode" data-m="bn">বাংলা</button></div>
  <input type="text" id="q" placeholder="${sq.mode === 'en' ? 'Search English word' : 'বাংলা শব্দ খুঁজুন'}" value="${esc(sq.text)}" autocomplete="off" autocapitalize="off">
  <div id="res" class="card" style="margin-top:12px;padding:6px 14px">${resRows()}</div>
  ${S.custom.length ? `<h3>My words (${S.custom.length})</h3><div class="card" style="padding:6px 14px">${S.custom.map(c => `<div class="res"><span data-act="detail" data-id="${c.i}" style="text-align:left;color:var(--ink);flex:1"><b>${esc(c.w)}</b> – ${esc(c.b.join(', '))}</span><button class="chip" data-act="delcustom" data-id="${c.i}">${ico('trash')}</button></div>`).join('')}</div>` : ''}`;
}
function rSettings() {
  const s = S.set;
  $('#main').innerHTML = `<div class="card"><h3>Text size</h3><input type="range" min="14" max="24" step="1" value="${s.font}" data-set="font"><p class="mute">${s.font}px</p></div>
  <div class="card"><h3>Theme</h3><div class="row">${['light', 'dark', 'sepia', 'forest'].map(t => `<button class="chip ${s.theme === t ? 'on' : ''}" data-act="theme" data-t="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
  <div class="card"><h3>Words per day</h3><div class="row">${[5, 10, 15, 20, 30, 50].map(n => `<button class="chip ${s.daily === n ? 'on' : ''}" data-act="daily" data-n="${n}">${n}</button>`).join('')}</div></div>
  <div class="card"><h3>Daily reminder</h3><div class="row"><button class="chip ${s.notif ? 'on' : ''}" data-act="notif">${s.notif ? 'On' : 'Off'}</button><input type="time" value="${s.time}" data-set="time" style="width:auto"></div>
  <p class="mute">Install the app from Chrome's menu (Add to Home screen) for best results. Chrome decides the exact delivery time when the app is closed.</p>
  <button class="btn ghost" style="margin-top:8px" data-act="testnotif">Send test notification</button></div>
  <div class="card"><h3>Backup</h3><div class="row"><button class="btn ghost" data-act="export">Export</button><label class="btn ghost">Import<input type="file" accept="application/json" id="imp" hidden></label></div>
  <p class="mute">Your progress lives in this browser. Export a backup before clearing Chrome data.</p></div>
  <div class="card"><button class="btn ghost" data-act="reset">Reset all progress</button><p class="mute">Word data: BengaliDictionary by Minhas Kamal (GPL-3.0). Frequency ranks: wordfreq.</p></div>`;
}

/* ---------- quiz ---------- */
function pool(mode) {
  let ids;
  if (mode === 'mine') ids = S.custom.map(c => c.i);
  else {
    ids = Object.keys(S.prog).map(Number).filter(i => byId.has(i) && (S.prog[i].seen || S.prog[i].st === 1));
    S.custom.forEach(c => { if (!ids.includes(c.i)) ids.push(c.i); });
    for (let k = 0; ids.length < 12 && k < W.length; k++) if (W[k].i >= 0 && !ids.includes(W[k].i)) ids.push(W[k].i);
  }
  return ids.map(i => byId.get(i)).filter(Boolean);
}
function weight(w) { const p = Pr(w.i); return 1 + (p.again ? 3 : 0) + (levelOf(w) === 2 ? 2 : 0) + (p.d === 1 ? -.5 : 0) + Math.max(0, 3 - (p.box || 0)) + Math.min(4, p.bad || 0); }
function pick(arr, n, uniqB) {
  const a = arr.map(w => [w, weight(w)]), r = [], used = new Set();
  while (r.length < n && a.length) {
    const t = a.reduce((s, x) => s + x[1], 0); let x = Math.random() * t, i = 0;
    for (; i < a.length - 1 && (x -= a[i][1]) > 0; i++);
    const w = a.splice(i, 1)[0][0];
    if (uniqB && used.has(w.b[0])) continue;
    used.add(w.b[0]); r.push(w);
  }
  return r;
}
function distract(w, key) {
  const out = [], seen = new Set([key === 'b' ? w.b[0] : w.w]);
  let guard = 0;
  while (out.length < 3 && guard++ < 200) {
    const c = W[rnd(W.length)], v = key === 'b' ? c.b[0] : c.w;
    if (c.i !== w.i && !seen.has(v) && !(key === 'b' && w.b.includes(v))) { seen.add(v); out.push(c); }
  }
  return out;
}
function buildQuiz(mode) {
  const pl = pool(mode); if (!pl.length) return null;
  const ws = pick(pl, Math.min(pl.length, 14)), types = ['mc', 'rev', 'match', 'type', 'mc', 'rev', 'type', 'match', 'rev', 'type'], qs = [];
  types.forEach((t, k) => {
    const w = ws[k % ws.length];
    if (t === 'match') { const g = pick(pl, Math.min(5, pl.length), true); if (g.length >= 3) return qs.push({ t, g }); t = 'mc'; }
    qs.push({ t, w });
  });
  return qs;
}
function rQuiz() {
  if (!Q) {
    const mine = S.custom.length;
    $('#main').innerHTML = `<div class="card"><h2>Vocabulary quiz</h2><p class="mute">Questions mix matching, multiple choice and typing. Words you mark hard, review again or get wrong appear more often.</p>
    <div class="seg"><button class="${sq.qm !== 'mine' ? 'on' : ''}" data-act="qmode" data-m="all">All words</button><button class="${sq.qm === 'mine' ? 'on' : ''}" data-act="qmode" data-m="mine">My words</button></div>
    ${sq.qm === 'mine' && !mine ? '<p class="mute">Add your own words in the Words tab first.</p>' : ''}
    <button class="btn block" data-act="qstart" ${sq.qm === 'mine' && !mine ? 'disabled' : ''}>Start</button></div>`;
    return;
  }
  if (Q.end) {
    const tot = Q.ok + Q.bad, acc = tot ? Math.round(Q.ok / tot * 100) : 0;
    $('#main').innerHTML = `<div class="card" style="text-align:center"><h2>${Q.hearts <= 0 ? 'Out of hearts' : 'Session complete'}</h2>
    <div class="grid" style="margin:14px 0"><div class="stat"><b>${Q.xp}</b><span>XP</span></div><div class="stat"><b>${acc}%</b><span>Accuracy</span></div><div class="stat"><b>${Q.ok}</b><span>Correct</span></div><div class="stat"><b>${Q.bad}</b><span>Wrong</span></div></div>
    <button class="btn block" data-act="qstart">Play again</button></div>`;
    return;
  }
  const q = Q.qs[Q.idx], pct = Q.idx / Q.qs.length * 100;
  let body = '';
  if (q.t === 'mc' || q.t === 'rev') {
    if (!q.opts) { const key = q.t === 'mc' ? 'b' : 'w'; q.opts = shuffle([q.w].concat(distract(q.w, key))); }
    body = `<p class="qtitle">${q.t === 'mc' ? 'What does this word mean?' : 'Choose the English word'}</p><div class="qword">${esc(q.t === 'mc' ? q.w.w : q.w.b[0])}</div>` +
      q.opts.map((o, k) => `<button class="opt" data-act="opt" data-k="${k}">${esc(q.t === 'mc' ? o.b[0] : o.w)}</button>`).join('');
  } else if (q.t === 'type') {
    body = `<p class="qtitle">Type the English word</p><div class="qword">${esc(q.w.b.slice(0, 2).join(' / '))}</div><input type="text" id="ans" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="English word"><br><br><button class="btn block" data-act="check">Check</button>`;
  } else {
    if (!q.m) q.m = { l: shuffle(q.g.map((_, i) => i)), r: shuffle(q.g.map((_, i) => i)), a: null, b: null, done: [] };
    const m = q.m;
    body = `<p class="qtitle">Match the pairs</p><div class="match"><div>${m.l.map(i => `<button class="tok ${m.done.includes(i) ? 'done' : ''} ${m.a === i ? 'sel' : ''}" data-act="mt" data-s="l" data-i="${i}" style="width:100%;margin-bottom:10px">${esc(q.g[i].w)}</button>`).join('')}</div><div>${m.r.map(i => `<button class="tok ${m.done.includes(i) ? 'done' : ''} ${m.b === i ? 'sel' : ''}" data-act="mt" data-s="r" data-i="${i}" style="width:100%;margin-bottom:10px">${esc(q.g[i].b[0])}</button>`).join('')}</div></div>`;
  }
  $('#main').innerHTML = `<div class="qtop"><button class="chip" data-act="qquit" aria-label="Quit">${ico('x')}</button><div class="bar"><i style="width:${pct}%"></i></div><span class="pill">${ico('heart')}${Q.hearts}</span></div>${Q.combo > 1 ? `<p class="mute">Combo ×${Q.combo}</p>` : ''}${body}`;
  if (q.t === 'type') { const a = $('#ans'); if (a) { a.focus(); a.onkeydown = e => { if (e.key === 'Enter') act.check(); }; } }
}
function record(w, correct) {
  const p = P(w.i), d = day();
  if (correct) { p.box = Math.min(5, (p.box || 0) + 1); p.ok++; d.ok++; Q.ok++; Q.combo++; const g = 10 + Math.min(5, Q.combo - 1); Q.xp += g; S.xp += g; }
  else { p.box = 0; p.bad++; d.bad++; Q.bad++; Q.combo = 0; Q.hearts--; }
  save();
}
function feedback(good, msg) {
  Q.locked = true;
  const el = document.createElement('div'); el.className = 'fb ' + (good ? 'good' : 'bad'); el.id = 'fb';
  el.innerHTML = `<div><b>${good ? 'Correct!' : 'Not quite'}</b><p style="margin:4px 0 12px">${msg}</p><button class="btn block ${good ? 'ok' : 'again'}" data-act="qnext">Continue</button></div>`;
  document.body.appendChild(el);
}
function qNext() {
  const f = $('#fb'); if (f) f.remove();
  Q.locked = false; Q.idx++;
  if (Q.hearts <= 0 || Q.idx >= Q.qs.length) Q.end = true;
  render();
}
function wrongQ(q, w) { if (q.t !== 'match' && !Q.retry.has(w.i) && Q.qs.length < 20) { Q.retry.add(w.i); Q.qs.push({ t: 'type', w }); } }

/* ---------- actions ---------- */
const act = {
  go: d => go(d.p),
  openw: d => { const id = +d.id; lq = [id].concat(lq.filter(x => x !== id)); go('learn'); },
  diff: d => { const p = P(nextWord().i), v = +d.v; p.d = p.d === v ? 0 : v; save(); rLearn(); },
  learned: () => {
    const w = nextWord(), p = P(w.i), dd = day();
    p.st = 1; p.again = false; p.box = Math.max(p.box, 1); dd.l++; S.xp += 5; lq.shift(); save();
    if (dd.l === S.set.daily) toast('Daily goal reached! Keep going if you like.');
    rLearn();
  },
  again: () => { const w = nextWord(), p = P(w.i); p.again = true; p.st = 0; lq.shift(); lq.splice(Math.min(4, lq.length), 0, w.i); save(); rLearn(); },
  smode: d => { sq.mode = d.m; shown = 30; rWords(); },
  more: () => { shown += 30; $('#res').innerHTML = resRows(); },
  detail: d => {
    const w = byId.get(+d.id); if (!w) return; const p = Pr(w.i);
    const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
    m.innerHTML = `<div class="sheet"><span class="lv">${LVN[levelOf(w)]}</span><div class="word">${esc(w.w)}</div><ul class="mean">${w.b.map(b => `<li>${esc(b)}</li>`).join('')}</ul>${w.e ? `<p class="ex">${hl(w.e, w.w)}</p>` : ''}
    <div class="row"><button class="chip ${p.d === 1 ? 'on' : ''}" data-act="mdiff" data-id="${w.i}" data-v="1">Easy</button><button class="chip ${p.d === 2 ? 'on' : ''}" data-act="mdiff" data-id="${w.i}" data-v="2">Hard</button></div>
    <div class="actions"><button class="btn ghost" data-act="closem">Close</button><button class="btn" data-act="learnthis" data-id="${w.i}">Learn now</button></div></div>`;
    document.body.appendChild(m);
  },
  mdiff: d => { const p = P(+d.id), v = +d.v; p.d = p.d === v ? 0 : v; save(); act.closem(); act.detail({ id: d.id }); },
  closem: () => { const m = $('#modal'); if (m) m.remove(); },
  learnthis: d => { act.closem(); act.openw(d); },
  addform: () => {
    const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
    m.innerHTML = `<div class="sheet"><h3>Add a word</h3><input type="text" id="nw" placeholder="English word" autocapitalize="off"><br><br><input type="text" id="nb" placeholder="Meaning (separate several with commas)"><br><br><input type="text" id="ne" placeholder="Example sentence (optional)"><div class="actions"><button class="btn ghost" data-act="closem">Cancel</button><button class="btn" data-act="savecustom">Save</button></div></div>`;
    document.body.appendChild(m);
  },
  savecustom: () => {
    const w = $('#nw').value.trim().toLowerCase(), b = $('#nb').value.split(/[,،;]/).map(x => x.trim()).filter(Boolean), e = $('#ne').value.trim();
    if (!w || !b.length) return toast('Enter a word and a meaning');
    S.cid = (S.cid || 0) + 1; S.custom.push({ i: -S.cid, w, b, e }); rebuildWords(); lq = []; save(); act.closem(); toast('Word added'); rWords();
  },
  delcustom: d => { const id = +d.id; S.custom = S.custom.filter(c => c.i !== id); delete S.prog[id]; rebuildWords(); lq = lq.filter(x => x !== id); save(); rWords(); },
  theme: d => { S.set.theme = d.t; save(); applyTheme(); rSettings(); },
  daily: d => { S.set.daily = +d.n; save(); rSettings(); },
  notif: async () => {
    if (S.set.notif) { S.set.notif = false; save(); schedule(); return rSettings(); }
    if (!('Notification' in window)) return toast('Notifications are not supported here');
    const r = await Notification.requestPermission();
    if (r !== 'granted') return toast('Notification permission denied');
    S.set.notif = true; save(); schedule(); regPeriodic(); rSettings();
  },
  testnotif: async () => { if (!('Notification' in window) || Notification.permission !== 'granted') return toast('Turn on the reminder first'); fire(true); },
  export: () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' }));
    a.download = 'learn-vocabulary-backup-' + today() + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  reset: () => { if (confirm('Delete all progress and custom words?')) { localStorage.removeItem(KEY); load(); rebuildWords(); lq = []; applyTheme(); render(); toast('Progress reset'); } },
  qmode: d => { sq.qm = d.m; rQuiz(); },
  qstart: () => {
    const qs = buildQuiz(sq.qm || 'all'); if (!qs) return toast('No words available');
    Q = { qs, idx: 0, hearts: 5, xp: 0, ok: 0, bad: 0, combo: 0, retry: new Set(), locked: false, end: false }; rQuiz();
  },
  qquit: () => { if (confirm('Quit this session?')) { const f = $('#fb'); if (f) f.remove(); Q = null; rQuiz(); } },
  opt: (d, el) => {
    if (Q.locked) return; const q = Q.qs[Q.idx], o = q.opts[+d.k], good = o.i === q.w.i, key = q.t === 'mc' ? 'b' : 'w';
    document.querySelectorAll('.opt').forEach((b, k) => { if (q.opts[k].i === q.w.i) b.classList.add('good'); });
    if (!good) el.classList.add('bad');
    record(q.w, good); if (!good) wrongQ(q, q.w);
    feedback(good, `${esc(q.w.w)} = ${esc(q.w.b.slice(0, 2).join(', '))}`);
  },
  check: () => {
    if (Q.locked) return; const q = Q.qs[Q.idx], v = ($('#ans').value || '').trim().toLowerCase(); if (!v) return;
    const good = v === q.w.w; record(q.w, good); if (!good) wrongQ(q, q.w);
    feedback(good, good ? esc(q.w.w) : `Answer: <b>${esc(q.w.w)}</b>`);
  },
  mt: d => {
    const q = Q.qs[Q.idx], m = q.m; if (Q.locked) return; const i = +d.i;
    if (d.s === 'l') m.a = m.a === i ? null : i; else m.b = m.b === i ? null : i;
    if (m.a != null && m.b != null) {
      if (m.a === m.b) { m.done.push(m.a); record(q.g[m.a], true); }
      else { record(q.g[m.a], false); toast('Try again'); }
      m.a = m.b = null;
      if (Q.hearts <= 0) { Q.end = true; return render(); }
      if (m.done.length === q.g.length) { render(); return feedback(true, 'All pairs matched'); }
    }
    render();
  },
  qnext: qNext
};
document.addEventListener('click', e => { const t = e.target.closest('[data-act]'); if (t && act[t.dataset.act]) act[t.dataset.act](t.dataset, t); });
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'q') { sq.text = t.value; shown = 30; $('#res').innerHTML = resRows(); }
  else if (t.dataset && t.dataset.set === 'font') { S.set.font = +t.value; applyTheme(); t.nextElementSibling.textContent = t.value + 'px'; save(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset && t.dataset.set === 'time') { S.set.time = t.value || '08:00'; save(); schedule(); }
  else if (t.id === 'imp' && t.files[0]) {
    const r = new FileReader();
    r.onload = () => { try { const o = JSON.parse(r.result); if (!o.prog || !o.set) throw 0; S = Object.assign({ set: {}, prog: {}, custom: [], days: {}, start: today(), xp: 0, cid: 0, lastNotif: '' }, o); S.set = Object.assign({}, DEF, S.set); rebuildWords(); lq = []; save(); applyTheme(); render(); toast('Backup restored'); } catch (x) { toast('Invalid backup file'); } };
    r.readAsText(t.files[0]);
  }
});

/* ---------- notifications ---------- */
function nextForNotif() { const w = nextWord(); return w ? { w: w.w, b: w.b[0] } : null; }
function syncSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(r => { if (r.active) r.active.postMessage({ type: 'cfg', set: S.set, last: S.lastNotif, next: nextForNotif() }); }).catch(() => {});
}
async function regPeriodic() {
  try { const r = await navigator.serviceWorker.ready; if (r.periodicSync) await r.periodicSync.register('daily-word', { minInterval: 12 * 3600 * 1000 }); } catch (e) {}
}
async function fire(test) {
  if (!S.set.notif && !test) return;
  try {
    const r = await navigator.serviceWorker.ready, n = nextForNotif();
    await r.showNotification('Learn Vocabulary', { body: n ? n.w + ' — ' + n.b : 'Time for your daily words!', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'daily-word', data: { url: './?page=learn' } });
    if (!test) { S.lastNotif = today(); save(); }
  } catch (e) {}
  if (!test) schedule();
}
function schedule() {
  clearTimeout(timer); if (!S.set.notif) return;
  const [h, m] = S.set.time.split(':'), t = new Date(); t.setHours(+h, +m, 0, 0);
  if (t <= new Date()) t.setDate(t.getDate() + 1);
  timer = setTimeout(() => fire(false), Math.min(t - new Date(), 2147000000));
}

/* ---------- boot ---------- */
async function boot() {
  load(); applyTheme();
  const q = new URLSearchParams(location.search).get('page'); if (TITLES[q]) page = q;
  try { const r = await fetch('data/words.json'); rebuildWords(await r.json()); }
  catch (e) { $('#main').innerHTML = '<div class="card"><h2>Could not load word data</h2><p>Open the app once with an internet connection, then it works offline.</p></div>'; return; }
  buildQ();
  if (S.set.notif && S.lastNotif !== today()) { const [h, m] = S.set.time.split(':'), t = new Date(); t.setHours(+h, +m, 0, 0); if (new Date() >= t) { S.lastNotif = today(); } }
  render(); schedule();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => syncSW()).catch(() => {});
    navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.type === 'go') go(e.data.page); });
  }
}
boot();
