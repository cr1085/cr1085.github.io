-- ================================================
-- seed-assistant-knowledge.sql
-- Datos iniciales para la base de conocimiento
-- ================================================

-- SALUDOS Y MENSAJES DE BIENVENIDA
INSERT INTO assistant_knowledge (category, subcategory, title, content, triggers, tags, priority, auto_show_section) VALUES

('greeting', 'general', 'Saludo inicial', 
'¡Hola! 👋 Soy tu asistente de InfoMática. Estoy aquí para guiarte en tu aprendizaje. Puedes preguntarme cualquier cosa sobre los módulos, las actividades, o pedirme que te explique qué hacer primero. ¡Empecemos!',
ARRAY['hola', 'buenos dias', 'buenas tardes', 'hey', 'hi', 'saludos', 'que tal'],
ARRAY['saludo', 'bienvenida'], 10, 'dashboard'),

('greeting', 'general', 'Bienvenida nuevo usuario',
'¡Bienvenido a InfoMática! 🎓 Tu viaje de aprendizaje comienza aquí. Te recomiendo empezar con el módulo de "PC Básico" si eres nuevo, o "Mecanografía" si quieres mejorar tu velocidad de escritura. ¿Te gustaría que te guíe paso a paso?',
ARRAY['empezar', 'comenzar', 'nuevo', 'principiante', 'primera vez'],
ARRAY['nuevo', 'inicio', 'guiar'], 10, NULL),

-- NAVEGACIÓN
('navigation', 'general', 'Cómo navegar la plataforma',
'La plataforma tiene varias secciones:\n\n📌 **Inicio** → Tu dashboard principal con progreso\n📚 **Módulos** → Todas las lecciones organizadas\n🎯 **Ejercicios** → Práctica interactiva\n⌨️ **Teclado** → Práctica de mecanografía\n🖥️ **Simulador** → Práctica como si fuera real\n🏆 **Logros** → Tus insignias y premios\n🗺️ **Mi Ruta** → Tu plan de aprendizaje\n👤 **Perfil** → Tus estadísticas\n\nUsa el menú lateral para navegar entre secciones.',
ARRAY['navegar', 'menu', 'secciones', 'donde estoy', 'como usar', 'ayuda', 'como funciona'],
ARRAY['navegacion', 'menu', 'interfaz'], 8, NULL),

('navigation', 'general', 'Qué hacer primero',
'Para empezar tu camino de aprendizaje, te recomiendo este orden:\n\n1️⃣ Ve a **Módulos** → Selecciona "PC Básico"\n2️⃣ Completa la lección "Partes del Computador"\n3️⃣ Sigue con "El Escritorio" y "Archivos y Carpetas"\n4️⃣ Después pasa a **Mecanografía** para practicar escritura\n5️⃣ Luego el módulo de **Uso del Mouse**\n\nCada lección completada te da XP y desbloquea nuevas lecciones. ¡El orden importa para tu progreso!',
ARRAY['que hago', 'por donde empiezo', 'que hacer primero', 'donde empezar', 'como empiezo', 'ayuda inicial'],
ARRAY['orden', 'primero', 'inicio', 'ruta'], 10, NULL),

-- MÓDULO: PC BÁSICO
('module', 'pc_basico', 'Visión general del módulo PC Básico',
'🖥️ **Módulo PC Básico**\n\nEste módulo te enseña los fundamentos del computador. Tiene 4 lecciones:\n\n1. **Partes del Computador** → Monitor, mouse, teclado, CPU\n2. **El Escritorio** → Tu espacio de trabajo en Windows\n3. **Archivos y Carpetas** → Organizar tu información\n4. **Configuración Básica** → Personalizar tu equipo\n\n🎯 Recompensa total: ~115 XP\n⏱️ Tiempo estimado: ~40 minutos\n\nEs el primer módulo que debes completar.',
ARRAY['pc basico', 'computador', 'fundamentos', 'partes del pc', 'modulo pc'],
ARRAY['pc_basico', 'fundamentos', 'computador'], 7, NULL),

