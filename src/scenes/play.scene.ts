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

export class PlayScene extends Phaser.Scene {
  public platforms: Phaser.Physics.Arcade.StaticGroup;
  public respawnPlatforms: Phaser.Physics.Arcade.StaticGroup;
  public pickUpPlatforms: Phaser.Physics.Arcade.StaticGroup;
  private climbingPlatforms: Phaser.Physics.Arcade.StaticGroup;
  private ladder: Phaser.Physics.Arcade.Image;
  private firePlatforms: Phaser.Physics.Arcade.StaticGroup;
  private player: PlayerSprite;
  private cursors: Phaser.Input.Keyboard.CursorKeys;
  private pageBorder: Phaser.Physics.Arcade.Image;
  private isClimbingEnabled = false;
  private pickUpWord: any = null;
  private inventory: string[] = [];
  private HUD = [];

  constructor() {
    super({
      key: "play"
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
    this.load.audio("jump", "/assets/audio/jump.wav");
    this.load.audio("background_music", "/assets/audio/background_music.mp3");
  }

  public create() {
    this.anims.create({
      key: "fire",
      frames: this.anims.generateFrameNumbers("fire", {
        frames: [0, 1]
      }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player_idle", {
        frames: [0, 1, 0, 1, 2, 1, 0, 1]
      }),
      frameRate: 5,
      repeat: -1
    });

    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNumbers("player_jumping", {
        frames: [3, 4]
      }),
      frameRate: 5,
      repeat: -1
    });

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player_walking", {
        frames: [5, 6]
      }),
      frameRate: 6,
      repeat: -1
    });

    const background = this.add.image(0, 0, "background");
    background.setOrigin(0, 0);
    background.setScale(1.2);

    this.platforms = this.physics.add.staticGroup();
    this.climbingPlatforms = this.physics.add.staticGroup();
    this.respawnPlatforms = this.physics.add.staticGroup();
    this.pickUpPlatforms = this.physics.add.staticGroup();
    this.ladder = this.physics.add
      .staticImage(3500, 4800, "ladder")
      .setOrigin(0)
      .setVisible(false)
      .refreshBody();
    this.firePlatforms = this.physics.add.staticGroup();

    let pageOffset = 0;

    const pickUpWords = ["water", "eat"];

    const colors = {
      regular: "#333",
      interactive: "#FFA500",
      pickUp: "#21a9dd"
    };

    pages.forEach(page => {
      let lineY = INITIAL_Y;
      page.forEach(line => {
        const currentLine = line.split(" ");
        let wordX = INITIAL_X;

        currentLine.forEach(word => {
          if (word === "") return;
          const isPickUpWord = pickUpWords.includes(word);
          const isInteractiveWord = word === "climbing";

          const getWordColor = () => {
            if (isPickUpWord) {
              return colors.pickUp;
            } else if (isInteractiveWord) {
              return colors.interactive;
            } else {
              return colors.regular;
            }
          };

          if (isPickUpWord) {
            pickUpWords.splice(pickUpWords.findIndex(w => w === word), 1);
          }

          const currentWord = this.add.text(wordX + pageOffset, lineY, word, {
            fontFamily: "Amatic SC",
            fontSize: 100,
            color: getWordColor()
          });

          const bounds = currentWord.getBounds();

          let platform;

          if (word === "wolf") {
            platform = this.buildPlatform(
              this.respawnPlatforms,
              bounds,
              currentWord
            );
          } else if (word.match(/^fire/)) {
            platform = this.buildPlatform(
              this.firePlatforms,
              bounds,
              currentWord
            );
            platform.fire = new FireSprite(
              this,
              platform.x + bounds.width / 2,
              platform.y - bounds.height / 4,
              "fire"
            );
            platform.bigPlatform = this.buildPlatform(
              this.firePlatforms,
              {
                x: platform.x - 1310,
                y: platform.y + 270,
                width: 1510,
                height: 100
              } as Phaser.Geom.Rectangle,
              currentWord
            );
            platform.bigPlatform.fires = [];
            const totalFires = 20;
            for (let i = 0; i < totalFires; i += 1) {
              platform.bigPlatform.fires.push(
                new FireSprite(
                  this,
                  platform.bigPlatform.x + 50 + (i / totalFires) * 1510,
                  platform.bigPlatform.y,
                  "fire"
                )
              );
            }
          } else if (isPickUpWord) {
            platform = this.buildPlatform(
              this.pickUpPlatforms,
              bounds,
              currentWord
            );
          } else {
            platform = this.buildPlatform(this.platforms, bounds, currentWord);
          }

          wordX += bounds.width + WORD_SPACE;
        });
        lineY += LINE_HEIGHT;
      });
      pageOffset += PAGE_OFFSET;
    });

    this.platforms.toggleVisible();
    this.respawnPlatforms.toggleVisible();
    this.firePlatforms.toggleVisible();
    this.pickUpPlatforms.toggleVisible();

    this.cursors = this.input.keyboard.createCursorKeys();

    this.pageBorder = this.physics.add
      .staticImage(3850, INITIAL_Y, "pageLimit")
      .setOrigin(0)
      .setScale(1, 3)
      .setVisible(false)
      .refreshBody();

    this.player = new PlayerSprite(this, PLAYER_INITIAL_X, PLAYER_INITIAL_Y);

    this.physics.add.collider(
      this.player,
      this.platforms,
      (_, platform: Phaser.Physics.Arcade.Sprite) => {
        if (
          ((platform as any).word as Phaser.GameObjects.Text).text ===
          "climbing"
        ) {
          this.enableClimbing();
        }
      }
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
        ((wolfPlatform as any).word as Phaser.GameObjects.Text).setColor(
          "#f00"
        );
      }
    );
    this.physics.add.collider(this.player, this.firePlatforms, () => {
      this.player.respawn();
    });
    this.physics.add.collider(this.player, this.pickUpPlatforms, (_, word) => {
      this.pickUpWord = word; // will reset on player move
    });

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
        this.pickUpWord = null;
      }

      if (code === "KeyZ" && this.pickUpWord) {
        this.inventory.push(
          ((this.pickUpWord as any).word as Phaser.GameObjects.Text).text
        );

        this.pickUpWord.destroy();
        ((this.pickUpWord as any).word as Phaser.GameObjects.Text).destroy();
      }

      if (
        code === "KeyX" &&
        this.player.body.velocity.x === 0 &&
        this.player.body.velocity.y === 0
      ) {
        this.displayInventory();
      }

      if (code === "Escape") {
        this.closeInventory();
      }
    });

    this.sound.play("background_music", { loop: true });
  }

  public update(time: number, delta: number) {
    if (this.cursors.left.isDown) {
      this.pickUpWord = null;
      this.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.pickUpWord = null;
      this.player.moveRight();
    } else {
      this.player.stop();
    }
    if (this.player.body.touching.down) {
      this.player.enableJump();
    }
    if (this.player.hasStopped()) {
      this.player.play("idle", true);
    }
    if (this.player.isOutsideCamera(this.cameras.main)) {
      if (!this.player.respawn()) {
        this.scene.start("game_over");
      }
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
              // tslint:disable-next-line:no-shadowed-variable
              (_, panProgress) => {
                if (panProgress === 1) {
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

  private buildPlatform(
    staticGroup: Phaser.Physics.Arcade.StaticGroup,
    bounds: Phaser.Geom.Rectangle,
    word: Phaser.GameObjects.Text
  ) {
    const platform = staticGroup
      .create(bounds.x + 5, bounds.y + 10 + 10, "floor")
      .setOrigin(0, 0)
      .setScale(bounds.width - 10, bounds.height - 40)
      .refreshBody();

    platform.body.checkCollision.down = false;
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.right = false;
    platform.word = word;

    return platform;
  }

  private displayInventory() {
    if (this.HUD.length) return;

    this.player.disableMovement();

    this.HUD.push(
      this.add
        .graphics()
        .fillRect(0, 0, 7200, 4800)
        .fillStyle(0x000000)
        .setAlpha(0.8)
    );

    this.HUD.push(
      this.add
        .text(
          this.player.x - 390,
          this.player.y - 290,
          "Press 'ESC' to close inventory",
          {
            fontFamily: "Amatic SC",
            fontSize: 30,
            textAlign: "center",
            color: "#fff"
          }
        )
        .setFixedSize(800, 30)
    );
    let yPosition = this.player.y - LINE_HEIGHT;
    this.inventory.forEach((word, i) => {
      this.HUD.push(
        this.add.text(this.player.x - this.player.width / 2, yPosition, word, {
          fontFamily: "Amatic SC",
          fontSize: 100,
          color: "#fff"
        })
      );
      yPosition += LINE_HEIGHT;
    });
  }

  private closeInventory() {
    this.HUD.forEach(item => item.destroy());
    this.HUD = [];
    this.player.enableMovement();
  }
}
