'use strict';
/* Learn Vocabulary v0.0.2 – offline PWA. Data: data/words.json (credits in README). */
const VERSION = '0.0.2';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dkey = d => d.toLocaleDateString('en-CA');
const today = () => dkey(new Date());
const KEY = 'lv_state_v1';
const DEF = { font: 17, fontStyle: 'classic', theme: 'light', daily: 10, nl: { on: false, time: '08:00' }, nq: { on: false, time: '18:00' } };
const DEFQ = { src: 'all', lvl: 'any', types: ['mc', 'rev', 'fill', 'type', 'match'], len: 10 };

const IC = {
  home: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  learn: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M9 7h6M9 11h6"/>',
  score: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  words: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  quiz: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
  settings: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  check: '<path d="M4 12l5 5L20 6"/>', refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
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
/* difficulty: auto level from word frequency, user can override (d: 1 easy, 3 medium, 2 hard, 4 very hard) */
const LVN = ['Easy', 'Medium', 'Hard', 'Very hard'], DMAP = { 1: 0, 3: 1, 2: 2, 4: 3 }, DCODE = [1, 3, 2, 4];
const TYPE_LABEL = { daily: 'Daily words', easy: 'Easy', medium: 'Medium', hard: 'Hard', vhard: 'Very hard', miss: 'Mistakes', later: 'Learn later', again: 'Learn again', mEasy: 'Marked easy', mHard: 'Marked hard' };

let S, W = [], byId = new Map(), page = 'home', Q = null, timers = {}, shown = 30, customOpen = false;
let sq = { mode: 'en', text: '' };

/* ---------- state ---------- */
function fresh() { return { set: JSON.parse(JSON.stringify(DEF)), prog: {}, custom: [], days: {}, start: today(), xp: 0, cid: 0, last: { l: '', q: '' }, sess: null, slides: 0, quizzes: 0, qcfg: JSON.parse(JSON.stringify(DEFQ)) }; }
function normalize(o) {
  const f = fresh(); o = o || {}; const old = o.set || {};
  const n = Object.assign(f, o);
  n.set = Object.assign({}, DEF, old);
  n.set.nl = Object.assign({}, DEF.nl, old.nl || (old.time ? { on: !!old.notif, time: old.time } : {}));
  n.set.nq = Object.assign({}, DEF.nq, old.nq || {});
  n.last = Object.assign({ l: '', q: '' }, o.last || {});
  n.qcfg = Object.assign({}, DEFQ, o.qcfg || {});
  return n;
}
function load() { let o = null; try { o = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} S = normalize(o); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} syncSW(); }
const P = id => S.prog[id] || (S.prog[id] = { st: 0, box: 0, ok: 0, bad: 0, d: 0, again: false, seen: 0 });
const Pr = id => S.prog[id] || {};
const day = () => S.days[today()] || (S.days[today()] = { l: 0, ok: 0, bad: 0 });
const isLearned = w => Pr(w.i).st === 1;
const learnedCount = () => Object.values(S.prog).filter(p => p.st === 1).length;
function levelOf(w) {
  const p = Pr(w.i); if (p.d) return DMAP[p.d];
  if (w.c) return 1; return w.z >= 4.6 ? 0 : w.z >= 3.6 ? 1 : w.z >= 3.0 ? 2 : 3;
}
function streak() {
  const act = k => { const r = S.days[k]; return r && (r.l || r.ok || r.bad); };
  let n = 0, d = new Date(); if (!act(dkey(d))) d.setDate(d.getDate() - 1);
  while (act(dkey(d))) { n++; d.setDate(d.getDate() - 1); } return n;
}
function dayList() { // every day from start to today
  const out = [], d = new Date(S.start + 'T12:00:00'), end = today();
  for (let k = 0; k < 4000; k++) { const key = dkey(d); const r = S.days[key] || { l: 0, ok: 0, bad: 0 }; out.push({ key, d: new Date(d), r, miss: key < end && !r.l, now: key === end }); if (key >= end) break; d.setDate(d.getDate() + 1); }
  return out;
}
const missedRecent = () => dayList().filter(x => x.miss).slice(-7).filter(x => (new Date(today() + 'T12:00:00') - x.d) / 864e5 <= 7);
function rebuildWords(base) {
  W = (base || W.filter(w => w.i >= 0)).concat(S.custom.map(c => ({ i: c.i, w: c.w, b: c.b, e: c.e || '', z: 0, c: 1 })));
  byId = new Map(W.map(w => [w.i, w]));
}
const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function applyTheme() {
  const t = S.set.theme === 'system' ? (mq && mq.matches ? 'dark' : 'light') : S.set.theme, h = document.documentElement;
  h.setAttribute('data-theme', t); h.setAttribute('data-font', S.set.fontStyle); h.style.fontSize = S.set.font + 'px';
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = getComputedStyle(h).getPropertyValue('--bg').trim() || '#f7f0e1';
}
if (mq && mq.addEventListener) mq.addEventListener('change', () => { if (S && S.set.theme === 'system') applyTheme(); });

