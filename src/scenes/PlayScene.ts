import { PlayerSprite } from "../sprites/player.sprite";
import pages from "../text";

const PLAYER_INITIAL_X = 415;
const PLAYER_INITIAL_Y = 100;

class TestScene extends Phaser.Scene {
  public platforms: Phaser.Physics.Arcade.StaticGroup;
  public respawnPlatforms: Phaser.Physics.Arcade.StaticGroup;
  private player: PlayerSprite;
  private cursors: Phaser.Input.Keyboard.CursorKeys;
  private pageBorder: Phaser.Physics.Arcade.Image;

  constructor() {
    super({
      key: "TestScene",
    });
  }

  public preload() {
    this.load.image("player", "/assets/sprites/lobo_quieto1.png");
    this.load.image("floor", `/assets/px.png`);
    this.load.image("pageLimit", `/assets/pagelimit.png`);
  }

  public create() {
    this.platforms = this.physics.add.staticGroup();
    this.respawnPlatforms = this.physics.add.staticGroup();

    let pageOffset = 0;

    pages.forEach((page) => {
      let lineY = 100;
      page.forEach((line) => {
        const currentLine = line.split(" ");
        let wordX = 100;

        currentLine.forEach((word) => {
          const currentWord = this.add.text(wordX + pageOffset, lineY, word, {
            fontFamily: "Amatic SC",
            fontSize: 100,
            color: "#333",
          });

          const bounds = currentWord.getBounds();

          if (word === "wolf") {
            const platform = this.respawnPlatforms
              .create(bounds.x + 5, bounds.y + 10 + 10, "floor")
              .setOrigin(0, 0)
              .setScale(bounds.width - 10, bounds.height - 40)
              .refreshBody();

            platform.currentWord = currentWord;
          } else {
            this.platforms
              .create(bounds.x + 5, bounds.y + 10 + 10, "floor")
              .setOrigin(0, 0)
              .setScale(bounds.width - 10, bounds.height - 40)
              .refreshBody();
          }

          wordX += bounds.width + 50;
        });
        lineY += 150;
      });
      pageOffset += 1800;
    });

    this.platforms.toggleVisible();
    this.respawnPlatforms.toggleVisible();

    this.cursors = this.input.keyboard.createCursorKeys();

    this.pageBorder = this.physics.add
      .staticImage(1650, 10, "pageLimit")
      .setScale(1, 2)
      .refreshBody();

    this.player = new PlayerSprite(
      this,
      PLAYER_INITIAL_X,
      PLAYER_INITIAL_Y,
      "player",
    );

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.pageBorder);
    this.physics.add.collider(
      this.player,
      this.respawnPlatforms,
      (_, wolfPlatform: Phaser.Physics.Arcade.Sprite) => {
        const { top } = wolfPlatform.body;
        const { x } = wolfPlatform.getCenter();
        this.player.setRespawnPosition(x, top - this.player.height / 2);
        ((wolfPlatform as any).currentWord as Phaser.GameObjects.Text).setColor(
          "#f00",
        );
      },
    );

    this.cameras.main.setBounds(0, 0, 2000, 3000);
    this.cameras.main.startFollow(this.player, false);
  }

  public update(time: number, delta: number) {
    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.player.moveRight();
    } else {
      this.player.stop();
    }
    if (this.cursors.space.isDown && this.player.canJump()) {
      this.player.jump();
    }
    if (this.player.isOutsideCamera(this.cameras.main)) {
      this.player.respawn();
    }
  }
}

export default TestScene;
