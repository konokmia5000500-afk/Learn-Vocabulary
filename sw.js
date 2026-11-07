/* Learn Vocabulary service worker – v0.0.2 */
const V='lv-v2',CFG='lv-cfg',FILES=['./','index.html','style.css','app.js','manifest.json','data/words.json','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','fonts/noto-sans-bengali-bengali-400-normal.woff2','fonts/noto-sans-bengali-bengali-700-normal.woff2','fonts/noto-serif-bengali-bengali-400-normal.woff2','fonts/noto-serif-bengali-bengali-700-normal.woff2','fonts/playfair-display-latin-400-normal.woff2','fonts/playfair-display-latin-700-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==CFG).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(n=>{const cp=n.clone();caches.open(V).then(c=>c.put(e.request,cp));return n}).catch(()=>caches.match('index.html'))))});
const getCfg=()=>caches.open(CFG).then(c=>c.match('cfg')).then(r=>r?r.json():null);
const putCfg=o=>caches.open(CFG).then(c=>c.put('cfg',new Response(JSON.stringify(o))));
self.addEventListener('message',e=>{if(e.data&&e.data.type==='cfg')e.waitUntil(putCfg(e.data))});
function body(c,k){
  const n=c.set.daily,nx=c.next;
  if(k==='nl')return{t:'Learning time',b:'Complete learning slide #'+c.slide+': '+n+' new words'+(nx?', starting with \u201c'+nx.w+'\u201d \u2014 '+nx.b:'')+'. Today: '+c.todayL+'/'+n+'.',u:'./?page=learn'};
  return{t:'Quiz time',b:'Quiz #'+c.quizN+' is ready. Test the words you have learned and keep your streak going.',u:'./?page=quiz'};
}
self.addEventListener('periodicsync',e=>{if(e.tag!=='daily-word')return;e.waitUntil((async()=>{
  const c=await getCfg();if(!c||!c.set)return;const now=new Date(),key=now.toLocaleDateString('en-CA');c.last=c.last||{};let changed=false;
  for(const k of['nl','nq']){const r=c.set[k];if(!r||!r.on)continue;const lk=k==='nl'?'l':'q',t=new Date(),[h,m]=r.time.split(':');t.setHours(+h,+m,0,0);
    if(now<t||c.last[lk]===key)continue;
    c.last[lk]=key;changed=true;
    if(k==='nl'&&c.date===key&&c.todayL>=c.set.daily)continue;
    const x=body(c,k);await self.registration.showNotification(x.t,{body:x.b,icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:k,data:{url:x.u}});}
  if(changed)await putCfg(c);})())});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=(e.notification.data&&e.notification.data.url)||'./?page=learn',pg=(u.split('page=')[1]||'learn');
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c){c.postMessage({type:'go',page:pg});return c.focus()}}return self.clients.openWindow(u)}))});
