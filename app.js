'use strict';
/* Learn Vocabulary v0.0.3 – offline PWA. Data: data/words.json (credits in README). */
const VERSION = '0.0.3';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dkey = d => d.toLocaleDateString('en-CA');
const today = () => dkey(new Date());
const KEY = 'lv_state_v1';
const DEF = { lang: 'en', font: 17, fontStyle: 'classic', theme: 'light', daily: 10, nl: { on: false, time: '08:00' }, nq: { on: false, time: '18:00' } };
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
const TYPE_LABEL = { daily: 'Daily words', easy: 'Easy', medium: 'Medium', hard: 'Hard', vhard: 'Very hard', miss: 'Mistakes', later: 'Learn later', mMed: 'Marked medium', mVhard: 'Marked very hard', again: 'Learn again', mEasy: 'Marked easy', mHard: 'Marked hard' };

/* ---------- language: English / বাংলা (UI text is translated in the DOM) ---------- */
const BN = {
  'Home': 'হোম', 'Learn': 'শেখা', 'Score': 'স্কোর', 'Words': 'শব্দ', 'Quiz': 'কুইজ', 'Settings': 'সেটিংস',
  'Add word': 'শব্দ যোগ করুন', 'Delete': 'মুছুন', 'Toggle reminder': 'রিমাইন্ডার চালু/বন্ধ', 'Quit': 'বের হোন', 'Close slide': 'স্লাইড বন্ধ করুন',
  'Welcome': 'স্বাগতম', 'Continue where you left off': 'যেখানে থেমেছিলে সেখান থেকে শুরু করো', 'Up next': 'এরপর শিখবে', 'Nothing pending.': 'কিছু বাকি নেই।',
  'My lists': 'আমার তালিকা', 'Words you marked': 'তুমি যে শব্দগুলো চিহ্নিত করেছ',
  'Easy': 'সহজ', 'Medium': 'মাঝারি', 'Hard': 'কঠিন', 'Very hard': 'অতি কঠিন', 'Learn again': 'আবার শিখব', 'Learn later': 'পরে শিখব', 'Mistakes': 'ভুল শব্দ',
  'Learned': 'শেখা হয়েছে', 'Learning': 'শেখা', 'Review': 'পুনরায়', 'Mistake': 'ভুল', 'Marked easy': 'চিহ্নিত সহজ', 'Marked medium': 'চিহ্নিত মাঝারি', 'Marked hard': 'চিহ্নিত কঠিন', 'Marked very hard': 'চিহ্নিত অতি কঠিন',
  'Study': 'শেখো', 'Daily words': 'দৈনিক শব্দ',
  'Matching, MCQ, fill in the blank and typing. Pick difficulty and question types.': 'জোড়া মেলানো, MCQ, শূন্যস্থান পূরণ ও টাইপিং। কঠিনতা ও প্রশ্নের ধরন বেছে নাও।',
  'Statistics, learning days, missed days and your full history.': 'পরিসংখ্যান, শেখার দিন, মিস করা দিন ও পুরো ইতিহাস।',
  'Search English or বাংলা and add your own words with meanings.': 'ইংরেজি বা বাংলায় খোঁজো এবং নিজের শব্দ অর্থসহ যোগ করো।',
  'Theme, language, fonts, words per day and two daily reminders (learning and quiz).': 'থিম, ভাষা, ফন্ট, দৈনিক শব্দ ও দুটি রিমাইন্ডার (শেখা ও কুইজ)।',
  'Tap to catch up now.': 'এখনই পুষিয়ে নিতে চাপো।', 'Quiz time': 'কুইজের সময়', "Take today's quiz to test the words you learned. Tap to start.": 'আজকের কুইজ দিয়ে শেখা শব্দগুলো যাচাই করো। শুরু করতে চাপো।',
  'Slide complete': 'স্লাইড সম্পূর্ণ', 'Back': 'ফিরে যাও', 'New slide': 'নতুন স্লাইড', 'Daily goal complete': 'দৈনিক লক্ষ্য সম্পূর্ণ', 'Learn by type': 'ধরন অনুযায়ী শেখো',
  'No words in this list': 'এই তালিকায় কোনো শব্দ নেই', 'Saved to Learn later': '"পরে শিখব" তালিকায় রাখা হয়েছে', 'Daily goal reached!': 'দৈনিক লক্ষ্য পূরণ হয়েছে!',
  'Close': 'বন্ধ করো', 'Nothing here yet.': 'এখানে এখনো কিছু নেই।', 'Showing the first 200': 'প্রথম ২০০টি দেখানো হচ্ছে', 'Show more': 'আরও দেখাও', 'My words': 'আমার শব্দ',
  'Statistics': 'পরিসংখ্যান', 'Overall': 'সব মিলিয়ে', 'left': 'বাকি', 'Activity': 'কার্যকলাপ', 'Daily average': 'দৈনিক গড়', 'Week': 'সপ্তাহ', 'Month': 'মাস', 'words': 'টি শব্দ', 'answers': 'টি উত্তর',
  'Correct': 'সঠিক', 'Wrong': 'ভুল', 'Not quizzed': 'কুইজ হয়নি', 'Correct:': 'সঠিক:', 'Wrong:': 'ভুল:', 'Not quizzed:': 'কুইজ হয়নি:', 'Quiz on learned words': 'শেখা শব্দের কুইজ ফল',
  'Learning days': 'শেখার দিন', 'Missed': 'মিস', 'Today': 'আজ', 'No quiz': 'কুইজ নেই', 'Progress': 'অগ্রগতি', 'Day streak': 'টানা দিন', 'XP': 'XP', 'Slides done': 'স্লাইড শেষ', 'Quizzes done': 'কুইজ শেষ', 'Most missed': 'সবচেয়ে বেশি ভুল',
  'Search English word': 'ইংরেজি শব্দ খুঁজুন', 'English': 'ইংরেজি', 'No results.': 'কোনো ফলাফল নেই।', 'All': 'সব', 'Add a word': 'শব্দ যোগ করুন', 'English word': 'ইংরেজি শব্দ',
  'Meaning (separate several with commas)': 'অর্থ (একাধিক হলে কমা দিয়ে আলাদা করো)', 'Example sentence (optional)': 'উদাহরণ বাক্য (ঐচ্ছিক)', 'Cancel': 'বাতিল', 'Save': 'সংরক্ষণ',
  'Enter a word and a meaning': 'একটি শব্দ ও অর্থ লেখো', 'Word added': 'শব্দ যোগ হয়েছে', 'Learn now': 'এখন শেখো',
  'Appearance': 'চেহারা', 'Theme': 'থিম', 'System': 'সিস্টেম', 'Light': 'হালকা', 'Dark': 'গাঢ়', 'Sepia': 'সেপিয়া', 'Forest': 'অরণ্য', 'Font style': 'ফন্ট স্টাইল', 'Classic': 'ক্লাসিক', 'Serif': 'সেরিফ', 'Sans': 'সান্স',
  'Text size': 'লেখার আকার', 'Language': 'ভাষা', 'Words per day': 'দৈনিক শব্দ', 'Custom': 'কাস্টম', 'Enter a number': 'সংখ্যা লেখো', 'Reminders': 'রিমাইন্ডার',
  'Complete your next slide': 'পরের স্লাইড শেষ করো', 'Test what you learned': 'যা শিখেছ তা যাচাই করো', 'Time': 'সময়',
  "Install the app from Chrome's menu for best results. When the app is closed, Chrome decides the exact delivery time.": 'ভালো ফলের জন্য Chrome-এর মেনু থেকে অ্যাপটি ইনস্টল করো। অ্যাপ বন্ধ থাকলে নোটিফিকেশন কখন আসবে তা Chrome ঠিক করে।',
  'Reminder status': 'রিমাইন্ডারের অবস্থা', 'Notification permission': 'নোটিফিকেশনের অনুমতি', 'Granted': 'দেওয়া আছে', 'Denied': 'দেওয়া হয়নি', 'Not asked yet': 'এখনো চাওয়া হয়নি',
  'Installed app': 'ইনস্টল করা অ্যাপ', 'Yes': 'হ্যাঁ', 'No — open it from the home-screen icon': 'না — হোম স্ক্রিনের আইকন থেকে খোলো', 'Background delivery': 'ব্যাকগ্রাউন্ডে নোটিফিকেশন',
  'Available in this browser': 'এই ব্রাউজারে আছে', 'Not available in this browser': 'এই ব্রাউজারে নেই',
  'Data': 'ডাটা', 'Export': 'এক্সপোর্ট', 'Import': 'ইমপোর্ট', 'Reset': 'রিসেট',
  'Progress is stored in this browser. Export a backup before clearing Chrome data.': 'অগ্রগতি এই ব্রাউজারে সংরক্ষিত থাকে। Chrome-এর ডাটা মোছার আগে ব্যাকআপ এক্সপোর্ট করে রাখো।',
  'Word data: BengaliDictionary by Minhas Kamal (GPL-3.0) · Fonts: Noto, Playfair Display (OFL)': 'শব্দ ডাটা: Minhas Kamal-এর BengaliDictionary (GPL-3.0) · ফন্ট: Noto, Playfair Display (OFL)',
  'Vocabulary quiz': 'শব্দভান্ডার কুইজ', 'Words you mark hard, review again or get wrong appear more often.': 'যে শব্দ কঠিন বা আবার-শেখা হিসেবে চিহ্নিত করো কিংবা ভুল করো, সেগুলো বেশি আসবে।',
  'All words': 'সব শব্দ', 'Difficulty': 'কঠিনতা', 'Any': 'যেকোনো', 'Customize': 'কাস্টমাইজ', 'Questions': 'প্রশ্ন', 'Start': 'শুরু',
  'MCQ: English → Bengali': 'MCQ: ইংরেজি → বাংলা', 'MCQ: Bengali → English': 'MCQ: বাংলা → ইংরেজি', 'Fill in the blank': 'শূন্যস্থান পূরণ', 'Type the answer': 'উত্তর টাইপ করো', 'Match pairs': 'জোড়া মেলাও',
  'What does this word mean?': 'এই শব্দের অর্থ কী?', 'Choose the English word': 'ইংরেজি শব্দটি বেছে নাও', 'Type the English word': 'ইংরেজি শব্দটি টাইপ করো', 'Check': 'যাচাই করো', 'Match the pairs': 'জোড়া মেলাও',
  'Correct!': 'সঠিক!', 'Not quite': 'ঠিক হয়নি', 'Continue': 'চালিয়ে যাও', 'Answer:': 'উত্তর:', 'All pairs matched': 'সব জোড়া মিলেছে', 'Try again': 'আবার চেষ্টা করো',
  'Out of hearts': 'হার্ট শেষ', 'Session complete': 'সেশন সম্পূর্ণ', 'Accuracy': 'নির্ভুলতা', 'Play again': 'আবার খেলো', 'Quiz setup': 'কুইজ সেটআপ',
  'No mistakes yet': 'এখনো কোনো ভুল নেই', 'No words available': 'কোনো শব্দ নেই', 'Add your own words first': 'আগে নিজের শব্দ যোগ করো', 'Keep at least one type': 'অন্তত একটি ধরন রাখো',
  'Notifications are not supported here': 'এখানে নোটিফিকেশন সমর্থিত নয়', 'Notification permission denied': 'নোটিফিকেশনের অনুমতি দেওয়া হয়নি', 'Backup restored': 'ব্যাকআপ ফিরিয়ে আনা হয়েছে',
  'Invalid backup file': 'ব্যাকআপ ফাইলটি সঠিক নয়', 'Progress reset': 'অগ্রগতি রিসেট হয়েছে', 'Quit this session?': 'এই সেশন বন্ধ করবে?', 'Delete all progress and custom words?': 'সব অগ্রগতি ও নিজের যোগ করা শব্দ মুছে ফেলবে?'
};
const BNP = [
  [/^Study (\d+) words per slide\. Choose Easy, Medium, Hard, Very hard, Mistakes or Later\.$/, n => `প্রতি স্লাইডে ${n}টি শব্দ শেখো। সহজ, মাঝারি, কঠিন, অতি কঠিন, ভুল শব্দ বা পরে শিখব বেছে নাও।`],
  [/^Today's words: (\d+) \/ (\d+)$/, (a, b) => `আজকের শব্দ: ${a} / ${b}`],
  [/^(Keep going|Start) — (\d+) more to reach today's goal\. Tap to begin\.$/, (a, n) => `${a === 'Start' ? 'শুরু করো' : 'চালিয়ে যাও'} — আজকের লক্ষ্যে পৌঁছাতে আরও ${n}টি বাকি। শুরু করতে চাপো।`],
  [/^You missed (\d+) days?$/, n => `তুমি ${n} দিন মিস করেছ`],
  [/^You finished (\d+) words? in this slide\.$/, n => `এই স্লাইডে তুমি ${n}টি শব্দ শেষ করেছ।`],
  [/^You learned (\d+) words today\. Start another slide whenever you like\.$/, n => `আজ তুমি ${n}টি শব্দ শিখেছ। চাইলে আরেকটি স্লাইড শুরু করতে পারো।`],
  [/^Start a new slide \((\d+) words\)$/, n => `নতুন স্লাইড শুরু করো (${n}টি শব্দ)`],
  [/^(\d+) learned$/, n => `${n}টি শেখা`], [/^(\d+) right · (\d+) wrong$/, (a, b) => `${a} সঠিক · ${b} ভুল`], [/^(\d+)× wrong$/, n => `${n} বার ভুল`],
  [/^Learn Vocabulary · Version (.+)$/, v => `Learn Vocabulary · সংস্করণ ${v}`], [/^Hint: (.*)$/, x => `ইঙ্গিত: ${x}`], [/^Combo ×(\d+)$/, n => `কম্বো ×${n}`], [/^Words per day: (\d+)$/, n => `দৈনিক শব্দ: ${n}`]
];
let LANG = 'en';
const tr = s => (LANG === 'bn' && BN[s]) || s;
const LOC = () => (LANG === 'bn' ? 'bn-BD' : 'en');
function trText(raw) {
  const m = raw.match(/^(\s*)([\s\S]*?)(\s*)$/), core = m[2]; if (!core) return raw;
  let r = BN[core];
  if (r == null) for (const [re, f] of BNP) { const x = core.match(re); if (x) { r = f(...x.slice(1)); break; } }
  if (r == null) { const g = core.match(/^(.+) \((\d+)\)$/); if (g && BN[g[1]]) r = BN[g[1]] + ' (' + g[2] + ')'; }
  return r == null ? raw : m[1] + r + m[3];
}
function trTree(n) {
  if (LANG !== 'bn') return;
  if (n.nodeType === 3) { if (n.parentElement && n.parentElement.closest('.keep,.word,.qword,.mean')) return; const v = trText(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; return; }
  if (n.nodeType !== 1) return;
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), arr = []; let x; while ((x = w.nextNode())) arr.push(x); arr.forEach(trTree);
  [n].concat([...n.querySelectorAll('[placeholder],[aria-label]')]).forEach(e => ['placeholder', 'aria-label'].forEach(a => { const v = e.getAttribute(a); if (v && BN[v]) e.setAttribute(a, BN[v]); }));
}
new MutationObserver(ms => { if (LANG === 'bn') ms.forEach(m => m.addedNodes.forEach(trTree)); }).observe(document.body, { childList: true, subtree: true });

let S, W = [], byId = new Map(), page = 'home', Q = null, timers = {}, shown = 30, customOpen = false;
let sq = { mode: 'en', text: '', f: 'all' };

/* ---------- state ---------- */
function fresh() { return { set: JSON.parse(JSON.stringify(DEF)), prog: {}, custom: [], days: {}, start: today(), xp: 0, cid: 0, last: { l: '', q: '' }, caught: [], sess: null, slides: 0, quizzes: 0, qcfg: JSON.parse(JSON.stringify(DEFQ)) }; }
function normalize(o) {
  const f = fresh(); o = o || {}; const old = o.set || {};
  const n = Object.assign(f, o);
  n.set = Object.assign({}, DEF, old);
  n.set.nl = Object.assign({}, DEF.nl, old.nl || (old.time ? { on: !!old.notif, time: old.time } : {}));
  n.set.nq = Object.assign({}, DEF.nq, old.nq || {});
  n.last = Object.assign({ l: '', q: '' }, o.last || {});
  n.qcfg = Object.assign({}, DEFQ, o.qcfg || {});
  n.caught = Array.isArray(o.caught) ? o.caught : [];
  return n;
}
function load() { let o = null; try { o = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} S = normalize(o); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} syncSW(); }
const P = id => S.prog[id] || (S.prog[id] = { st: 0, box: 0, ok: 0, bad: 0, d: 0, again: false, seen: 0 });
const Pr = id => S.prog[id] || {};
const day = () => { const r = S.days[today()] || (S.days[today()] = { l: 0, ok: 0, bad: 0, lv: [0, 0, 0, 0] }); if (!r.lv) r.lv = [0, 0, 0, 0]; return r; };
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
const missedRecent = () => dayList().filter(x => x.miss && !S.caught.includes(x.key)); // alert list: shrinks once you catch up
function resolveMissed() { dayList().forEach(x => { if (x.miss && !S.caught.includes(x.key)) S.caught.push(x.key); }); }
function rebuildWords(base) {
  W = (base || W.filter(w => w.i >= 0)).concat(S.custom.map(c => ({ i: c.i, w: c.w, b: c.b, e: c.e || '', z: 0, c: 1 })));
  byId = new Map(W.map(w => [w.i, w]));
}
const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function applyTheme() {
  const t = S.set.theme === 'system' ? (mq && mq.matches ? 'dark' : 'light') : S.set.theme, h = document.documentElement;
  h.setAttribute('data-theme', t); h.setAttribute('data-font', S.set.fontStyle); h.style.fontSize = S.set.font + 'px'; LANG = S.set.lang === 'bn' ? 'bn' : 'en'; h.lang = LANG;
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
const dlabel = k => new Date(k + 'T12:00:00').toLocaleDateString(LOC(), { weekday: 'short', day: 'numeric', month: 'short' });

/* ---------- word lists & learning slides ---------- */
const TF = {
  easy: w => levelOf(w) === 0 && !isLearned(w), medium: w => levelOf(w) === 1 && !isLearned(w), hard: w => levelOf(w) === 2 && !isLearned(w), vhard: w => levelOf(w) === 3 && !isLearned(w),
  miss: w => !!Pr(w.i).miss, later: w => !!Pr(w.i).later && !isLearned(w), again: w => !!Pr(w.i).again && !isLearned(w),
  mEasy: w => Pr(w.i).d === 1 && !isLearned(w), mMed: w => Pr(w.i).d === 3 && !isLearned(w), mHard: w => Pr(w.i).d === 2 && !isLearned(w), mVhard: w => Pr(w.i).d === 4 && !isLearned(w)
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
const LOGO = `<svg class="logo keep" viewBox="0 0 300 100" role="img" aria-label="Learn Vocabulary"><circle cx="46" cy="50" r="36" fill="none" stroke="var(--acc)" stroke-width="3"/><circle cx="46" cy="50" r="30" fill="none" stroke="var(--acc2)" stroke-width="1.2"/><text x="46" y="63" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="700" font-size="36" fill="var(--acc)">LV</text><text x="94" y="46" font-family="Georgia,'Times New Roman',serif" font-size="25" font-weight="700" letter-spacing="1" fill="currentColor">Learn</text><text x="94" y="74" font-family="Georgia,'Times New Roman',serif" font-size="25" font-style="italic" fill="var(--acc)">Vocabulary</text><path d="M94 82h190" stroke="var(--acc2)" stroke-width="1.5"/></svg>`;
function quizCard() {
  const r = S.set.nq; if (!r.on) return ''; const d = S.days[today()]; if (d && (d.ok || d.bad)) return '';
  const [h, m] = r.time.split(':'), t = new Date(); t.setHours(+h, +m, 0, 0); if (new Date() < t) return '';
  return `<button class="big" data-act="go" data-p="quiz"><b>Quiz time</b><span>Take today's quiz to test the words you learned. Tap to start.</span></button>`;
}
function rHome() {
  const n = S.set.daily, ms = missedRecent(), bn = LANG === 'bn';
  let ids = reviewIds().slice(0, 15), title = 'Continue where you left off';
  if (!ids.length) { ids = dailyIds(8); title = 'Up next'; }
  const lists = [['mEasy', 'Easy'], ['mMed', 'Medium'], ['mHard', 'Hard'], ['mVhard', 'Very hard'], ['again', 'Learn again'], ['later', 'Learn later'], ['miss', 'Mistakes']];
  const welcome = bn ? `ইংরেজি শব্দ শেখো বাংলা অর্থসহ, মোট <b>${W.length}</b>টি শব্দ। প্রতি স্লাইডে <b>${n}</b>টি করে শব্দ শেখো, শব্দকে সহজ বা কঠিন চিহ্নিত করো, কুইজে অনুশীলন করো এবং প্রতিদিনের অগ্রগতি দেখো। সবকিছু অফলাইনেও চলে।`
    : `Learn English words with Bengali meanings, <b>${W.length}</b> words in total. Study in slides of <b>${n}</b> words, mark words as easy or hard, practise with quizzes, and track every day of your progress. Everything works offline.`;
  const gc = goalCard(), showGoal = gc && (reminderPassed() || (S.days[today()] || {}).l);
  const dates = ms.slice(-4).map(x => dlabel(x.key)).join(', ') + (ms.length > 4 ? ' +' + (ms.length - 4) : '');
  $('#main').innerHTML = `${LOGO}
  <div class="card"><h3>Welcome</h3><p style="margin:0">${welcome}</p></div>
  ${showGoal ? gc : ''}
  ${ms.length ? `<button class="big warn" data-act="startdaily"><b>You missed ${ms.length} day${ms.length > 1 ? 's' : ''}</b><span>${dates}. ${tr('Tap to catch up now.')}</span></button>` : ''}
  ${quizCard()}
  <div class="boxes">
    <button class="box" data-act="go" data-p="learn">${ico('learn')}<b>Learn</b><span>Study ${n} words per slide. Choose Easy, Medium, Hard, Very hard, Mistakes or Later.</span></button>
    <button class="box" data-act="go" data-p="quiz">${ico('quiz')}<b>Quiz</b><span>Matching, MCQ, fill in the blank and typing. Pick difficulty and question types.</span></button>
    <button class="box" data-act="go" data-p="score">${ico('score')}<b>Score</b><span>Statistics, learning days, missed days and your full history.</span></button>
    <button class="box" data-act="go" data-p="words">${ico('words')}<b>Words</b><span>Search English or বাংলা and add your own words with meanings.</span></button>
    <button class="box wide" data-act="go" data-p="settings">${ico('settings')}<b>Settings</b><span>Theme, language, fonts, words per day and two daily reminders (learning and quiz).</span></button>
  </div>
  <h3>${title}</h3>
  <div class="slider">${ids.map(i => { const w = byId.get(i); return `<button class="slide" data-act="openw" data-id="${i}"><b>${esc(w.w)}</b><span>${esc(w.b[0])}</span></button>`; }).join('') || '<p class="mute">Nothing pending.</p>'}</div>
  <h3 class="sub">My lists</h3><p class="mute" style="margin:-4px 0 10px">Words you marked</p>
  <div class="boxes">${lists.map(([t, l], k) => `<button class="box ${k === 6 ? 'wide' : ''}" data-act="list" data-t="${t}"><em>${wordsOfList(t).length}</em><b>${l}</b></button>`).join('')}</div>`;
}
const MARK = { mEasy: 1, mMed: 3, mHard: 2, mVhard: 4 };
const LISTN = { mEasy: 'Easy', mMed: 'Medium', mHard: 'Hard', mVhard: 'Very hard', again: 'Learn again', later: 'Learn later', miss: 'Mistakes', easy: 'Easy', medium: 'Medium', hard: 'Hard', vhard: 'Very hard' };
function wordsOfList(t) { // Home lists show every word you marked, learned or not
  if (MARK[t]) return W.filter(w => Pr(w.i).d === MARK[t]);
  if (t === 'again') return W.filter(w => Pr(w.i).again && !isLearned(w));
  if (t === 'later') return W.filter(w => Pr(w.i).later && !isLearned(w));
  if (t === 'miss') return W.filter(w => Pr(w.i).miss);
  return W.filter(TF[t] || (() => false));
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
  <div class="boxes">${types.map(t => `<button class="box" data-act="list" data-t="${t}"><em>${wordsOf(t).length}</em><b>${TYPE_LABEL[t]}</b></button>`).join('')}</div>`;
}
const SV = { mode: 'learn', range: 7 };
const LCOL = ['var(--good)', 'var(--acc2)', 'var(--acc)', 'var(--bad)'];
function ringsSvg(rows) {
  return `<svg viewBox="0 0 160 160" role="img" aria-label="Statistics">${rows.map((r, i) => { const R = 70 - i * 13, C = 2 * Math.PI * R; return `<circle r="${R}" cx="80" cy="80" fill="none" style="stroke:${r.c};opacity:.2" stroke-width="10"/>${r.p > 0 ? `<circle r="${R}" cx="80" cy="80" fill="none" style="stroke:${r.c}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${Math.max(1, r.p * C)} ${C}" transform="rotate(-90 80 80)"/>` : ''}`; }).join('')}</svg>`;
}
function chartHtml() {
  const n = SV.range, learn = SV.mode === 'learn', days = [];
  for (let k = n - 1; k >= 0; k--) { const d = new Date(); d.setDate(d.getDate() - k); days.push({ d, r: S.days[dkey(d)] || { l: 0, ok: 0, bad: 0 } }); }
  const parts = r => {
    if (!learn) return [{ v: r.ok || 0, c: 'var(--good)' }, { v: r.bad || 0, c: 'var(--bad)' }];
    const lv = r.lv || [0, 0, 0, 0], s = lv.reduce((a, b) => a + b, 0), p = lv.map((v, i) => ({ v, c: LCOL[i] }));
    if ((r.l || 0) > s) p.push({ v: r.l - s, c: 'var(--mute)' }); return p;
  };
  const tot = days.map(x => parts(x.r).reduce((a, p) => a + p.v, 0)), mx = Math.max(1, ...tot);
  const since = Math.max(1, Math.min(n, Math.floor((new Date(today()) - new Date(S.start)) / 864e5) + 1)), sum = tot.reduce((a, b) => a + b, 0), avg = Math.round(sum / since);
  const ok = days.reduce((a, x) => a + (x.r.ok || 0), 0), bad = days.reduce((a, x) => a + (x.r.bad || 0), 0);
  const lab = (x, i) => n === 7 ? x.d.toLocaleDateString(LOC(), { weekday: 'short' }).slice(0, LANG === 'bn' ? 3 : 2) : (i % 5 === 4 || i === n - 1 ? x.d.getDate() : '');
  const f = d => d.toLocaleDateString(LOC(), { day: 'numeric', month: 'short' });
  const legend = learn ? LVN.map((l, i) => `<span><i style="background:${LCOL[i]}"></i>${tr(l)}</span>`).join('') : `<span><i style="background:var(--good)"></i>${tr('Correct')}</span><span><i style="background:var(--bad)"></i>${tr('Wrong')}</span>`;
  return `<div class="seg"><button class="${learn ? 'on' : ''}" data-act="svmode" data-m="learn">Learned</button><button class="${!learn ? 'on' : ''}" data-act="svmode" data-m="quiz">Quiz</button></div>
  <div class="seg"><button class="${n === 7 ? 'on' : ''}" data-act="svrange" data-n="7">Week</button><button class="${n === 30 ? 'on' : ''}" data-act="svrange" data-n="30">Month</button></div>
  <div class="avg"><small>${tr('Daily average')}</small><b>${avg} <span>${tr(learn ? 'words' : 'answers')}</span></b><small>${f(days[0].d)} – ${f(days[n - 1].d)}${!learn && ok + bad ? ' · ' + Math.round(ok / (ok + bad) * 100) + '%' : ''}</small></div>
  <div class="sbars">${days.map((x, i) => `<div class="sbar"><div class="sa"><div class="sc" style="height:${tot[i] / mx * 100}%">${parts(x.r).filter(p => p.v).map(p => `<s style="flex:${p.v};background:${p.c}"></s>`).join('')}</div></div><small>${lab(x, i)}</small></div>`).join('')}</div>
  <div class="slegend">${legend}</div>`;
}
function rScore() {
  const L = learnedCount(), total = W.length, rem = Math.max(0, total - L), daily = S.set.daily, bn = LANG === 'bn';
  const tot = [0, 0, 0, 0], lrn = [0, 0, 0, 0]; let c = 0, w = 0, nq = 0;
  W.forEach(x => { const k = levelOf(x); tot[k]++; if (isLearned(x)) { lrn[k]++; const p = Pr(x.i); if (p.miss) w++; else if (p.ok > 0) c++; else nq++; } });
  const rows = [{ n: 'Overall', c: 'var(--ink)', l: L, t: total }].concat(LVN.map((n, i) => ({ n, c: LCOL[i], l: lrn[i], t: tot[i] })));
  rows.forEach(r => { r.p = r.t ? r.l / r.t : 0; });
  const dl = dayList(), learnedDays = dl.filter(x => x.r.l > 0).length, missedDays = dl.filter(x => x.miss).length;
  const hard = W.filter(x => Pr(x.i).bad).sort((a, b) => Pr(b.i).bad - Pr(a.i).bad).slice(0, 5);
  const dsum = bn ? `শুরু থেকে ${dl.length} দিন · ${learnedDays} দিন শিখেছ · <b style="color:var(--bad)">${missedDays} দিন মিস</b>। সব দিন দেখতে সোয়াইপ করো।` : `${dl.length} day${dl.length > 1 ? 's' : ''} since you started · ${learnedDays} learned · <b style="color:var(--bad)">${missedDays} missed</b>. Swipe to see every day.`;
  const psum = bn ? `${total}টির মধ্যে ${L}টি শব্দ শেখা হয়েছে। দিনে ${daily}টি করে শিখলে আরও প্রায় <b>${Math.ceil(rem / daily)}</b> দিন লাগবে।` : `${L} of ${total} words learned. At ${daily} words a day, about <b>${Math.ceil(rem / daily)}</b> days remain.`;
  $('#main').innerHTML = `<div class="card"><h3>Statistics</h3><div class="rsvg">${ringsSvg(rows)}</div>
  <div class="lgd">${rows.map(r => `<div class="lrow"><i style="background:${r.c}"></i><b>${tr(r.n)}</b><span>${r.l} / ${r.t} · ${r.t - r.l} ${tr('left')}</span><em>${Math.round(r.p * 100)}%</em></div>`).join('')}</div>
  <p class="mute" style="margin:12px 0 6px">Quiz on learned words</p><div class="slegend" style="justify-content:flex-start"><span><i style="background:var(--good)"></i>${tr('Correct')} <b>${c}</b></span><span><i style="background:var(--bad)"></i>${tr('Wrong')} <b>${w}</b></span><span><i style="background:var(--line)"></i>${tr('Not quizzed')} <b>${nq}</b></span></div></div>
  <div class="card"><h3>Activity</h3>${chartHtml()}</div>
  <div class="card"><h3>Learning days</h3><p class="mute" style="margin-top:0">${dsum}</p>
  <div class="days" id="days">${dl.map(x => `<div class="day ${x.miss ? 'miss' : ''} ${x.now ? 'now' : ''}"><small>${x.d.toLocaleDateString(LOC(), { weekday: 'short' })}</small><b>${x.d.getDate()}</b><small>${x.d.toLocaleDateString(LOC(), { month: 'short', year: '2-digit' })}</small><em>${x.miss ? 'Missed' : x.r.l ? x.r.l + ' learned' : x.now ? 'Today' : '—'}</em><u>${x.r.ok + x.r.bad ? x.r.ok + ' right · ' + x.r.bad + ' wrong' : 'No quiz'}</u></div>`).join('')}</div></div>
  <div class="card"><h3>Progress</h3><div class="bar"><i style="width:${total ? L / total * 100 : 0}%"></i></div><p class="mute">${psum}</p></div>
  <div class="grid" style="margin-bottom:14px"><div class="stat"><b>${streak()}</b><span>Day streak</span></div><div class="stat"><b>${S.xp}</b><span>XP</span></div><div class="stat"><b>${S.slides}</b><span>Slides done</span></div><div class="stat"><b>${S.quizzes}</b><span>Quizzes done</span></div></div>
  ${hard.length ? `<div class="card"><h3>Most missed</h3>${hard.map(x => `<div class="res" data-act="detail" data-id="${x.i}"><b>${esc(x.w)}</b><span>${Pr(x.i).bad}× wrong</span></div>`).join('')}</div>` : ''}`;
  const st = $('#days'); if (st) st.scrollLeft = st.scrollWidth;
}

const WF = [['all', 'All'], ['mEasy', 'Easy'], ['mMed', 'Medium'], ['mHard', 'Hard'], ['mVhard', 'Very hard'], ['again', 'Learn again'], ['later', 'Learn later'], ['miss', 'Mistakes'], ['learned', 'Learned']];
function searchList() {
  const q = sq.text.trim().toLowerCase(), qb = sq.text.trim();
  const src = sq.f === 'learned' ? W.filter(isLearned) : sq.f && sq.f !== 'all' ? wordsOfList(sq.f) : W;
  if (!q) { const l = src.slice(0, sq.f === 'all' ? 400 : 3000); return { list: l, n: l.length }; }
  const a = [], b = [];
  for (const w of src) {
    if (sq.mode === 'en') { if (w.w.startsWith(q)) a.push(w); else if (w.w.includes(q)) b.push(w); }
    else { if (w.b.some(x => x.startsWith(qb))) a.push(w); else if (w.b.some(x => x.includes(qb))) b.push(w); }
  }
  const l = a.concat(b); return { list: l, n: l.length };
}
function resRows() {
  const { list, n } = searchList();
  return list.slice(0, shown).map(w => `<div class="res" data-act="detail" data-id="${w.i}"><b>${esc(w.w)}${isLearned(w) ? ' ✓' : ''}</b><span>${esc(w.b.slice(0, 2).join(', '))}</span></div>`).join('') + (n > shown ? `<button class="btn ghost block" style="margin:10px 0" data-act="more">Show more (${n - shown})</button>` : '') + (n ? '' : '<p class="mute">No results.</p>');
}
function rWords() {
  $('#main').innerHTML = `<div class="seg"><button class="${sq.mode === 'en' ? 'on' : ''}" data-act="smode" data-m="en">English</button><button class="${sq.mode === 'bn' ? 'on' : ''}" data-act="smode" data-m="bn">বাংলা</button></div>
  <input type="text" id="q" placeholder="${sq.mode === 'en' ? 'Search English word' : 'বাংলা শব্দ খুঁজুন'}" value="${esc(sq.text)}" autocomplete="off" autocapitalize="off">
  <div class="chips" style="margin:10px 0">${WF.map(([f, l]) => `<button class="chip ${sq.f === f ? 'on' : ''}" data-act="sfilter" data-f="${f}">${l}</button>`).join('')}</div>
  <div id="res" class="card" style="margin-top:4px;padding:6px 14px">${resRows()}</div>
  ${S.custom.length ? `<h3>My words (${S.custom.length})</h3><div class="card" style="padding:6px 14px">${S.custom.map(c => `<div class="res"><span data-act="detail" data-id="${c.i}" style="text-align:left;color:var(--ink);flex:1"><b>${esc(c.w)}</b> – ${esc(c.b.join(', '))}</span><button class="chip" data-act="delcustom" data-id="${c.i}" aria-label="Delete">${ico('trash')}</button></div>`).join('')}</div>` : ''}`;
}
const sw = (on, k) => `<button class="sw ${on ? 'on' : ''}" data-act="rem" data-k="${k}" aria-label="Toggle reminder"></button>`;
function remStatus() {
  const perm = 'Notification' in window ? Notification.permission : 'denied', pm = perm === 'granted' ? 'Granted' : perm === 'denied' ? 'Denied' : 'Not asked yet';
  const inst = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  const bg = 'serviceWorker' in navigator && 'PeriodicSyncManager' in window;
  const row = (a, b, ok) => `<div class="set"><label>${tr(a)}</label><span class="mute" style="color:${ok ? 'var(--good)' : 'var(--mute)'}">${tr(b)}</span></div>`;
  return `<h3 class="sub" style="font-size:.95rem">${tr('Reminder status')}</h3>${row('Notification permission', pm, perm === 'granted')}${row('Installed app', inst ? 'Yes' : 'No — open it from the home-screen icon', inst)}${row('Background delivery', bg ? 'Available in this browser' : 'Not available in this browser', bg)}`;
}
function rSettings() {
  const s = S.set, presets = [5, 10, 15, 20, 30, 50], isCustom = customOpen || !presets.includes(s.daily);
  $('#main').innerHTML = `<div class="card"><h3>Appearance</h3>
  <div class="set"><label>Language</label></div><div class="chips"><button class="chip keep ${s.lang !== 'bn' ? 'on' : ''}" data-act="lang" data-v="en">English</button><button class="chip keep ${s.lang === 'bn' ? 'on' : ''}" data-act="lang" data-v="bn">বাংলা</button></div>
  <div class="set" style="margin-top:8px"><label>Theme</label></div><div class="chips">${[['system', 'System'], ['light', 'Light'], ['dark', 'Dark'], ['sepia', 'Sepia'], ['forest', 'Forest']].map(([t, l]) => `<button class="chip ${s.theme === t ? 'on' : ''}" data-act="theme" data-t="${t}">${l}</button>`).join('')}</div>
  <div class="set" style="margin-top:8px"><label>Font style</label></div><div class="chips">${[['classic', 'Classic'], ['serif', 'Serif'], ['sans', 'Sans']].map(([t, l]) => `<button class="chip ${s.fontStyle === t ? 'on' : ''}" data-act="fstyle" data-t="${t}">${l}</button>`).join('')}</div>
  <div class="set" style="margin-top:8px"><label>Text size</label><span class="mute">${s.font}px</span></div><input type="range" min="14" max="24" step="1" value="${s.font}" data-set="font"></div>
  <div class="card"><h3>Words per day</h3><div class="chips">${presets.map(n => `<button class="chip ${!isCustom && s.daily === n ? 'on' : ''}" data-act="daily" data-n="${n}">${n}</button>`).join('')}<button class="chip ${isCustom ? 'on' : ''}" data-act="dcustom">Custom</button></div>
  ${isCustom ? `<div class="set"><label>Enter a number</label><input type="number" min="1" max="500" value="${s.daily}" data-set="daily"></div>` : ''}</div>
  <div class="card"><h3>Reminders</h3>
  <div class="set"><label>Learning<small>Complete your next slide</small></label>${sw(s.nl.on, 'nl')}</div><div class="set"><label>Time</label><input type="time" value="${s.nl.time}" data-set="time" data-k="nl"></div>
  <div class="set"><label>Quiz<small>Test what you learned</small></label>${sw(s.nq.on, 'nq')}</div><div class="set"><label>Time</label><input type="time" value="${s.nq.time}" data-set="time" data-k="nq"></div>
  ${remStatus()}
  <p class="mute">Install the app from Chrome's menu for best results. When the app is closed, Chrome decides the exact delivery time.</p></div>
  <div class="card"><h3>Data</h3><div class="row"><button class="btn ghost" data-act="export">Export</button><label class="btn ghost">Import<input type="file" accept="application/json" id="imp" hidden></label><button class="btn ghost" data-act="reset">Reset</button></div>
  <p class="mute">Progress is stored in this browser. Export a backup before clearing Chrome data.</p></div>
  <p class="mute" style="text-align:center">Learn Vocabulary · Version ${VERSION}</p><p class="mute" style="text-align:center">Word data: BengaliDictionary by Minhas Kamal (GPL-3.0) · Fonts: Noto, Playfair Display (OFL)</p>`;
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
    <div class="actions"><button class="btn ghost" data-act="qquit2">Quiz setup</button><button class="btn" data-act="qstart">Play again</button></div></div>`;
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
  newslide: d => { act.closem(); if (startSess(d.t)) { go('learn'); } },
  endsess: () => { S.sess = null; save(); render(); },
  openw: d => { act.closem(); if (startSess('daily', +d.id)) go('learn'); },
  setd: d => { const p = P(+d.id), v = +d.v; p.d = p.d === v ? 0 : v; save(); if ($('#modal')) { act.closem(); act.detail({ id: d.id }); } else render(); },
  learned: () => {
    const w = curWord(), s = S.sess, p = P(w.i), dd = day();
    p.st = 1; p.again = false; p.later = false; if (s.t === 'miss') p.miss = false;
    dd.l++; S.xp += 5; s.ids.shift(); s.done++;
    dd.lv[levelOf(w)]++;
    if (!s.ids.length) { s.fin = true; S.slides++; resolveMissed(); }
    if (dd.l >= S.set.daily) resolveMissed();
    save(); if (dd.l === S.set.daily) toast('Daily goal reached!');
    render(); window.scrollTo(0, 0);
  },
  again: () => { const w = curWord(), s = S.sess; P(w.i).again = true; P(w.i).st = 0; s.ids.shift(); s.ids.splice(Math.min(3, s.ids.length), 0, w.i); save(); render(); window.scrollTo(0, 0); },
  laterc: () => { const w = curWord(), s = S.sess; P(w.i).later = true; s.ids.shift(); s.total--; if (!s.ids.length) { s.fin = true; if (s.done) { S.slides++; resolveMissed(); } } save(); toast('Saved to Learn later'); render(); },
  list: d => {
    const ws = wordsOfList(d.t), m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
    const study = TF[d.t] ? ws.filter(TF[d.t]).length : 0;
    m.innerHTML = `<div class="sheet"><h3>${LISTN[d.t] || d.t} (${ws.length})</h3>${ws.length ? ws.slice(0, 200).map(w => `<div class="res" data-act="detail" data-id="${w.i}"><b>${esc(w.w)}${isLearned(w) ? ' ✓' : ''}</b><span>${esc(w.b[0])}</span></div>`).join('') : '<p class="mute">Nothing here yet.</p>'}${ws.length > 200 ? '<p class="mute">Showing the first 200</p>' : ''}
    <div class="actions"><button class="btn ghost" data-act="closem">Close</button><button class="btn" data-act="newslide" data-t="${d.t}" ${study ? '' : 'disabled'}>Study (${Math.min(study, S.set.daily)})</button></div></div>`;
    document.body.appendChild(m);
  },
  sfilter: d => { sq.f = d.f; shown = 30; rWords(); },
  lang: d => { S.set.lang = d.v; save(); applyTheme(); render(); },
  svmode: d => { SV.mode = d.m; rScore(); },
  svrange: d => { SV.range = +d.n; rScore(); },
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
  reset: () => { if (confirm(tr('Delete all progress and custom words?'))) { localStorage.removeItem(KEY); load(); rebuildWords(); applyTheme(); render(); toast('Progress reset'); } },
  qsrc: d => { S.qcfg.src = d.m; save(); rQuiz(); },
  qlvl: d => { S.qcfg.lvl = d.v; save(); rQuiz(); },
  qlen: d => { S.qcfg.len = +d.n; save(); rQuiz(); },
  qtype: d => { const t = S.qcfg.types, i = t.indexOf(d.t); if (i >= 0) { if (t.length === 1) return toast('Keep at least one type'); t.splice(i, 1); } else t.push(d.t); save(); rQuiz(); },
  qstart: () => {
    const qs = buildQuiz(S.qcfg); if (!qs) { Q = null; return toast(S.qcfg.lvl === 'miss' ? 'No mistakes yet' : S.qcfg.src === 'mine' ? 'Add your own words first' : 'No words available'); }
    Q = { qs, idx: 0, hearts: 5, xp: 0, ok: 0, bad: 0, combo: 0, retry: new Set(), locked: false, end: false }; page = 'quiz'; render();
  },
  qquit: () => { if (confirm(tr('Quit this session?'))) { const f = $('#fb'); if (f) f.remove(); Q = null; rQuiz(); } },
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
  const n = S.set.daily, nx = nextForNotif(), todayL = (S.days[today()] || {}).l || 0, bn = LANG === 'bn';
  if (k === 'nl') return bn ? { t: 'শেখার সময়', b: `${S.slides + 1} নম্বর স্লাইড সম্পূর্ণ করো: ${n}টি নতুন শব্দ${nx ? ', শুরু “' + nx.w + '” — ' + nx.b : ''}। আজ: ${todayL}/${n}।` } : { t: 'Learning time', b: `Complete learning slide #${S.slides + 1}: ${n} new words${nx ? ', starting with “' + nx.w + '” — ' + nx.b : ''}. Today: ${todayL}/${n}.` };
  return bn ? { t: 'কুইজের সময়', b: `কুইজ #${S.quizzes + 1} প্রস্তুত। যা শিখেছ তা যাচাই করো এবং ধারা বজায় রাখো।` } : { t: 'Quiz time', b: `Quiz #${S.quizzes + 1} is ready. Test the words you have learned and keep your streak going.` };
}
const dueNow = k => { const r = S.set[k]; if (!r.on) return false; const [h, m] = r.time.split(':'), t = new Date(); t.setHours(+h, +m, 0, 0); return new Date() >= t && S.last[k === 'nl' ? 'l' : 'q'] !== today(); };
async function fire(k) {
  S.last[k === 'nl' ? 'l' : 'q'] = today(); save();
  const d = S.days[today()] || { l: 0, ok: 0, bad: 0 };
  if (k === 'nl' && d.l >= S.set.daily) return;
  if (k === 'nq' && (d.ok || d.bad)) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try { const reg = await navigator.serviceWorker.ready, x = noteText(k); await reg.showNotification(x.t, { body: x.b, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: k, data: { url: './?page=' + (k === 'nl' ? 'learn' : 'quiz') } }); } catch (e) {}
}
function tick() { if (!S || !W.length) return; ['nl', 'nq'].forEach(k => { if (dueNow(k)) fire(k); }); }
const schedule = tick;
setInterval(tick, 20000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S && W.length) { tick(); if (page === 'home' && !$('#modal')) render(); } });

/* ---------- boot ---------- */
async function boot() {
  load(); applyTheme();
  const q = new URLSearchParams(location.search).get('page'); if (TITLES[q]) page = q;
  try { const r = await fetch('data/words.json'); rebuildWords(await r.json()); }
  catch (e) { $('#main').innerHTML = '<div class="card"><h2>Could not load word data</h2><p>Open the app once with an internet connection, then it works offline.</p></div>'; return; }
  render(); tick();
  if (S.set.nl.on || S.set.nq.on) regPeriodic();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => syncSW()).catch(() => {});
    navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.type === 'go') go(e.data.page); });
  }
}
boot();
