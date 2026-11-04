/* ═══════════════════════════════════════════════════════════════════
   3CB · Cursos y Capacitaciones — núcleo (cursos.js)
   Catálogo, datos, filtros, progreso local y navegación por hash.
   Todo vive bajo el espacio de nombres window.CBCourses para no
   colisionar con el JavaScript del sitio oficial.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const CB = (window.CBCourses = window.CBCourses || {});

  /* ─────────── 1. Configuración (editable) ─────────── */
  CB.config = {
    dataUrl: 'data/cursos.json',          // ubicación del catálogo
    carpetaRecursos: 'assets/',           // carpeta de las mascotas
    mascotas: {
      guia:    { archivo: 'mascota-morada.png',   alt: 'Mascota morada de 3CB, guía de aprendizaje' },
      tecnico: { archivo: 'mascota-azul.png',     alt: 'Mascota azul de 3CB, especialista técnico' },
      retos:   { archivo: 'mascota-amarilla.png', alt: 'Mascota amarilla de 3CB, retos y recomendaciones' }
    },
    almacenamiento: {
      revisadas: 'cb-courses:revisadas',  // lecturas marcadas (LocalStorage)
      filtros:   'cb-courses:filtros'     // preferencias de filtrado
    }
  };
  CB.rutaMascota = clave => CB.config.carpetaRecursos + ((CB.config.mascotas[clave] || {}).archivo || '');

  /* ─────────── 2. Iconografía SVG (sin librerías externas) ─────────── */
  const A = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const ICONOS = {
    word:       `<svg ${A}><path d="M6 2.8h8.2L19 7.6V21.2H6z"/><path d="M14 3v5h5"/><path d="M8.7 11.8l1.4 5 1.9-4.1 1.9 4.1 1.4-5"/></svg>`,
    excel:      `<svg ${A}><rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9.3h17M3.5 14.6h17M9.2 4v16M14.8 4v16"/></svg>`,
    powerpoint: `<svg ${A}><rect x="3.5" y="4.4" width="17" height="12" rx="1.6"/><path d="M12 2.6v1.8M12 16.4v2.1M8.6 21h6.8"/><path d="M7.6 13.2v-2.3M11 13.2V8.9M14.4 13.2V10"/></svg>`,
    book:       `<svg ${A}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/></svg>`,
    reloj:      `<svg ${A}><circle cx="12" cy="12" r="8.6"/><path d="M12 7.6V12l3 2"/></svg>`,
    check:      `<svg ${A}><path d="M4.8 12.6l4.6 4.6L19.2 7"/></svg>`,
    arrowR:     `<svg ${A}><path d="M4.5 12h15M13.5 6l6 6-6 6"/></svg>`,
    arrowL:     `<svg ${A}><path d="M19.5 12h-15M10.5 6l-6 6 6 6"/></svg>`,
    target:     `<svg ${A}><circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>`,
    code:       `<svg ${A}><path d="M8.5 8l-4 4 4 4M15.5 8l4 4-4 4"/></svg>`,
    flag:       `<svg ${A}><path d="M5.5 21V4"/><path d="M5.5 5c4.6-2.3 7 2 12.2 0v8.2c-5.2 2.3-7.6-2-12.2 0"/></svg>`,
    star:       `<svg ${A}><path d="M12 3.8l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/></svg>`,
    key:        `<svg ${A}><circle cx="8" cy="14.6" r="4.2"/><path d="M11.2 11.4L20 2.9M16.6 6.3l3 3"/></svg>`,
    ext:        `<svg ${A}><path d="M9.5 5.5H5v13.5h13.5V14"/><path d="M13.5 4.5h6v6M19.5 4.5l-8.5 8.5"/></svg>`,
    alert:      `<svg ${A}><path d="M12 4.2L2.9 19.8h18.2z"/><path d="M12 10v4.2M12 17.1v.2"/></svg>`
  };

  const PROGRAMAS = {
    word:       { color: '#2B579A', icono: ICONOS.word },
    excel:      { color: '#1F6E43', icono: ICONOS.excel },
    powerpoint: { color: '#C9472B', icono: ICONOS.powerpoint }
  };
  const NIVELES_BASE = ['Básico', 'Intermedio', 'Avanzado'];
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  CB.programaDe = nombre => PROGRAMAS[norm(nombre)] || { color: '#33415E', icono: ICONOS.book };
  CB.claseNivel = nivel => ({ basico: 'basico', intermedio: 'intermedio', avanzado: 'avanzado' }[norm(nivel)] || 'neutro');

  /* ─────────── 3. Utilidades compartidas ─────────── */
  function escaparHtml(t) {
    return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* Mini-formato seguro: escapa HTML y luego aplica
     ```bloque``` → <pre>,  `código` → <code>,  **negrita**,
     párrafos por doble salto de línea y listas con viñetas • / - */
  function fmt(texto) {
    if (texto == null || String(texto).trim() === '') return '';
    const pres = [];
    let t = escaparHtml(texto);
    t = t.replace(/```([\s\S]*?)```/g, (_, c) => {
      pres.push(`<pre class="cb-courses-code"><code>${c.trim()}</code></pre>`);
      return `\u0000${pres.length - 1}\u0000`;
    });
    t = t.replace(/`([^`\n]+)`/g, '<code class="cb-courses-inline-code">$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    const html = t.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).map(p => {
      if (/^\u0000\d+\u0000$/.test(p)) return p;
      const lineas = p.split('\n');
      if (lineas.length > 1 && lineas.every(l => /^\s*[•\-–]\s+/.test(l))) {
        return '<ul class="cb-courses-list">' +
          lineas.map(l => `<li>${l.replace(/^\s*[•\-–]\s+/, '')}</li>`).join('') + '</ul>';
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
    return html.replace(/\u0000(\d+)\u0000/g, (_, i) => pres[+i]);
  }

  CB.utils = { escaparHtml, fmt, icono: n => ICONOS[n] || '' };

  /* ─────────── 4. LocalStorage (preferencias y progreso) ─────────── */
  const storage = {
    leer(clave, porDefecto) { try { const v = localStorage.getItem(clave); return v === null ? porDefecto : JSON.parse(v); } catch (e) { return porDefecto; } },
    guardar(clave, valor)   { try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* almacenamiento no disponible */ } }
  };

  CB.esRevisada = id => new Set(storage.leer(CB.config.almacenamiento.revisadas, [])).has(id);
  CB.setRevisada = (id, marcada) => {
    const s = new Set(storage.leer(CB.config.almacenamiento.revisadas, []));
    marcada ? s.add(id) : s.delete(id);
    storage.guardar(CB.config.almacenamiento.revisadas, [...s]);
    if (CB.state) CB.state.catalogoSucio = true;
    actualizarProgreso();
  };

  /* ─────────── 5. Estado y nodos ─────────── */
  CB.state = {
    cursos: [],
    cargado: false,
    vista: null,               // 'catalogo' | 'lector'
    filtros: storage.leer(CB.config.almacenamiento.filtros, { programa: 'Todos', nivel: 'Todos' }),
    scrollCatalogo: 0,
    ultimoId: null,
    catalogoSucio: true
  };

  let nodo = {};
  const $ = (s, r = document) => r.querySelector(s);
  const cssEsc = v => (window.CSS && CSS.escape) ? CSS.escape(v) : String(v).replace(/["\\]/g, '\\$&');
  const movimientoReducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────── 6. Mascotas: rutas configurables + degradación elegante ─────────── */
  CB.aplicarMascotas = raiz => {
    (raiz || document).querySelectorAll('img[data-cb-mascot]').forEach(img => {
      if (img.dataset.cbListo) return;
      img.dataset.cbListo = '1';
      const clave = img.getAttribute('data-cb-mascot');
      const m = CB.config.mascotas[clave];
      if (!m) return;
      if (!img.getAttribute('alt')) img.setAttribute('alt', m.alt);
      img.addEventListener('error', () => {
        const w = img.closest('[data-cb-mascot-wrap]') || img.parentElement;
        if (w) w.classList.add('cb-courses-mascot--noimg');
      }, { once: true });
      img.src = CB.rutaMascota(clave);
    });
  };

  /* ─────────── 7. Filtros ─────────── */
  function programasDisponibles() {
    const vistos = new Map();
    CB.state.cursos.forEach(c => { const k = norm(c.programa); if (!vistos.has(k)) vistos.set(k, c.programa); });
    return [...vistos.values()];
  }
  function nivelesDisponibles() {
    const base = [...NIVELES_BASE];
    CB.state.cursos.forEach(c => { if (!base.some(n => norm(n) === norm(c.nivel))) base.push(c.nivel); });
    return base;
  }
  function chipHtml(valor, activo, punto = '') {
    return `<button type="button" class="cb-courses-chip${activo ? ' is-active' : ''}" data-cb-valor="${escaparHtml(valor)}" aria-pressed="${activo}">${punto}${escaparHtml(valor)}</button>`;
  }

  function renderFiltros() {
    const f = CB.state.filtros;
    const progs = programasDisponibles();
    const niveles = nivelesDisponibles();
    if (!progs.some(p => norm(p) === norm(f.programa))) f.programa = 'Todos';
    if (!niveles.some(n => norm(n) === norm(f.nivel))) f.nivel = 'Todos';

    nodo.fPrograma.innerHTML =
      chipHtml('Todos', f.programa === 'Todos') +
      progs.map(p => chipHtml(p, norm(p) === norm(f.programa),
        `<span class="cb-courses-dot" style="--c:${CB.programaDe(p).color}" aria-hidden="true"></span>`)).join('');

    nodo.fNivel.innerHTML =
      chipHtml('Todos', f.nivel === 'Todos') +
      niveles.map(n => chipHtml(n, norm(n) === norm(f.nivel))).join('');
  }

  function aplicarFiltro(tipo, valor) {
    CB.state.filtros[tipo] = valor;
    storage.guardar(CB.config.almacenamiento.filtros, CB.state.filtros);
    renderFiltros();
    renderCatalogo();
  }

  /* ─────────── 8. Catálogo ─────────── */
  function cursosFiltrados() {
    const f = CB.state.filtros;
    return CB.state.cursos.filter(c =>
      (f.programa === 'Todos' || norm(c.programa) === norm(f.programa)) &&
      (f.nivel === 'Todos' || norm(c.nivel) === norm(f.nivel)));
  }

  function cardHtml(c, i) {
    const prog = CB.programaDe(c.programa);
    const revisada = CB.esRevisada(c.id);
    return `
    <article class="cb-courses-card${revisada ? ' cb-courses-card--done' : ''}" style="--cb-accent:${prog.color};--cb-i:${Math.min(i, 8)}">
      <div class="cb-courses-card-top">
        <span class="cb-courses-card-icon" aria-hidden="true">${prog.icono}</span>
        <span class="cb-courses-card-progwrap">
          <span class="cb-courses-card-programa">${escaparHtml(c.programa)}</span>
          <span class="cb-courses-pill cb-courses-pill--${CB.claseNivel(c.nivel)}">${escaparHtml(c.nivel)}</span>
        </span>
        ${revisada ? `<span class="cb-courses-card-doneflag">${ICONOS.check}Revisada</span>` : ''}
      </div>
      <h3 class="cb-courses-card-title">${escaparHtml(c.titulo)}</h3>
      <p class="cb-courses-card-desc">${escaparHtml(c.descripcion || '')}</p>
      <p class="cb-courses-card-meta">${ICONOS.reloj}${escaparHtml(c.duracion || '10 minutos')}</p>
      <button type="button" class="cb-courses-card-open" data-id="${escaparHtml(c.id)}">
        Consultar capacitación
        <span class="cb-courses-card-open-arrow" aria-hidden="true">${ICONOS.arrowR}</span>
      </button>
    </article>`;
  }

  function renderCatalogo() {
    if (!CB.state.cargado) return;
    const lista = cursosFiltrados();
    nodo.grid.innerHTML = lista.map(cardHtml).join('');
    nodo.grid.hidden = lista.length === 0;
    nodo.empty.hidden = lista.length > 0;

    nodo.count.textContent = CB.state.cursos.length === 0
      ? 'Catálogo vacío por ahora'
      : (lista.length === CB.state.cursos.length
          ? `${CB.state.cursos.length} capacitacion${CB.state.cursos.length === 1 ? '' : 'es'} disponibles`
          : `Mostrando ${lista.length} de ${CB.state.cursos.length}`);

    if (lista.length === 0) pintarVacio();
    actualizarProgreso();
  }

  function pintarVacio() {
    const f = CB.state.filtros;
    const partes = [];
    if (f.programa !== 'Todos') partes.push(`del programa <strong>${escaparHtml(f.programa)}</strong>`);
    if (f.nivel !== 'Todos') partes.push(`de nivel <strong>${escaparHtml(f.nivel)}</strong>`);
    $('#cb-courses-empty-text').innerHTML = partes.length
      ? `Aún no hay capacitaciones ${partes.join(' ')}.`
      : 'Aún no hay capacitaciones publicadas.';
  }

  function actualizarProgreso() {
    if (!nodo.progressBar) return;
    const total = CB.state.cursos.length;
    const hechas = CB.state.cursos.filter(c => CB.esRevisada(c.id)).length;
    nodo.progressBar.style.width = total ? `${(hechas / total) * 100}%` : '0%';
    nodo.progressNum.textContent = `${hechas} de ${total}`;
  }

  /* ─────────── 9. Vistas y navegación (sin recargas) ─────────── */
  function animar(n) { if (!n) return; n.classList.remove('cb-anim'); void n.offsetWidth; n.classList.add('cb-anim'); }

  function irArribaModulo() {
    const y = nodo.modulo.getBoundingClientRect().top + window.scrollY - 14;
    window.scrollTo({ top: Math.max(0, y), behavior: movimientoReducido() ? 'auto' : 'smooth' });
  }

  function mostrarCatalogo() {
    const vengoDeLectura = CB.state.vista === 'lector';
    const primeraVez = CB.state.vista === null;
    CB.state.vista = 'catalogo';

    if (primeraVez || vengoDeLectura || CB.state.catalogoSucio) {
      renderCatalogo();
      CB.state.catalogoSucio = false;
    }
    nodo.reader.hidden = true;
    nodo.catalog.hidden = false;
    if (primeraVez || vengoDeLectura) animar(nodo.catalog);

    if (vengoDeLectura) {
      window.scrollTo({ top: CB.state.scrollCatalogo || 0, behavior: 'auto' });
      if (CB.state.ultimoId) {
        const btn = nodo.grid.querySelector(`[data-id="${cssEsc(CB.state.ultimoId)}"]`);
        if (btn) btn.focus({ preventScroll: true });
      }
    }
  }

  function abrirCursoVista(id) {
    if (!CB.Lector) return;
    const curso = CB.state.cursos.find(c => c.id === id);
    if (CB.state.vista !== 'lector') CB.state.scrollCatalogo = window.scrollY;
    CB.state.vista = 'lector';
    CB.state.ultimoId = id;
    nodo.catalog.hidden = true;
    nodo.reader.hidden = false;

    if (curso) CB.Lector.render(curso);
    else CB.Lector.mostrarError(
      'Capacitación no encontrada',
      `No existe ninguna capacitación con el identificador «${id}». Puede que el enlace haya cambiado o que el contenido aún no esté publicado.`
    );

    animar(nodo.reader);
    irArribaModulo();
  }

  CB.abrirCurso = id => { location.hash = '#/curso/' + encodeURIComponent(id); };
  CB.irAlCatalogo = () => {
    if (location.hash && location.hash !== '#/') location.hash = '#/';
    else mostrarCatalogo();
  };

  function rutaActual() {
    const m = (location.hash || '').match(/^#\/curso\/(.+)$/);
    return m ? { vista: 'curso', id: decodeURIComponent(m[1]) } : { vista: 'catalogo' };
  }
  function navegar() {
    if (!CB.state.cargado) return;
    const r = rutaActual();
    if (r.vista === 'curso') abrirCursoVista(r.id);
    else mostrarCatalogo();
  }
  window.addEventListener('hashchange', navegar);

  /* ─────────── 10. Carga y validación del catálogo JSON ─────────── */
  function validarCurso(c, i, ids) {
    if (!c || typeof c !== 'object') return null;
    const faltan = ['id', 'programa', 'nivel', 'titulo'].filter(k => !c[k] || typeof c[k] !== 'string');
    if (faltan.length) {
      console.warn(`[3CB Cursos] Se descartó la capacitación #${i + 1} del JSON: faltan o son inválidos los campos ${faltan.join(', ')}.`);
      return null;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(c.id)) {
      console.warn(`[3CB Cursos] Identificador inválido: «${c.id}». Usa solo letras, números y guiones.`);
      return null;
    }
    if (ids.has(c.id)) {
      console.warn(`[3CB Cursos] Identificador duplicado: «${c.id}». Se omite la repetición.`);
      return null;
    }
    ids.add(c.id);
    const curso = Object.assign({
      descripcion: '', duracion: '10 minutos', objetivo: '', introduccion: '',
      secciones: [], ejemplo: '', actividad: '', conceptoClave: '',
      recomendacion: '', referencias: []
    }, c);
    curso.secciones = Array.isArray(curso.secciones)
      ? curso.secciones.filter(s => s && s.titulo && s.contenido)
      : [];
    return curso;
  }

  async function cargarDatos() {
    nodo.errorCarga.hidden = true;
    nodo.empty.hidden = true;
    nodo.grid.hidden = false;
    nodo.grid.innerHTML = '<div class="cb-courses-skeleton"></div><div class="cb-courses-skeleton"></div><div class="cb-courses-skeleton"></div>';

    try {
      const res = await fetch(CB.config.dataUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('Respuesta HTTP ' + res.status);
      const datos = await res.json();
      const lista = Array.isArray(datos) ? datos : (datos && Array.isArray(datos.cursos) ? datos.cursos : null);
      if (!lista) throw new Error('El catálogo no tiene el formato esperado (arreglo de cursos).');

      const ids = new Set();
      CB.state.cursos = lista.map((c, i) => validarCurso(c, i, ids)).filter(Boolean);
      CB.state.cargado = true;
      nodo.total.textContent = CB.state.cursos.length;
      renderFiltros();
      navegar();
    } catch (err) {
      console.error('[3CB Cursos] No fue posible cargar el catálogo:', err);
      nodo.grid.innerHTML = '';
      nodo.count.textContent = '';
      nodo.errorCarga.hidden = false;
    }
  }

  /* ─────────── 11. Inicialización ─────────── */
  function init() {
    nodo = {
      modulo: $('#cursos-3cb'),
      catalog: $('#cb-courses-catalog'),
      reader: $('#cb-courses-reader'),
      grid: $('#cb-courses-grid'),
      empty: $('#cb-courses-empty'),
      errorCarga: $('#cb-courses-load-error'),
      count: $('#cb-courses-count'),
      total: $('#cb-courses-total'),
      fPrograma: $('#cb-courses-f-programa'),
      fNivel: $('#cb-courses-f-nivel'),
      progressBar: $('#cb-courses-progressbar'),
      progressNum: $('#cb-courses-progressnum')
    };
    if (!nodo.modulo || !nodo.catalog) return; // el módulo no está en esta página

    CB.aplicarMascotas(nodo.modulo);

    nodo.fPrograma.addEventListener('click', e => {
      const b = e.target.closest('.cb-courses-chip');
      if (b) aplicarFiltro('programa', b.dataset.cbValor);
    });
    nodo.fNivel.addEventListener('click', e => {
      const b = e.target.closest('.cb-courses-chip');
      if (b) aplicarFiltro('nivel', b.dataset.cbValor);
    });
    nodo.grid.addEventListener('click', e => {
      const b = e.target.closest('[data-id]');
      if (b) CB.abrirCurso(b.dataset.id);
    });

    const limpiar = nodo.empty.querySelector('[data-cb-limpiar]');
    if (limpiar) limpiar.addEventListener('click', () => {
      CB.state.filtros = { programa: 'Todos', nivel: 'Todos' };
      storage.guardar(CB.config.almacenamiento.filtros, CB.state.filtros);
      renderFiltros();
      renderCatalogo();
    });

    const reintentar = nodo.errorCarga.querySelector('[data-cb-reintentar]');
    if (reintentar) reintentar.addEventListener('click', cargarDatos);

    cargarDatos();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();