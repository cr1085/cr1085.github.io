// ================================================
// assistant-knowledge.js — Motor de base de conocimiento
// InfoMática Platform - Asistente Inteligente
// ================================================

const AssistantKnowledge = (function() {
  // Cache local de conocimiento (fallback si Supabase no responde)
  let _cache = [];
  let _cacheLoaded = false;
  let _useSupabase = true;

  // ---- CONOCIMIENTO EMBEBIDO (fallback offline) ----
  const BUILT_IN = [
    {
      category: 'greeting', subcategory: 'general',
      title: 'Saludo', content: '¡Hola! 👋 Soy tu asistente de InfoMática. Puedo ayudarte con los módulos, explicarte qué hacer, y responder tus preguntas. ¿En qué te puedo ayudar?',
      triggers: ['hola', 'buenos dias', 'buenas tardes', 'hey', 'hi', 'saludos', 'que tal'],
      tags: ['saludo', 'bienvenida'], priority: 10, min_level: 1
    },
    {
      category: 'navigation', subcategory: 'general',
      title: 'Qué hacer primero',
      content: 'Te recomiendo este orden:\n\n1️⃣ Módulo "PC Básico" → Aprende lo fundamental\n2️⃣ "Mecanografía" → Mejora tu escritura\n3️⃣ "Uso del Mouse" → Domina el cursor\n4️⃣ "Internet" → Navega con seguridad\n\nCada lección te da XP y sube tu nivel. ¡Empecemos!',
      triggers: ['que hago', 'por donde empiezo', 'que hacer primero', 'donde empezar', 'como empiezo', 'ayuda'],
      tags: ['orden', 'primero', 'inicio', 'ruta'], priority: 10, min_level: 1
    },
    {
      category: 'navigation', subcategory: 'general',
      title: 'Navegación',
      content: 'La plataforma tiene estas secciones:\n\n📌 Inicio → Dashboard principal\n📚 Módulos → Lecciones organizadas\n🎯 Ejercicios → Práctica interactiva\n⌨️ Teclado → Mecanografía\n🖥️ Simulador → Práctica real\n🏆 Logros → Insignias\n🗺️ Mi Ruta → Plan de aprendizaje\n👤 Perfil → Tus estadísticas',
      triggers: ['navegar', 'menu', 'secciones', 'como usar', 'donde'],
      tags: ['navegacion', 'menu', 'interfaz'], priority: 8, min_level: 1
    },
    {
      category: 'faq', subcategory: 'general',
      title: 'Sistema de XP',
      content: '💎 Ganas XP completando:\n• Lecciones: 20-50 XP\n• Quizzes: XP extra\n• Logros: 20-500 XP\n\nLos XP suben tu nivel:\nNv.1 (0 XP) → Nv.2 (100) → Nv.3 (250) → Nv.10 (5000)\n\nMás nivel = más módulos desbloqueados.',
      triggers: ['xp', 'experiencia', 'puntos', 'subir nivel', 'niveles'],
      tags: ['xp', 'niveles', 'progreso'], priority: 8, min_level: 1
    },
    {
      category: 'faq', subcategory: 'general',
      title: 'Desbloquear módulos',
      content: '🔓 Los módulos se desbloquean por nivel:\n• PC Básico → Nv.1\n• Mecanografía → Nv.1\n• Mouse → Nv.1\n• Internet → Nv.2 (100 XP)\n• Herramientas → Nv.3 (250 XP)\n• IA → Nv.4 (500 XP)\n• Excel → Nv.5 (800 XP)',
      triggers: ['desbloquear', 'bloqueado', 'como desbloquear', 'modulo bloqueado'],
      tags: ['desbloquear', 'niveles', 'bloqueado'], priority: 8, min_level: 1
    },
    {
      category: 'module', subcategory: 'pc_basico',
      title: 'PC Básico',
      content: '🖥️ Módulo PC Básico (4 lecciones):\n1. Partes del Computador → CPU, monitor, mouse, teclado\n2. El Escritorio → Tu espacio de trabajo\n3. Archivos y Carpetas → Organiza tu info\n4. Configuración Básica → Personaliza tu PC\n\n🎯 ~115 XP total • ⏱️ ~40 min',
      triggers: ['pc basico', 'computador', 'fundamentos', 'partes pc'],
      tags: ['pc_basico', 'fundamentos', 'hardware'], priority: 7, min_level: 1
    },
    {
      category: 'module', subcategory: 'mecanografia',
      title: 'Mecanografía',
      content: '⌨️ Módulo Mecanografía (4 lecciones):\n1. Posición de Manos → Postura correcta\n2. Filas del Teclado → QWERTY, ASDF\n3. Práctica Inicial → Ejercicios básicos\n4. Velocidad y Precisión → Mide tu PPM\n\n🎯 ~140 XP total • ⏱️ ~50 min',
      triggers: ['mecanografia', 'escribir rapido', 'teclado', 'teclear'],
      tags: ['mecanografia', 'teclado', 'escritura'], priority: 7, min_level: 1
    },
    {
      category: 'module', subcategory: 'mouse',
      title: 'Uso del Mouse',
      content: '🖱️ Módulo Mouse (4 lecciones):\n1. El Cursor y Click → Conceptos básicos\n2. Arrastrar y Soltar → Drag & Drop\n3. Click Derecho → Menú contextual\n4. Juego: Hunter → Practica puntería\n\n🎯 ~120 XP total • ⏱️ ~40 min',
      triggers: ['mouse', 'cursor', 'click', 'arrastrar', 'raton'],
      tags: ['mouse', 'cursor', 'click', 'drag drop'], priority: 7, min_level: 1
    },
    {
      category: 'concept', subcategory: 'general',
      title: 'Archivo vs Carpeta',
      content: '📄 **Archivo** = Un documento guardado (texto, imagen, video)\n📁 **Carpeta** = Contenedor para organizar archivos\n\nEjemplo: "tarea.docx" es un archivo dentro de la carpeta "Documentos".\n\nLa extensión (.docx, .jpg, .pdf) indica el tipo.',
      triggers: ['archivo', 'carpeta', 'diferencia', 'que es archivo', 'que es carpeta'],
      tags: ['archivo', 'carpeta', 'concepto', 'organizacion'], priority: 5, min_level: 1
    },
    {
      category: 'tip', subcategory: 'general',
      title: 'Consejo de estudio',
      content: '💡 Para aprender mejor:\n1. 📅 Estudia 15-30 min al día\n2. 🔄 Repite lo aprendido al día siguiente\n3. 🎯 Completa los quizzes\n4. 💻 Practica en el simulador\n5. 🔥 Mantén tu racha\n\nLa constancia > la intensidad.',
      triggers: ['consejo', 'tip', 'como aprender', 'mejorar'],
      tags: ['consejo', 'estudio', 'tips'], priority: 6, min_level: 1
    },
    {
      category: 'motivation', subcategory: 'general',
      title: 'Motivación',
      content: '🌟 ¡Vas muy bien! Cada lección te acerca a dominar la tecnología. Los expertos alguna vez fueron principiantes. ¡Sigue adelante!',
      triggers: ['motivacion', 'animo', 'gracias'],
      tags: ['motivacion', 'animo'], priority: 3, min_level: 1
    }
  ];

  // ---- CARGAR CONOCIMIENTO DESDE SUPABASE ----
  async function loadKnowledge() {
    try {
      if (typeof supabase === 'undefined') {
        _useSupabase = false;
        _cache = [...BUILT_IN];
        _cacheLoaded = true;
        return;
      }

      const { data, error } = await supabase
        .from('assistant_knowledge')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) {
        console.warn('AssistantKnowledge: Supabase no disponible, usando cache local', error.message);
        _useSupabase = false;
        _cache = [...BUILT_IN];
      } else if (data && data.length > 0) {
        _cache = data;
      } else {
        _cache = [...BUILT_IN];
      }
    } catch (err) {
      console.warn('AssistantKnowledge: Error cargando, usando fallback', err);
      _cache = [...BUILT_IN];
    }
    _cacheLoaded = true;
  }

  // ---- BUSCAR EN LA BASE DE CONOCIMIENTO ----
  function search(query, options = {}) {
    if (!_cacheLoaded) return [];

    const q = query.toLowerCase().trim();
    if (!q) return [];

    const { category, minLevel = 1, limit = 5 } = options;

    // Intentar búsqueda en Supabase si está disponible
    if (_useSupabase && typeof supabase !== 'undefined') {
      return searchSupabase(query, options);
    }

    // Búsqueda local (fallback)
    return searchLocal(q, category, minLevel, limit);
  }

  function searchLocal(query, category, minLevel, limit) {
    const results = [];

    for (const entry of _cache) {
      if (category && entry.category !== category) continue;
      if (entry.min_level && entry.min_level > minLevel) continue;

      let score = 0;

      // Coincidencia exacta en triggers
      if (entry.triggers) {
        for (const trigger of entry.triggers) {
          if (query.includes(trigger.toLowerCase())) {
            score += 15;
          }
        }
      }

      // Coincidencia en título
      if (entry.title && entry.title.toLowerCase().includes(query)) {
        score += 10;
      }

      // Coincidencia en contenido
      if (entry.content && entry.content.toLowerCase().includes(query)) {
        score += 5;
      }

      // Coincidencia en tags
      if (entry.tags) {
        for (const tag of entry.tags) {
          if (query.includes(tag.toLowerCase())) {
            score += 3;
          }
        }
      }

      // Bonus por prioridad
      score += (entry.priority || 0);

      if (score > 0) {
        results.push({ ...entry, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  async function searchSupabase(query, options = {}) {
    try {
      const { category, minLevel = 1, limit = 5 } = options;

      const { data, error } = await supabase.rpc('search_knowledge', {
        search_query: query,
        search_category: category || null,
        search_min_level: minLevel,
        search_limit: limit
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('AssistantKnowledge: RPC falló, usando búsqueda local', err);
      _useSupabase = false;
      return searchLocal(query.toLowerCase().trim(), options.category, options.minLevel, options.limit);
    }
  }

  // ---- OBTENER CONOCIMIENTO POR CATEGORÍA ----
  function getByCategory(category, subcategory, minLevel = 1) {
    return _cache.filter(e =>
      e.category === category &&
      (!subcategory || e.subcategory === subcategory) &&
      (!e.min_level || e.min_level <= minLevel)
    ).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  // ---- OBTENER CONOCIMIENTO AUTO-SHOW PARA SECCIÓN ----
  function getAutoShowForSection(section, minLevel = 1) {
    return _cache.filter(e =>
      e.auto_show_section === section &&
      (!e.min_level || e.min_level <= minLevel)
    );
  }

  // ---- OBTENER CONOCIMIENTO POR MÓDULO ----
  function getModuleKnowledge(moduleId, minLevel = 1) {
    return getByCategory('module', moduleId, minLevel);
  }

  // ---- OBTENER SALUDO ----
  function getGreeting() {
    const greetings = getByCategory('greeting');
    return greetings.length > 0 ? greetings[0] : {
      content: '¡Hola! Soy tu asistente de InfoMática. ¿En qué te puedo ayudar?'
    };
  }

  // ---- AGREGAR CONOCIMIENTO (para admins) ----
  async function addKnowledge(entry) {
    if (_useSupabase && typeof supabase !== 'undefined') {
      try {
        const { data, error } = await supabase
          .from('assistant_knowledge')
          .insert([entry])
          .select();

        if (error) throw error;
        if (data && data[0]) {
          _cache.push(data[0]);
        }
        return data[0];
      } catch (err) {
        console.error('Error adding knowledge:', err);
      }
    }

    // Fallback: agregar al cache local
    const newEntry = { ...entry, id: 'local_' + Date.now() };
    _cache.push(newEntry);
    return newEntry;
  }

  // ---- INICIALIZACIÓN ----
  function init() {
    return loadKnowledge();
  }

  return {
    init,
    loadKnowledge,
    search,
    getByCategory,
    getAutoShowForSection,
    getModuleKnowledge,
    getGreeting,
    addKnowledge,
    getCache: () => [..._cache]
  };
})();

window.AssistantKnowledge = AssistantKnowledge;
