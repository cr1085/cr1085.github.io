/* =========================================================
   Guía Interactiva de Minería de Datos - app.js
   ========================================================= */

/* ---------- Estado global ---------- */
const STORAGE_KEY = 'dm_guide_state_v1';
const DEFAULT_STATE = {
  mode: null,
  currentStep: 'problem',
  problem: { name: '', desc: '', taskType: '', target: '' },
  data: { fileName: null, headers: [], rows: [], numericCols: [], categoricalCols: [] },
  preprocess: { nulls: 'none', outliers: 'none', scaling: 'none', encoding: 'none' },
  model: { algo: '', testSize: 0.2, randomState: 42 },
  eval: {},
  completed: {}
};
let state = loadState();
let parsedData = null;      // datos crudos cargados
let chartInstances = {};    // para destruir gráficos al redibujar

/* ---------- Persistencia ---------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATE), ...parsed };
  } catch (e) {
    console.warn('Estado corrupto, reiniciando.', e);
    return structuredClone(DEFAULT_STATE);
  }
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('No se pudo guardar estado', e); }
}

/* ---------- Utilidades ---------- */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }
function showError(msg) {
  $('#errorMessage').textContent = msg;
  $('#errorModal').classList.remove('hidden');
}
function showStatus(msg, type = 'info') {
  const el = $('#dataStatus');
  el.className = `status ${type}`;
  el.textContent = msg;
  el.classList.remove('hidden');
}
function isNumeric(v) {
  if (v === null || v === undefined || v === '') return false;
  return !isNaN(parseFloat(v)) && isFinite(v);
}
function toNumber(v) { return parseFloat(v); }
function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function std(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
}
function quantile(arr, q) {
  const s = [...arr].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  if (lo === hi) return s[lo];
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}
function mode(arr) {
  const freq = {};
  arr.forEach(v => freq[v] = (freq[v] || 0) + 1);
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------- Navegación ---------- */
const STEPS = ['problem', 'data', 'preprocess', 'model', 'eval', 'report'];
function goToStep(step) {
  if (!STEPS.includes(step)) return;
  state.currentStep = step;
  $$('.panel').forEach(p => p.classList.remove('active'));
  $(`#step-${step}`).classList.add('active');
  $$('.step').forEach(s => s.classList.toggle('active', s.dataset.step === step));
  // marcar completadas
  STEPS.forEach((s, i) => {
    const idx = STEPS.indexOf(step);
    const btn = $(`.step[data-step="${s}"]`);
    btn.classList.toggle('completed', i < idx);
  });
  updateProgress();
  saveState();
  // refrescar contenido específico
  if (step === 'preprocess') refreshPreprocess();
  if (step === 'model') refreshModel();
  if (step === 'eval') refreshEval();
  if (step === 'report') refreshReport();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // cerrar sidebar en móvil
  $('#sidebar').classList.remove('open');
}
function updateProgress() {
  const idx = STEPS.indexOf(state.currentStep);
  const pct = Math.round(((idx + 1) / STEPS.length) * 100);
  $('#progressFill').style.width = pct + '%';
  $('#progressText').textContent = pct + '%';
}

/* ---------- Modo ---------- */
function setMode(mode) {
  state.mode = mode;
  $('#modeBadge').textContent = `Modo: ${mode === 'novato' ? '🌱 Novato' : '⚡ Experto'}`;
  document.body.dataset.mode = mode;
  $('#modeModal').classList.add('hidden');
  saveState();
}

/* ---------- Glosario ---------- */
const GLOSSARY = {
  'Minería de datos': 'Proceso de descubrir patrones y conocimientos a partir de grandes conjuntos de datos.',
  'Clasificación': 'Tarea supervisada donde se predice una categoría/clase discreta.',
  'Regresión': 'Tarea supervisada donde se predice un valor numérico continuo.',
  'Clustering': 'Tarea no supervisada de agrupar datos en clusters según similitud.',
  'Outlier': 'Observación que se aleja significativamente del resto de los datos.',
  'IQR': 'Rango intercuartílico: Q3 - Q1. Usado para detectar outliers.',
  'One-Hot Encoding': 'Convierte categorías en columnas binarias (0/1).',
  'Label Encoding': 'Asigna un número entero único a cada categoría.',
  'StandardScaler': 'Escala datos restando la media y dividiendo por la desviación estándar.',
  'MinMaxScaler': 'Escala datos al rango [0, 1].',
  'RobustScaler': 'Escala usando mediana e IQR; resistente a outliers.',
  'Overfitting': 'Cuando el modelo memoriza los datos de entrenamiento y no generaliza.',
  'Train/Test split': 'División de los datos en conjuntos de entrenamiento y prueba.',
  'Random state': 'Semilla para reproducibilidad de resultados aleatorios.',
  'Matriz de correlación': 'Tabla que muestra correlaciones entre pares de variables numéricas.',
  'Valor nulo': 'Dato faltante (NaN, None, vacío).',
  'Winsorizar': 'Limitar valores extremos a percentiles específicos (ej. 5% y 95%).',
  'Accuracy': 'Proporción de predicciones correctas sobre el total.',
  'Precision': 'De los predichos positivos, cuántos realmente lo son.',
  'Recall': 'De los positivos reales, cuántos fueron detectados.',
  'F1-Score': 'Media armónica de Precision y Recall.',
  'RMSE': 'Raíz del error cuadrático medio; métrica de regresión en las mismas unidades que la variable.',
  'MAE': 'Error absoluto medio; promedio de errores en valor absoluto.',
  'R²': 'Coeficiente de determinación; qué tan bien el modelo explica la varianza.',
  'Silhouette': 'Métrica de clustering; mide qué tan similar es un objeto a su cluster vs. otros.',
  'Sklearn': 'Biblioteca de Python para machine learning (scikit-learn).'
};
function renderGlossary() {
  const dl = Object.entries(GLOSSARY)
    .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`)
    .join('');
  $('#glossaryContent').innerHTML = `<dl>${dl}</dl>`;
}

/* ---------- ETAPA 1: Problema ---------- */
function initProblem() {
  const p = state.problem;
  $('#projName').value = p.name || '';
  $('#projDesc').value = p.desc || '';
  $('#targetVar').value = p.target || '';
  if (p.taskType) {
    const r = $(`input[name="taskType"][value="${p.taskType}"]`);
    if (r) r.checked = true;
  }
  ['projName', 'projDesc', 'targetVar'].forEach(id => {
    $(`#${id}`).addEventListener('input', e => {
      state.problem[id === 'projName' ? 'name' : id === 'projDesc' ? 'desc' : 'target'] = e.target.value;
      saveState();
    });
  });
  $$('input[name="taskType"]').forEach(r => {
    r.addEventListener('change', e => {
      state.problem.taskType = e.target.value;
      saveState();
    });
  });
}

