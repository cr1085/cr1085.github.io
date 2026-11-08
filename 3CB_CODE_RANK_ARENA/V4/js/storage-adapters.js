/* 3CB Code Arena · contratos de persistencia para migración.
   El frontend actual utiliza LocalStorage. Este módulo deja preparados
   adaptadores intercambiables para IndexedDB y servicios HTTP. */
(function(global){
  "use strict";
  const clone = value => JSON.parse(JSON.stringify(value ?? null));
  const safeJSON = response => response.json().catch(()=>({}));
  const local = {
    name:"localStorage",
    async get(key){try{return JSON.parse(localStorage.getItem(key)||"null")}catch{return null}},
    async set(key,value){localStorage.setItem(key,JSON.stringify(value));return value},
    async remove(key){localStorage.removeItem(key)},
    async exportAll(){const out={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith("3cb-"))out[k]=await this.get(k)}return out}
  };
  function indexedDBAdapter({dbName="3cb-code-arena",storeName="records"}={}){
    let dbPromise;
    function open(){if(!("indexedDB" in global))return Promise.reject(new Error("IndexedDB no está disponible"));
      if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(dbName,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(storeName))req.result.createObjectStore(storeName)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return dbPromise}
    async function transact(mode,action){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(storeName,mode),store=tx.objectStore(storeName);let req;try{req=action(store)}catch(e){reject(e);return}tx.oncomplete=()=>resolve(req?.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
    return {name:"indexedDB",get:key=>transact("readonly",s=>s.get(key)),set:(key,value)=>transact("readwrite",s=>s.put(clone(value),key)),remove:key=>transact("readwrite",s=>s.delete(key))};
  }
  function restAdapter({baseUrl,token="",headers={}}={}){
    if(!baseUrl)throw new Error("Configura baseUrl para el adaptador REST");
    const request=async(path,options={})=>{const res=await fetch(baseUrl.replace(/\/$/,"")+"/"+path.replace(/^\//,""),{...options,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...headers,...options.headers}});if(!res.ok)throw new Error("API "+res.status+": "+(await res.text()).slice(0,300));return res.status===204?null:safeJSON(res)};
    return {name:"rest-api",get:key=>request("store/"+encodeURIComponent(key)),set:(key,value)=>request("store/"+encodeURIComponent(key),{method:"PUT",body:JSON.stringify(value)}),remove:key=>request("store/"+encodeURIComponent(key),{method:"DELETE"})};
  }
  function supabaseAdapter({url,anonKey,table="arena_records"}={}){
    if(!url||!anonKey)throw new Error("Configura url y anonKey de Supabase");
    const endpoint=url.replace(/\/$/,"")+"/rest/v1/"+table;
    async function call(query,options={}){const r=await fetch(endpoint+query,{...options,headers:{apikey:anonKey,Authorization:"Bearer "+anonKey,"Content-Type":"application/json",Prefer:"return=representation",...options.headers}});if(!r.ok)throw new Error("Supabase "+r.status+": "+(await r.text()).slice(0,300));return r.status===204?null:r.json()}
    return {name:"supabase",async get(key){const rows=await call("?key=eq."+encodeURIComponent(key)+"&select=value");return rows[0]?.value??null},async set(key,value){return call("",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify({key,value})})},async remove(key){return call("?key=eq."+encodeURIComponent(key),{method:"DELETE"})}};
  }
  function firebaseRTDBAdapter({databaseURL,authToken=""}={}){
    if(!databaseURL)throw new Error("Configura databaseURL de Firebase Realtime Database");
    const url=key=>databaseURL.replace(/\/$/,"")+"/"+key.replace(/[^a-zA-Z0-9_-]/g,"_")+".json"+(authToken?"?auth="+encodeURIComponent(authToken):"");
    return {name:"firebase-realtime-database",async get(key){const r=await fetch(url(key));if(!r.ok)throw new Error("Firebase "+r.status);return r.json()},async set(key,value){const r=await fetch(url(key),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(value)});if(!r.ok)throw new Error("Firebase "+r.status);return r.json()},async remove(key){const r=await fetch(url(key),{method:"DELETE"});if(!r.ok)throw new Error("Firebase "+r.status);return true}};
  }
  global.CodeArenaStorage={local,indexedDB:indexedDBAdapter,rest:restAdapter,supabase:supabaseAdapter,firebaseRTDB:firebaseRTDBAdapter};
})(window);
