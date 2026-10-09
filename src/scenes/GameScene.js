// Starter gameplay: move with arrows/WASD, grab coins, avoid enemies.
// Each coin spawns another enemy, so it gets harder over time.
class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const { width, height } = this.scale;
    this.score = 0;
    this.speed = 220;

    this.physics.world.setBounds(0, 0, width, height);

    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    this.coin = this.physics.add.sprite(0, 0, 'coin');
    this.placeCoin();

    this.enemies = this.physics.add.group();
    this.spawnEnemy();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
    });

    this.physics.add.overlap(this.player, this.coin, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);
  }

  update() {
    if (!this.player.active) return;

    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    const vx = (right ? 1 : 0) - (left ? 1 : 0);
    const vy = (down ? 1 : 0) - (up ? 1 : 0);
    const v = new Phaser.Math.Vector2(vx, vy).normalize().scale(this.speed);
    this.player.setVelocity(v.x, v.y);
  }

  placeCoin() {
    const { width, height } = this.scale;
    this.coin.setPosition(
      Phaser.Math.Between(40, width - 40),
      Phaser.Math.Between(40, height - 40),
    );
  }

  spawnEnemy() {
    const { width, height } = this.scale;
    // Spawn in a corner away from the player
    const x = this.player.x < width / 2 ? width - 40 : 40;
    const y = this.player.y < height / 2 ? height - 40 : 40;
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    enemy.setVelocity(Math.cos(angle) * 160, Math.sin(angle) * 160);
  }

  collectCoin() {
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);
    this.placeCoin();
    this.spawnEnemy();
  }

  gameOver() {
    if (!this.player.active) return;
    this.physics.pause();
    this.player.setTint(0x666666);
    this.player.active = false;

    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, 'GAME OVER\nScore: ' + this.score + '\n\nSPACE to retry', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '36px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
  }
}
