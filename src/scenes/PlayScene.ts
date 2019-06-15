import { PlayerSprite } from "../sprites/player.sprite";
import pages from "../text";

class TestScene extends Phaser.Scene {
  public platforms: Phaser.Physics.Arcade.StaticGroup;
  private player: PlayerSprite;
  private cursors: Phaser.Input.Keyboard.CursorKeys;

  constructor() {
    super({
      key: "TestScene",
    });
  }

  public preload() {
    this.load.image("player", "/assets/sprites/lobo_quieto1.png");
    this.load.image("floor", `/assets/px.png`);
  }

  public create() {
    this.platforms = this.physics.add.staticGroup();

    let lineY = 100;

    pages[0].forEach((line) => {
      const currentLine = line.split(" ");
      let wordX = 100;

      currentLine.forEach((word) => {
        const currentWord = this.add.text(wordX, lineY, word, {
          fontFamily: "Amatic SC",
          fontSize: 100,
          color: "#333",
        });

        const bounds = currentWord.getBounds();

        this.platforms
          .create(bounds.x + 5, bounds.y + 10 + 10, "floor")
          .setOrigin(0, 0)
          .setScale(bounds.width - 10, bounds.height - 40)
          .refreshBody();

        wordX += bounds.width + 50;
      });
      lineY += 150;
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.platforms.toggleVisible();

    this.player = new PlayerSprite(this, 100, 10, "player");
    this.physics.add.collider(this.player, this.platforms);

    this.cameras.main.setBounds(0, 0, 2000, 2000);
    this.cameras.main.startFollow(this.player, false);
  }

  public update(time: number, delta: number) {
    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    }
    if (this.cursors.right.isDown) {
      this.player.moveRight();
    }
    if (this.cursors.space.isDown && this.player.canJump()) {
      this.player.jump();
    }
  }
}

export default TestScene;
