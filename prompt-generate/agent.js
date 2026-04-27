/**
 * PromptGenerate Agent - Asistente Virtual Genio Mágico
 * Diseño original con funcionalidad funcionando
 */

(function() {
  console.log('[Agent] Cargando...');
  
  const config = {
    avatarPath: 'icons/agent.gif'
  };
  
  // Crear botón flotante (bola azul original con imagen)
  function createFloatingButton() {
    const existing = document.getElementById('genieInvokeBtn');
    if (existing) existing.remove();
    
    const btn = document.createElement('div');
    btn.id = 'genieInvokeBtn';
    btn.innerHTML = `<img src="${config.avatarPath}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.5);">`;
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 99998;
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.5);
      animation: floatGenie 2s ease-in-out infinite;
      border: 3px solid rgba(255,255,255,0.4);
      transition: transform 0.2s;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatGenie {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      #genieInvokeBtn:hover {
        transform: scale(1.15) !important;
      }
    `;
    document.head.appendChild(style);
    
    btn.onclick = function() {
      showGenieBubble();
    };
    
    document.body.appendChild(btn);
  }
  
  // Mostrar burbuja de pensamiento completa (diseño original)
  function showGenieBubble() {
    const existingBubble = document.getElementById('floatingGenie');
    if (existingBubble) {
      existingBubble.remove();
    }
    
    const bubble = document.createElement('div');
    bubble.id = 'floatingGenie';
    bubble.innerHTML = `
      <style>
        #floatingGenie {
          position: fixed;
          z-index: 99999;
          font-family: 'DM Sans', sans-serif;
          animation: bubbleAppear 0.4s ease;
        }
        
        @keyframes bubbleAppear {
          0% { transform: scale(0.5) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        
        .genie-bubble {
          position: relative;
          background: linear-gradient(145deg, #1a1a3e 0%, #252570 50%, #1e1e4a 100%);
          border-radius: 30px;
          padding: 20px 24px;
          max-width: 280px;
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.15);
          border: 2px solid rgba(139, 92, 246, 0.4);
          animation: bubbleFloat 3s ease-in-out infinite;
        }
        
        @keyframes bubbleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        .genie-glow {
          position: absolute;
          inset: -2px;
          border-radius: 32px;
          background: linear-gradient(45deg, #8b5cf6, #a78bfa, #6366f1, #8b5cf6);
          background-size: 400% 400%;
          animation: glowRotate 3s ease infinite;
          z-index: -1;
          opacity: 0.5;
          filter: blur(8px);
        }
        
        @keyframes glowRotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .thought-cloud {
          position: absolute;
          bottom: -35px;
          right: 30px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .thought-dot {
          background: linear-gradient(145deg, #1a1a3e, #252570);
          border: 2px solid rgba(139, 92, 246, 0.4);
          border-radius: 50%;
          animation: dotPulse 2s ease-in-out infinite;
        }
        
        .thought-dot:nth-child(1) { width: 18px; height: 18px; }
        .thought-dot:nth-child(2) { width: 12px; height: 12px; animation-delay: 0.2s; }
        .thought-dot:nth-child(3) { width: 8px; height: 8px; animation-delay: 0.4s; }
        
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.8); opacity: 0.7; }
        }
        
        .genie-head {
          position: absolute;
          bottom: -70px;
          right: 10px;
          width: 55px;
          height: 55px;
          animation: headBob 2.5s ease-in-out infinite;
        }
        
        @keyframes headBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-3deg); }
          75% { transform: translateY(-3px) rotate(3deg); }
        }
        
        .genie-head img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 3px solid rgba(139, 92, 246, 0.6);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
          object-fit: cover;
        }
        
        .genie-eyes {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
        }
        
        .eye {
          width: 12px;
          height: 14px;
          background: #fff;
          border-radius: 50%;
          position: relative;
          animation: eyeMove 4s ease-in-out infinite;
        }
        
        .eye::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: #1a1a3e;
          border-radius: 50%;
          top: 4px;
          left: 3px;
          animation: pupilMove 4s ease-in-out infinite;
        }
        
        @keyframes eyeMove {
          0%, 100% { transform: translateY(0); }
          20% { transform: translateY(-2px); }
          40% { transform: translateY(1px); }
          60% { transform: translateY(-1px); }
          80% { transform: translateY(2px); }
        }
        
        @keyframes pupilMove {
          0%, 100% { left: 3px; }
          25% { left: 5px; }
          50% { left: 2px; }
          75% { left: 4px; }
        }
        
        .genie-text {
          color: #e8e6f0;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        
        .genie-section {
          display: inline-block;
          background: rgba(139, 92, 246, 0.25);
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 11px;
          color: #a78bfa;
          margin-bottom: 8px;
        }
        
        .genie-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .genie-btn {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.3));
          border: 1px solid rgba(139, 92, 246, 0.5);
          color: #c4b5fd;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .genie-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
        }
        
        .genie-btn.no {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
          color: #fca5a5;
        }
        
        .genie-btn.chat {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.4);
          color: #6ee7b7;
        }
        
        .genie-chat {
          display: none;
          margin-top: 12px;
        }
        
        .genie-chat.active {
          display: block;
        }
        
        .genie-chat-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 10px 14px;
          color: #fff;
          font-size: 12px;
          outline: none;
          margin-top: 10px;
        }
        
        .genie-chat-input:focus {
          border-color: rgba(139, 92, 246, 0.7);
        }
        
        .genie-chat-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .genie-response {
          background: rgba(139, 92, 246, 0.15);
          border-radius: 12px;
          padding: 12px;
          margin-top: 10px;
          border-left: 3px solid #8b5cf6;
        }
        
        .genie-quick-options {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }
        
        .genie-quick-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.7);
          padding: 6px 10px;
          border-radius: 12px;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .genie-quick-btn:hover {
          background: rgba(139, 92, 246, 0.3);
          color: #fff;
        }
        
        .pos-top-left { top: 100px; left: 20px; }
        .pos-top-right { top: 100px; right: 20px; }
        .pos-bottom-left { bottom: 100px; left: 20px; }
        .pos-bottom-right { bottom: 100px; right: 20px; }
      </style>

      <div class="genie-bubble">
        <div class="genie-glow"></div>
        
        <div class="genie-text" id="genieText">
          <span class="genie-section" id="genieSection">🏠 Principal</span>
          <div id="genieMessage">¡Hola! 🪄 Soy tu asistente. ¿En qué puedo ayudarte?</div>
        </div>

        <div class="genie-actions" id="genieActions">
          <button class="genie-btn chat" onclick="AgentChat.startChat()">💬 Chatear</button>
          <button class="genie-btn" onclick="AgentChat.showHelp()">💡 Ayúdame</button>
          <button class="genie-btn no" onclick="AgentChat.dismiss()">✕ No</button>
        </div>

        <div class="genie-chat" id="genieChat">
          <input type="text" class="genie-chat-input" id="chatInput" 
                 placeholder="Escribe tu pregunta..." 
                 onkeypress="if(event.key==='Enter')AgentChat.sendMessage()">
          <div class="genie-response" id="genieResponse" style="display:none;"></div>
          <div class="genie-quick-options">
            <button class="genie-quick-btn" onclick="AgentChat.ask('herramientas')">🛠️ Herramientas</button>
            <button class="genie-quick-btn" onclick="AgentChat.ask('créditos')">💰 Créditos</button>
            <button class="genie-quick-btn" onclick="AgentChat.ask('cómo funciona')">❓ Cómo usar</button>
            <button class="genie-quick-btn" onclick="AgentChat.ask('pro')">⭐ Pro</button>
          </div>
        </div>

        <div class="thought-cloud">
          <div class="thought-dot"></div>
          <div class="thought-dot"></div>
          <div class="thought-dot"></div>
        </div>
      </div>

      <div class="genie-head">
        <img src="${config.avatarPath}" alt="Genie">
        <div class="genie-eyes">
          <div class="eye"></div>
          <div class="eye"></div>
        </div>
      </div>
    `;
    
    // Posición aleatoria
    const positions = ['pos-top-left', 'pos-top-right', 'pos-bottom-left', 'pos-bottom-right'];
    const pos = positions[Math.floor(Math.random() * positions.length)];
    bubble.className = pos;
    
    document.body.appendChild(bubble);
  }
  
  // Objeto global para las acciones
  window.AgentChat = {
    // Base de conocimiento
    knowledgeBase: {
      'herramientas': '🛠️ Dispones de:<br>• <b>Generador</b> - Crea prompts para IA<br>• <b>Optimizador</b> - Mejora tus prompts<br>• <b>Biblioteca</b> - Guarda tus prompts<br>• <b>Juegos</b> - Aprende jugando',
      'cómo usar': '❓ Cómo usar:<br>1. Elige una herramienta<br>2. Describe lo que necesitas<br>3. Genera y copia<br>4. Usa en ChatGPT, Claude, Gemini',
      'créditos': '💰 Tienes créditos gratuitos diarios.<br>Cada generación = 1 crédito.<br>Con <b>PRO</b> créditos ilimitados.',
      'pro': '⭐ <b>Versión PRO</b>:<br>• Créditos ilimitados<br>• Funciones exclusivas<br>• Soporte prioritario',
      'generar': '🚀 Para generar un prompt:<br>1. Ve al Generador<br>2. Describe tu necesidad<br>3. Selecciona modelo (GPT/Claude/Gemini)<br>4. ¡Genera!',
      'optimizar': '✨ Para optimizar:<br>1. Ve al Optimizador<br>2. Pega tu prompt<br>3. Selecciona nivel<br>4. ¡Optimiza!',
      'biblioteca': '📚 La Biblioteca guarda tus prompts.<br>Puedes:<br>• Guardar favoritos<br>• Organizar por carpetas<br>• Exportar',
      'hola': '¡Hola! 🪄 Soy tu asistente.<br>¿En qué puedo ayudarte?<br><br>Puedes preguntarme sobre herramientas, créditos, cómo usar, etc.',
      'ayuda': '¡Estoy para ayudarte! 🪄<br><br>Puedo informarte sobre:<br>• Herramientas disponibles<br>• Cómo usar la plataforma<br>• Créditos y planes PRO',
      'default': '🤔 No entendí bien.<br>Usa los botones rápidos o pregúntame sobre:<br>• herramientas<br>• créditos<br>• cómo usar<br>• pro'
    },
    
    startChat: function() {
      const actions = document.getElementById('genieActions');
      const chat = document.getElementById('genieChat');
      const message = document.getElementById('genieMessage');
      const section = document.getElementById('genieSection');
      
      if (actions && chat && message && section) {
        actions.style.display = 'none';
        chat.classList.add('active');
        section.textContent = '💬 CHAT';
        message.textContent = '¡Escribe tu pregunta o usa las opciones rápidas!';
      }
    },
    
    sendMessage: function() {
      const input = document.getElementById('chatInput');
      const response = document.getElementById('genieResponse');
      const message = document.getElementById('genieMessage');
      
      if (!input) return;
      
      const msg = input.value.trim().toLowerCase();
      if (!msg) return;
      
      input.value = '';
      
      // Buscar respuesta
      let answer = this.knowledgeBase.default;
      for (const [key, value] of Object.entries(this.knowledgeBase)) {
        if (msg.includes(key)) {
          answer = value;
          break;
        }
      }
      
      // Mostrar respuesta
      if (response && message) {
        response.style.display = 'block';
        response.innerHTML = answer;
        
        // Animación de "pensando"
        message.innerHTML = '💭 Pensando...';
        setTimeout(() => {
          message.innerHTML = '¿Algo más?';
        }, 500);
      }
    },
    
    ask: function(topic) {
      const response = document.getElementById('genieResponse');
      const message = document.getElementById('genieMessage');
      
      if (response && message) {
        response.style.display = 'block';
        response.innerHTML = this.knowledgeBase[topic] || this.knowledgeBase.default;
        message.innerHTML = '¿Algo más?';
      }
    },
    
    showHelp: function() {
      const bubble = document.getElementById('floatingGenie');
      const message = document.getElementById('genieMessage');
      const section = document.getElementById('genieSection');
      
      if (bubble && message && section) {
        section.textContent = '💡 AYUDA';
        message.innerHTML = this.knowledgeBase['cómo usar'];
      }
    },
    
    dismiss: function() {
      const bubble = document.getElementById('floatingGenie');
      if (bubble) {
        bubble.style.animation = 'bubbleDisappear 0.5s ease forwards';
        setTimeout(() => bubble.remove(), 500);
      }
    }
  };
  
  // Agregar animación de desaparición
  const dismissStyle = document.createElement('style');
  dismissStyle.textContent = `
    @keyframes bubbleDisappear {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.5; }
      100% { transform: scale(0); opacity: 0; }
    }
  `;
  document.head.appendChild(dismissStyle);
  
  // Iniciar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(createFloatingButton, 1000);
    });
  } else {
    setTimeout(createFloatingButton, 1000);
  }
  
  // Atajo de teclado
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      showGenieBubble();
    }
  });
})();
