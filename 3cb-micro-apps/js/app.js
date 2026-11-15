import {apps,categories} from "./registry.js";
import {toolMounts} from "./apps/tools.js";

const $=s=>document.querySelector(s);
const grid=$("#app-grid"),filters=$("#category-filters"),search=$("#search-input"),dialog=$("#tool-dialog");
let activeCategory="Todas";

function renderFilters(){
 filters.innerHTML=categories.map(c=>`<button class="filter-button ${c===activeCategory?"active":""}" data-category="${c}">${c}</button>`).join("");
 filters.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.category;renderFilters();renderApps();}));
}
function renderApps(){
 const q=search.value.trim().toLocaleLowerCase("es");
 const list=apps.filter(a=>(activeCategory==="Todas"||a.category===activeCategory)&&`${a.name} ${a.description} ${a.category}`.toLocaleLowerCase("es").includes(q));
 $("#visible-count").textContent=list.length;$("#empty-state").hidden=list.length!==0;
 grid.innerHTML=list.map(a=>`<button class="app-card" data-id="${a.id}" type="button"><div class="card-top"><span class="app-icon">${a.icon}</span><span class="card-category">${a.category}</span></div><h3>${a.name}</h3><p>${a.description}</p><div class="card-bottom"><span>${a.status==="ready"?"Abrir herramienta →":"Próximamente →"}</span><small>${a.status==="ready"?"● Disponible":"○ En desarrollo"}</small></div></button>`).join("");
 grid.querySelectorAll("[data-id]").forEach(card=>card.addEventListener("click",()=>openTool(card.dataset.id)));
}
function openTool(id){
 const app=apps.find(a=>a.id===id);if(!app)return;
 $("#tool-category").textContent=app.category.toUpperCase();$("#tool-title").textContent=app.name;$("#tool-description").textContent=app.description;
 const content=$("#tool-content");content.innerHTML="";
 if(app.status!=="ready"||!toolMounts[id])content.innerHTML=`<div class="coming-soon"><span style="font-size:28px">✦</span><strong>Estamos preparando esta herramienta</strong><p>Estará disponible en una próxima actualización de 3CB Micro Apps.</p></div>`;
 else toolMounts[id](content);
 dialog.showModal();
}
$("#close-dialog").addEventListener("click",()=>dialog.close());
$("#back-to-catalog").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
search.addEventListener("input",renderApps);
$("#theme-toggle").addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("3cb-theme",document.body.classList.contains("dark")?"dark":"light");});
if(localStorage.getItem("3cb-theme")==="dark")document.body.classList.add("dark");
$("#year").textContent=new Date().getFullYear();
function connection(){const online=navigator.onLine;$("#connection-status").classList.toggle("online",online);$("#connection-status").innerHTML=`<i></i> ${online?"Con conexión":"Modo offline"}`;}
window.addEventListener("online",connection);window.addEventListener("offline",connection);connection();
renderFilters();renderApps();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(err=>console.warn("No se pudo registrar el Service Worker:",err)));
