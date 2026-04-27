// ================================================
// exercises.js — Ejercicios interactivos completos
// InfoMática Platform — Múltiples categorías
// ================================================

const Exercises = (function() {

  // ---- CATEGORÍAS DE PREGUNTAS ----
  const CATEGORIES = {
    word: { name: 'Microsoft Word', icon: '📄', color: '#4F8EF7' },
    hardware: { name: 'Hardware', icon: '🖥️', color: '#F59E0B' },
    internet: { name: 'Internet', icon: '🌐', color: '#22C55E' },
    files: { name: 'Archivos', icon: '📁', color: '#EC4899' },
    security: { name: 'Seguridad', icon: '🔒', color: '#EF4444' },
    shortcuts: { name: 'Atajos', icon: '⌨️', color: '#8B5CF6' },
    general: { name: 'General', icon: '🧠', color: '#06B6D4' },
    excel: { name: 'Excel', icon: '📊', color: '#22C55E' },
  };

  // ==========================================
  // BANCO DE QUIZ — 40+ preguntas por categoría
  // ==========================================
  const QUIZ_BANK = [
    // ── WORD ──
    { q: '¿Qué tecla usas para ir a una nueva línea en Word?', options: ['Tab', 'Shift', 'Enter', 'Ctrl'], correct: 2, xp: 15, cat: 'word' },
    { q: '¿Qué extensión tienen los archivos de Word modernos?', options: ['.pdf', '.xlsx', '.docx', '.pptx'], correct: 2, xp: 10, cat: 'word' },
    { q: 'Para hacer el texto más grande en Word, ¿qué cambias?', options: ['El tipo de archivo', 'El margen', 'El tamaño de fuente', 'El color del fondo'], correct: 2, xp: 10, cat: 'word' },
    { q: '¿Cuál de estas NO es una alineación de texto en Word?', options: ['Izquierda', 'Diagonal', 'Centro', 'Derecha'], correct: 1, xp: 20, cat: 'word' },
    { q: '¿Qué herramienta de Word revisa la ortografía automáticamente?', options: ['Autocorrección', 'Gramática', 'Revisión ortográfica', 'Diccionario'], correct: 2, xp: 15, cat: 'word' },
    { q: '¿Qué opción de Word permite insertar imágenes en un documento?', options: ['Insertar → Imagen', 'Archivo → Abrir', 'Ver → Galería', 'Diseño → Fondo'], correct: 0, xp: 15, cat: 'word' },
    { q: 'En Word, ¿qué es un "párrafo"?.', options: ['Una imagen', 'Un bloque de texto terminado con Enter', 'Una hoja completa', 'Un tipo de fuente'], correct: 1, xp: 10, cat: 'word' },
    { q: '¿Qué hace el botón "Buscar y reemplazar" en Word?', options: ['Busca un texto y lo cambia por otro', 'Elimina todo el texto', 'Cambia el idioma', 'Busca en internet'], correct: 0, xp: 15, cat: 'word' },
    { q: '¿Cómo se llama la barra superior con opciones en Word?', options: ['Barra de tareas', 'Cinta de opciones', 'Menú inicio', 'Panel de control'], correct: 1, xp: 15, cat: 'word' },
    { q: '¿Qué formato de fuente pone el texto en cursiva?', options: ['Ctrl+N', 'Ctrl+I', 'Ctrl+U', 'Ctrl+B'], correct: 1, xp: 15, cat: 'word' },

    // ── ATAJOS DE TECLADO ──
    { q: '¿Qué significa "Ctrl + C"?', options: ['Cortar', 'Copiar', 'Cerrar', 'Cambiar'], correct: 1, xp: 15, cat: 'shortcuts' },
    { q: '¿Qué significa "Ctrl + V"?', options: ['Ver documento', 'Verificar', 'Pegar', 'Volver'], correct: 2, xp: 15, cat: 'shortcuts' },
    { q: '¿Qué hace "Ctrl + A" en un editor de texto?', options: ['Agrandar texto', 'Seleccionar todo el texto', 'Abrir nuevo documento', 'Agregar imagen'], correct: 1, xp: 15, cat: 'shortcuts' },
    { q: '¿Qué combinación deshace el último cambio?', options: ['Ctrl+X', 'Ctrl+Z', 'Ctrl+Y', 'Ctrl+D'], correct: 1, xp: 15, cat: 'shortcuts' },
    { q: '¿Qué hace "Ctrl + S"?', options: ['Seleccionar', 'Subrayar', 'Guardar', 'Salir'], correct: 2, xp: 15, cat: 'shortcuts' },
    { q: '¿Qué combinación cierra la ventana actual?', options: ['Ctrl+W', 'Ctrl+C', 'Ctrl+X', 'Ctrl+P'], correct: 0, xp: 15, cat: 'shortcuts' },
    { q: '¿Qué hace "Ctrl + P"?', options: ['Pegar', 'Proteger', 'Imprimir', 'Pausar'], correct: 2, xp: 15, cat: 'shortcuts' },
    { q: '¿Qué hace "Ctrl + F" en la mayoría de aplicaciones?', options: ['Finalizar', 'Fuente', 'Buscar', 'Formato'], correct: 2, xp: 15, cat: 'shortcuts' },

    // ── HARDWARE ──
    { q: '¿Qué componente es el "cerebro" de la computadora?', options: ['Disco duro', 'RAM', 'Procesador (CPU)', 'Fuente de poder'], correct: 2, xp: 15, cat: 'hardware' },
    { q: '¿Qué componente almacena datos de forma permanente?', options: ['RAM', 'Procesador', 'Disco duro / SSD', 'Tarjeta de video'], correct: 2, xp: 15, cat: 'hardware' },
    { q: '¿Qué significa "RAM"?', options: ['Random Access Memory', 'Read Access Memory', 'Rapid Application Mode', 'Remote Access Module'], correct: 0, xp: 20, cat: 'hardware' },
    { q: '¿Cuál es el dispositivo de SALIDA que muestra imágenes?', options: ['Teclado', 'Mouse', 'Monitor', 'Micrófono'], correct: 2, xp: 10, cat: 'hardware' },
    { q: '¿Cuál de estos es un dispositivo de ENTRADA?', options: ['Impresora', 'Altavoces', 'Monitor', 'Teclado'], correct: 3, xp: 10, cat: 'hardware' },
    { q: '¿Qué componente conecta todos los partes internas de la PC?', options: ['Fuente de poder', 'Tarjeta madre (motherboard)', 'Disco duro', 'Ventilador'], correct: 1, xp: 20, cat: 'hardware' },
    { q: '¿Cuántos bytes tiene 1 Kilobyte (KB)?', options: ['100', '512', '1024', '1000'], correct: 2, xp: 20, cat: 'hardware' },
    { q: '¿Cuántos GB tiene aproximadamente 1 Terabyte (TB)?', options: ['100 GB', '500 GB', '1000 GB', '1024 MB'], correct: 2, xp: 15, cat: 'hardware' },

    // ── INTERNET ──
    { q: '¿Qué significa "URL"?', options: ['Universal Resource Locator', 'Uniform Resource Locator', 'Universal Reference Link', 'Unified Resource Library'], correct: 1, xp: 20, cat: 'internet' },
    { q: '¿Qué navegador fue desarrollado por Google?', options: ['Firefox', 'Safari', 'Edge', 'Chrome'], correct: 3, xp: 10, cat: 'internet' },
    { q: '¿Qué protocolo se usa para páginas web seguras?', options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], correct: 2, xp: 15, cat: 'internet' },
    { q: '¿Qué es un "hipervínculo"?', options: ['Un virus', 'Un enlace clickeable a otra página', 'Un tipo de imagen', 'Un programa'], correct: 1, xp: 15, cat: 'internet' },
    { q: '¿Qué significa "www" en una dirección web?', options: ['World Wide Web', 'Web World Wide', 'Wide World Web', 'World Web Wide'], correct: 0, xp: 15, cat: 'internet' },
    { q: '¿Qué es un motor de búsqueda?', options: ['Un programa que instala virus', 'Una herramienta para encontrar información en internet', 'Un tipo de navegador', 'Un servidor de correo'], correct: 1, xp: 15, cat: 'internet' },
    { q: '¿Cuál de estos NO es un motor de búsqueda?', options: ['Google', 'Bing', 'Firefox', 'DuckDuckGo'], correct: 2, xp: 15, cat: 'internet' },

    // ── SEGURIDAD ──
    { q: '¿Qué es un "phishing"?', options: ['Un juego online', 'Un intento de robar datos personales', 'Un antivirus', 'Un tipo de firewall'], correct: 1, xp: 20, cat: 'security' },
    { q: '¿Qué es una contraseña SEGURA?', options: ['123456', 'Tu nombre + año', 'Una mezcla de letras, números y símbolos', 'password'], correct: 2, xp: 15, cat: 'security' },
    { q: '¿Qué programa protege tu PC contra virus?', options: ['Firewall', 'Antivirus', 'Navegador', 'Compresor'], correct: 1, xp: 10, cat: 'security' },
    { q: '¿Qué NO debes hacer con contraseñas?', options: ['Cambia cada mes', 'Compartirlas por chat', 'Usar mayúsculas y minúsculas', 'Usar más de 12 caracteres'], correct: 1, xp: 15, cat: 'security' },
    { q: '¿Qué es un "firewall"?', options: ['Un tipo de virus', 'Un sistema de protección de red', 'Un navegador', 'Un programa de diseño'], correct: 1, xp: 20, cat: 'security' },

    // ── ARCHIVOS Y CARPETAS ──
    { q: '¿Qué extensión tienen los archivos de imagen comunes?', options: ['.exe', '.mp3', '.jpg', '.docx'], correct: 2, xp: 10, cat: 'files' },
    { q: '¿Qué significa "carpeta" en una computadora?', options: ['Un archivo de texto', 'Un contenedor para organizar archivos', 'Un programa', 'Un disco'], correct: 1, xp: 10, cat: 'files' },
    { q: '¿Qué hace la tecla "Delete" sobre un archivo?', options: ['Lo copia', 'Lo envía a la papelera', 'Lo imprime', 'Lo renombra'], correct: 1, xp: 10, cat: 'files' },
    { q: '¿Qué extensión tiene un archivo ejecutable?', options: ['.txt', '.exe', '.jpg', '.pdf'], correct: 1, xp: 15, cat: 'files' },
    { q: '¿Qué extensión tiene un archivo de video?', options: ['.mp4', '.docx', '.xlsx', '.png'], correct: 0, xp: 10, cat: 'files' },

    // ── GENERAL / INFORMÁTICA ──
    { q: '¿Qué significa "CPU"?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], correct: 0, xp: 20, cat: 'general' },
    { q: '¿Qué sistema operativo es de Apple?', options: ['Windows', 'Linux', 'macOS', 'Android'], correct: 2, xp: 10, cat: 'general' },
    { q: '¿Qué sistema operativo es de código abierto?', options: ['Windows', 'macOS', 'Linux', 'iOS'], correct: 2, xp: 15, cat: 'general' },
    { q: '¿Qué es un "software"?', options: ['La carcasa de la PC', 'Los programas y aplicaciones', 'El teclado', 'El monitor'], correct: 1, xp: 10, cat: 'general' },
    { q: '¿Qué es un "hardware"?', options: ['Los programas', 'La parte física de la computadora', 'Un archivo', 'Internet'], correct: 1, xp: 10, cat: 'general' },
    { q: '¿Qué empresa creó el sistema operativo Windows?', options: ['Apple', 'Google', 'Microsoft', 'Linux'], correct: 2, xp: 10, cat: 'general' },
    { q: '¿Cuál fue la primera computadora electrónica (1946)?', options: ['Apple I', 'IBM PC', 'ENIAC', 'Commodore 64'], correct: 2, xp: 25, cat: 'general' },

    // ── EXCEL ──
    { q: '¿Qué extensión tienen los archivos de Excel?', options: ['.docx', '.xlsx', '.pptx', '.pdf'], correct: 1, xp: 10, cat: 'excel' },
    { q: '¿Qué es una "celda" en Excel?', options: ['Una imagen', 'La intersección de una fila y columna', 'Un gráfico', 'Un texto'], correct: 1, xp: 15, cat: 'excel' },
    { q: 'En Excel, ¿qué símbolo inicia una fórmula?', options: ['@', '#', '=', '$'], correct: 2, xp: 15, cat: 'excel' },
    { q: '¿Qué fórmula suma un rango de celdas en Excel?', options: ['=TOTAL()', '=SUMA()', '=CONTAR()', '=PROMEDIO()'], correct: 1, xp: 15, cat: 'excel' },
    { q: '¿Qué fórmula calcula el promedio en Excel?', options: ['=PROMEDIO()', '=MEDIA()', '=AVG()', '=SUMA()/N'], correct: 0, xp: 15, cat: 'excel' },
    { q: '¿Cómo se llama la intersección de fila y columna en Excel?', options: ['Casilla', 'Celda', 'Campo', 'Registro'], correct: 1, xp: 10, cat: 'excel' },
  ];

  // ==========================================
  // EJERCICIOS FILL-IN-THE-BLANK (20+)
  // ==========================================
  const FILL_EXERCISES = [
    // Word
    { text: 'Para poner el texto en <strong>___</strong>, uso Ctrl+B.', answer: 'negrita', alternatives: ['negrita', 'cursiva', 'subrayado', 'tachado'], xp: 20, hint: 'Texto grueso y oscuro' },
    { text: 'Para guardar un documento uso la combinación <strong>Ctrl + ___</strong>.', answer: 'G', alternatives: ['G', 'S', 'A', 'Z'], xp: 15, hint: 'Primera letra de "Guardar"' },
    { text: 'Los archivos de Word tienen la extensión <strong>___</strong>.', answer: '.docx', alternatives: ['.docx', '.xlsx', '.pdf', '.txt'], xp: 15, hint: 'Document XML' },
    { text: 'Para deshacer el último cambio uso <strong>Ctrl + ___</strong>.', answer: 'Z', alternatives: ['Z', 'X', 'Y', 'D'], xp: 15, hint: 'Última letra del abecedario' },
    { text: 'En Word, la <strong>___</strong> de opciones contiene todas las herramientas.', answer: 'cinta', alternatives: ['cinta', 'barra', 'panel', 'ventana'], xp: 20, hint: 'Barra superior con pestañas' },
    { text: 'Para subrayar texto uso <strong>Ctrl + ___</strong>.', answer: 'U', alternatives: ['U', 'S', 'L', 'N'], xp: 15, hint: 'Primera letra de "Underline"' },
    // Atajos
    { text: 'Para copiar texto uso <strong>Ctrl + ___</strong>.', answer: 'C', alternatives: ['C', 'V', 'X', 'P'], xp: 15, hint: 'Primera letra de "Copiar"' },
    { text: 'Para pegar texto uso <strong>Ctrl + ___</strong>.', answer: 'V', alternatives: ['V', 'C', 'P', 'X'], xp: 15, hint: 'Primera letra de "Pegar" en inglés' },
    { text: 'Para seleccionar todo el texto uso <strong>Ctrl + ___</strong>.', answer: 'A', alternatives: ['A', 'S', 'T', 'E'], xp: 15, hint: 'La letra "A" como "All"' },
    // Hardware
    { text: 'El componente que procesa los datos es el <strong>___</strong>.', answer: 'procesador', alternatives: ['procesador', 'disco duro', 'monitor', 'teclado'], xp: 15, hint: 'El "cerebro" de la PC' },
    { text: 'La memoria <strong>___</strong> pierde los datos al apagar la PC.', answer: 'RAM', alternatives: ['RAM', 'ROM', 'SSD', 'USB'], xp: 20, hint: 'Memoria volátil de acceso aleatorio' },
    { text: 'El dispositivo para mover el cursor en pantalla es el <strong>___</strong>.', answer: 'mouse', alternatives: ['mouse', 'teclado', 'monitor', 'altavoz'], xp: 10, hint: 'Dispositivo apuntador' },
    // Internet
    { text: 'El protocolo seguro para páginas web es <strong>___</strong>.', answer: 'HTTPS', alternatives: ['HTTPS', 'HTTP', 'FTP', 'SMTP'], xp: 15, hint: 'HTTP + S de "Secure"' },
    { text: 'Google Chrome, Firefox y Edge son <strong>___</strong> web.', answer: 'navegadores', alternatives: ['navegadores', 'servidores', 'antivirus', 'editores'], xp: 10, hint: 'Programas para ver páginas web' },
    // Seguridad
    { text: 'Un ataque que busca robar datos personales se llama <strong>___</strong>.', answer: 'phishing', alternatives: ['phishing', 'virus', 'firewall', 'hacking'], xp: 20, hint: 'Pesca de datos' },
    { text: 'Una buena contraseña combina letras, <strong>___</strong> y símbolos.', answer: 'números', alternatives: ['números', 'espacios', 'imágenes', 'colores'], xp: 10, hint: '0, 1, 2, 3...' },
    // Excel
    { text: 'En Excel, las fórmulas siempre empiezan con el símbolo <strong>___</strong>.', answer: '=', alternatives: ['=', '@', '#', '$'], xp: 15, hint: 'Signo de igual' },
    { text: 'La fórmula para sumar en Excel es <strong>=___()</strong>.', answer: 'SUMA', alternatives: ['SUMA', 'TOTAL', 'SUMAR', 'CONTAR'], xp: 15, hint: 'En español, "agregar números"' },
    { text: 'La intersección de una fila y una columna se llama <strong>___</strong>.', answer: 'celda', alternatives: ['celda', 'tabla', 'campo', 'cuadro'], xp: 10, hint: 'Cuadro rectangular' },
    { text: 'La fórmula para calcular el promedio es <strong>=___()</strong>.', answer: 'PROMEDIO', alternatives: ['PROMEDIO', 'MEDIA', 'AVG', 'CALCULAR'], xp: 15, hint: 'Suma dividida entre cantidad' },
  ];

  // ==========================================
  // MATCH PAIRS (12 pares)
  // ==========================================
  const MATCH_PAIRS = [
    { left: 'Ctrl + C', right: 'Copiar' },
    { left: 'Ctrl + V', right: 'Pegar' },
    { left: 'Ctrl + Z', right: 'Deshacer' },
    { left: 'Ctrl + S', right: 'Guardar' },
    { left: 'Ctrl + B', right: 'Negrita' },
    { left: 'Ctrl + A', right: 'Seleccionar todo' },
    { left: 'Ctrl + P', right: 'Imprimir' },
    { left: 'Ctrl + F', right: 'Buscar' },
    { left: 'Ctrl + I', right: 'Cursiva' },
    { left: 'Ctrl + U', right: 'Subrayado' },
    { left: 'Ctrl + X', right: 'Cortar' },
    { left: 'Ctrl + N', right: 'Nuevo documento' },
  ];

  // ==========================================
  // ORDER STEPS — Ordenar pasos (nuevo tipo)
  // ==========================================
  const ORDER_EXERCISES = [
    {
      title: 'Encender una computadora correctamente',
      steps: ['Conectar el cable de corriente', 'Encender la pantalla (monitor)', 'Encender la CPU (botón de encendido)', 'Esperar a que cargue el sistema operativo'],
      xp: 30,
      hint: 'Primero energía, luego pantalla, después CPU'
    },
    {
      title: 'Crear un documento en Word y guardarlo',
      steps: ['Abrir Microsoft Word', 'Escribir el contenido del documento', 'Hacer clic en Archivo → Guardar como', 'Elegir ubicación y nombre, luego presionar Guardar'],
      xp: 25,
      hint: 'Abrir, escribir, guardar'
    },
    {
      title: 'Enviar un correo electrónico',
      steps: ['Abrir el cliente de correo (Gmail, Outlook)', 'Hacer clic en "Redactar" o "Nuevo mensaje"', 'Escribir destinatario, asunto y cuerpo del mensaje', 'Hacer clic en "Enviar"'],
      xp: 25,
      hint: 'Abrir → Redactar → Escribir → Enviar'
    },
    {
      title: 'Buscar información en internet',
      steps: ['Abrir el navegador web', 'Escribir la dirección del motor de búsqueda', 'Escribir las palabras clave de lo que buscas', 'Revisar los resultados y hacer clic en el más relevante'],
      xp: 25,
      hint: 'Navegador → Buscador → Palabras clave → Resultados'
    },
    {
      title: 'Crear una carpeta nueva en Windows',
      steps: ['Ir al escritorio o a la carpeta donde quieres crearla', 'Hacer clic derecho en un espacio vacío', 'Seleccionar "Nuevo" → "Carpeta"', 'Escribir el nombre de la carpeta y presionar Enter'],
      xp: 20,
      hint: 'Clic derecho → Nuevo → Carpeta → Nombrar'
    },
    {
      title: 'Conectar una computadora a internet por Wi-Fi',
      steps: ['Hacer clic en el icono de Wi-Fi en la barra de tareas', 'Seleccionar la red Wi-Fi de tu casa o lugar', 'Hacer clic en "Conectar"', 'Escribir la contraseña de la red y aceptar'],
      xp: 25,
      hint: 'Icono Wi-Fi → Seleccionar red → Conectar → Contraseña'
    },
  ];

  // ==========================================
  // ESTADO DEL EJERCICIO
  // ==========================================
  let _exerciseState = {
    type: null,
    questionIndex: 0,
    score: 0,
    answers: [],
    // Match state (sin elementos DOM)
    matchSelectedLeftIndex: null,
    matchedPairs: 0,
    // Order state
    orderCurrentStep: 0,
    orderCorrectOrder: [],
  };

  function getExerciseState() {
    return { ..._exerciseState };
  }

  function setExerciseState(updates) {
    _exerciseState = { ..._exerciseState, ...updates };
  }

  // ==========================================
  // RENDERIZAR SELECCIÓN DE CATEGORÍA
  // ==========================================
  function renderCategorySelect() {
    const container = document.getElementById('exerciseContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="ex-welcome">
        <span class="ex-welcome-icon">🎮</span>
        <h2>¿Qué quieres practicar?</h2>
        <p>Elige un tipo de ejercicio para comenzar</p>
        <div class="ex-types">
          <button class="ex-type-btn" onclick="Exercises.start('quiz')">
            <span>❓</span> Quiz mixto
          </button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-word')">
            <span>📄</span> Word
          </button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-hardware')">
            <span>🖥️</span> Hardware
          </button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-internet')">
            <span>🌐</span> Internet
          </button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-security')">
            <span>🔒</span> Seguridad
          </button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-shortcuts')">
            <span>⌨️</span> Atajos
          </button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-excel')">
            <span>📊</span> Excel
          </button>
          <button class="ex-type-btn" onclick="Exercises.start('fill')">
            <span>✏️</span> Completar texto
          </button>
          <button class="ex-type-btn" onclick="Exercises.start('match')">
            <span>🔗</span> Unir conceptos
          </button>
          <button class="ex-type-btn" onclick="Exercises.start('order')">
            <span>🔢</span> Ordenar pasos
          </button>
        </div>
      </div>
    `;
  }

  // Alias para compatibilidad con HTML estático
  function renderWelcome() {
    renderCategorySelect();
  }

  // ==========================================
  // INICIAR EJERCICIO
  // ==========================================
  function start(type) {
    setExerciseState({
      type,
      questionIndex: 0,
      score: 0,
      answers: [],
      matchSelectedLeftIndex: null,
      matchedPairs: 0,
      orderCurrentStep: 0,
    });

    if (type === 'quiz' || type.startsWith('quiz-')) renderQuiz();
    else if (type === 'fill') renderFill();
    else if (type === 'match') renderMatch();
    else if (type === 'order') renderOrder();
  }

  // ==========================================
  // OBTENER PREGUNTAS SEGÚN CATEGORÍA
  // ==========================================
  function getQuizQuestions(type) {
    if (type === 'quiz') {
      // Mixto: todas las preguntas barajadas
      return [...QUIZ_BANK].sort(() => Math.random() - 0.5);
    }
    const cat = type.replace('quiz-', '');
    return QUIZ_BANK.filter(q => q.cat === cat).sort(() => Math.random() - 0.5);
  }

  // ==========================================
  // QUIZ MÚLTIPLE OPCIÓN
  // ==========================================
  function renderQuiz() {
    const state = getExerciseState();
    const questions = getQuizQuestions(state.type);
    const questionIndex = state.questionIndex;

    if (questionIndex >= questions.length) {
      showQuizResults(state.score, questions);
      return;
    }

    const question = questions[questionIndex];
    const container = document.getElementById('exerciseContainer');
    const progress = Math.round((questionIndex / questions.length) * 100);
    const catInfo = CATEGORIES[question.cat] || CATEGORIES.general;

    container.innerHTML = `
      <div class="ex-progress-bar">
        <div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div>
        <span class="ex-prog-label">${questionIndex + 1} / ${questions.length}</span>
      </div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:${catInfo.color};text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">
          ${catInfo.icon} ${catInfo.name} — Pregunta ${questionIndex + 1}
        </div>
        <div class="quiz-q-text">${question.q}</div>
        <div class="quiz-options" id="quizOptions">
          ${question.options.map((opt, i) => `
            <button class="quiz-option" onclick="Exercises.handleQuizAnswer(${i})">
              <span style="margin-right:8px;font-weight:700;color:var(--text-3)">${String.fromCharCode(65 + i)}.</span>
              ${opt}
            </button>
          `).join('')}
        </div>
        <div class="quiz-feedback hidden" id="quizFeedback"></div>
      </div>
    `;
  }

  function handleQuizAnswer(selected) {
    const state = getExerciseState();
    const questions = getQuizQuestions(state.type);
    const question = questions[state.questionIndex];
    if (!question) return;

    const options = document.querySelectorAll('.quiz-option');
    options.forEach(o => o.disabled = true);

    const feedback = document.getElementById('quizFeedback');
    const isCorrect = selected === question.correct;

    options[selected].classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) options[question.correct].classList.add('correct');

    const newScore = isCorrect ? state.score + question.xp : state.score;

    if (isCorrect) {
      feedback.className = 'quiz-feedback correct-msg';
      feedback.innerHTML = `✅ ¡Correcto! <span style="color:var(--brand-accent);font-weight:700">+${question.xp} XP</span>`;
    } else {
      feedback.className = 'quiz-feedback wrong-msg';
      feedback.innerHTML = `❌ No es correcto. La respuesta era: <strong>${question.options[question.correct]}</strong>`;
    }

    feedback.classList.remove('hidden');
    setExerciseState({ score: newScore });

    setTimeout(() => {
      setExerciseState({ questionIndex: state.questionIndex + 1 });
      renderQuiz();
    }, 1600);
  }

  function showQuizResults(score, questions) {
    const container = document.getElementById('exerciseContainer');
    const maxScore = questions.reduce((s, q) => s + q.xp, 0);
    const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const isPerfect = percent === 100;

    let emoji, msg;
    if (percent === 100) { emoji = '🏆'; msg = '¡Perfecto! Eres un genio de la informática.'; }
    else if (percent >= 80) { emoji = '⭐'; msg = '¡Excelente trabajo!'; }
    else if (percent >= 60) { emoji = '👍'; msg = 'Buen intento. ¡Sigue practicando!'; }
    else { emoji = '💪'; msg = 'Necesitas repasar un poco más.'; }

    container.innerHTML = `
      <div style="text-align:center;padding:40px;max-width:500px;margin:0 auto">
        <div style="font-size:4rem;margin-bottom:16px">${emoji}</div>
        <h2 style="margin-bottom:8px">${msg}</h2>
        <div style="font-size:3rem;font-weight:800;font-family:var(--font-display);background:var(--grad-brand);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:20px 0">
          ${percent}%
        </div>
        <p style="color:var(--text-2);margin-bottom:8px">Puntuación: <strong>${score} / ${maxScore} XP</strong></p>
        <p style="color:var(--text-2);margin-bottom:32px">${questions.length} preguntas completadas</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="Exercises.renderWelcome()">← Volver</button>
          <button class="btn btn-ghost" onclick="Exercises.start('${getExerciseState().type}')">🔄 Repetir</button>
          <button class="btn btn-primary" onclick="Exercises.claimXp(${score}, ${isPerfect})">
            Cobrar +${score} XP →
          </button>
        </div>
      </div>
    `;
  }

  async function claimXp(xpAmount, isPerfect) {
    const state = Store.getState();
    if (!state.currentUser || !state.isAuthenticated) {
      showToast('error', 'Debes iniciar sesión', 'Para guardar tu progreso');
      return;
    }

    await Progress.updateUserProgress('quiz_complete', { xp: xpAmount, isPerfect });
    showToast('success', `+${xpAmount} XP`, '¡Progreso guardado!');
    renderCategorySelect();
  }

  // ==========================================
  // FILL IN THE BLANK
  // ==========================================
  function renderFill() {
    const state = getExerciseState();
    const questionIndex = state.questionIndex;

    if (questionIndex >= FILL_EXERCISES.length) {
      showFillResults(state.score);
      return;
    }

    const exercise = FILL_EXERCISES[questionIndex];
    const container = document.getElementById('exerciseContainer');
    const progress = Math.round((questionIndex / FILL_EXERCISES.length) * 100);
    const shuffled = [...exercise.alternatives].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="ex-progress-bar">
        <div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div>
        <span class="ex-prog-label">${questionIndex + 1} / ${FILL_EXERCISES.length}</span>
      </div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">
          ✏️ Completa el texto
        </div>
        <div class="quiz-q-text" style="font-size:1.1rem;margin-bottom:24px">
          ${exercise.text}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px" id="fillOptions">
          ${shuffled.map((alt) => `
            <button class="quiz-option" style="text-align:center" onclick="Exercises.handleFillAnswer(this, '${alt}')">
              ${alt}
            </button>
          `).join('')}
        </div>
        <div style="margin-top:16px;font-size:0.8rem;color:var(--text-3)">
          💡 Pista: ${exercise.hint}
        </div>
        <div class="quiz-feedback hidden" id="fillFeedback"></div>
      </div>
    `;
  }

  function handleFillAnswer(button, selected) {
    const state = getExerciseState();
    const exercise = FILL_EXERCISES[state.questionIndex];
    if (!exercise) return;

    const options = document.querySelectorAll('.quiz-option');
    options.forEach(o => o.disabled = true);

    const feedback = document.getElementById('fillFeedback');
    const isCorrect = selected === exercise.answer;

    button.classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
      options.forEach(o => { if (o.textContent.trim() === exercise.answer) o.classList.add('correct'); });
    }

    feedback.className = `quiz-feedback ${isCorrect ? 'correct-msg' : 'wrong-msg'}`;
    feedback.innerHTML = isCorrect
      ? `✅ ¡Correcto! <span style="color:var(--brand-accent)">+${exercise.xp} XP</span>`
      : `❌ La respuesta correcta es: <strong>${exercise.answer}</strong>`;
    feedback.classList.remove('hidden');

    const newScore = isCorrect ? state.score + exercise.xp : state.score;
    setExerciseState({ score: newScore });

    setTimeout(() => {
      setExerciseState({ questionIndex: state.questionIndex + 1 });
      renderFill();
    }, 1600);
  }

  function showFillResults(score) {
    const container = document.getElementById('exerciseContainer');
    const maxScore = FILL_EXERCISES.reduce((s, e) => s + e.xp, 0);
    const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    container.innerHTML = `
      <div style="text-align:center;padding:40px">
        <div style="font-size:3.5rem;margin-bottom:12px">${percent >= 75 ? '🌟' : '💪'}</div>
        <h2 style="margin-bottom:16px">${percent >= 75 ? '¡Muy bien!' : 'Buen esfuerzo'}</h2>
        <div style="font-size:2.5rem;font-weight:800;font-family:var(--font-display);color:var(--brand-accent);margin:16px 0">${percent}%</div>
        <p style="color:var(--text-2);margin-bottom:28px">Puntuación: <strong>${score} / ${maxScore} XP</strong></p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="Exercises.renderWelcome()">← Volver</button>
          <button class="btn btn-ghost" onclick="Exercises.start('fill')">🔄 Repetir</button>
          <button class="btn btn-primary" onclick="Exercises.claimXp(${score}, false)">Cobrar +${score} XP →</button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // MATCHING EXERCISE (SIN ELEMENTOS DOM EN STORE)
  // ==========================================
  let _selectedLeftIndex = null;

  function renderMatch() {
    _selectedLeftIndex = null;
    setExerciseState({ matchedPairs: 0 });

    const container = document.getElementById('exerciseContainer');
    const shuffledRight = [...MATCH_PAIRS].map((p, i) => ({ text: p.right, origIndex: i }))
      .sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">
          🔗 Une cada atajo con su función (${MATCH_PAIRS.length} pares)
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">
          <div style="display:flex;flex-direction:column;gap:8px" id="matchLeft">
            ${MATCH_PAIRS.map((p, i) => `
              <button class="quiz-option match-left" id="ml-${i}" data-idx="${i}" onclick="Exercises.selectLeft(${i})" style="font-weight:700;letter-spacing:.04em">
                ${p.left}
              </button>
            `).join('')}
          </div>
          <div style="display:flex;flex-direction:column;gap:8px" id="matchRight">
            ${shuffledRight.map((p, i) => `
              <button class="quiz-option match-right" id="mr-${i}" data-orig="${p.origIndex}" onclick="Exercises.selectRight(${i})" style="font-size:0.85rem">
                ${p.text}
              </button>
            `).join('')}
          </div>
        </div>
        <div style="margin-top:16px;font-size:0.85rem;color:var(--text-3)">
          Emparejados: <span id="matchCount" style="font-weight:700;color:var(--brand-accent)">0</span> / ${MATCH_PAIRS.length}
        </div>
      </div>
    `;
  }

  function selectLeft(index) {
    if (_selectedLeftIndex !== null) {
      const prev = document.getElementById(`ml-${_selectedLeftIndex}`);
      if (prev) prev.style.borderColor = '';
    }
    const btn = document.getElementById(`ml-${index}`);
    if (!btn || btn.disabled) return;

    _selectedLeftIndex = index;
    btn.style.borderColor = 'var(--brand-1)';
  }

  function selectRight(rightIndex) {
    if (_selectedLeftIndex === null) return;

    const leftBtn = document.getElementById(`ml-${_selectedLeftIndex}`);
    const rightBtn = document.getElementById(`mr-${rightIndex}`);
    if (!leftBtn || !rightBtn || leftBtn.disabled || rightBtn.disabled) return;

    const leftIdx = _selectedLeftIndex;
    const rightOrigIdx = parseInt(rightBtn.dataset.orig);
    const isCorrect = rightOrigIdx === leftIdx;

    if (isCorrect) {
      leftBtn.classList.add('correct');
      rightBtn.classList.add('correct');
      leftBtn.disabled = true;
      rightBtn.disabled = true;

      const state = getExerciseState();
      const newMatched = (state.matchedPairs || 0) + 1;
      setExerciseState({ matchedPairs: newMatched });

      const counter = document.getElementById('matchCount');
      if (counter) counter.textContent = newMatched;
      showXpGain(15);

      if (newMatched === MATCH_PAIRS.length) {
        const totalXp = MATCH_PAIRS.length * 15;
        setTimeout(() => {
          showToast('success', '¡Completado!', `+${totalXp} XP ganados`);
          showMatchResults(totalXp);
        }, 800);
      }
    } else {
      leftBtn.classList.add('wrong');
      rightBtn.classList.add('wrong');
      setTimeout(() => {
        leftBtn.classList.remove('wrong');
        rightBtn.classList.remove('wrong');
        leftBtn.style.borderColor = '';
      }, 600);
    }

    _selectedLeftIndex = null;
  }

  function showMatchResults(totalXp) {
    const container = document.getElementById('exerciseContainer');
    container.innerHTML = `
      <div style="text-align:center;padding:40px">
        <div style="font-size:3.5rem;margin-bottom:12px">🔗✅</div>
        <h2 style="margin-bottom:16px">¡Todos los pares correctos!</h2>
        <div style="font-size:2.5rem;font-weight:800;font-family:var(--font-display);color:var(--brand-accent);margin:16px 0">+${totalXp} XP</div>
        <p style="color:var(--text-2);margin-bottom:28px">${MATCH_PAIRS.length} pares emparejados</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="Exercises.renderWelcome()">← Volver</button>
          <button class="btn btn-ghost" onclick="Exercises.start('match')">🔄 Repetir</button>
          <button class="btn btn-primary" onclick="Exercises.claimXp(${totalXp}, true)">Cobrar +${totalXp} XP →</button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // ORDER STEPS (NUEVO)
  // ==========================================
  let _orderState = { exerciseIndex: 0, selectedOrder: [], available: [] };

  function renderOrder() {
    const state = getExerciseState();
    const idx = state.questionIndex;

    if (idx >= ORDER_EXERCISES.length) {
      showOrderResults(state.score);
      return;
    }

    const exercise = ORDER_EXERCISES[idx];
    const container = document.getElementById('exerciseContainer');
    const shuffled = exercise.steps.map((s, i) => ({ text: s, correctIndex: i }))
      .sort(() => Math.random() - 0.5);

    _orderState = {
      exerciseIndex: idx,
      selectedOrder: [],
      available: shuffled.map((s, i) => ({ ...s, uid: i })),
    };

    const progress = Math.round((idx / ORDER_EXERCISES.length) * 100);

    container.innerHTML = `
      <div class="ex-progress-bar">
        <div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div>
        <span class="ex-prog-label">${idx + 1} / ${ORDER_EXERCISES.length}</span>
      </div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">
          🔢 Ordena los pasos
        </div>
        <div class="quiz-q-text" style="margin-bottom:20px">${exercise.title}</div>
        <p style="font-size:0.85rem;color:var(--text-3);margin-bottom:16px">Haz clic en los pasos en el orden correcto:</p>

        <div id="orderSelected" style="min-height:48px;margin-bottom:16px;display:flex;flex-direction:column;gap:6px">
          <div style="font-size:0.75rem;color:var(--text-3);font-style:italic;padding:12px;text-align:center;border:1px dashed var(--border);border-radius:10px" id="orderPlaceholder">
            Haz clic en el paso 1...
          </div>
        </div>

        <div id="orderAvailable" style="display:flex;flex-direction:column;gap:6px">
          ${_orderState.available.map((s, i) => `
            <button class="quiz-option order-step" id="os-${i}" onclick="Exercises.selectOrderStep(${i})">
              ${s.text}
            </button>
          `).join('')}
        </div>

        <div style="margin-top:12px;font-size:0.8rem;color:var(--text-3)">
          💡 Pista: ${exercise.hint}
        </div>

        <div class="quiz-feedback hidden" id="orderFeedback"></div>
      </div>
    `;
  }

  function selectOrderStep(uid) {
    const btn = document.getElementById(`os-${uid}`);
    if (!btn || btn.disabled) return;

    const step = _orderState.available.find(s => s.uid === uid);
    if (!step) return;

    _orderState.selectedOrder.push(step);
    btn.disabled = true;
    btn.style.opacity = '0.3';

    // Actualizar zona de seleccionados
    const placeholder = document.getElementById('orderPlaceholder');
    if (placeholder) placeholder.remove();

    const selectedDiv = document.getElementById('orderSelected');
    const stepEl = document.createElement('div');
    stepEl.className = 'quiz-option correct';
    stepEl.style.textAlign = 'center';
    stepEl.style.cursor = 'default';
    stepEl.innerHTML = `<strong>${_orderState.selectedOrder.length}.</strong> ${step.text}`;
    selectedDiv.appendChild(stepEl);

    // Verificar si se completaron todos los pasos
    const exercise = ORDER_EXERCISES[_orderState.exerciseIndex];
    if (_orderState.selectedOrder.length === exercise.steps.length) {
      verifyOrder();
    } else {
      // Actualizar hint del siguiente paso
      const placeholder2 = document.createElement('div');
      placeholder2.id = 'orderPlaceholder';
      placeholder2.style.cssText = 'font-size:0.75rem;color:var(--text-3);font-style:italic;padding:8px;text-align:center';
      placeholder2.textContent = `Haz clic en el paso ${_orderState.selectedOrder.length + 1}...`;
      selectedDiv.appendChild(placeholder2);
    }
  }

  function verifyOrder() {
    const exercise = ORDER_EXERCISES[_orderState.exerciseIndex];
    const feedback = document.getElementById('orderFeedback');

    // Verificar si el orden es correcto
    let correctCount = 0;
    _orderState.selectedOrder.forEach((step, i) => {
      if (step.correctIndex === i) correctCount++;
    });

    const allCorrect = correctCount === exercise.steps.length;
    const earnedXp = allCorrect ? exercise.xp : Math.round(exercise.xp * (correctCount / exercise.steps.length));

    if (allCorrect) {
      feedback.className = 'quiz-feedback correct-msg';
      feedback.innerHTML = `✅ ¡Orden perfecto! <span style="color:var(--brand-accent);font-weight:700">+${earnedXp} XP</span>`;
    } else {
      feedback.className = 'quiz-feedback wrong-msg';
      feedback.innerHTML = `❌ ${correctCount} de ${exercise.steps.length} pasos en la posición correcta. Orden correcto:<br><br>${exercise.steps.map((s, i) => `<strong>${i + 1}.</strong> ${s}`).join('<br>')}`;
    }

    feedback.classList.remove('hidden');
    setExerciseState({ score: getExerciseState().score + earnedXp });

    setTimeout(() => {
      setExerciseState({ questionIndex: getExerciseState().questionIndex + 1 });
      renderOrder();
    }, allCorrect ? 1800 : 4000);
  }

  function showOrderResults(score) {
    const container = document.getElementById('exerciseContainer');
    const maxScore = ORDER_EXERCISES.reduce((s, e) => s + e.xp, 0);
    const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    container.innerHTML = `
      <div style="text-align:center;padding:40px">
        <div style="font-size:3.5rem;margin-bottom:12px">${percent >= 75 ? '🔢✨' : '💪'}</div>
        <h2 style="margin-bottom:16px">${percent >= 75 ? '¡Excelente memoria de procedimientos!' : 'Sigue practicando los pasos'}</h2>
        <div style="font-size:2.5rem;font-weight:800;font-family:var(--font-display);color:var(--brand-accent);margin:16px 0">${percent}%</div>
        <p style="color:var(--text-2);margin-bottom:28px">Puntuación: <strong>${score} / ${maxScore} XP</strong></p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="Exercises.renderWelcome()">← Volver</button>
          <button class="btn btn-ghost" onclick="Exercises.start('order')">🔄 Repetir</button>
          <button class="btn btn-primary" onclick="Exercises.claimXp(${score}, false)">Cobrar +${score} XP →</button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // EXPORTS
  // ==========================================
  return {
    CATEGORIES,
    QUIZ_BANK,
    FILL_EXERCISES,
    MATCH_PAIRS,
    ORDER_EXERCISES,
    renderWelcome,
    renderCategorySelect,
    start,
    renderQuiz,
    handleQuizAnswer,
    renderFill,
    handleFillAnswer,
    renderMatch,
    selectLeft,
    selectRight,
    renderOrder,
    selectOrderStep,
    claimXp,
  };
})();

window.Exercises = Exercises;
