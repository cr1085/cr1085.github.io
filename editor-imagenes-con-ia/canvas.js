/**
 * canvas.js — Fabric.js canvas manager
 * Handles all canvas operations: draw, layers, undo/redo, import/export
 */
const CanvasManager = (() => {
  let fabric_canvas = null;
  let zoom = 1;
  let history = [];
  let historyIndex = -1;
  let activeTool = 'select';
  let maskMode = false;
  let maskCanvas = null;
  let maskCtx = null;
  let isMaskDrawing = false;
  let layers = [];
  let activeLayerId = null;

  const init = () => {
    fabric_canvas = new fabric.Canvas('mainCanvas', {
      width: 800, height: 600,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      selection: true,
    });
    setupEventListeners();
    setupDrop();
    saveState();
    renderLayers();
  };

  const setupEventListeners = () => {
    const c = fabric_canvas;
    c.on('path:created', saveState);
    c.on('object:modified', saveState);
    c.on('object:added', () => { renderLayers(); });
    c.on('object:removed', () => { renderLayers(); });

    document.getElementById('brushSize').addEventListener('input', (e) => {
      document.getElementById('brushSizeVal').textContent = e.target.value;
      if (c.isDrawingMode) c.freeDrawingBrush.width = parseInt(e.target.value);
    });
    document.getElementById('colorPicker').addEventListener('input', (e) => {
      if (c.isDrawingMode) c.freeDrawingBrush.color = e.target.value;
    });
    document.getElementById('opacitySlider').addEventListener('input', (e) => {
      document.getElementById('opacityVal').textContent = e.target.value;
      const obj = c.getActiveObject();
      if (obj) { obj.set('opacity', e.target.value / 100); c.renderAll(); }
    });

    // Tool buttons
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setTool(btn.dataset.tool);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') { e.preventDefault(); c.discardActiveObject(); c.selectAll(); c.renderAll(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (c.getActiveObject()) { c.remove(c.getActiveObject()); saveState(); }
      }
      const toolMap = { 'v': 'select', 'b': 'draw', 'e': 'erase', 'c': 'crop', 't': 'text', 'm': 'mask' };
      if (toolMap[e.key.toLowerCase()]) setTool(toolMap[e.key.toLowerCase()]);
    });

    // Zoom buttons
    document.getElementById('zoomInBtn').addEventListener('click', () => setZoom(zoom + 0.1));
    document.getElementById('zoomOutBtn').addEventListener('click', () => setZoom(zoom - 0.1));
    document.getElementById('zoomFitBtn').addEventListener('click', fitToView);
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    document.getElementById('addLayerBtn').addEventListener('click', addLayer);
    document.getElementById('deleteLayerBtn').addEventListener('click', deleteActiveLayer);

    // Import / Export
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('fileInput').addEventListener('change', (e) => { if (e.target.files[0]) importImage(e.target.files[0]); });
    document.getElementById('exportBtn').addEventListener('click', exportImage);

    // New canvas
    document.getElementById('newCanvasBtn').addEventListener('click', () => {
      document.getElementById('newCanvasModal').classList.add('active');
    });
    document.getElementById('cancelNewCanvas').addEventListener('click', () => {
      document.getElementById('newCanvasModal').classList.remove('active');
    });
    document.getElementById('confirmNewCanvas').addEventListener('click', createNewCanvas);

    // Mask buttons
    document.getElementById('activateMaskBtn').addEventListener('click', () => toggleMaskMode(true));
    document.getElementById('clearMaskBtn').addEventListener('click', clearMask);

    // Shape tools on canvas click
    c.on('mouse:down', (opt) => {
      if (['rect','circle','line'].includes(activeTool)) {
        const ptr = c.getPointer(opt.e);
        addShape(activeTool, ptr);
      }
      if (maskMode) handleMaskDraw(opt, 'down');
    });
    c.on('mouse:move', (opt) => { if (maskMode && isMaskDrawing) handleMaskDraw(opt, 'move'); });
    c.on('mouse:up', () => { if (maskMode) isMaskDrawing = false; });
  };

  const setTool = (tool) => {
    activeTool = tool;
    const c = fabric_canvas;
    c.isDrawingMode = false;
    c.selection = true;
    maskMode = false;
    document.getElementById('canvasViewport').classList.remove('mask-mode');
    const existing = document.querySelector('.mask-mode-indicator');
    if (existing) existing.remove();

    switch(tool) {
      case 'draw':
        c.isDrawingMode = true;
        c.freeDrawingBrush.width = parseInt(document.getElementById('brushSize').value);
        c.freeDrawingBrush.color = document.getElementById('colorPicker').value;
        break;
      case 'erase':
        c.isDrawingMode = true;
        c.freeDrawingBrush.width = parseInt(document.getElementById('brushSize').value);
        c.freeDrawingBrush.color = 'rgba(0,0,0,1)';
        // Note: true eraser requires eraser brush extension
        Toast.show('Erase: draw over objects to select & delete', 'info');
        break;
      case 'text':
        c.isDrawingMode = false;
        c.once('mouse:down', (opt) => {
          if (activeTool !== 'text') return;
          const ptr = c.getPointer(opt.e);
          const text = new fabric.IText('Double-click to edit', {
            left: ptr.x, top: ptr.y,
            fontSize: 24, fill: document.getElementById('colorPicker').value,
            fontFamily: 'Syne, sans-serif', fontWeight: '700',
          });
          c.add(text); c.setActiveObject(text); text.enterEditing(); saveState();
        });
        break;
      case 'mask':
        toggleMaskMode(true);
        break;
      case 'select':
      default:
        c.isDrawingMode = false;
    }
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.tool-btn[data-tool="${tool}"]`)?.classList.add('active');
  };

  const addShape = (type, ptr) => {
    const c = fabric_canvas;
    const color = document.getElementById('colorPicker').value;
    let shape;
    if (type === 'rect') {
      shape = new fabric.Rect({ left: ptr.x, top: ptr.y, width: 100, height: 80, fill: 'transparent', stroke: color, strokeWidth: 2 });
    } else if (type === 'circle') {
      shape = new fabric.Circle({ left: ptr.x, top: ptr.y, radius: 50, fill: 'transparent', stroke: color, strokeWidth: 2 });
    } else if (type === 'line') {
      shape = new fabric.Line([ptr.x, ptr.y, ptr.x + 100, ptr.y], { stroke: color, strokeWidth: 2 });
    }
    if (shape) { c.add(shape); c.setActiveObject(shape); saveState(); setTool('select'); }
  };

  const toggleMaskMode = (on) => {
    maskMode = on;
    if (on) {
      document.getElementById('canvasViewport').classList.add('mask-mode');
      const indicator = document.createElement('div');
      indicator.className = 'mask-mode-indicator';
      indicator.textContent = '🖌 Mask Drawing Mode — Paint the area to edit';
      document.getElementById('canvasViewport').appendChild(indicator);
      fabric_canvas.isDrawingMode = true;
      fabric_canvas.freeDrawingBrush.color = 'rgba(255,0,100,0.5)';
      fabric_canvas.freeDrawingBrush.width = 40;
    } else {
      document.getElementById('canvasViewport').classList.remove('mask-mode');
      document.querySelector('.mask-mode-indicator')?.remove();
      fabric_canvas.isDrawingMode = false;
    }
  };

  const handleMaskDraw = (opt, type) => {
    if (type === 'down') isMaskDrawing = true;
  };

  const clearMask = () => {
    const c = fabric_canvas;
    const toRemove = c.getObjects().filter(o => o._isMask);
    toRemove.forEach(o => c.remove(o));
    c.renderAll();
    Toast.show('Mask cleared', 'info');
  };

  const saveState = () => {
    const c = fabric_canvas;
    if (!c) return;
    const state = JSON.stringify(c.toJSON());
    history = history.slice(0, historyIndex + 1);
    history.push(state);
    if (history.length > 50) history.shift();
    historyIndex = history.length - 1;
  };

  const undo = () => {
    if (historyIndex <= 0) { Toast.show('Nothing to undo', 'info'); return; }
    historyIndex--;
    fabric_canvas.loadFromJSON(history[historyIndex], () => { fabric_canvas.renderAll(); renderLayers(); });
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) { Toast.show('Nothing to redo', 'info'); return; }
    historyIndex++;
    fabric_canvas.loadFromJSON(history[historyIndex], () => { fabric_canvas.renderAll(); renderLayers(); });
  };

  const setZoom = (newZoom) => {
    zoom = Math.max(0.1, Math.min(4, newZoom));
    fabric_canvas.setZoom(zoom);
    fabric_canvas.setWidth(fabric_canvas.getWidth());
    document.getElementById('zoomLevel').textContent = Math.round(zoom * 100) + '%';
  };

  const fitToView = () => {
    const viewport = document.getElementById('canvasViewport');
    const vw = viewport.clientWidth - 40;
    const vh = viewport.clientHeight - 40;
    const cw = fabric_canvas.getWidth() / zoom;
    const ch = fabric_canvas.getHeight() / zoom;
    setZoom(Math.min(vw / cw, vh / ch, 1));
  };

  const importImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        const c = fabric_canvas;
        const scale = Math.min(c.width / img.width, c.height / img.height, 1);
        img.scale(scale);
        img.set({ left: (c.width - img.width * scale) / 2, top: (c.height - img.height * scale) / 2 });
        c.clear();
        c.add(img);
        c.renderAll();
        document.getElementById('dropHint').classList.add('hidden');
        saveState();
        Toast.show('Image imported!', 'success');
      });
    };
    reader.readAsDataURL(file);
  };

  const exportImage = () => {
    const dataURL = fabric_canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
    const link = document.createElement('a');
    link.download = `pixelmind_${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    Toast.show('Image exported!', 'success');
  };

  const getCanvasDataURL = (format='png') => {
    return fabric_canvas.toDataURL({ format, quality: 0.9 });
  };

  const loadImageFromURL = (url) => {
    fabric.Image.fromURL(url, (img) => {
      const c = fabric_canvas;
      const scale = Math.min(c.width / img.width, c.height / img.height, 1);
      img.scale(scale);
      img.set({ left: (c.width - img.width * scale) / 2, top: (c.height - img.height * scale) / 2 });
      c.clear();
      c.add(img);
      c.renderAll();
      document.getElementById('dropHint').classList.add('hidden');
      saveState();
    });
  };

  const loadImageFromDataURL = (dataURL) => {
    fabric.Image.fromURL(dataURL, (img) => {
      const c = fabric_canvas;
      const scale = Math.min(c.width / img.width, c.height / img.height, 1);
      img.scale(scale);
      img.set({ left: (c.width - img.width * scale) / 2, top: (c.height - img.height * scale) / 2 });
      c.clear();
      c.add(img);
      c.renderAll();
      document.getElementById('dropHint').classList.add('hidden');
      saveState();
    });
  };

  const createNewCanvas = () => {
    const w = parseInt(document.getElementById('newW').value) || 1024;
    const h = parseInt(document.getElementById('newH').value) || 1024;
    const bg = document.getElementById('newBg').value;
    const c = fabric_canvas;
    c.setWidth(w); c.setHeight(h);
    c.clear();
    if (bg !== 'transparent') c.setBackgroundColor(bg, c.renderAll.bind(c));
    else c.renderAll();
    document.getElementById('dropHint').classList.add('hidden');
    document.getElementById('newCanvasModal').classList.remove('active');
    saveState();
    Toast.show(`Canvas created: ${w}×${h}`, 'success');
  };

  const setupDrop = () => {
    const viewport = document.getElementById('canvasViewport');
    viewport.addEventListener('dragover', (e) => { e.preventDefault(); });
    viewport.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) importImage(file);
    });
  };

  const addLayer = () => {
    Toast.show('Layer added. Draw or add objects to use it.', 'info');
    const group = new fabric.Group([], { selectable: true });
    fabric_canvas.add(group);
    renderLayers();
  };

  const deleteActiveLayer = () => {
    const active = fabric_canvas.getActiveObject();
    if (active) { fabric_canvas.remove(active); saveState(); renderLayers(); }
    else Toast.show('Select an object to delete', 'info');
  };

  const renderLayers = () => {
    const list = document.getElementById('layersList');
    const objects = fabric_canvas ? fabric_canvas.getObjects() : [];
    list.innerHTML = '';
    objects.slice().reverse().forEach((obj, i) => {
      const idx = objects.length - 1 - i;
      const item = document.createElement('div');
      item.className = 'layer-item';
      const icon = obj.type === 'image' ? '🖼' : obj.type === 'i-text' ? '𝑻' : obj.type === 'path' ? '✏' : '⬜';
      item.innerHTML = `<span>${icon}</span><span>${obj.type || 'object'} ${idx + 1}</span>`;
      item.addEventListener('click', () => { fabric_canvas.setActiveObject(obj); fabric_canvas.renderAll(); });
      list.appendChild(item);
    });
  };

  const applyFilter = (filterType, value) => {
    const c = fabric_canvas;
    const activeObj = c.getActiveObject();
    const img = activeObj && activeObj.type === 'image' ? activeObj :
                 c.getObjects().find(o => o.type === 'image');
    if (!img) { Toast.show('No image on canvas to apply filter', 'info'); return; }
    img.filters = img.filters || [];
    // Remove existing same-type filter
    img.filters = img.filters.filter(f => !f._filterType || f._filterType !== filterType);
    let filter;
    switch (filterType) {
      case 'brightness': filter = new fabric.Image.filters.Brightness({ brightness: value / 100 }); break;
      case 'contrast': filter = new fabric.Image.filters.Contrast({ contrast: value / 100 }); break;
      case 'saturation': filter = new fabric.Image.filters.Saturation({ saturation: value / 100 }); break;
      case 'hue': filter = new fabric.Image.filters.HueRotation({ rotation: value / 360 * Math.PI * 2 }); break;
      case 'blur': filter = new fabric.Image.filters.Blur({ blur: value / 20 }); break;
      case 'grayscale': filter = new fabric.Image.filters.Grayscale(); break;
      case 'sepia': filter = new fabric.Image.filters.Sepia(); break;
      case 'invert': filter = new fabric.Image.filters.Invert(); break;
      case 'noise': filter = new fabric.Image.filters.Noise({ noise: value }); break;
    }
    if (filter) { filter._filterType = filterType; img.filters.push(filter); }
    img.applyFilters();
    c.renderAll();
  };

  const clearFilters = () => {
    const c = fabric_canvas;
    const img = c.getObjects().find(o => o.type === 'image');
    if (img) { img.filters = []; img.applyFilters(); c.renderAll(); }
  };

  const getMaskDataURL = () => {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = fabric_canvas.width;
    maskCanvas.height = fabric_canvas.height;
    const ctx = maskCanvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    const paths = fabric_canvas.getObjects('path').filter(p => p._isMask);
    paths.forEach(p => {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      // Simple bounding box mask
      const bounds = p.getBoundingRect();
      ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);
    });
    return maskCanvas.toDataURL();
  };

  return {
    init, setTool, undo, redo, setZoom, fitToView,
    importImage, exportImage, getCanvasDataURL, loadImageFromURL, loadImageFromDataURL,
    addLayer, deleteActiveLayer, renderLayers, applyFilter, clearFilters, getMaskDataURL,
    getCanvas: () => fabric_canvas,
  };
})();