/* ---------- navigation ---------- */
function go(p) { const f = $('#fb'); if (f) f.remove(); page = p; if (p !== 'quiz') Q = null; render(); window.scrollTo(0, 0); }
function renderNav() { $('#nav').innerHTML = ['home', 'learn', 'score', 'words', 'quiz', 'settings'].map(p => `<button class="${p === page ? 'on' : ''}" data-act="go" data-p="${p}" aria-label="${TITLES[p]}">${ico(p)}</button>`).join(''); }
function render() {
  $('#title').textContent = TITLES[page];
  $('#scene').style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 320' preserveAspectRatio='xMidYMax slice'>${SCENES[page]}</svg>`)}")`;
  renderNav();
  ({ home: rHome, learn: rLearn, score: rScore, words: rWords, quiz: rQuiz, settings: rSettings })[page]();
  document.querySelectorAll('.fab').forEach(x => x.remove());
  if (page === 'words') { const b = document.createElement('button'); b.className = 'fab'; b.dataset.act = 'addform'; b.setAttribute('aria-label', 'Add word'); b.innerHTML = ico('plus'); document.body.appendChild(b); }
}
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }
function hl(text, word) {
  const t = esc(text); if (!word) return t;
  try { return t.replace(new RegExp('\\b(' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*)', 'ig'), '<mark>$1</mark>'); } catch (e) { return t; }
}
const dlabel = k => new Date(k + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' });

/* ---------- word lists & learning slides ---------- */
const TF = {
  easy: w => levelOf(w) === 0 && !isLearned(w), medium: w => levelOf(w) === 1 && !isLearned(w), hard: w => levelOf(w) === 2 && !isLearned(w), vhard: w => levelOf(w) === 3 && !isLearned(w),
  miss: w => !!Pr(w.i).miss, later: w => !!Pr(w.i).later && !isLearned(w), again: w => !!Pr(w.i).again && !isLearned(w),
  mEasy: w => Pr(w.i).d === 1 && !isLearned(w), mHard: w => (Pr(w.i).d === 2 || Pr(w.i).d === 4) && !isLearned(w)
};
function wordsOf(t) { const r = W.filter(TF[t]); if (t === 'miss') r.sort((a, b) => Pr(b.i).bad - Pr(a.i).bad); return r; }
function dailyIds(n) {
  const out = [], add = w => { if (out.length < n && !out.includes(w.i) && !isLearned(w)) out.push(w.i); };
  W.filter(TF.again).forEach(add); S.custom.forEach(c => { const w = byId.get(c.i); if (w && !Pr(w.i).later) add(w); });
  for (const w of W) { if (out.length >= n) break; if (w.i >= 0 && !Pr(w.i).later) add(w); }
  return out;
}
function startSess(t, first) {
  const n = S.set.daily; let ids = t === 'daily' ? dailyIds(n + 1) : wordsOf(t).map(w => w.i);
  if (first != null) { ids = ids.filter(x => x !== first); ids.unshift(first); }
  ids = ids.slice(0, n);
  if (!ids.length) { toast('No words in this list'); return false; }
  S.sess = { t, ids, total: ids.length, done: 0, fin: false }; save(); return true;
}
function curWord() { const s = S.sess; return s && !s.fin && s.ids.length ? byId.get(s.ids[0]) : null; }
const reviewIds = () => Object.keys(S.prog).map(Number).filter(i => byId.has(i) && S.prog[i].st !== 1 && (S.prog[i].again || S.prog[i].seen));
function chips(w, p) { return `<div class="chips">${DCODE.map((c, k) => `<button class="chip ${p.d === c ? 'on' : ''}" data-act="setd" data-id="${w.i}" data-v="${c}">${LVN[k]}</button>`).join('')}</div>`; }

/* ---------- shared cards ---------- */
function goalCard() {
  const d = (S.days[today()] || { l: 0 }).l, goal = S.set.daily; if (d >= goal) return '';
  return `<button class="big" data-act="startdaily"><b>Today's words: ${d} / ${goal}</b><span>${d ? 'Keep going' : 'Start'} — ${goal - d} more to reach today's goal. Tap to begin.</span></button>`;
}
function reminderPassed() { const [h, m] = S.set.nl.time.split(':'), t = new Date(); t.setHours(+h, +m, 0, 0); return new Date() >= t; }

/* ---------- pages ---------- */
const LOGO = `<svg class="logo" viewBox="0 0 300 100" role="img" aria-label="Learn Vocabulary"><circle cx="46" cy="50" r="36" fill="none" stroke="var(--acc)" stroke-width="3"/><circle cx="46" cy="50" r="30" fill="none" stroke="var(--acc2)" stroke-width="1.2"/><text x="46" y="63" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="700" font-size="36" fill="var(--acc)">LV</text><text x="94" y="46" font-family="Georgia,'Times New Roman',serif" font-size="25" font-weight="700" letter-spacing="1" fill="currentColor">Learn</text><text x="94" y="74" font-family="Georgia,'Times New Roman',serif" font-size="25" font-style="italic" fill="var(--acc)">Vocabulary</text><path d="M94 82h190" stroke="var(--acc2)" stroke-width="1.5"/></svg>`;
function rHome() {
  const n = S.set.daily, ms = missedRecent();
  let ids = reviewIds().slice(0, 15), title = 'Continue where you left off';
  if (!ids.length) { ids = dailyIds(8); title = 'Up next'; }
  const lists = [['mEasy', 'Easy'], ['mHard', 'Hard'], ['again', 'Learn again'], ['later', 'Learn later'], ['miss', 'Mistakes']];
  $('#main').innerHTML = `${LOGO}
  <div class="card"><h3>Welcome</h3><p style="margin:0">Learn English words with Bengali meanings, <b>${W.length}</b> words in total. Study in slides of <b>${n}</b> words, mark words as easy or hard, practise with quizzes, and track every day of your progress. Everything works offline.</p></div>
  ${goalCard() && (reminderPassed() || (S.days[today()] || {}).l) ? goalCard() : ''}
  ${ms.length ? `<button class="big warn" data-act="startdaily"><b>You missed ${ms.length} day${ms.length > 1 ? 's' : ''}</b><span>${ms.map(x => dlabel(x.key)).join(', ')}. Tap to catch up now.</span></button>` : ''}
  <div class="boxes">
    <button class="box" data-act="go" data-p="learn">${ico('learn')}<b>Learn</b><span>Study ${n} words per slide. Choose Easy, Medium, Hard, Very hard, Mistakes or Later.</span></button>
    <button class="box" data-act="go" data-p="quiz">${ico('quiz')}<b>Quiz</b><span>Matching, MCQ, fill in the blank and typing. Pick difficulty and question types.</span></button>
    <button class="box" data-act="go" data-p="score">${ico('score')}<b>Score</b><span>Accuracy ring, learning days, missed days and your full history.</span></button>
    <button class="box" data-act="go" data-p="words">${ico('words')}<b>Words</b><span>Search English or বাংলা and add your own words with meanings.</span></button>
    <button class="box wide" data-act="go" data-p="settings">${ico('settings')}<b>Settings</b><span>Theme, fonts, words per day and two daily reminders (learning and quiz).</span></button>
  </div>
  <h3>${title}</h3>
  <div class="slider">${ids.map(i => { const w = byId.get(i); return `<button class="slide" data-act="openw" data-id="${i}"><b>${esc(w.w)}</b><span>${esc(w.b[0])}</span></button>`; }).join('') || '<p class="mute">Nothing pending.</p>'}</div>
  <h3 class="sub">My lists</h3>
  <div class="boxes">${lists.map(([t, l]) => `<button class="box" data-act="list" data-t="${t}"><em>${wordsOfList(t).length}</em><b>${l}</b></button>`).join('')}</div>`;
}
function wordsOfList(t) { // lists on Home include already learned words where relevant
  if (t === 'mEasy') return W.filter(w => Pr(w.i).d === 1);
  if (t === 'mHard') return W.filter(w => Pr(w.i).d === 2 || Pr(w.i).d === 4);
  if (t === 'again') return W.filter(w => Pr(w.i).again && !isLearned(w));
  if (t === 'later') return W.filter(w => Pr(w.i).later && !isLearned(w));
  return W.filter(w => Pr(w.i).miss);
}
function rLearn() {
  const s = S.sess, n = S.set.daily; if (s && !s.fin && !s.ids.length) s.fin = true; const w = curWord();
  if (s && s.fin) {
    $('#main').innerHTML = `<div class="card" style="text-align:center"><h2>Slide complete</h2><p>You finished ${s.done} word${s.done === 1 ? '' : 's'} in this slide.</p>
    <div class="bar"><i style="width:100%"></i></div><div class="actions"><button class="btn ghost" data-act="endsess">Back</button><button class="btn" data-act="newslide" data-t="${s.t}">New slide</button></div></div>`;
    return;
  }
  if (w) {
    const p = P(w.i); p.seen = 1;
    $('#main').innerHTML = `<div class="ring"><button class="chip" data-act="endsess" aria-label="Close slide">${ico('x')}</button><div class="bar" style="flex:1"><i style="width:${s.done / s.total * 100}%"></i></div><span class="mute">${s.done}/${s.total}</span></div>
    <p class="mute" style="margin:0 0 8px">${TYPE_LABEL[s.t]}</p>
    <article class="card"><span class="lv">${LVN[levelOf(w)]}</span>${p.again ? ' <span class="lv">Review</span>' : ''}${p.miss ? ' <span class="lv">Mistake</span>' : ''}
    <div class="word">${esc(w.w)}</div><ul class="mean">${w.b.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    ${w.e ? `<p class="ex">${hl(w.e, w.w)}</p>` : ''}${chips(w, p)}</article>
    <div class="actions"><button class="btn again" data-act="again">${ico('refresh')} Learn again</button><button class="btn ok" data-act="learned">${ico('check')} Learned</button></div>
    <button class="btn ghost block" style="margin-top:12px" data-act="laterc">Learn later</button>`;
    return;
  }
  const types = ['easy', 'medium', 'hard', 'vhard', 'miss', 'later', 'again'];
  $('#main').innerHTML = `${goalCard() || `<div class="card"><h3>Daily goal complete</h3><p class="mute" style="margin:0">You learned ${n} words today. Start another slide whenever you like.</p></div>`}
  <button class="btn block" data-act="newslide" data-t="daily">${ico('learn')} Start a new slide (${n} words)</button>
  <h3 class="sub">Learn by type</h3>
  <div class="boxes">${types.map(t => `<button class="box" data-act="newslide" data-t="${t}"><em>${wordsOf(t).length}</em><b>${TYPE_LABEL[t]}</b></button>`).join('')}</div>`;
}
function ringSvg(c, w, nq) {
  const tot = c + w + nq || 1, R = 52, C = 2 * Math.PI * R, q = c + w, pct = q ? Math.round(c / q * 100) : 0;
  const seg = (v, off, col) => v ? `<circle r="${R}" cx="70" cy="70" fill="none" style="stroke:${col}" stroke-width="16" stroke-dasharray="${v / tot * C} ${C}" stroke-dashoffset="${-off / tot * C}" transform="rotate(-90 70 70)"/>` : '';
  return `<svg viewBox="0 0 140 140"><circle r="${R}" cx="70" cy="70" fill="none" style="stroke:var(--line)" stroke-width="16"/>${seg(c, 0, 'var(--good)')}${seg(w, c, 'var(--bad)')}<text x="70" y="78" text-anchor="middle" font-size="28">${pct}%</text></svg>`;
}
function rScore() {
  const L = learnedCount(), total = W.length, rem = Math.max(0, total - L), daily = S.set.daily;
  let c = 0, w = 0, nq = 0; W.forEach(x => { const p = Pr(x.i); if (p.st !== 1) return; if (p.miss) w++; else if (p.ok > 0) c++; else nq++; });
  const dl = dayList(), learnedDays = dl.filter(x => x.r.l > 0).length, missedDays = dl.filter(x => x.miss).length;
  const byL = [0, 0, 0, 0]; W.forEach(x => { if (isLearned(x)) byL[levelOf(x)]++; });
  const hard = W.filter(x => Pr(x.i).bad).sort((a, b) => Pr(b.i).bad - Pr(a.i).bad).slice(0, 5);
  $('#main').innerHTML = `<div class="card"><h3>Quiz accuracy on learned words</h3><div class="donut">${ringSvg(c, w, nq)}
  <div class="leg"><div><i style="background:var(--good)"></i>Correct: <b>${c}</b></div><div><i style="background:var(--bad)"></i>Wrong: <b>${w}</b></div><div><i style="background:var(--line)"></i>Not quizzed: <b>${nq}</b></div></div></div></div>
  <div class="card"><h3>Learning days</h3><p class="mute" style="margin-top:0">${dl.length} day${dl.length > 1 ? 's' : ''} since you started · ${learnedDays} learned · <b style="color:var(--bad)">${missedDays} missed</b>. Swipe to see every day.</p>
  <div class="days" id="days">${dl.map(x => `<div class="day ${x.miss ? 'miss' : ''} ${x.now ? 'now' : ''}"><small>${x.d.toLocaleDateString('en', { weekday: 'short' })}</small><b>${x.d.getDate()}</b><small>${x.d.toLocaleDateString('en', { month: 'short', year: '2-digit' })}</small><em>${x.miss ? 'Missed' : x.r.l ? x.r.l + ' learned' : x.now ? 'Today' : '—'}</em><u>${x.r.ok + x.r.bad ? x.r.ok + ' right · ' + x.r.bad + ' wrong' : 'No quiz'}</u></div>`).join('')}</div></div>
  <div class="card"><h3>Progress</h3><div class="bar"><i style="width:${total ? L / total * 100 : 0}%"></i></div>
  <p class="mute">${L} of ${total} words learned. At ${daily} words a day, about <b>${Math.ceil(rem / daily)}</b> days remain.</p></div>
  <div class="grid" style="margin-bottom:14px"><div class="stat"><b>${streak()}</b><span>Day streak</span></div><div class="stat"><b>${S.xp}</b><span>XP</span></div><div class="stat"><b>${S.slides}</b><span>Slides done</span></div><div class="stat"><b>${S.quizzes}</b><span>Quizzes done</span></div></div>
  <div class="card"><h3>Learned by level</h3><p class="mute" style="margin:0">Easy ${byL[0]} · Medium ${byL[1]} · Hard ${byL[2]} · Very hard ${byL[3]}</p></div>
  ${hard.length ? `<div class="card"><h3>Most missed</h3>${hard.map(x => `<div class="res" data-act="detail" data-id="${x.i}"><b>${esc(x.w)}</b><span>${Pr(x.i).bad}× wrong</span></div>`).join('')}</div>` : ''}`;
  const st = $('#days'); if (st) st.scrollLeft = st.scrollWidth;
}
function searchList() {
  const q = sq.text.trim().toLowerCase(), qb = sq.text.trim();
  if (!q) return { list: W.slice(0, 400), n: Math.min(400, W.length) };
  const a = [], b = [];
  for (const w of W) {
    if (sq.mode === 'en') { if (w.w.startsWith(q)) a.push(w); else if (w.w.includes(q)) b.push(w); }
    else { if (w.b.some(x => x.startsWith(qb))) a.push(w); else if (w.b.some(x => x.includes(qb))) b.push(w); }
  }
  const l = a.concat(b); return { list: l, n: l.length };
}
function resRows() {
  const { list, n } = searchList();
  return list.slice(0, shown).map(w => `<div class="res" data-act="detail" data-id="${w.i}"><b>${esc(w.w)}</b><span>${esc(w.b.slice(0, 2).join(', '))}</span></div>`).join('') + (n > shown ? `<button class="btn ghost block" style="margin:10px 0" data-act="more">Show more (${n - shown})</button>` : '') + (n ? '' : '<p class="mute">No results.</p>');
}
function rWords() {
  $('#main').innerHTML = `<div class="seg"><button class="${sq.mode === 'en' ? 'on' : ''}" data-act="smode" data-m="en">English</button><button class="${sq.mode === 'bn' ? 'on' : ''}" data-act="smode" data-m="bn">বাংলা</button></div>
  <input type="text" id="q" placeholder="${sq.mode === 'en' ? 'Search English word' : 'বাংলা শব্দ খুঁজুন'}" value="${esc(sq.text)}" autocomplete="off" autocapitalize="off">
  <div id="res" class="card" style="margin-top:12px;padding:6px 14px">${resRows()}</div>
  ${S.custom.length ? `<h3>My words (${S.custom.length})</h3><div class="card" style="padding:6px 14px">${S.custom.map(c => `<div class="res"><span data-act="detail" data-id="${c.i}" style="text-align:left;color:var(--ink);flex:1"><b>${esc(c.w)}</b> – ${esc(c.b.join(', '))}</span><button class="chip" data-act="delcustom" data-id="${c.i}" aria-label="Delete">${ico('trash')}</button></div>`).join('')}</div>` : ''}`;
}
const sw = (on, k) => `<button class="sw ${on ? 'on' : ''}" data-act="rem" data-k="${k}" aria-label="Toggle reminder"></button>`;
function rSettings() {
  const s = S.set, presets = [5, 10, 15, 20, 30, 50], isCustom = customOpen || !presets.includes(s.daily);
  $('#main').innerHTML = `<div class="card"><h3>Appearance</h3>
  <div class="set"><label>Theme</label></div><div class="chips">${[['system', 'System'], ['light', 'Light'], ['dark', 'Dark'], ['sepia', 'Sepia'], ['forest', 'Forest']].map(([t, l]) => `<button class="chip ${s.theme === t ? 'on' : ''}" data-act="theme" data-t="${t}">${l}</button>`).join('')}</div>
  <div class="set" style="margin-top:8px"><label>Font style</label></div><div class="chips">${[['classic', 'Classic'], ['serif', 'Serif'], ['sans', 'Sans']].map(([t, l]) => `<button class="chip ${s.fontStyle === t ? 'on' : ''}" data-act="fstyle" data-t="${t}">${l}</button>`).join('')}</div>
  <div class="set" style="margin-top:8px"><label>Text size</label><span class="mute">${s.font}px</span></div><input type="range" min="14" max="24" step="1" value="${s.font}" data-set="font"></div>
  <div class="card"><h3>Words per day</h3><div class="chips">${presets.map(n => `<button class="chip ${!isCustom && s.daily === n ? 'on' : ''}" data-act="daily" data-n="${n}">${n}</button>`).join('')}<button class="chip ${isCustom ? 'on' : ''}" data-act="dcustom">Custom</button></div>
  ${isCustom ? `<div class="set"><label>Enter a number</label><input type="number" min="1" max="500" value="${s.daily}" data-set="daily"></div>` : ''}</div>
  <div class="card"><h3>Reminders</h3>
  <div class="set"><label>Learning<small>Complete your next slide</small></label>${sw(s.nl.on, 'nl')}</div><div class="set"><label>Time</label><input type="time" value="${s.nl.time}" data-set="time" data-k="nl"></div>
  <div class="set"><label>Quiz<small>Test what you learned</small></label>${sw(s.nq.on, 'nq')}</div><div class="set"><label>Time</label><input type="time" value="${s.nq.time}" data-set="time" data-k="nq"></div>
  <p class="mute">Install the app from Chrome's menu for best results. When the app is closed, Chrome decides the exact delivery time.</p></div>
  <div class="card"><h3>Data</h3><div class="row"><button class="btn ghost" data-act="export">Export</button><label class="btn ghost">Import<input type="file" accept="application/json" id="imp" hidden></label><button class="btn ghost" data-act="reset">Reset</button></div>
  <p class="mute">Progress is stored in this browser. Export a backup before clearing Chrome data.</p></div>
  <p class="mute" style="text-align:center">Learn Vocabulary · Version ${VERSION}<br>Word data: BengaliDictionary by Minhas Kamal (GPL-3.0) · Fonts: Noto, Playfair Display (OFL)</p>`;
}

/* ---------- quiz ---------- */
const QT = { mc: 'MCQ: English → Bengali', rev: 'MCQ: Bengali → English', fill: 'Fill in the blank', type: 'Type the answer', match: 'Match pairs' };
const QL = [['any', 'Any'], ['0', 'Easy'], ['1', 'Medium'], ['2', 'Hard'], ['3', 'Very hard'], ['miss', 'Mistakes']];
function blank(w) { if (!w.e) return null; const re = new RegExp('\\b' + w.w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*', 'i'); return re.test(w.e) ? w.e.replace(re, '_____') : null; }
function pool(cfg) {
  let base;
  if (cfg.src === 'mine') base = S.custom.map(c => byId.get(c.i));
  else { const ids = Object.keys(S.prog).map(Number).filter(i => byId.has(i) && (S.prog[i].seen || S.prog[i].st === 1)); S.custom.forEach(c => { if (!ids.includes(c.i)) ids.push(c.i); }); base = ids.map(i => byId.get(i)); }
  base = base.filter(Boolean);
  if (cfg.lvl === 'miss') return base.filter(w => Pr(w.i).miss).length ? base.filter(w => Pr(w.i).miss) : W.filter(w => Pr(w.i).miss && (cfg.src !== 'mine' || w.c));
  if (cfg.lvl !== 'any') {
    const k = +cfg.lvl; let l = base.filter(w => levelOf(w) === k);
    if (cfg.src !== 'mine') for (const w of W) { if (l.length >= 14) break; if (w.i >= 0 && levelOf(w) === k && !l.includes(w)) l.push(w); }
    return l;
  }
  if (cfg.src !== 'mine') for (let k = 0; base.length < 12 && k < W.length; k++) if (W[k].i >= 0 && !base.includes(W[k])) base.push(W[k]);
  return base;
}
function weight(w) { const p = Pr(w.i); return 1 + (p.again ? 3 : 0) + (levelOf(w) >= 2 ? 2 : 0) + (p.d === 1 ? -.5 : 0) + Math.max(0, 3 - (p.box || 0)) + Math.min(4, p.bad || 0) + (p.miss ? 3 : 0); }
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
  const out = [], seen = new Set([key === 'b' ? w.b[0] : w.w]); let g = 0;
  while (out.length < 3 && g++ < 300) { const c = W[rnd(W.length)], v = key === 'b' ? c.b[0] : c.w; if (c.i !== w.i && !seen.has(v) && !(key === 'b' && w.b.includes(v))) { seen.add(v); out.push(c); } }
  return out;
}
function buildQuiz(cfg) {
  let pl = pool(cfg), en = cfg.types.slice();
  if (en.length === 1 && en[0] === 'fill') pl = pl.filter(blank);
  if (!pl.length) return null;
  const ws = pick(pl, Math.min(pl.length, cfg.len)), order = shuffle(en), qs = [];
  for (let k = 0; k < cfg.len; k++) {
    let t = order[k % order.length]; const w = ws[k % ws.length];
    if (t === 'match') { const g = pick(pl, Math.min(5, pl.length), true); if (g.length >= 3) { qs.push({ t, g }); continue; } t = en.find(x => x !== 'match' && x !== 'fill') || 'mc'; }
    if (t === 'fill') { const s = blank(w); if (s) { qs.push({ t, w, s }); continue; } t = en.find(x => x !== 'match' && x !== 'fill') || 'mc'; }
    qs.push({ t, w });
  }
  return qs;
}
function rQuiz() {
  const cf = S.qcfg;
  if (!Q) {
    $('#main').innerHTML = `<div class="card"><h2>Vocabulary quiz</h2><p class="mute" style="margin-top:0">Words you mark hard, review again or get wrong appear more often.</p>
    <div class="seg"><button class="${cf.src !== 'mine' ? 'on' : ''}" data-act="qsrc" data-m="all">All words</button><button class="${cf.src === 'mine' ? 'on' : ''}" data-act="qsrc" data-m="mine">My words</button></div>
    <h3 class="sub" style="margin-top:4px">Difficulty</h3><div class="chips">${QL.map(([v, l]) => `<button class="chip ${cf.lvl === v ? 'on' : ''}" data-act="qlvl" data-v="${v}">${l}</button>`).join('')}</div>
    <h3 class="sub">Customize</h3><div class="chips">${Object.keys(QT).map(t => `<button class="chip ${cf.types.includes(t) ? 'on' : ''}" data-act="qtype" data-t="${t}">${QT[t]}</button>`).join('')}</div>
    <h3 class="sub">Questions</h3><div class="chips">${[10, 15, 20].map(n => `<button class="chip ${cf.len === n ? 'on' : ''}" data-act="qlen" data-n="${n}">${n}</button>`).join('')}</div><br>
    <button class="btn block" data-act="qstart">Start</button></div>`;
    return;
  }
  if (Q.end) {
    const tot = Q.ok + Q.bad, acc = tot ? Math.round(Q.ok / tot * 100) : 0;
    $('#main').innerHTML = `<div class="card" style="text-align:center"><h2>${Q.hearts <= 0 ? 'Out of hearts' : 'Session complete'}</h2>
    <div class="grid" style="margin:14px 0"><div class="stat"><b>${Q.xp}</b><span>XP</span></div><div class="stat"><b>${acc}%</b><span>Accuracy</span></div><div class="stat"><b>${Q.ok}</b><span>Correct</span></div><div class="stat"><b>${Q.bad}</b><span>Wrong</span></div></div>
    <div class="actions"><button class="btn ghost" data-act="qquit2">Settings</button><button class="btn" data-act="qstart">Play again</button></div></div>`;
    return;
  }
  const q = Q.qs[Q.idx], pct = Q.idx / Q.qs.length * 100; let body = '';
  if (q.t === 'mc' || q.t === 'rev' || q.t === 'fill') {
    if (!q.opts) q.opts = shuffle([q.w].concat(distract(q.w, q.t === 'mc' ? 'b' : 'w')));
    const head = q.t === 'mc' ? `<p class="qtitle">What does this word mean?</p><div class="qword">${esc(q.w.w)}</div>` : q.t === 'rev' ? `<p class="qtitle">Choose the English word</p><div class="qword">${esc(q.w.b[0])}</div>` : `<p class="qtitle">Fill in the blank</p><div class="ex" style="font-size:1.15rem">${esc(q.s)}</div><p class="mute">Hint: ${esc(q.w.b[0])}</p>`;
    body = head + q.opts.map((o, k) => `<button class="opt" data-act="opt" data-k="${k}">${esc(q.t === 'mc' ? o.b[0] : o.w)}</button>`).join('');
  } else if (q.t === 'type') {
    body = `<p class="qtitle">Type the English word</p><div class="qword">${esc(q.w.b.slice(0, 2).join(' / '))}</div><input type="text" id="ans" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="English word"><br><br><button class="btn block" data-act="check">Check</button>`;
  } else {
    if (!q.m) q.m = { l: shuffle(q.g.map((_, i) => i)), r: shuffle(q.g.map((_, i) => i)), a: null, b: null, done: [] };
    const m = q.m, tk = (i, s, txt, cur) => `<button class="tok ${m.done.includes(i) ? 'done' : ''} ${cur === i ? 'sel' : ''}" data-act="mt" data-s="${s}" data-i="${i}" style="width:100%;margin-bottom:10px">${esc(txt)}</button>`;
    body = `<p class="qtitle">Match the pairs</p><div class="match"><div>${m.l.map(i => tk(i, 'l', q.g[i].w, m.a)).join('')}</div><div>${m.r.map(i => tk(i, 'r', q.g[i].b[0], m.b)).join('')}</div></div>`;
  }
  $('#main').innerHTML = `<div class="qtop"><button class="chip" data-act="qquit" aria-label="Quit">${ico('x')}</button><div class="bar"><i style="width:${pct}%"></i></div><span class="pill">${ico('heart')}${Q.hearts}</span></div>${Q.combo > 1 ? `<p class="mute">Combo ×${Q.combo}</p>` : ''}${body}`;
  if (q.t === 'type') { const a = $('#ans'); if (a) { a.focus(); a.onkeydown = e => { if (e.key === 'Enter') act.check(); }; } }
}
function record(w, correct) {
  const p = P(w.i), d = day();
  if (correct) { p.box = Math.min(5, (p.box || 0) + 1); p.ok++; p.miss = false; d.ok++; Q.ok++; Q.combo++; const g = 10 + Math.min(5, Q.combo - 1); Q.xp += g; S.xp += g; }
  else { p.box = 0; p.bad++; p.miss = true; d.bad++; Q.bad++; Q.combo = 0; Q.hearts--; }
  save();
}
function feedback(good, msg) {
  Q.locked = true; const el = document.createElement('div'); el.className = 'fb ' + (good ? 'good' : 'bad'); el.id = 'fb';
  el.innerHTML = `<div><b>${good ? 'Correct!' : 'Not quite'}</b><p style="margin:4px 0 12px">${msg}</p><button class="btn block ${good ? 'ok' : 'again'}" data-act="qnext">Continue</button></div>`;
  document.body.appendChild(el);
}
function qNext() {
  const f = $('#fb'); if (f) f.remove(); Q.locked = false; Q.idx++;
  if (Q.hearts <= 0 || Q.idx >= Q.qs.length) { Q.end = true; if (!Q.counted) { Q.counted = 1; if (Q.ok) { S.quizzes++; save(); } } }
  render();
}
function wrongQ(q, w) { if (q.t !== 'match' && !Q.retry.has(w.i) && Q.qs.length < 24) { Q.retry.add(w.i); Q.qs.push({ t: 'type', w }); } }

/* ---------- actions ---------- */
const act = {
  go: d => go(d.p),
  startdaily: () => { const s = S.sess; if (!(s && !s.fin && s.t === 'daily') && !startSess('daily')) return; go('learn'); },
  newslide: d => { if (startSess(d.t)) { go('learn'); } },
  endsess: () => { S.sess = null; save(); render(); },
  openw: d => { if (startSess('daily', +d.id)) go('learn'); },
  setd: d => { const p = P(+d.id), v = +d.v; p.d = p.d === v ? 0 : v; save(); if ($('#modal')) { act.closem(); act.detail({ id: d.id }); } else render(); },
  learned: () => {
    const w = curWord(), s = S.sess, p = P(w.i), dd = day();
    p.st = 1; p.again = false; p.later = false; if (s.t === 'miss') p.miss = false;
    dd.l++; S.xp += 5; s.ids.shift(); s.done++;
    if (!s.ids.length) { s.fin = true; S.slides++; }
    save(); if (dd.l === S.set.daily) toast('Daily goal reached!');
    render(); window.scrollTo(0, 0);
  },
  again: () => { const w = curWord(), s = S.sess; P(w.i).again = true; P(w.i).st = 0; s.ids.shift(); s.ids.splice(Math.min(3, s.ids.length), 0, w.i); save(); render(); window.scrollTo(0, 0); },
  laterc: () => { const w = curWord(), s = S.sess; P(w.i).later = true; s.ids.shift(); s.total--; if (!s.ids.length) { s.fin = true; if (s.done) S.slides++; } save(); toast('Saved to Learn later'); render(); },
  list: d => {
    const ws = wordsOfList(d.t), m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
    const study = TF[d.t] ? ws.filter(TF[d.t]).length : 0;
    m.innerHTML = `<div class="sheet"><h3>${{ mEasy: 'Easy', mHard: 'Hard', again: 'Learn again', later: 'Learn later', miss: 'Mistakes' }[d.t]} (${ws.length})</h3>${ws.length ? ws.slice(0, 200).map(w => `<div class="res" data-act="detail" data-id="${w.i}"><b>${esc(w.w)}</b><span>${esc(w.b[0])}</span></div>`).join('') : '<p class="mute">Nothing here yet.</p>'}
    <div class="actions"><button class="btn ghost" data-act="closem">Close</button><button class="btn" data-act="newslide" data-t="${d.t}" ${study ? '' : 'disabled'}>Study (${Math.min(study, S.set.daily)})</button></div></div>`;
    document.body.appendChild(m);
  },
  smode: d => { sq.mode = d.m; shown = 30; rWords(); },
  more: () => { shown += 30; $('#res').innerHTML = resRows(); },
  detail: d => {
    const w = byId.get(+d.id); if (!w) return; act.closem(); const p = Pr(w.i);
    const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
    m.innerHTML = `<div class="sheet"><span class="lv">${LVN[levelOf(w)]}</span><div class="word">${esc(w.w)}</div><ul class="mean">${w.b.map(b => `<li>${esc(b)}</li>`).join('')}</ul>${w.e ? `<p class="ex">${hl(w.e, w.w)}</p>` : ''}
    ${chips(w, p)}<div class="chips" style="margin-top:8px"><button class="chip ${p.later ? 'on' : ''}" data-act="laterm" data-id="${w.i}">Learn later</button></div>
    <div class="actions"><button class="btn ghost" data-act="closem">Close</button><button class="btn" data-act="openw" data-id="${w.i}" ${isLearned(w) ? 'disabled' : ''}>Learn now</button></div></div>`;
    document.body.appendChild(m);
  },
  laterm: d => { const p = P(+d.id); p.later = !p.later; save(); act.detail({ id: d.id }); },
  closem: () => { const m = $('#modal'); if (m) m.remove(); },
  addform: () => {
    const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
    m.innerHTML = `<div class="sheet"><h3>Add a word</h3><input type="text" id="nw" placeholder="English word" autocapitalize="off"><br><br><input type="text" id="nb" placeholder="Meaning (separate several with commas)"><br><br><input type="text" id="ne" placeholder="Example sentence (optional)"><div class="actions"><button class="btn ghost" data-act="closem">Cancel</button><button class="btn" data-act="savecustom">Save</button></div></div>`;
    document.body.appendChild(m);
  },
  savecustom: () => {
    const w = $('#nw').value.trim().toLowerCase(), b = $('#nb').value.split(/[,،;]/).map(x => x.trim()).filter(Boolean), e = $('#ne').value.trim();
    if (!w || !b.length) return toast('Enter a word and a meaning');
    S.cid = (S.cid || 0) + 1; S.custom.push({ i: -S.cid, w, b, e }); rebuildWords(); save(); act.closem(); toast('Word added'); rWords();
  },
  delcustom: d => { const id = +d.id; S.custom = S.custom.filter(c => c.i !== id); delete S.prog[id]; if (S.sess) { S.sess.ids = S.sess.ids.filter(x => x !== id); } rebuildWords(); save(); rWords(); },
  theme: d => { S.set.theme = d.t; save(); applyTheme(); rSettings(); },
  fstyle: d => { S.set.fontStyle = d.t; save(); applyTheme(); rSettings(); },
  daily: d => { S.set.daily = +d.n; customOpen = false; save(); rSettings(); },
  dcustom: () => { customOpen = true; rSettings(); },
  rem: async d => {
    const r = S.set[d.k];
    if (r.on) { r.on = false; save(); schedule(); return rSettings(); }
    if (!('Notification' in window)) return toast('Notifications are not supported here');
    const p = await Notification.requestPermission(); if (p !== 'granted') return toast('Notification permission denied');
    r.on = true; save(); schedule(); regPeriodic(); rSettings();
  },
  export: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })); a.download = 'learn-vocabulary-backup-' + today() + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); },
  reset: () => { if (confirm('Delete all progress and custom words?')) { localStorage.removeItem(KEY); load(); rebuildWords(); applyTheme(); render(); toast('Progress reset'); } },
  qsrc: d => { S.qcfg.src = d.m; save(); rQuiz(); },
  qlvl: d => { S.qcfg.lvl = d.v; save(); rQuiz(); },
  qlen: d => { S.qcfg.len = +d.n; save(); rQuiz(); },
  qtype: d => { const t = S.qcfg.types, i = t.indexOf(d.t); if (i >= 0) { if (t.length === 1) return toast('Keep at least one type'); t.splice(i, 1); } else t.push(d.t); save(); rQuiz(); },
  qstart: () => {
    const qs = buildQuiz(S.qcfg); if (!qs) { Q = null; return toast(S.qcfg.lvl === 'miss' ? 'No mistakes yet' : S.qcfg.src === 'mine' ? 'Add your own words first' : 'No words available'); }
    Q = { qs, idx: 0, hearts: 5, xp: 0, ok: 0, bad: 0, combo: 0, retry: new Set(), locked: false, end: false }; page = 'quiz'; render();
  },
  qquit: () => { if (confirm('Quit this session?')) { const f = $('#fb'); if (f) f.remove(); Q = null; rQuiz(); } },
  qquit2: () => { Q = null; rQuiz(); },
  opt: (d, el) => {
    if (Q.locked) return; const q = Q.qs[Q.idx], o = q.opts[+d.k], good = o.i === q.w.i;
    document.querySelectorAll('.opt').forEach((b, k) => { if (q.opts[k].i === q.w.i) b.classList.add('good'); });
    if (!good) el.classList.add('bad');
    record(q.w, good); if (!good) wrongQ(q, q.w);
    feedback(good, q.t === 'fill' ? esc(q.w.e) : `${esc(q.w.w)} = ${esc(q.w.b.slice(0, 2).join(', '))}`);
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
      if (m.a === m.b) { m.done.push(m.a); record(q.g[m.a], true); } else { record(q.g[m.a], false); toast('Try again'); }
      m.a = m.b = null;
      if (Q.hearts <= 0) { Q.end = true; if (!Q.counted) { Q.counted = 1; if (Q.ok) { S.quizzes++; save(); } } return render(); }
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
  else if (t.dataset && t.dataset.set === 'font') { S.set.font = +t.value; applyTheme(); const l = t.parentElement.querySelector('.set .mute'); if (l) l.textContent = t.value + 'px'; save(); }
});
document.addEventListener('change', e => {
  const t = e.target, ds = t.dataset || {};
  if (ds.set === 'time') { S.set[ds.k].time = t.value || '08:00'; save(); schedule(); }
  else if (ds.set === 'daily') { const n = Math.max(1, Math.min(500, parseInt(t.value, 10) || 10)); S.set.daily = n; save(); toast('Words per day: ' + n); rSettings(); }
  else if (t.id === 'imp' && t.files[0]) {
    const r = new FileReader();
    r.onload = () => { try { const o = JSON.parse(r.result); if (!o.prog || !o.set) throw 0; S = normalize(o); rebuildWords(); save(); applyTheme(); render(); toast('Backup restored'); } catch (x) { toast('Invalid backup file'); } };
    r.readAsText(t.files[0]);
  }
});