('module', 'pc_basico', 'Lección: Partes del Computador',
'🖥️ **Partes del Computador**\n\nLas partes principales son:\n\n• **Monitor** → La pantalla donde ves todo\n• **Mouse** → Controla el cursor en pantalla\n• **Teclado** → Para escribir texto\n• **Torre/CPU** → El "cerebro" del computador\n\nLa CPU es la más importante porque procesa toda la información. Sin ella, el computador no funciona.\n\n✅ Al completar esta lección ganas **25 XP**.',
ARRAY['partes computador', 'monitor', 'cpu', 'teclado', 'mouse', 'que es cpu', 'cerebro computador'],
ARRAY['pc_basico', 'partes', 'hardware', 'cpu', 'monitor'], 5, NULL),

('module', 'pc_basico', 'Lección: El Escritorio',
'🖥️ **El Escritorio de Windows**\n\nEl escritorio es tu área de trabajo principal:\n\n• **Iconos** → Imágenes que representan programas\n• **Barra de tareas** → Abajo, muestra programas abiertos\n• **Papelera de reciclaje** → Archivos eliminados\n• **Menú Inicio** → Botón para acceder a todo\n\nEsta lección usa el **Simulador de Escritorio** para que practiques en un entorno virtual.\n\n✅ Al completar ganas **30 XP**.',
ARRAY['escritorio', 'windows', 'barra tareas', 'iconos', 'papelera', 'menu inicio'],
ARRAY['pc_basico', 'escritorio', 'windows', 'simulador'], 5, NULL),

('module', 'pc_basico', 'Lección: Archivos y Carpetas',
'📁 **Archivos y Carpetas**\n\nConceptos clave:\n\n• **Archivo** → Documento, imagen, video (cualquier cosa guardada)\n• **Carpeta** → Contenedor para organizar archivos\n• **Ruta** → La dirección de un archivo (ej: Documentos/Tarea.docx)\n\nTip: Usa carpetas para organizar por tema: "Trabajo", "Estudios", "Fotos", etc.\n\n✅ Al completar ganas **35 XP**.',
ARRAY['archivos', 'carpetas', 'organizar', 'ruta', 'documentos'],
ARRAY['pc_basico', 'archivos', 'carpetas', 'organizacion'], 5, NULL),

('module', 'pc_basico', 'Lección: Configuración Básica',
'⚙️ **Configuración de Windows**\n\nPersonaliza tu equipo desde Configuración:\n\n🎨 **Apariencia** → Temas, colores, fondo\n🔊 **Sonido** → Volumen, efectos\n🖥️ **Pantalla** → Brillo, resolución\n🔒 **Privacidad** → Seguridad y datos\n\nAcceso: Botón Inicio → Configuración\n\n✅ Al completar ganas **30 XP**.',
ARRAY['configuracion', 'ajustes', 'personalizar', 'tema', 'sonido', 'pantalla'],
ARRAY['pc_basico', 'configuracion', 'personalizacion'], 5, NULL),

-- MÓDULO: MECANOGRAFÍA
('module', 'mecanografia', 'Visión general del módulo Mecanografía',
'⌨️ **Módulo Mecanografía**\n\nAprende a escribir rápido sin mirar el teclado. 4 lecciones:\n\n1. **Posición de Manos** → Postura correcta\n2. **Filas del Teclado** → Las teclas básicas\n3. **Práctica Inicial** → Ejercicios básicos\n4. **Velocidad y Precisión** → Mejora tu velocidad\n\n🎯 Recompensa total: ~140 XP\n⏱️ Tiempo estimado: ~50 minutos\n\nConsejo: Practica 10 minutos diarios para mejorar rápido.',
ARRAY['mecanografia', 'escribir rapido', 'teclado', 'teclear', 'velocidad escritura'],
ARRAY['mecanografia', 'teclado', 'escritura', 'velocidad'], 7, NULL),

