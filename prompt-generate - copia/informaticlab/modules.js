// ================================================
// modules.js — Sistema completo de módulos
// InfoMática Platform - V2 Expandida
// ================================================

const Modules = (function() {
  // ---- DEFINICIÓN COMPLETA DE MÓDULOS ----
  const MODULES = {
    pc_basico: {
      id: 'pc_basico',
      name: 'PC Básico',
      icon: '<img class="mod-icon-img" src="assets/icons/lessons/pc.svg" alt="PC" onerror="this.onerror=null;this.src=\'assets/icons/lessons/_placeholder.svg\'" width="36" height="36">',
      color: '#6366F1',
      levelRequired: 1,
      description: 'Aprende los fundamentos del computador',
      lessons: [
        {
          id: 'pc-01',
          title: 'Partes del Computador',
          subtitle: 'Conoce tu equipo',
          duration: '8 min',
          xp: 25,
          type: 'interactive',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/target.svg" alt="Partes" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Partes principales de un computador</h2>
            <p>Todo computador tiene componentes esenciales que debes conocer:</p>
            <br/>
            <div class="parts-grid">
              <div class="part-card">
                <div class="part-icon"><img class="emoji-icon" src="assets/icons/lessons/monitor.svg" alt="Monitor" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:36px;height:36px;vertical-align:middle;display:inline-block"></div>
                <h4>Monitor</h4>
                <p>La pantalla donde ves todo</p>
              </div>
              <div class="part-card">
                <div class="part-icon"><img class="emoji-icon" src="assets/icons/lessons/mouse-icon.svg" alt="Mouse" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:36px;height:36px;vertical-align:middle;display:inline-block"></div>
                <h4>Mouse</h4>
                <p>Controla el cursor</p>
              </div>
              <div class="part-card">
                <div class="part-icon"><img class="emoji-icon" src="assets/icons/lessons/keyboard-icon.svg" alt="Teclado" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:36px;height:36px;vertical-align:middle;display:inline-block"></div>
                <h4>Teclado</h4>
                <p>Para escribir</p>
              </div>
              <div class="part-card">
                <div class="part-icon"><img class="emoji-icon" src="assets/icons/lessons/cpu-box.svg" alt="CPU" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:36px;height:36px;vertical-align:middle;display:inline-block"></div>
                <h4>Torre/CPU</h4>
                <p>El cerebro del equipo</p>
              </div>
            </div>
          `,
          quiz: {
            question: '¿Qué parte del computador es considerada el "cerebro"?',
            options: [
              { text: 'El monitor', correct: false },
              { text: 'La torre/CPU', correct: true },
              { text: 'El mouse', correct: false },
              { text: 'El teclado', correct: false }
            ],
            explanation: 'La CPU (Unidad Central de Procesamiento) es el cerebro del computador.'
          }
        },
        {
          id: 'pc-02',
          title: 'El Escritorio',
          subtitle: 'Tu espacio de trabajo',
          duration: '10 min',
          xp: 30,
          type: 'simulator',
          simulator: 'desktop',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/desktop-home.svg" alt="Escritorio" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> El Escritorio de Windows</h2>
            <p>El escritorio es tu área de trabajo principal. Aquí verás:</p>
            <br/>
            <ul style="margin-left:20px;line-height:2">
              <li><strong>Iconos</strong> - Imágenes que representan programas y archivos</li>
              <li><strong>Barra de tareas</strong> - Abajo, muestra programas abiertos</li>
              <li><strong>Papelera de reciclaje</strong> - Aquí van los archivos eliminados</li>
              <li><strong>Menú Inicio</strong> - Botón para acceder a todo</li>
            </ul>
          `,
          quiz: {
            question: '¿Dónde se encuentra normalmente la barra de tareas en Windows?',
            options: [
              { text: 'Arriba', correct: false },
              { text: 'Abajo', correct: true },
              { text: 'Derecha', correct: false },
              { text: 'Izquierda', correct: false }
            ],
            explanation: 'La barra de tareas se encuentra en la parte inferior de la pantalla.'
          }
        },
        {
          id: 'pc-03',
          title: 'Archivos y Carpetas',
          subtitle: 'Organiza tu información',
          duration: '12 min',
          xp: 35,
          type: 'simulator',
          simulator: 'files',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/folder.svg" alt="Archivos" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Archivos y Carpetas</h2>
            <p>Todo lo que guardas son archivos. Las carpetas los organizan:</p>
            <br/>
            <div class="tips-box">
              <h4><img class="emoji-icon" src="assets/icons/lessons/bulb.svg" alt="Tip" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> Conceptos clave:</h4>
              <ul style="margin-top:10px">
                <li><strong>Archivo:</strong> Documento, imagen, video... cualquier cosa que guardas</li>
                <li><strong>Carpeta:</strong> Contenedor para organizar archivos</li>
                <li><strong>Ruta:</strong> La dirección de un archivo (ej: Documentos/Tarea.docx)</li>
              </ul>
            </div>
          `,
          quiz: {
            question: '¿Qué es una carpeta?',
            options: [
              { text: 'Un tipo de archivo', correct: false },
              { text: 'Un contenedor para organizar archivos', correct: true },
              { text: 'Un programa', correct: false },
              { text: 'Una página web', correct: false }
            ],
            explanation: 'Las carpetas son contenedores que nos ayudan a organizar nuestros archivos.'
          }
        },
        {
          id: 'pc-04',
          title: 'Configuración Básica',
          subtitle: 'Personaliza tu equipo',
          duration: '10 min',
          xp: 30,
          type: 'interactive',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/settings.svg" alt="Configuración" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Configuración de Windows</h2>
            <p>Personaliza tu equipo desde Configuración:</p>
            <br/>
            <div class="settings-grid">
              <div class="setting-item">
                <span><img class="emoji-icon" src="assets/icons/lessons/palette.svg" alt="Apariencia" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Apariencia</strong>
                  <p>Temas, colores, fondo</p>
                </div>
              </div>
              <div class="setting-item">
                <span><img class="emoji-icon" src="assets/icons/lessons/speaker.svg" alt="Sonido" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Sonido</strong>
                  <p>Volumen, efectos</p>
                </div>
              </div>
              <div class="setting-item">
                <span><img class="emoji-icon" src="assets/icons/lessons/screen.svg" alt="Pantalla" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Pantalla</strong>
                  <p>Brillo, resolución</p>
                </div>
              </div>
              <div class="setting-item">
                <span><img class="emoji-icon" src="assets/icons/lessons/lock.svg" alt="Privacidad" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Privacidad</strong>
                  <p>Seguridad y datos</p>
                </div>
              </div>
            </div>
          `,
          quiz: {
            question: '¿Cómo accedes a Configuración en Windows 10/11?',
            options: [
              { text: 'Presionando solo el botón de apagado', correct: false },
              { text: 'Botón Inicio → Configuración', correct: true },
              { text: 'Doble click al escritorio', correct: false },
              { text: 'Ctrl + Alt + Supr', correct: false }
            ],
            explanation: 'Desde el botón Inicio puedes acceder a Configuración.'
          }
        }
      ]
    },

    mecanografia: {
      id: 'mecanografia',
      name: 'Mecanografía',
      icon: '<img class="mod-icon-img" src="assets/icons/lessons/keyboard.svg" alt="Teclado" onerror="this.onerror=null;this.src=\'assets/icons/lessons/_placeholder.svg\'" width="36" height="36">',
      color: '#F59E0B',
      levelRequired: 1,
      description: 'Aprende a escribir rápido sin mirar el teclado',
      lessons: [
        {
          id: 'mec-01',
          title: 'Posición de Manos',
          subtitle: 'Postura correcta',
          duration: '5 min',
          xp: 20,
          type: 'keyboard',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/hand.svg" alt="Posición" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Posición correcta para escribir</h2>
            <p>Una buena postura es fundamental para escribir rápido:</p>
            <br/>
            <div class="position-tips">
              <div class="tip">
                <span><img class="emoji-icon" src="assets/icons/lessons/eye.svg" alt="Vista" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Vista en la pantalla</strong>
                  <p>No mires el teclado, solo la pantalla</p>
                </div>
              </div>
              <div class="tip">
                <span><img class="emoji-icon" src="assets/icons/lessons/hands.svg" alt="Manos" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Manos flotando</strong>
                  <p>No apoyes las muñecas, flota sobre las teclas</p>
                </div>
              </div>
              <div class="tip">
                <span><img class="emoji-icon" src="assets/icons/lessons/feet.svg" alt="Pies" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Pies en el piso</strong>
                  <p>Mantén los pies apoyados en el suelo</p>
                </div>
              </div>
            </div>
          `,
          quiz: {
            question: '¿Dónde deben estar tus ojos mientras escribes?',
            options: [
              { text: 'En el teclado', correct: false },
              { text: 'En la pantalla', correct: true },
              { text: 'Cerrados', correct: false },
              { text: 'En las manos', correct: false }
            ],
            explanation: 'Debes mirar la pantalla, no el teclado.'
          }
        },
        {
          id: 'mec-02',
          title: 'Filas del Teclado',
          subtitle: 'Las teclas básicas',
          duration: '10 min',
          xp: 30,
          type: 'keyboard',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/abc.ai.svg" alt="Filas" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Las filas del teclado</h2>
            <p>El teclado tiene 3 filas principales más la fila de números:</p>
            <br/>
            <div class="keyboard-rows">
              <div class="row">
                <span class="row-label">Fila superior (números)</span>
                <span class="keys">1 2 3 4 5 6 7 8 9 0 -</span>
              </div>
              <div class="row home">
                <span class="row-label">Fila hogar (ASDF)</span>
                <span class="keys">Q W E R T Y U I O P</span>
              </div>
              <div class="row home">
                <span class="row-label">Fila hogar (JKLÑ)</span>
                <span class="keys">A S D F G H J K L Ñ</span>
              </div>
              <div class="row">
                <span class="row-label">Fila inferior (ZXCV)</span>
                <span class="keys">Z X C V B N M</span>
              </div>
            </div>
            <p style="margin-top:20px;color:#F59E0B;font-weight:600">
              Las teclas ASDF y JKLÑ son las "teclas hogar" - donde reposan tus dedos.
            </p>
          `,
          quiz: {
            question: '¿Qué teclas se llaman "hogar" o "home"?',
            options: [
              { text: 'Espacio y Enter', correct: false },
              { text: 'ASDF y JKLÑ', correct: true },
              { text: 'QWER y ASDF', correct: false },
              { text: '1 2 3 y 7 8 9', correct: false }
            ],
            explanation: 'ASDF y JKLÑ son las teclas donde reposan los dedos.'
          }
        },
        {
          id: 'mec-03',
          title: 'Práctica Inicial',
          subtitle: 'Ejercicios básicos',
          duration: '15 min',
          xp: 40,
          type: 'typing-game',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/gamepad.svg" alt="Practicar" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> ¡Hora de practicar!</h2>
            <p>Ahora vas a practicar las teclas que acabas de aprender.</p>
            <br/>
            <div style="background:rgba(245,158,11,0.1);border-radius:12px;padding:20px;text-align:center">
              <p style="font-size:1.1rem;margin-bottom:10px">
                Presiona <strong>START</strong> para comenzar el ejercicio.
              </p>
              <p style="color:#888;font-size:0.9rem">
                Escribe las palabras que aparecen lo más rápido posible.
              </p>
            </div>
          `,
          quiz: null
        },
        {
          id: 'mec-04',
          title: 'Velocidad y Precisión',
          subtitle: 'Mejora tu velocidad',
          duration: '20 min',
          xp: 50,
          type: 'typing-game',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/speed.svg" alt="Velocidad" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Ejercicios de velocidad</h2>
            <p>Vamos a medir tu velocidad en palabras por minuto (PPM):</p>
            <br/>
            <div class="wpm-info">
              <div class="wpm-tier">
                <span class="tier-label beginner">Beginner</span>
                <span class="wpm-range">0-20 PPM</span>
              </div>
              <div class="wpm-tier">
                <span class="tier-label intermediate">Intermedio</span>
                <span class="wpm-range">20-40 PPM</span>
              </div>
              <div class="wpm-tier">
                <span class="tier-label advanced">Avanzado</span>
                <span class="wpm-range">40-60 PPM</span>
              </div>
              <div class="wpm-tier">
                <span class="tier-label expert">Experto</span>
                <span class="wpm-range">60+ PPM</span>
              </div>
            </div>
          `,
          quiz: null
        }
      ]
    },

    mouse: {
      id: 'mouse',
      name: 'Uso del Mouse',
      icon: '<img class="mod-icon-img" src="assets/icons/lessons/mouse.svg" alt="Mouse" onerror="this.onerror=null;this.src=\'assets/icons/lessons/_placeholder.svg\'" width="36" height="36">',
      color: '#10B981',
      levelRequired: 1,
      description: 'Domina el mouse como un profesional',
      lessons: [
        {
          id: 'mouse-01',
          title: 'El Cursor y Click',
          subtitle: 'Conceptos básicos',
          duration: '8 min',
          xp: 25,
          type: 'interactive',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/cursor-hand.svg" alt="Cursor" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> El cursor y el click</h2>
            <p>El mouse controla un cursor en la pantalla. ¡Practiquemos!</p>
            <br/>
            <div class="mouse-basics">
              <div class="mouse-action">
                <div class="action-demo">
                  <span class="cursor-icon"><img class="emoji-icon" src="assets/icons/lessons/arrow-right.svg" alt="Mover" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                </div>
                <div class="action-info">
                  <h4>Mover</h4>
                  <p>Mueve el mouse para desplazar el cursor</p>
                </div>
              </div>
              <div class="mouse-action">
                <div class="action-demo">
                  <span class="cursor-icon"><img class="emoji-icon" src="assets/icons/lessons/cursor-click.svg" alt="Click" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                </div>
                <div class="action-info">
                  <h4>Click</h4>
                  <p>Presiona el botón izquierdo una vez</p>
                </div>
              </div>
            </div>
          `,
          quiz: {
            question: '¿Cuántas veces debes presionar para hacer un "doble clic"?',
            options: [
              { text: '1 vez', correct: false },
              { text: '2 veces seguidas', correct: true },
              { text: '3 veces', correct: false },
              { text: 'Mantener presionado', correct: false }
            ],
            explanation: 'El doble clic son dos presiones rápidas del botón izquierdo.'
          }
        },
        {
          id: 'mouse-02',
          title: 'Arrastrar y Soltar',
          subtitle: 'Drag & Drop',
          duration: '10 min',
          xp: 30,
          type: 'drag-drop',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/drag-drop.svg" alt="Drag & Drop" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Drag & Drop</h2>
            <p>Arrastrar y soltar es esencial para mover archivos:</p>
            <br/>
            <ol style="margin-left:20px;line-height:2">
              <li><strong>Click</strong> sobre el elemento (mantén presionado)</li>
              <li><strong>Arrastra</strong> el mouse mientras mantienes presionado</li>
              <li><strong>Suelta</strong> el botón donde quieres dejar el elemento</li>
            </ol>
            <div style="margin-top:20px;padding:20px;background:rgba(16,185,129,0.1);border-radius:12px;text-align:center">
              <p><img class="emoji-icon" src="assets/icons/lessons/target-sm.svg" alt="Práctica" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Práctica:</strong> Arrastra los iconos a la carpeta</p>
            </div>
          `,
          quiz: {
            question: '¿Qué significa "arrastrar y soltar" (drag & drop)?',
            options: [
              { text: 'Copiar y pegar un archivo', correct: false },
              { text: 'Mantener click, mover y soltar', correct: true },
              { text: 'Eliminar un archivo', correct: false },
              { text: 'Abrir un archivo con doble clic', correct: false }
            ],
            explanation: 'Drag & Drop significa mantener presionado el click mientras mueves el mouse.'
          }
        },
        {
          id: 'mouse-03',
          title: 'Click Derecho',
          subtitle: 'Menú contextual',
          duration: '8 min',
          xp: 25,
          type: 'interactive',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/menu-hamburger.svg" alt="Menú" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> El Click Derecho</h2>
            <p>El click derecho abre el "menú contextual" con opciones rápidas:</p>
            <br/>
            <div class="context-menu-demo">
              <div class="menu-item"><img class="emoji-icon" src="assets/icons/lessons/clipboard.svg" alt="Copiar" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Copiar</strong> - Duplica el elemento</div>
              <div class="menu-item"><img class="emoji-icon" src="assets/icons/lessons/scissors.svg" alt="Cortar" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Cortar</strong> - Mueve el elemento</div>
              <div class="menu-item"><img class="emoji-icon" src="assets/icons/lessons/clipboard.svg" alt="Pegar" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Pegar</strong> - Pega lo copiado/cortado</div>
              <div class="menu-item"><img class="emoji-icon" src="assets/icons/lessons/trash.svg" alt="Eliminar" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Eliminar</strong> - Envía a papelera</div>
              <div class="menu-item"><img class="emoji-icon" src="assets/icons/lessons/pencil.svg" alt="Renombrar" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Renombrar</strong> - Cambiar nombre</div>
              <div class="menu-item"><img class="emoji-icon" src="assets/icons/lessons/gear.svg" alt="Propiedades" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Propiedades</strong> - Ver detalles</div>
            </div>
          `,
          quiz: {
            question: '¿Para qué sirve principalmente el click derecho?',
            options: [
              { text: 'Para abrir archivos', correct: false },
              { text: 'Para ver opciones rápidas del elemento', correct: true },
              { text: 'Para cerrar ventanas', correct: false },
              { text: 'Para seleccionar todo', correct: false }
            ],
            explanation: 'El click derecho abre un menú con opciones contextuales.'
          }
        },
        {
          id: 'mouse-04',
          title: 'Juego: Hunter',
          subtitle: 'Practica tu puntería',
          duration: '15 min',
          xp: 40,
          type: 'game',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/target.svg" alt="Hunter" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Juego: Hunter</h2>
            <p>¡Vamos a practicar! Haz clic en los objetivos lo más rápido posible:</p>
            <br/>
            <div style="background:rgba(16,185,129,0.1);border-radius:12px;padding:20px;text-align:center">
              <p style="font-size:1.2rem"><img class="emoji-icon" src="assets/icons/lessons/gamepad.svg" alt="Juego" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Nivel Principiante</strong></p>
              <p>Objetivos: 10 | Tiempo: 30 segundos</p>
            </div>
          `,
          quiz: null
        }
      ]
    },

    internet: {
      id: 'internet',
      name: 'Internet',
      icon: '<img class="mod-icon-img" src="assets/icons/lessons/internet.svg" alt="Internet" onerror="this.onerror=null;this.src=\'assets/icons/lessons/_placeholder.svg\'" width="36" height="36">',
      color: '#0EA5E9',
      levelRequired: 2,
      description: 'Navega con seguridad y eficacia',
      lessons: [
        {
          id: 'int-01',
          title: 'Navegadores Web',
          subtitle: 'Qué es y cómo funciona',
          duration: '8 min',
          xp: 25,
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/globe.svg" alt="Navegador" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> ¿Qué es un navegador?</h2>
            <p>Un navegador es el programa que usas para ver páginas web:</p>
            <br/>
            <div class="browsers-list">
              <div class="browser-item">
                <span class="browser-icon"><img class="emoji-icon" src="assets/icons/lessons/browser-chrome.svg" alt="Chrome" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Google Chrome</strong>
                  <p>El más popular, muy rápido</p>
                </div>
              </div>
              <div class="browser-item">
                <span class="browser-icon"><img class="emoji-icon" src="assets/icons/lessons/browser-edge.svg" alt="Edge" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Microsoft Edge</strong>
                  <p>El de Windows, mejorado</p>
                </div>
              </div>
              <div class="browser-item">
                <span class="browser-icon"><img class="emoji-icon" src="assets/icons/lessons/browser-firefox.svg" alt="Firefox" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Mozilla Firefox</strong>
                  <p>Enfocado en privacidad</p>
                </div>
              </div>
              <div class="browser-item">
                <span class="browser-icon"><img class="emoji-icon" src="assets/icons/lessons/browser-safari.svg" alt="Safari" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Safari</strong>
                  <p>El de Apple</p>
                </div>
              </div>
            </div>
          `,
          quiz: {
            question: '¿Qué es un navegador web?',
            options: [
              { text: 'Un programa para escribir', correct: false },
              { text: 'Un programa para ver páginas web', correct: true },
              { text: 'Un tipo de antivirus', correct: false },
              { text: 'Una red social', correct: false }
            ],
            explanation: 'El navegador es el software que permite navegar por internet.'
          }
        },
        {
          id: 'int-02',
          title: 'Búsquedas en Google',
          subtitle: 'Encuentra lo que necesitas',
          duration: '12 min',
          xp: 35,
          type: 'interactive',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/search.svg" alt="Búsqueda" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Búsquedas efectivas</h2>
            <p>Aprende a encontrar lo que buscas más rápido:</p>
            <br/>
            <div class="search-tips">
              <div class="tip-card">
                <span class="tip-icon">" "</span>
                <div>
                  <strong>Usa comillas</strong>
                  <p>"receta de arepa" busca esa frase exacta</p>
                </div>
              </div>
              <div class="tip-card">
                <span class="tip-icon">-</span>
                <div>
                  <strong>Excluye palabras</strong>
                  <p>receta -carne busca sin carne</p>
                </div>
              </div>
              <div class="tip-card">
                <span class="tip-icon">site:</span>
                <div>
                  <strong>Buscar en un sitio</strong>
                  <p>site:wikipedia.org planeta</p>
                </div>
              </div>
              <div class="tip-card">
                <span class="tip-icon">filetype:</span>
                <div>
                  <strong>Tipo de archivo</strong>
                  <p>filetype:pdf informe</p>
                </div>
              </div>
            </div>
          `,
          quiz: {
            question: 'Si buscas información sobre nutrición, pero NO quieres páginas que vendan productos, ¿qué búsqueda harías?',
            options: [
              { text: 'nutrición', correct: false },
              { text: 'nutrición -tienda -compra', correct: true },
              { text: 'nutrición mejores', correct: false },
              { text: 'qué es nutrición', correct: false }
            ],
            explanation: 'El signo - excluye palabras de la búsqueda.'
          }
        },
        {
          id: 'int-03',
          title: 'Seguridad en Internet',
          subtitle: 'Identifica peligros',
          duration: '15 min',
          xp: 40,
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/lock.svg" alt="Seguridad" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Navegación segura</h2>
            <p>Aprende a identificar sitios seguros y protegerte:</p>
            <br/>
            <div class="security-check">
              <div class="check-item secure">
                <span>✓</span>
                <div>
                  <strong>https:// al inicio</strong>
                  <p>El candado indica conexión segura</p>
                </div>
              </div>
              <div class="check-item warning">
                <span>!</span>
                <div>
                  <strong>http:// sin candado</strong>
                  <p>No ingreses datos personales</p>
                </div>
              </div>
              <div class="check-item danger">
                <span>✕</span>
                <div>
                  <strong>URL sospechosa</strong>
                  <p>Errores de ortografía, números extraños</p>
                </div>
              </div>
            </div>
            <br/>
            <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:16px">
              <strong><img class="emoji-icon" src="assets/icons/lessons/warning.svg" alt="Advertencia" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> NUNCA:</strong>
              <ul style="margin-top:8px;margin-left:20px">
                <li>Click en enlaces de emails sospechosos</li>
                <li>Dar tu contraseña a terceros</li>
                <li>Descargar archivos de fuentes desconocidas</li>
              </ul>
            </div>
          `,
          quiz: {
            question: '¿Qué indica el candado verde en la barra de direcciones?',
            options: [
              { text: 'Que la página es gratis', correct: false },
              { text: 'Que la conexión es segura (https)', correct: true },
              { text: 'Que no hay virus', correct: false },
              { text: 'Que es una página oficial', correct: false }
            ],
            explanation: 'El candado verde indica que la conexión está encriptada.'
          }
        }
      ]
    },

    herramientas: {
      id: 'herramientas',
      name: 'Herramientas Digitales',
      icon: '<img class="mod-icon-img" src="assets/icons/lessons/tools.svg" alt="Herramientas" onerror="this.onerror=null;this.src=\'assets/icons/lessons/_placeholder.svg\'" width="36" height="36">',
      color: '#8B5CF6',
      levelRequired: 3,
      description: 'Domina Google Drive y herramientas cloud',
      lessons: [
        {
          id: 'herr-01',
          title: 'Introducción a Google Drive',
          subtitle: 'Tu almacenamiento en la nube',
          duration: '10 min',
          xp: 30,
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/cloud.svg" alt="Drive" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> ¿Qué es Google Drive?</h2>
            <p>Drive es tu espacio de almacenamiento en la nube:</p>
            <br/>
            <div class="drive-features">
              <div class="feature">
                <span><img class="emoji-icon" src="assets/icons/lessons/folder-icon.svg" alt="Archivos" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>15 GB gratis</strong>
                  <p>Espacio para archivos, fotos, emails</p>
                </div>
              </div>
              <div class="feature">
                <span><img class="emoji-icon" src="assets/icons/lessons/phone.svg" alt="Móvil" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Acceso desde cualquier lugar</strong>
                  <p>Celular, tablet, computador</p>
                </div>
              </div>
              <div class="feature">
                <span><img class="emoji-icon" src="assets/icons/lessons/people.svg" alt="Compartir" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Compartir archivos</strong>
                  <p>Envía documentos sin usar email</p>
                </div>
              </div>
              <div class="feature">
                <span><img class="emoji-icon" src="assets/icons/lessons/handshake.svg" alt="Colaboración" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Colaboración en tiempo real</strong>
                  <p>Edita documentos con otros</p>
                </div>
              </div>
            </div>
          `,
          quiz: {
            question: '¿Cuánto almacenamiento gratuito incluye Google Drive?',
            options: [
              { text: '5 GB', correct: false },
              { text: '10 GB', correct: false },
              { text: '15 GB', correct: true },
              { text: '30 GB', correct: false }
            ],
            explanation: 'Google Drive ofrece 15 GB de almacenamiento gratuito.'
          }
        },
        {
          id: 'herr-02',
          title: 'Subir y Organizar Archivos',
          subtitle: 'Gestiona tu Drive',
          duration: '12 min',
          xp: 35,
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/upload.svg" alt="Subir" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Subir archivos a Drive</h2>
            <p>Puedes subir cualquier tipo de archivo a la nube:</p>
            <br/>
            <div class="upload-methods">
              <div class="method">
                <span class="method-num">1</span>
                <div>
                  <strong>Arrastrar y soltar</strong>
                  <p>Arrastra archivos desde tu PC a Drive</p>
                </div>
              </div>
              <div class="method">
                <span class="method-num">2</span>
                <div>
                  <strong>Botón + Nuevo</strong>
                  <p>Click en "Subir archivo" o "Subir carpeta"</p>
                </div>
              </div>
              <div class="method">
                <span class="method-num">3</span>
                <div>
                  <strong>Sincronización</strong>
                  <p>Drive para escritorio sincroniza automáticamente</p>
                </div>
              </div>
            </div>
          `,
          quiz: null
        },
        {
          id: 'herr-03',
          title: 'Compartir Documentos',
          subtitle: 'Trabaja en equipo',
          duration: '10 min',
          xp: 30,
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/share.svg" alt="Compartir" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Compartir en Drive</h2>
            <p>Comparte tus archivos de forma segura:</p>
            <br/>
            <div class="share-options">
              <div class="share-option">
                <span class="share-icon"><img class="emoji-icon" src="assets/icons/lessons/link.svg" alt="Enlace" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Enlace</strong>
                  <p>Copia y envía el link</p>
                  <span class="badge">Público / Restringido</span>
                </div>
              </div>
              <div class="share-option">
                <span class="share-icon"><img class="emoji-icon" src="assets/icons/lessons/envelope.svg" alt="Email" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Email</strong>
                  <p>Envía directamente a emails específicos</p>
                  <span class="badge">Solo personas invitadas</span>
                </div>
              </div>
            </div>
          `,
          quiz: {
            question: '¿Qué significa "Editor" en los permisos de Drive?',
            options: [
              { text: 'Solo puede ver el archivo', correct: false },
              { text: 'Solo puede comentar', correct: false },
              { text: 'Puede editar el archivo', correct: true },
              { text: 'No puede hacer nada', correct: false }
            ],
            explanation: 'Editor es el nivel de acceso completo para modificar el archivo.'
          }
        }
      ]
    },

    excel: {
      id: 'excel',
      name: 'Microsoft Excel',
      icon: '<img class="mod-icon-img" src="assets/icons/lessons/excel.svg" alt="Excel" onerror="this.onerror=null;this.src=\'assets/icons/lessons/_placeholder.svg\'" width="36" height="36">',
      color: '#22C55E',
      levelRequired: 5,
      description: 'Domina hojas de cálculo y fórmulas',
      lessons: [
        {
          id: 'excel-01',
          title: 'Introducción a Excel',
          subtitle: 'Conceptos básicos',
          duration: '10 min',
          xp: 30,
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/chart.svg" alt="Excel" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> ¿Qué es Microsoft Excel?</h2>
            <p>Excel es una hoja de cálculo que te permite:</p>
            <br/>
            <ul style="margin-left:20px;line-height:2">
              <li><img class="emoji-icon" src="assets/icons/lessons/notebook-sm.svg" alt="Organizar" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Organizar datos</strong> en filas y columnas</li>
              <li><img class="emoji-icon" src="assets/icons/lessons/calculator-sm.svg" alt="Calcular" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Realizar cálculos</strong> con fórmulas</li>
              <li><img class="emoji-icon" src="assets/icons/lessons/chart-sm.svg" alt="Gráficos" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Crear gráficos</strong> visuales</li>
              <li><img class="emoji-icon" src="assets/icons/lessons/data-sm.svg" alt="Analizar" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> <strong>Analizar información</strong> rápidamente</li>
            </ul>
          `,
          quiz: {
            question: '¿Qué es una celda en Excel?',
            options: [
              { text: 'Un tipo de gráfico', correct: false },
              { text: 'La intersección de una fila y una columna', correct: true },
              { text: 'Un botón de función', correct: false },
              { text: 'Una fórmula', correct: false }
            ],
            explanation: 'Una celda es la intersección de una fila (número) y una columna (letra).'
          }
        }
      ]
    },

    ia_basics: {
      id: 'ia_basics',
      name: 'Inteligencia Artificial',
      icon: '<img class="mod-icon-img" src="assets/icons/lessons/brain.svg" alt="IA" onerror="this.onerror=null;this.src=\'assets/icons/lessons/_placeholder.svg\'" width="36" height="36">',
      color: '#EC4899',
      levelRequired: 4,
      description: 'Aprende a usar herramientas de IA',
      external: true,
      url: '/prompt-generate/index.html',
      lessons: [
        {
          id: 'ia-01',
          title: 'Qué es la Inteligencia Artificial',
          subtitle: 'Conceptos básicos',
          duration: '10 min',
          xp: 30,
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/brain.svg" alt="IA" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> ¿Qué es la Inteligencia Artificial?</h2>
            <p>La IA es tecnología que puede aprender y tomar decisiones:</p>
            <br/>
            <div class="ai-types">
              <div class="type-card">
                <span class="type-icon"><img class="emoji-icon" src="assets/icons/lessons/chat.svg" alt="Chat" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:36px;height:36px;vertical-align:middle;display:inline-block"></span>
                <h4>IA Conversacional</h4>
                <p>ChatGPT, Siri, Alexa</p>
              </div>
              <div class="type-card">
                <span class="type-icon"><img class="emoji-icon" src="assets/icons/lessons/palette-gen.svg" alt="Generativa" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:36px;height:36px;vertical-align:middle;display:inline-block"></span>
                <h4>IA Generativa</h4>
                <p>Crear imágenes, texto, música</p>
              </div>
              <div class="type-card">
                <span class="type-icon"><img class="emoji-icon" src="assets/icons/lessons/search-analysis.svg" alt="Análisis" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:36px;height:36px;vertical-align:middle;display:inline-block"></span>
                <h4>IA de Análisis</h4>
                <p>Procesar grandes cantidades de datos</p>
              </div>
            </div>
          `,
          quiz: {
            question: '¿Qué tipo de IA es ChatGPT?',
            options: [
              { text: 'IA de análisis de datos', correct: false },
              { text: 'IA conversacional', correct: true },
              { text: 'IA de reconocimiento facial', correct: false },
              { text: 'IA de juegos', correct: false }
            ],
            explanation: 'ChatGPT es una IA conversacional que entiende y responde texto.'
          }
        },
        {
          id: 'ia-02',
          title: 'Cómo escribir Prompts',
          subtitle: 'La clave para buenas respuestas',
          duration: '15 min',
          xp: 40,
          type: 'interactive',
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/write.svg" alt="Prompts" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Escribiendo Prompts efectivos</h2>
            <p>Un "prompt" es lo que le dices a la IA. ¡Aprende a hacerlo bien!</p>
            <br/>
            <div class="prompt-structure">
              <div class="structure-element">
                <span class="elem-icon"><img class="emoji-icon" src="assets/icons/lessons/clipboard-list.svg" alt="Contexto" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Contexto</strong>
                  <p>"Soy estudiante de cocina"</p>
                </div>
              </div>
              <div class="structure-element">
                <span class="elem-icon"><img class="emoji-icon" src="assets/icons/lessons/target-task.svg" alt="Tarea" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Tarea</strong>
                  <p>"Necesito una receta"</p>
                </div>
              </div>
              <div class="structure-element">
                <span class="elem-icon"><img class="emoji-icon" src="assets/icons/lessons/format.svg" alt="Formato" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Formato</strong>
                  <p>"En formato de lista"</p>
                </div>
              </div>
            </div>
            <br/>
            <div class="good-bad">
              <div class="example bad">
                <span><img class="emoji-icon" src="assets/icons/lessons/cross.svg" alt="Mal" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Dame una receta</strong>
                  <p>Muy vaga, resultados imprecisos</p>
                </div>
              </div>
              <div class="example good">
                <span><img class="emoji-icon" src="assets/icons/lessons/check.svg" alt="Bien" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>"Soy principiante en cocina. Dame una receta fácil de pasta carbonara con ingredientes que encuentre en cualquier supermercado. Explica los pasos en orden numerado."</strong>
                  <p>Clara, específica, con contexto</p>
                </div>
              </div>
            </div>
          `,
          quiz: {
            question: '¿Cuál de estos es un mejor prompt para obtener una respuesta útil?',
            options: [
              { text: 'Explícame algo de historia', correct: false },
              { text: 'Dame información sobre historia del arte', correct: false },
              { text: 'Explica el Renacimiento en 5 puntos para un niño de 10 años', correct: true },
              { text: 'Quiero saber de arte', correct: false }
            ],
            explanation: 'El mejor prompt incluye contexto, tarea específica y formato deseado.'
          }
        },
        {
          id: 'ia-03',
          title: 'Usos Prácticos de IA',
          subtitle: 'Aplicaciones del día a día',
          duration: '12 min',
          xp: 35,
          content: `
            <h2><img class="emoji-icon" src="assets/icons/lessons/star.svg" alt="Usos" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:28px;height:28px;vertical-align:middle;display:inline-block"> Usos prácticos de la IA</h2>
            <p>La IA puede ayudarte en muchas tareas:</p>
            <br/>
            <div class="ai-uses">
              <div class="use-case">
                <span><img class="emoji-icon" src="assets/icons/lessons/writing.svg" alt="Escritura" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Escritura</strong>
                  <p>Revisar textos, corregir ortografía, generar ideas</p>
                </div>
              </div>
              <div class="use-case">
                <span><img class="emoji-icon" src="assets/icons/lessons/code.svg" alt="Programación" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Programación</strong>
                  <p>Escribir código, explicar errores, optimizar</p>
                </div>
              </div>
              <div class="use-case">
                <span><img class="emoji-icon" src="assets/icons/lessons/graduation.svg" alt="Aprendizaje" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Aprendizaje</strong>
                  <p>Explicar conceptos, practicar idiomas</p>
                </div>
              </div>
              <div class="use-case">
                <span><img class="emoji-icon" src="assets/icons/lessons/data.svg" alt="Datos" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"></span>
                <div>
                  <strong>Análisis</strong>
                  <p>Resumir documentos, organizar información</p>
                </div>
              </div>
            </div>
            <br/>
            <div style="background:rgba(236,72,153,0.1);border-radius:12px;padding:16px">
              <strong><img class="emoji-icon" src="assets/icons/lessons/bulb-tip.svg" alt="Recuerda" onerror="this.onerror=null;this.src='assets/icons/lessons/_placeholder.svg'" style="width:22px;height:22px;vertical-align:middle;display:inline-block"> Recuerda:</strong> La IA es una herramienta de ayuda, no sustituye el aprendizaje profundo ni el pensamiento crítico.
            </div>
          `,
          quiz: {
            question: '¿Cuál es una limitación de la IA que debes considerar?',
            options: [
              { text: 'Nunca comete errores', correct: false },
              { text: 'Puede dar información incorrecta, verifica siempre', correct: true },
              { text: 'Solo funciona en inglés', correct: false },
              { text: 'Necesita internet para todo', correct: false }
            ],
            explanation: 'La IA puede generar información incorrecta, siempre verifica las respuestas.'
          }
        }
      ]
    }
  };

  // ---- EXPORTS ----
  return {
    MODULES,
    getModule: (id) => MODULES[id],
    getAllModules: () => Object.values(MODULES),
    getUnlockedModules: (level) => {
      return Object.values(MODULES).filter(m => m.levelRequired <= level);
    }
  };
})();

window.Modules = Modules;