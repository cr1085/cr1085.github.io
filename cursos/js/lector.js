/* ═══════════════════════════════════════════════════════════════════
   3CB · Cursos y Capacitaciones — motor de lectura (lector.js)
   Renderiza la vista individual de cada capacitación a partir de los
   datos del JSON. No necesita cambios para cursos nuevos.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const CB = (window.CBCourses = window.CBCourses || {});
  const $ = (s, r = document) => r.querySelector(s);
  const u = () => CB.utils || {};

  /* Caja de orientación con mascota (espacios pequeños, no distraen) */
  function nota(mascota, clase, etiqueta, icono, html) {
    return `
    <aside class="cb-courses-note cb-courses-note--${clase}">
      <span class="cb-courses-note-mascot" data-cb-mascot-wrap>
        <img data-cb-mascot="${mascota}" alt="" loading="lazy" width="56" height="56">
      </span>
      <div class="cb-courses-note-body">
        <p class="cb-courses-note-label">${icono}${etiqueta}</p>
        <div class="cb-courses-note-text">${html}</div>
      </div>
    </aside>`;
  }

  function render(curso) {
    const cont = $('#cb-courses-reader');
    if (!cont) return;

    const fmt   = u().fmt || (x => x);
    const esc   = u().escaparHtml || (x => x);
    const icono = u().icono || (() => '');
    const prog  = CB.programaDe ? CB.programaDe(curso.programa) : { color: '#0F1B2D', icono: '' };
    const nivelCls = CB.claseNivel ? CB.claseNivel(curso.nivel) : 'neutro';
    const revisada = CB.esRevisada ? CB.esRevisada(curso.id) : false;

    const secciones = (curso.secciones || []).map((s, i) => `
      <section class="cb-courses-section" aria-labelledby="cb-sec-${i}">
        <h3 id="cb-sec-${i}"><span class="cb-courses-secnum" aria-hidden="true">${i + 1}</span>${esc(s.titulo)}</h3>
        <div>${fmt(s.contenido)}</div>
      </section>`).join('');

    const referencias = (Array.isArray(curso.referencias) && curso.referencias.length) ? `
      <section class="cb-courses-refs">
        <h3>${icono('book')}Referencias y recursos</h3>
        <ul>${curso.referencias.map(r => {
          if (typeof r === 'string') return `<li>${esc(r)}</li>`;
          const texto = r.texto || r.url;
          return r.url
            ? `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(texto)}${icono('ext')}</a></li>`
            : `<li>${esc(texto)}</li>`;
        }).join('')}</ul>
      </section>` : '';

    cont.innerHTML = `
    <div class="cb-courses-reader-inner">
      <div class="cb-courses-reader-nav">
        <button type="button" class="cb-courses-back" data-cb-volver>${icono('arrowL')}Volver al catálogo</button>
        <span class="cb-courses-pill cb-courses-pill--ok" id="cb-courses-reader-badge" ${revisada ? '' : 'hidden'}>${icono('check')}Revisada</span>
      </div>

      <header class="cb-courses-reader-head">
        <div class="cb-courses-reader-tags">
          <span class="cb-courses-tag-prog">
            <span class="cb-courses-tag-icon" style="background:${prog.color}" aria-hidden="true">${prog.icono}</span>${esc(curso.programa)}
          </span>
          <span class="cb-courses-pill cb-courses-pill--${nivelCls}">${esc(curso.nivel)}</span>
          <span class="cb-courses-tag-time">${icono('reloj')}${esc(curso.duracion || '10 minutos')}</span>
        </div>
        <h2 class="cb-courses-reader-title" id="cb-courses-reader-title" tabindex="-1">${esc(curso.titulo)}</h2>
        ${curso.descripcion ? `<p class="cb-courses-reader-desc">${esc(curso.descripcion)}</p>` : ''}
      </header>

      <div class="cb-courses-article">
        ${curso.objetivo ? nota('guia', 'guia', 'Objetivo de aprendizaje', icono('target'), fmt(curso.objetivo)) : ''}
        ${curso.introduccion ? `<div class="cb-courses-intro">${fmt(curso.introduccion)}</div>` : ''}
        ${secciones}
        ${curso.ejemplo ? nota('tecnico', 'tecnico', 'Ejemplo práctico', icono('code'), fmt(curso.ejemplo)) : ''}
        ${curso.actividad ? nota('retos', 'reto', 'Actividad de aplicación', icono('flag'), fmt(curso.actividad)) : ''}
        ${curso.conceptoClave ? `
        <section class="cb-courses-clave">
          <p class="cb-courses-clave-label">${icono('key')}Concepto clave</p>
          <div>${fmt(curso.conceptoClave)}</div>
        </section>` : ''}
        ${curso.recomendacion ? nota('retos', 'reto', 'Recomendación final', icono('star'), fmt(curso.recomendacion)) : ''}
        ${referencias}

        <div class="cb-courses-reader-done">
          <div class="cb-courses-reader-done-copy">
            <strong data-cb-done-titulo>${revisada ? '¡Capacitación completada!' : '¿Terminaste esta capacitación?'}</strong>
            <span>Marca la lectura como revisada. El avance se guarda únicamente en este navegador.</span>
          </div>
          <button type="button" class="cb-courses-btn-done${revisada ? ' is-done' : ''}" data-cb-marcar="${esc(curso.id)}" aria-pressed="${revisada}">
            ${icono('check')}<span class="cb-courses-btn-done-text">${revisada ? 'Revisada · quitar marca' : 'Marcar como revisada'}</span>
          </button>
        </div>

        <div class="cb-courses-reader-navbottom">
          <button type="button" class="cb-courses-back" data-cb-volver>${icono('arrowL')}Volver al catálogo</button>
        </div>
      </div>
    </div>`;

    if (CB.aplicarMascotas) CB.aplicarMascotas(cont);
    const titulo = $('#cb-courses-reader-title', cont);
    if (titulo) titulo.focus({ preventScroll: true });
  }

  function mostrarError(tituloCorto, detalle) {
    const cont = $('#cb-courses-reader');
    if (!cont) return;
    const esc = u().escaparHtml || (x => x);
    const icono = u().icono || (() => '');
    cont.innerHTML = `
    <div class="cb-courses-reader-inner">
      <div class="cb-courses-reader-nav">
        <button type="button" class="cb-courses-back" data-cb-volver>${icono('arrowL')}Volver al catálogo</button>
      </div>
      <div class="cb-courses-empty cb-courses-empty--errorbox">
        ${icono('alert')}
        <h2 class="cb-courses-empty-title">${esc(tituloCorto)}</h2>
        <p class="cb-courses-empty-sub">${esc(detalle)}</p>
        <button type="button" class="cb-courses-btn-ghost" data-cb-volver>Ver el catálogo</button>
      </div>
    </div>`;
  }

  function alternarMarca(btn) {
    const id = btn.getAttribute('data-cb-marcar');
    if (!id || !CB.setRevisada) return;
    const ahora = !CB.esRevisada(id);
    CB.setRevisada(id, ahora);

    btn.classList.toggle('is-done', ahora);
    btn.setAttribute('aria-pressed', String(ahora));
    const texto = btn.querySelector('.cb-courses-btn-done-text');
    if (texto) texto.textContent = ahora ? 'Revisada · quitar marca' : 'Marcar como revisada';

    const badge = $('#cb-courses-reader-badge');
    if (badge) badge.hidden = !ahora;

    const tituloCaja = btn.closest('.cb-courses-reader-done');
    const tit = tituloCaja && tituloCaja.querySelector('[data-cb-done-titulo]');
    if (tit) tit.textContent = ahora ? '¡Capacitación completada!' : '¿Terminaste esta capacitación?';
  }

  /* Delegación de eventos del lector */
  document.addEventListener('click', e => {
    if (!document.getElementById('cursos-3cb')) return;
    const volver = e.target.closest('[data-cb-volver]');
    if (volver) { e.preventDefault(); if (CB.irAlCatalogo) CB.irAlCatalogo(); return; }
    const marcar = e.target.closest('[data-cb-marcar]');
    if (marcar) alternarMarca(marcar);
  });

  CB.Lector = { render, mostrarError };
})();