// Creates placeholder art in code so the game runs with no image files.
// Swap these for real sprites later by loading images in preload().
class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const g = this.add.graphics();

    // Player: 32x32 rounded square
    g.fillStyle(0x4fc3f7).fillRoundedRect(0, 0, 32, 32, 6);
    g.generateTexture('player', 32, 32);
    g.clear();

    // Coin: 16x16 circle
    g.fillStyle(0xffd54f).fillCircle(8, 8, 8);
    g.generateTexture('coin', 16, 16);
    g.clear();

    // Enemy: 28x28 square
    g.fillStyle(0xef5350).fillRect(0, 0, 28, 28);
    g.generateTexture('enemy', 28, 28);
    g.destroy();

    this.scene.start('Title');
  }
}
