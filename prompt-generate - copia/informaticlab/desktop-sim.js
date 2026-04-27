// ================================================
// desktop-sim.js — Simulador de Escritorio Windows
// InfoMática Platform
// ================================================

const DesktopSim = (function() {
  // Estado del simulador
  let state = {
    files: [],
    folders: [],
    selectedItems: [],
    clipboard: null,
    clipboardAction: null, // 'copy' or 'cut'
    currentPath: 'Escritorio',
    trashItems: [],
    contextMenuVisible: false,
    renameMode: false
  };

  // Plantillas de archivos/folders
  const FILE_ICONS = {
    imagen: '🖼️',
    documento: '📄',
    pdf: '📕',
    musica: '🎵',
    video: '🎬',
    archivo: '📎'
  };

  // ---- INICIALIZAR SIMULADOR ----
  function init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Estado inicial
    state.files = [];
    state.folders = [
      { id: 'folder-1', name: 'Documentos', icon: '📁', x: 50, y: 80 },
      { id: 'folder-2', name: 'Imágenes', icon: '🖼️', x: 50, y: 160 },
      { id: 'folder-3', name: 'Música', icon: '🎵', x: 50, y: 240 }
    ];
    state.selectedItems = [];
    state.currentPath = 'Escritorio';

    render(container);
  }

  // ---- RENDERIZAR ----
  function render(container) {
    const stateCopy = state; // closure
    
    container.innerHTML = `
      <div class="desktop-sim">
        <!-- Fondo de escritorio -->
        <div class="desktop-bg" id="desktopArea">
          ${stateCopy.folders.map(f => `
            <div class="desktop-item folder" 
                 data-id="${f.id}" 
                 data-type="folder"
                 style="left:${f.x}px;top:${f.y}px"
                 ondblclick="DesktopSim.openFolder('${f.id}')"
                 onclick="DesktopSim.selectItem('${f.id}', event)"
                 oncontextmenu="DesktopSim.showContextMenu(event, '${f.id}', 'folder')">
              <div class="item-icon">${f.icon}</div>
              <div class="item-name">${f.name}</div>
            </div>
          `).join('')}
          
          ${stateCopy.files.map(f => `
            <div class="desktop-item file" 
                 data-id="${f.id}" 
                 data-type="file"
                 style="left:${f.x}px;top:${f.y}px"
                 onclick="DesktopSim.selectItem('${f.id}', event)"
                 ondblclick="DesktopSim.openFile('${f.id}')"
                 oncontextmenu="DesktopSim.showContextMenu(event, '${f.id}', 'file')">
              <div class="item-icon">${FILE_ICONS[f.type] || '📎'}</div>
              <div class="item-name">${f.name}</div>
            </div>
          `).join('')}
        </div>

        <!-- Barra de tareas -->
        <div class="taskbar">
          <button class="taskbar-btn start-btn" onclick="DesktopSim.showStartMenu()">
            🪟
          </button>
          <div class="taskbar-center">
            <div class="taskbar-item">📁 Explorador de archivos</div>
          </div>
          <div class="taskbar-right">
            <span class="clock" id="desktopClock">12:00</span>
          </div>
        </div>

        <!-- Menú contextual -->
        <div class="context-menu hidden" id="contextMenu">
          <div class="menu-item" onclick="DesktopSim.actionNewFolder()">📁 Nueva carpeta</div>
          <div class="menu-item" onclick="DesktopSim.actionNewFile()">📄 Nuevo archivo</div>
          <div class="divider"></div>
          <div class="menu-item" onclick="DesktopSim.actionRename()">✏️ Renombrar</div>
          <div class="menu-item" onclick="DesktopSim.actionDelete()">🗑️ Eliminar</div>
          <div class="divider"></div>
          <div class="menu-item" onclick="DesktopSim.actionCopy()">📋 Copiar</div>
          <div class="menu-item" onclick="DesktopSim.actionCut()">✂️ Cortar</div>
          <div class="menu-item" onclick="DesktopSim.actionPaste()">📥 Pegar</div>
        </div>

        <!-- Modal para tareas -->
        <div class="desktop-task-overlay hidden" id="desktopTaskOverlay">
          <div class="desktop-task-modal">
            <div class="task-header">
              <h3 id="taskTitle">Tarea</h3>
              <button onclick="DesktopSim.closeTask()">✕</button>
            </div>
            <div class="task-content" id="taskContent"></div>
          </div>
        </div>
      </div>
    `;

    // Click fuera cierra menú
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.context-menu')) {
        hideContextMenu();
      }
    });

    // Reloj
    updateClock();
  }

  // ---- SELECCIONAR ITEM ----
  function selectItem(id, event) {
    if (event && event.ctrlKey) {
      // Multi-selección
      if (state.selectedItems.includes(id)) {
        state.selectedItems = state.selectedItems.filter(i => i !== id);
      } else {
        state.selectedItems.push(id);
      }
    } else {
      state.selectedItems = [id];
    }
    updateSelectionUI();
  }

  function updateSelectionUI() {
    document.querySelectorAll('.desktop-item').forEach(el => {
      const id = el.dataset.id;
      if (state.selectedItems.includes(id)) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  }

  // ---- MENÚ CONTEXTUAL ----
  function showContextMenu(event, id, type) {
    event.preventDefault();
    event.stopPropagation();
    
    // Seleccionar el item
    state.selectedItems = [id];
    updateSelectionUI();

    const menu = document.getElementById('contextMenu');
    menu.classList.remove('hidden');
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    state.contextMenuVisible = true;
    state.contextMenuTarget = { id, type };
  }

  function hideContextMenu() {
    const menu = document.getElementById('contextMenu');
    if (menu) menu.classList.add('hidden');
    state.contextMenuVisible = false;
  }

  // ---- ACCIONES ----
  function actionNewFolder() {
    const name = prompt('Nombre de la carpeta:', 'Nueva carpeta');
    if (name) {
      const newFolder = {
        id: 'folder-' + Date.now(),
        name: name,
        icon: '📁',
        x: 150 + Math.random() * 100,
        y: 80 + Math.random() * 100
      };
      state.folders.push(newFolder);
      render(document.querySelector('.desktop-sim'));
      showToast('success', 'Carpeta creada', name);
      trackAction('create_folder');
    }
    hideContextMenu();
  }

  function actionNewFile() {
    const name = prompt('Nombre del archivo:', 'Nuevo documento');
    const type = prompt('Tipo (documento/imagen/pdf):', 'documento');
    if (name) {
      const newFile = {
        id: 'file-' + Date.now(),
        name: name + '.' + (type === 'imagen' ? 'png' : type === 'pdf' ? 'pdf' : 'docx'),
        type: type || 'documento',
        x: 150 + Math.random() * 100,
        y: 80 + Math.random() * 100
      };
      state.files.push(newFile);
      render(document.querySelector('.desktop-sim'));
      showToast('success', 'Archivo creado', name);
      trackAction('create_file');
    }
    hideContextMenu();
  }

  function actionRename() {
    const target = state.contextMenuTarget;
    if (!target) return;

    const item = [...state.folders, ...state.files].find(i => i.id === target.id);
    if (!item) return;

    const newName = prompt('Nuevo nombre:', item.name);
    if (newName && newName !== item.name) {
      item.name = newName;
      render(document.querySelector('.desktop-sim'));
      showToast('success', 'Renombrado', newName);
      trackAction('rename');
    }
    hideContextMenu();
  }

  function actionDelete() {
    const target = state.contextMenuTarget;
    if (!target) return;

    const confirmDelete = confirm('¿Enviar a papelera?');
    if (confirmDelete) {
      const { id, type } = target;
      
      // Mover a trash
      const item = [...state.folders, ...state.files].find(i => i.id === id);
      if (item) {
        state.trashItems.push({ ...item, originalPath: state.currentPath });
        
        // Eliminar de su位置 original
        if (type === 'folder') {
          state.folders = state.folders.filter(f => f.id !== id);
        } else {
          state.files = state.files.filter(f => f.id !== id);
        }
        
        render(document.querySelector('.desktop-sim'));
        showToast('info', 'Enviado a papelera', item.name);
        trackAction('delete');
      }
    }
    hideContextMenu();
  }

  function actionCopy() {
    const target = state.contextMenuTarget;
    if (!target) return;

    state.clipboard = { ...target };
    state.clipboardAction = 'copy';
    showToast('info', 'Copiado al portapapeles');
    hideContextMenu();
  }

  function actionCut() {
    const target = state.contextMenuTarget;
    if (!target) return;

    state.clipboard = { ...target };
    state.clipboardAction = 'cut';
    showToast('info', 'Cortado al portapapeles');
    hideContextMenu();
  }

  function actionPaste() {
    if (!state.clipboard) {
      showToast('error', 'Portapapeles vacío');
      return;
    }

    const item = [...state.folders, ...state.files].find(i => i.id === state.clipboard.id);
    if (!item) return;

    if (state.clipboardAction === 'copy') {
      // Copiar (crear duplicado)
      const newItem = {
        ...item,
        id: (item.type === 'folder' ? 'folder-' : 'file-') + Date.now(),
        name: item.name + ' (copia)',
        x: item.x + 20,
        y: item.y + 20
      };
      if (item.type === 'folder') state.folders.push(newItem);
      else state.files.push(newItem);
      showToast('success', 'Copiado', newItem.name);
    } else if (state.clipboardAction === 'cut') {
      // Mover (eliminar del origen)
      if (item.type === 'folder') {
        state.folders = state.folders.filter(f => f.id !== item.id);
        item.id = 'folder-' + Date.now();
        state.folders.push(item);
      } else {
        state.files = state.files.filter(f => f.id !== item.id);
        item.id = 'file-' + Date.now();
        state.files.push(item);
      }
      state.clipboard = null;
      showToast('success', 'Movido', item.name);
    }

    render(document.querySelector('.desktop-sim'));
    trackAction('paste');
    hideContextMenu();
  }

  // ---- ABRIR FOLDER ----
  function openFolder(id) {
    const folder = state.folders.find(f => f.id === id);
    if (!folder) return;

    showToast('info', 'Abriendo carpeta', folder.name);
    // Simulación - en realidad mostraría contenido
    trackAction('open_folder');
  }

  function openFile(id) {
    const file = state.files.find(f => f.id === id);
    if (!file) return;
    
    showToast('info', 'Abriendo archivo', file.name);
    trackAction('open_file');
  }

  // ---- SHOW START MENU ----
  function showStartMenu() {
    showToast('info', 'Menú Inicio', 'Demo - Panel de búsqueda');
  }

  // ---- TAREAS DYNAMICAS ----
  const TASKS = [
    {
      id: 'task-create-folder',
      title: 'Crear una carpeta',
      description: 'Crea una carpeta llamada "Proyectos" en el escritorio',
      check: () => state.folders.some(f => f.name.toLowerCase().includes('proyecto')),
      xp: 20
    },
    {
      id: 'task-rename-folder',
      title: 'Renombrar carpeta',
      description: 'Renombra la carpeta "Documentos" a "Mis Documentos"',
      check: () => state.folders.some(f => f.name === 'Mis Documentos'),
      xp: 15
    },
    {
      id: 'task-delete-file',
      title: 'Eliminar archivo',
      description: 'Crea un archivo y luego envíalo a la papelera',
      check: () => state.trashItems.length > 0,
      xp: 15
    },
    {
      id: 'task-copy-paste',
      title: 'Copiar y pegar',
      description: 'Copia cualquier carpeta y pégala en el escritorio',
      check: () => {
        const folders = state.folders.filter(f => f.name.includes('copia'));
        return folders.length > 0;
      },
      xp: 25
    }
  ];

  function loadTask(taskId) {
    const task = TASKS.find(t => t.id === taskId);
    if (!task) return;

    const overlay = document.getElementById('desktopTaskOverlay');
    const titleEl = document.getElementById('taskTitle');
    const contentEl = document.getElementById('taskContent');

    titleEl.textContent = task.title;
    contentEl.innerHTML = `
      <p>${task.description}</p>
      <button class="btn btn-primary" onclick="DesktopSim.checkTask('${task.id}')" style="margin-top:16px">
        ✓ Verificar tarea
      </button>
    `;

    overlay.classList.remove('hidden');
    state.currentTask = task;
  }

  function checkTask(taskId) {
    const task = TASKS.find(t => t.id === taskId);
    if (!task) return;

    if (task.check()) {
      showToast('success', '¡Tarea completada!', `+${task.xp} XP`);
      Progress.addXp(task.xp, `Tarea: ${task.title}`);
      closeTask();
      trackAction('task_complete');
    } else {
      showToast('error', 'Aún no完成', 'Intenta de nuevo');
    }
  }

  function closeTask() {
    const overlay = document.getElementById('desktopTaskOverlay');
    if (overlay) overlay.classList.add('hidden');
    state.currentTask = null;
  }

  // ---- HELPERS ----
  function updateClock() {
    const clock = document.getElementById('desktopClock');
    if (clock) {
      const now = new Date();
      clock.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
  }

  function trackAction(action) {
    // Integrar con sistema de progreso
    console.log('Desktop action:', action);
  }

  // ---- DRAG & DROP ----
  let dragItem = null;
  let dragOffset = { x: 0, y: 0 };

  function handleDragStart(e, itemId) {
    const item = [...state.folders, ...state.files].find(i => i.id === itemId);
    if (!item) return;

    dragItem = item;
    const el = e.target.closest('.desktop-item');
    const rect = el.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }

  function handleDragMove(e) {
    if (!dragItem) return;

    const desktop = document.getElementById('desktopArea');
    const rect = desktop.getBoundingClientRect();

    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    dragItem.x = Math.max(0, newX);
    dragItem.y = Math.max(0, newY);

    const el = document.querySelector(`[data-id="${dragItem.id}"]`);
    if (el) {
      el.style.left = dragItem.x + 'px';
      el.style.top = dragItem.y + 'px';
    }
  }

  function handleDragEnd() {
    dragItem = null;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  }

  // ---- EXPORTS ----
  return {
    init,
    loadTask,
    checkTask,
    closeTask,
    actionNewFolder,
    actionNewFile,
    actionRename,
    actionDelete,
    actionCopy,
    actionCut,
    actionPaste,
    selectItem,
    showContextMenu,
    openFolder,
    openFile,
    showStartMenu,
    handleDragStart,
    handleDragMove,
    handleDragEnd
  };
})();

window.DesktopSim = DesktopSim;