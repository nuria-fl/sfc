import { FireSprite } from "../sprites/fire.sprite";
import { PlayerSprite } from "../sprites/player.sprite";
import pages from "../text";

const PLAYER_INITIAL_X = 270;
const PLAYER_INITIAL_Y = 50;

class TestScene extends Phaser.Scene {
  public platforms: Phaser.Physics.Arcade.StaticGroup;
  public respawnPlatforms: Phaser.Physics.Arcade.StaticGroup;
  private player: PlayerSprite;
  private fire: FireSprite;
  private cursors: Phaser.Input.Keyboard.CursorKeys;
  private pageBorder: Phaser.Physics.Arcade.Image;

  constructor() {
    super({
      key: "TestScene"
    });
  }

  public preload() {
    this.load.spritesheet("player", "/assets/sprites/wolf_spritesheet.png", {
      frameWidth: 50,
      frameHeight: 69,
    });
    this.load.spritesheet("fire", "/assets/sprites/fire_spritesheet.png", {
      frameWidth: 50,
      frameHeight: 60,
    });
    this.load.image("floor", `/assets/px.png`);
    this.load.image("pageLimit", `/assets/pagelimit.png`);
  }

  public create() {
    this.platforms = this.physics.add.staticGroup();
    this.respawnPlatforms = this.physics.add.staticGroup();

    let pageOffset = 0;

    pages.forEach(page => {
      let lineY = 100;
      page.forEach(line => {
        const currentLine = line.split(" ");
        let wordX = 100;

        currentLine.forEach(word => {
          const currentWord = this.add.text(wordX + pageOffset, lineY, word, {
            fontFamily: "Amatic SC",
            fontSize: 100,
            color: "#333"
          });

          const bounds = currentWord.getBounds();

          let platform;

          if (word === "wolf") {
            platform = this.respawnPlatforms
              .create(bounds.x + 5, bounds.y + 10 + 10, "floor")
              .setOrigin(0, 0)
              .setScale(bounds.width - 10, bounds.height - 40)
              .refreshBody();

            platform.currentWord = currentWord;
          } else {
            platform = this.platforms
              .create(bounds.x + 5, bounds.y + 10 + 10, "floor")
              .setOrigin(0, 0)
              .setScale(bounds.width - 10, bounds.height - 40)
              .refreshBody();
          }
          platform.body.checkCollision.down = false;
          platform.body.checkCollision.left = false;
          platform.body.checkCollision.right = false;

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
      "player"
    );

    this.fire = new FireSprite(this, 100, 80, "fire");
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
          "#f00"
        );
      }
    );

    this.cameras.main.setBounds(0, 0, 2000, 3000);
    this.cameras.main.startFollow(this.player, false);

    this.input.keyboard.on("keydown", ({ code }) => {
      if (code === "Space") {
        this.player.jump();
      }
    });
  }

  public update(time: number, delta: number) {
    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.player.moveRight();
    } else {
      this.player.stop();
    }
    if (this.player.body.touching.down) {
      this.player.enableJump();
    }
    if (this.player.isOutsideCamera(this.cameras.main)) {
      this.player.respawn();
    }
  }
}

export default TestScene;