('module', 'mecanografia', 'Lección: Posición de Manos',
'✋ **Posición correcta para escribir**\n\nTres reglas de oro:\n\n👀 **Vista en la pantalla** → No mires el teclado\n✋ **Manos flotando** → No apoyes las muñecas\n🦶 **Pies en el piso** → Buena postura corporal\n\nLas teclas hogar (ASDF y JKLÑ) son donde reposan tus dedos.\n\n✅ Al completar ganas **20 XP**.',
ARRAY['posicion manos', 'postura', 'teclas hogar', 'asdf', 'jklñ', 'dedos'],
ARRAY['mecanografia', 'postura', 'teclas hogar', 'posicion'], 5, NULL),

('module', 'mecanografia', 'Lección: Filas del Teclado',
'⌨️ **Las filas del teclado**\n\nEl teclado tiene 4 filas:\n\n• **Fila superior (números):** 1 2 3 4 5 6 7 8 9 0\n• **Fila hogar superior:** Q W E R T Y U I O P\n• **Fila hogar principal:** A S D F G H J K L Ñ\n• **Fila inferior:** Z X C V B N M\n\n🔑 **Teclas hogar:** ASDF y JKLÑ\nEstas son donde reposan tus dedos índice.\n\n✅ Al completar ganas **30 XP**.',
ARRAY['filas teclado', 'teclas', 'qwerty', 'asdf', 'teclas hogar', 'layout'],
ARRAY['mecanografia', 'filas', 'teclas', 'layout'], 5, NULL),

-- MÓDULO: MOUSE
('module', 'mouse', 'Visión general del módulo Uso del Mouse',
'🖱️ **Módulo Uso del Mouse**\n\nDomina el mouse como un profesional. 4 lecciones:\n\n1. **El Cursor y Click** → Conceptos básicos\n2. **Arrastrar y Soltar** → Drag & Drop\n3. **Click Derecho** → Menú contextual\n4. **Juego: Hunter** → Practica tu puntería\n\n🎯 Recompensa total: ~120 XP\n⏱️ Tiempo estimado: ~40 minutos\n\nEl juego Hunter es divertido y mejora tu precisión.',
ARRAY['mouse', 'cursor', 'click', 'arrastrar', 'usar mouse', 'raton'],
ARRAY['mouse', 'cursor', 'click', 'drag drop'], 7, NULL),

('module', 'mouse', 'Lección: El Cursor y Click',
'🖱️ **El cursor y el click**\n\nEl mouse controla un cursor en pantalla:\n\n• **Mover** → Desplaza el cursor\n• **Click (1 vez)** → Selecciona algo\n• **Doble click (2 veces)** → Abre algo\n• **Click derecho** → Menú de opciones\n• **Scroll** → Rueda para arriba/abajo\n\nDato: El doble click debe ser rápido, como aplaudir.\n\n✅ Al completar ganas **25 XP**.',
ARRAY['cursor', 'click', 'doble click', 'seleccionar', 'abrir', 'scroll'],
ARRAY['mouse', 'cursor', 'click', 'doble click'], 5, NULL),

('module', 'mouse', 'Lección: Arrastrar y Soltar',
'🖱️ **Drag & Drop (Arrastrar y Soltar)**\n\nTres pasos:\n\n1. **Click** sobre el elemento (mantén presionado)\n2. **Arrastra** el mouse mientras mantienes presionado\n3. **Suelta** el botón donde quieres dejar el elemento\n\nPráctica: Arrastra los iconos a la carpeta en el ejercicio interactivo.\n\n✅ Al completar ganas **30 XP**.',
ARRAY['arrastrar', 'soltar', 'drag', 'drop', 'mover archivos', 'arrastar'],
ARRAY['mouse', 'drag drop', 'arrastrar', 'mover'], 5, NULL),

-- MÓDULO: INTERNET
('module', 'internet', 'Visión general del módulo Internet',
'🌐 **Módulo Internet Seguro**\n\nNavega con seguridad y eficacia. 3 lecciones:\n\n1. **Navegadores Web** → Qué son y cómo funcionan\n2. **Búsquedas en Google** → Encuentra lo que necesitas\n3. **Seguridad en Internet** → Identifica peligros\n\n🎯 Recompensa total: ~100 XP\n⏱️ Tiempo estimado: ~35 minutos\n\n🔒 Requisito: Nivel 2 para desbloquear.',
ARRAY['internet', 'navegador', 'google', 'web', 'navegar', 'busqueda'],
ARRAY['internet', 'navegador', 'google', 'web', 'seguridad'], 7, NULL),

