/**
 * ai-bridge.js — Bridge to AI backends
 * Supports: Stable Diffusion WebUI, ComfyUI, HuggingFace Spaces, Demo mode
 */
const AIBridge = (() => {
  let backend = 'demo';
  let baseURL = 'http://127.0.0.1:7860';

  // ─── BACKEND SELECTOR ───
  document.getElementById('backendSelect').addEventListener('change', (e) => {
    backend = e.target.value;
    const configEl = document.getElementById('backendConfig');
    const statusEl = document.getElementById('backendStatus');
    if (backend === 'demo') {
      configEl.style.display = 'none';
      statusEl.className = 'backend-status demo';
      statusEl.textContent = '● Demo Mode';
    } else if (backend === 'huggingface') {
      configEl.style.display = 'none';
      statusEl.className = 'backend-status offline';
      statusEl.textContent = '● HuggingFace (configure below)';
    } else {
      configEl.style.display = 'flex';
      baseURL = backend === 'comfyui' ? 'http://127.0.0.1:8188' : 'http://127.0.0.1:7860';
      document.getElementById('backendUrl').value = baseURL;
      statusEl.className = 'backend-status offline';
      statusEl.textContent = '● Disconnected';
    }
  });

  document.getElementById('testConnectionBtn').addEventListener('click', testConnection);
  document.getElementById('backendUrl').addEventListener('change', (e) => { baseURL = e.target.value; });

  async function testConnection() {
    const statusEl = document.getElementById('backendStatus');
    statusEl.className = 'backend-status';
    statusEl.textContent = '● Testing...';
    try {
      const endpoint = backend === 'comfyui' ? '/system_stats' : '/sdapi/v1/samplers';
      const res = await fetch(baseURL + endpoint, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        statusEl.className = 'backend-status online';
        statusEl.textContent = '● Connected';
        Toast.show('AI backend connected!', 'success');
      } else throw new Error('Bad response');
    } catch {
      statusEl.className = 'backend-status offline';
      statusEl.textContent = '● Connection failed';
      Toast.show('Cannot reach AI backend. Is Stable Diffusion / ComfyUI running?', 'error');
    }
  }

  // ─── LOADING HELPERS ───
  function showLoading(text, steps = []) {
    document.getElementById('loadingOverlay').classList.remove('hidden');
    document.getElementById('loadingText').textContent = text;
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressStep').textContent = steps[0] || 'Initializing...';
    let i = 0;
    const interval = setInterval(() => {
      i++;
      const pct = Math.min(90, i * (90 / (steps.length || 10)));
      document.getElementById('progressFill').style.width = pct + '%';
      if (steps[i]) document.getElementById('progressStep').textContent = steps[i];
    }, 800);
    return interval;
  }
  function hideLoading(interval) {
    if (interval) clearInterval(interval);
    document.getElementById('progressFill').style.width = '100%';
    setTimeout(() => { document.getElementById('loadingOverlay').classList.add('hidden'); }, 400);
  }

  // ─── DEMO MODE — generates placeholder images ───
  async function demoGenerate(type, params) {
    await new Promise(r => setTimeout(r, 2000));
    // Return a gradient placeholder canvas as base64
    const canvas = document.createElement('canvas');
    canvas.width = params.width || 512;
    canvas.height = params.height || 512;
    const ctx = canvas.getContext('2d');
    const colors = ['#667eea','#764ba2','#f093fb','#4facfe','#00f2fe','#43e97b','#fa709a','#fee140'];
    const c1 = colors[Math.floor(Math.random() * colors.length)];
    const c2 = colors[Math.floor(Math.random() * colors.length)];
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, c1); grad.addColorStop(1, c2);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Add text label
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 18px Syne, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`[${type}] Demo Output`, canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('Connect AI backend for real results', canvas.width / 2, canvas.height / 2 + 15);
    return canvas.toDataURL('image/png');
  }

  // ─── STABLE DIFFUSION API ───
  async function sdTxt2Img(params) {
    const payload = {
      prompt: params.prompt,
      negative_prompt: params.negative || '',
      width: parseInt(params.width) || 512,
      height: parseInt(params.height) || 512,
      steps: parseInt(params.steps) || 20,
      cfg_scale: parseFloat(params.cfg) || 7,
      seed: parseInt(params.seed) || -1,
      sampler_name: 'DPM++ 2M Karras',
    };
    const res = await fetch(baseURL + '/sdapi/v1/txt2img', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('SD API error: ' + res.status);
    const data = await res.json();
    return 'data:image/png;base64,' + data.images[0];
  }

  async function sdImg2Img(params) {
    const initImage = CanvasManager.getCanvasDataURL().split(',')[1];
    const payload = {
      init_images: [initImage],
      prompt: params.prompt,
      negative_prompt: params.negative || 'blurry, ugly',
      denoising_strength: parseFloat(params.denoise) || 0.75,
      steps: 20, cfg_scale: 7, width: 512, height: 512,
    };
    const res = await fetch(baseURL + '/sdapi/v1/img2img', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('SD API error');
    const data = await res.json();
    return 'data:image/png;base64,' + data.images[0];
  }

  async function sdInpaint(params) {
    const initImage = CanvasManager.getCanvasDataURL().split(',')[1];
    const mask = CanvasManager.getMaskDataURL().split(',')[1];
    const payload = {
      init_images: [initImage],
      mask: mask,
      prompt: params.prompt || 'beautiful background',
      negative_prompt: 'ugly, blurry',
      inpainting_fill: 1,
      denoising_strength: 0.85,
      steps: 25, cfg_scale: 7,
    };
    const res = await fetch(baseURL + '/sdapi/v1/img2img', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('SD inpaint API error');
    const data = await res.json();
    return 'data:image/png;base64,' + data.images[0];
  }

  async function sdUpscale(params) {
    const image = CanvasManager.getCanvasDataURL().split(',')[1];
    const payload = {
      resize_mode: 0,
      upscaling_resize: parseInt(params.scale) || 2,
      upscaler_1: params.model || 'ESRGAN_4x',
      image: image,
    };
    const res = await fetch(baseURL + '/sdapi/v1/extra-single-image', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('SD upscale API error');
    const data = await res.json();
    return 'data:image/png;base64,' + data.image;
  }

  // ─── COMFYUI API ───
  async function comfyGenerate(params) {
    // Simple ComfyUI workflow for txt2img
    const workflow = {
      "1": { "inputs": { "text": params.prompt, "clip": ["4", 1] }, "class_type": "CLIPTextEncode" },
      "2": { "inputs": { "text": params.negative || "blurry", "clip": ["4", 1] }, "class_type": "CLIPTextEncode" },
      "3": { "inputs": { "seed": parseInt(params.seed) || Math.floor(Math.random()*999999999), "steps": parseInt(params.steps)||20, "cfg": parseFloat(params.cfg)||7, "sampler_name": "dpmpp_2m", "scheduler": "karras", "denoise": 1, "model": ["4",0], "positive": ["1",0], "negative": ["2",0], "latent_image": ["5",0] }, "class_type": "KSampler" },
      "4": { "inputs": { "ckpt_name": "sd_xl_base_1.0.safetensors" }, "class_type": "CheckpointLoaderSimple" },
      "5": { "inputs": { "width": parseInt(params.width)||512, "height": parseInt(params.height)||512, "batch_size": 1 }, "class_type": "EmptyLatentImage" },
      "6": { "inputs": { "samples": ["3",0], "vae": ["4",2] }, "class_type": "VAEDecode" },
      "7": { "inputs": { "filename_prefix": "pixelmind", "images": ["6",0] }, "class_type": "SaveImage" }
    };
    const res = await fetch(baseURL + '/prompt', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow })
    });
    if (!res.ok) throw new Error('ComfyUI error');
    const data = await res.json();
    // Poll for completion
    const promptId = data.prompt_id;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const histRes = await fetch(baseURL + '/history/' + promptId);
      const hist = await histRes.json();
      if (hist[promptId]) {
        const imgInfo = Object.values(hist[promptId].outputs)[0]?.images?.[0];
        if (imgInfo) {
          const imgRes = await fetch(`${baseURL}/view?filename=${imgInfo.filename}&type=output`);
          const blob = await imgRes.blob();
          return URL.createObjectURL(blob);
        }
      }
    }
    throw new Error('ComfyUI timeout');
  }

  // ─── PUBLIC API ───
  const generate = async (type, params) => {
    const creditCosts = { txt2img: 3, img2img: 4, inpaint: 5, upscale: 3, style: 4 };
    const cost = creditCosts[type] || 3;
    const user = Auth.getUser();
    if (!user) return;
    if (!Auth.deductCredits(cost)) {
      Toast.show('Not enough credits! Upgrade your plan.', 'error'); return;
    }
    document.getElementById('userCredits').textContent = Auth.getUser().credits;

    const steps = {
      txt2img: ['Loading model...','Processing prompt...','Generating latents...','Decoding image...','Finalizing...'],
      img2img: ['Loading image...','Encoding...','Applying style...','Decoding...','Finalizing...'],
      inpaint: ['Loading mask...','Analyzing region...','Inpainting...','Blending...','Finalizing...'],
      upscale: ['Loading image...','Running upscaler...','Enhancing details...','Finalizing...'],
      style: ['Loading style...','Encoding...','Transferring...','Finalizing...'],
    };
    const interval = showLoading(type.charAt(0).toUpperCase() + type.slice(1) + '...', steps[type] || []);

    try {
      let resultURL;
      if (backend === 'demo') {
        resultURL = await demoGenerate(type, params);
      } else if (backend === 'local_sd') {
        if (type === 'txt2img') resultURL = await sdTxt2Img(params);
        else if (type === 'img2img' || type === 'style') resultURL = await sdImg2Img(params);
        else if (type === 'inpaint') resultURL = await sdInpaint(params);
        else if (type === 'upscale') resultURL = await sdUpscale(params);
      } else if (backend === 'comfyui') {
        resultURL = await comfyGenerate(params);
      } else {
        resultURL = await demoGenerate(type, params);
      }

      hideLoading(interval);
      CanvasManager.loadImageFromDataURL(resultURL);
      // Save to gallery
      const u = Auth.getUser();
      if (u) GalleryDB.addItem(u.id, { type, params: { prompt: params.prompt }, thumbnail: resultURL.substring(0, 200) });
      Toast.show('✦ Generated successfully!', 'success');
    } catch (err) {
      hideLoading(interval);
      // Refund credits
      const u = Auth.getUser();
      if (u) { UserDB.updateUser(u.id, { credits: u.credits + cost }); }
      console.error(err);
      Toast.show('AI error: ' + err.message + '. Check backend connection.', 'error');
    }
  };

  // ─── BUTTON WIRING ───
  document.getElementById('generateBtn').addEventListener('click', () => {
    const prompt = document.getElementById('txt2imgPrompt').value.trim();
    if (!prompt) { Toast.show('Enter a prompt first', 'warning'); return; }
    generate('txt2img', {
      prompt, negative: document.getElementById('txt2imgNegative').value,
      steps: document.getElementById('steps').value, cfg: document.getElementById('cfg').value,
      seed: document.getElementById('seed').value,
      width: document.getElementById('genWidth').value, height: document.getElementById('genHeight').value,
    });
  });

  document.getElementById('img2imgBtn').addEventListener('click', () => {
    const prompt = document.getElementById('img2imgPrompt').value.trim();
    if (!prompt) { Toast.show('Enter a prompt first', 'warning'); return; }
    generate('img2img', { prompt, denoise: document.getElementById('denoise').value });
  });

  document.getElementById('inpaintBtn').addEventListener('click', () => {
    generate('inpaint', { prompt: document.getElementById('inpaintPrompt').value });
  });

  document.getElementById('upscaleBtn').addEventListener('click', () => {
    generate('upscale', {
      scale: document.getElementById('upscaleScale').value,
      model: document.getElementById('upscaleModel').value
    });
  });

  document.getElementById('styleTransferBtn').addEventListener('click', () => {
    const prompt = document.getElementById('stylePrompt').value.trim();
    if (!prompt) { Toast.show('Select a style or enter custom', 'warning'); return; }
    generate('style', { prompt, denoise: 0.8 });
  });

  document.querySelectorAll('.style-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('stylePrompt').value = btn.dataset.style;
      document.querySelectorAll('.style-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('denoise').addEventListener('input', (e) => {
    document.getElementById('denoiseVal').textContent = parseFloat(e.target.value).toFixed(2);
  });

  return { generate, testConnection };
})();
