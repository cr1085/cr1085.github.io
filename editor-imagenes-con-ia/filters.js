/**
 * filters.js — CSS/Canvas filter adjustments and presets
 */
const Filters = (() => {
  const presets = {
    none: {},
    grayscale: { saturation: -100 },
    sepia: { saturation: -50, brightness: 10, hue: 30 },
    vivid: { saturation: 60, contrast: 20, brightness: 5 },
    cool: { hue: 200, saturation: 20, brightness: 5 },
    warm: { hue: 30, saturation: 30, brightness: 5 },
    fade: { contrast: -25, saturation: -30, brightness: 15 },
    dramatic: { contrast: 60, saturation: -20, brightness: -10 },
    neon: { saturation: 100, contrast: 30, brightness: 20 },
  };

  const sliders = document.querySelectorAll('.adjust-slider');
  sliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      const filter = e.target.dataset.filter;
      const valDisplay = e.target.parentElement.querySelector('.adjust-val');
      if (filter === 'hue') valDisplay.textContent = val + '°';
      else if (filter === 'blur') valDisplay.textContent = val + 'px';
      else valDisplay.textContent = val;
      CanvasManager.applyFilter(filter, val);
    });
  });

  document.getElementById('resetAdjustBtn').addEventListener('click', () => {
    sliders.forEach(s => {
      s.value = s.defaultValue;
      const disp = s.parentElement.querySelector('.adjust-val');
      if (disp) disp.textContent = s.defaultValue + (s.dataset.filter === 'hue' ? '°' : s.dataset.filter === 'blur' ? 'px' : '');
    });
    CanvasManager.clearFilters();
    Toast.show('Adjustments reset', 'info');
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = presets[btn.dataset.filterPreset];
      if (!preset) return;
      CanvasManager.clearFilters();
      if (preset.saturation !== undefined) CanvasManager.applyFilter('saturation', preset.saturation);
      if (preset.contrast !== undefined) CanvasManager.applyFilter('contrast', preset.contrast);
      if (preset.brightness !== undefined) CanvasManager.applyFilter('brightness', preset.brightness);
      if (preset.hue !== undefined) CanvasManager.applyFilter('hue', preset.hue);
    });
  });

  // Panel tabs
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel-content').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel + 'Panel').classList.add('active');
    });
  });

  return {};
})();