-- MÓDULO: HERRAMIENTAS DIGITALES
('module', 'herramientas', 'Visión general de Herramientas Digitales',
'☁️ **Módulo Herramientas Digitales**\n\nDomina Google Drive y herramientas cloud. 3 lecciones:\n\n1. **Introducción a Google Drive** → Tu almacenamiento en la nube\n2. **Subir y Organizar Archivos** → Gestiona tu Drive\n3. **Compartir Documentos** → Trabaja en equipo\n\n🎯 Recompensa total: ~95 XP\n⏱️ Tiempo estimado: ~30 minutos\n\n🔒 Requisito: Nivel 3 para desbloquear.',
ARRAY['google drive', 'nube', 'almacenamiento', 'herramientas', 'cloud', 'compartir'],
ARRAY['herramientas', 'drive', 'nube', 'google', 'almacenamiento'], 7, NULL),

-- MÓDULO: EXCEL
('module', 'excel', 'Visión general del módulo Excel',
'📊 **Módulo Microsoft Excel**\n\nDomina hojas de cálculo y fórmulas. Contenido:\n\n1. **Introducción a Excel** → Conceptos básicos\n\n🎯 Contenido en expansión\n🔒 Requisito: Nivel 5 para desbloquear\n\nExcel es fundamental para el trabajo profesional.',
ARRAY['excel', 'hoja calculo', 'formulas', 'tablas', 'datos', 'microsoft excel'],
ARRAY['excel', 'hojas de calculo', 'formulas', 'datos'], 7, NULL),

-- MÓDULO: IA
('module', 'ia_basics', 'Visión general del módulo IA',
'🧠 **Módulo Inteligencia Artificial**\n\nAprende a usar herramientas de IA. 3 lecciones:\n\n1. **Qué es la IA** → Conceptos básicos\n2. **Cómo escribir Prompts** → La clave para buenas respuestas\n3. **Usos Prácticos de IA** → Aplicaciones del día a día\n\n🎯 Recompensa total: ~105 XP\n⏱️ Tiempo estimado: ~35 minutos\n\n🔗 Requisito: Nivel 4 para desbloquear.',
ARRAY['ia', 'inteligencia artificial', 'chatgpt', 'prompt', 'ai', 'machine learning'],
ARRAY['ia', 'inteligencia artificial', 'prompts', 'chatgpt'], 7, NULL),

-- SISTEMA DE NIVELES Y XP
('faq', 'general', 'Cómo funciona el sistema de XP',
'💎 **Sistema de XP (Puntos de Experiencia)**\n\nGanas XP completando:\n• Lecciones: 20-50 XP cada una\n• Quizzes: XP adicional por respuestas correctas\n• Logros: 20-500 XP según el logro\n\nLos XP acumulados suben tu nivel:\n• Nv.1 Principiante (0 XP)\n• Nv.2 Explorador (100 XP)\n• Nv.3 Aprendiz (250 XP)\n• Nv.4 Competente (500 XP)\n• Nv.5 Hábil (800 XP)\n• ...hasta Nv.10 Leyenda (5000 XP)\n\nA mayor nivel, más módulos se desbloquean.',
ARRAY['xp', 'experiencia', 'puntos', 'subir nivel', 'como gano xp', 'niveles'],
ARRAY['xp', 'niveles', 'progreso', 'gamificacion'], 8, NULL),

('faq', 'general', 'Cómo desbloquear módulos',
'🔓 **Desbloquear Módulos**\n\nLos módulos se desbloquean al alcanzar ciertos niveles:\n\n• PC Básico → Nivel 1 (desde el inicio)\n• Mecanografía → Nivel 1 (desde el inicio)\n• Uso del Mouse → Nivel 1 (desde el inicio)\n• Internet → Nivel 2 (100 XP)\n• Herramientas Digitales → Nivel 3 (250 XP)\n• IA → Nivel 4 (500 XP)\n• Excel → Nivel 5 (800 XP)\n\nGana XP completando lecciones y ejercicios.',
ARRAY['desbloquear', 'bloqueado', 'como desbloquear', 'modulo bloqueado', 'necesito nivel'],
ARRAY['desbloquear', 'niveles', 'modulos', 'bloqueado'], 8, NULL),

