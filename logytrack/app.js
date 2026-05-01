/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LOGITRACK â€” app.js
   Modules: Dashboard, Cubicaje, Enturnamiento, Rutas
   Backend: Supabase (optional) + localStorage fallback
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

'use strict';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GLOBAL STATE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const STATE = {
  products: [],          // cubicaje products list
  citas: [],             // citas/appointments
  routes: [],            // saved routes
  supabase: null,        // supabase client
  useSupabase: false,    // flag
  map: null,             // mapbox map instance
  mapView: 'map',        // 'map' | 'list'
  citaFilter: 'all',
};

// Container specs (mÂ³ and max kg)
const CONTAINERS = {
  '20ft':  { label: 'Contenedor 20 pies', vol: 33.2,  maxkg: 28000 },
  '40ft':  { label: 'Contenedor 40 pies', vol: 67.7,  maxkg: 26500 },
  'camion':{ label: 'CamiÃ³n / Mula',      vol: 90.0,  maxkg: 35000 },
  'furgon':{ label: 'FurgÃ³n pequeÃ±o',     vol: 15.0,  maxkg: 3500  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// INIT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
document.addEventListener('DOMContentLoaded', () => {
  setDate();
  loadDemoData();
  renderDashboard();
  renderCitas();
  buildWeekStrip();
  // Show modal on load (Supabase config)
  document.getElementById('supabaseModal').style.display = 'flex';
});

function setDate() {
  const d = new Date();
  document.getElementById('currentDate').textContent =
    d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// DEMO DATA
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function loadDemoData() {
  const today = new Date();
  const fmt = (d) => d.toISOString().split('T')[0];
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

  STATE.citas = [
    { id: 1, empresa: 'Almacenes Ã‰xito S.A.',       tipo: 'carga',    fecha: fmt(today),         hora: '08:00', muelle: 'Muelle 1', duracion: 60,  estado: 'confirmado', notas: 'Traer orden de compra #4821' },
    { id: 2, empresa: 'Supermercados OlÃ­mpica',      tipo: 'descarga', fecha: fmt(today),         hora: '10:30', muelle: 'Muelle 2', duracion: 90,  estado: 'pendiente',  notas: '' },
    { id: 3, empresa: 'Jumbo Colombia',              tipo: 'mixto',    fecha: fmt(today),         hora: '14:00', muelle: 'Muelle 1', duracion: 120, estado: 'pendiente',  notas: 'Coordinar con jefe de patio' },
    { id: 4, empresa: 'D1 LogÃ­stica',                tipo: 'carga',    fecha: fmt(today),         hora: '16:30', muelle: 'Muelle 3', duracion: 60,  estado: 'completado', notas: '' },
    { id: 5, empresa: 'Carulla S.A.',                tipo: 'descarga', fecha: fmt(addDays(1)),    hora: '07:00', muelle: 'Muelle 2', duracion: 90,  estado: 'confirmado', notas: '' },
    { id: 6, empresa: 'Makro Colombia',              tipo: 'carga',    fecha: fmt(addDays(1)),    hora: '11:00', muelle: 'Muelle 4', duracion: 60,  estado: 'pendiente',  notas: 'Productos refrigerados' },
    { id: 7, empresa: 'Sodimac S.A.S.',              tipo: 'mixto',    fecha: fmt(addDays(2)),    hora: '09:30', muelle: 'Muelle 1', duracion: 180, estado: 'pendiente',  notas: '' },
    { id: 8, empresa: 'FerreterÃ­a Construmax',       tipo: 'carga',    fecha: fmt(addDays(3)),    hora: '08:00', muelle: 'Muelle 2', duracion: 90,  estado: 'pendiente',  notas: '' },
  ];

  STATE.products = [
    { id: 1, name: 'Caja estÃ¡ndar A',     l: 60,  w: 40,  h: 40,  weight: 15, qty: 20 },
    { id: 2, name: 'Pallet electrÃ³nico',  l: 120, w: 100, h: 80,  weight: 80, qty: 5  },
    { id: 3, name: 'Caja pequeÃ±a B',      l: 30,  w: 20,  h: 20,  weight: 5,  qty: 50 },
  ];
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MODULE NAVIGATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function showModule(name) {
  document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`mod-${name}`).classList.add('active');
  document.querySelector(`[data-module="${name}"]`).classList.add('active');

  const titles = {
    dashboard: ['Dashboard',       'Vista general de operaciones'],
    cubicaje:  ['Cubicaje',        'CÃ¡lculo de carga y optimizaciÃ³n de espacio'],
    citas:     ['Enturnamiento',   'Agenda de citas de carga y descarga'],
    rutas:     ['Enrutamiento',    'PlanificaciÃ³n y optimizaciÃ³n de rutas'],
  };

  document.getElementById('pageTitle').textContent    = titles[name][0];
  document.getElementById('pageSubtitle').textContent = titles[name][1];

  if (name === 'cubicaje') renderProductsTable();
  if (name === 'citas')    { buildWeekStrip(); renderCitas(); }
  if (name === 'rutas')    initMap();
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// DASHBOARD
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function renderDashboard() {
  renderCitasMini();
  renderContainerBars();
  renderActivityChart();
}

function renderCitasMini() {
  const today = new Date().toISOString().split('T')[0];
  const todayCitas = STATE.citas.filter(c => c.fecha === today).slice(0, 4);
  const el = document.getElementById('citasMini');
  el.innerHTML = todayCitas.map(c => `
    <div class="cita-mini-item">
      <span class="cita-time">${c.hora}</span>
      <div class="cita-detail">
        <div class="cita-empresa">${c.empresa}</div>
        <div class="cita-muelle">${c.muelle} Â· ${c.tipo}</div>
      </div>
      <span class="status-badge status-${c.estado}">${capitalize(c.estado)}</span>
    </div>
  `).join('') || '<div class="empty-state">No hay citas hoy</div>';
}

function renderContainerBars() {
  const data = [
    { name: 'Contenedor A â€” 20ft', pct: 73, color: '#3b82f6' },
    { name: 'Contenedor B â€” 40ft', pct: 45, color: '#10b981' },
    { name: 'CamiÃ³n 001',          pct: 91, color: '#f59e0b' },
    { name: 'FurgÃ³n F-12',         pct: 28, color: '#8b5cf6' },
  ];
  document.getElementById('containerBars').innerHTML = data.map(d => `
    <div class="cbar-item">
      <div class="cbar-header">
        <span class="cbar-label">${d.name}</span>
        <span class="cbar-pct">${d.pct}%</span>
      </div>
      <div class="cbar-track">
        <div class="cbar-fill" style="width:${d.pct}%;background:${d.color}"></div>
      </div>
    </div>
  `).join('');
}

function renderActivityChart() {
  const days = ['Lun', 'Mar', 'MiÃ©', 'Jue', 'Vie', 'SÃ¡b', 'Dom'];
  const vals = [6, 9, 7, 12, 8, 4, 2];
  const max  = Math.max(...vals);
  const colors = ['#3b82f6','#3b82f6','#3b82f6','#60a5fa','#3b82f6','#8b5cf6','#555d72'];
  document.getElementById('activityChart').innerHTML = days.map((d, i) => `
    <div class="act-bar-wrap">
      <div class="act-bar" style="height:${(vals[i]/max)*60}px;background:${colors[i]}"></div>
      <span class="act-label">${d}</span>
    </div>
  `).join('');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CUBICAJE MODULE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function addProduct(e) {

  showLoading();

setTimeout(() => {
  // lógica actual
  hideLoading();
}, 800);

  e.preventDefault();
  const name   = document.getElementById('prodName').value.trim();
  const l      = parseFloat(document.getElementById('prodL').value);
  const w      = parseFloat(document.getElementById('prodW').value);
  const h      = parseFloat(document.getElementById('prodH').value);
  const weight = parseFloat(document.getElementById('prodWeight').value);
  const qty    = parseInt(document.getElementById('prodQty').value);

  const prod = { id: Date.now(), name, l, w, h, weight, qty };
  STATE.products.push(prod);

  renderProductsTable();
  updateContainerViz();
  saveToStorage();
  toast(`âœ” "${name}" agregado`, 'success');
  document.getElementById('cubicajeForm').reset();
}

function removeProduct(id) {
  STATE.products = STATE.products.filter(p => p.id !== id);
  renderProductsTable();
  updateContainerViz();
  saveToStorage();
}

function renderProductsTable() {
  const body = document.getElementById('productsBody');
  if (!STATE.products.length) {
    body.innerHTML = '<div class="empty-state">Agrega productos para calcular la carga</div>';
    document.getElementById('summaryBar').style.display = 'none';
    updateContainerViz(true);
    return;
  }

  body.innerHTML = STATE.products.map(p => {
    const volUnit = (p.l * p.w * p.h / 1e6).toFixed(4);
    const volTot  = (volUnit * p.qty).toFixed(3);
    return `
      <div class="product-row">
        <span class="prod-name">${p.name}</span>
        <span class="prod-dims">${p.l}Ã—${p.w}Ã—${p.h} cm</span>
        <span>${volUnit} mÂ³</span>
        <span>${p.qty}</span>
        <span>${volTot} mÂ³</span>
        <button class="btn-remove-prod" onclick="removeProduct(${p.id})">Ã—</button>
      </div>`;
  }).join('');

  document.getElementById('summaryBar').style.display = 'flex';
  updateContainerViz();
}

function updateContainerViz(empty = false) {
  const cType = document.getElementById('containerType')?.value || '20ft';
  const cont  = CONTAINERS[cType];

  if (empty || !STATE.products.length) {
    document.getElementById('containerFill').style.width = '0%';
    document.getElementById('containerLabel').textContent = '0%';
    document.getElementById('infoCapacity').textContent = `Capacidad: ${cont.vol} mÂ³`;
    document.getElementById('infoUsed').textContent    = 'Usado: 0 mÂ³';
    document.getElementById('infoFit').textContent     = 'Caben: â€”';
    document.getElementById('infoWeight').textContent  = 'Peso total: 0 kg';
    return;
  }

  let totalVol = 0, totalWeight = 0;
  STATE.products.forEach(p => {
    const volUnit = p.l * p.w * p.h / 1e6;
    totalVol    += volUnit * p.qty;
    totalWeight += p.weight * p.qty;
  });

  const pct = Math.min(100, (totalVol / cont.vol) * 100);
  const fill = document.getElementById('containerFill');
  fill.style.width = `${pct}%`;
  fill.style.background = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#3b82f6';

  document.getElementById('containerLabel').textContent  = `${pct.toFixed(1)}%`;
  document.getElementById('infoCapacity').textContent    = `Capacidad: ${cont.vol} mÂ³`;
  document.getElementById('infoUsed').textContent        = `Usado: ${totalVol.toFixed(2)} mÂ³`;
  document.getElementById('infoFit').textContent         = pct > 100 ? 'âš  Excede capacidad' : `Disponible: ${(cont.vol - totalVol).toFixed(2)} mÂ³`;
  document.getElementById('infoWeight').textContent      = `Peso total: ${totalWeight.toFixed(1)} kg`;

  // Summary bar
  document.getElementById('sumVol').textContent    = `${totalVol.toFixed(2)} mÂ³`;
  document.getElementById('sumWeight').textContent = `${totalWeight.toFixed(1)} kg`;
  document.getElementById('sumEff').textContent    = `${pct.toFixed(1)}%`;

  if (document.getElementById('container3DView').style.display !== 'none') {
  init3D();
}
}

function loadExample(type) {

  showLoading();

setTimeout(() => {
  // lógica actual
  hideLoading();
}, 800);

  const examples = {
    pallets: [
      { name: 'Pallet estÃ¡ndar',   l: 120, w: 100, h: 120, weight: 800, qty: 10 },
      { name: 'Pallet europeo',    l: 120, w: 80,  h: 100, weight: 600, qty: 8  },
    ],
    cajas: [
      { name: 'Caja grande',       l: 80,  w: 60,  h: 60,  weight: 30,  qty: 25 },
      { name: 'Caja mediana',      l: 50,  w: 40,  h: 40,  weight: 15,  qty: 40 },
      { name: 'Caja pequeÃ±a',      l: 30,  w: 20,  h: 20,  weight: 5,   qty: 100 },
    ],
    electrodomesticos: [
      { name: 'Lavadora',          l: 60,  w: 55,  h: 85,  weight: 70,  qty: 5  },
      { name: 'Nevera mediana',    l: 60,  w: 65,  h: 160, weight: 80,  qty: 4  },
      { name: 'Microondas',        l: 48,  w: 35,  h: 28,  weight: 12,  qty: 10 },
    ],
  };

  STATE.products = examples[type].map((p, i) => ({ ...p, id: Date.now() + i }));
  renderProductsTable();
  updateContainerViz();
  toast(`Ejemplo "${type}" cargado`, 'success');
}

function clearProducts() {
  STATE.products = [];
  renderProductsTable();
  toast('Lista limpiada', 'success');
}

function saveCubicaje() {
  saveToStorage();
  toast('âœ” Cubicaje guardado', 'success');
  if (STATE.useSupabase) saveCubicajeToSupabase();
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ENTURNAMIENTO / CITAS MODULE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function addCita(e) {
  e.preventDefault();
  const cita = {
    id:        Date.now(),
    empresa:   document.getElementById('citaEmpresa').value.trim(),
    tipo:      document.getElementById('citaTipo').value,
    fecha:     document.getElementById('citaFecha').value,
    hora:      document.getElementById('citaHora').value,
    muelle:    document.getElementById('citaMuelle').value,
    duracion:  parseInt(document.getElementById('citaDuracion').value),
    notas:     document.getElementById('citaNotas').value.trim(),
    estado:    'pendiente',
  };

  STATE.citas.push(cita);
  renderCitas();
  buildWeekStrip();
  saveToStorage();
  toast(`âœ” Cita para "${cita.empresa}" agendada`, 'success');
  document.getElementById('citaForm').reset();

  if (STATE.useSupabase) saveCitaToSupabase(cita);
}

function updateCitaStatus(id, newStatus) {
  const c = STATE.citas.find(x => x.id === id);
  if (!c) return;
  c.estado = newStatus;
  renderCitas();
  saveToStorage();
  toast(`Estado actualizado: ${capitalize(newStatus)}`, 'success');
}

function deleteCita(id) {
  STATE.citas = STATE.citas.filter(c => c.id !== id);
  renderCitas();
  buildWeekStrip();
  saveToStorage();
  toast('Cita eliminada', 'success');
}

function filterCitas(filter, btn) {
  STATE.citaFilter = filter;
  document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderCitas();
}

function renderCitas() {
  const list = document.getElementById('citasList');
  if (!list) return;

  let filtered = STATE.citas;
  if (STATE.citaFilter !== 'all') {
    filtered = filtered.filter(c => c.estado === STATE.citaFilter);
  }
  // Sort by fecha+hora
  filtered.sort((a, b) => `${a.fecha}${a.hora}` > `${b.fecha}${b.hora}` ? 1 : -1);

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state">No hay citas para mostrar</div>';
    return;
  }

  const tipoColors = { carga: '#10b981', descarga: '#ef4444', mixto: '#f59e0b' };
  const statusNext = { pendiente: 'confirmado', confirmado: 'completado', completado: 'pendiente' };
  const statusEmoji = { pendiente: 'â–·', confirmado: 'âœ“', completado: 'âœ”âœ”' };

  list.innerHTML = filtered.map(c => {
    const color = tipoColors[c.tipo] || '#3b82f6';
    return `
      <div class="cita-card">
        <div class="cita-accent-bar" style="background:${color}"></div>
        <div class="cita-content">
          <div class="cita-header-row">
            <span class="cita-empresa-name">${c.empresa}</span>
            <span class="status-badge status-${c.estado}">${capitalize(c.estado)}</span>
          </div>
          <div class="cita-meta">
            <span>ðŸ“… ${formatDate(c.fecha)}</span>
            <span>ðŸ• ${c.hora}</span>
            <span>ðŸšª ${c.muelle}</span>
            <span>â± ${c.duracion} min</span>
            <span>${tipoLabel(c.tipo)}</span>
          </div>
          ${c.notas ? `<div style="font-size:11px;color:var(--text-3);margin-top:4px">ðŸ“ ${c.notas}</div>` : ''}
        </div>
        <div class="cita-actions">
          <button class="btn-icon" title="Avanzar estado" onclick="updateCitaStatus(${c.id}, '${statusNext[c.estado]}')">${statusEmoji[c.estado]}</button>
          <button class="btn-icon" title="Eliminar" onclick="deleteCita(${c.id})" style="color:var(--red)">âœ•</button>
        </div>
      </div>`;
  }).join('');
}

function buildWeekStrip() {
  const strip = document.getElementById('weekStrip');
  if (!strip) return;
  const days = ['Dom','Lun','Mar','MiÃ©','Jue','Vie','SÃ¡b'];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Get week starting from Monday
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));

  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    const isToday = dStr === todayStr;
    const hasCitas = STATE.citas.some(c => c.fecha === dStr);
    html += `
      <div class="day-cell ${isToday ? 'today' : ''}">
        <div class="day-name">${days[d.getDay()]}</div>
        <div class="day-num">${d.getDate()}</div>
        ${hasCitas ? '<div class="day-dot"></div>' : ''}
      </div>`;
  }
  strip.innerHTML = html;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ENRUTAMIENTO MODULE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// function initMap() {
//   if (STATE.map) return; // already initialized

//   // Mapbox token (demo/public token - replace with your own)
//   mapboxgl.accessToken = 'pk.eyJ1IjoibG9naXRyYWNrLWRlbW8iLCJhIjoiY2x5ZGVtbyJ9.placeholder';

//   // If mapbox token invalid, show visual fallback
//   try {
//     STATE.map = new mapboxgl.Map({
//       container: 'routeMap',
//       style: 'mapbox://styles/mapbox/dark-v11',
//       center: [-74.0721, 4.7110], // BogotÃ¡
//       zoom: 5.5,
//     });
//     STATE.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
//     document.getElementById('mapOverlay').style.display = 'flex';
//   } catch(err) {
//     renderFallbackMap();
//   }
// }


function initMap() {

  // 🚨 FORZAR FALLBACK SI NO HAY TOKEN REAL
  const TOKEN_REAL = false;

  if (!TOKEN_REAL) {
    renderFallbackMap();
    return;
  }

  mapboxgl.accessToken = '';

  STATE.map = new mapboxgl.Map({
    container: 'routeMap',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-74.0721, 4.7110],
    zoom: 5.5,
  });

  STATE.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
}

function renderFallbackMap() {
  const mapEl = document.getElementById('routeMap');
  const overlay = document.getElementById('mapOverlay');
  overlay.style.display = 'none';
  mapEl.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="background:#1c2030">
      <!-- Colombia outline approximation (decorative) -->
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6"/>
          <stop offset="100%" style="stop-color:#8b5cf6"/>
        </linearGradient>
      </defs>
      <!-- Grid lines -->
      ${[...Array(10)].map((_, i) => `<line x1="${i*80}" y1="0" x2="${i*80}" y2="500" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>`).join('')}
      ${[...Array(7)].map((_, i) => `<line x1="0" y1="${i*80}" x2="800" y2="${i*80}" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>`).join('')}

      <!-- Route line (demo) -->
      <polyline id="svgRoute" points="400,80 300,200 250,320 450,400 600,250" 
        fill="none" stroke="url(#routeGrad)" stroke-width="3" stroke-dasharray="8,4"
        filter="url(#glow)" opacity="0"/>

      <!-- City dots -->
      <g id="svgCities" opacity="0">
        <circle cx="400" cy="80"  r="8" fill="#3b82f6" filter="url(#glow)"/>
        <text x="415" y="84" fill="#e8ecf4" font-size="12" font-family="DM Sans">BogotÃ¡</text>

        <circle cx="300" cy="200" r="6" fill="#60a5fa"/>
        <text x="315" y="204" fill="#8b92a8" font-size="11" font-family="DM Sans">MedellÃ­n</text>

        <circle cx="250" cy="320" r="6" fill="#60a5fa"/>
        <text x="265" y="324" fill="#8b92a8" font-size="11" font-family="DM Sans">Cali</text>

        <circle cx="450" cy="400" r="6" fill="#60a5fa"/>
        <text x="465" y="404" fill="#8b92a8" font-size="11" font-family="DM Sans">Barranquilla</text>

        <circle cx="600" cy="250" r="6" fill="#60a5fa"/>
        <text x="615" y="254" fill="#8b92a8" font-size="11" font-family="DM Sans">Cartagena</text>
      </g>

      <!-- Overlay message -->
      <g id="svgOverlayMsg">
        <rect x="250" y="190" width="300" height="80" rx="10" fill="rgba(28,32,48,0.95)" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>
        <text x="400" y="222" text-anchor="middle" fill="#e8ecf4" font-size="14" font-family="Syne" font-weight="600">VisualizaciÃ³n de Ruta</text>
        <text x="400" y="248" text-anchor="middle" fill="#8b92a8" font-size="12" font-family="DM Sans">Presiona "Calcular Ruta" para ver</text>
      </g>
    </svg>`;
}

function calculateRoute() {

  showLoading();

setTimeout(() => {
  // lógica actual
  hideLoading();
}, 800);
  const stops = [...document.querySelectorAll('#stopsList .stop-item input')]
    .map(i => i.value.trim())
    .filter(Boolean);

  if (!stops.length) {
    toast('Agrega al menos una parada', 'error');
    return;
  }

  const origin = document.getElementById('routeOrigin').value || 'BogotÃ¡';

  // Simulated distances (demo mode)
  const demoDistances = [487, 462, 1020]; // km entre ciudades principales Colombia
  const totalDist = demoDistances.slice(0, stops.length).reduce((a, b) => a + b, 0);
  const vehicle   = document.getElementById('vehicleType').value;
  const speeds    = { camion: 70, furgon: 80, moto: 60 };
  const speed     = speeds[vehicle] || 70;
  const totalTime = totalDist / speed;
  const fuelPer100 = vehicle === 'camion' ? 35 : vehicle === 'furgon' ? 12 : 4;
  const fuel = (totalDist / 100 * fuelPer100).toFixed(0);

  // Update summary
  document.getElementById('routeSummary').style.display = 'block';
  document.getElementById('rsDist').textContent  = `${totalDist.toLocaleString()} km`;
  document.getElementById('rsTime').textContent  = `${Math.floor(totalTime)}h ${Math.round((totalTime % 1)*60)}min`;
  document.getElementById('rsStops').textContent = `${stops.length} paradas`;
  document.getElementById('rsFuel').textContent  = `~${fuel} L`;

  // Animate map
  animateMap(origin, stops);
  renderRouteSteps(origin, stops, demoDistances);
  toast('âœ” Ruta calculada y optimizada', 'success');
}

function animateMap(origin, stops) {
  // Try actual mapbox
  if (STATE.map && mapboxgl.accessToken !== 'pk.eyJ1IjoibG9naXRyYWNrLWRlbW8iLCJhIjoiY2x5ZGVtbyJ9.placeholder') {
    addMapboxMarkers(origin, stops);
    return;
  }

  // SVG fallback animation
  const svgRoute   = document.getElementById('svgRoute');
  const svgCities  = document.getElementById('svgCities');
  const svgMsg     = document.getElementById('svgOverlayMsg');

  if (svgRoute) {
    svgRoute.style.transition  = 'opacity 0.5s';
    svgCities.style.transition = 'opacity 0.5s';
    svgRoute.style.opacity  = '1';
    svgCities.style.opacity = '1';
    if (svgMsg) svgMsg.style.display = 'none';

    // Animate dash offset
    const len = svgRoute.getTotalLength?.() || 600;
    svgRoute.style.strokeDasharray  = len;
    svgRoute.style.strokeDashoffset = len;
    svgRoute.style.transition = 'stroke-dashoffset 2s ease, opacity 0.5s';
    setTimeout(() => { svgRoute.style.strokeDashoffset = '0'; }, 100);
  }

  // Hide map overlay
  document.getElementById('mapOverlay').style.display = 'none';
}

function renderRouteSteps(origin, stops, distances) {
  const allPoints = [origin, ...stops];
  const vehicle = document.getElementById('vehicleType').value;
  const speeds  = { camion: 70, furgon: 80, moto: 60 };
  const speed   = speeds[vehicle] || 70;

  let html = '';
  allPoints.forEach((point, i) => {
    const dist = i > 0 ? (distances[i-1] || 300) : null;
    const time = dist ? `${Math.floor(dist/speed)}h ${Math.round(((dist/speed)%1)*60)}min` : null;
    html += `
      <div class="step-item">
        <div class="step-num">${i === 0 ? 'âŠ™' : i}</div>
        <div class="step-info">
          <div class="step-addr">${point}</div>
          <div class="step-meta">${i === 0 ? 'Punto de origen' : `Parada ${i} Â· ${time} desde anterior`}</div>
        </div>
        ${dist ? `<span class="step-dist">${dist} km</span>` : ''}
      </div>`;
  });

  document.getElementById('routeSteps').innerHTML = html;
}

function addStop() {
  const list = document.getElementById('stopsList');
  const count = list.querySelectorAll('.stop-item').length + 1;
  const div = document.createElement('div');
  div.className = 'stop-item';
  div.innerHTML = `
    <span class="stop-num">${count}</span>
    <input type="text" placeholder="DirecciÃ³n de entrega">
    <button type="button" class="btn-remove" onclick="removeStop(this)">Ã—</button>`;
  list.appendChild(div);
  updateStopNumbers();
}

function removeStop(btn) {
  btn.parentElement.remove();
  updateStopNumbers();
}

function updateStopNumbers() {
  document.querySelectorAll('#stopsList .stop-num').forEach((n, i) => { n.textContent = i + 1; });
}

function toggleMapView() {
  const mapEl   = document.getElementById('mapContainer');
  const stepsEl = document.getElementById('routeSteps');
  STATE.mapView = STATE.mapView === 'map' ? 'list' : 'map';
  mapEl.style.display   = STATE.mapView === 'map'  ? 'block' : 'none';
  stepsEl.style.display = STATE.mapView === 'list' ? 'flex'  : 'none';
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SUPABASE INTEGRATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function connectSupabase() {
  const url = document.getElementById('sbUrl').value.trim();
  const key = document.getElementById('sbKey').value.trim();

  if (!url || !key) { toast('Ingresa URL y Key de Supabase', 'error'); return; }

  try {
    STATE.supabase    = supabase.createClient(url, key);
    STATE.useSupabase = true;
    document.getElementById('connText').textContent = 'Supabase âœ“';
    document.querySelector('.conn-dot').classList.add('connected');
    closeModal();
    loadFromSupabase();
    toast('âœ” Conectado a Supabase', 'success');
  } catch(err) {
    toast('Error al conectar: ' + err.message, 'error');
  }
}

function skipSupabase() {
  closeModal();
  toast('Modo demo activo â€” datos locales', 'success');
}

function closeModal() {
  document.getElementById('supabaseModal').style.display = 'none';
}

// â”€â”€ Supabase CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function saveCitaToSupabase(cita) {
  if (!STATE.supabase) return;
  const { error } = await STATE.supabase.from('citas').insert([{
    empresa:  cita.empresa,
    tipo:     cita.tipo,
    fecha:    cita.fecha,
    hora:     cita.hora,
    muelle:   cita.muelle,
    duracion: cita.duracion,
    estado:   cita.estado,
    notas:    cita.notas,
  }]);
  if (error) console.error('Supabase error:', error.message);
}

async function loadFromSupabase() {
  if (!STATE.supabase) return;
  const { data, error } = await STATE.supabase
    .from('citas')
    .select('*')
    .order('fecha', { ascending: true });

  if (error) { console.error(error); return; }
  if (data?.length) {
    STATE.citas = data;
    renderCitas();
    buildWeekStrip();
    renderCitasMini();
    toast(`ðŸ“¥ ${data.length} citas cargadas desde Supabase`, 'success');
  }
}

async function saveCubicajeToSupabase() {
  if (!STATE.supabase) return;
  const cType = document.getElementById('containerType').value;
  let totalVol = 0, totalWeight = 0;
  STATE.products.forEach(p => {
    totalVol    += (p.l * p.w * p.h / 1e6) * p.qty;
    totalWeight += p.weight * p.qty;
  });

  const { error } = await STATE.supabase.from('cubicaje').insert([{
    container_type:   cType,
    total_volume_m3:  totalVol,
    total_weight_kg:  totalWeight,
    products_json:    JSON.stringify(STATE.products),
    created_at:       new Date().toISOString(),
  }]);
  if (error) console.error('Supabase error:', error.message);
  else toast('âœ” Cubicaje guardado en Supabase', 'success');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LOCAL STORAGE FALLBACK
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function saveToStorage() {
  try {
    localStorage.setItem('lt_products', JSON.stringify(STATE.products));
    localStorage.setItem('lt_citas',    JSON.stringify(STATE.citas));
  } catch(e) {}
}

function loadFromStorage() {
  try {
    const p = localStorage.getItem('lt_products');
    const c = localStorage.getItem('lt_citas');
    if (p) STATE.products = JSON.parse(p);
    if (c) STATE.citas    = JSON.parse(c);
  } catch(e) {}
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TOAST NOTIFICATIONS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; }, 3000);
  setTimeout(() => el.remove(), 3400);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 3D CONTAINER VISUALIZATION MODULE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let scene3D = null;
let camera3D = null;
let renderer3D = null;
let controls3D = null;
let container3D = null;
let boxMeshes = [];
let containerMesh = null;
let animationFrameId = null;
const colorPalette = {
  'default': 0x3b82f6,
  'electronics': 0x10b981,
  'clothing': 0xf59e0b,

// --------------------------------------------------------
// SISTEMA 3D ESPECTACULAR COMPLETO - LOGITRACK
// Contenedores premium + Palets realistas + UI HUD
// --------------------------------------------------------

// -- PALETA DE COLORES 3D (continuación) --
  'food': 0x22c55e,
  'chemical': 0xef4444,
  'fragile': 0x8b5cf6,
  'paper': 0xf97316,
  'metal': 0x64748b,
};

// -- ESPECIFICACIONES DE CONTENEDORES (metros) --
const CONTAINER_SPECS = {
  '20ft':   { l: 6.06, w: 2.44, h: 2.59, color: 0x4a5f7a, name: '20ft Estándar' },
  '40ft':   { l: 12.19, w: 2.44, h: 2.59, color: 0x4a5f7a, name: '40ft High Cube' },
  'camion': { l: 8.00, w: 2.40, h: 2.50, color: 0x2d4a6e, name: 'Camión / Mula' },
  'furgon': { l: 4.00, w: 2.00, h: 2.00, color: 0x3a5a7c, name: 'Furgón' },
};

// -- COLORES PREMIUM POR TIPO DE CARGA --
const CARGO_COLORS = {
  'electronicos':  { base: 0x1a8cff, emissive: 0x0a448c, name: 'Electrónicos' },
  'textil':        { base: 0xff6b35, emissive: 0x8b3a1a, name: 'Textil/Ropa' },
  'alimentos':     { base: 0x4ade80, emissive: 0x1a6b3a, name: 'Alimentos' },
  'quimico':       { base: 0xef4444, emissive: 0x8b1a1a, name: 'Químicos' },
  'fragil':        { base: 0xa855f7, emissive: 0x581d8b, name: 'Frágil' },
  'metal':         { base: 0x94a3b8, emissive: 0x334155, name: 'Metal' },
  'papel':         { base: 0xf59e0b, emissive: 0x8b4a1a, name: 'Papel/Cartón' },
  'default':       { base: 0x3b82f6, emissive: 0x1a4a8c, name: 'General' },
};

function getCargoType(name) {
  const n = name.toLowerCase();
  if (n.match(/laptop|celular|electro|tecnolog|pc|tablet/)) return 'electronicos';
  if (n.match(/ropa|camisa|pantalon|textil|vestido|moda/)) return 'textil';
  if (n.match(/comida|alimento|bebida|fruta|carne/)) return 'alimentos';
  if (n.match(/quimico|ácido|limpieza|peligroso/)) return 'quimico';
  if (n.match(/vidrio|frágil|cristal|delicado/)) return 'fragil';
  if (n.match(/hierro|metal|acero|aluminio|pieza/)) return 'metal';
  if (n.match(/papel|carton|libro|documento/)) return 'papel';
  return 'default';
}

// -- TOGGLE 3D --
function toggle3DView() {
  const view3D = document.getElementById('container3DView');
  const view2D = document.getElementById('container2DView');
  const isHidden = view3D.style.display === 'none';
  
  if (isHidden) {
    view3D.style.display = 'block';
    view2D.style.display = 'none';
    init3DViewer();
  } else {
    view3D.style.display = 'none';
    view2D.style.display = 'flex';
    cleanup3DViewer();
  }
}


// -- INICIALIZAR VISTOR 3D (PREMIUM) --
function init3DViewer() {
  if (scene3D) return;

  const container = document.getElementById('threeContainer');
  if (!container) return;
  container.innerHTML = '';

  const width = container.clientWidth;
  const height = container.clientHeight;

  // -- ESCENA --
  scene3D = new THREE.Scene();
  scene3D.background = new THREE.Color(0x0a0c10);
  scene3D.fog = new THREE.FogExp2(0x0a0c10, 0.015);

  // -- CÁMARA --
  const type = document.getElementById('containerType')?.value || '20ft';
  const spec = CONTAINER_SPECS[type];
  camera3D = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
  camera3D.position.set(spec.l * 1.5, spec.h * 1.2, spec.l * 1.8);

  // -- RENDERER --
  renderer3D = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer3D.setSize(width, height);
  renderer3D.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer3D.shadowMap.enabled = true;
  renderer3D.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer3D.domElement);

  // -- LUCES --
  scene3D.add(new THREE.AmbientLight(0xffffff, 0.3));
  
  const sunLight = new THREE.DirectionalLight(0xffd8b0, 1.2);
  sunLight.position.set(spec.l, spec.h * 3, spec.l * 0.5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -spec.l * 2;
  sunLight.shadow.camera.right = spec.l * 2;
  sunLight.shadow.camera.top = spec.h * 2;
  sunLight.shadow.camera.bottom = -spec.h * 2;
  scene3D.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x4a90d9, 0.4);
  fillLight.position.set(-spec.l, spec.h, -spec.l * 0.5);
  scene3D.add(fillLight);

  // -- CONTROLES --
  controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
  controls3D.enableDamping = true;
  controls3D.dampingFactor = 0.05;
  controls3D.minDistance = spec.l * 0.5;
  controls3D.maxDistance = spec.l * 5;
  controls3D.maxPolarAngle = Math.PI * 0.48;
  controls3D.target.set(0, spec.h * 0.3, 0);

  // -- RAYCASTER --
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // -- CONSTRUIR ESCENA --
  buildContainerScene();
  renderCargo();
  updateHUD();
  animate3D();

  // -- EVENTOS --
  window.addEventListener('resize', onWindowResize3D);
  renderer3D.domElement.addEventListener('mousemove', onMouseMove3D);
  renderer3D.domElement.addEventListener('mouseleave', onMouseLeave3D);
}

// -- CONSTRUIR CONTENEDOR 3D PREMIUM --
function buildContainerScene() {
  const type = document.getElementById('containerType')?.value || '20ft';
  const spec = CONTAINER_SPECS[type];
  const wallT = 0.003, floorT = 0.015;

  if (containerMesh) scene3D.remove(containerMesh);
  const group = new THREE.Group();
  group.name = 'containerGroup';

  // SUELO (madera)
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(spec.l, floorT, spec.w),
    new THREE.MeshStandardMaterial({ color: 0x5c402e, roughness: 0.9 })
  );
  floor.position.y = floorT / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // PAREDES
  const wallMat = new THREE.MeshStandardMaterial({ color: spec.color, metalness: 0.7, roughness: 0.4 });
  const sideGeo = new THREE.BoxGeometry(spec.l, spec.h - floorT - wallT, wallT);
  
  ['left', 'right'].forEach((side, i) => {
    const wall = new THREE.Mesh(sideGeo, wallMat);
    wall.position.set(0, (spec.h - floorT) / 2, (i === 0 ? -1 : 1) * (spec.w / 2 - wallT / 2));
    wall.castShadow = wall.receiveShadow = true;
    group.add(wall);
  });

  // TECHO
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(spec.l, wallT, spec.w),
    wallMat
  );
  roof.position.y = spec.h - wallT / 2;
  roof.castShadow = roof.receiveShadow = true;
  group.add(roof);

  // PUERTAS (abiertas)
  const doorW = spec.l / 2 - 0.05, doorH = spec.h - floorT - 0.1, doorD = wallT + 0.01;
  const doorMat = new THREE.MeshStandardMaterial({ color: spec.color * 0.7, metalness: 0.8, roughness: 0.3 });
  
  const doorL = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorD), doorMat);
  doorL.position.set(-doorW/2 - 0.025, floorT + doorH/2, spec.w/2 + doorD/2);
  doorL.rotation.y = -Math.PI / 180 * 5;
  doorL.castShadow = true;
  group.add(doorL);

  const doorR = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorD), doorMat);
  doorR.position.set(doorW/2 + 0.025, floorT + doorH/2, spec.w/2 + doorD/2);
  doorR.rotation.y = Math.PI / 180 * 5;
  doorR.castShadow = true;
  group.add(doorR);

  // REFUERZOS
  const reinf = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, doorH, doorD),
    new THREE.MeshStandardMaterial({ color: 0x2a3a4a, metalness: 0.9, roughness: 0.2 })
  );
  [-1, 1].forEach(s => {
    const r = reinf.clone();
    r.position.set(s * (doorW/2 + 0.01 + doorW/2), floorT + doorH/2, spec.w/2 + doorD/2);
    group.add(r);
  });

  // ESQUINAS
  const cornerGeo = new THREE.BoxGeometry(wallT, spec.h - floorT, wallT);
  const cornerMat = new THREE.MeshStandardMaterial({ color: spec.color, metalness: 0.8 });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const c = new THREE.Mesh(cornerGeo, cornerMat);
    c.position.set(sx * (spec.l/2 - wallT/2), (spec.h - floorT)/2, sz * (spec.w/2 - wallT/2));
    c.castShadow = true;
    group.add(c);
  });

  // SOMBRA
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(spec.l * 0.6, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = floorT + 0.001;
  group.add(shadow);

  scene3D.add(group);
  containerMesh = group;

  // GLOW
  const glow = document.createElement('div');
  glow.className = 'container-glow active';
  container.appendChild(glow);
}

// -- CREAR PALET REALISTA --
function createPallet(len, wid, hei, tint) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.8, metalness: 0.1 });
  const nail = new THREE.MeshStandardMaterial({ color: 0x3a3529, metalness: 0.4 });

  // Tablas longitudinales
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(len, hei, 0.08), wood);
    b.position.set(-len/2 + len * i/4, 0, 0);
    b.castShadow = true;
    g.add(b);
  }

  // Tablas transversales
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(wid, hei, 0.08), wood);
    b.position.set(0, 0, -wid/2 + wid * i/2);
    b.castShadow = true;
    g.add(b);
  }

  // Clavos
  for (let i = 0; i < 6; i++) {
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8), nail);
    n.position.set(-len/2 + len * i/5, hei/2 + 0.015, 0);
    n.castShadow = true;
    g.add(n);
  }

  return g;
}

// -- CREAR CAJA PREMIUM --
function createCargoBox(l, w, h, col, name) {
  const g = new THREE.Group();
  
  // Cuerpo
  const bodyMat = new THREE.MeshStandardMaterial({ color: col.base, emissive: col.emissive, emissiveIntensity: 0.15, roughness: 0.5, metalness: 0.1 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(l, h * 0.9, w), bodyMat);
  body.position.y = h * 0.45;
  body.castShadow = true;
  g.add(body);

  // Tapa
  const topMat = new THREE.MeshStandardMaterial({ color: col.base, emissive: col.emissive, emissiveIntensity: 0.2, roughness: 0.4, metalness: 0.05 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(l * 0.95, h * 0.1, w * 0.95), topMat);
  top.position.y = h * 0.88;
  top.castShadow = true;
  g.add(top);

  // Bordes metálicos
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x333333, emissiveIntensity: 0.2, roughness: 0.3, metalness: 0.5 });
  const es = Math.min(l, w, h) * 0.03;
  const eg = new THREE.BoxGeometry(es, h, es);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const e = new THREE.Mesh(eg, edgeMat);
    e.position.set(sx * (l/2 - es/2), h/2, sz * (w/2 - es/2));
    e.castShadow = true;
    g.add(e);
  });

  // Etiqueta
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 14px DM Sans';
  ctx.textAlign = 'center';
  const sn = name.length > 12 ? name.substring(0, 10) + '...' : name;
  ctx.fillText(sn, 128, 55);
  ctx.font = '10px DM Sans';
  ctx.fillStyle = '#666';
  ctx.fillText(`${l*100}×${w*100}cm`, 128, 80);
  const tex = new THREE.CanvasTexture(canvas);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(l * 0.6, h * 0.3), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
  label.position.set(0, h * 0.35, w/2 + 0.01);
  label.rotation.y = Math.PI;
  g.add(label);

  // Reflejo
  const hl = new THREE.Mesh(new THREE.BoxGeometry(l * 0.98, h * 0.02, w * 0.98), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, roughness: 0.1, metalness: 0.8 }));
  hl.position.y = h * 0.8;
  g.add(hl);

  return g;
}

// -- RENDER CARGA --
function renderCargo() {
  palletMeshes.forEach(p => scene3D.remove(p));
  cargoMeshes.forEach(c => scene3D.remove(c));
  palletMeshes = [];
  cargoMeshes = [];

  const type = document.getElementById('containerType')?.value || '20ft';
  const spec = CONTAINER_SPECS[type];
  const products = [...STATE.products].sort((a, b) => (b.l * b.w) - (a.l * a.w));

  if (!products.length) return;

  const palletW = 1.2, palletL = 1.0, palletH = 0.15;
  let curX = -spec.l / 2 + 1.0, curZ = -spec.w / 2 + 0.8, maxLH = 0, layerY = floorThickness + 0.01, usedPallets = 0;
  let totalBoxes = 0;
  const floorThickness = 0.015;

  products.forEach((prod, pi) => {
    const cType = getCargoType(prod.name);
    const cColor = CARGO_COLORS[cType];
    const boxL = prod.l / 100, boxW = prod.w / 100, boxH = prod.h / 100;

    for (let q = 0; q < prod.qty; q++) {
      if (totalBoxes % 20 === 0) {
        if (usedPallets >= 12 && layerY > spec.h * 0.8) return;
        const pallet = createPallet(palletL, palletW, palletH, cColor.base);
        let px = curX + palletL / 2, pz = curZ + palletW / 2, py = layerY + palletH / 2;
        if (pz + palletW / 2 > spec.w / 2 - 0.2) {
          curZ = -spec.w / 2 + 0.8;
          curX += palletL + 0.15;
          if (curX + palletL / 2 > spec.l / 2 - 0.3) {
            curX = -spec.l / 2 + 1.0; layerY += maxLH + 0.05; maxLH = 0; usedPallets = 0;
            if (layerY + 0.5 > spec.h - 0.2) return;
          }
        }
        px = curX + palletL / 2; pz = curZ + palletW / 2;
        pallet.position.set(px, py, pz);
        pallet.castShadow = true;
        pallet.userData = { product: prod.name, dims: `${prod.l}×${prod.w}×${prod.h}cm`, vol: (prod.l*prod.w*prod.h/1e6).toFixed(3)+'m³', type: cType, colorName: cColor.name };
        scene3D.add(pallet);
        palletMeshes.push(pallet);
        usedPallets++;
      }

      const box = createCargoBox(boxL, boxW, boxH, cColor, prod.name);
      let bx = curX + Math.random() * 0.3, bz = curZ + Math.random() * 0.25;
      const by = layerY + palletH + boxH / 2 + Math.floor(totalBoxes / 20) * 0.02;
      box.position.set(bx, by, bz);
      box.castShadow = true;
      box.userData = { product: prod.name, dims: `${prod.l}×${prod.w}×${prod.h}cm`, vol: (prod.l*prod.w*prod.h/1e6).toFixed(4)+'m³', weight: prod.weight+'kg', type: cType, colorName: cColor.name };
      scene3D.add(box);
      cargoMeshes.push(box);

      maxLH = Math.max(maxLH, boxH);
      totalBoxes++;
      curZ += boxW + 0.01;
      if (curZ + boxW / 2 > spec.w / 2 - 0.15) {
        curZ = -spec.w / 2 + 0.8;
        curX += boxL + 0.08;
      }
      if (curX + boxL / 2 > spec.l / 2 - 0.15) {
        curX = -spec.l / 2 + 1.0; curZ = -spec.w / 2 + 0.8;
        layerY += maxLH + 0.03; maxLH = 0; usedPallets = 0;
        if (layerY + boxH > spec.h - 0.15) return;
      }
    }
  });
  updatePalletCounter(palletMeshes.length);
}

// -- HUD --
function updateHUD() {
  const type = document.getElementById('containerType')?.value || '20ft';
  const spec = CONTAINER_SPECS[type];
  let totalVol = 0, totalWeight = 0;
  STATE.products.forEach(p => { totalVol += p.l * p.w * p.h * p.qty / 1e6; totalWeight += p.weight * p.qty; });
  const usedPct = Math.min(100, (totalVol / spec.vol) * 100);

  let html = `<div class="hud-title"><span>??</span> Estado Contenedor</div>
    <div class="hud-item"><span class="hud-label">Capacidad</span><span class="hud-value">${spec.vol.toFixed(1)}m³</span></div>
    <div class="hud-item"><span class="hud-label">Ocupación</span><span class="hud-value ${usedPct > 85 ? 'amber' : 'accent'}">${usedPct.toFixed(1)}%</span></div>
    <div class="hud-item"><span class="hud-label">Carga 3D</span><span class="hud-value green">${cargoMeshes.length} ítems</span></div>
    <div class="hud-item"><span class="hud-label">Peso</span><span class="hud-value">${totalWeight.toFixed(0)}kg</span></div>
    <div id="hudProgress"><div id="hudProgressFill" style="width:${usedPct}%"></div></div>`;
  
  let el = document.getElementById('hudPanel');
  if (!el) { el = document.createElement('div'); el.id = 'hudPanel'; document.getElementById('threeContainer').appendChild(el); }
  el.innerHTML = html;
}

function updatePalletCounter(count) {
  let el = document.getElementById('palletCounter');
  if (!el) { el = document.createElement('div'); el.id = 'palletCounter'; document.getElementById('threeContainer').appendChild(el); }
  const spec = CONTAINER_SPECS[document.getElementById('containerType')?.value || '20ft'];
  el.innerHTML = `<div class="pallet-count">${count}</div><div class="pallet-label">Palets en Escena</div>`;
}

function addColorLegend() {
  let html = '<div id="colorLegend">';
  Object.entries(CARGO_COLORS).forEach(([k, v]) => {
    html += `<div class="color-legend-item"><div class="color-legend-dot" style="background:#${v.base.toString(16).padStart(6,'0')}"></div><span>${v.name}</span></div>`;
  });
  html += '</div>';
  const existing = document.getElementById('colorLegend'); if (existing) existing.remove();
  document.getElementById('threeContainer').insertAdjacentHTML('beforeend', html);
}

// -- HOVER TOOLTIP --
function onMouseMove3D(event) {
  if (!renderer3D || !scene3D || !camera3D) return;
  const rect = renderer3D.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera3D);
  const intersects = raycaster.intersectObjects([...palletMeshes, ...cargoMeshes]);
  if (intersects.length > 0 && intersects[0].object.userData.product) {
    showTooltip(event, intersects[0].object.userData);
    renderer3D.domElement.style.cursor = 'pointer';
  } else {
    hideTooltip();
    renderer3D.domElement.style.cursor = 'default';
  }
}

function showTooltip(event, data) {
  let tip = document.getElementById('boxTooltip');
  if (!tip) { tip = document.createElement('div'); tip.id = 'boxTooltip'; tip.className = 'box-tooltip'; document.body.appendChild(tip); }
  const col = CARGO_COLORS[data.type];
  tip.innerHTML = `<div class="tt-name" style="color:#${col.base.toString(16)}">?? ${data.product}</div><div class="tt-dims">?? ${data.dims}</div><div class="tt-dims">?? ${data.vol}</div>${data.weight ? `<div class="tt-dims">?? ${data.weight}</div>` : ''}<div class="tt-dims">??? ${data.colorName}</div>`;
  tip.style.display = 'block';
  tip.style.left = (event.clientX + 15) + 'px';
  tip.style.top = (event.clientY - 10) + 'px';
  const tr = tip.getBoundingClientRect();
  if (tr.right > window.innerWidth) tip.style.left = (event.clientX - tr.width - 15) + 'px';
}

function hideTooltip() { const t = document.getElementById('boxTooltip'); if (t) t.style.display = 'none'; }
function onMouseLeave3D() { hideTooltip(); }

// -- ANIMACIÓN --
function animate3D() {
  animationFrameId = requestAnimationFrame(animate3D);
  if (controls3D) controls3D.update();
  const t = Date.now() * 0.001;
  palletMeshes.forEach((p, i) => { p.rotation.y = Math.sin(t * 0.3 + i * 0.5) * 0.02; });
  if (renderer3D && scene3D && camera3D) renderer3D.render(scene3D, camera3D);
}

// -- RESIZE --
function onWindowResize3D() {
  const c = document.getElementById('threeContainer');
  if (!c || !camera3D || !renderer3D) return;
  camera3D.aspect = c.clientWidth / c.clientHeight;
  camera3D.updateProjectionMatrix();
  renderer3D.setSize(c.clientWidth, c.clientHeight);
}

// -- RESET CÁMARA --
function resetCamera() {
  if (!camera3D || !controls3D) return;
  const type = document.getElementById('containerType')?.value || '20ft';
  const spec = CONTAINER_SPECS[type];
  camera3D.position.set(spec.l * 1.5, spec.h * 1.2, spec.l * 1.8);
  controls3D.reset();
  controls3D.target.set(0, spec.h * 0.3, 0);
}

// -- LIMPIEZA --
function cleanup3DViewer() {
  window.removeEventListener('resize', onWindowResize3D);
  if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
  if (renderer3D) {
    renderer3D.dispose();
    if (renderer3D.domElement && renderer3D.domElement.parentNode) renderer3D.domElement.parentNode.removeChild(renderer3D.domElement);
  }
  scene3D = camera3D = renderer3D = controls3D = containerMesh = null;
  palletMeshes = cargoMeshes = [];
  raycaster = mouse = null;
  ['hudPanel', 'palletCounter', 'colorLegend', 'boxTooltip', 'container-glow'].forEach(id => {
    const el = id === 'container-glow' ? document.querySelector('.container-glow') : document.getElementById(id);
    if (el) el.remove();
  });
}

// -- ACTUALIZACIÓN DINÁMICA --
function updateContainerViz3D() {
  if (document.getElementById('container3DView').style.display !== 'none' && scene3D) {
    buildContainerScene();
    renderCargo();
    updateHUD();
    setTimeout(addColorLegend, 300);
  }
}

// -- LISTENER CAMBIO --
document.getElementById('containerType')?.addEventListener('change', updateContainerViz3D);

// -- INTEGRACIÓN CON UPDATE EXISTENTE --
const origUpdate = window.updateContainerViz;
window.updateContainerViz = function(empty) {
  if (origUpdate) origUpdate.call(this, empty);
  updateContainerViz3D();
};


// ==========================
// 3D SIMULADOR CONTENEDOR
// ==========================
let scene, camera, renderer, controls;

function init3D() {
  const container = document.getElementById('threeContainer');
  if (!container) return;

  container.innerHTML = '';

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  camera = new THREE.PerspectiveCamera(75, container.clientWidth / 300, 0.1, 1000);
  camera.position.set(5, 5, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, 300);
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Luz
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 10, 10);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  drawContainer();
  drawProducts();

  animate();
}

// function drawContainer() {
//   const geometry = new THREE.BoxGeometry(10, 5, 5);
//   const edges = new THREE.EdgesGeometry(geometry);
//   const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
//   scene.add(line);
// }

function drawContainer() {
  const geometry = new THREE.BoxGeometry(10, 5, 5);
  
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    opacity: 0.3,
    transparent: true
  });

  const container = new THREE.Mesh(geometry, material);
  scene.add(container);
}

// function drawProducts() {
//   let offsetX = -4;

//   STATE.products.forEach((p, index) => {
//     const scale = 0.01;

//     const geometry = new THREE.BoxGeometry(
//       p.l * scale,
//       p.h * scale,
//       p.w * scale
//     );

//     const material = new THREE.MeshStandardMaterial({
//       color: new THREE.Color(`hsl(${index * 60}, 70%, 50%)`)
//     });

//     for (let i = 0; i < p.qty; i++) {
//       const cube = new THREE.Mesh(geometry, material);

//       cube.position.x = offsetX + (i % 5) * 1.2;
//       cube.position.y = Math.floor(i / 5) * 1.2 - 2;
//       cube.position.z = 0;

//       scene.add(cube);
//     }

//     offsetX += 2;
//   });
// }


function drawProducts() {
  const spacing = 0.6;
  let startX = -4;
  let startY = -2;
  let startZ = -2;

  STATE.products.forEach((p, index) => {
    const scale = 0.01;

    const boxW = p.l * scale;
    const boxH = p.h * scale;
    const boxD = p.w * scale;

    const geometry = new THREE.BoxGeometry(boxW, boxH, boxD);

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(`hsl(${index * 80}, 70%, 50%)`)
    });

    let count = 0;

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          if (count >= p.qty) return;

          const cube = new THREE.Mesh(geometry, material);

          cube.position.set(
            startX + x * (boxW + spacing),
            startY + y * (boxH + spacing),
            startZ + z * (boxD + spacing)
          );

          scene.add(cube);
          count++;
        }
      }
    }

    startX += 2; // separa productos distintos
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}


function toggle3DView() {
  const view2D = document.getElementById('container2DView');
  const view3D = document.getElementById('container3DView');

  if (view3D.style.display === 'none') {
    view2D.style.display = 'none';
    view3D.style.display = 'block';

    setTimeout(() => {
      init3D();
    }, 100);
  } else {
    view2D.style.display = 'block';
    view3D.style.display = 'none';
  }
}

function resetCamera() {
  if (camera) {
    // camera.position.set(5, 5, 10);
    camera.position.set(8, 6, 12);
controls.target.set(0, 0, 0);
controls.update();
  }
}


function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}


function renderTruckLoad() {
  const container = document.getElementById('truckLayout');
  container.innerHTML = '';

  let total = 0;

  STATE.products.forEach(p => {
    total += p.qty;
  });

  for (let i = 0; i < total; i++) {
    const div = document.createElement('div');
    div.className = 'truck-box';
    container.appendChild(div);
  }
}


updateContainerViz();