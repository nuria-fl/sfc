import { FireSprite } from "../sprites/fire.sprite";
import { PlayerSprite } from "../sprites/player.sprite";
import pages from "../text";

const PLAYER_INITIAL_X = 2050;
const PLAYER_INITIAL_Y = 600;
const PAGE_OFFSET = 1900;
const INITIAL_X = 1985;
const INITIAL_Y = 1240;
const LINE_HEIGHT = 175;
const WORD_SPACE = 50;

class TestScene extends Phaser.Scene {
  public platforms: Phaser.Physics.Arcade.StaticGroup;
  public respawnPlatforms: Phaser.Physics.Arcade.StaticGroup;
  private climbingPlatforms: Phaser.Physics.Arcade.StaticGroup;
  private ladder: Phaser.Physics.Arcade.Image;
  private player: PlayerSprite;
  private fire: FireSprite;
  private cursors: Phaser.Input.Keyboard.CursorKeys;
  private pageBorder: Phaser.Physics.Arcade.Image;
  private isClimbingEnabled = false;

  constructor() {
    super({
      key: "TestScene"
    });
  }

  public preload() {
    this.load.spritesheet([
      {
        key: "player_idle",
        url: "/assets/sprites/wolf_spritesheet.png",
        frameConfig: {
          frameWidth: 50,
          frameHeight: 69,
          startFrame: 0,
          endFrame: 2
        }
      },
      {
        key: "player_jumping",
        url: "/assets/sprites/wolf_spritesheet.png",
        frameConfig: {
          frameWidth: 50,
          frameHeight: 87,
          startFrame: 3,
          endFrame: 4
        }
      },
      {
        key: "player_walking",
        url: "/assets/sprites/wolf_spritesheet.png",
        frameConfig: {
          frameWidth: 50,
          frameHeight: 69,
          startFrame: 5,
          endFrame: 6
        }
      }
    ]);
    this.load.spritesheet("fire", "/assets/sprites/fire_spritesheet.png", {
      frameWidth: 50,
      frameHeight: 60
    });
    this.load.image("floor", `/assets/px.png`);
    this.load.image("pageLimit", `/assets/pagelimit.png`);
    this.load.image("background", "/assets/background.jpg");
    this.load.image("paragraphSeparator", `/assets/paragraph-separator.png`);
    this.load.image("ladder", `/assets/ladder.png`);
  }

  public create() {
    const background = this.add.image(0, 0, "background");
    background.setOrigin(0, 0);
    background.setScale(1.2);

    this.platforms = this.physics.add.staticGroup();
    this.climbingPlatforms = this.physics.add.staticGroup();
    this.respawnPlatforms = this.physics.add.staticGroup();
    this.ladder = this.physics.add
      .staticImage(3500, 4800, "ladder")
      .setOrigin(0)
      .setVisible(false)
      .refreshBody();

    let pageOffset = 0;

    pages.forEach(page => {
      let lineY = INITIAL_Y;
      page.forEach(line => {
        const currentLine = line.split(" ");
        let wordX = INITIAL_X;

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
          platform.wordKey = word;
          platform.body.checkCollision.down = false;
          platform.body.checkCollision.left = false;
          platform.body.checkCollision.right = false;

          wordX += bounds.width + WORD_SPACE;
        });
        lineY += LINE_HEIGHT;
      });
      pageOffset += PAGE_OFFSET;
    });

    this.platforms.toggleVisible();
    this.respawnPlatforms.toggleVisible();

    this.cursors = this.input.keyboard.createCursorKeys();

    this.pageBorder = this.physics.add
      .staticImage(3850, INITIAL_Y, "pageLimit")
      .setOrigin(0)
      .setScale(1, 3)
      .setVisible(false)
      .refreshBody();

    this.player = new PlayerSprite(this, PLAYER_INITIAL_X, PLAYER_INITIAL_Y);

    this.fire = new FireSprite(this, 100, 80, "fire");
    this.physics.add.collider(
      this.player,
      this.platforms,
      (_, platform: Phaser.Physics.Arcade.Sprite) => {
        if ((platform as any).wordKey === "climbing") {
          this.enableClimbing();
        }
      }
    );
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

    this.cameras.main.setBounds(
      0,
      0,
      background.width * 1.2,
      background.height * 1.2
    );
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
    if (this.player.hasStopped()) {
      this.player.play("idle");
    }
    if (this.player.isOutsideCamera(this.cameras.main)) {
      this.player.respawn();
    }

    this.player.enableGravity();
  }

  private enableClimbing() {
    if (!this.isClimbingEnabled) {
      this.player.disableMovement();
      this.cameras.main.stopFollow();
      this.cameras.main.zoomTo(0.3, 1000, "Linear", false, (_, progress) => {
        if (progress === 1) {
          this.cameras.main.pan(3200, 2400);
          const BUILDING_TIME = 2000;
          this.buildClimbingPlatforms();
          this.buildLadder();
          this.cameras.main.shake(BUILDING_TIME - 200);
          setTimeout(() => {
            this.cameras.main.pan(
              this.player.x,
              this.player.y,
              1000,
              "Linear",
              false,
              (_, progress) => {
                if (progress === 1) {
                  this.cameras.main.zoomTo(1);
                  this.cameras.main.startFollow(this.player, false);
                  this.player.enableMovement();
                }
              }
            );
          }, BUILDING_TIME);
        }
      });
      this.isClimbingEnabled = true;
    }
  }

  private buildClimbingPlatforms() {
    const platforms = [
      { x: 2710, y: 2335 },
      { x: 2710, y: 3215 },
      { x: 2710 + PAGE_OFFSET, y: 1635 }
    ];

    platforms.forEach(platform => {
      const currentPlatform = this.climbingPlatforms.create(
        platform.x,
        platform.y,
        "paragraphSeparator"
      );

      currentPlatform.body.checkCollision.down = false;
      currentPlatform.body.checkCollision.left = false;
      currentPlatform.body.checkCollision.right = false;
    });

    this.physics.add.collider(this.player, this.climbingPlatforms);
  }

  private buildLadder() {
    this.ladder.setVisible(true);
    const scene = this;
    this.tweens.add({
      targets: this.ladder,
      y: INITIAL_Y,
      ease: "Power1",
      duration: 2000,
      repeat: 0,
      onComplete() {
        scene.ladder.refreshBody();
      }
    });

    this.ladder.body.checkCollision.down = false;
    this.ladder.body.checkCollision.left = false;
    this.ladder.body.checkCollision.right = false;
    this.physics.add.collider(this.player, this.ladder);

    this.physics.add.overlap(this.player, this.ladder, () => {
      this.player.disableGravity();
      this.player.setVelocityX(0);
      this.player.setVelocityY(-400);
    });
  }
}

export default TestScene;
