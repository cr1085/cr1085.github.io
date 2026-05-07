// ============================================================
// GAME OVER SCENE
// ============================================================

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.winner = data.winner;
    this.isHuman = data.isHuman;
    this.xpEarned = data.xpEarned || 0;
    this.playerName = data.playerName || 'Player';
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      this.isHuman ? 0x0A1A0A : 0x1A0A0A,
      this.isHuman ? 0x0A1A0A : 0x1A0A0A,
      this.isHuman ? 0x0A2E0A : 0x2E0A0A,
      this.isHuman ? 0x0A2E0A : 0x2E0A0A,
      1
    );
    bg.fillRect(0, 0, width, height);

    // Particles
    for (let i = 0; i < 30; i++) {
      const colors = this.isHuman
        ? [0xFFD700, 0x2ECC71, 0xFF6B6B, 0x9B59B6]
        : [0x444444, 0x666666, 0x888888];
      const circle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(3, 10),
        colors[Phaser.Math.Between(0, colors.length - 1)],
        0.6
      );
      this.tweens.add({
        targets: circle,
        y: circle.y - Phaser.Math.Between(80, 200),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        onRepeat: () => {
          circle.y = height + 20;
          circle.x = Phaser.Math.Between(0, width);
          circle.alpha = 0.6;
        }
      });
    }

    // Result emoji
    const resultEmoji = this.isHuman ? '🏆' : '💀';
    const resultText = this.isHuman ? 'YOU WIN!' : 'YOU LOSE!';
    const resultColor = this.isHuman ? '#FFD700' : '#E74C3C';

    this.add.text(width / 2, height * 0.2, resultEmoji, {
      fontSize: '80px'
    }).setOrigin(0.5).setAlpha(0);

    const bigText = this.add.text(width / 2, height * 0.35, resultText, {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '72px',
      color: resultColor,
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);

    const winnerText = this.add.text(width / 2, height * 0.48, `Winner: ${this.winner}`, {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5).setAlpha(0);

    const xpText = this.add.text(width / 2, height * 0.57, `⭐ XP Earned: ${this.xpEarned}`, {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '22px',
      color: '#FFD700'
    }).setOrigin(0.5).setAlpha(0);

    // Animate in
    this.tweens.add({
      targets: [this.children.list[this.children.list.length - 4], bigText, winnerText, xpText],
      alpha: 1,
      y: (target) => target.y - 10,
      duration: 700,
      delay: (target, index) => index * 200,
      ease: 'Power2'
    });

    if (this.isHuman) {
      this._buildFireworks(width, height);
    }

    // Buttons
    this.time.delayedCall(1200, () => {
      this._makeButton(width / 2 - 100, height * 0.72, '🔄 PLAY AGAIN', 0xFF6B00, () => {
        AudioManager.playButton();
        this.scene.start('GameScene', { playerName: this.playerName, profile: null });
      });

      this._makeButton(width / 2 + 100, height * 0.72, '🏠 MENU', 0x2C3E50, () => {
        AudioManager.playButton();
        this.scene.start('MenuScene');
      });
    });

    if (this.isHuman) {
      AudioManager.playWin();
    } else {
      AudioManager.playLose();
    }
  }

  _makeButton(x, y, label, color, callback) {
    const btn = this.add.rectangle(x, y, 170, 50, color, 1)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xFFFFFF)
      .setDepth(10);

    const txt = this.add.text(x, y, label, {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(11);

    btn.on('pointerover', () => { btn.setAlpha(0.8); });
    btn.on('pointerout', () => { btn.setAlpha(1); });
    btn.on('pointerdown', callback);
  }

  _buildFireworks(width, height) {
    const firework = (x, y) => {
      for (let i = 0; i < 20; i++) {
        const colors = [0xFF6B6B, 0xFFD700, 0x2ECC71, 0x9B59B6, 0x3498DB];
        const dot = this.add.circle(x, y, Phaser.Math.Between(3, 7),
          colors[Phaser.Math.Between(0, colors.length - 1)]);
        const angle = (i / 20) * Math.PI * 2;
        const dist = Phaser.Math.Between(60, 160);
        this.tweens.add({
          targets: dot,
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist,
          alpha: 0,
          scaleX: 0.2,
          scaleY: 0.2,
          duration: Phaser.Math.Between(600, 1200),
          ease: 'Power2',
          onComplete: () => dot.destroy()
        });
      }
    };

    const positions = [
      [width * 0.2, height * 0.3],
      [width * 0.8, height * 0.25],
      [width * 0.5, height * 0.15],
      [width * 0.15, height * 0.65],
      [width * 0.85, height * 0.6],
    ];

    positions.forEach(([x, y], i) => {
      this.time.delayedCall(i * 400, () => firework(x, y));
    });

    this.time.delayedCall(3000, () => {
      positions.forEach(([x, y], i) => {
        this.time.delayedCall(i * 300, () => firework(x, y));
      });
    });
  }
}

window.GameOverScene = GameOverScene;
