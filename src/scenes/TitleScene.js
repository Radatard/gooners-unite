class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 60, 'GOONERS UNITE', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '56px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 20, 'Press SPACE or click to start', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#bbbbbb',
    }).setOrigin(0.5);

    const start = () => this.scene.start('Game');
    this.input.keyboard.once('keydown-SPACE', start);
    this.input.once('pointerdown', start);
  }
}
