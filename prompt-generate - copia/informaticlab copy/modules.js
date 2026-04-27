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
      icon: '💻',
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
            <h2>🎯 Partes principales de un computador</h2>
            <p>Todo computador tiene componentes esenciales que debes conocer:</p>
            <br/>
            <div class="parts-grid">
              <div class="part-card">
                <div class="part-icon">🖥️</div>
                <h4>Monitor</h4>
                <p>La pantalla donde ves todo</p>
              </div>
              <div class="part-card">
                <div class="part-icon">🖱️</div>
                <h4>Mouse</h4>
                <p>Controla el cursor</p>
              </div>
              <div class="part-card">
                <div class="part-icon">⌨️</div>
                <h4>Teclado</h4>
                <p>Para escribir</p>
              </div>
              <div class="part-card">
                <div class="part-icon">📦</div>
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
            <h2>🏠 El Escritorio de Windows</h2>
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
            <h2>📁 Archivos y Carpetas</h2>
            <p>Todo lo que guardas son archivos. Las carpetas los organizan:</p>
            <br/>
            <div class="tips-box">
              <h4>💡 Conceptos clave:</h4>
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
            <h2>⚙️ Configuración de Windows</h2>
            <p>Personaliza tu equipo desde Configuración:</p>
            <br/>
            <div class="settings-grid">
              <div class="setting-item">
                <span>🎨</span>
                <div>
                  <strong>Apariencia</strong>
                  <p>Temas, colores, fondo</p>
                </div>
              </div>
              <div class="setting-item">
                <span>🔊</span>
                <div>
                  <strong>Sonido</strong>
                  <p>Volumen, efectos</p>
                </div>
              </div>
              <div class="setting-item">
                <span>📺</span>
                <div>
                  <strong>Pantalla</strong>
                  <p>Brillo, resolución</p>
                </div>
              </div>
              <div class="setting-item">
                <span>🔒</span>
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
      icon: '⌨️',
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
            <h2>✋ Posición correcta para escribir</h2>
            <p>Una buena postura es fundamental para escribir rápido:</p>
            <br/>
            <div class="position-tips">
              <div class="tip">
                <span>👁️</span>
                <div>
                  <strong>Vista en la pantalla</strong>
                  <p>No mires el teclado, solo la pantalla</p>
                </div>
              </div>
              <div class="tip">
                <span>🤚</span>
                <div>
                  <strong>Manos flotando</strong>
                  <p>No apoyes las muñecas, flota sobre las teclas</p>
                </div>
              </div>
              <div class="tip">
                <span>🦶</span>
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
            <h2>🔤 Las filas del teclado</h2>
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
            <h2>🎮 ¡Hora de practicar!</h2>
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
            <h2>🏎️ Ejercicios de velocidad</h2>
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
      icon: '🖱️',
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
            <h2>👆 El cursor y el click</h2>
            <p>El mouse controla un cursor en la pantalla. ¡Practiquemos!</p>
            <br/>
            <div class="mouse-basics">
              <div class="mouse-action">
                <div class="action-demo">
                  <span class="cursor-icon">➡️</span>
                </div>
                <div class="action-info">
                  <h4>Mover</h4>
                  <p>Mueve el mouse para desplazar el cursor</p>
                </div>
              </div>
              <div class="mouse-action">
                <div class="action-demo">
                  <span class="cursor-icon">👆</span>
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
            <h2>拉手 Drag & Drop</h2>
            <p>Arrastrar y soltar es esencial para mover archivos:</p>
            <br/>
            <ol style="margin-left:20px;line-height:2">
              <li><strong>Click</strong> sobre el elemento (mantén presionado)</li>
              <li><strong>Arrastra</strong> el mouse mientras mantienes presionado</li>
              <li><strong>Suelta</strong> el botón donde quieres dejar el elemento</li>
            </ol>
            <div style="margin-top:20px;padding:20px;background:rgba(16,185,129,0.1);border-radius:12px;text-align:center">
              <p>🎯 <strong>Práctica:</strong> Arrastra los iconos a la carpeta</p>
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
            <h2>☰ El Click Derecho</h2>
            <p>El click derecho abre el "menú contextual" con opciones rápidas:</p>
            <br/>
            <div class="context-menu-demo">
              <div class="menu-item">📋 <strong>Copiar</strong> - Duplica el elemento</div>
              <div class="menu-item">✂️ <strong>Cortar</strong> - Mueve el elemento</div>
              <div class="menu-item">📋 <strong>Pegar</strong> - Pega lo copiado/cortado</div>
              <div class="menu-item">🗑️ <strong>Eliminar</strong> - Envía a papelera</div>
              <div class="menu-item">✏️ <strong>Renombrar</strong> - Cambiar nombre</div>
              <div class="menu-item">⚙️ <strong>Propiedades</strong> - Ver detalles</div>
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
            <h2>🎯 Juego: Hunter</h2>
            <p>¡Vamos a practicar! Haz clic en los objetivos lo más rápido posible:</p>
            <br/>
            <div style="background:rgba(16,185,129,0.1);border-radius:12px;padding:20px;text-align:center">
              <p style="font-size:1.2rem">🎮 <strong>Nivel Principiante</strong></p>
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
      icon: '🌐',
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
            <h2>🌍 ¿Qué es un navegador?</h2>
            <p>Un navegador es el programa que usas para ver páginas web:</p>
            <br/>
            <div class="browsers-list">
              <div class="browser-item">
                <span class="browser-icon">🔵</span>
                <div>
                  <strong>Google Chrome</strong>
                  <p>El más popular, muy rápido</p>
                </div>
              </div>
              <div class="browser-item">
                <span class="browser-icon">🟣</span>
                <div>
                  <strong>Microsoft Edge</strong>
                  <p>El de Windows, mejorado</p>
                </div>
              </div>
              <div class="browser-item">
                <span class="browser-icon">🟠</span>
                <div>
                  <strong>Mozilla Firefox</strong>
                  <p>Enfocado en privacidad</p>
                </div>
              </div>
              <div class="browser-item">
                <span class="browser-icon">🔵</span>
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
            <h2>🔍 Búsquedas efectivas</h2>
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
            <h2>🔒 Navegación segura</h2>
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
              <strong>⚠️ NUNCA:</strong>
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
      icon: '🛠️',
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
            <h2>☁️ ¿Qué es Google Drive?</h2>
            <p>Drive es tu espacio de almacenamiento en la nube:</p>
            <br/>
            <div class="drive-features">
              <div class="feature">
                <span>📁</span>
                <div>
                  <strong>15 GB gratis</strong>
                  <p>Espacio para archivos, fotos, emails</p>
                </div>
              </div>
              <div class="feature">
                <span>📱</span>
                <div>
                  <strong>Acceso desde cualquier lugar</strong>
                  <p>Celular, tablet, computador</p>
                </div>
              </div>
              <div class="feature">
                <span>👥</span>
                <div>
                  <strong>Compartir archivos</strong>
                  <p>Envía documentos sin usar email</p>
                </div>
              </div>
              <div class="feature">
                <span>🤝</span>
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
            <h2>📤 Subir archivos a Drive</h2>
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
            <h2: >👥 Compartir en Drive</h2>
            <p>Comparte tus archivos de forma segura:</p>
            <br/>
            <div class="share-options">
              <div class="share-option">
                <span class="share-icon">🔗</span>
                <div>
                  <strong>Enlace</strong>
                  <p>Copia y envía el link</p>
                  <span class="badge">Público / Restringido</span>
                </div>
              </div>
              <div class="share-option">
                <span class="share-icon">✉️</span>
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

    ia_basics: {
      id: 'ia_basics',
      name: 'Inteligencia Artificial',
      icon: '🤖',
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
            <h2>🧠 ¿Qué es la Inteligencia Artificial?</h2>
            <p>La IA es tecnología que puede aprender y tomar decisiones:</p>
            <br/>
            <div class="ai-types">
              <div class="type-card">
                <span class="type-icon">💬</span>
                <h4>IA Conversacional</h4>
                <p>ChatGPT, Siri, Alexa</p>
              </div>
              <div class="type-card">
                <span class="type-icon">🎨</span>
                <h4>IA Generativa</h4>
                <p>Crear imágenes, texto, música</p>
              </div>
              <div class="type-card">
                <span class="type-icon">🔍</span>
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
            <h2>✍️ Escribiendo Prompts efectivos</h2>
            <p>Un "prompt" es lo que le dices a la IA. ¡Aprende a hacerlo bien!</p>
            <br/>
            <div class="prompt-structure">
              <div class="structure-element">
                <span class="elem-icon">📋</span>
                <div>
                  <strong>Contexto</strong>
                  <p>"Soy estudiante de cocina"</p>
                </div>
              </div>
              <div class="structure-element">
                <span class="elem-icon">🎯</span>
                <div>
                  <strong>Tarea</strong>
                  <p>"Necesito una receta"</p>
                </div>
              </div>
              <div class="structure-element">
                <span class="elem-icon">📝</span>
                <div>
                  <strong>Formato</strong>
                  <p>"En formato de lista"</p>
                </div>
              </div>
            </div>
            <br/>
            <div class="good-bad">
              <div class="example bad">
                <span>❌</span>
                <div>
                  <strong>Dame una receta</strong>
                  <p>Muy vaga, resultados imprecisos</p>
                </div>
              </div>
              <div class="example good">
                <span>✅</span>
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
            <h2>🌟 Usos prácticos de la IA</h2>
            <p>La IA puede ayudarte en muchas tareas:</p>
            <br/>
            <div class="ai-uses">
              <div class="use-case">
                <span>📝</span>
                <div>
                  <strong>Escritura</strong>
                  <p>Revisar textos, corregir ortografía, generar ideas</p>
                </div>
              </div>
              <div class="use-case">
                <span>🧮</span>
                <div>
                  <strong>Programación</strong>
                  <p>Escribir código, explicar errores, optimizar</p>
                </div>
              </div>
              <div class="use-case">
                <span>🎓</span>
                <div>
                  <strong>Aprendizaje</strong>
                  <p>Explicar conceptos, practicar idiomas</p>
                </div>
              </div>
              <div class="use-case">
                <span>📊</span>
                <div>
                  <strong>Análisis</strong>
                  <p>Resumir documentos, organizar información</p>
                </div>
              </div>
            </div>
            <br/>
            <div style="background:rgba(236,72,153,0.1);border-radius:12px;padding:16px">
              <strong>💡 Recuerda:</strong> La IA es una herramienta de ayuda, no sustituye el aprendizaje profundo ni el pensamiento crítico.
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