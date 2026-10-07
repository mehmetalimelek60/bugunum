/* BUGÜNÜM servis çalışanı — çevrimdışı açılış ve hızlı fotoğraflar */
const SURUM='bugunum-v1';
const SAYFA='sayfa-'+SURUM, FOTO='foto-'+SURUM, KUTUP='kutup-'+SURUM;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(SAYFA).then(c=>c.addAll(['./','./manifest.json','./icon-192.png','./icon-512.png']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>![SAYFA,FOTO,KUTUP].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function zamanli(p,ms){return new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error('zaman')),ms);p.then(r=>{clearTimeout(t);ok(r)},e=>{clearTimeout(t);no(e)})})}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 /* uygulama sayfası: önce internet (en güncel sürüm), yoksa kayıtlı kopya */
 if(r.mode==='navigate'&&u.origin===location.origin){e.respondWith(zamanli(fetch(r),8000).then(res=>{if(res.ok){const k=res.clone();caches.open(SAYFA).then(c=>c.match('./').then(o=>{const e1=o&&(o.headers.get('etag')||o.headers.get('last-modified')),e2=k.headers.get('etag')||k.headers.get('last-modified');if(!e1||!e2||e1!==e2)return c.put('./',k)}))}return res}).catch(()=>caches.match('./',{ignoreSearch:true}).then(c=>c||caches.match(r))));return}
 /* fotoğraf deposu: önce kayıtlı kopya, arkada yenile */
 if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('/gh/mehmetalimelek60/bugunum-foto')){e.respondWith(caches.open(FOTO).then(c=>c.match(r).then(m=>{const n=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>m);return m||n})));return}
 /* sürümlü kütüphaneler (Firebase SDK) ve yazı tipleri: kayıtlı kopya yeterli */
 if((u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/'))||(u.hostname==='cdn.jsdelivr.net'&&u.pathname.startsWith('/npm/firebase@'))||u.hostname==='fonts.gstatic.com'){e.respondWith(caches.open(KUTUP).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}))));return}
});
