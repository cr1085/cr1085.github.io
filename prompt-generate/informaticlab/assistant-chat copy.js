// ================================================
// assistant-chat.js — Interfaz del chat flotante
// InfoMática Platform - Asistente Inteligente
// ================================================

const AssistantChat = (function() {
  let _isOpen = false;
  let _isTyping = false;
  let _container = null;
  let _messagesEl = null;
  let _inputEl = null;
  let _unreadCount = 0;
  let _initialized = false;

  // ---- CREAR EL WIDGET HTML ----
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'assistant-widget';
    widget.innerHTML = `
      <!-- Botón flotante -->
      <button class="assistant-fab" id="assistantFab" aria-label="Abrir asistente">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="assistant-badge" id="assistantBadge" style="display:none">1</span>
      </button>

      <!-- Ventana del chat -->
      <div class="assistant-panel" id="assistantPanel">
        <!-- Header -->
        <div class="assistant-header">
          <div class="assistant-header-info">
            <div class="assistant-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div>
              <div class="assistant-header-title">Asistente InfoMática</div>
              <div class="assistant-header-status">Siempre disponible para ayudarte</div>
            </div>
          </div>
          <div class="assistant-header-actions">
            <button class="assistant-action-btn" id="assistantClear" title="Limpiar chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
            <button class="assistant-action-btn" id="assistantClose" title="Cerrar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mensajes -->
        <div class="assistant-messages" id="assistantMessages">
          <!-- Los mensajes se insertan aquí -->
        </div>

        <!-- Sugerencias rápidas -->
        <div class="assistant-suggestions" id="assistantSuggestions"></div>

        <!-- Input -->
        <div class="assistant-input-area">
          <textarea 
            class="assistant-input" 
            id="assistantInput" 
            placeholder="Escribe tu pregunta..." 
            rows="1"
          ></textarea>
          <button class="assistant-send" id="assistantSend" title="Enviar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    _container = widget;
    _messagesEl = document.getElementById('assistantMessages');
    _inputEl = document.getElementById('assistantInput');

    bindEvents();
  }

  // ---- BIND EVENTOS ----
  function bindEvents() {
    const fab = document.getElementById('assistantFab');
    const closeBtn = document.getElementById('assistantClose');
    const clearBtn = document.getElementById('assistantClear');
    const sendBtn = document.getElementById('assistantSend');
    const panel = document.getElementById('assistantPanel');

    fab.addEventListener('click', toggle);
    closeBtn.addEventListener('click', close);
    clearBtn.addEventListener('click', clearChat);
    sendBtn.addEventListener('click', sendMessage);

    _inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Auto-resize textarea
    _inputEl.addEventListener('input', () => {
      _inputEl.style.height = 'auto';
      _inputEl.style.height = Math.min(_inputEl.scrollHeight, 100) + 'px';
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (_isOpen && !_container.contains(e.target)) {
        // No cerrar automáticamente en desktop
      }
    });
  }

  // ---- ABRIR / CERRAR ----
  function toggle() {
    _isOpen ? close() : open();
  }

  function open() {
    _isOpen = true;
    document.getElementById('assistantPanel').classList.add('open');
    document.getElementById('assistantFab').classList.add('active');
    _unreadCount = 0;
    updateBadge();

    // Focus input
    setTimeout(() => _inputEl.focus(), 300);

    // Scroll al último mensaje
    scrollToBottom();

    // Mostrar mensaje de sección si es la primera vez
    if (!_initialized) {
      _initialized = true;
      showWelcomeMessage();
    }
  }

  function close() {
    _isOpen = false;
    document.getElementById('assistantPanel').classList.remove('open');
    document.getElementById('assistantFab').classList.remove('active');
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

    // Agregar mensaje del usuario
    addMessage('user', text);
    _inputEl.value = '';
    _inputEl.style.height = 'auto';

    // Ocultar sugerencias
    hideSuggestions();

    // Mostrar indicador de escritura
    showTyping();

    try {
      // Generar respuesta
      const response = await AssistantBrain.generateResponse(text);

      hideTyping();

      // Mostrar respuesta con efecto de escritura
      await addMessageWithEffect('assistant', response.text);

      // Mostrar nuevas sugerencias
      const context = AssistantBrain.buildContext();
      showSuggestions(AssistantBrain.getQuickSuggestions(context));
    } catch (err) {
      hideTyping();
      addMessage('assistant', 'Disculpa, hubo un error. ¿Puedes intentar de nuevo?');
      console.error('Assistant error:', err);
    }
  }

  // ---- AGREGAR MENSAJE ----
  function addMessage(role, content) {
    const msgEl = document.createElement('div');
    msgEl.className = `assistant-message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'assistant-bubble';
    bubble.innerHTML = formatContent(content);

    // Timestamp
    const time = document.createElement('div');
    time.className = 'assistant-time';
    time.textContent = formatTime(new Date());

    msgEl.appendChild(bubble);
    msgEl.appendChild(time);
    _messagesEl.appendChild(msgEl);

    scrollToBottom();

    // Si es mensaje del asistente y el chat está cerrado, mostrar badge
    if (role === 'assistant' && !_isOpen) {
      _unreadCount++;
      updateBadge();
    }
  }

  // ---- EFECTO DE ESCRITURA ----
  async function addMessageWithEffect(role, content) {
    const msgEl = document.createElement('div');
    msgEl.className = `assistant-message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'assistant-bubble';

    const time = document.createElement('div');
    time.className = 'assistant-time';
    time.textContent = formatTime(new Date());

    msgEl.appendChild(bubble);
    msgEl.appendChild(time);
    _messagesEl.appendChild(msgEl);

    // Escribir carácter por carácter
    const formatted = formatContent(content);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formatted;
    const plainText = tempDiv.textContent || '';

    // Para textos largos, mostrar directamente
    if (plainText.length > 200) {
      bubble.innerHTML = formatted;
    } else {
      // Efecto de escritura para respuestas cortas
      let currentIndex = 0;
      const chars = [...formatted];
      
      await new Promise(resolve => {
        const interval = setInterval(() => {
          currentIndex += 3; // 3 caracteres a la vez
          if (currentIndex >= chars.length) {
            bubble.innerHTML = formatted;
            clearInterval(interval);
            resolve();
          } else {
            bubble.innerHTML = chars.slice(0, currentIndex).join('');
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
    typingEl.className = 'assistant-message assistant';
    typingEl.id = 'assistantTyping';
    typingEl.innerHTML = `
      <div class="assistant-bubble assistant-typing">
        <span></span><span></span><span></span>
      </div>
    `;
    _messagesEl.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTyping() {
    _isTyping = false;
    const typingEl = document.getElementById('assistantTyping');
    if (typingEl) typingEl.remove();
  }

  // ---- SUGERENCIAS RÁPIDAS ----
  function showSuggestions(suggestions) {
    const container = document.getElementById('assistantSuggestions');
    if (!container) return;

    container.innerHTML = suggestions.map(s => 
      `<button class="assistant-suggestion" onclick="AssistantChat.handleSuggestion(this)">${s}</button>`
    ).join('');
    container.style.display = suggestions.length > 0 ? 'flex' : 'none';
  }

  function hideSuggestions() {
    const container = document.getElementById('assistantSuggestions');
    if (container) container.style.display = 'none';
  }

  function handleSuggestion(btn) {
    const text = btn.textContent;
    _inputEl.value = text;
    sendMessage();
  }

  // ---- LIMPIAR CHAT ----
  function clearChat() {
    _messagesEl.innerHTML = '';
    AssistantBrain.resetConversation();
    _initialized = false;
    showWelcomeMessage();
  }

  // ---- FORMATO ----
  function formatContent(content) {
    // Convertir markdown simple a HTML
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

  // ---- MOSTRAR NOTIFICACIÓN PROACTIVA ----
  function showProactiveNotification(message) {
    if (!_isOpen) {
      _unreadCount++;
      updateBadge();

      // Mostrar toast flotante
      const toast = document.createElement('div');
      toast.className = 'assistant-toast';
      toast.innerHTML = `
        <div class="assistant-toast-content">
          <span class="assistant-toast-icon">💡</span>
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
          setTimeout(() => toast.remove(), 300);
        }
      }, 5000);
    }
  }

  // ---- ESCUCHAR CAMBIOS DE SECCIÓN ----
  function listenToSectionChanges() {
    // Observar cambios en las secciones activas
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
      // Notificación proactiva sutil
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
