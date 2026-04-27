// ================================================
// assistant-chat.js — Asistente Viviente
// InfoMática Platform - Pensamientos del Asistente
// ================================================

const AssistantChat = (function() {
  let _isOpen = false;
  let _isTyping = false;
  let _container = null;
  let _messagesEl = null;
  let _inputEl = null;
  let _unreadCount = 0;
  let _initialized = false;
  let _mouseX = 0;
  let _mouseY = 0;
  let _breathPhase = 0;
  let _particleInterval = null;

  // ---- CREAR EL WIDGET HTML ----
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'assistant-widget';
    widget.innerHTML = `
      <!-- Aura del asistente (partículas flotantes) -->
      <div class="assistant-aura" id="assistantAura"></div>

      <!-- Entidad del asistente -->
      <div class="assistant-entity" id="assistantEntity">
        <div class="assistant-entity-ring"></div>
        <div class="assistant-entity-glow"></div>
        <img class="assistant-entity-img" 
             src="assets/icons/asistan.png" 
             alt="Asistente InfoMática"
             draggable="false" />
        <div class="assistant-entity-shadow"></div>
        <span class="assistant-badge" id="assistantBadge" style="display:none">1</span>
      </div>

      <!-- Burbujas de pensamiento previas al chat -->
      <div class="assistant-thought-bubbles" id="assistantThoughtBubbles" style="display:none">
        <div class="thought-bubble tb-1">
          <span class="thought-dot"></span>
        </div>
        <div class="thought-bubble tb-2">
          <span class="thought-dot"></span>
          <span class="thought-dot"></span>
        </div>
        <div class="thought-bubble tb-3">
          <span>Pensando...</span>
        </div>
      </div>

      <!-- Panel de pensamientos (ventana del chat) -->
      <div class="assistant-mind" id="assistantPanel">
        <!-- Header orgánico -->
        <div class="mind-header">
          <div class="mind-header-inner">
            <div class="mind-avatar-wrap">
              <img class="mind-avatar" src="assets/icons/asistan.png" alt="Asistente" />
              <div class="mind-avatar-pulse"></div>
            </div>
            <div class="mind-header-text">
              <div class="mind-title">Asistente InfoMática</div>
              <div class="mind-status" id="mindStatus">
                <span class="mind-status-dot"></span>
                Conectado · Pensando contigo
              </div>
            </div>
          </div>
          <div class="mind-header-actions">
            <button class="mind-action-btn" id="assistantClear" title="Nueva conversación">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <button class="mind-action-btn" id="assistantClose" title="Cerrar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Stream de pensamientos (mensajes) -->
        <div class="mind-stream" id="assistantMessages">
          <div class="mind-stream-origin">
            <div class="origin-pulse"></div>
          </div>
        </div>

        <!-- Sugerencias como impulsos -->
        <div class="mind-impulses" id="assistantSuggestions"></div>

        <!-- Input de pensamiento -->
        <div class="mind-input-area">
          <div class="mind-input-wrap">
            <textarea 
              class="mind-input" 
              id="assistantInput" 
              placeholder="Comparte tu pensamiento..." 
              rows="1"
            ></textarea>
            <button class="mind-send" id="assistantSend" title="Enviar pensamiento">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    _container = widget;
    _messagesEl = document.getElementById('assistantMessages');
    _inputEl = document.getElementById('assistantInput');

    bindEvents();
    startIdleAnimations();
  }

  // ---- ANIMACIONES DE VIDA ----
  function startIdleAnimations() {
    // Tracking suave del mouse para que el asistente "mire" hacia donde estás
    document.addEventListener('mousemove', (e) => {
      _mouseX = e.clientX;
      _mouseY = e.clientY;
      updateEntityLook();
    });

    // Respiración constante
    animateBreath();

    // Partículas de aura
    spawnAuraParticles();
  }

  function updateEntityLook() {
    const entity = document.getElementById('assistantEntity');
    if (!entity || _isOpen) return;

    const rect = entity.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = (_mouseX - cx) / window.innerWidth;
    const dy = (_mouseY - cy) / window.innerHeight;

    const rotateY = dx * 12;
    const rotateX = -dy * 8;

    entity.style.transform = `perspective(400px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${1 + Math.sin(_breathPhase) * 0.03})`;
  }

  function animateBreath() {
    _breathPhase += 0.02;
    const entity = document.getElementById('assistantEntity');
    if (entity && !_isOpen) {
      const scale = 1 + Math.sin(_breathPhase) * 0.03;
      const glow = document.querySelector('.assistant-entity-glow');
      if (glow) {
        glow.style.opacity = 0.3 + Math.sin(_breathPhase * 1.5) * 0.15;
        glow.style.transform = `scale(${1 + Math.sin(_breathPhase * 0.8) * 0.15})`;
      }
    }
    requestAnimationFrame(animateBreath);
  }

  function spawnAuraParticles() {
    const aura = document.getElementById('assistantAura');
    if (!aura) return;

    _particleInterval = setInterval(() => {
      if (_isOpen) return;
      const particle = document.createElement('div');
      particle.className = 'aura-particle';
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 40;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = 2 + Math.random() * 4;
      particle.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: calc(50% + ${x}px); top: calc(50% + ${y}px);
        animation-delay: ${Math.random() * 0.5}s;
        animation-duration: ${1.5 + Math.random() * 2}s;
      `;
      aura.appendChild(particle);
      setTimeout(() => particle.remove(), 3500);
    }, 400);
  }

  // ---- BIND EVENTOS ----
  function bindEvents() {
    const entity = document.getElementById('assistantEntity');
    const closeBtn = document.getElementById('assistantClose');
    const clearBtn = document.getElementById('assistantClear');
    const sendBtn = document.getElementById('assistantSend');

    entity.addEventListener('click', toggle);
    closeBtn.addEventListener('click', close);
    clearBtn.addEventListener('click', clearChat);
    sendBtn.addEventListener('click', sendMessage);

    _inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    _inputEl.addEventListener('input', () => {
      _inputEl.style.height = 'auto';
      _inputEl.style.height = Math.min(_inputEl.scrollHeight, 100) + 'px';
    });
  }

  // ---- ABRIR / CERRAR ----
  function toggle() {
    _isOpen ? close() : open();
  }

  function open() {
    _isOpen = true;
    const panel = document.getElementById('assistantPanel');
    const entity = document.getElementById('assistantEntity');
    const bubbles = document.getElementById('assistantThoughtBubbles');

    // Mostrar burbujas de pensamiento brevemente
    bubbles.style.display = 'flex';

    // El asistente "se gira" hacia ti
    entity.classList.add('active');
    entity.style.transform = 'perspective(400px) rotateY(0) rotateX(0) scale(1)';

    // Abrir panel con delay para que se vea la transición de pensamiento
    setTimeout(() => {
      bubbles.style.display = 'none';
      panel.classList.add('open');
    }, 600);

    _unreadCount = 0;
    updateBadge();

    setTimeout(() => _inputEl.focus(), 800);

    scrollToBottom();

    if (!_initialized) {
      _initialized = true;
      setTimeout(() => showWelcomeMessage(), 700);
    }
  }

  function close() {
    _isOpen = false;
    document.getElementById('assistantPanel').classList.remove('open');
    document.getElementById('assistantEntity').classList.remove('active');

    // Resetear la transformación para que vuelva a reaccionar al mouse
    setTimeout(() => {
      updateEntityLook();
    }, 300);
  }

  // ---- MOSTRAR MENSAJE DE BIENVENIDA ----
  function showWelcomeMessage() {
    const context = AssistantBrain.buildContext();
    const sectionMsg = AssistantBrain.getSectionMessage(context.section, context);

    if (sectionMsg) {
      addMessage('assistant', sectionMsg);
    } else {
      const greeting = AssistantKnowledge.getGreeting();
      addMessage('assistant', greeting.content);
    }

    showSuggestions(AssistantBrain.getQuickSuggestions(context));
  }

  // ---- ENVIAR MENSAJE ----
  async function sendMessage() {
    const text = _inputEl.value.trim();
    if (!text || _isTyping) return;

    addMessage('user', text);
    _inputEl.value = '';
    _inputEl.style.height = 'auto';

    hideSuggestions();

    // Activar estado "pensando" en la entidad
    setEntityState('thinking');
    showTyping();

    try {
      const response = await AssistantBrain.generateResponse(text);

      hideTyping();
      setEntityState('speaking');

      await addMessageWithEffect('assistant', response.text);

      setEntityState('idle');

      const context = AssistantBrain.buildContext();
      showSuggestions(AssistantBrain.getQuickSuggestions(context));
    } catch (err) {
      hideTyping();
      setEntityState('idle');
      addMessage('assistant', 'Disculpa, mis pensamientos se nublaron. ¿Puedes intentar de nuevo?');
      console.error('Assistant error:', err);
    }
  }

  // ---- ESTADOS DE LA ENTIDAD ----
  function setEntityState(state) {
    const entity = document.getElementById('assistantEntity');
    const statusEl = document.getElementById('mindStatus');
    if (!entity) return;

    entity.classList.remove('state-thinking', 'state-speaking', 'state-idle');

    switch (state) {
      case 'thinking':
        entity.classList.add('state-thinking');
        if (statusEl) {
          statusEl.innerHTML = '<span class="mind-status-dot thinking"></span>Procesando pensamiento...';
        }
        break;
      case 'speaking':
        entity.classList.add('state-speaking');
        if (statusEl) {
          statusEl.innerHTML = '<span class="mind-status-dot speaking"></span>Compartiendo idea';
        }
        break;
      default:
        entity.classList.add('state-idle');
        if (statusEl) {
          statusEl.innerHTML = '<span class="mind-status-dot"></span>Conectado · Pensando contigo';
        }
    }
  }

  // ---- AGREGAR MENSAJE ----
  function addMessage(role, content) {
    const msgEl = document.createElement('div');
    msgEl.className = `mind-thought ${role}`;

    const thoughtCore = document.createElement('div');
    thoughtCore.className = 'thought-core';
    thoughtCore.innerHTML = formatContent(content);

    // Timestamp orgánico
    const time = document.createElement('div');
    time.className = 'thought-time';
    time.textContent = formatTime(new Date());

    // Para mensajes del asistente, agregar un pequeño indicador de origen
    if (role === 'assistant') {
      const origin = document.createElement('div');
      origin.className = 'thought-origin-indicator';
      origin.innerHTML = '<div class="origin-dot"></div>';
      msgEl.appendChild(origin);
    }

    msgEl.appendChild(thoughtCore);
    msgEl.appendChild(time);
    _messagesEl.appendChild(msgEl);

    scrollToBottom();

    if (role === 'assistant' && !_isOpen) {
      _unreadCount++;
      updateBadge();
    }
  }

  // ---- EFECTO DE ESCRITURA (PENSAMIENTO EMERGENTE) ----
  async function addMessageWithEffect(role, content) {
    const msgEl = document.createElement('div');
    msgEl.className = `mind-thought ${role}`;

    const thoughtCore = document.createElement('div');
    thoughtCore.className = 'thought-core';

    const time = document.createElement('div');
    time.className = 'thought-time';
    time.textContent = formatTime(new Date());

    if (role === 'assistant') {
      const origin = document.createElement('div');
      origin.className = 'thought-origin-indicator';
      origin.innerHTML = '<div class="origin-dot"></div>';
      msgEl.appendChild(origin);
    }

    msgEl.appendChild(thoughtCore);
    msgEl.appendChild(time);
    _messagesEl.appendChild(msgEl);

    const formatted = formatContent(content);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formatted;
    const plainText = tempDiv.textContent || '';

    if (plainText.length > 200) {
      thoughtCore.innerHTML = formatted;
      thoughtCore.classList.add('thought-reveal');
    } else {
      let currentIndex = 0;
      const chars = [...formatted];

      await new Promise(resolve => {
        const interval = setInterval(() => {
          currentIndex += 3;
          if (currentIndex >= chars.length) {
            thoughtCore.innerHTML = formatted;
            thoughtCore.classList.add('thought-reveal');
            clearInterval(interval);
            resolve();
          } else {
            thoughtCore.innerHTML = chars.slice(0, currentIndex).join('');
          }
          scrollToBottom();
        }, 15);
      });
    }

    scrollToBottom();

    if (role === 'assistant' && !_isOpen) {
      _unreadCount++;
      updateBadge();
    }
  }

  // ---- TYPING INDICATOR ----
  function showTyping() {
    _isTyping = true;
    const typingEl = document.createElement('div');
    typingEl.className = 'mind-thought assistant thinking-indicator';
    typingEl.id = 'assistantTyping';
    typingEl.innerHTML = `
      <div class="thought-origin-indicator">
        <div class="origin-dot pulsing"></div>
      </div>
      <div class="thought-core thought-thinking">
        <div class="thinking-waves">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="thinking-text">Formulando pensamiento...</div>
      </div>
    `;
    _messagesEl.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTyping() {
    _isTyping = false;
    const typingEl = document.getElementById('assistantTyping');
    if (typingEl) {
      typingEl.classList.add('thought-fade-out');
      setTimeout(() => typingEl.remove(), 300);
    }
  }

  // ---- SUGERENCIAS (IMPULSOS) ----
  function showSuggestions(suggestions) {
    const container = document.getElementById('assistantSuggestions');
    if (!container) return;

    container.innerHTML = suggestions.map((s, i) =>
      `<button class="mind-impulse" style="animation-delay: ${i * 0.08}s" onclick="AssistantChat.handleSuggestion(this)">
        <span class="impulse-glow"></span>
        ${s}
      </button>`
    ).join('');
    container.style.display = suggestions.length > 0 ? 'flex' : 'none';
  }

  function hideSuggestions() {
    const container = document.getElementById('assistantSuggestions');
    if (container) container.style.display = 'none';
  }

  function handleSuggestion(btn) {
    const text = btn.textContent.trim();
    _inputEl.value = text;
    sendMessage();
  }

  // ---- LIMPIAR CHAT ----
  function clearChat() {
    // Mantener el origin marker
    _messagesEl.innerHTML = '<div class="mind-stream-origin"><div class="origin-pulse"></div></div>';
    AssistantBrain.resetConversation();
    _initialized = false;
    showWelcomeMessage();
  }

  // ---- FORMATO ----
  function formatContent(content) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '&bull; ');
  }

  function formatTime(date) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToBottom() {
    if (_messagesEl) {
      _messagesEl.scrollTop = _messagesEl.scrollHeight;
    }
  }

  function updateBadge() {
    const badge = document.getElementById('assistantBadge');
    if (!badge) return;

    if (_unreadCount > 0) {
      badge.textContent = _unreadCount > 9 ? '9+' : _unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  // ---- NOTIFICACIÓN PROACTIVA ----
  function showProactiveNotification(message) {
    if (!_isOpen) {
      _unreadCount++;
      updateBadge();

      // Hacer que la entidad "pulse" para llamar atención
      const entity = document.getElementById('assistantEntity');
      if (entity) {
        entity.classList.add('notif-pulse');
        setTimeout(() => entity.classList.remove('notif-pulse'), 2000);
      }

      const toast = document.createElement('div');
      toast.className = 'mind-toast';
      toast.innerHTML = `
        <div class="mind-toast-inner">
          <div class="mind-toast-icon">
            <div class="toast-thought-dot"></div>
          </div>
          <span>${message}</span>
        </div>
      `;
      toast.addEventListener('click', () => {
        open();
        toast.remove();
      });
      document.body.appendChild(toast);

      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.add('fade-out');
          setTimeout(() => toast.remove(), 400);
        }
      }, 5000);
    }
  }

  // ---- ESCUCHAR CAMBIOS DE SECCIÓN ----
  function listenToSectionChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.classList.contains('app-section') && target.classList.contains('active')) {
            const section = target.id.replace('section-', '');
            onSectionChange(section);
          }
        }
      });
    });

    document.querySelectorAll('.app-section').forEach(section => {
      observer.observe(section, { attributes: true });
    });
  }

  let _lastSection = null;
  function onSectionChange(section) {
    if (section === _lastSection) return;
    _lastSection = section;

    const context = AssistantBrain.buildContext();
    const msg = AssistantBrain.getSectionMessage(section, context);

    if (msg && _isOpen) {
      addMessage('assistant', msg);
      showSuggestions(AssistantBrain.getQuickSuggestions(context));
    } else if (msg && !_isOpen) {
      showProactiveNotification(msg.substring(0, 80) + '...');
    }
  }

  // ---- INICIALIZACIÓN ----
  function init() {
    createWidget();
    listenToSectionChanges();
  }

  return {
    init,
    open,
    close,
    toggle,
    sendMessage,
    handleSuggestion,
    addMessage,
    showProactiveNotification,
    isOpen: () => _isOpen
  };
})();

window.AssistantChat = AssistantChat;