('faq', 'general', 'Qué son los logros',
'🏆 **Sistema de Logros**\n\nLos logros son insignias que ganas por:\n\n🎯 Primer paso → Completar tu primera lección\n📚 Estudioso → Completar 5 lecciones\n🎓 Dedicado → Completar 10 lecciones\n🖥️ Simulador Pro → Completar una tarea en simulador\n🔥 En racha → Estudiar 3 días seguidos\n⚡ Imparable → Estudiar 7 días seguidos\n❓ Quiz master → Completar tu primer quiz\n💯 Perfecto → Obtener 100% en un quiz\n\nCada logro te da XP extra como recompensa.',
ARRAY['logros', 'insignias', 'medallas', 'premios', 'como gano logros', 'achievements'],
ARRAY['logros', 'insignias', 'gamificacion', 'recompensas'], 7, NULL),

('faq', 'general', 'Qué es la racha',
'🔥 **Racha de días**\n\nTu racha cuenta cuántos días seguidos has estudiado:\n\n• Estudia al menos una lección cada día\n• La racha se reinicia si pierdes un día\n• A los 3 días ganas el logro "En racha" (+40 XP)\n• A los 7 días ganas "Imparable" (+100 XP)\n\n💡 Tip: Aunque sean 5 minutos, ¡mantén tu racha!',
ARRAY['racha', 'streak', 'dias seguidos', 'perdi racha', 'como mantener racha'],
ARRAY['racha', 'streak', 'constancia', 'diario'], 7, NULL),

-- TIPS Y CONSEJOS
('tip', 'general', 'Consejo de estudio',
'💡 **Consejo de estudio**\n\nPara aprender mejor:\n\n1. 📅 Estudia 15-30 minutos al día (no todo de una vez)\n2. 🔄 Repite lo aprendido al día siguiente\n3. 🎯 Completa los quizzes para reforzar\n4. 💻 Practica en el simulador\n5. 🔥 Mantén tu racha de días\n\nLa constancia es más importante que la intensidad.',
ARRAY['consejo', 'tip', 'como aprender', 'mejorar', 'estudiar mejor'],
ARRAY['consejo', 'estudio', 'tips', 'aprendizaje'], 6, NULL),

('tip', 'general', 'Usa el simulador',
'🖥️ **Tip: Usa el Simulador**\n\nEl simulador te permite practicar en un entorno virtual:\n\n• **Simulador de Word** → Práctica formato de texto\n• **Simulador de Escritorio** → Aprende a organizar archivos\n\nCada tarea completada en el simulador te da XP extra.\n\nVe a la sección **Simulador** en el menú lateral.',
ARRAY['simulador', 'practicar', 'word simulador', 'practica'],
ARRAY['simulador', 'practica', 'word', 'escritorio'], 6, NULL),

('tip', 'general', 'Practica mecanografía',
'⌨️ **Tip: Practica Mecanografía**\n\nLa mecanografía es una habilidad base fundamental:\n\n• Ve a la sección **Teclado** del menú\n• Empieza con nivel principiante\n• Practica 10 minutos diarios\n• No mires el teclado\n\nCon práctica constante llegarás a 40+ palabras por minuto.',
ARRAY['practicar teclado', 'escribir rapido', 'mecanografia', 'velocidad'],
ARRAY['mecanografia', 'practica', 'teclado', 'velocidad'], 6, NULL),

-- MOTIVACIÓN
('motivation', 'general', 'Mensaje motivacional 1',
'🌟 ¡Vas muy bien! Cada lección que completas te acerca más a dominar la tecnología. Recuerda: los expertos alguna vez fueron principiantes como tú. ¡Sigue adelante!',
ARRAY['motivacion', 'animo', 'sigue', 'gracias'],
ARRAY['motivacion', 'animo', 'positivo'], 3, NULL),

