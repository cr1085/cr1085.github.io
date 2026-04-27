/* ══════════════════════════════════════════════
   LUMI PLATFORM ADVENTURE - Juego Educativo Completo
   Mundos Procedurales, Dimensiones, Power-ups, Misiones
   ══════════════════════════════════════════════ */

const LUMI_PLATFORM = {
  // Configuración
  config: {
    canvasWidth: 800,
    canvasHeight: 500,
    gravity: 0.5,
    jumpForce: -13,
    moveSpeed: 6,
    worldWidth: 3000,
    worldHeight: 700
  },
  
  // Estado del juego
  state: {
    screen: "title", // title, playing, playing, gameOver, worldComplete
    player: null,
    world: 1,
    dimension: 0, // 0=normal, 1=espacio, 2=acuático, 3=fantasma
    score: 0,
    coins: 0,
    xp: 0,
    lives: 3,
    powerups: [],
    activePowerup: null,
    powerupTimer: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    mission: null,
    missionProgress: 0,
    missionTarget: 5,
    enemiesDefeated: 0,
    lastEnemyDefeatTime: 0
  },
  
  // Mundos disponibles
  worlds: [
    { name: "Bosque Mágico", theme: "forest", color1: "#1a472a", color2: "#2d5a27", enemies: ["🦊", "🐺", "🦉"], items: ["🍄", "🌸", "🌿"] },
    { name: "Ciudad Futurista", theme: "city", color1: "#1a1a3e", color2: "#4a4a8a", enemies: ["🤖", "🚗", "🛸"], items: ["⚡", "💎", "🔮"] },
    { name: "Desierto Dorado", theme: "desert", color1: "#8B4513", color2: "#DAA520", enemies: ["🦂", "🐍", "🦅"], items: ["🌵", "💀", "🏺"] },
    { name: "Océano Profundo", theme: "ocean", color1: "#006994", color2: "#00CED1", enemies: ["🐙", "🦈", "🐡"], items: ["🐚", "⭐", "🌊"] },
    { name: "Volcán Ardiente", theme: "volcano", color1: "#8B0000", color2: "#FF4500", enemies: ["🐉", "🌋", "🔥"], items: ["💎", "🌋", "⚔️"] },
    { name: "Reino del Aprendizaje", theme: "academy", color1: "#4B0082", color2: "#9370DB", enemies: ["📚", "🧙", "🎓"], items: ["📖", "✏️", "🎯"] }
  ],
  
  // Dimensiones
  dimensions: [
    { name: "Dimensión Normal", bg: "linear-gradient(to bottom, #87CEEB, #E0F7FA)", gravityMod: 1, speedMod: 1 },
    { name: "Dimensión Espacial", bg: "linear-gradient(to bottom, #0c1445, #1a1a3e)", gravityMod: 0.7, speedMod: 1.2, stars: true },
    { name: "Dimensión Acuática", bg: "linear-gradient(to bottom, #006994, #00CED1)", gravityMod: 0.3, speedMod: 0.8, bubbles: true },
    { name: "Dimensión Fantasma", bg: "linear-gradient(to bottom, #1a1a2e, #2d2d44)", gravityMod: 0.8, speedMod: 0.9, ghosts: true }
  ],
  
  // Preguntas por materia
  questions: {
    matemáticas: [
      { q: "¿Cuánto es 7 + 5?", a: "12", options: ["10", "11", "12", "13"] },
      { q: "¿Cuánto es 15 - 8?", a: "7", options: ["5", "6", "7", "8"] },
      { q: "¿Cuánto es 6 × 4?", a: "24", options: ["20", "22", "24", "26"] },
      { q: "¿Cuánto es 36 ÷ 6?", a: "6", options: ["4", "5", "6", "7"] },
      { q: "¿Cuánto es 123 + 77?", a: "200", options: ["190", "200", "210", "220"] },
      { q: "¿Cuánto es 100 - 45?", a: "55", options: ["45", "55", "65", "75"] },
      { q: "¿Cuánto es 8 × 7?", a: "56", options: ["48", "54", "56", "62"] },
      { q: "¿Cuánto es 81 ÷ 9?", a: "9", options: ["7", "8", "9", "10"] },
      { q: "¿Cuánto es 25 + 38?", a: "63", options: ["53", "58", "63", "68"] },
      { q: "¿Cuánto es 50 - 17?", a: "33", options: ["27", "33", "37", "43"] }
    ],
    español: [
      { q: "¿Cuál es un sustantivo?", a: "Casa", options: ["Correr", "Rojo", "Casa", "Muy"] },
      { q: "¿Cuántas sílabas tiene 'libro'?", a: "2", options: ["1", "2", "3", "4"] },
      { q: "¿Qué tipo de palabra es 'hermoso'?", a: "Adjetivo", options: ["Verbo", "Sustantivo", "Adjetivo", "Preposición"] },
      { q: "¿Se escribe con 'v'?", a: "Villa", options: ["Billa", "Villa", "Villa", "Vila"] },
      { q: "¿Cuál es un verbo?", a: "Saltar", options: ["Azul", "Grande", "Saltar", "Bueno"] },
      { q: "¿Qué es un artículo?", a: "Palabra que acompaña al sustantivo", options: ["Acción", "Palabra que acompaña al sustantivo", "Cualidad", "Cantidad"] },
      { q: "¿'Amigo' es...", a: "Sustantivo", options: ["Verbo", "Adjetivo", "Sustantivo", "Adverbio"] },
      { q: "¿Qué signo va al final de una pregunta?", a: "?", options: [".", "!", "?", ";"] },
      { q: "¿'Rápidamente' es...", a: "Adverbio", options: ["Verbo", "Sustantivo", "Adjetivo", "Adverbio"] },
      { q: "¿Cuál es el sujeto en 'El niño corre'?", a: "El niño", options: ["Corre", "El niño", "Niño", "El"] }
    ],
    "ciencias naturales": [
      { q: "¿Qué planeta es el más cercano al sol?", a: "Mercurio", options: ["Venus", "Mercurio", "Marte", "Tierra"] },
      { q: "¿Cuántas patas tiene una araña?", a: "8", options: ["6", "7", "8", "10"] },
      { q: "¿Qué gas respiran las plantas?", a: "CO2", options: ["Oxígeno", "Nitrógeno", "CO2", "Hidrógeno"] },
      { q: "¿Qué órgano bombea sangre?", a: "Corazón", options: ["Pulmón", "Corazón", "Hígado", "Estómago"] },
      { q: "¿El agua hierve a cuántos grados?", a: "100°C", options: ["90°C", "100°C", "110°C", "80°C"] },
      { q: "¿Cuántos huesos tiene el cuerpo adulto?", a: "206", options: ["186", "206", "226", "256"] },
      { q: "¿Qué planeta tiene anillos?", a: "Saturno", options: ["Júpiter", "Saturno", "Urano", "Neptuno"] },
      { q: "¿De qué color es el sol?", a: "Amarillo", options: ["Rojo", "Naranja", "Amarillo", "Blanco"] },
      { q: "¿Qué tipo de animal es el perro?", a: "Mamífero", options: ["Reptil", "Mamífero", "Ave", "Pez"] },
      { q: "¿La energía del sol se llama?", a: "Solar", options: ["Nuclear", "Solar", "Eólica", "Hidráulica"] }
    ],
    sociales: [
      { q: "¿Capital de Colombia?", a: "Bogotá", options: ["Medellín", "Cali", "Bogotá", "Barranquilla"] },
      { q: "¿Cuántos continentes hay?", a: "5", options: ["4", "5", "6", "7"] },
      { q: "¿Qué ocean está al oeste de Colombia?", a: "Pacífico", options: ["Atlántico", "Pacífico", "Índico", "Ártico"] },
      { q: "¿Quién descubrió América?", a: "Cristóbal Colón", options: ["Magallanes", "Cristóbal Colón", "Américo Vespucio", "Cortés"] },
      { q: "¿Qué color tiene la bandera de Colombia?", a: "Amarillo, azul y rojo", options: ["Rojo y blanco", "Verde y blanco", "Amarillo, azul y rojo", "Azul y blanco"] },
      { q: "¿Cuántos departamentos tiene Colombia?", a: "32", options: ["30", "32", "34", "36"] },
      { q: "¿Qué río es el más largo de Colombia?", a: "Magdalena", options: ["Cauca", "Magdalena", "Amazonas", "Orinoco"] },
      { q: "¿En qué año llegó el hombre a la luna?", a: "1969", options: ["1965", "1969", "1973", "1975"] },
      { q: "¿Quién fue Simón Bolívar?", a: "El Libertador", options: ["Conquistador", "El Libertador", "Presidente", "Explorador"] },
      { q: "¿Qué tipo de gobierno tiene Colombia?", a: "República", options: ["Monarquía", "República", "Dictadura", "Anarquía"] }
    ],
    inglés: [
      { q: "¿Cómo se dice 'gato' en inglés?", a: "cat", options: ["dog", "cat", "bird", "fish"] },
      { q: "¿How many =?", a: "Cuántos", options: ["Cuándo", "Cuántos", "Cómo", "Por qué"] },
      { q: "¿Hello significa?", a: "Hola", options: ["Adiós", "Hola", "Gracias", "Por favor"] },
      { q: "¿Apple es?", a: "Manzana", options: ["Naranja", "Manzana", "Uva", "Plátano"] },
      { q: "¿What is your name?", a: "¿Cómo te llamas?", options: ["¿Quién eres?", "¿Cómo te llamas?", "¿Qué haces?", "¿Dónde estás?"] },
      { q: "¿Good morning significa?", a: "Buenos días", options: ["Buenas noches", "Buenos días", "Buenas tardes", "Hola"] },
      { q: "¿Book se traduce como?", a: "Libro", options: ["Caja", "Libro", "Bolso", "Cuaderno"] },
      { q: "¿I am =?", a: "Yo soy", options: ["Tú eres", "Yo soy", "Él es", "Nosotros somos"] },
      { q: "¿Blue es?", a: "Azul", options: ["Rojo", "Verde", "Azul", "Amarillo"] },
      { q: "¿Thank you significa?", a: "Gracias", options: ["Por favor", "Gracias", "Hola", "Adiós"] }
    ],
    francés: [
      { q: "¿Bonjour significa?", a: "Hola/Buenos días", options: ["Adiós", "Hola/Buenos días", "Gracias", "Por favor"] },
      { q: "¿Comment t'appelles-tu?", a: "¿Cómo te llamas?", options: ["¿Quién eres?", "¿Cómo te llamas?", "¿Qué haces?", "¿Dónde vives?"] },
      { q: "¿Merci significa?", a: "Gracias", options: ["Por favor", "Gracias", "Hola", "Adiós"] },
      { q: "¿Chat es?", a: "Gato", options: ["Perro", "Gato", "Pájaro", "Pez"] },
      { q: "¿Oui significa?", a: "Sí", options: ["No", "Sí", "Hola", "Adiós"] }
    ],
    alemán: [
      { q: "¿Guten Tag significa?", a: "Buenos días", options: ["Adiós", "Buenos días", "Gracias", "Por favor"] },
      { q: "¿Wie heißen Sie?", a: "¿Cómo se llama?", options: ["¿Quién es?", "¿Cómo se llama?", "¿Qué hace?", "¿Dónde está?"] },
      { q: "¿Danke significa?", a: "Gracias", options: ["Por favor", "Gracias", "Hola", "Adiós"] },
      { q: "¿Hund es?", a: "Perro", options: ["Gato", "Perro", "Pájaro", "Pez"] },
      { q: "¿Ja significa?", a: "Sí", options: ["No", "Sí", "Hola", "Adiós"] }
    ],
    coreano: [
      { q: "¿Annyeonghaseyo significa?", a: "Hola", options: ["Adiós", "Hola", "Gracias", "Por favor"] },
      { q: "¿Gamsahamnida significa?", a: "Gracias", options: ["Por favor", "Gracias", "Hola", "Adiós"] },
      { q: "¿Annyeong significa?", a: "Adiós/Hola", options: ["Gracias", "Por favor", "Adiós/Hola", "Sí"] },
      { q: "¿Namae naneun?", a: "¿Cómo te llamas?", options: ["¿Quién eres?", "¿Cómo te llamas?", "¿Qué haces?", "¿Dónde estás?"] },
      { q: "¿Ne significa?", a: "Sí", options: ["No", "Sí", "Gracias", "Por favor"] }
    ],
    chino: [
      { q: "¿Nǐ hǎo significa?", a: "Hola", options: ["Adiós", "Hola", "Gracias", "Por favor"] },
      { q: "¿Xièxie significa?", a: "Gracias", options: ["Por favor", "Gracias", "Hola", "Adiós"] },
      { q: "¿Zàijiàn significa?", a: "Adiós", options: ["Gracias", "Por favor", "Hola", "Adiós"] },
      { q: "¿Nǐ jiào shénme míngzì?", a: "¿Cómo te llamas?", options: ["¿Quién eres?", "¿Cómo te llamas?", "¿Qué haces?", "¿Dónde vives?"] },
      { q: "¿Duì significa?", a: "Sí", options: ["No", "Sí", "Gracias", "Por favor"] }
    ],
    portugués: [
      { q: "¿Olá significa?", a: "Hola", options: ["Adiós", "Hola", "Gracias", "Por favor"] },
      { q: "¿Obrigado/a significa?", a: "Gracias", options: ["Por favor", "Gracias", "Hola", "Adiós"] },
      { q: "¿Tchau significa?", a: "Adiós", options: ["Gracias", "Por favor", "Hola", "Adiós"] },
      { q: "¿Como você se chama?", a: "¿Cómo te llamas?", options: ["¿Quién eres?", "¿Cómo te llamas?", "¿Qué haces?", "¿Dónde estás?"] },
      { q: "¿Sim significa?", a: "Sí", options: ["No", "Sí", "Gracias", "Por favor"] }
    ],
    tecnología: [
      { q: "¿Qué significa CPU?", a: "Unidad Central de Procesamiento", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Processing Unit"] },
      { q: "¿Qué es un pixel?", a: "Un punto de imagen", options: ["Un tipo de virus", "Un punto de imagen", "Un programa", "Una marca"] },
      { q: "¿HTML significa?", a: "Lenguaje de Marcado de Hipertexto", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"] },
      { q: "¿Qué es Internet?", a: "Red mundial de computadoras", options: ["Un programa", "Red mundial de computadoras", "Un tipo de virus", "Una marca"] },
      { q: "¿Qué significa www?", a: "World Wide Web", options: ["World Wide Web", "Wide World Web", "Web World Wide", "World Web Wide"] }
    ],
    arte: [
      { q: "¿Qué color resulta de mezcla azul + amarillo?", a: "Verde", options: ["Morado", "Naranja", "Verde", "Rojo"] },
      { q: "¿Qué es un autorretrato?", a: "Dibujo de uno mismo", options: ["Paisaje", "Dibujo de uno mismo", "Retrato de otra persona", "Pintura de flores"] },
      { q: "¿Van Gogh pintó 'La Noche Estrellada'?", a: "Sí", options: ["Sí", "No", "No sé", "Fue Picasso"] },
      { q: "¿Qué herramienta usa un pintor?", a: "Pincel", options: ["Martillo", "Pincel", "Tijeras", "Regla"] },
      { q: "¿El mural es un arte...", a: "Público", options: ["Digital", "Público", "De interiores", "De interiores"] }
    ],
    música: [
      { q: "¿Cuántas notas musicales hay?", a: "7", options: ["5", "6", "7", "8"] },
      { q: "¿Qué es el tempo?", a: "La velocidad de la música", options: ["El volumen", "La velocidad de la música", "El tono", "La melodía"] },
      { q: "¿Una guitar tiene cuántas cuerdas?", a: "6", options: ["4", "5", "6", "8"] },
      { q: "¿El piano es un instrumento...", a: "De teclas", options: ["De viento", "De cuerdas", "De teclas", "De percusión"] },
      { q: "¿Qué significa 'forte' en música?", a: "Fuerte", options: ["Suave", "Fuerte", "Rápido", "Lento"] }
    ],
    educación_física: [
      { q: "¿Cuántos jugadores tiene un equipo de fútbol?", a: "11", options: ["9", "10", "11", "12"] },
      { q: "¿Qué deporte se juega con pelota y arco?", a: "Básquetbol", options: ["Fútbol", "Básquetbol", "Voleibol", "Tenis"] },
      { q: "¿Un maratón es una carrera de?", a: "Larga distancia", options: ["Corta distancia", "Larga distancia", "Media distancia", "Relevos"] },
      { q: "¿El calentamiento sirve para?", a: "Preparar el cuerpo", options: ["Terminar rápido", "Preparar el cuerpo", "Bajar de peso", "Lesionar"] },
      { q: "¿Cuántos minutos dura un partido de fútbol?", a: "90", options: ["45", "60", "90", "120"] }
    ],
    religion: [
      { q: "¿Quién creó el mundo?", a: "Dios", options: ["Dios", "Los aliens", "La naturaleza", "El universo"] },
      { q: "¿Qué libro sagrado tienen los cristianos?", a: "Biblia", options: ["Corán", "Biblia", "Torá", "Vedas"] },
      { q: "¿Qué es la oración?", a: "Hablar con Dios", options: ["Cantar", "Hablar con Dios", "Leer", "Escribir"] },
      { q: "¿Jesús nació en?", a: "Belén", options: ["Nazaret", "Jerusalén", "Belén", "Cairo"] },
      { q: "¿Qué día descansamos?", a: "Domingo", options: ["Sábado", "Domingo", "Lunes", "Viernes"] }
    ],
    ética: [
      { q: "¿Qué es ser honesto?", a: "Decir la verdad", options: ["Ser rico", "Decir la verdad", "Ser popular", "No trabajar"] },
      { q: "¿Qué significa respetar a otros?", a: "Tratarlos bien", options: ["Ignorarlos", "Tratarlos bien", "Competir con ellos", "Hacer lo que dicen"] },
      { q: "¿Qué es la solidaridad?", a: "Ayudar a otros", options: ["Estar solo", "Ayudar a otros", "No participar", "Ganar siempre"] },
      { q: "¿Por qué es importante la tolerancia?", a: "Para aceptar diferencias", options: ["Para estar solos", "Para aceptar diferencias", "Para ser iguales", "Para evitar hablar"] },
      { q: "¿Qué significa ser empático?", a: "Entender los sentimientos de otros", options: ["No sentir", "Entender los sentimientos de otros", "Solo pensar en uno", "Ser dominante"] }
    ]
  },
  
  // Power-ups
  powerups: [
    { id: "fly", name: "Vuelo Mágico", icon: "🦋", duration: 15000, desc: "Vuela por el mundo" },
    { id: "invincible", name: "Invencibilidad", icon: "⭐", duration: 10000, desc: "No te afectan los enemigos" },
    { id: "magnet", name: "Imán", icon: "🧲", duration: 20000, desc: "Atrae las monedas" },
    { id: "double", name: "Doble XP", icon: "💫", duration: 25000, desc: "XP doble" },
    { id: "slow", name: "Tiempo Lento", icon: "⏰", duration: 12000, desc: "Todo se mueve más lento" },
    { id: "jump", name: "Super Salto", icon: "🚀", duration: 18000, desc: "Saltos más altos" }
  ],
  
  // Enemigos
  enemies: [],
  platforms: [],
  coins: [],
  items: [],
  particles: [],
  bubbles: [],
  stars: [],
  
  // Canvas
  canvas: null,
  ctx: null,
  keys: {},
  camera: { x: 0, y: 0 },
  animFrame: 0,
  gameLoopId: null,
  
  // ══════════════════════════════════════════════
  // INICIALIZACIÓN
  // ══════════════════════════════════════════════
  init() {
    this.createContainer();
    this.canvas = document.getElementById("lumi-platform-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.config.canvasWidth;
    this.canvas.height = this.config.canvasHeight;
    this.setupControls();
    this.showTitle();
  },
  
  createContainer() {
    if (document.getElementById("lumi-platform-container")) return;
    
    const container = document.createElement("div");
    container.id = "lumi-platform-container";
    container.innerHTML = `
      <div class="lumi-platform-overlay">
        <div class="lp-header">
          <h2>🌟 Aventura de Lumi</h2>
          <button class="lp-close" onclick="LUMI_PLATFORM.close()">✕</button>
        </div>
        <canvas id="lumi-platform-canvas"></canvas>
        <div class="lp-hud">
          <div class="hud-section">
            <span>🏆 Puntos: <span id="lp-score">0</span></span>
            <span>🪙 Monedas: <span id="lp-coins">0</span></span>
            <span>⭐ XP: <span id="lp-xp">0</span></span>
          </div>
          <div class="hud-section">
            <span>🌍 Mundo: <span id="lp-world">Bosque Mágico</span></span>
            <span>🔮 Dimensión: <span id="lp-dimension">Normal</span></span>
            <span>❤️ Vidas: <span id="lp-lives">3</span></span>
          </div>
          <div class="hud-section" id="lp-powerup-display"></div>
        </div>
        <div class="lp-mission" id="lp-mission">
          <strong>🎯 Misión:</strong> <span id="lp-mission-text">Completa el mundo</span>
        </div>
        <div class="lp-controls">
          <span>←→ Mover</span><span>Espacio= Saltar</span><span>D= Dimensión</span><span>P= Pausar</span><span>Esc= Salir</span>
        </div>
        <div class="lp-mobile-controls">
          <button class="mobile-btn mobile-btn-left" ontouchstart="LUMI_PLATFORM.keys['ArrowLeft']=true" ontouchend="LUMI_PLATFORM.keys['ArrowLeft']=false">◀</button>
          <button class="mobile-btn mobile-btn-right" ontouchstart="LUMI_PLATFORM.keys['ArrowRight']=true" ontouchend="LUMI_PLATFORM.keys['ArrowRight']=false">▶</button>
          <button class="mobile-btn mobile-btn-jump" ontouchstart="LUMI_PLATFORM.keys['Space']=true" ontouchend="LUMI_PLATFORM.keys['Space']=false">⬆</button>
          <button class="mobile-btn mobile-btn-dim" ontouchstart="LUMI_PLATFORM.changeDimension()">🔮</button>
          <button class="mobile-btn mobile-btn-pause" ontouchstart="LUMI_PLATFORM.togglePause()">⏸</button>
        </div>
      </div>
      
      <div class="lp-modal" id="lp-question-modal">
        <div class="lp-question-card">
          <div class="q-header">
            <span class="q-icon">❓</span>
            <h3>¡Desafío Educativo!</h3>
          </div>
          <p class="q-subject" id="q-subject">Materia: Matemáticas</p>
          <p class="q-text" id="q-text">¿Cuánto es 5 + 3?</p>
          <div class="q-options" id="q-options"></div>
        </div>
      </div>
      
      <div class="lp-modal" id="lp-result-modal">
        <div class="lp-result-card">
          <div class="r-emoji" id="r-emoji">🎉</div>
          <h3 id="r-title">¡Correcto!</h3>
          <p id="r-desc">+20 XP</p>
          <button onclick="LUMI_PLATFORM.closeResult()">Continuar</button>
        </div>
      </div>
      
      <div class="lp-modal" id="lp-world-complete-modal">
        <div class="lp-world-card">
          <div class="wc-emoji">🏆</div>
          <h2 id="wc-title">¡Mundo Completado!</h2>
          <div class="wc-stats">
            <p>Monedas: <span id="wc-coins">0</span></p>
            <p>XP Ganado: <span id="wc-xp">0</span></p>
            <p>Respuestas Correctas: <span id="wc-correct">0</span></p>
          </div>
          <button onclick="LUMI_PLATFORM.nextWorld()">Siguiente Mundo →</button>
        </div>
      </div>
      
      <div class="lp-modal" id="lp-gameover-modal">
        <div class="lp-gameover-card">
          <div class="go-emoji">💫</div>
          <h2>¡Fin del Juego!</h2>
          <div class="go-stats">
            <p>Mundos completados: <span id="go-worlds">0</span></p>
            <p>Puntaje total: <span id="go-score">0</span></p>
            <p>XP acumulado: <span id="go-xp">0</span></p>
          </div>
          <button onclick="LUMI_PLATFORM.restart()">Jugar de Nuevo 🔄</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    
    const style = document.createElement("style");
    style.textContent = `
      #lumi-platform-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 11000;
        display: none;
        font-family: 'Nunito', sans-serif;
      }
      #lumi-platform-container.active { display: flex; }
      .lumi-platform-overlay {
        width: 100%;
        max-width: 1050px;
        margin: auto;
        background: linear-gradient(180deg, #1a1a3e 0%, #0f0f23 100%);
        border-radius: 25px;
        padding: 20px;
        box-shadow: 0 0 60px rgba(108,92,231,0.5);
      }
      .lp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      .lp-header h2 {
        color: #ffd700;
        font-size: 28px;
        text-shadow: 0 0 20px rgba(255,215,0,0.5);
      }
      .lp-close {
        background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
        border: none;
        color: white;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        font-size: 22px;
        cursor: pointer;
        transition: all 0.3s;
      }
      .lp-close:hover { transform: scale(1.1) rotate(90deg); }
      #lumi-platform-canvas {
        width: 100%;
        border-radius: 15px;
        border: 4px solid #6c5ce7;
        box-shadow: 0 0 30px rgba(108,92,231,0.4);
      }
      .lp-hud {
        display: flex;
        justify-content: space-between;
        padding: 15px;
        background: rgba(255,255,255,0.08);
        border-radius: 12px;
        margin-top: 12px;
        flex-wrap: wrap;
        gap: 10px;
      }
      .hud-section {
        color: white;
        font-size: 15px;
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }
      .hud-section span span { color: #ffd700; font-weight: bold; }
      #lp-powerup-display { color: #fd79a8; }
      .lp-mission {
        text-align: center;
        padding: 12px;
        background: rgba(253,121,168,0.2);
        border-radius: 10px;
        margin-top: 10px;
        color: white;
      }
      .lp-controls {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 10px;
        color: #888;
        font-size: 13px;
      }
      .lp-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 11001;
      }
      .lp-modal.active { display: flex; }
      .lp-question-card, .lp-result-card, .lp-world-card, .lp-gameover-card {
        background: white;
        padding: 35px;
        border-radius: 25px;
        text-align: center;
        max-width: 450px;
        animation: popIn 0.3s ease;
      }
      @keyframes popIn {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .q-header { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 15px; }
      .q-icon { font-size: 40px; }
      .q-header h3 { color: #6c5ce7; font-size: 24px; margin: 0; }
      .q-subject { color: #888; font-size: 14px; margin-bottom: 10px; }
      .q-text { font-size: 22px; color: #2d3436; margin-bottom: 20px; font-weight: bold; }
      .q-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .q-option {
        padding: 15px;
        background: linear-gradient(135deg, #a29bfe, #6c5ce7);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .q-option:hover { transform: scale(1.05); box-shadow: 0 5px 20px rgba(108,92,231,0.4); }
      .r-emoji, .wc-emoji, .go-emoji { font-size: 70px; animation: bounce 0.5s; }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
      .lp-result-card h3 { color: #00b894; font-size: 28px; margin: 15px 0; }
      .lp-result-card p { color: #636e72; font-size: 20px; }
      .lp-result-card button, .lp-world-card button, .lp-gameover-card button {
        background: linear-gradient(135deg, #6c5ce7, #a29bfe);
        color: white;
        border: none;
        padding: 18px 45px;
        border-radius: 30px;
        font-size: 18px;
        cursor: pointer;
        margin-top: 20px;
        transition: all 0.3s;
      }
      .lp-result-card button:hover, .lp-world-card button:hover, .lp-gameover-card button:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 30px rgba(108,92,231,0.5);
      }
      .wc-title, .go-stats p { color: #2d3436; }
      .wc-stats { background: #f8f9fa; padding: 20px; border-radius: 15px; margin: 20px 0; }
      .wc-stats p { color: #636e72; font-size: 16px; margin: 8px 0; }
      .wc-stats span { color: #6c5ce7; font-weight: bold; }
      .lp-gameover-card h2 { color: #6c5ce7; margin: 15px 0; }
      
      /* ===== CONTROLES - LÓGICA SIMPLE ===== */
      /* Por defecto: controles táctiles ocultos */
      .lp-mobile-controls { display: none; }
      
      /* En tablets y móviles (< 1024px): mostrar táctiles, ocultar teclado */
      @media (max-width: 1023px) {
        .lumi-platform-overlay { padding: 8px; border-radius: 12px; }
        .lp-header { margin-bottom: 8px; }
        .lp-header h2 { font-size: 18px; padding: 5px; }
        .lp-close { width: 35px; height: 35px; font-size: 18px; }
        .lp-hud { 
          flex-direction: row; 
          flex-wrap: wrap; 
          justify-content: center; 
          padding: 8px; 
          gap: 8px;
        }
        .hud-section { 
          justify-content: center; 
          font-size: 11px; 
          gap: 8px;
        }
        .hud-section span { font-size: 10px; }
        .lp-mission { 
          font-size: 12px; 
          padding: 6px; 
          margin-top: 6px;
        }
        .lp-controls { display: none !important; }
        .lp-mobile-controls { 
          display: flex; 
        }
        #lumi-platform-canvas { 
          border-width: 2px; 
        }
        .lp-question-card, .lp-result-card, .lp-world-card, .lp-gameover-card { 
          padding: 15px; 
          margin: 10px; 
          border-radius: 15px;
        }
        .q-text { font-size: 16px; }
        .q-option { padding: 10px; font-size: 13px; }
        .r-emoji, .wc-emoji, .go-emoji { font-size: 50px; }
        .lp-result-card h3, .wc-title { font-size: 20px; }
        .q-header h3 { font-size: 18px; }
        .lp-result-card button, .lp-world-card button, .lp-gameover-card button {
          padding: 12px 25px;
          font-size: 14px;
        }
      }
      
      /* En PC (>= 1024px): mostrar teclado, ocultar táctiles */
      @media (min-width: 1024px) {
        .lp-controls { display: flex; }
        .lp-mobile-controls { display: none !important; }
      }
      
      /* En móviles pequeños (< 600px) */
      @media (max-width: 600px) {
        .lp-header h2 { font-size: 14px; }
        .lp-hud { padding: 5px; }
        .hud-section span { font-size: 9px; }
        .lp-mission { font-size: 11px; padding: 5px; }
        .lp-question-card, .lp-result-card, .lp-world-card, .lp-gameover-card { 
          padding: 12px; 
          margin: 8px; 
          max-width: 90%;
        }
        .q-text { font-size: 14px; }
        .q-option { padding: 8px; font-size: 12px; }
        .q-options { gap: 8px; }
      }
      
      /* Estilos de botones táctiles */
      .lp-mobile-controls {
        justify-content: space-between;
        padding: 10px;
        margin-top: 8px;
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
      }
      
      .mobile-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mobile-btn:active { transform: scale(0.9); }
      .mobile-btn-left { background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: white; }
      .mobile-btn-right { background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: white; }
      .mobile-btn-jump { background: linear-gradient(135deg, #00b894, #00cec9); color: white; }
      .mobile-btn-dim { background: linear-gradient(135deg, #fd79a8, #e84393); color: white; font-size: 18px; }
      .mobile-btn-pause { background: linear-gradient(135deg, #fdcb6e, #f39c12); color: white; }
    `;
    document.head.appendChild(style);
  },
  
  setupControls() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      if (e.code === "Escape") this.close();
      if (e.code === "KeyP" && this.state.screen === "playing") {
        this.state.screen = "paused";
      } else if (e.code === "KeyP" && this.state.screen === "paused") {
        this.state.screen = "playing";
        this.gameLoop();
      }
      if (e.code === "KeyD" && this.state.screen === "playing") {
        this.changeDimension();
      }
    });
    window.addEventListener("keyup", (e) => this.keys[e.code] = false);
  },
  
  togglePause() {
    if (this.state.screen === "playing") {
      this.state.screen = "paused";
    } else if (this.state.screen === "paused") {
      this.state.screen = "playing";
      this.gameLoop();
    }
  },
  
  // ══════════════════════════════════════════════
  // ABRIR/CERRAR
  // ══════════════════════════════════════════════
  open() {
    this.init();
    document.getElementById("lumi-platform-container").classList.add("active");
  },
  
  close() {
    cancelAnimationFrame(this.gameLoopId);
    this.state.screen = "title";
    const container = document.getElementById("lumi-platform-container");
    if (container) container.classList.remove("active");
  },
  
  // ══════════════════════════════════════════════
  // PANTALLA DE TÍTULO
  // ══════════════════════════════════════════════
  showTitle() {
    const ctx = this.ctx;
    const w = this.config.canvasWidth;
    const h = this.config.canvasHeight;
    
    const render = () => {
      // Fondo
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, "#1a1a3e");
      gradient.addColorStop(0.5, "#2d2d5a");
      gradient.addColorStop(1, "#1a1a3e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      
      // Estrellas
      for (let i = 0; i < 100; i++) {
        const x = (i * 137 + this.animFrame * 0.2) % w;
        const y = (i * 73) % (h - 100);
        const size = (Math.sin(this.animFrame * 0.05 + i) + 1) * 1.5;
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(this.animFrame * 0.03 + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Título principal
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 38px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 20;
      ctx.fillText("🌟 AVENTURA DE LUMI 🌟", w/2, 70);
      ctx.shadowBlur = 0;
      
      // Subtítulo
      ctx.fillStyle = "#a29bfe";
      ctx.font = "16px Nunito, sans-serif";
      ctx.fillText("¡Explora mundos, aprende y diviértete!", w/2, 100);
      
      // Avatar animado de Lumi - más pequeño
      const lumiX = w/2;
      const lumiY = 200;
      const bounce = Math.sin(this.animFrame * 0.1) * 8;
      
      // Cuerpo
      ctx.fillStyle = "#6c5ce7";
      ctx.fillRect(lumiX - 25, lumiY + 15 - bounce, 50, 45);
      // Cabeza
      ctx.fillStyle = "#ffeaa7";
      ctx.beginPath();
      ctx.arc(lumiX, lumiY - bounce, 35, 0, Math.PI * 2);
      ctx.fill();
      // Ojos
      ctx.fillStyle = "#2d3436";
      ctx.beginPath();
      ctx.arc(lumiX - 10, lumiY - 8 - bounce, 5, 0, Math.PI * 2);
      ctx.arc(lumiX + 10, lumiY - 8 - bounce, 5, 0, Math.PI * 2);
      ctx.fill();
      // Sonrisa
      ctx.strokeStyle = "#2d3436";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lumiX, lumiY + 3 - bounce, 10, 0.2, Math.PI - 0.2);
      ctx.stroke();
      // Antenna
      ctx.strokeStyle = "#fd79a8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lumiX, lumiY - 35 - bounce);
      ctx.lineTo(lumiX, lumiY - 48 - bounce);
      ctx.stroke();
      ctx.fillStyle = "#fd79a8";
      ctx.beginPath();
      ctx.arc(lumiX, lumiY - 52 - bounce, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Información del mundo - más compacta
      const currentWorld = this.worlds[(this.state.world - 1) % this.worlds.length];
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(w/2 - 150, 280, 300, 80);
      ctx.strokeStyle = "#6c5ce7";
      ctx.lineWidth = 2;
      ctx.strokeRect(w/2 - 150, 280, 300, 80);
      
      ctx.fillStyle = "#fff";
      ctx.font = "14px Nunito, sans-serif";
      ctx.fillText(`🌍 Mundo ${this.state.world}: ${currentWorld.name}`, w/2, 310);
      ctx.fillText(`🔮 ${this.dimensions[this.state.dimension].name}`, w/2, 330);
      ctx.fillText(`📚 ${STATE.subject || "matemáticas"}`, w/2, 350);
      
      // Botón jugar - más pequeño y centrado
      const btnY = 400;
      const btnGradient = ctx.createLinearGradient(w/2 - 100, btnY, w/2 + 100, btnY + 45);
      btnGradient.addColorStop(0, "#00b894");
      btnGradient.addColorStop(1, "#00cec9");
      ctx.fillStyle = btnGradient;
      ctx.beginPath();
      ctx.roundRect(w/2 - 100, btnY, 200, 45, 25);
      ctx.fill();
      
      ctx.fillStyle = "white";
      ctx.font = "bold 20px Nunito, sans-serif";
      ctx.fillText("🎮 ¡JUGAR!", w/2, btnY + 30);
      
      this.animFrame++;
      this.gameLoopId = requestAnimationFrame(render);
    };
    render();
    
    this.canvas.onclick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Escalar coordenadas al tamaño real del canvas
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const canvasX = x * scaleX;
      const canvasY = y * scaleY;
      
      if (canvasX > w/2 - 100 && canvasX < w/2 + 100 && canvasY > 400 && canvasY < 445) {
        this.canvas.onclick = null;
        this.startGame();
      }
    };
  },
  
  // ══════════════════════════════════════════════
  // INICIAR JUEGO
  // ══════════════════════════════════════════════
  startGame() {
    this.state.screen = "playing";
    this.state.player = {
      x: 100,
      y: 400,
      vx: 0,
      vy: 0,
      width: 50,
      height: 60,
      onGround: false,
      facing: 1,
      invulnerable: 0
    };
    this.generateWorld();
    this.updateHUD();
    this.gameLoop();
  },
  
  // ══════════════════════════════════════════════
  // GENERAR MUNDO PROCEDURAL
  // ══════════════════════════════════════════════
  generateWorld() {
    const world = this.worlds[(this.state.world - 1) % this.worlds.length];
    const dim = this.dimensions[this.state.dimension];
    
    this.platforms = [];
    this.enemies = [];
    this.coins = [];
    this.items = [];
    this.particles = [];
    this.bubbles = [];
    this.stars = [];
    
    // Suelo base largo
    this.platforms.push({
      x: 0,
      y: this.config.canvasHeight - 80,
      width: this.config.worldWidth,
      height: 80,
      type: "ground",
      theme: world.theme
    });
    
    // Generar plataformas procedurally - más accesibles
    const platformConfigs = [
      { count: 18, minY: 250, maxY: 420, minW: 100, maxW: 180, gap: 150 },
      { count: 12, minY: 180, maxY: 350, minW: 80, maxW: 150, gap: 200 }
    ];
    
    platformConfigs.forEach(cfg => {
      let lastX = 300;
      for (let i = 0; i < cfg.count; i++) {
        const x = lastX + cfg.gap + Math.random() * 100;
        const y = cfg.minY + Math.random() * (cfg.maxY - cfg.minY);
        const w = cfg.minW + Math.random() * (cfg.maxW - cfg.minW);
        
        this.platforms.push({
          x: x,
          y: y,
          width: w,
          height: 20,
          type: "platform",
          theme: world.theme
        });
        
        lastX = x;
      }
    });
    
    // Generar enemigos
    const enemyCount = 8 + this.state.world * 2;
    for (let i = 0; i < enemyCount; i++) {
      const x = 400 + Math.random() * (this.config.worldWidth - 600);
      const groundPlatform = this.platforms.find(p => 
        p.type === "ground" || 
        (p.type === "platform" && p.y > this.config.canvasHeight - 200)
      );
      const y = groundPlatform ? groundPlatform.y - 45 : this.config.canvasHeight - 125;
      
      this.enemies.push({
        x: x,
        y: y,
        width: 45,
        height: 45,
        vx: 1 + Math.random() * 2,
        startX: x,
        range: 80 + Math.random() * 60,
        alive: true,
        type: world.enemies[Math.floor(Math.random() * world.enemies.length)],
        bounce: 0
      });
    }
    
    // Generar monedas
    const coinCount = 30 + this.state.world * 5;
    for (let i = 0; i < coinCount; i++) {
      const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
      if (platform) {
        this.coins.push({
          x: platform.x + Math.random() * (platform.width - 30),
          y: platform.y - 50 - Math.random() * 100,
          width: 25,
          height: 25,
          collected: false,
          baseY: 0,
          offset: Math.random() * Math.PI * 2
        });
      }
    }
    
    // Generar power-ups - más accesibles
    const powerupCount = 4 + Math.floor(this.state.world / 2);
    for (let i = 0; i < powerupCount; i++) {
      // Buscar plataformas más bajas (más accesibles)
      const lowPlatforms = this.platforms.filter(p => 
        p.type === "platform" && 
        p.y > 250 && 
        p.y < 450
      );
      const platform = lowPlatforms[Math.floor(Math.random() * lowPlatforms.length)];
      if (platform) {
        const powerup = this.powerups[Math.floor(Math.random() * this.powerups.length)];
        this.items.push({
          x: platform.x + platform.width/2 - 15,
          y: platform.y - 35,
          width: 30,
          height: 30,
          type: "powerup",
          powerup: powerup,
          collected: false
        });
      }
    }
    
    // Generar estrellas de misión
    this.missionStars = [];
    const starCount = this.state.missionTarget;
    for (let i = 0; i < starCount; i++) {
      const x = 500 + (i * (this.config.worldWidth - 1000) / starCount);
      const platform = this.platforms.find(p => p.x < x && p.x + p.width > x);
      const y = platform ? platform.y - 80 : 200;
      
      this.missionStars.push({
        x: x,
        y: y,
        width: 30,
        height: 30,
        collected: false
      });
    }
    
    // Generar elementos decorativos según dimensión
    if (dim.stars) {
      for (let i = 0; i < 50; i++) {
        this.stars.push({
          x: Math.random() * this.config.worldWidth,
          y: Math.random() * (this.config.canvasHeight - 150),
          size: 2 + Math.random() * 3,
          twinkle: Math.random() * Math.PI * 2
        });
      }
    }
    
    if (dim.bubbles) {
      for (let i = 0; i < 30; i++) {
        this.bubbles.push({
          x: Math.random() * this.config.worldWidth,
          y: Math.random() * this.config.canvasHeight,
          size: 5 + Math.random() * 15,
          speed: 0.5 + Math.random() * 1,
          wobble: Math.random() * Math.PI * 2
        });
      }
    }
    
    // Reiniciar posición del jugador
    this.state.player.x = 100;
    this.state.player.y = 400;
    this.state.player.vx = 0;
    this.state.player.vy = 0;
    
    this.camera.x = 0;
    this.state.missionProgress = 0;
  },
  
  // ══════════════════════════════════════════════
  // BUCLE PRINCIPAL
  // ══════════════════════════════════════════════
  gameLoop() {
    if (this.state.screen !== "playing") return;
    
    this.update();
    this.render();
    this.animFrame++;
    this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
  },
  
  // ══════════════════════════════════════════════
  // ACTUALIZAR
  // ══════════════════════════════════════════════
  update() {
    const player = this.state.player;
    const dim = this.dimensions[this.state.dimension];
    const gMod = dim.gravityMod;
    const sMod = dim.speedMod;
    
    // Movimiento horizontal
    if (this.keys["ArrowLeft"] || this.keys["KeyA"]) {
      player.vx = -this.config.moveSpeed * sMod;
      player.facing = -1;
    } else if (this.keys["ArrowRight"] || this.keys["KeyD"]) {
      player.vx = this.config.moveSpeed * sMod;
      player.facing = 1;
    } else {
      player.vx *= 0.8;
    }
    
    // Salto
    const canJump = player.onGround;
    const jumpPower = this.state.activePowerup === "jump" 
      ? this.config.jumpForce * 1.5 
      : this.config.jumpForce;
    
    if ((this.keys["ArrowUp"] || this.keys["Space"] || this.keys["KeyW"]) && canJump) {
      player.vy = jumpPower;
      player.onGround = false;
      this.spawnParticles(player.x + player.width/2, player.y + player.height, "jump");
    }
    
    // Vuelo mágico
    if (this.state.activePowerup === "fly" && (this.keys["ArrowUp"] || this.keys["Space"])) {
      player.vy = -8;
    }
    
    // Gravedad
    player.vy += this.config.gravity * gMod;
    
    // Aplicar velocidad
    player.x += player.vx;
    player.y += player.vy;
    
    // Limites del mundo
    if (player.x < 0) player.x = 0;
    if (player.x > this.config.worldWidth - player.width) {
      player.x = this.config.worldWidth - player.width;
    }
    
    // Colisiones con plataformas
    player.onGround = false;
    this.platforms.forEach(plat => {
      if (this.checkCollision(player, plat)) {
        if (player.vy > 0 && player.y + player.height - player.vy <= plat.y + 10) {
          player.y = plat.y - player.height;
          player.vy = 0;
          player.onGround = true;
        }
      }
    });
    
    // Caída al vacío
    if (player.y > this.config.canvasHeight + 100) {
      this.playerHit();
    }
    
    // Actualizar enemigos
    this.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      
      enemy.x += enemy.vx;
      enemy.bounce += 0.1;
      if (enemy.x > enemy.startX + enemy.range || enemy.x < enemy.startX - enemy.range) {
        enemy.vx *= -1;
      }
      
      // Colisión con jugador
      if (this.checkCollision(player, enemy)) {
        if (player.vy > 0 && player.y + player.height - player.vy < enemy.y + 20) {
          // Pisar enemigo
          enemy.alive = false;
          player.vy = -10;
          this.state.score += 50;
          this.spawnParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, "enemy");
          
          // Contador de enemigos derrotados para recompensa
          this.checkEnemyDefeatReward();
          
          this.updateHUD();
        } else if (this.state.activePowerup !== "invincible" && player.invulnerable <= 0) {
          // Tocado por enemigo - mostrar pregunta educativa
          this.showQuestion(enemy);
        }
      }
    });
    
    // Actualizar monedas
    let coinsCollected = 0;
    this.coins.forEach(coin => {
      if (coin.collected) return;
      
      // Imán
      let cx = coin.x;
      let cy = coin.y;
      if (this.state.activePowerup === "magnet") {
        const dx = player.x + player.width/2 - coin.x;
        const dy = player.y + player.height/2 - coin.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 300) {
          coin.x += dx / dist * 8;
          coin.y += dy / dist * 8;
        }
      }
      
      if (this.checkCollision(player, coin)) {
        coin.collected = true;
        this.state.coins++;
        this.state.score += 10;
        coinsCollected++;
        this.spawnParticles(coin.x + coin.width/2, coin.y + coin.height/2, "coin");
      }
    });
    if (coinsCollected > 0) this.updateHUD();
    
    // Actualizar items (power-ups)
    this.items.forEach(item => {
      if (item.collected) return;
      
      if (this.checkCollision(player, item)) {
        item.collected = true;
        this.activatePowerup(item.powerup);
      }
    });
    
    // Actualizar estrellas de misión
    this.missionStars.forEach(star => {
      if (star.collected) return;
      
      if (this.checkCollision(player, star)) {
        star.collected = true;
        this.state.missionProgress++;
        this.state.score += 100;
        this.spawnParticles(star.x + star.width/2, star.y + star.height/2, "star");
        
        if (this.state.missionProgress >= this.state.missionTarget) {
          this.completeWorld();
        }
      }
    });
    
    // Actualizar powerup timer
    if (this.state.activePowerup && this.state.powerupTimer > 0) {
      this.state.powerupTimer -= 16;
      if (this.state.powerupTimer <= 0) {
        this.state.activePowerup = null;
        this.updateHUD();
      }
    }
    
    // Invulnerability timer
    if (player.invulnerable > 0) player.invulnerable--;
    
    // Actualizar cámara
    const targetX = player.x - this.config.canvasWidth / 2 + player.width / 2;
    this.camera.x += (targetX - this.camera.x) * 0.1;
    if (this.camera.x < 0) this.camera.x = 0;
    if (this.camera.x > this.config.worldWidth - this.config.canvasWidth) {
      this.camera.x = this.config.worldWidth - this.config.canvasWidth;
    }
    
    // Actualizar partículas
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });
  },
  
  // ══════════════════════════════════════════════
  // RENDERIZADO
  // ══════════════════════════════════════════════
  render() {
    const ctx = this.ctx;
    const w = this.config.canvasWidth;
    const h = this.config.canvasHeight;
    const player = this.state.player;
    const world = this.worlds[(this.state.world - 1) % this.worlds.length];
    const dim = this.dimensions[this.state.dimension];
    
    // Fondo
    ctx.fillStyle = dim.bg;
    ctx.fillRect(0, 0, w, h);
    
    // Decoraciones de dimensión
    if (dim.stars) {
      this.stars.forEach(s => {
        const sx = (s.x - this.camera.x * 0.5) % w;
        const twinkle = Math.sin(this.animFrame * 0.1 + s.twinkle);
        ctx.fillStyle = `rgba(255,255,255,${0.5 + twinkle * 0.5})`;
        ctx.beginPath();
        ctx.arc(sx, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    if (dim.bubbles) {
      this.bubbles.forEach(b => {
        const bx = ((b.x - this.camera.x * 0.3) % w + w) % w;
        b.y -= b.speed;
        b.wobble += 0.05;
        const by = ((b.y % h) + h) % h;
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx + Math.sin(b.wobble) * 10, by, b.size, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
    
    ctx.save();
    ctx.translate(-this.camera.x, 0);
    
    // Plataformas
    this.platforms.forEach(plat => {
      if (plat.type === "ground") {
        const groundGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
        groundGrad.addColorStop(0, world.color2);
        groundGrad.addColorStop(1, world.color1);
        ctx.fillStyle = groundGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        
        // Decoración del suelo
        ctx.fillStyle = world.color1;
        for (let i = 0; i < plat.width; i += 40) {
          ctx.fillRect(plat.x + i, plat.y, 20, 8);
        }
      } else {
        const platGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
        platGrad.addColorStop(0, "#c9a227");
        platGrad.addColorStop(1, "#8b6914");
        ctx.fillStyle = platGrad;
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 5);
        ctx.fill();
        
        // Borde superior
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(plat.x, plat.y, plat.width, 4);
      }
    });
    
    // Monedas
    this.coins.forEach(coin => {
      if (coin.collected) return;
      
      const float = Math.sin(this.animFrame * 0.08 + coin.offset) * 5;
      const coinGrad = ctx.createRadialGradient(
        coin.x + coin.width/2 - 3, coin.y + coin.height/2 + float - 3, 0,
        coin.x + coin.width/2, coin.y + coin.height/2 + float, 12
      );
      coinGrad.addColorStop(0, "#fff5cc");
      coinGrad.addColorStop(0.5, "#ffd700");
      coinGrad.addColorStop(1, "#daa520");
      ctx.fillStyle = coinGrad;
      ctx.beginPath();
      ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2 + float, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Brillo
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(coin.x + coin.width/2 - 4, coin.y + coin.height/2 + float - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Enemigos
    this.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      
      const bounce = Math.sin(enemy.bounce) * 3;
      ctx.fillStyle = "#ff4757";
      ctx.fillRect(enemy.x, enemy.y + bounce, enemy.width, enemy.height);
      
      // Cara de enemigo
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(enemy.x + 12, enemy.y + 15 + bounce, 8, 0, Math.PI * 2);
      ctx.arc(enemy.x + 32, enemy.y + 15 + bounce, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(enemy.x + 14 + (enemy.vx > 0 ? 2 : 0), enemy.y + 17 + bounce, 4, 0, Math.PI * 2);
      ctx.arc(enemy.x + 34 + (enemy.vx > 0 ? 2 : 0), enemy.y + 17 + bounce, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Icono según tipo
      ctx.fillStyle = "#fff";
      ctx.font = "20px sans-serif";
      ctx.fillText(enemy.type, enemy.x + 10, enemy.y + 40 + bounce);
    });
    
    // Items (power-ups)
    this.items.forEach(item => {
      if (item.collected) return;
      
      const float = Math.sin(this.animFrame * 0.1) * 8;
      ctx.fillStyle = "#fd79a8";
      ctx.beginPath();
      ctx.arc(item.x + item.width/2, item.y + item.height/2 + float, 18, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "#fff";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.powerup.icon, item.x + item.width/2, item.y + item.height/2 + float + 7);
    });
    
    // Estrellas de misión
    this.missionStars.forEach(star => {
      if (star.collected) return;
      
      const rotation = this.animFrame * 0.05;
      const glow = Math.sin(this.animFrame * 0.1) * 5;
      
      ctx.save();
      ctx.translate(star.x + star.width/2, star.y + star.height/2);
      ctx.rotate(rotation);
      
      ctx.fillStyle = "#ffd700";
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 15 + glow;
      
      // Dibujar estrella
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
        const r = i === 0 ? 15 : 15;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    });
    
    // Jugador (Lumi)
    const px = player.x;
    const py = player.y;
    
    // Efecto de invulnerabilidad
    if (player.invulnerable > 0 && Math.floor(player.invulnerable / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Efectos de powerup
    if (this.state.activePowerup === "invincible") {
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 20;
    }
    if (this.state.activePowerup === "fly") {
      ctx.shadowColor = "#fd79a8";
      ctx.shadowBlur = 15;
    }
    
    // Cuerpo
    ctx.fillStyle = "#6c5ce7";
    ctx.fillRect(px + 8, py + 25, 34, 30);
    
    // Cabeza
    ctx.fillStyle = "#ffeaa7";
    ctx.beginPath();
    ctx.arc(px + 25, py + 12, 22, 0, Math.PI * 2);
    ctx.fill();
    
    // Ojos
    const eyeOffset = player.facing > 0 ? 3 : -3;
    ctx.fillStyle = "#2d3436";
    ctx.beginPath();
    ctx.arc(px + 18 + eyeOffset, py + 8, 5, 0, Math.PI * 2);
    ctx.arc(px + 32 + eyeOffset, py + 8, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Brillo ojos
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(px + 16 + eyeOffset, py + 6, 2, 0, Math.PI * 2);
    ctx.arc(px + 30 + eyeOffset, py + 6, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Sonrisa
    ctx.strokeStyle = "#2d3436";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px + 25, py + 14, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Antenna
    ctx.strokeStyle = "#fd79a8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + 25, py - 10);
    ctx.lineTo(px + 25, py - 25);
    ctx.stroke();
    
    ctx.fillStyle = "#fd79a8";
    ctx.beginPath();
    ctx.arc(px + 25, py - 28, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    
    // Partículas
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / 30;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    ctx.restore();
  },
  
  // ══════════════════════════════════════════════
  // UTILIDADES
  // ══════════════════════════════════════════════
  checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  },
  
  spawnParticles(x, y, type) {
    const colors = {
      jump: ["#00b894", "#00cec9"],
      enemy: ["#ff7675", "#d63031"],
      coin: ["#ffd700", "#ffeaa7"],
      star: ["#ffd700", "#fdcb6e", "#fff"]
    };
    
    const count = type === "star" ? 20 : 10;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        size: 3 + Math.random() * 4,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        life: 30 + Math.random() * 20
      });
    }
  },
  
  // ══════════════════════════════════════════════
  // PREGUNTAS EDUCATIVAS
  // ══════════════════════════════════════════════
  showQuestion(enemy) {
    this.state.screen = "question";
    const subjects = Object.keys(this.questions);
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const subjectQuestions = this.questions[subject];
    const question = subjectQuestions[Math.floor(Math.random() * subjectQuestions.length)];
    
    this.currentQuestion = { ...question, subject };
    this.currentEnemy = enemy;
    
    document.getElementById("q-subject").textContent = `Materia: ${subject.charAt(0).toUpperCase() + subject.slice(1)}`;
    document.getElementById("q-text").textContent = question.q;
    
    const optionsDiv = document.getElementById("q-options");
    optionsDiv.innerHTML = "";
    
    question.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "q-option";
      btn.textContent = opt;
      btn.onclick = () => this.answerQuestion(opt === question.a);
      optionsDiv.appendChild(btn);
    });
    
    document.getElementById("lp-question-modal").classList.add("active");
  },
  
  answerQuestion(correct) {
    document.getElementById("lp-question-modal").classList.remove("active");
    
    const resultModal = document.getElementById("lp-result-modal");
    const resultEmoji = document.getElementById("r-emoji");
    const resultTitle = document.getElementById("r-title");
    const resultDesc = document.getElementById("r-desc");
    
    this.state.questionsAnswered++;
    
    if (correct) {
      this.state.correctAnswers++;
      this.state.score += 100;
      
      const xpGain = this.state.activePowerup === "double" ? 40 : 20;
      this.state.xp += xpGain;
      addXP(xpGain);
      
      if (this.currentEnemy) {
        this.currentEnemy.alive = false;
      }
      
      resultEmoji.textContent = "🎉";
      resultTitle.textContent = "¡Correcto!";
      resultDesc.textContent = `+${xpGain} XP`;
    } else {
      this.state.lives--;
      this.state.player.invulnerable = 120;
      
      resultEmoji.textContent = "😢";
      resultTitle.textContent = "¡Intenta de nuevo!";
      resultDesc.textContent = "-1 Vida";
      
      if (this.state.lives <= 0) {
        this.gameOver();
        return;
      }
    }
    
    this.updateHUD();
    resultModal.classList.add("active");
  },
  
  closeResult() {
    document.getElementById("lp-result-modal").classList.remove("active");
    this.state.screen = "playing";
    this.gameLoop();
  },
  
  // ══════════════════════════════════════════════
  // POWER-UPS
  // ══════════════════════════════════════════════
  activatePowerup(powerup) {
    this.state.activePowerup = powerup.id;
    this.state.powerupTimer = powerup.duration;
    this.state.powerups.push(powerup);
    
    addMessage("system", `✨ ¡Power-up activado: ${powerup.name}! ${powerup.desc}`);
    this.updateHUD();
  },
  
  // ══════════════════════════════════════════════
  // RECOMPENSA POR ENEMIGOS DERROTADOS
  // ══════════════════════════════════════════════
  checkEnemyDefeatReward() {
    const now = Date.now();
    const comboWindow = 3000; // 3 segundos para combo
    
    if (now - this.state.lastEnemyDefeatTime < comboWindow) {
      this.state.enemiesDefeated++;
    } else {
      this.state.enemiesDefeated = 1;
    }
    this.state.lastEnemyDefeatTime = now;
    
    if (this.state.enemiesDefeated >= 3) {
      this.giveComboReward();
      this.state.enemiesDefeated = 0;
    }
  },
  
  giveComboReward() {
    const rewards = [
      { type: "xp", amount: 50, icon: "⭐", desc: "+50 XP" },
      { type: "coins", amount: 10, icon: "🪙", desc: "+10 Monedas" },
      { type: "powerup", powerup: this.powerups[0], icon: "🦋", desc: "Vuelo Mágico" },
      { type: "powerup", powerup: this.powerups[3], icon: "💫", desc: "Doble XP" }
    ];
    
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    if (reward.type === "xp") {
      this.state.xp += reward.amount;
      this.state.score += reward.amount * 2;
      addXP(reward.amount);
      addMessage("system", `🔥 ¡COMBO! ¡Derrotaste 3 enemigos! ${reward.desc}`);
    } else if (reward.type === "coins") {
      this.state.coins += reward.amount;
      this.state.score += reward.amount * 5;
      addMessage("system", `🔥 ¡COMBO! ¡Derrotaste 3 enemigos! ${reward.desc}`);
    } else if (reward.type === "powerup") {
      this.activatePowerup(reward.powerup);
      addMessage("system", `🔥 ¡COMBO! ¡Derrotaste 3 enemigos! ¡Power-up extra!`);
    }
    
    this.updateHUD();
  },
  
  // ══════════════════════════════════════════════
  // DIMENSIONES
  // ══════════════════════════════════════════════
  changeDimension() {
    this.state.dimension = (this.state.dimension + 1) % this.dimensions.length;
    this.generateWorld();
    this.updateHUD();
    addMessage("system", `🌌 ¡Entra a ${this.dimensions[this.state.dimension].name}!`);
  },
  
  // ══════════════════════════════════════════════
  // DAÑO Y ESTADO
  // ══════════════════════════════════════════════
  playerHit() {
    if (this.state.activePowerup === "invincible") return;
    
    this.state.lives--;
    this.state.player.invulnerable = 120;
    this.state.player.x = Math.max(100, this.state.player.x - 200);
    this.state.player.y = 300;
    this.state.player.vy = 0;
    
    this.spawnParticles(this.state.player.x + 25, this.state.player.y + 30, "enemy");
    this.updateHUD();
    
    if (this.state.lives <= 0) {
      this.gameOver();
    }
  },
  
  // ══════════════════════════════════════════════
  // COMPLETAR MUNDO
  // ══════════════════════════════════════════════
  completeWorld() {
    this.state.screen = "worldComplete";
    
    const worldXP = 100 * this.state.world;
    this.state.xp += worldXP;
    addXP(worldXP);
    updateXPBar();
    
    document.getElementById("wc-coins").textContent = this.state.coins;
    document.getElementById("wc-xp").textContent = worldXP;
    document.getElementById("wc-correct").textContent = `${this.state.correctAnswers}/${this.state.questionsAnswered}`;
    
    document.getElementById("lp-world-complete-modal").classList.add("active");
  },
  
  nextWorld() {
    document.getElementById("lp-world-complete-modal").classList.remove("active");
    this.state.world++;
    this.state.missionTarget += 2;
    this.state.dimension = (this.state.world - 1) % this.dimensions.length;
    this.startGame();
  },
  
  // ══════════════════════════════════════════════
  // GAME OVER
  // ══════════════════════════════════════════════
  gameOver() {
    this.state.screen = "gameOver";
    
    document.getElementById("go-worlds").textContent = this.state.world;
    document.getElementById("go-score").textContent = this.state.score;
    document.getElementById("go-xp").textContent = this.state.xp;
    
    document.getElementById("lp-gameover-modal").classList.add("active");
  },
  
  restart() {
    document.getElementById("lp-gameover-modal").classList.remove("active");
    this.state = {
      screen: "playing",
      player: null,
      world: 1,
      dimension: 0,
      score: 0,
      coins: 0,
      xp: 0,
      lives: 3,
      powerups: [],
      activePowerup: null,
      powerupTimer: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      mission: null,
      missionProgress: 0,
      missionTarget: 5,
      enemiesDefeated: 0,
      lastEnemyDefeatTime: 0
    };
    this.startGame();
  },
  
  // ══════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════
  updateHUD() {
    const world = this.worlds[(this.state.world - 1) % this.worlds.length];
    const dim = this.dimensions[this.state.dimension];
    
    document.getElementById("lp-score").textContent = this.state.score;
    document.getElementById("lp-coins").textContent = this.state.coins;
    document.getElementById("lp-xp").textContent = this.state.xp;
    document.getElementById("lp-world").textContent = world.name;
    document.getElementById("lp-dimension").textContent = dim.name;
    document.getElementById("lp-lives").textContent = this.state.lives;
    document.getElementById("lp-mission-text").textContent = 
      `Recoge ${this.state.missionTarget - this.state.missionProgress} más estrellas (${this.state.missionProgress}/${this.state.missionTarget})`;
    
    // Power-up display
    const powerupDisplay = document.getElementById("lp-powerup-display");
    if (this.state.activePowerup) {
      const powerup = this.powerups.find(p => p.id === this.state.activePowerup);
      if (powerup) {
        const timeLeft = Math.ceil(this.state.powerupTimer / 1000);
        powerupDisplay.innerHTML = `${powerup.icon} ${powerup.name} (${timeLeft}s)`;
      }
    } else {
      powerupDisplay.innerHTML = "";
    }
  }
};

window.LUMI_PLATFORM = LUMI_PLATFORM;