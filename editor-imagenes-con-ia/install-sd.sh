#!/bin/bash
# ═══════════════════════════════════════════════════════
# Stable Diffusion WebUI + Models — Auto Installer
# Tested on Ubuntu 22.04 / macOS 13+
# ═══════════════════════════════════════════════════════
set -e
echo "🎨 Installing Stable Diffusion WebUI..."

# ── SYSTEM DEPS ──
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  sudo apt update && sudo apt install -y git python3 python3-venv wget
fi

# ── CLONE SD WEBUI ──
if [ ! -d "stable-diffusion-webui" ]; then
  git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
  echo "✅ Cloned SD WebUI"
fi

cd stable-diffusion-webui

# ── DOWNLOAD BASE MODEL ──
echo "📦 Downloading SD 1.5 base model..."
MODEL_DIR="models/Stable-diffusion"
mkdir -p "$MODEL_DIR"

# SD 1.5 (free from HuggingFace)
if [ ! -f "$MODEL_DIR/v1-5-pruned-emaonly.safetensors" ]; then
  wget -c "https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors" \
    -O "$MODEL_DIR/v1-5-pruned-emaonly.safetensors"
  echo "✅ SD 1.5 downloaded"
fi

# ── DOWNLOAD UPSCALERS ──
echo "📦 Downloading ESRGAN upscalers..."
UPSCALE_DIR="models/ESRGAN"
mkdir -p "$UPSCALE_DIR"
if [ ! -f "$UPSCALE_DIR/ESRGAN_4x.pth" ]; then
  wget -c "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth" \
    -O "$UPSCALE_DIR/RealESRGAN_x4plus.pth"
fi

echo "🚀 Starting Stable Diffusion WebUI (API mode)..."
echo "   This will take a few minutes on first run..."
echo "   Once started, open: http://127.0.0.1:7860"
echo ""

# Start with API enabled (required for PixelMind)
./webui.sh --api --listen --cors-allow-origins="*" --no-download-sd-model