('motivation', 'general', 'Mensaje motivacional 2',
'💪 ¡Excelente progreso! La tecnología es una herramienta poderosa, y cada minuto que inviertes en aprender es una inversión en tu futuro. ¡No te detengas!',
ARRAY['motivacion2', 'bien hecho', 'excelente'],
ARRAY['motivacion', 'progreso', 'futuro'], 3, NULL),

('motivation', 'general', 'Mensaje de racha',
'🔥 ¡Increíble racha! Mantener una racha de estudio demuestra compromiso. Cada día que practicas, tu cerebro forma nuevas conexiones. ¡Eres imparable!',
ARRAY['racha increible', 'felicidades racha'],
ARRAY['motivacion', 'racha', 'compromiso'], 3, NULL),

-- CONCEPTOS TÉCNICOS BÁSICOS
('concept', 'general', 'Qué es un archivo',
'📄 **¿Qué es un archivo?**\n\nUn archivo es una unidad de información guardada en tu computador:\n\n• **Documento** → .docx, .pdf, .txt\n• **Imagen** → .jpg, .png, .gif\n• **Video** → .mp4, .avi\n• **Audio** → .mp3, .wav\n\nLa extensión (las letras después del punto) indica el tipo.\n\nEjemplo: "tarea.docx" es un documento de Word.',
ARRAY['archivo', 'que es archivo', 'tipo archivo', 'extension', 'docx', 'pdf'],
ARRAY['concepto', 'archivo', 'extension', 'tipo'], 5, NULL),

('concept', 'general', 'Qué es una carpeta',
'📁 **¿Qué es una carpeta?**\n\nUna carpeta es un contenedor para organizar archivos:\n\n• Puede contener archivos y otras carpetas\n• Te ayuda a encontrar cosas fácilmente\n• Puedes crear, renombrar y eliminar carpetas\n\nEstructura típica:\n📁 Documentos\n  📁 Trabajo\n  📁 Estudios\n📁 Fotos\n📁 Música',
ARRAY['carpeta', 'que es carpeta', 'folder', 'directorio', 'organizar'],
ARRAY['concepto', 'carpeta', 'organizacion', 'directorios'], 5, NULL),

('concept', 'general', 'Qué es el escritorio',
'🖥️ **¿Qué es el escritorio?**\n\nEl escritorio es la pantalla principal de tu computador:\n\n• Muestra iconos de programas y archivos\n• Tiene una barra de tareas abajo\n• Es tu punto de partida para todo\n\nPiensa en él como tu escritorio real: ahí pones las cosas que usas más.',
ARRAY['escritorio', 'desktop', 'que es escritorio', 'pantalla principal'],
ARRAY['concepto', 'escritorio', 'desktop', 'interfaz'], 5, NULL),

('concept', 'general', 'Qué es un navegador',
'🌐 **¿Qué es un navegador web?**\n\nEs el programa que usas para ver páginas de internet:\n\n🔵 **Google Chrome** → El más popular\n🟢 **Microsoft Edge** → El de Windows\n🟠 **Mozilla Firefox** → Enfocado en privacidad\n🔵 **Safari** → El de Apple\n\nCon él puedes: buscar información, ver videos, leer noticias, usar redes sociales.',
ARRAY['navegador', 'browser', 'chrome', 'edge', 'firefox', 'que es navegador'],
ARRAY['concepto', 'navegador', 'browser', 'internet'], 5, NULL),

('concept', 'general', 'Qué es la nube',
'☁️ **¿Qué es la nube (cloud)?**\n\n"La nube" es guardar tus archivos en internet en vez de solo en tu computador:\n\n✅ Ventajas:\n• Accedes desde cualquier dispositivo\n• No pierdes archivos si se daña tu PC\n• Puedes compartir fácilmente\n\nEjemplos: Google Drive, Dropbox, OneDrive\n\nGoogle Drive te da 15 GB gratis.',
ARRAY['nube', 'cloud', 'drive', 'almacenamiento', 'que es nube'],
ARRAY['concepto', 'nube', 'cloud', 'almacenamiento', 'drive'], 5, NULL);
