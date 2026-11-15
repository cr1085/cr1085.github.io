const CACHE_NAME = "3cb-micro-apps-v1";
const CORE = [
 "./","./index.html","./manifest.json","./css/styles.css",
 "./js/app.js","./js/registry.js","./js/apps/tools.js","./js/core/utils.js",
 "./assets/icons/icon.svg","./docs/privacy.html"
];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));
 self.skipWaiting();
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
 self.clients.claim();
});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 event.respondWith(caches.match(event.request).then(cached=>{
  if(cached)return cached;
  return fetch(event.request).then(response=>{
   if(response&&response.status===200&&new URL(event.request.url).origin===location.origin){
    const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
   }
   return response;
  }).catch(()=>caches.match("./index.html"));
 }));
});