/* ---------- ETAPA 2: Datos ---------- */
function initUpload() {
  const input = $('#csvFile');
  const area = $('#uploadArea');
  input.addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) handleFile(f);
  });
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag'));
  area.addEventListener('drop', e => {
    e.preventDefault(); area.classList.remove('drag');
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  });
  $('#loadSampleBtn').addEventListener('click', loadSampleDataset);
}

function handleFile(file) {
  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
    showError('El archivo debe ser un CSV (.csv).');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError('El archivo es demasiado grande (>10MB). Usa uno más pequeño.');
    return;
  }
  showStatus('Procesando archivo...', 'info');
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const result = Papa.parse(e.target.result, {
        header: true, skipEmptyLines: true, dynamicTyping: false
      });
      if (result.errors && result.errors.length) {
        console.warn('Errores de parseo:', result.errors);
      }
      if (!result.data || result.data.length === 0) {
        showError('El CSV está vacío o no tiene filas válidas.');
        return;
      }
      if (!result.meta || !result.meta.fields || result.meta.fields.length === 0) {
        showError('No se pudieron detectar columnas en el CSV.');
        return;
      }
      parsedData = {
        headers: result.meta.fields,
        rows: result.data
      };
      state.data.fileName = file.name;
      state.data.headers = parsedData.headers;
      state.data.rows = parsedData.rows;
      classifyColumns();
      saveState();
      renderDataExplorer();
      showStatus(`✅ CSV cargado: ${parsedData.rows.length} filas × ${parsedData.headers.length} columnas.`, 'success');
    } catch (err) {
      console.error(err);
      showError('Error al procesar el CSV: ' + err.message);
    }
  };
  reader.onerror = () => showError('No se pudo leer el archivo.');
  reader.readAsText(file);
}

function loadSampleDataset() {
  // Dataset sintético: iris simplificado
  const csv = `sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
4.7,3.2,1.3,0.2,setosa
7.0,3.2,4.7,1.4,versicolor
6.4,3.2,4.5,1.5,versicolor
6.9,3.1,4.9,1.5,versicolor
6.3,3.3,6.0,2.5,virginica
5.8,2.7,5.1,1.9,virginica
7.1,3.0,5.9,2.1,virginica
5.0,3.4,1.5,0.2,setosa
6.5,3.0,5.2,2.0,virginica
6.7,3.1,4.4,1.4,versicolor
4.4,2.9,1.4,0.2,setosa
7.2,3.6,1.7,0.3,setosa
4.9,2.5,4.5,1.7,virginica`;
  const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
  parsedData = { headers: result.meta.fields, rows: result.data };
  state.data.fileName = 'iris_sample.csv';
  state.data.headers = parsedData.headers;
  state.data.rows = parsedData.rows;
  classifyColumns();
  saveState();
  renderDataExplorer();
  showStatus(`✅ Dataset de ejemplo cargado: ${parsedData.rows.length} filas × ${parsedData.headers.length} columnas.`, 'success');
}

