// ================================================
// assistant-brain.js — Cerebro del asistente inteligente
// InfoMática Platform - Asistente Inteligente
// ================================================

const AssistantBrain = (function() {
  let _conversationId = null;
  let _messageHistory = [];
  let _lastContext = {};

  // ---- CONSTRUIR CONTEXTO ACTUAL ----
  function buildContext() {
    const state = typeof Store !== 'undefined' ? Store.getState() : {};
    const section = state.currentSection || document.querySelector('.app-section.active')?.id?.replace('section-', '') || 'dashboard';

    return {
      section,
      level: state.level || 1,
      xp: state.xp || 0,
      completedLessons: state.completedLessons || [],
      totalLessons: state.totalLessons || 0,
      streakDays: state.streakDays || 0,
      currentModule: state.currentModule || state.currentSection || 'pc_basico',
      unlockedAchievements: state.unlockedAchievements || [],
      quizzesDone: state.quizzesDone || 0,
      userName: state.currentUser?.full_name || 'Estudiante',
      isAuthenticated: state.isAuthenticated || false
    };
  }

  // ---- GENERAR RESPUESTA ----
  async function generateResponse(userMessage) {
    const context = buildContext();
    _lastContext = context;

    const msg = userMessage.toLowerCase().trim();

    // Guardar mensaje del usuario
    _messageHistory.push({ role: 'user', content: userMessage, timestamp: Date.now() });

    // 1. Buscar en base de conocimiento
    const knowledgeResults = AssistantKnowledge.search(msg, {
      minLevel: context.level,
      limit: 3
    });

    // 2. Verificar si hay alta coincidencia
    if (knowledgeResults.length > 0 && knowledgeResults[0].score >= 10) {
      const response = personalizeResponse(knowledgeResults[0].content, context);
      await saveMessage('user', userMessage, context);
      await saveMessage('assistant', response, context);
      return { text: response, source: 'knowledge', confidence: 'high' };
    }

    // 3. Generar respuesta contextual basada en el estado
    const contextualResponse = generateContextualResponse(msg, context, knowledgeResults);
    await saveMessage('user', userMessage, context);
    await saveMessage('assistant', contextualResponse.text, context);

    return contextualResponse;
  }

  // ---- PERSONALIZAR RESPUESTA ----
  function personalizeResponse(baseContent, context) {
    let response = baseContent;

    // Agregar contexto del usuario
    if (context.level === 1 && context.totalLessons === 0) {
      response += '\n\n💡 Como estás empezando, te recomiendo comenzar por el módulo "PC Básico".';
    } else if (context.streakDays >= 3) {
      response += `\n\n🔥 ¡Llevas ${context.streakDays} días de racha! ¡Sigue así!`;
    }

    return response;
  }

  // ---- GENERAR RESPUESTA CONTEXTUAL ----
  function generateContextualResponse(message, context, knowledgeResults) {
    // Preguntas sobre progreso personal
    if (matchPatterns(message, ['mi progreso', 'como voy', 'cuanto xp', 'mi nivel', 'cuantas lecciones'])) {
      return {
        text: generateProgressReport(context),
        source: 'context',
        confidence: 'high'
      };
    }

    // Preguntas sobre qué hacer
    if (matchPatterns(message, ['que hago', 'que sigue', 'que deberia', 'recomienda', 'sugiere', 'siguiente'])) {
      return {
        text: generateRecommendation(context),
        source: 'context',
        confidence: 'high'
      };
    }

    // Preguntas sobre módulos específicos
    const moduleMatch = extractModuleFromMessage(message, context);
    if (moduleMatch) {
      const modKnowledge = AssistantKnowledge.getModuleKnowledge(moduleMatch, context.level);
      if (modKnowledge.length > 0) {
        return {
          text: modKnowledge[0].content,
          source: 'knowledge',
          confidence: 'medium'
        };
      }
    }

    // Preguntas sobre lecciones específicas
    if (matchPatterns(message, ['lección', 'leccion', 'actividad', 'ejercicio'])) {
      return {
        text: generateLessonAdvice(context),
        source: 'context',
        confidence: 'medium'
      };
    }

    // Preguntas sobre el simulador
    if (matchPatterns(message, ['simulador', 'simular', 'practica virtual'])) {
      return {
        text: '🖥️ **El Simulador** te permite practicar como si estuvieras usando un programa real.\n\nTenemos:\n• **Simulador de Word** → Formato de texto, negrita, cursiva, etc.\n• **Simulador de Escritorio** → Organizar archivos y carpetas\n\nVe a la sección "Simulador" en el menú lateral para empezar.\n\nCada tarea completada te da XP extra. ¡Es la mejor forma de practicar!',
        source: 'knowledge',
        confidence: 'medium'
      };
    }

    // Preguntas sobre el teclado / mecanografía
    if (matchPatterns(message, ['teclado', 'teclear', 'escribir', 'velocidad', 'ppm', 'wpm'])) {
      return {
        text: '⌨️ **Mecanografía**\n\nPara practicar escritura:\n1. Ve a "Teclado" en el menú\n2. Empieza con "Posición de Manos"\n3. Practica las filas del teclado\n4. Mide tu velocidad (PPM)\n\n🎯 Meta: 40+ palabras por minuto\n📅 Practica 10 minutos diarios\n\n💡 Tip: No mires el teclado, mira la pantalla.',
        source: 'knowledge',
        confidence: 'medium'
      };
    }

    // Explicar conceptos
    if (matchPatterns(message, ['que es', 'qué es', 'como funciona', 'explica', 'significa'])) {
      return {
        text: generateConceptExplanation(message, context),
        source: 'knowledge',
        confidence: 'low'
      };
    }

    // Preguntas sobre logros
    if (matchPatterns(message, ['logro', 'insignia', 'medalla', 'premio', 'achievement'])) {
      return {
        text: generateAchievementAdvice(context),
        source: 'context',
        confidence: 'medium'
      };
    }

    // Preguntas sobre XP / niveles
    if (matchPatterns(message, ['xp', 'experiencia', 'puntos', 'nivel'])) {
      return {
        text: generateXpExplanation(context),
        source: 'knowledge',
        confidence: 'medium'
      };
    }

    // Agradecimientos
    if (matchPatterns(message, ['gracias', 'thank', 'te agradezco', 'muy bien', 'excelente'])) {
      return {
        text: generateThankYouResponse(context),
        source: 'personality',
        confidence: 'high'
      };
    }

    // Respuestas motivacionales
    if (matchPatterns(message, ['aburrido', 'dificil', 'no entiendo', 'no puedo', 'ayuda por favor'])) {
      return {
        text: generateMotivationalResponse(message, context),
        source: 'personality',
        confidence: 'high'
      };
    }

    // Si hay resultados de conocimiento con menor score
    if (knowledgeResults.length > 0) {
      return {
        text: knowledgeResults[0].content,
        source: 'knowledge',
        confidence: 'low'
      };
    }

    // Respuesta por defecto
    return {
      text: generateDefaultResponse(context),
      source: 'default',
      confidence: 'low'
    };
  }

  // ---- GENERADORES DE RESPUESTA ----

  function generateProgressReport(context) {
    const progressPct = context.totalLessons > 0 
      ? Math.round((context.completedLessons.length / getTotalAvailableLessons(context)) * 100) 
      : 0;

    let report = `📊 **Tu Progreso, ${context.userName}**\n\n`;
    report += `⭐ **Nivel:** ${context.level} (${getLevelName(context.level)})\n`;
    report += `💎 **XP Total:** ${context.xp}\n`;
    report += `📚 **Lecciones completadas:** ${context.completedLessons.length}\n`;
    report += `🔥 **Racha:** ${context.streakDays} días\n`;
    report += `🏆 **Logros:** ${context.unlockedAchievements.length}/12\n`;

    // Siguiente nivel
    if (typeof Progress !== 'undefined') {
      const info = Progress.getLevelInfo(context.xp);
      if (info.level < 10) {
        const xpNeeded = info.nextLevelXp - context.xp;
        report += `\n📈 **Para Nivel ${info.level + 1}:** Te faltan ${xpNeeded} XP`;
      }
    }

    // Recomendación
    report += '\n\n💡 ' + getRecommendationShort(context);

    return report;
  }

  function generateRecommendation(context) {
    const completed = context.completedLessons;
    const allModules = typeof Modules !== 'undefined' ? Modules.getAllModules() : [];

    // Encontrar el módulo con más progreso sin completar
    let bestModule = null;
    let bestProgress = 0;

    for (const mod of allModules) {
      if (mod.levelRequired > context.level) continue;
      
      const completedInMod = mod.lessons.filter(l => completed.includes(l.id)).length;
      const totalInMod = mod.lessons.length;
      
      if (completedInMod < totalInMod) {
        const progress = completedInMod / totalInMod;
        if (progress >= bestProgress || !bestModule) {
          bestProgress = progress;
          bestModule = mod;
        }
      }
    }

    let rec = '🎯 **Mi recomendación para ti:**\n\n';

    if (!bestModule && allModules.length > 0) {
      // Todo completado o nada disponible
      rec += '¡Has completado todo lo disponible! Sigue ganando XP para desbloquear más módulos.';
    } else if (bestModule) {
      const nextLesson = bestModule.lessons.find(l => !completed.includes(l.id));
      const completedCount = bestModule.lessons.filter(l => completed.includes(l.id)).length;

      rec += `📖 **Continúa con:** ${bestModule.name}\n`;
      rec += `   Progreso: ${completedCount}/${bestModule.lessons.length} lecciones\n`;
      
      if (nextLesson) {
        rec += `   ➡️ Siguiente: "${nextLesson.title}"\n`;
        rec += `   ⏱️ ${nextLesson.duration} · +${nextLesson.xp} XP\n`;
      }

      rec += '\n' + getMilestoneAdvice(context);
    }

    return rec;
  }

  function generateLessonAdvice(context) {
    const section = context.section;
    
    if (section === 'modules') {
      return '📚 **En esta sección** ves las lecciones del módulo seleccionado.\n\nCada lección tiene:\n• 📖 Contenido educativo\n• ❓ Quiz de repaso (cuando aplica)\n• 💎 Recompensa en XP\n\nConsejo: Lee bien el contenido antes de hacer el quiz. Si fallas, puedes repetirlo.';
    }

    if (section === 'exercises') {
      return '🎯 **Los Ejercicios** son práctica extra:\n\n• ❓ **Quiz** → Preguntas de opción múltiple\n• ✏️ **Completar** → Llena los espacios\n• 🔗 **Unir** → Relaciona conceptos\n• 🖱️ **Arrastrar** → Ordena elementos\n\nCada ejercicio te da XP. ¡Son una excelente forma de reforzar lo aprendido!';
    }

    return '📚 Para hacer una lección:\n1. Ve a "Módulos" en el menú\n2. Selecciona un módulo\n3. Haz clic en la lección que quieras\n4. Lee el contenido y responde el quiz\n\n💡 Te recomiendo empezar por "PC Básico" si no lo has hecho.';
  }

  function generateConceptExplanation(message, context) {
    // Buscar conceptos en conocimiento
    const concepts = AssistantKnowledge.getByCategory('concept', null, context.level);
    
    for (const concept of concepts) {
      if (concept.triggers && concept.triggers.some(t => message.includes(t.toLowerCase()))) {
        return concept.content;
      }
    }

    return '🤔 Interesante pregunta. Te sugiero buscar en los módulos relacionados, o pregúntame algo más específico sobre:\n\n• PC Básico\n• Mecanografía\n• Uso del Mouse\n• Internet\n• Herramientas Digitales\n• Excel\n• Inteligencia Artificial\n\n¿Sobre qué tema te gustaría saber más?';
  }

  function generateAchievementAdvice(context) {
    const unlocked = context.unlockedAchievements || [];
    
    if (typeof Progress === 'undefined') {
      return '🏆 Los logros son insignias que ganas por completar retos. Sigue completando lecciones para desbloquearlos.';
    }

    const allAchievements = Progress.ACHIEVEMENTS;
    const locked = allAchievements.filter(a => !unlocked.includes(a.id));
    
    let text = `🏆 **Tus Logros:** ${unlocked.length}/${allAchievements.length}\n\n`;

    if (locked.length > 0) {
      text += '**Próximos logros por desbloquear:**\n';
      locked.slice(0, 4).forEach(a => {
        text += `${a.icon} ${a.name} → ${a.desc}`;
        if (a.xp > 0) text += ` (+${a.xp} XP)`;
        text += '\n';
      });
    } else {
      text += '¡Has desbloqueado todos los logros! 🎉 Eres un maestro.';
    }

    return text;
  }

  function generateXpExplanation(context) {
    let text = '💎 **Tu XP:** ' + context.xp + '\n\n';
    text += 'Ganas XP por:\n';
    text += '• Completar lecciones: 20-50 XP\n';
    text += '• Responder quizzes correctamente\n';
    text += '• Desbloquear logros: 20-500 XP\n';
    text += '• Tareas del simulador: 30 XP\n\n';

    if (typeof Progress !== 'undefined') {
      const info = Progress.getLevelInfo(context.xp);
      const pct = Progress.getXpProgress(context.xp);
      text += `📊 Progreso al Nivel ${info.level + 1}: ${pct}%\n`;
      text += `💎 Te faltan ${info.nextLevelXp - context.xp} XP para el siguiente nivel.`;
    }

    return text;
  }

  function generateThankYouResponse(context) {
    const responses = [
      `¡De nada, ${context.userName}! 😊 Estoy aquí para ayudarte. ¿Hay algo más que quieras saber?`,
      `¡Un placer ayudarte! 🌟 Recuerda que siempre puedes preguntarme lo que necesites.`,
      `¡Para eso estoy! 💪 Sigue con tu excelente progreso.`,
      `¡Gracias a ti por aprender! 🎓 Tu dedicación es admirable.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  function generateMotivationalResponse(message, context) {
    if (message.includes('dificil') || message.includes('no puedo')) {
      return '💪 Entiendo que puede parecer difícil al principio. Pero recuerda:\n\n• Cada experto fue principiantex\n• No hay prisa, ve a tu ritmo\n• Cada lección te hace más fuerte\n• Puedes repetir cualquier lección\n\n🎯 Te sugiero empezar con lo más básico: "PC Básico". Tómate tu tiempo y no te presiones. ¡Tú puedes!';
    }

    if (message.includes('no entiendo')) {
      return '📖 Si algo no está claro, te sugiero:\n\n1. 🔄 Lee el contenido otra vez\n2. 📝 Toma notas de lo que entiendas\n3. 🎯 Haz el quiz para ver qué recuerdas\n4. 💻 Practica en el simulador\n\n¿Sobre qué tema específico tienes dudas? Puedo explicártelo de otra forma.';
    }

    if (message.includes('aburrido')) {
      return '🎮 ¡Entiendo! A veces lo mismo se vuelve repetitivo. Te sugiero:\n\n• 🖱️ Prueba el juego "Hunter" en Mouse\n• ⌨️ Practica mecanografía (es como un juego)\n• 🖥️ Usa el simulador de Word\n• 🎯 Haz los ejercicios interactivos\n\nHay muchas formas divertidas de aprender. ¡Explora!';
    }

    return '😊 Estoy aquí para ayudarte. Si algo te frustra, tómate un descanso y vuelve después. El aprendizaje es un maratón, no un sprint. ¿En qué puedo ayudarte específicamente?';
  }

  function generateDefaultResponse(context) {
    return `🤔 No estoy seguro de entender completamente tu pregunta. Pero puedo ayudarte con:\n\n📚 **Módulos** → Explicar cualquier tema\n🎯 **Progreso** → Tu nivel, XP, logros\n💡 **Recomendaciones** → Qué hacer siguiente\n🔧 **Conceptos** → Qué es un archivo, carpeta, etc.\n🖥️ **Simulador** → Cómo usarlo\n⌨️ **Mecanografía** → Tips de escritura\n\n¿Podrías ser más específico sobre lo que necesitas?`;
  }

  // ---- HELPERS ----

  function matchPatterns(message, patterns) {
    return patterns.some(p => message.includes(p));
  }

  function extractModuleFromMessage(message, context) {
    const moduleKeywords = {
      'pc_basico': ['pc basico', 'computador', 'fundamentos', 'partes del pc'],
      'mecanografia': ['mecanografia', 'teclear', 'escribir rapido', 'teclado'],
      'mouse': ['mouse', 'raton', 'cursor', 'click'],
      'internet': ['internet', 'navegador', 'web', 'google'],
      'herramientas': ['herramientas', 'drive', 'nube', 'google drive'],
      'excel': ['excel', 'hoja calculo', 'formulas'],
      'ia_basics': ['ia', 'inteligencia artificial', 'chatgpt', 'prompt']
    };

    for (const [moduleId, keywords] of Object.entries(moduleKeywords)) {
      if (keywords.some(k => message.includes(k))) {
        return moduleId;
      }
    }
    return null;
  }

  function getTotalAvailableLessons(context) {
    if (typeof Modules === 'undefined') return 1;
    const allModules = Modules.getAllModules();
    return allModules
      .filter(m => m.levelRequired <= context.level)
      .reduce((sum, m) => sum + m.lessons.length, 0);
  }

  function getLevelName(level) {
    const names = ['', 'Principiante', 'Explorador', 'Aprendiz', 'Competente', 'Hábil', 'Avanzado', 'Experto', 'Maestro', 'Gran Maestro', '⚡ Leyenda'];
    return names[level] || 'Desconocido';
  }

  function getRecommendationShort(context) {
    if (context.totalLessons === 0) {
      return 'Comienza con "PC Básico" para dar tus primeros pasos.';
    }
    if (context.level < 2) {
      return 'Completa más lecciones para alcanzar el Nivel 2 y desbloquear Internet.';
    }
    return 'Sigue completando lecciones para subir de nivel.';
  }

  function getMilestoneAdvice(context) {
    if (context.level === 1 && context.xp < 50) {
      return '🏁 **Meta cercana:** Alcanza 100 XP para llegar al Nivel 2 y desbloquear Internet.';
    }
    if (context.level === 1 && context.xp >= 50) {
      return '🚀 ¡Ya casi llegas al Nivel 2! Te faltan ' + (100 - context.xp) + ' XP.';
    }
    return '';
  }

  // ---- GUARDAR CONVERSACIÓN EN SUPABASE ----

  async function ensureConversation(context) {
    if (_conversationId) return _conversationId;

    if (typeof supabase === 'undefined') return null;

    try {
      const state = typeof Store !== 'undefined' ? Store.getState() : {};
      const userId = state.currentUser?.id;
      if (!userId) return null;

      // Buscar conversación activa reciente
      const { data: existing } = await supabase
        .from('assistant_conversations')
        .select('id')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        _conversationId = existing.id;
      } else {
        const { data: newConv, error } = await supabase
          .from('assistant_conversations')
          .insert([{
            user_id: userId,
            context_section: context.section,
            context_module: context.currentModule
          }])
          .select()
          .single();

        if (!error && newConv) {
          _conversationId = newConv.id;
        }
      }

      return _conversationId;
    } catch (err) {
      console.warn('No se pudo crear conversación:', err);
      return null;
    }
  }

  async function saveMessage(role, content, context) {
    try {
      if (typeof supabase === 'undefined') return;

      const state = typeof Store !== 'undefined' ? Store.getState() : {};
      const userId = state.currentUser?.id;
      if (!userId) return;

      const convId = await ensureConversation(context);
      if (!convId) return;

      await supabase.from('assistant_messages').insert([{
        conversation_id: convId,
        user_id: userId,
        role,
        content,
        context: {
          section: context.section,
          level: context.level,
          xp: context.xp,
          module: context.currentModule
        }
      }]);
    } catch (err) {
      // Silenciar errores de guardado
    }
  }

  // ---- OBTENER SUGERENCIAS RÁPIDAS ----
  function getQuickSuggestions(context) {
    const suggestions = [];

    if (context.totalLessons === 0) {
      suggestions.push('¿Qué debo hacer primero?');
    } else {
      suggestions.push('¿Cómo voy con mi progreso?');
    }

    suggestions.push('Explícame el módulo PC Básico');
    suggestions.push('¿Cómo funciona el sistema de XP?');

    if (context.section === 'simulator') {
      suggestions.push('¿Cómo uso el simulador?');
    }
    if (context.section === 'modules') {
      suggestions.push('¿Qué lección sigue?');
    }

    return suggestions.slice(0, 4);
  }

  // ---- MENSAJE DE SECCIÓN ----
  function getSectionMessage(section, context) {
    const messages = {
      dashboard: context.totalLessons === 0
        ? `¡Bienvenido, ${context.userName}! 👋 Soy tu asistente. Te recomiendo empezar por el módulo "PC Básico" para dar tus primeros pasos. ¿Te guío?`
        : `¡Hola de nuevo, ${context.userName}! 👋 Tienes ${context.xp} XP y llevas ${context.completedLessons.length} lecciones completadas. ¿Qué quieres hacer hoy?`,
      modules: '📚 Estás viendo los módulos. Puedes seleccionar uno para ver sus lecciones. Te recomiendo completarlos en orden para un mejor aprendizaje.',
      exercises: '🎯 Zona de ejercicios. Elige un tipo de práctica para reforzar lo aprendido. Cada ejercicio correcto te da XP extra.',
      simulator: '🖥️ Simulador activo. Aquí practicas como si fuera el programa real. Completa las tareas para ganar XP.',
      typing: '⌨️ Práctica de mecanografía. Recuerda: vista en la pantalla, manos flotando, y no mires el teclado.',
      achievements: `🏆 Tienes ${context.unlockedAchievements.length} logros desbloqueados. Sigue completando retos para ganar más.`,
      profile: '👤 Tu perfil muestra todas tus estadísticas de aprendizaje.',
      roadmap: '🗺️ Tu ruta de aprendizaje de 4 semanas. Aquí puedes ver tu progreso semanal.'
    };

    return messages[section] || null;
  }

  // ---- INICIALIZACIÓN ----
  function init() {
    // No necesita inicialización especial
  }

  return {
    init,
    generateResponse,
    buildContext,
    getQuickSuggestions,
    getSectionMessage,
    getContext: () => _lastContext,
    resetConversation: () => { _conversationId = null; _messageHistory = []; }
  };
})();

window.AssistantBrain = AssistantBrain;
