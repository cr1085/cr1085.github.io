// ============================================================
// MENU SCENE
// Main menu with authentication and game start
// ============================================================

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this.playerName = 'Player';
    this.userProfile = null;
  }

  create() {
    const { width, height } = this.scale;
    this._buildBackground(width, height);
    this._buildLogo(width, height);
    this._buildMenu(width, height);
    this._loadProfile();
  }

  _buildBackground(width, height) {
    // Gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0A0A1A, 0x0A0A1A, 0x1A0A2E, 0x1A0A2E, 1);
    bg.fillRect(0, 0, width, height);

    // Floating tiles decoration
    const tileColors = [0xFF6B6B, 0xFFD700, 0x9B59B6, 0x27AE60, 0x3498DB, 0xE67E22];
    for (let i = 0; i < 12; i++) {
      const size = Phaser.Math.Between(30, 60);
      const tile = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        size, size,
        tileColors[i % tileColors.length],
        0.15
      ).setRotation(Phaser.Math.FloatBetween(0, Math.PI));
      this.tweens.add({
        targets: tile,
        y: tile.y - Phaser.Math.Between(100, 200),
        rotation: tile.rotation + Math.PI,
        alpha: 0,
        duration: Phaser.Math.Between(4000, 8000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 4000),
        onRepeat: () => {
          tile.y = height + 50;
          tile.x = Phaser.Math.Between(0, width);
          tile.alpha = 0.15;
        }
      });
    }
  }

  _buildLogo(width, height) {
    // Main logo
    this.add.text(width / 2, height * 0.18, '🎲', {
      fontSize: '72px'
    }).setOrigin(0.5);

    const title = this.add.text(width / 2, height * 0.29, 'CHAOS TILES', {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '64px',
      color: '#FFD700',
      stroke: '#FF6B00',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(width / 2, height * 0.38, 'Snakes & Ladders... but UNHINGED', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '18px',
      color: '#FF9FF3',
      letterSpacing: 2
    }).setOrigin(0.5);
  }

  _buildMenu(width, height) {
    // Player name display
    this.nameText = this.add.text(width / 2, height * 0.50, '👤 Player', {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '22px',
      color: '#FFFFFF',
      backgroundColor: '#1A1A2E',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.nameText.on('pointerdown', () => this._showNamePrompt(width, height));
    this.nameText.on('pointerover', () => this.nameText.setColor('#FFD700'));
    this.nameText.on('pointerout', () => this.nameText.setColor('#FFFFFF'));

    // XP bar
    this.xpText = this.add.text(width / 2, height * 0.56, '⭐ XP: 0', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '16px',
      color: '#AAAAAA'
    }).setOrigin(0.5);

    // Play button
    this._makeButton(width / 2, height * 0.65, '▶  PLAY NOW', 0xFF6B00, 0xFFAA00, () => {
      AudioManager.playButton();
      this.scene.start('GameScene', { playerName: this.playerName, profile: this.userProfile });
    });

    // How to play button
    this._makeButton(width / 2, height * 0.75, '📖  HOW TO PLAY', 0x2C3E50, 0x34495E, () => {
      AudioManager.playButton();
      this._showHowToPlay(width, height);
    });

    // Version
    this.add.text(width / 2, height - 20, 'v1.0.0 — Chaos Edition', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '12px',
      color: '#444466'
    }).setOrigin(0.5);
  }

  _makeButton(x, y, label, colorA, colorB, callback) {
    const btn = this.add.rectangle(x, y, 260, 52, colorA, 1)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, colorB);

    const txt = this.add.text(x, y, label, {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '22px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    btn.on('pointerover', () => { btn.setFillStyle(colorB); this.tweens.add({ targets: [btn, txt], scaleX: 1.04, scaleY: 1.04, duration: 100 }); });
    btn.on('pointerout', () => { btn.setFillStyle(colorA); this.tweens.add({ targets: [btn, txt], scaleX: 1, scaleY: 1, duration: 100 }); });
    btn.on('pointerdown', callback);

    return { btn, txt };
  }

  async _loadProfile() {
    if (SupabaseService.currentUser) {
      this.userProfile = await SupabaseService.getUserProfile(SupabaseService.currentUser.id);
      if (this.userProfile) {
        this.playerName = this.userProfile.username || 'Player';
        this.nameText.setText(`👤 ${this.playerName}`);
        this.xpText.setText(`⭐ XP: ${this.userProfile.xp || 0}  |  🏆 Wins: ${this.userProfile.wins || 0}`);
      }
    }
  }

  _showNamePrompt(width, height) {
    // Simple DOM prompt
    const name = window.prompt('Enter your name:', this.playerName);
    if (name && name.trim().length > 0) {
      this.playerName = name.trim().slice(0, 16);
      this.nameText.setText(`👤 ${this.playerName}`);
      if (SupabaseService.currentUser && SupabaseService.initialized) {
        SupabaseService.createUserProfile(SupabaseService.currentUser.id, this.playerName);
      }
    }
  }

  _showHowToPlay(width, height) {
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0).setDepth(10);
    const panel = this.add.rectangle(width / 2, height / 2, 520, 420, 0x1A1A2E, 1).setDepth(11).setStrokeStyle(2, 0xFFD700);

    const lines = [
      ['🎲 CHAOS TILES — HOW TO PLAY', '#FFD700', 22],
      ['', '', 0],
      ['• Roll the dice and move your token', '#FFFFFF', 16],
      ['• Land on tiles to trigger events:', '#AAAAAA', 15],
      ['  ❓ Riddle — Answer correctly to advance!', '#9B59B6', 15],
      ['  ⚖️ Prefer — Choose between two fates!', '#E67E22', 15],
      ['  ⚡ Power — Get a special ability!', '#27AE60', 15],
      ['  💀 Trap — Suffer the consequences!', '#E74C3C', 15],
      ['  🪜 Ladder — Jump ahead!', '#16A085', 15],
      ['  🐍 Snake — Fall back!', '#D35400', 15],
      ['', '', 0],
      ['• Beat the AI to tile 30 to WIN', '#FFFFFF', 16],
      ['• Earn XP for every event you survive', '#FFD700', 15]
    ];

    let yPos = height / 2 - 180;
    lines.forEach(([text, color, size]) => {
      if (size > 0) {
        this.add.text(width / 2, yPos, text, {
          fontFamily: size >= 20 ? '"Fredoka One", cursive' : '"Nunito", sans-serif',
          fontSize: `${size}px`,
          color
        }).setOrigin(0.5).setDepth(12);
      }
      yPos += size > 0 ? size + 8 : 12;
    });

    const closeBtn = this.add.text(width / 2, height / 2 + 175, '✕  CLOSE', {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '20px',
      color: '#FF6B6B',
      backgroundColor: '#2C0A0A',
      padding: { x: 24, y: 10 }
    }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      [overlay, panel, closeBtn].forEach(o => o.destroy());
      this.children.list
        .filter(c => c.depth === 12)
        .forEach(c => c.destroy());
    });
  }
}

window.MenuScene = MenuScene;
