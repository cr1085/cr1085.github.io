export const money = value => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(value)||0);
export const number = value => new Intl.NumberFormat("es-CO",{maximumFractionDigits:2}).format(Number(value)||0);
export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function field(label,id,type="number",placeholder="0",value=""){
  return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" placeholder="${placeholder}" value="${value}" ${type==="number"?'min="0" step="any"':''}></div>`;
}
export function button(label,id,secondary=false){return `<button class="action-button ${secondary?"secondary":""}" id="${id}" type="button">${label}</button>`;}
export function result(label="Resultado"){return `<div class="result-box" id="tool-result" aria-live="polite"><small>${label}</small><strong>—</strong></div>`;}
export function toast(message){
  const old=document.querySelector(".toast"); if(old) old.remove();
  const el=document.createElement("div");el.className="toast";el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),2200);
}
export function downloadBlob(blob,filename){
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function printDocument(title,body){
  const w=window.open("","_blank","noopener,noreferrer"); if(!w){toast("Permite las ventanas emergentes para imprimir.");return;}
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHTML(title)}</title><style>body{font:14px Arial,sans-serif;color:#172033;padding:35px;max-width:800px;margin:auto}h1{font-size:25px}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{padding:10px;border-bottom:1px solid #ddd;text-align:left}.total{text-align:right;font-size:20px;font-weight:bold;margin-top:25px}.muted{color:#667085;font-size:12px}@media print{button{display:none}}</style></head><body>${body}<p class="muted">Documento generado con 3CB Micro Apps. No constituye factura electrónica ni documento fiscal.</p><script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close();
}