function classifyColumns() {
  const num = [], cat = [];
  parsedData.headers.forEach(h => {
    const vals = parsedData.rows.map(r => r[h]).filter(v => v !== '' && v != null);
    const numCount = vals.filter(isNumeric).length;
    if (vals.length > 0 && numCount / vals.length > 0.8) num.push(h);
    else cat.push(h);
  });
  state.data.numericCols = num;
  state.data.categoricalCols = cat;
}

function renderDataExplorer() {
  if (!parsedData) return;
  $('#dataExplorer').classList.remove('hidden');

  // Preview
  const preview = parsedData.rows.slice(0, 10);
  $('#previewTable').innerHTML = buildTable(parsedData.headers, preview);

  // Stats
  const stats = computeStats();
  $('#statsTable').innerHTML = buildStatsTable(stats);

  // Nulos
  const nulls = computeNulls();
  $('#nullsTable').innerHTML = buildTable(
    ['Columna', 'Nulos', '% Nulos'],
    parsedData.headers.map(h => ({
      Columna: h,
      Nulos: nulls[h],
      '% Nulos': (nulls[h] / parsedData.rows.length * 100).toFixed(2)
    }))
  );

  // Outliers
  const outliers = computeOutliers();
  $('#outliersTable').innerHTML = buildTable(
    ['Columna', 'Q1', 'Q3', 'IQR', 'Outliers'],
    state.data.numericCols.map(h => ({
      Columna: h,
      Q1: outliers[h].q1.toFixed(3),
      Q3: outliers[h].q3.toFixed(3),
      IQR: outliers[h].iqr.toFixed(3),
      Outliers: outliers[h].count
    }))
  );

  // Histograma
  const sel = $('#histCol');
  sel.innerHTML = state.data.numericCols.map(c => `<option value="${c}">${c}</option>`).join('');
  if (state.data.numericCols.length > 0) {
    sel.value = state.data.numericCols[0];
    drawHistogram(state.data.numericCols[0]);
  } else {
    sel.innerHTML = '<option>Sin columnas numéricas</option>';
  }
  sel.onchange = e => drawHistogram(e.target.value);

  // Correlación
  renderCorrelation();
}

function computeStats() {
  const stats = {};
  state.data.numericCols.forEach(h => {
    const vals = parsedData.rows.map(r => r[h]).filter(isNumeric).map(toNumber);
    if (vals.length === 0) return;
    stats[h] = {
      count: vals.length,
      mean: mean(vals),
      std: std(vals),
      min: Math.min(...vals),
      q1: quantile(vals, 0.25),
      median: median(vals),
      q3: quantile(vals, 0.75),
      max: Math.max(...vals)
    };
  });
  return stats;
}

function computeNulls() {
  const n = {};
  parsedData.headers.forEach(h => {
    n[h] = parsedData.rows.filter(r => r[h] === '' || r[h] == null || r[h] === undefined || r[h] === 'NA' || r[h] === 'NaN').length;
  });
  return n;
}

function computeOutliers() {
  const out = {};
  state.data.numericCols.forEach(h => {
    const vals = parsedData.rows.map(r => r[h]).filter(isNumeric).map(toNumber);
    if (vals.length === 0) return;
    const q1 = quantile(vals, 0.25), q3 = quantile(vals, 0.75);
    const iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr;
    out[h] = { q1, q3, iqr, count: vals.filter(v => v < lo || v > hi).length };
  });
  return out;
}

