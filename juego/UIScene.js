// ============================================================
// UI SCENE
// Overlays: riddle modal, prefer modal, powers panel
// Runs in parallel with GameScene
// ============================================================

class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const { width, height } = this.scale;
    this.W = width;
    this.H = height;

    // Listen for events from GameScene
    this.gameScene.events.on('showRiddle', this._showRiddleModal, this);
    this.gameScene.events.on('showPrefer', this._showPreferModal, this);
    this.gameScene.events.on('powersUpdated', this._updatePowersPanel, this);

    this._buildPowersPanel(width, height);
  }

  // ── Riddle Modal ──────────────────────────────────────────

  _showRiddleModal({ riddle, onAnswer }) {
    const { W, H } = this;
    const container = this._createOverlay();

    // Panel
    const panel = this.add.rectangle(W / 2, H / 2, 460, 340, 0x1A0A2E, 1)
      .setStrokeStyle(3, 0x9B59B6)
      .setDepth(101);

    // Title
    this.add.text(W / 2, H / 2 - 145, '❓ RIDDLE CHALLENGE', {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '22px',
      color: '#9B59B6'
    }).setOrigin(0.5).setDepth(102);

    // Question
    this.add.text(W / 2, H / 2 - 100, riddle.question, {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '16px',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: 400 }
    }).setOrigin(0.5).setDepth(102);

    // Answer buttons
    const options = riddle.options;
    const cols = 2;
    const btnW = 190, btnH = 44;
    const startY = H / 2 - 20;

    options.forEach((opt, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = W / 2 + (col === 0 ? -100 : 100);
      const y = startY + row * 55;

      const btn = this.add.rectangle(x, y, btnW, btnH, 0x2D0A4E, 1)
        .setStrokeStyle(2, 0x9B59B6)
        .setInteractive({ useHandCursor: true })
        .setDepth(102);

      const txt = this.add.text(x, y, opt, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: '14px',
        color: '#FFFFFF',
        align: 'center',
        wordWrap: { width: 170 }
      }).setOrigin(0.5).setDepth(103);

      btn.on('pointerover', () => { btn.setFillStyle(0x4A1A7E); });
      btn.on('pointerout', () => { btn.setFillStyle(0x2D0A4E); });
      btn.on('pointerdown', () => {
        AudioManager.playButton();
        const correct = opt === riddle.answer;

        // Flash feedback
        btn.setFillStyle(correct ? 0x1A5C2A : 0x5C1A1A);
        btn.setStrokeStyle(3, correct ? 0x2ECC71 : 0xE74C3C);

        if (correct) {
          this.add.text(W / 2, H / 2 + 115, '✅ CORRECT! +XP', {
            fontFamily: '"Fredoka One", cursive', fontSize: '22px', color: '#2ECC71'
          }).setOrigin(0.5).setDepth(103);
        } else {
          this.add.text(W / 2, H / 2 + 115, `❌ WRONG! Answer: ${riddle.answer}`, {
            fontFamily: '"Fredoka One", cursive', fontSize: '18px', color: '#E74C3C',
            wordWrap: { width: 400 }
          }).setOrigin(0.5).setDepth(103);
        }

        this.time.delayedCall(1400, () => {
          container.forEach(o => o.destroy());
          this.children.list.filter(c => c.depth >= 101).forEach(c => c.destroy());
          onAnswer(correct);
        });
      });
    });

    // Reward/penalty info
    this.add.text(W / 2, H / 2 + 135, `✅ Correct: +${riddle.reward} tiles  ❌ Wrong: ${riddle.penalty} tiles`, {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '13px',
      color: '#888888'
    }).setOrigin(0.5).setDepth(102);

    this._popIn(panel);
  }

  // ── Prefer Modal ──────────────────────────────────────────

  _showPreferModal({ question, onChoice }) {
    const { W, H } = this;
    const container = this._createOverlay();

    const panel = this.add.rectangle(W / 2, H / 2, 480, 280, 0x1A0A10, 1)
      .setStrokeStyle(3, 0xE67E22)
      .setDepth(101);

    this.add.text(W / 2, H / 2 - 115, '⚖️ WHAT WOULD YOU PREFER?', {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '20px',
      color: '#E67E22'
    }).setOrigin(0.5).setDepth(102);

    this.add.text(W / 2, H / 2 - 75, question.question, {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '16px',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: 420 }
    }).setOrigin(0.5).setDepth(102);

    const options = question.options;
    options.forEach((opt, i) => {
      const y = H / 2 - 20 + i * 60;
      const colors = [0x7E3A00, 0x003A7E];
      const borderColors = [0xE67E22, 0x3498DB];

      const btn = this.add.rectangle(W / 2, y, 420, 48, colors[i % 2], 1)
        .setStrokeStyle(2, borderColors[i % 2])
        .setInteractive({ useHandCursor: true })
        .setDepth(102);

      const txt = this.add.text(W / 2, y, opt.text, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: '15px',
        color: '#FFFFFF',
        align: 'center',
        wordWrap: { width: 400 }
      }).setOrigin(0.5).setDepth(103);

      btn.on('pointerover', () => { btn.setAlpha(0.8); this.tweens.add({ targets: [btn, txt], scaleX: 1.02, scaleY: 1.02, duration: 80 }); });
      btn.on('pointerout', () => { btn.setAlpha(1); this.tweens.add({ targets: [btn, txt], scaleX: 1, scaleY: 1, duration: 80 }); });
      btn.on('pointerdown', () => {
        AudioManager.playButton();
        container.forEach(o => o.destroy());
        this.children.list.filter(c => c.depth >= 101).forEach(c => c.destroy());
        onChoice(i);
      });
    });

    this._popIn(panel);
  }

  // ── Powers Panel ──────────────────────────────────────────

  _buildPowersPanel(width, height) {
    this.powersBg = this.add.rectangle(80, height - 68, 130, 60, 0x1A1A2E, 0.9)
      .setStrokeStyle(2, 0x27AE60)
      .setDepth(10);

    this.powerTitle = this.add.text(80, height - 85, '⚡ POWERS', {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '12px',
      color: '#2ECC71'
    }).setOrigin(0.5).setDepth(11);

    this.powerButtons = [];
    this._updatePowersPanel([]);
  }

  _updatePowersPanel(powers) {
    // Clear old buttons
    this.powerButtons.forEach(({ btn, txt }) => { btn.destroy(); txt.destroy(); });
    this.powerButtons = [];

    const { H } = this;
    const startX = 22;
    const y = H - 68;

    powers.slice(0, 4).forEach((power, i) => {
      const x = startX + i * 36;
      const btn = this.add.rectangle(x, y, 30, 30, power.color, 0.9)
        .setStrokeStyle(2, 0xFFFFFF)
        .setInteractive({ useHandCursor: true })
        .setDepth(11);

      const txt = this.add.text(x, y, power.icon, {
        fontSize: '16px'
      }).setOrigin(0.5).setDepth(12);

      btn.on('pointerover', () => {
        this._showPowerTooltip(x, y, power);
        btn.setAlpha(0.7);
      });
      btn.on('pointerout', () => {
        this._hidePowerTooltip();
        btn.setAlpha(1);
      });
      btn.on('pointerdown', () => {
        this._hidePowerTooltip();
        this.gameScene.usePower(i);
      });

      this.powerButtons.push({ btn, txt });
    });

    if (powers.length === 0) {
      const emptyTxt = this.add.text(80, H - 68, 'No powers', {
        fontFamily: '"Nunito", sans-serif',
        fontSize: '12px',
        color: '#555577'
      }).setOrigin(0.5).setDepth(11);
      this.powerButtons.push({ btn: emptyTxt, txt: emptyTxt });
    }
  }

  _showPowerTooltip(x, y, power) {
    this._hidePowerTooltip();
    const { H } = this;
    this.tooltip = this.add.rectangle(x + 80, y - 20, 140, 40, 0x000000, 0.9)
      .setStrokeStyle(1, power.color).setDepth(20);
    this.tooltipTxt = this.add.text(x + 80, y - 20, `${power.name}\n${power.description}`, {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '10px',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: 130 }
    }).setOrigin(0.5).setDepth(21);
  }

  _hidePowerTooltip() {
    if (this.tooltip) { this.tooltip.destroy(); this.tooltip = null; }
    if (this.tooltipTxt) { this.tooltipTxt.destroy(); this.tooltipTxt = null; }
  }

  // ── Helpers ───────────────────────────────────────────────

  _createOverlay() {
    const overlay = this.add.rectangle(0, 0, this.W, this.H, 0x000000, 0.75)
      .setOrigin(0).setDepth(100).setInteractive();
    return [overlay];
  }

  _popIn(target) {
    target.setScale(0.1);
    this.tweens.add({
      targets: target,
      scaleX: 1, scaleY: 1,
      duration: 250,
      ease: 'Back.easeOut'
    });
  }
}

window.UIScene = UIScene;
