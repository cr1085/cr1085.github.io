// ============================================================
// BOOT SCENE
// Initializes services, shows loading screen
// ============================================================

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(0, 0, width, height, 0x0A0A1A).setOrigin(0);

    // Animated stars
    for (let i = 0; i < 80; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xFFFFFF,
        Phaser.Math.FloatBetween(0.2, 0.9)
      );
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }

    // Logo
    const title = this.add.text(width / 2, height / 2 - 80, '🎲 CHAOS TILES', {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '56px',
      color: '#FFD700',
      stroke: '#FF6B00',
      strokeThickness: 4,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 8, fill: true }
    }).setOrigin(0.5).setAlpha(0);

    const subtitle = this.add.text(width / 2, height / 2 - 10, 'WHERE CHAOS IS THE ONLY RULE', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '18px',
      color: '#FF9FF3',
      letterSpacing: 4
    }).setOrigin(0.5).setAlpha(0);

    const loadText = this.add.text(width / 2, height / 2 + 80, 'Initializing chaos...', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '16px',
      color: '#AAAAAA'
    }).setOrigin(0.5).setAlpha(0);

    // Progress bar
    const barBg = this.add.rectangle(width / 2, height / 2 + 120, 300, 8, 0x333344).setOrigin(0.5);
    const bar = this.add.rectangle(width / 2 - 150, height / 2 + 120, 0, 8, 0xFF6B00).setOrigin(0, 0.5);

    this.tweens.add({ targets: [title, subtitle, loadText], alpha: 1, duration: 800, ease: 'Power2' });

    // Simulate loading & initialize
    let progress = 0;
    const loadSteps = [
      { text: 'Summoning the chaos gods...', progress: 20 },
      { text: 'Shuffling the cursed deck...', progress: 40 },
      { text: 'Connecting to the void...', progress: 60 },
      { text: 'Placing the traps...', progress: 80 },
      { text: 'Ready to rumble!', progress: 100 }
    ];

    let stepIndex = 0;
    const doStep = () => {
      if (stepIndex >= loadSteps.length) {
        this.time.delayedCall(400, () => this.scene.start('MenuScene'));
        return;
      }
      const step = loadSteps[stepIndex++];
      loadText.setText(step.text);

      this.tweens.add({
        targets: bar,
        width: 300 * (step.progress / 100),
        duration: 400,
        ease: 'Power2',
        onComplete: () => this.time.delayedCall(300, doStep)
      });
    };

     // Initialize Supabase in parallel
     this.time.delayedCall(600, async () => {
       window.SupabaseService.init();
       await window.SupabaseService.signInAnonymous();
       if (window.SupabaseService.initialized) {
         await window.SupabaseService.seedQuestions();
       }
       doStep();
     });
  }
}

window.BootScene = BootScene;
