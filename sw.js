/* 在庫管理アプリ 更新確保用 Service Worker（network-first） */
const CACHE='zaiko-sw-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})());});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;
  e.respondWith((async()=>{
    try{
      const fresh=await fetch(req,{cache:'no-store'});
      const c=await caches.open(CACHE);
      c.put(req,fresh.clone());
      return fresh;
    }catch(err){
      const c=await caches.open(CACHE);
      return (await c.match(req))||new Response('オフラインです',{status:503});
    }
  })());
});