function buildTable(headers, rows) {
  const th = headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
  const tr = rows.map(r =>
    '<tr>' + headers.map(h => `<td>${escapeHtml(r[h] ?? '')}</td>`).join('') + '</tr>'
  ).join('');
  return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

function buildStatsTable(stats) {
  const cols = Object.keys(stats);
  if (cols.length === 0) return '<p class="hint">No hay columnas numéricas.</p>';
  const metrics = ['count', 'mean', 'std', 'min', 'q1', 'median', 'q3', 'max'];
  const labels = { count: 'count', mean: 'mean', std: 'std', min: 'min', q1: '25%', median: '50%', q3: '75%', max: 'max' };
  let html = '<table><thead><tr><th>Métrica</th>';
  cols.forEach(c => html += `<th>${escapeHtml(c)}</th>`);
  html += '</tr></thead><tbody>';
  metrics.forEach(m => {
    html += `<tr><td><strong>${labels[m]}</strong></td>`;
    cols.forEach(c => {
      const v = stats[c][m];
      html += `<td>${typeof v === 'number' ? v.toFixed(3) : v}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function drawHistogram(col) {
  if (!col) return;
  const vals = parsedData.rows.map(r => r[col]).filter(isNumeric).map(toNumber);
  if (vals.length === 0) return;
  const bins = 10;
  const min = Math.min(...vals), max = Math.max(...vals);
  const step = (max - min) / bins || 1;
  const counts = Array(bins).fill(0);
  vals.forEach(v => {
    let idx = Math.floor((v - min) / step);
    if (idx >= bins) idx = bins - 1;
    counts[idx]++;
  });
  const labels = counts.map((_, i) => {
    const lo = (min + i * step).toFixed(2);
    const hi = (min + (i + 1) * step).toFixed(2);
    return `${lo}-${hi}`;
  });
  if (chartInstances.hist) chartInstances.hist.destroy();
  chartInstances.hist = new Chart($('#histChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: col,
        data: counts,
        backgroundColor: 'rgba(30, 58, 95, 0.7)',
        borderColor: 'rgba(30, 58, 95, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Frecuencia' } } }
    }
  });
}

function renderCorrelation() {
  const cols = state.data.numericCols;
  if (cols.length < 2) {
    $('#corrTable').innerHTML = '<p class="hint">Se necesitan al menos 2 columnas numéricas.</p>';
    return;
  }
  // construir arrays
  const arrs = {};
  cols.forEach(c => {
    arrs[c] = parsedData.rows.map(r => r[c]).filter(isNumeric).map(toNumber);
  });
  const n = Math.min(...cols.map(c => arrs[c].length));
  const trimmed = {};
  cols.forEach(c => trimmed[c] = arrs[c].slice(0, n));
  const corr = (a, b) => {
    const ma = mean(a), mb = mean(b);
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < n; i++) {
      num += (a[i] - ma) * (b[i] - mb);
      da += (a[i] - ma) ** 2;
      db += (b[i] - mb) ** 2;
    }
    const den = Math.sqrt(da * db);
    return den === 0 ? 0 : num / den;
  };
  let html = '<table><thead><tr><th></th>';
  cols.forEach(c => html += `<th>${escapeHtml(c)}</th>`);
  html += '</tr></thead><tbody>';
  cols.forEach(c1 => {
    html += `<tr><th>${escapeHtml(c1)}</th>`;
    cols.forEach(c2 => {
      const r = corr(trimmed[c1], trimmed[c2]);
      const color = r > 0 ? `rgba(30, 58, 95, ${Math.abs(r)})` : `rgba(229, 62, 62, ${Math.abs(r)})`;
      html += `<td style="background:${color};color:${Math.abs(r) > 0.5 ? 'white' : 'inherit'}">${r.toFixed(2)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  $('#corrTable').innerHTML = html;
}

/* ---------- ETAPA 3: Preprocesamiento ---------- */
function initPreprocess() {
  ['nullStrategy', 'outlierStrategy', 'scaling', 'encoding'].forEach(name => {
    $$(`input[name="${name}"]`).forEach(r => {
      r.addEventListener('change', e => {
        const key = { nullStrategy: 'nulls', outlierStrategy: 'outliers', scaling: 'scaling', encoding: 'encoding' }[name];
        state.preprocess[key] = e.target.value;
        saveState();
        refreshPreprocess();
      });
    });
  });
  $('#copyPreprocessCode').addEventListener('click', () => copyCode('preprocessCode'));
}
function refreshPreprocess() {
  // restaurar radios
  const map = { nullStrategy: 'nulls', outlierStrategy: 'outliers', scaling: 'scaling', encoding: 'encoding' };
  Object.entries(map).forEach(([name, key]) => {
    const r = $(`input[name="${name}"][value="${state.preprocess[key]}"]`);
    if (r) r.checked = true;
  });
  $('#noDataWarning').classList.toggle('hidden', !!parsedData);
  $('#preprocessCode').textContent = generatePreprocessCode();
}

function generatePreprocessCode() {
  const lines = ['import pandas as pd', 'import numpy as np', 'from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, OneHotEncoder, LabelEncoder', ''];
  lines.push('# Cargar datos');
  lines.push(`df = pd.read_csv("${state.data.fileName || 'datos.csv'}")`);
  lines.push(`print("Filas x Columnas:", df.shape)`);
  lines.push('');

  // Nulos
  const p = state.preprocess;
  if (p.nulls === 'drop') {
    lines.push('# Eliminar filas con nulos');
    lines.push('df = df.dropna()');
  } else if (p.nulls === 'mean') {
    lines.push('# Imputar nulos numéricos con la media');
    lines.push('num_cols = df.select_dtypes(include=[np.number]).columns');
    lines.push('for c in num_cols:');
    lines.push('    df[c] = df[c].fillna(df[c].mean())');
  } else if (p.nulls === 'median') {
    lines.push('# Imputar nulos numéricos con la mediana');
    lines.push('num_cols = df.select_dtypes(include=[np.number]).columns');
    lines.push('for c in num_cols:');
    lines.push('    df[c] = df[c].fillna(df[c].median())');
  } else if (p.nulls === 'mode') {
    lines.push('# Imputar nulos con la moda');
    lines.push('for c in df.columns:');
    lines.push('    df[c] = df[c].fillna(df[c].mode()[0])');
  }
  lines.push('');

  // Outliers
  if (p.outliers === 'drop') {
    lines.push('# Eliminar outliers (método IQR)');
    lines.push('num_cols = df.select_dtypes(include=[np.number]).columns');
    lines.push('for c in num_cols:');
    lines.push('    Q1 = df[c].quantile(0.25)');
    lines.push('    Q3 = df[c].quantile(0.75)');
    lines.push('    IQR = Q3 - Q1');
    lines.push('    df = df[(df[c] >= Q1 - 1.5*IQR) & (df[c] <= Q3 + 1.5*IQR)]');
  } else if (p.outliers === 'winsorize') {
    lines.push('# Winsorizar outliers (percentiles 5% y 95%)');
    lines.push('num_cols = df.select_dtypes(include=[np.number]).columns');
    lines.push('for c in num_cols:');
    lines.push('    lo = df[c].quantile(0.05)');
    lines.push('    hi = df[c].quantile(0.95)');
    lines.push('    df[c] = df[c].clip(lo, hi)');
  }
  lines.push('');

  // Escalado
  if (p.scaling !== 'none') {
    const cls = { standard: 'StandardScaler', minmax: 'MinMaxScaler', robust: 'RobustScaler' }[p.scaling];
    lines.push(`# Escalado con ${cls}`);
    lines.push(`scaler = ${cls}()`);
    lines.push('num_cols = df.select_dtypes(include=[np.number]).columns');
    lines.push('df[num_cols] = scaler.fit_transform(df[num_cols])');
    lines.push('');
  }

  // Codificación
  if (p.encoding === 'onehot') {
    lines.push('# One-Hot Encoding');
    lines.push('cat_cols = df.select_dtypes(include=[object, category]).columns');
    lines.push('df = pd.get_dummies(df, columns=cat_cols, drop_first=True)');
  } else if (p.encoding === 'label') {
    lines.push('# Label Encoding');
    lines.push('le = LabelEncoder()');
    lines.push('cat_cols = df.select_dtypes(include=[object, category]).columns');
    lines.push('for c in cat_cols:');
    lines.push('    df[c] = le.fit_transform(df[c].astype(str))');
  }
  lines.push('');
  lines.push('print("Después de preprocesar:", df.shape)');
  lines.push('print(df.head())');
  return lines.join('\n');
}

/* ---------- ETAPA 4: Modelado ---------- */
const ALGOS = {
  clasificacion: [
    { id: 'logreg', name: 'Regresión Logística', cls: 'LogisticRegression', mod: 'linear_model' },
    { id: 'dt', name: 'Árbol de Decisión', cls: 'DecisionTreeClassifier', mod: 'tree' },
    { id: 'rf', name: 'Random Forest', cls: 'RandomForestClassifier', mod: 'ensemble' },
    { id: 'svm', name: 'SVM', cls: 'SVC', mod: 'svm' },
    { id: 'knn', name: 'K-Nearest Neighbors', cls: 'KNeighborsClassifier', mod: 'neighbors' }
  ],
  regresion: [
    { id: 'linreg', name: 'Regresión Lineal', cls: 'LinearRegression', mod: 'linear_model' },
    { id: 'ridge', name: 'Ridge', cls: 'Ridge', mod: 'linear_model' },
    { id: 'dt', name: 'Árbol de Decisión', cls: 'DecisionTreeRegressor', mod: 'tree' },
    { id: 'rf', name: 'Random Forest', cls: 'RandomForestRegressor', mod: 'ensemble' },
    { id: 'svr', name: 'SVR', cls: 'SVR', mod: 'svm' }
  ],
  clustering: [
    { id: 'kmeans', name: 'K-Means', cls: 'KMeans', mod: 'cluster' },
    { id: 'dbscan', name: 'DBSCAN', cls: 'DBSCAN', mod: 'cluster' },
    { id: 'agglo', name: 'Clustering Aglomerativo', cls: 'AgglomerativeClustering', mod: 'cluster' }
  ],
  otro: [
    { id: 'pca', name: 'PCA', cls: 'PCA', mod: 'decomposition' }
  ]
};
const RECOMMENDATIONS = {
  clasificacion: '💡 Para <b>clasificación</b> se suele empezar con <b>Regresión Logística</b> (baseline) y luego probar <b>Random Forest</b> por su robustez.',
  regresion: '💡 Para <b>regresión</b> empieza con <b>Regresión Lineal</b> como baseline y prueba <b>Random Forest Regressor</b> para capturar no-linealidades.',
  clustering: '💡 Para <b>clustering</b>, <b>K-Means</b> es el punto de partida clásico. Si no conoces el número de clusters, prueba <b>DBSCAN</b>.',
  otro: '💡 Tarea personalizada: elige el algoritmo que mejor se ajuste a tu objetivo.'
};

function initModel() {
  $('#testSize').addEventListener('input', e => {
    state.model.testSize = parseFloat(e.target.value);
    $('#testSizeLabel').textContent = state.model.testSize.toFixed(2);
    saveState();
    refreshModel();
  });
  $('#randomState').addEventListener('input', e => {
    state.model.randomState = parseInt(e.target.value) || 0;
    saveState();
    refreshModel();
  });
  $('#copyModelCode').addEventListener('click', () => copyCode('modelCode'));
}

function refreshModel() {
  const task = state.problem.taskType || 'clasificacion';
  $('#recommendation').innerHTML = RECOMMENDATIONS[task] || RECOMMENDATIONS.otro;
  const algos = ALGOS[task] || ALGOS.otro;
  const group = $('#algoGroup');
  group.innerHTML = algos.map(a =>
    `<label><input type="radio" name="algo" value="${a.id}" ${state.model.algo === a.id ? 'checked' : ''} /> ${a.name}</label>`
  ).join('');
  if (!state.model.algo || !algos.find(a => a.id === state.model.algo)) {
    state.model.algo = algos[0].id;
  }
  $$('#algoGroup input').forEach(r => {
    r.addEventListener('change', e => {
      state.model.algo = e.target.value;
      saveState();
      refreshModel();
    });
  });
  $('#testSize').value = state.model.testSize;
  $('#testSizeLabel').textContent = state.model.testSize.toFixed(2);
  $('#randomState').value = state.model.randomState;
  $('#modelCode').textContent = generateModelCode();
}

function generateModelCode() {
  const task = state.problem.taskType || 'clasificacion';
  const algos = ALGOS[task] || ALGOS.otro;
  const algo = algos.find(a => a.id === state.model.algo) || algos[0];
  const target = state.problem.target || 'target';
  const lines = [
    'import pandas as pd',
    'import numpy as np',
    'from sklearn.model_selection import train_test_split',
    `from sklearn.${algo.mod} import ${algo.cls}`,
    ''
  ];
  if (task === 'clustering') {
    lines.push('# Separar features (sin variable objetivo en clustering)');
    lines.push('X = df.drop(columns=[col_for_id_if_any])  # ajusta según tu caso');
    lines.push('');
    lines.push(`# Modelo: ${algo.name}`);
    const params = algo.id === 'kmeans' ? `n_clusters=3, random_state=${state.model.randomState}, n_init=10`
      : algo.id === 'dbscan' ? 'eps=0.5, min_samples=5'
      : `n_clusters=3`;
    lines.push(`model = ${algo.cls}(${params})`);
    lines.push('labels = model.fit_predict(X)');
    lines.push("df['cluster'] = labels");
    lines.push('print(df[\"cluster\"].value_counts())');
  } else {
    lines.push('# Definir X e y');
    lines.push(`y = df['${target}']`);
    lines.push(`X = df.drop(columns=['${target}'])`);
    lines.push('');
    lines.push('# Train/test split');
    lines.push(`X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=${state.model.testSize}, random_state=${state.model.randomState}${task === 'clasificacion' ? ', stratify=y' : ''})`);
    lines.push('');
    lines.push(`# Modelo: ${algo.name}`);
    const params = ['logreg', 'dt', 'rf', 'svm', 'knn', 'ridge', 'svr'].includes(algo.id)
      ? `random_state=${state.model.randomState}` : '';
    lines.push(`model = ${algo.cls}(${params})`);
    lines.push('model.fit(X_train, y_train)');
    lines.push('y_pred = model.predict(X_test)');
    lines.push('');
    lines.push('print("Predicciones (primeras 10):", y_pred[:10])');
  }
  return lines.join('\n');
}

/* ---------- ETAPA 5: Evaluación ---------- */
const METRICS = {
  clasificacion: [
    { name: 'Accuracy', code: 'accuracy_score', desc: 'Proporción de aciertos globales.', formula: '(VP + VN) / Total' },
    { name: 'Precision', code: 'precision_score', desc: 'De los predichos positivos, cuántos lo son realmente.', formula: 'VP / (VP + FP)' },
    { name: 'Recall', code: 'recall_score', desc: 'De los positivos reales, cuántos se detectaron.', formula: 'VP / (VP + FN)' },
    { name: 'F1-Score', code: 'f1_score', desc: 'Media armónica entre Precision y Recall.', formula: '2·(P·R)/(P+R)' },
    { name: 'Matriz de confusión', code: 'confusion_matrix', desc: 'Tabla VP, VN, FP, FN.', formula: '' }
  ],
  regresion: [
    { name: 'MAE', code: 'mean_absolute_error', desc: 'Error absoluto medio.', formula: 'mean(|y - ŷ|)' },
    { name: 'MSE', code: 'mean_squared_error', desc: 'Error cuadrático medio.', formula: 'mean((y - ŷ)²)' },
    { name: 'RMSE', code: 'mean_squared_error(squared=False)', desc: 'Raíz del MSE; en las mismas unidades que y.', formula: '√MSE' },
    { name: 'R²', code: 'r2_score', desc: 'Proporción de varianza explicada (mejor cuanto más cerca de 1).', formula: '1 - (SSres/SStot)' }
  ],
  clustering: [
    { name: 'Silhouette Score', code: 'silhouette_score', desc: 'Mide qué tan similar es cada punto a su cluster vs. otros (-1 a 1).', formula: '(b-a)/max(a,b)' },
    { name: 'Inertia', code: 'model.inertia_', desc: 'Suma de distancias al centroide (solo K-Means).', formula: 'Σ ||x - centroid||²' }
  ],
  otro: [
    { name: 'Métricas personalizadas', code: '—', desc: 'Define métricas según tu objetivo específico.', formula: '' }
  ]
};

function refreshEval() {
  const task = state.problem.taskType || 'clasificacion';
  const metrics = METRICS[task] || METRICS.otro;
  $('#metricsList').innerHTML = metrics.map(m => `
    <div class="metric-card">
      <h4>${m.name} <code>${m.code}</code></h4>
      <p>${m.desc}</p>
      ${m.formula ? `<p><b>Fórmula:</b> ${m.formula}</p>` : ''}
    </div>
  `).join('');
  $('#evalCode').textContent = generateEvalCode();
}

function generateEvalCode() {
  const task = state.problem.taskType || 'clasificacion';
  const lines = [
    'from sklearn import metrics',
    ''
  ];
  if (task === 'clasificacion') {
    lines.push('from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report');
    lines.push('');
    lines.push('print("Accuracy:", accuracy_score(y_test, y_pred))');
    lines.push('print("Precision:", precision_score(y_test, y_pred, average="weighted"))');
    lines.push('print("Recall:", recall_score(y_test, y_pred, average="weighted"))');
    lines.push('print("F1:", f1_score(y_test, y_pred, average="weighted"))');
    lines.push('print("\\nReporte completo:")');
    lines.push('print(classification_report(y_test, y_pred))');
    lines.push('print("\\nMatriz de confusión:")');
    lines.push('print(confusion_matrix(y_test, y_pred))');
  } else if (task === 'regresion') {
    lines.push('from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score');
    lines.push('');
    lines.push('print("MAE:", mean_absolute_error(y_test, y_pred))');
    lines.push('print("MSE:", mean_squared_error(y_test, y_pred))');
    lines.push('print("RMSE:", mean_squared_error(y_test, y_pred, squared=False))');
    lines.push('print("R²:", r2_score(y_test, y_pred))');
  } else if (task === 'clustering') {
    lines.push('from sklearn.metrics import silhouette_score');
    lines.push('');
    lines.push('print("Silhouette:", silhouette_score(X, labels))');
    lines.push('print("Inertia:", model.inertia_)');
  } else {
    lines.push('# Define aquí tus métricas personalizadas');
  }
  return lines.join('\n');
}

/* ---------- ETAPA 6: Reporte ---------- */
function refreshReport() {
  const md = buildMarkdownReport();
  $('#reportContent').textContent = md;
}

function buildMarkdownReport() {
  const task = state.problem.taskType || 'No definido';
  const algos = ALGOS[state.problem.taskType] || ALGOS.otro;
  const algo = algos.find(a => a.id === state.model.algo) || algos[0];
  const lines = [
    `# Reporte de Minería de Datos`,
    ``,
    `**Proyecto:** ${state.problem.name || '(sin nombre)'}`,
    `**Fecha:** ${new Date().toLocaleDateString()}`,
    ``,
    `## 1. Definición del problema`,
    ``,
    state.problem.desc || '(sin descripción)',
    ``,
    `- **Tipo de tarea:** ${task}`,
    `- **Variable objetivo:** ${state.problem.target || '(no especificada)'}`,
    ``,
    `## 2. Datos`,
    ``,
    `- **Archivo:** ${state.data.fileName || '(no cargado)'}`,
    `- **Filas:** ${state.data.rows ? state.data.rows.length : 0}`,
    `- **Columnas:** ${state.data.headers ? state.data.headers.length : 0}`,
    `- **Numéricas:** ${state.data.numericCols.join(', ') || '—'}`,
    `- **Categóricas:** ${state.data.categoricalCols.join(', ') || '—'}`,
    ``,
    `## 3. Preprocesamiento`,
    ``,
    `- **Nulos:** ${state.preprocess.nulls}`,
    `- **Outliers:** ${state.preprocess.outliers}`,
    `- **Escalado:** ${state.preprocess.scaling}`,
    `- **Codificación:** ${state.preprocess.encoding}`,
    ``,
    `## 4. Modelado`,
    ``,
    `- **Algoritmo:** ${algo ? algo.name : '(no seleccionado)'}`,
    `- **Test size:** ${state.model.testSize}`,
    `- **Random state:** ${state.model.randomState}`,
    ``,
    `## 5. Evaluación`,
    ``,
    `Métricas sugeridas para ${task}:`,
    '',
    ...(METRICS[state.problem.taskType] || METRICS.otro).map(m => `- **${m.name}** (${m.code}): ${m.desc}`),
    ``,
    `---`,
    `*Generado por la Guía Interactiva de Minería de Datos*`
  ];
  return lines.join('\n');
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildFullPython() {
  const sections = [
    '# =========================================',
    '# Script completo generado',
    '# Guía Interactiva de Minería de Datos',
    '# =========================================',
    '',
    '# --- Preprocesamiento ---',
    generatePreprocessCode(),
    '',
    '# --- Modelado ---',
    generateModelCode(),
    '',
    '# --- Evaluación ---',
    generateEvalCode()
  ];
  return sections.join('\n');
}

/* ---------- Copiar código ---------- */
function copyCode(id) {
  const text = $('#' + id).textContent;
  navigator.clipboard.writeText(text).then(
    () => {
      const btn = $(`#${id}`).parentElement.querySelector('.btn');
      const old = btn.textContent;
      btn.textContent = '✅ Copiado';
      setTimeout(() => btn.textContent = old, 1500);
    },
    () => showError('No se pudo copiar al portapapeles.')
  );
}

/* ---------- Reinicio ---------- */
function resetProgress() {
  if (!confirm('¿Seguro que quieres reiniciar todo el progreso? Esta acción no se puede deshacer.')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(DEFAULT_STATE);
  parsedData = null;
  location.reload();
}

/* ---------- Inicialización ---------- */
function init() {
  // Modo
  if (state.mode) {
    setMode(state.mode);
  }
  $$('#modeModal [data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  $$('.modal-close, [data-close]').forEach(b => b.addEventListener('click', () => {
    $('#' + b.dataset.close).classList.add('hidden');
  }));

  // Glosario
  renderGlossary();
  $('#glossaryBtn').addEventListener('click', () => $('#glossaryModal').classList.remove('hidden'));

  // Navegación
  $$('.step').forEach(s => s.addEventListener('click', () => goToStep(s.dataset.step)));
  $$('[data-next]').forEach(b => b.addEventListener('click', () => {
    // Validaciones
    if (b.dataset.next === 'data' && !state.problem.taskType) {
      showError('Selecciona un tipo de tarea antes de continuar.');
      return;
    }
    goToStep(b.dataset.next);
  }));
  $$('[data-prev]').forEach(b => b.addEventListener('click', () => goToStep(b.dataset.prev)));

  // Topbar
  $('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#switchModeBtn').addEventListener('click', () => $('#modeModal').classList.remove('hidden'));
  $('#resetBtn').addEventListener('click', resetProgress);
  $('#downloadPyBtn').addEventListener('click', () => downloadFile(buildFullPython(), 'minería_datos_script.py', 'text/x-python'));
  $('#downloadPyBtn2').addEventListener('click', () => downloadFile(buildFullPython(), 'minería_datos_script.py', 'text/x-python'));
  $('#downloadMdBtn').addEventListener('click', () => downloadFile(buildMarkdownReport(), 'reporte.md', 'text/markdown'));

  // Etapas
  initProblem();
  initUpload();
  initPreprocess();
  initModel();

  // Restaurar datos si existen
  if (state.data.rows && state.data.rows.length > 0) {
    parsedData = { headers: state.data.headers, rows: state.data.rows };
    classifyColumns();
  }

  // Ir a la etapa guardada
  goToStep(state.currentStep || 'problem');
}

// Manejo de errores globales
window.addEventListener('error', e => {
  console.error('Error global:', e.error);
  showError('Ocurrió un error inesperado: ' + (e.message || 'desconocido') + '. Revisa la consola para más detalles.');
});
window.addEventListener('unhandledrejection', e => {
  console.error('Promise rechazada:', e.reason);
  showError('Ocurrió un error: ' + (e.reason?.message || 'desconocido'));
});

document.addEventListener('DOMContentLoaded', init);