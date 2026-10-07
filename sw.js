/* BUGÜNÜM servis çalışanı — çevrimdışı açılış, hızlı içerik ve fotoğraflar */
const SURUM='bugunum-v2.1';
const SAYFA='sayfa-'+SURUM, FOTO='foto-v2', KUTUP='kutup-v2';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(SAYFA).then(c=>c.addAll(['./','./icerik.js','./manifest.json','./icon-192.png','./icon-512.png']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>![SAYFA,FOTO,KUTUP].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function zamanli(p,ms){return new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error('zaman')),ms);p.then(r=>{clearTimeout(t);ok(r)},e=>{clearTimeout(t);no(e)})})}
const etiket=r=>r&&(r.headers.get('etag')||r.headers.get('last-modified'));
function kaydet(ad,anahtar,res){caches.open(ad).then(c=>c.match(anahtar).then(o=>{if(!o||!etiket(o)||etiket(o)!==etiket(res))return c.put(anahtar,res)}))}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 /* sayfa: önce internet (en güncel sürüm), yoksa kayıtlı kopya */
 if(r.mode==='navigate'&&u.origin===location.origin){e.respondWith(zamanli(fetch(u.origin+u.pathname,{cache:'no-cache',credentials:'same-origin'}).then(x=>x.redirected?fetch(r):x),8000).then(res=>{if(res.ok)kaydet(SAYFA,'./',res.clone());return res}).catch(()=>caches.match('./',{ignoreSearch:true}).then(c=>c||caches.match(r))));return}
 /* içerik dosyası: kayıtlı kopya hemen, arkada yenile */
 if(u.origin===location.origin&&/icerik\.js$/.test(u.pathname)){e.respondWith(caches.open(SAYFA).then(c=>c.match('./icerik.js').then(m=>{const n=fetch(r.url,{cache:'no-cache'}).then(res=>{if(res.ok)kaydet(SAYFA,'./icerik.js',res.clone());return res}).catch(()=>m);return m||n})));return}
 /* fotoğraf deposu: önce kayıtlı kopya, arkada yenile */
 if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('/gh/mehmetalimelek60/bugunum-foto')){e.respondWith(caches.open(FOTO).then(c=>c.match(r).then(m=>{const n=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>m);return m||n})));return}
 /* sürümlü kütüphaneler (Firebase SDK) ve yazı tipleri */
 if((u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/'))||(u.hostname==='cdn.jsdelivr.net'&&u.pathname.startsWith('/npm/firebase@'))||u.hostname==='fonts.gstatic.com'){e.respondWith(caches.open(KUTUP).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}))));return}
});