/* ---------- notifications ---------- */
function nextForNotif() { const id = dailyIds(1)[0], w = byId.get(id); return w ? { w: w.w, b: w.b[0] } : null; }
function snapshot() { return { type: 'cfg', set: S.set, last: S.last, next: nextForNotif(), slide: S.slides + 1, quizN: S.quizzes + 1, todayL: (S.days[today()] || {}).l || 0, date: today() }; }
function syncSW() { if (!('serviceWorker' in navigator)) return; navigator.serviceWorker.ready.then(r => { if (r.active) r.active.postMessage(snapshot()); }).catch(() => {}); }
async function regPeriodic() { try { const r = await navigator.serviceWorker.ready; if (r.periodicSync) await r.periodicSync.register('daily-word', { minInterval: 12 * 3600 * 1000 }); } catch (e) {} }
function noteText(k) {
  const n = S.set.daily, nx = nextForNotif(), todayL = (S.days[today()] || {}).l || 0;
  if (k === 'nl') return { t: 'Learning time', b: `Complete learning slide #${S.slides + 1}: ${n} new words${nx ? ', starting with “' + nx.w + '” — ' + nx.b : ''}. Today: ${todayL}/${n}.` };
  return { t: 'Quiz time', b: `Quiz #${S.quizzes + 1} is ready. Test the words you have learned and keep your streak going.` };
}
async function fire(k) {
  const r = S.set[k]; if (!r || !r.on) return; const key = k === 'nl' ? 'l' : 'q';
  const skip = k === 'nl' && ((S.days[today()] || {}).l || 0) >= S.set.daily;
  if (!skip && 'Notification' in window && Notification.permission === 'granted') {
    try { const reg = await navigator.serviceWorker.ready, x = noteText(k); await reg.showNotification(x.t, { body: x.b, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: k, data: { url: './?page=' + (k === 'nl' ? 'learn' : 'quiz') } }); } catch (e) {}
  }
  S.last[key] = today(); save(); schedule();
}
function schedule() {
  ['nl', 'nq'].forEach(k => {
    clearTimeout(timers[k]); const r = S.set[k]; if (!r.on) return;
    const [h, m] = r.time.split(':'), t = new Date(); t.setHours(+h, +m, 0, 0); if (t <= new Date()) t.setDate(t.getDate() + 1);
    timers[k] = setTimeout(() => fire(k), Math.min(t - new Date(), 2147000000));
  });
}

/* ---------- boot ---------- */
async function boot() {
  load(); applyTheme();
  const q = new URLSearchParams(location.search).get('page'); if (TITLES[q]) page = q;
  try { const r = await fetch('data/words.json'); rebuildWords(await r.json()); }
  catch (e) { $('#main').innerHTML = '<div class="card"><h2>Could not load word data</h2><p>Open the app once with an internet connection, then it works offline.</p></div>'; return; }
  const now = new Date(); ['nl', 'nq'].forEach(k => { const key = k === 'nl' ? 'l' : 'q', [h, m] = S.set[k].time.split(':'), t = new Date(); t.setHours(+h, +m, 0, 0); if (S.set[k].on && now >= t && S.last[key] !== today() && document.visibilityState === 'visible') S.last[key] = today(); });
  render(); schedule();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => syncSW()).catch(() => {});
    navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.type === 'go') go(e.data.page); });
  }
}
boot();
