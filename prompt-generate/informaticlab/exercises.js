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
  // BANCO DE QUIZ — 55+ preguntas por categoría
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
    { text: 'Para poner el texto en <strong>___</strong>, uso Ctrl+B.', answer: 'negrita', alternatives: ['negrita', 'cursiva', 'subrayado', 'tachado'], xp: 20, hint: 'Texto grueso y oscuro' },
    { text: 'Para guardar un documento uso la combinación <strong>Ctrl + ___</strong>.', answer: 'G', alternatives: ['G', 'S', 'A', 'Z'], xp: 15, hint: 'Primera letra de "Guardar"' },
    { text: 'Los archivos de Word tienen la extensión <strong>___</strong>.', answer: '.docx', alternatives: ['.docx', '.xlsx', '.pdf', '.txt'], xp: 15, hint: 'Document XML' },
    { text: 'Para deshacer el último cambio uso <strong>Ctrl + ___</strong>.', answer: 'Z', alternatives: ['Z', 'X', 'Y', 'D'], xp: 15, hint: 'Última letra del abecedario' },
    { text: 'En Word, la <strong>___</strong> de opciones contiene todas las herramientas.', answer: 'cinta', alternatives: ['cinta', 'barra', 'panel', 'ventana'], xp: 20, hint: 'Barra superior con pestañas' },
    { text: 'Para subrayar texto uso <strong>Ctrl + ___</strong>.', answer: 'U', alternatives: ['U', 'S', 'L', 'N'], xp: 15, hint: 'Primera letra de "Underline"' },
    { text: 'Para copiar texto uso <strong>Ctrl + ___</strong>.', answer: 'C', alternatives: ['C', 'V', 'X', 'P'], xp: 15, hint: 'Primera letra de "Copiar"' },
    { text: 'Para pegar texto uso <strong>Ctrl + ___</strong>.', answer: 'V', alternatives: ['V', 'C', 'P', 'X'], xp: 15, hint: 'Primera letra de "Pegar" en inglés' },
    { text: 'Para seleccionar todo el texto uso <strong>Ctrl + ___</strong>.', answer: 'A', alternatives: ['A', 'S', 'T', 'E'], xp: 15, hint: 'La letra "A" como "All"' },
    { text: 'El componente que procesa los datos es el <strong>___</strong>.', answer: 'procesador', alternatives: ['procesador', 'disco duro', 'monitor', 'teclado'], xp: 15, hint: 'El "cerebro" de la PC' },
    { text: 'La memoria <strong>___</strong> pierde los datos al apagar la PC.', answer: 'RAM', alternatives: ['RAM', 'ROM', 'SSD', 'USB'], xp: 20, hint: 'Memoria volátil de acceso aleatorio' },
    { text: 'El dispositivo para mover el cursor en pantalla es el <strong>___</strong>.', answer: 'mouse', alternatives: ['mouse', 'teclado', 'monitor', 'altavoz'], xp: 10, hint: 'Dispositivo apuntador' },
    { text: 'El protocolo seguro para páginas web es <strong>___</strong>.', answer: 'HTTPS', alternatives: ['HTTPS', 'HTTP', 'FTP', 'SMTP'], xp: 15, hint: 'HTTP + S de "Secure"' },
    { text: 'Google Chrome, Firefox y Edge son <strong>___</strong> web.', answer: 'navegadores', alternatives: ['navegadores', 'servidores', 'antivirus', 'editores'], xp: 10, hint: 'Programas para ver páginas web' },
    { text: 'Un ataque que busca robar datos personales se llama <strong>___</strong>.', answer: 'phishing', alternatives: ['phishing', 'virus', 'firewall', 'hacking'], xp: 20, hint: 'Pesca de datos' },
    { text: 'Una buena contraseña combina letras, <strong>___</strong> y símbolos.', answer: 'números', alternatives: ['números', 'espacios', 'imágenes', 'colores'], xp: 10, hint: '0, 1, 2, 3...' },
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
  // ORDER STEPS
  // ==========================================
  const ORDER_EXERCISES = [
    {
      title: 'Encender una computadora correctamente',
      steps: ['Conectar el cable de corriente', 'Encender la pantalla (monitor)', 'Encender la CPU (botón de encendido)', 'Esperar a que cargue el sistema operativo'],
      xp: 30, hint: 'Primero energía, luego pantalla, después CPU'
    },
    {
      title: 'Crear un documento en Word y guardarlo',
      steps: ['Abrir Microsoft Word', 'Escribir el contenido del documento', 'Hacer clic en Archivo → Guardar como', 'Elegir ubicación y nombre, luego presionar Guardar'],
      xp: 25, hint: 'Abrir, escribir, guardar'
    },
    {
      title: 'Enviar un correo electrónico',
      steps: ['Abrir el cliente de correo (Gmail, Outlook)', 'Hacer clic en "Redactar" o "Nuevo mensaje"', 'Escribir destinatario, asunto y cuerpo del mensaje', 'Hacer clic en "Enviar"'],
      xp: 25, hint: 'Abrir → Redactar → Escribir → Enviar'
    },
    {
      title: 'Buscar información en internet',
      steps: ['Abrir el navegador web', 'Escribir la dirección del motor de búsqueda', 'Escribir las palabras clave de lo que buscas', 'Revisar los resultados y hacer clic en el más relevante'],
      xp: 25, hint: 'Navegador → Buscador → Palabras clave → Resultados'
    },
    {
      title: 'Crear una carpeta nueva en Windows',
      steps: ['Ir al escritorio o a la carpeta donde quieres crearla', 'Hacer clic derecho en un espacio vacío', 'Seleccionar "Nuevo" → "Carpeta"', 'Escribir el nombre de la carpeta y presionar Enter'],
      xp: 20, hint: 'Clic derecho → Nuevo → Carpeta → Nombrar'
    },
    {
      title: 'Conectar una computadora a internet por Wi-Fi',
      steps: ['Hacer clic en el icono de Wi-Fi en la barra de tareas', 'Seleccionar la red Wi-Fi de tu casa o lugar', 'Hacer clic en "Conectar"', 'Escribir la contraseña de la red y aceptar'],
      xp: 25, hint: 'Icono Wi-Fi → Seleccionar red → Conectar → Contraseña'
    },
  ];

  // ==========================================
  // TRUE / FALSE (15 preguntas para niños)
  // ==========================================
  const TRUE_FALSE = [
    { q: 'El monitor es un dispositivo de entrada.', correct: false, xp: 10, explanation: 'El monitor es un dispositivo de SALIDA porque muestra imágenes.' },
    { q: 'Ctrl + C sirve para copiar texto.', correct: true, xp: 10, explanation: 'Correcto, Ctrl+C copia lo seleccionado.' },
    { q: 'La memoria RAM guarda los datos cuando apagas la PC.', correct: false, xp: 10, explanation: 'La RAM es volátil, pierde los datos al apagar.' },
    { q: 'Un archivo .jpg es una imagen.', correct: true, xp: 10, explanation: 'Sí, .jpg es un formato común de imagen.' },
    { q: 'El teclado es un dispositivo de salida.', correct: false, xp: 10, explanation: 'El teclado es de ENTRADA porque escribes en él.' },
    { q: 'HTTPS es más seguro que HTTP.', correct: true, xp: 10, explanation: 'HTTPS cifra los datos, por eso es más seguro.' },
    { q: 'Una carpeta puede contener otras carpetas.', correct: true, xp: 10, explanation: 'Sí, las carpetas pueden organizarse dentro de otras.' },
    { q: 'Excel se usa principalmente para escribir cartas.', correct: false, xp: 10, explanation: 'Excel es para hojas de cálculo, Word es para documentos.' },
    { q: 'Ctrl + Z deshace el último cambio.', correct: true, xp: 10, explanation: 'Correcto, Z de "deshacer" (undo).' },
    { q: 'La CPU es el cerebro de la computadora.', correct: true, xp: 10, explanation: 'Sí, la CPU procesa todas las instrucciones.' },
    { q: 'Puedes usar la misma contraseña para todo sin peligro.', correct: false, xp: 10, explanation: 'Nunca debes reusar contraseñas, es inseguro.' },
    { q: 'Un virus informático puede dañar tus archivos.', correct: true, xp: 10, explanation: 'Sí, los virus pueden borrar o dañar archivos.' },
    { q: 'El mouse sirve para escribir en la pantalla.', correct: false, xp: 10, explanation: 'El mouse controla el cursor, el teclado escribe.' },
    { q: '1 GB es mayor que 1 MB.', correct: true, xp: 10, explanation: '1 GB = 1024 MB, así que sí es mayor.' },
    { q: 'La extensión .exe indica un archivo de imagen.', correct: false, xp: 10, explanation: '.exe es un archivo ejecutable (programa), no una imagen.' },
  ];

  // ==========================================
  // FIND ERROR — Detectar errores (10 ejercicios)
  // ==========================================
  const FIND_ERROR = [
    { text: 'Para copiar uso Ctrl + V', correct: 'Ctrl + C', options: ['Ctrl + C', 'Ctrl + Z', 'Ctrl + A', 'Ctrl + X'], hint: 'La C es de "Copiar"', xp: 15 },
    { text: 'Los archivos de Excel terminan en .docx', correct: '.xlsx', options: ['.xlsx', '.pptx', '.pdf', '.txt'], hint: 'Excel = hoja de cálculo', xp: 15 },
    { text: 'El mouse es un dispositivo de salida', correct: 'dispositivo de entrada', options: ['dispositivo de entrada', 'dispositivo de audio', 'software', 'memoria'], hint: 'Con el mouse ENTRAS datos a la PC', xp: 15 },
    { text: 'Para guardar presiono Ctrl + A', correct: 'Ctrl + S', options: ['Ctrl + S', 'Ctrl + G', 'Ctrl + W', 'Ctrl + D'], hint: 'S de "Save" (guardar en inglés)', xp: 15 },
    { text: 'La RAM es una memoria permanente', correct: 'memoria temporal (volátil)', options: ['memoria temporal (volátil)', 'un programa', 'el procesador', 'el disco duro'], hint: 'La RAM pierde datos al apagar', xp: 15 },
    { text: 'Phishing es un tipo de antivirus', correct: 'un ataque que roba datos', options: ['un ataque que roba datos', 'un juego', 'un navegador', 'una red social'], hint: 'Phishing = "pesca" de datos personales', xp: 15 },
    { text: '1 KB tiene 500 bytes', correct: '1024 bytes', options: ['1024 bytes', '100 bytes', '512 bytes', '2000 bytes'], hint: '1 KB = 1024 bytes (potencia de 2)', xp: 15 },
    { text: 'El sistema operativo de Apple se llama Windows', correct: 'macOS', options: ['macOS', 'Linux', 'Android', 'Chrome OS'], hint: 'Las Mac usan macOS', xp: 15 },
    { text: 'Una URL es un tipo de virus', correct: 'la dirección de una página web', options: ['la dirección de una página web', 'un programa', 'una contraseña', 'un archivo'], hint: 'URL = dirección web', xp: 15 },
    { text: 'En Excel las fórmulas empiezan con @', correct: '=', options: ['=', '#', '$', '+'], hint: 'El signo igual inicia las fórmulas', xp: 15 },
  ];

  // ==========================================
  // SCENARIOS — Situaciones reales (8 escenarios)
  // ==========================================
  const SCENARIOS = [
    {
      situation: 'Tu amigo te envía un email pidiendo tu contraseña de Gmail para "arreglar un problema".',
      question: '¿Qué deberías hacer?',
      options: ['Enviarle la contraseña', 'No compartirla y verificar directamente con tu amigo', 'Ignorar el email sin más', 'Cambiar tu contraseña y compartirla'],
      correct: 1, xp: 20
    },
    {
      situation: 'Estás escribiendo un trabajo en Word y quieres poner una palabra en cursiva.',
      question: '¿Qué combinación de teclas usas?',
      options: ['Ctrl + B', 'Ctrl + I', 'Ctrl + U', 'Ctrl + N'],
      correct: 1, xp: 15
    },
    {
      situation: 'Necesitas buscar información sobre animales en internet para tu tarea de ciencias.',
      question: '¿Cuál es la mejor búsqueda?',
      options: ['animales', 'información de animales', 'tipos de animales para tarea de ciencias primaria', 'animales.com'],
      correct: 2, xp: 20
    },
    {
      situation: 'Tu computadora está muy lenta y no sabes qué programa está causando el problema.',
      question: '¿Qué herramienta de Windows puedes usar?',
      options: ['Paint', 'Bloc de notas', 'Administrador de tareas', 'Calculadora'],
      correct: 2, xp: 20
    },
    {
      situation: 'Estás en la biblioteca y alguien te deja una memoria USB en la mesa.',
      question: '¿Qué deberías hacer?',
      options: ['Conectarla a tu PC para ver qué tiene', 'Entregarla al personal de la biblioteca', 'Dejarla donde está', 'Llevártela'],
      correct: 1, xp: 20
    },
    {
      situation: 'Terminaste de escribir tu tarea en Word pero no has guardado.',
      question: '¿Qué atajo usas para guardar rápidamente?',
      options: ['Ctrl + S', 'Ctrl + G', 'Ctrl + P', 'Ctrl + W'],
      correct: 0, xp: 15
    },
    {
      situation: 'Quieres compartir unas fotos con tus compañeros de clase sin usar USB.',
      question: '¿Cuál es la mejor opción?',
      options: ['Imprimirlas y entregarlas', 'Subirlas a Google Drive y compartir el enlace', 'Enviarlas por WhatsApp una por una', 'Grabar un CD'],
      correct: 1, xp: 20
    },
    {
      situation: 'Una página web te pide datos de tu tarjeta de crédito pero la URL empieza con "http://" (sin la S).',
      question: '¿Qué debes hacer?',
      options: ['Ingresar los datos igual', 'No ingresar datos, la conexión no es segura', 'Hacer captura de pantalla', 'Cerrar el navegador entero'],
      correct: 1, xp: 20
    },
  ];

  // ==========================================
  // CLASSIFY — Clasificar elementos (6 ejercicios)
  // ==========================================
  const CLASSIFY = [
    {
      title: 'Clasifica como HARDWARE o SOFTWARE',
      categories: { '🖥️ Hardware': [], '💻 Software': [] },
      items: [
        { text: 'Teclado', correct: '🖥️ Hardware' },
        { text: 'Microsoft Word', correct: '💻 Software' },
        { text: 'Monitor', correct: '🖥️ Hardware' },
        { text: 'Google Chrome', correct: '💻 Software' },
        { text: 'Mouse', correct: '🖥️ Hardware' },
        { text: 'Antivirus', correct: '💻 Software' },
      ],
      xp: 25
    },
    {
      title: 'Clasifica como ENTRADA o SALIDA',
      categories: { '⬇️ Entrada': [], '⬆️ Salida': [] },
      items: [
        { text: 'Teclado', correct: '⬇️ Entrada' },
        { text: 'Monitor', correct: '⬆️ Salida' },
        { text: 'Mouse', correct: '⬇️ Entrada' },
        { text: 'Impresora', correct: '⬆️ Salida' },
        { text: 'Micrófono', correct: '⬇️ Entrada' },
        { text: 'Altavoces', correct: '⬆️ Salida' },
      ],
      xp: 25
    },
    {
      title: 'Clasifica las EXTENSIONES por tipo',
      categories: { '🖼️ Imagen': [], '📄 Documento': [], '🎬 Video': [] },
      items: [
        { text: '.jpg', correct: '🖼️ Imagen' },
        { text: '.docx', correct: '📄 Documento' },
        { text: '.mp4', correct: '🎬 Video' },
        { text: '.png', correct: '🖼️ Imagen' },
        { text: '.pdf', correct: '📄 Documento' },
        { text: '.avi', correct: '🎬 Video' },
      ],
      xp: 25
    },
    {
      title: 'Clasifica los ATAJOS de teclado',
      categories: { '📋 Portapapeles': [], '💾 Guardar/Imprimir': [], '📝 Formato': [] },
      items: [
        { text: 'Ctrl + C', correct: '📋 Portapapeles' },
        { text: 'Ctrl + S', correct: '💾 Guardar/Imprimir' },
        { text: 'Ctrl + B', correct: '📝 Formato' },
        { text: 'Ctrl + V', correct: '📋 Portapapeles' },
        { text: 'Ctrl + P', correct: '💾 Guardar/Imprimir' },
        { text: 'Ctrl + I', correct: '📝 Formato' },
      ],
      xp: 25
    },
    {
      title: 'Clasifica como SEGURO o PELIGROSO',
      categories: { '✅ Seguro': [], '⚠️ Peligroso': [] },
      items: [
        { text: 'Compartir tu contraseña por WhatsApp', correct: '⚠️ Peligroso' },
        { text: 'Usar HTTPS en sitios web', correct: '✅ Seguro' },
        { text: 'Abrir archivos de emails desconocidos', correct: '⚠️ Peligroso' },
        { text: 'Usar un antivirus actualizado', correct: '✅ Seguro' },
        { text: 'Hacer clic en pop-ups que prometen premios', correct: '⚠️ Peligroso' },
        { text: 'Hacer copia de seguridad de tus archivos', correct: '✅ Seguro' },
      ],
      xp: 25
    },
    {
      title: 'Clasifica por SISTEMA OPERATIVO',
      categories: { '🪟 Windows': [], '🍎 Apple': [], '🐧 Linux': [] },
      items: [
        { text: 'Windows 10', correct: '🪟 Windows' },
        { text: 'macOS Sonoma', correct: '🍎 Apple' },
        { text: 'Ubuntu', correct: '🐧 Linux' },
        { text: 'Windows 11', correct: '🪟 Windows' },
        { text: 'iOS', correct: '🍎 Apple' },
        { text: 'Fedora', correct: '🐧 Linux' },
      ],
      xp: 25
    },
  ];

  // ==========================================
  // MINI CHALLENGES — Retos rápidos (5 retos)
  // ==========================================
  const MINI_CHALLENGES = [
    {
      title: '🔤 Escribe 3 atajos de teclado',
      description: 'Escribe 3 combinaciones de Ctrl + (letra) que conozcas, separadas por comas. Ejemplo: Ctrl+C, Ctrl+V, Ctrl+Z',
      check: (answer) => {
        const parts = answer.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
        const validShortcuts = ['ctrl+c', 'ctrl+v', 'ctrl+z', 'ctrl+s', 'ctrl+a', 'ctrl+b', 'ctrl+i', 'ctrl+u', 'ctrl+p', 'ctrl+f', 'ctrl+x', 'ctrl+n', 'ctrl+w'];
        const correct = parts.filter(p => validShortcuts.includes(p));
        return { correct: correct.length >= 3, earned: correct.length, total: 3, feedback: correct.length >= 3 ? `¡Excelente! Escribiste ${correct.length} atajos correctos.` : `Solo ${correct.length} de 3 son correctos. Ejemplos válidos: Ctrl+C, Ctrl+V, Ctrl+Z` };
      },
      xp: 30
    },
    {
      title: '📦 Escribe 3 extensiones de archivo',
      description: 'Escribe 3 extensiones de archivo que conozcas (con punto), separadas por comas. Ejemplo: .jpg, .pdf, .docx',
      check: (answer) => {
        const parts = answer.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
        const validExt = ['.jpg', '.png', '.gif', '.pdf', '.docx', '.xlsx', '.pptx', '.txt', '.mp3', '.mp4', '.avi', '.zip', '.exe', '.html', '.css', '.js'];
        const correct = parts.filter(p => validExt.includes(p));
        return { correct: correct.length >= 3, earned: correct.length, total: 3, feedback: correct.length >= 3 ? `¡Perfecto! ${correct.length} extensiones correctas.` : `${correct.length} de 3 correctas. Ejemplos: .jpg, .pdf, .docx, .mp4` };
      },
      xp: 25
    },
    {
      title: '🖱️ Nombra 3 dispositivos de entrada',
      description: 'Escribe 3 dispositivos de ENTRADA separados por comas. Ejemplo: teclado, mouse, micrófono',
      check: (answer) => {
        const lower = answer.toLowerCase();
        const entrada = ['teclado', 'mouse', 'micrófono', 'webcam', 'escáner', 'lector de código', 'tableta', 'joystick', 'mando', 'touchpad'];
        const found = entrada.filter(d => lower.includes(d));
        return { correct: found.length >= 3, earned: found.length, total: 3, feedback: found.length >= 3 ? `¡Muy bien! Encontré: ${found.join(', ')}` : `Solo ${found.length} de 3. Ejemplos: teclado, mouse, micrófono, webcam` };
      },
      xp: 25
    },
    {
      title: '🔒 Escribe 3 reglas de seguridad digital',
      description: 'Escribe 3 cosas que debes hacer para navegar seguro en internet (separadas por punto y coma)',
      check: (answer) => {
        const lower = answer.toLowerCase();
        const keywords = ['contraseña', 'https', 'antivirus', 'actualizar', 'compartir', 'phishing', 'copia de seguridad', 'personal', 'desconocido', 'firewall'];
        const found = keywords.filter(k => lower.includes(k));
        return { correct: found.length >= 2, earned: found.length >= 3 ? 3 : found.length, total: 3, feedback: found.length >= 2 ? `¡Bien! Tu respuesta menciona conceptos de seguridad importantes.` : `Intenta mencionar: contraseñas seguras, HTTPS, antivirus, no compartir datos personales.` };
      },
      xp: 30
    },
    {
      title: '📧 Describe los pasos para enviar un email',
      description: 'Escribe los pasos para enviar un correo electrónico en orden (separados por punto y coma)',
      check: (answer) => {
        const lower = answer.toLowerCase();
        const steps = ['abrir', 'redactar', 'destinatario', 'asunto', 'mensaje', 'enviar'];
        const found = steps.filter(s => lower.includes(s));
        return { correct: found.length >= 4, earned: found.length, total: 6, feedback: found.length >= 4 ? `¡Genial! Mencionaste ${found.length} pasos clave.` : `Intenta mencionar: abrir correo, redactar, escribir destinatario, asunto, mensaje y enviar.` };
      },
      xp: 30
    },
  ];

  // ==========================================
  // ESTADO LOCAL (sin Store)
  // ==========================================
  let _exerciseState = {
    type: null, questionIndex: 0, score: 0, answers: [],
    matchSelectedLeftIndex: null, matchedPairs: 0,
    orderCurrentStep: 0, orderCorrectOrder: [],
  };

  function getExerciseState() { return { ..._exerciseState }; }
  function setExerciseState(updates) { _exerciseState = { ..._exerciseState, ...updates }; }

  // ==========================================
  // RENDERIZAR SELECCIÓN DE CATEGORÍA
  // ==========================================
  function renderCategorySelect() {
    const container = document.getElementById('exerciseContainer');
    if (!container) return;
    container.innerHTML = `
      <div class="ex-welcome">
        <span class="ex-welcome-icon">INFOMATICLAB</span>
        <h2>¿Qué quieres practicar?</h2>
        <p>Elige un tipo de ejercicio para comenzar</p>
        <div class="ex-types">
          <button class="ex-type-btn" onclick="Exercises.start('quiz')"><span>❓</span> Quiz mixto</button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-word')"><span>📄</span> Word</button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-hardware')"><span>🖥️</span> Hardware</button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-internet')"><span>🌐</span> Internet</button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-security')"><span>🔒</span> Seguridad</button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-shortcuts')"><span>⌨️</span> Atajos</button>
          <button class="ex-type-btn" onclick="Exercises.start('quiz-excel')"><span>📊</span> Excel</button>
          <button class="ex-type-btn" onclick="Exercises.start('fill')"><span>✏️</span> Completar</button>
          <button class="ex-type-btn" onclick="Exercises.start('match')"><span>🔗</span> Unir conceptos</button>
          <button class="ex-type-btn" onclick="Exercises.start('order')"><span>🔢</span> Ordenar pasos</button>
          <button class="ex-type-btn" onclick="Exercises.start('truefalse')"><span>✔️</span> Verdadero/Falso</button>
          <button class="ex-type-btn" onclick="Exercises.start('finderror')"><span>🔍</span> Detectar error</button>
          <button class="ex-type-btn" onclick="Exercises.start('scenario')"><span>🎭</span> Escenarios</button>
          <button class="ex-type-btn" onclick="Exercises.start('classify')"><span>📂</span> Clasificar</button>
          <button class="ex-type-btn" onclick="Exercises.start('challenge')"><span>🏆</span> Retos</button>
        </div>
      </div>`;
  }

  function renderWelcome() { renderCategorySelect(); }

  // ==========================================
  // INICIAR EJERCICIO
  // ==========================================
  function start(type) {
    setExerciseState({ type, questionIndex: 0, score: 0, answers: [], matchSelectedLeftIndex: null, matchedPairs: 0, orderCurrentStep: 0 });
    if (type === 'quiz' || type.startsWith('quiz-')) renderQuiz();
    else if (type === 'fill') renderFill();
    else if (type === 'match') renderMatch();
    else if (type === 'order') renderOrder();
    else if (type === 'truefalse') renderTrueFalse();
    else if (type === 'finderror') renderFindError();
    else if (type === 'scenario') renderScenario();
    else if (type === 'classify') renderClassify();
    else if (type === 'challenge') renderMiniChallenge();
  }

  function getQuizQuestions(type) {
    if (type === 'quiz') return [...QUIZ_BANK].sort(() => Math.random() - 0.5);
    const cat = type.replace('quiz-', '');
    return QUIZ_BANK.filter(q => q.cat === cat).sort(() => Math.random() - 0.5);
  }

  // ==========================================
  // QUIZ
  // ==========================================
  function renderQuiz() {
    const state = getExerciseState();
    const questions = getQuizQuestions(state.type);
    if (state.questionIndex >= questions.length) { showQuizResults(state.score, questions); return; }
    const question = questions[state.questionIndex];
    const container = document.getElementById('exerciseContainer');
    const progress = Math.round((state.questionIndex / questions.length) * 100);
    const catInfo = CATEGORIES[question.cat] || CATEGORIES.general;
    container.innerHTML = `
      <div class="ex-progress-bar"><div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div><span class="ex-prog-label">${state.questionIndex + 1} / ${questions.length}</span></div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:${catInfo.color};text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">${catInfo.icon} ${catInfo.name} — Pregunta ${state.questionIndex + 1}</div>
        <div class="quiz-q-text">${question.q}</div>
        <div class="quiz-options">${question.options.map((opt, i) => `<button class="quiz-option" onclick="Exercises.handleQuizAnswer(${i})"><span style="margin-right:8px;font-weight:700;color:var(--text-3)">${String.fromCharCode(65 + i)}.</span>${opt}</button>`).join('')}</div>
        <div class="quiz-feedback hidden" id="quizFeedback"></div>
      </div>`;
  }

  function handleQuizAnswer(selected) {
    const state = getExerciseState();
    const questions = getQuizQuestions(state.type);
    const question = questions[state.questionIndex];
    if (!question) return;
    document.querySelectorAll('.quiz-option').forEach(o => o.disabled = true);
    const feedback = document.getElementById('quizFeedback');
    const isCorrect = selected === question.correct;
    document.querySelectorAll('.quiz-option')[selected].classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) document.querySelectorAll('.quiz-option')[question.correct].classList.add('correct');
    feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct-msg' : 'wrong-msg');
    feedback.innerHTML = isCorrect ? `✅ ¡Correcto! <span style="color:var(--brand-accent);font-weight:700">+${question.xp} XP</span>` : `❌ La respuesta era: <strong>${question.options[question.correct]}</strong>`;
    feedback.classList.remove('hidden');
    setExerciseState({ score: isCorrect ? state.score + question.xp : state.score });
    setTimeout(() => { setExerciseState({ questionIndex: state.questionIndex + 1 }); renderQuiz(); }, 1600);
  }

  function showQuizResults(score, questions) {
    const container = document.getElementById('exerciseContainer');
    const maxScore = questions.reduce((s, q) => s + q.xp, 0);
    const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const isPerfect = percent === 100;
    const emoji = percent === 100 ? '🏆' : percent >= 80 ? '⭐' : percent >= 60 ? '👍' : '💪';
    const msg = percent === 100 ? '¡Perfecto!' : percent >= 80 ? '¡Excelente!' : percent >= 60 ? '¡Buen intento!' : '¡Sigue practicando!';
    container.innerHTML = `<div style="text-align:center;padding:40px;max-width:500px;margin:0 auto">
      <div style="font-size:4rem;margin-bottom:16px">${emoji}</div><h2>${msg}</h2>
      <div style="font-size:3rem;font-weight:800;color:var(--brand-accent);margin:20px 0">${percent}%</div>
      <p style="color:var(--text-2)">Puntuación: <strong>${score} / ${maxScore} XP</strong></p>
      <p style="color:var(--text-2);margin-bottom:24px">${questions.length} preguntas</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-ghost" onclick="Exercises.renderWelcome()">← Volver</button>
        <button class="btn btn-ghost" onclick="Exercises.start('${getExerciseState().type}')">🔄 Repetir</button>
        <button class="btn btn-primary" onclick="Exercises.claimXp(${score}, ${isPerfect})">Cobrar +${score} XP →</button>
      </div></div>`;
  }

  async function claimXp(xpAmount, isPerfect) {
    const state = Store.getState();
    if (!state.currentUser || !state.isAuthenticated) { showToast('error', 'Debes iniciar sesión'); return; }
    await Progress.updateUserProgress('quiz_complete', { xp: xpAmount, isPerfect });
    showToast('success', `+${xpAmount} XP`, '¡Progreso guardado!');
    renderCategorySelect();
  }

  // ==========================================
  // FILL
  // ==========================================
  function renderFill() {
    const state = getExerciseState();
    if (state.questionIndex >= FILL_EXERCISES.length) { showFillResults(state.score); return; }
    const exercise = FILL_EXERCISES[state.questionIndex];
    const container = document.getElementById('exerciseContainer');
    const progress = Math.round((state.questionIndex / FILL_EXERCISES.length) * 100);
    const shuffled = [...exercise.alternatives].sort(() => Math.random() - 0.5);
    container.innerHTML = `
      <div class="ex-progress-bar"><div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div><span class="ex-prog-label">${state.questionIndex + 1} / ${FILL_EXERCISES.length}</span></div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">✏️ Completa el texto</div>
        <div class="quiz-q-text" style="font-size:1.1rem;margin-bottom:24px">${exercise.text}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${shuffled.map(alt => `<button class="quiz-option" style="text-align:center" onclick="Exercises.handleFillAnswer(this, '${alt}')">${alt}</button>`).join('')}</div>
        <div style="margin-top:16px;font-size:0.8rem;color:var(--text-3)">💡 Pista: ${exercise.hint}</div>
        <div class="quiz-feedback hidden" id="fillFeedback"></div>
      </div>`;
  }

  function handleFillAnswer(button, selected) {
    const state = getExerciseState();
    const exercise = FILL_EXERCISES[state.questionIndex];
    if (!exercise) return;
    document.querySelectorAll('.quiz-option').forEach(o => o.disabled = true);
    const feedback = document.getElementById('fillFeedback');
    const isCorrect = selected === exercise.answer;
    button.classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) document.querySelectorAll('.quiz-option').forEach(o => { if (o.textContent.trim() === exercise.answer) o.classList.add('correct'); });
    feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct-msg' : 'wrong-msg');
    feedback.innerHTML = isCorrect ? `✅ ¡Correcto! <span style="color:var(--brand-accent)">+${exercise.xp} XP</span>` : `❌ Respuesta: <strong>${exercise.answer}</strong>`;
    feedback.classList.remove('hidden');
    setExerciseState({ score: isCorrect ? state.score + exercise.xp : state.score });
    setTimeout(() => { setExerciseState({ questionIndex: state.questionIndex + 1 }); renderFill(); }, 1600);
  }

  function showFillResults(score) {
    const maxScore = FILL_EXERCISES.reduce((s, e) => s + e.xp, 0);
    const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    document.getElementById('exerciseContainer').innerHTML = `<div style="text-align:center;padding:40px">
      <div style="font-size:3.5rem;margin-bottom:12px">${percent >= 75 ? '🌟' : '💪'}</div>
      <h2>${percent >= 75 ? '¡Muy bien!' : 'Buen esfuerzo'}</h2>
      <div style="font-size:2.5rem;font-weight:800;color:var(--brand-accent);margin:16px 0">${percent}%</div>
      <p style="color:var(--text-2);margin-bottom:28px">${score} / ${maxScore} XP</p>
      <div style="display:flex;gap:12px;justify-content:center">
        <button class="btn btn-ghost" onclick="Exercises.renderWelcome()">← Volver</button>
        <button class="btn btn-ghost" onclick="Exercises.start('fill')">🔄 Repetir</button>
        <button class="btn btn-primary" onclick="Exercises.claimXp(${score}, false)">Cobrar +${score} XP →</button>
      </div></div>`;
  }

  // ==========================================
  // MATCH
  // ==========================================
  let _selectedLeftIndex = null;

  function renderMatch() {
    _selectedLeftIndex = null;
    setExerciseState({ matchedPairs: 0 });
    const container = document.getElementById('exerciseContainer');
    const shuffledRight = [...MATCH_PAIRS].map((p, i) => ({ text: p.right, origIndex: i })).sort(() => Math.random() - 0.5);
    container.innerHTML = `
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">🔗 Une cada atajo con su función (${MATCH_PAIRS.length} pares)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">
          <div style="display:flex;flex-direction:column;gap:8px">${MATCH_PAIRS.map((p, i) => `<button class="quiz-option match-left" id="ml-${i}" onclick="Exercises.selectLeft(${i})" style="font-weight:700;letter-spacing:.04em">${p.left}</button>`).join('')}</div>
          <div style="display:flex;flex-direction:column;gap:8px">${shuffledRight.map((p, i) => `<button class="quiz-option match-right" id="mr-${i}" data-orig="${p.origIndex}" onclick="Exercises.selectRight(${i})" style="font-size:0.85rem">${p.text}</button>`).join('')}</div>
        </div>
        <div style="margin-top:16px;font-size:0.85rem;color:var(--text-3)">Emparejados: <span id="matchCount" style="font-weight:700;color:var(--brand-accent)">0</span> / ${MATCH_PAIRS.length}</div>
      </div>`;
  }

  function selectLeft(index) {
    if (_selectedLeftIndex !== null) { const prev = document.getElementById('ml-' + _selectedLeftIndex); if (prev) prev.style.borderColor = ''; }
    const btn = document.getElementById('ml-' + index);
    if (!btn || btn.disabled) return;
    _selectedLeftIndex = index;
    btn.style.borderColor = 'var(--brand-1)';
  }

  function selectRight(rightIndex) {
    if (_selectedLeftIndex === null) return;
    const leftBtn = document.getElementById('ml-' + _selectedLeftIndex);
    const rightBtn = document.getElementById('mr-' + rightIndex);
    if (!leftBtn || !rightBtn || leftBtn.disabled || rightBtn.disabled) return;
    const leftIdx = _selectedLeftIndex;
    const rightOrigIdx = parseInt(rightBtn.dataset.orig);
    const isCorrect = rightOrigIdx === leftIdx;
    if (isCorrect) {
      leftBtn.classList.add('correct'); rightBtn.classList.add('correct');
      leftBtn.disabled = true; rightBtn.disabled = true;
      const state = getExerciseState();
      const newMatched = (state.matchedPairs || 0) + 1;
      setExerciseState({ matchedPairs: newMatched });
      const counter = document.getElementById('matchCount');
      if (counter) counter.textContent = newMatched;
      showXpGain(15);
      if (newMatched === MATCH_PAIRS.length) {
        const totalXp = MATCH_PAIRS.length * 15;
        setTimeout(() => { showToast('success', '¡Completado!', '+' + totalXp + ' XP'); showMatchResults(totalXp); }, 800);
      }
    } else {
      leftBtn.classList.add('wrong'); rightBtn.classList.add('wrong');
      setTimeout(() => { leftBtn.classList.remove('wrong'); rightBtn.classList.remove('wrong'); leftBtn.style.borderColor = ''; }, 600);
    }
    _selectedLeftIndex = null;
  }

  function showMatchResults(totalXp) {
    document.getElementById('exerciseContainer').innerHTML = `<div style="text-align:center;padding:40px">
      <div style="font-size:3.5rem;margin-bottom:12px">🔗✅</div><h2>¡Todos los pares correctos!</h2>
      <div style="font-size:2.5rem;font-weight:800;color:var(--brand-accent);margin:16px 0">+${totalXp} XP</div>
      <p style="color:var(--text-2);margin-bottom:28px">${MATCH_PAIRS.length} pares emparejados</p>
      <div style="display:flex;gap:12px;justify-content:center">
        <button class="btn btn-ghost" onclick="Exercises.renderWelcome()">← Volver</button>
        <button class="btn btn-ghost" onclick="Exercises.start('match')">🔄 Repetir</button>
        <button class="btn btn-primary" onclick="Exercises.claimXp(${totalXp}, true)">Cobrar +${totalXp} XP →</button>
      </div></div>`;
  }

  // ==========================================
  // ORDER
  // ==========================================
  let _orderState = { exerciseIndex: 0, selectedOrder: [], available: [] };

  function renderOrder() {
    const state = getExerciseState();
    if (state.questionIndex >= ORDER_EXERCISES.length) { showOrderResults(state.score); return; }
    const exercise = ORDER_EXERCISES[state.questionIndex];
    const container = document.getElementById('exerciseContainer');
    const shuffled = exercise.steps.map((s, i) => ({ text: s, correctIndex: i })).sort(() => Math.random() - 0.5);
    _orderState = { exerciseIndex: state.questionIndex, selectedOrder: [], available: shuffled.map((s, i) => ({ ...s, uid: i })) };
    const progress = Math.round((state.questionIndex / ORDER_EXERCISES.length) * 100);
    container.innerHTML = `
      <div class="ex-progress-bar"><div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div><span class="ex-prog-label">${state.questionIndex + 1} / ${ORDER_EXERCISES.length}</span></div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">🔢 Ordena los pasos</div>
        <div class="quiz-q-text" style="margin-bottom:20px">${exercise.title}</div>
        <p style="font-size:0.85rem;color:var(--text-3);margin-bottom:16px">Haz clic en los pasos en el orden correcto:</p>
        <div id="orderSelected" style="min-height:48px;margin-bottom:16px;display:flex;flex-direction:column;gap:6px">
          <div style="font-size:0.75rem;color:var(--text-3);font-style:italic;padding:12px;text-align:center;border:1px dashed var(--border);border-radius:10px" id="orderPlaceholder">Haz clic en el paso 1...</div>
        </div>
        <div id="orderAvailable" style="display:flex;flex-direction:column;gap:6px">${_orderState.available.map((s, i) => `<button class="quiz-option order-step" id="os-${i}" onclick="Exercises.selectOrderStep(${i})">${s.text}</button>`).join('')}</div>
        <div style="margin-top:12px;font-size:0.8rem;color:var(--text-3)">💡 Pista: ${exercise.hint}</div>
        <div class="quiz-feedback hidden" id="orderFeedback"></div>
      </div>`;
  }

  function selectOrderStep(uid) {
    const btn = document.getElementById('os-' + uid);
    if (!btn || btn.disabled) return;
    const step = _orderState.available.find(s => s.uid === uid);
    if (!step) return;
    _orderState.selectedOrder.push(step);
    btn.disabled = true; btn.style.opacity = '0.3';
    const placeholder = document.getElementById('orderPlaceholder');
    if (placeholder) placeholder.remove();
    const selectedDiv = document.getElementById('orderSelected');
    const stepEl = document.createElement('div');
    stepEl.className = 'quiz-option correct'; stepEl.style.textAlign = 'center'; stepEl.style.cursor = 'default';
    stepEl.innerHTML = '<strong>' + _orderState.selectedOrder.length + '.</strong> ' + step.text;
    selectedDiv.appendChild(stepEl);
    const exercise = ORDER_EXERCISES[_orderState.exerciseIndex];
    if (_orderState.selectedOrder.length === exercise.steps.length) { verifyOrder(); }
    else {
      const p = document.createElement('div');
      p.id = 'orderPlaceholder'; p.style.cssText = 'font-size:0.75rem;color:var(--text-3);font-style:italic;padding:8px;text-align:center';
      p.textContent = 'Haz clic en el paso ' + (_orderState.selectedOrder.length + 1) + '...';
      selectedDiv.appendChild(p);
    }
  }

  function verifyOrder() {
    const exercise = ORDER_EXERCISES[_orderState.exerciseIndex];
    const feedback = document.getElementById('orderFeedback');
    let correctCount = 0;
    _orderState.selectedOrder.forEach((step, i) => { if (step.correctIndex === i) correctCount++; });
    const allCorrect = correctCount === exercise.steps.length;
    const earnedXp = allCorrect ? exercise.xp : Math.round(exercise.xp * (correctCount / exercise.steps.length));
    feedback.className = 'quiz-feedback ' + (allCorrect ? 'correct-msg' : 'wrong-msg');
    feedback.innerHTML = allCorrect
      ? '✅ ¡Orden perfecto! <span style="color:var(--brand-accent);font-weight:700">+' + earnedXp + ' XP</span>'
      : '❌ ' + correctCount + ' de ' + exercise.steps.length + ' correctos. Orden:<br><br>' + exercise.steps.map((s, i) => '<strong>' + (i + 1) + '.</strong> ' + s).join('<br>');
    feedback.classList.remove('hidden');
    setExerciseState({ score: getExerciseState().score + earnedXp });
    setTimeout(() => { setExerciseState({ questionIndex: getExerciseState().questionIndex + 1 }); renderOrder(); }, allCorrect ? 1800 : 4000);
  }

  function showOrderResults(score) {
    const maxScore = ORDER_EXERCISES.reduce((s, e) => s + e.xp, 0);
    const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    document.getElementById('exerciseContainer').innerHTML = `<div style="text-align:center;padding:40px">
      <div style="font-size:3.5rem;margin-bottom:12px">${percent >= 75 ? '🔢✨' : '💪'}</div>
      <h2>${percent >= 75 ? '¡Excelente!' : 'Sigue practicando'}</h2>
      <div style="font-size:2.5rem;font-weight:800;color:var(--brand-accent);margin:16px 0">${percent}%</div>
      <p style="color:var(--text-2);margin-bottom:28px">${score} / ${maxScore} XP</p>
      <div style="display:flex;gap:12px;justify-content:center">
        <button class="btn btn-ghost" onclick="Exercises.renderWelcome()">← Volver</button>
        <button class="btn btn-ghost" onclick="Exercises.start('order')">🔄 Repetir</button>
        <button class="btn btn-primary" onclick="Exercises.claimXp(${score}, false)">Cobrar +${score} XP →</button>
      </div></div>`;
  }

  // ==========================================
  // TRUE / FALSE
  // ==========================================
  function renderTrueFalse() {
    const state = getExerciseState();
    const questions = [...TRUE_FALSE].sort(() => Math.random() - 0.5);
    if (state.questionIndex >= questions.length) { showGenericResults(state.score, questions.reduce((s, q) => s + q.xp, 0), questions.length, 'truefalse', 'Verdadero/Falso'); return; }
    const question = questions[state.questionIndex];
    const container = document.getElementById('exerciseContainer');
    const progress = Math.round((state.questionIndex / questions.length) * 100);
    container.innerHTML = `
      <div class="ex-progress-bar"><div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div><span class="ex-prog-label">${state.questionIndex + 1} / ${questions.length}</span></div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">✔️ Verdadero o Falso — Pregunta ${state.questionIndex + 1}</div>
        <div class="quiz-q-text">${question.q}</div>
        <div class="quiz-options" style="flex-direction:row;gap:12px">
          <button class="quiz-option" style="flex:1;text-align:center;font-size:1.1rem" onclick="Exercises.handleTrueFalseAnswer(true)">
            ✅ Verdadero
          </button>
          <button class="quiz-option" style="flex:1;text-align:center;font-size:1.1rem" onclick="Exercises.handleTrueFalseAnswer(false)">
            ❌ Falso
          </button>
        </div>
        <div class="quiz-feedback hidden" id="tfFeedback"></div>
      </div>`;
    // Guardar pregunta actual para el handler
    setExerciseState({ _currentQuestions: questions });
  }

  function handleTrueFalseAnswer(selected) {
    const state = getExerciseState();
    const questions = state._currentQuestions || [...TRUE_FALSE];
    const question = questions[state.questionIndex];
    if (!question) return;
    document.querySelectorAll('.quiz-option').forEach(o => o.disabled = true);
    const feedback = document.getElementById('tfFeedback');
    const isCorrect = selected === question.correct;
    const btns = document.querySelectorAll('.quiz-option');
    if (selected === true) btns[0].classList.add(isCorrect ? 'correct' : 'wrong');
    else btns[1].classList.add(isCorrect ? 'correct' : 'wrong');
    feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct-msg' : 'wrong-msg');
    feedback.innerHTML = isCorrect
      ? `✅ ¡Correcto! <span style="color:var(--brand-accent);font-weight:700">+${question.xp} XP</span><br><span style="font-size:0.8rem;opacity:0.8">${question.explanation}</span>`
      : `❌ Incorrecto. ${question.explanation}`;
    feedback.classList.remove('hidden');
    setExerciseState({ score: isCorrect ? state.score + question.xp : state.score });
    setTimeout(() => { setExerciseState({ questionIndex: state.questionIndex + 1 }); renderTrueFalse(); }, 2000);
  }

  // ==========================================
  // FIND ERROR
  // ==========================================
  function renderFindError() {
    const state = getExerciseState();
    const questions = [...FIND_ERROR].sort(() => Math.random() - 0.5);
    if (state.questionIndex >= questions.length) { showGenericResults(state.score, questions.reduce((s, q) => s + q.xp, 0), questions.length, 'finderror', 'Detectar error'); return; }
    const question = questions[state.questionIndex];
    const container = document.getElementById('exerciseContainer');
    const progress = Math.round((state.questionIndex / questions.length) * 100);
    const shuffled = [...question.options].sort(() => Math.random() - 0.5);
    container.innerHTML = `
      <div class="ex-progress-bar"><div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div><span class="ex-prog-label">${state.questionIndex + 1} / ${questions.length}</span></div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:#F59E0B;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">🔍 Detecta el error — Pregunta ${state.questionIndex + 1}</div>
        <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:16px;margin-bottom:20px;font-size:1.1rem;text-align:center">
          <span style="color:#FCA5A5;text-decoration:line-through;font-weight:700">${question.text}</span>
        </div>
        <p style="font-size:0.85rem;color:var(--text-2);margin-bottom:12px">¿Cuál es la corrección correcta?</p>
        <div class="quiz-options">${shuffled.map(opt => `<button class="quiz-option" style="text-align:center" onclick="Exercises.handleFindError('${opt.replace(/'/g, "\\'")}')">${opt}</button>`).join('')}</div>
        <div style="margin-top:12px;font-size:0.8rem;color:var(--text-3)">💡 Pista: ${question.hint}</div>
        <div class="quiz-feedback hidden" id="feFeedback"></div>
      </div>`;
    setExerciseState({ _currentQuestions: questions });
  }

  function handleFindError(selected) {
    const state = getExerciseState();
    const questions = state._currentQuestions || FIND_ERROR;
    const question = questions[state.questionIndex];
    if (!question) return;
    document.querySelectorAll('.quiz-option').forEach(o => o.disabled = true);
    const feedback = document.getElementById('feFeedback');
    const isCorrect = selected === question.correct;
    document.querySelectorAll('.quiz-option').forEach(o => {
      if (o.textContent.trim() === question.correct) o.classList.add('correct');
      if (o.textContent.trim() === selected && !isCorrect) o.classList.add('wrong');
    });
    feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct-msg' : 'wrong-msg');
    feedback.innerHTML = isCorrect
      ? `✅ ¡Correcto! La forma correcta es: "${question.correct}" <span style="color:var(--brand-accent);font-weight:700">+${question.xp} XP</span>`
      : `❌ La corrección es: <strong>${question.correct}</strong>`;
    feedback.classList.remove('hidden');
    setExerciseState({ score: isCorrect ? state.score + question.xp : state.score });
    setTimeout(() => { setExerciseState({ questionIndex: state.questionIndex + 1 }); renderFindError(); }, 1800);
  }

  // ==========================================
  // SCENARIOS
  // ==========================================
  function renderScenario() {
    const state = getExerciseState();
    const questions = [...SCENARIOS].sort(() => Math.random() - 0.5);
    if (state.questionIndex >= questions.length) { showGenericResults(state.score, questions.reduce((s, q) => s + q.xp, 0), questions.length, 'scenario', 'Escenarios'); return; }
    const question = questions[state.questionIndex];
    const container = document.getElementById('exerciseContainer');
    const progress = Math.round((state.questionIndex / questions.length) * 100);
    container.innerHTML = `
      <div class="ex-progress-bar"><div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div><span class="ex-prog-label">${state.questionIndex + 1} / ${questions.length}</span></div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:#8B5CF6;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">🎭 Escenario ${state.questionIndex + 1}</div>
        <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.15);border-radius:12px;padding:16px;margin-bottom:20px;font-size:0.95rem;line-height:1.6;color:var(--text-1)">
          ${question.situation}
        </div>
        <div class="quiz-q-text" style="font-size:1rem">${question.question}</div>
        <div class="quiz-options">${question.options.map((opt, i) => `<button class="quiz-option" onclick="Exercises.handleScenarioAnswer(${i})"><span style="margin-right:8px;font-weight:700;color:var(--text-3)">${String.fromCharCode(65 + i)}.</span>${opt}</button>`).join('')}</div>
        <div class="quiz-feedback hidden" id="scFeedback"></div>
      </div>`;
    setExerciseState({ _currentQuestions: questions });
  }

  function handleScenarioAnswer(selected) {
    const state = getExerciseState();
    const questions = state._currentQuestions || SCENARIOS;
    const question = questions[state.questionIndex];
    if (!question) return;
    document.querySelectorAll('.quiz-option').forEach(o => o.disabled = true);
    const feedback = document.getElementById('scFeedback');
    const isCorrect = selected === question.correct;
    document.querySelectorAll('.quiz-option')[selected].classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) document.querySelectorAll('.quiz-option')[question.correct].classList.add('correct');
    feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct-msg' : 'wrong-msg');
    feedback.innerHTML = isCorrect
      ? `✅ ¡Buena decisión! <span style="color:var(--brand-accent);font-weight:700">+${question.xp} XP</span>`
      : `❌ La mejor opción era: <strong>${question.options[question.correct]}</strong>`;
    feedback.classList.remove('hidden');
    setExerciseState({ score: isCorrect ? state.score + question.xp : state.score });
    setTimeout(() => { setExerciseState({ questionIndex: state.questionIndex + 1 }); renderScenario(); }, 2000);
  }

  // ==========================================
  // CLASSIFY
  // ==========================================
  let _classifyState = { exerciseIndex: 0, placed: {}, correctCount: 0 };

  function renderClassify() {
    const state = getExerciseState();
    if (state.questionIndex >= CLASSIFY.length) { showGenericResults(state.score, CLASSIFY.reduce((s, e) => s + e.xp, 0), CLASSIFY.length, 'classify', 'Clasificar'); return; }
    const exercise = CLASSIFY[state.questionIndex];
    const container = document.getElementById('exerciseContainer');
    const progress = Math.round((state.questionIndex / CLASSIFY.length) * 100);
    const catKeys = Object.keys(exercise.categories);
    const shuffledItems = [...exercise.items].sort(() => Math.random() - 0.5);
    _classifyState = { exerciseIndex: state.questionIndex, placed: {}, correctCount: 0, totalItems: exercise.items.length };
    container.innerHTML = `
      <div class="ex-progress-bar"><div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div><span class="ex-prog-label">${state.questionIndex + 1} / ${CLASSIFY.length}</span></div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:#06B6D4;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">📂 Clasificar — ${exercise.title}</div>
        <p style="font-size:0.85rem;color:var(--text-2);margin-bottom:16px">Haz clic en cada elemento y luego en la categoría correcta:</p>
        <div style="display:grid;grid-template-columns:repeat(${catKeys.length}, 1fr);gap:10px;margin-bottom:16px">
          ${catKeys.map(cat => `
            <div style="background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.15);border-radius:12px;padding:12px;text-align:center">
              <div style="font-weight:700;font-size:0.9rem;margin-bottom:8px">${cat}</div>
              <div id="cat-${cat.replace(/[^a-zA-Z0-9]/g, '')}" style="min-height:30px;display:flex;flex-direction:column;gap:4px;font-size:0.8rem;color:var(--text-2)"></div>
            </div>
          `).join('')}
        </div>
        <div id="classifyItems" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:16px">
          ${shuffledItems.map((item, i) => `
            <button class="quiz-option classify-item" id="ci-${i}" data-text="${item.text}" data-correct="${item.correct}" onclick="Exercises.selectClassifyItem(this)" style="padding:8px 16px;font-size:0.85rem">
              ${item.text}
            </button>
          `).join('')}
        </div>
        <div id="classifyCatBtns" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px">
          ${catKeys.map(cat => `
            <button class="btn btn-ghost btn-sm classify-cat-btn" data-cat="${cat}" onclick="Exercises.placeInCategory('${cat}')" style="font-size:0.8rem">${cat}</button>
          `).join('')}
        </div>
        <div class="quiz-feedback hidden" id="clFeedback"></div>
      </div>`;
    setExerciseState({ _classifyItem: null });
  }

  let _classifySelectedItem = null;

  function selectClassifyItem(btn) {
    document.querySelectorAll('.classify-item').forEach(b => b.style.borderColor = '');
    if (btn.disabled) return;
    _classifySelectedItem = btn;
    btn.style.borderColor = 'var(--brand-1)';
  }

  function placeInCategory(cat) {
    if (!_classifySelectedItem) return;
    const btn = _classifySelectedItem;
    const correct = btn.dataset.correct;
    const isCorrect = correct === cat;
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.borderColor = '';
    const catId = 'cat-' + cat.replace(/[^a-zA-Z0-9]/g, '');
    const catDiv = document.getElementById(catId);
    if (catDiv) {
      const tag = document.createElement('span');
      tag.textContent = btn.dataset.text;
      tag.style.cssText = isCorrect ? 'color:#6EE7B7;font-size:0.8rem' : 'color:#FCA5A5;font-size:0.8rem;text-decoration:line-through';
      catDiv.appendChild(tag);
    }
    if (isCorrect) _classifyState.correctCount++;
    _classifySelectedItem = null;
    const remaining = document.querySelectorAll('.classify-item:not([disabled])');
    if (remaining.length === 0) {
      finishClassify();
    }
  }

  function finishClassify() {
    const state = getExerciseState();
    const exercise = CLASSIFY[_classifyState.exerciseIndex];
    const feedback = document.getElementById('clFeedback');
    const allCorrect = _classifyState.correctCount === _classifyState.totalItems;
    const earnedXp = allCorrect ? exercise.xp : Math.round(exercise.xp * (_classifyState.correctCount / _classifyState.totalItems));
    feedback.className = 'quiz-feedback ' + (allCorrect ? 'correct-msg' : 'wrong-msg');
    feedback.innerHTML = allCorrect
      ? `✅ ¡Todas correctas! <span style="color:var(--brand-accent);font-weight:700">+${earnedXp} XP</span>`
      : `${_classifyState.correctCount} de ${_classifyState.totalItems} correctas. <span style="color:var(--brand-accent)">+${earnedXp} XP</span>`;
    feedback.classList.remove('hidden');
    setExerciseState({ score: state.score + earnedXp });
    setTimeout(() => { setExerciseState({ questionIndex: state.questionIndex + 1 }); renderClassify(); }, 2000);
  }

  // ==========================================
  // MINI CHALLENGES
  // ==========================================
  function renderMiniChallenge() {
    const state = getExerciseState();
    if (state.questionIndex >= MINI_CHALLENGES.length) { showGenericResults(state.score, MINI_CHALLENGES.reduce((s, e) => s + e.xp, 0), MINI_CHALLENGES.length, 'challenge', 'Retos'); return; }
    const challenge = MINI_CHALLENGES[state.questionIndex];
    const container = document.getElementById('exerciseContainer');
    const progress = Math.round((state.questionIndex / MINI_CHALLENGES.length) * 100);
    container.innerHTML = `
      <div class="ex-progress-bar"><div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div><span class="ex-prog-label">${state.questionIndex + 1} / ${MINI_CHALLENGES.length}</span></div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:#F59E0B;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">🏆 Reto ${state.questionIndex + 1}</div>
        <div class="quiz-q-text" style="font-size:1.1rem">${challenge.title}</div>
        <p style="color:var(--text-2);margin-bottom:16px;font-size:0.9rem;line-height:1.5">${challenge.description}</p>
        <textarea id="challengeInput" placeholder="Escribe tu respuesta aquí..." style="width:100%;min-height:80px;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-1);font-family:var(--font-body);font-size:0.9rem;resize:vertical;outline:none"></textarea>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn btn-primary" onclick="Exercises.handleMiniChallenge()" style="flex:1">✅ Verificar respuesta</button>
        </div>
        <div class="quiz-feedback hidden" id="mcFeedback"></div>
      </div>`;
  }

  function handleMiniChallenge() {
    const input = document.getElementById('challengeInput');
    if (!input) return;
    const answer = input.value.trim();
    if (!answer) { input.style.borderColor = 'var(--brand-danger)'; return; }
    const state = getExerciseState();
    const challenge = MINI_CHALLENGES[state.questionIndex];
    if (!challenge) return;
    const result = challenge.check(answer);
    const feedback = document.getElementById('mcFeedback');
    const earnedXp = result.correct ? challenge.xp : Math.round(challenge.xp * 0.3);
    feedback.className = 'quiz-feedback ' + (result.correct ? 'correct-msg' : 'wrong-msg');
    feedback.innerHTML = result.correct
      ? `✅ ${result.feedback} <span style="color:var(--brand-accent);font-weight:700">+${earnedXp} XP</span>`
      : `⚠️ ${result.feedback} <span style="color:var(--brand-accent)">+${earnedXp} XP por intentar</span>`;
    feedback.classList.remove('hidden');
    input.disabled = true;
    document.querySelectorAll('.btn-primary').forEach(b => b.disabled = true);
    setExerciseState({ score: state.score + earnedXp });
    setTimeout(() => { setExerciseState({ questionIndex: state.questionIndex + 1 }); renderMiniChallenge(); }, 2500);
  }

  // ==========================================
  // RESULTADOS GENÉRICOS (para nuevos tipos)
  // ==========================================
  function showGenericResults(score, maxScore, totalQuestions, type, typeName) {
    const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const emoji = percent === 100 ? '🏆' : percent >= 80 ? '⭐' : percent >= 60 ? '👍' : '💪';
    const msg = percent === 100 ? '¡Perfecto!' : percent >= 80 ? '¡Excelente!' : percent >= 60 ? '¡Buen trabajo!' : '¡Sigue practicando!';
    document.getElementById('exerciseContainer').innerHTML = `<div style="text-align:center;padding:40px;max-width:500px;margin:0 auto">
      <div style="font-size:4rem;margin-bottom:16px">${emoji}</div><h2>${msg}</h2>
      <div style="font-size:3rem;font-weight:800;color:var(--brand-accent);margin:20px 0">${percent}%</div>
      <p style="color:var(--text-2)">Puntuación: <strong>${score} / ${maxScore} XP</strong></p>
      <p style="color:var(--text-2);margin-bottom:24px">${totalQuestions} ejercicios de ${typeName}</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-ghost" onclick="Exercises.renderWelcome()">← Volver</button>
        <button class="btn btn-ghost" onclick="Exercises.start('${type}')">🔄 Repetir</button>
        <button class="btn btn-primary" onclick="Exercises.claimXp(${score}, ${percent === 100})">Cobrar +${score} XP →</button>
      </div></div>`;
  }

  // ==========================================
  // EXPORTS
  // ==========================================
  return {
    CATEGORIES, QUIZ_BANK, FILL_EXERCISES, MATCH_PAIRS, ORDER_EXERCISES,
    TRUE_FALSE, FIND_ERROR, SCENARIOS, CLASSIFY, MINI_CHALLENGES,
    renderWelcome, renderCategorySelect, start, renderQuiz, handleQuizAnswer,
    renderFill, handleFillAnswer, renderMatch, selectLeft, selectRight,
    renderOrder, selectOrderStep, claimXp,
    renderTrueFalse, handleTrueFalseAnswer,
    renderFindError, handleFindError,
    renderScenario, handleScenarioAnswer,
    renderClassify, selectClassifyItem, placeInCategory,
    renderMiniChallenge, handleMiniChallenge,
  };
})();

window.Exercises = Exercises;
