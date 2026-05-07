// ============================================================
// GAME.JS — Phaser configuration & entry point
// ============================================================

window.addEventListener('load', () => {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#0A0A1A',
    parent: 'game-container',
    scene: [BootScene, MenuScene, GameScene, UIScene, GameOverScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      min: { width: 360, height: 540 },
      max: { width: 1200, height: 900 }
    },
    dom: {
      createContainer: false
    },
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    }
  };

  window.game = new Phaser.Game(config);
});
