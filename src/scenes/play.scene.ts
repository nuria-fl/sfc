import { FireSprite } from "../sprites/fire.sprite";
import { PigSprite } from "../sprites/pig.sprite";
import { PlayerSprite } from "../sprites/player.sprite";
import { WaterCloudSprite } from "../sprites/water_cloud.sprite";
import pages from "../text";
import { createDialogBox, DialogService } from "../utils/dialog";

const PLAYER_INITIAL_X = 2187;
const PLAYER_INITIAL_Y = 1225;
const PAGE_OFFSET = 1900;
const INITIAL_X = 1985;
const INITIAL_Y = 1240;
const LINE_HEIGHT = 175;
const WORD_SPACE = 50;
const INVENTORY_HUD_OFFSET = 2;
const PIG_1_POSITION_X = 4924;
const PIG_1_POSITION_Y = 2800;
const PIG_2_POSITION_X = 5087;
const PIG_2_POSITION_Y = 2800;
const PIG_3_POSITION_X = 5290;
const PIG_3_POSITION_Y = 2800;

export class PlayScene extends Phaser.Scene {
  public platforms: Phaser.Physics.Arcade.StaticGroup;
  public respawnPlatforms: Phaser.Physics.Arcade.StaticGroup;
  public pickUpPlatforms: Phaser.Physics.Arcade.StaticGroup;
  public dialog: DialogService;
  public player: PlayerSprite;
  public world = {
    width: 0,
    height: 0
  };
  private music: Phaser.Sound.BaseSound;
  private climbingPlatforms: Phaser.Physics.Arcade.StaticGroup;
  private ladder: Phaser.Physics.Arcade.Image;
  private firePlatforms: Phaser.Physics.Arcade.StaticGroup;
  private cursors: Phaser.Input.Keyboard.CursorKeys;
  private pageBorder: Phaser.Physics.Arcade.Image;
  private isClimbingEnabled = false;
  private pickUpWord: any = null;
  private inventory: string[] = [];
  private inventoryOpened = false;
  private inventoryWordSelected: number | null = null;
  private HUD = [];
  private playerLifes: Phaser.GameObjects.Image[];
  private pig1: PigSprite;
  private pig2: PigSprite;
  private pig3: PigSprite;

  constructor() {
    super({
      key: "play"
    });
  }

  public create() {
    this.dialog = new DialogService(this);

    const background = this.add.image(0, 0, "background");
    background.setOrigin(0, 0);
    background.setScale(1.2);

    this.world.width = background.width * 1.2;
    this.world.height = background.height * 1.2;

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
          if (word === "") {
            return;
          }
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

    this.pig1 = new PigSprite(this, PIG_1_POSITION_X, PIG_1_POSITION_Y, "pig1");
    this.pig2 = new PigSprite(this, PIG_2_POSITION_X, PIG_2_POSITION_Y, "pig2");
    this.pig3 = new PigSprite(this, PIG_3_POSITION_X, PIG_3_POSITION_Y, "pig3");

    this.player = new PlayerSprite(this, PLAYER_INITIAL_X, PLAYER_INITIAL_Y);
    this.player.disableMovement();

    setTimeout(() => {
      this.createDialog(
        "I need to eat the three little piggies!\n(Press any key to continue)",
        () => {
          this.createDialog(
            "Let's see… I can pick up words pressing Z, and use them by pressing X",
            () => {
              this.createDialog(
                "Certain words will interact when I go on top of them. Now, let's eat some bacon!",
                () => {
                  this.player.enableMovement();
                }
              );
            }
          );
        }
      );
    }, 800);

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
    this.physics.add.collider(this.pig1, this.platforms);
    this.physics.add.overlap(this.player, this.pig2, () => {
      if (this.pig2.canBeEaten()) {
        this.pig2.destroy(true);
        this.checkWinningCondition();
      }
    });
    this.physics.add.collider(this.pig2, this.platforms);
    this.physics.add.overlap(this.player, this.pig1, () => {
      if (this.pig1.canBeEaten()) {
        this.pig1.destroy(true);
        this.checkWinningCondition();
      }
    });
    this.physics.add.collider(this.pig3, this.platforms);
    this.physics.add.overlap(this.player, this.pig3, () => {
      if (this.pig3.canBeEaten()) {
        this.pig3.destroy(true);
        this.checkWinningCondition();
      }
    });
    this.physics.add.collider(this.player, this.pageBorder);
    this.physics.add.collider(
      this.player,
      this.respawnPlatforms,
      (_, wolfPlatform: Phaser.Physics.Arcade.Sprite) => {
        const { top } = wolfPlatform.body;
        const { x } = wolfPlatform.getCenter();
        this.player.setRespawnPosition(x, top - this.player.height / 2);
        ((wolfPlatform as any).word as Phaser.GameObjects.Text).setColor(
          "#616161"
        );
      }
    );
    this.physics.add.collider(this.player, this.firePlatforms, () => {
      this.player.die(this);
    });
    this.physics.add.collider(this.player, this.pickUpPlatforms, (_, word) => {
      this.pickUpWord = word; // will reset on player move
    });

    this.cameras.main.setBounds(0, 0, this.world.width, this.world.height);
    this.cameras.main.startFollow(this.player, false);

    this.input.keyboard.on("keydown", ({ code }) => {
      if (code === "Space") {
        this.player.jump();
        this.pickUpWord = null;
      }

      if (code === "KeyZ") {
        if (this.inventoryOpened && this.inventoryWordSelected !== null) {
          this.playerUseWord(
            this.HUD[INVENTORY_HUD_OFFSET + this.inventoryWordSelected]
          );
          this.closeInventory();
        } else if (this.pickUpWord) {
          this.inventory.push(
            ((this.pickUpWord as any).word as Phaser.GameObjects.Text).text
          );

          this.pickUpWord.destroy();
          ((this.pickUpWord as any).word as Phaser.GameObjects.Text).destroy();
        }
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

    this.music = this.sound.add("background_music", {
      loop: true,
      volume: 0.3
    });

    this.music.play();

    this.playerLifes = [];
    for (let i = 0; i < this.player.lifes; i += 1) {
      this.playerLifes.push(
        this.add
          .image(15 + i * 45, 15, "life")
          .setOrigin(0, 0)
          .setScrollFactor(0)
      );
    }
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
    if (this.player.isOutsideWorld(this.world)) {
      this.player.die(this);
    }
    this.player.enableGravity();

    if (this.inventoryOpened) {
      if (
        this.cursors.down.isDown &&
        this.inventoryWordSelected < this.inventory.length - 1
      ) {
        this.inventoryWordSelected += 1;
      }

      if (this.cursors.up.isDown && this.inventoryWordSelected > 0) {
        this.inventoryWordSelected -= 1;
      }

      for (
        let i = INVENTORY_HUD_OFFSET;
        i < this.inventory.length + INVENTORY_HUD_OFFSET;
        i += 1
      ) {
        if (i === this.inventoryWordSelected + INVENTORY_HUD_OFFSET) {
          this.HUD[i].setAlpha(1);
        } else {
          this.HUD[i].setAlpha(0.3);
        }
      }
    }
  }

  public createDialog(text, cb = null) {
    createDialogBox(text, cb, this);
  }

  private enableClimbing() {
    if (!this.isClimbingEnabled) {
      this.player.disableMovement();
      this.hideHUD();
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
                  this.showHUD();
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
      { x: 2710 + PAGE_OFFSET, y: 1635 },
      { x: 2410 + PAGE_OFFSET, y: 2500 }
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
    const rumbleSound = this.sound.add("rumble");
    rumbleSound.play();

    this.tweens.add({
      targets: this.ladder,
      y: INITIAL_Y,
      ease: "Power1",
      duration: 2000,
      repeat: 0,
      onComplete() {
        scene.ladder.refreshBody();
        rumbleSound.stop();
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

      this.player.play("climb", true);
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
    if (this.HUD.length) {
      return;
    }

    this.inventoryOpened = true;
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
          "Press 'ESC' to close inventory, 'Z' to use a word",
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

    if (this.inventory.length > 0) {
      this.inventoryWordSelected = 0;
    }

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
    this.inventoryOpened = false;
    this.inventoryWordSelected = null;
    this.player.enableMovement();
  }

  private hideHUD(): void {
    for (let i = 0; i < this.player.lifes; i += 1) {
      this.playerLifes[i].setVisible(false);
    }
  }

  private showHUD(): void {
    for (let i = 0; i < this.player.lifes; i += 1) {
      this.playerLifes[i].setVisible(true);
    }
  }

  private playerUseWord(word: Phaser.GameObjects.Text): void {
    if (word.text === "water" && this.firePlatforms.children.entries[0]) {
      const mainFirePlatform = this.firePlatforms.children.entries[0];
      const { x: playerX, y: playerY } = this.player;
      const {
        x: fireX,
        y: fireY
      } = mainFirePlatform as Phaser.GameObjects.Sprite;
      const distance = Phaser.Math.Distance.Between(
        playerX,
        playerY,
        fireX,
        fireY
      );

      if (distance < 200) {
        const bigPlatform = (mainFirePlatform as any).bigPlatform;
        const bigPlatformFires = bigPlatform.fires;

        const waterCloud = new WaterCloudSprite(
          this,
          (mainFirePlatform.body as Phaser.Physics.Arcade.Body).center.x,
          (mainFirePlatform.body as Phaser.Physics.Arcade.Body).center.y - 200
        );
        waterCloud.onRainEnded(() => {
          (mainFirePlatform as any).fire.destroy(true);
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < bigPlatformFires.length; i += 1) {
            bigPlatformFires[i].destroy(true);
          }
          bigPlatform.destroy(true);
          (mainFirePlatform as any).word.setVisible(false);
          mainFirePlatform.destroy(true);
          waterCloud.destroy();
        });
      }
    } else if (word.text === "eat") {
      const { x: playerX, y: playerY } = this.player;
      const { x: pig1X, y: pig1Y, active: pig1Active } = this.pig1;
      const { x: pig2X, y: pig2Y, active: pig2Active } = this.pig2;
      const { x: pig3X, y: pig3Y, active: pig3Active } = this.pig3;
      const distancePig1 = Phaser.Math.Distance.Between(
        playerX,
        playerY,
        pig1X,
        pig1Y
      );
      const distancePig2 = Phaser.Math.Distance.Between(
        playerX,
        playerY,
        pig2X,
        pig2Y
      );
      const distancePig3 = Phaser.Math.Distance.Between(
        playerX,
        playerY,
        pig3X,
        pig3Y
      );

      let minimum = null;
      let pigToBeEaten = null;

      if (pig1Active) {
        minimum = distancePig1;
        pigToBeEaten = this.pig1;
        if (distancePig2 < minimum && pig2Active) {
          minimum = distancePig2;
          pigToBeEaten = this.pig2;
        }
        if (distancePig3 < minimum && pig3Active) {
          minimum = distancePig3;
          pigToBeEaten = this.pig3;
        }
      } else if (pig2Active) {
        minimum = distancePig2;
        pigToBeEaten = this.pig2;
        if (distancePig3 < minimum && pig3Active) {
          minimum = distancePig3;
        }
      } else if (pig3Active) {
        pigToBeEaten = this.pig3;
      }

      if (pigToBeEaten && minimum < 200) {
        pigToBeEaten.setVulnerable();
      }
    }
  }

  private checkWinningCondition() {
    const pig1Active = this.pig1.active;
    const pig2Active = this.pig2.active;
    const pig3Active = this.pig3.active;

    if (!pig1Active && !pig2Active && !pig3Active) {
      this.player.jump();
      this.player.disableMovement();
      this.music.stop();
      this.sound.play("fanfare");
      setTimeout(() => {
        this.scene.start("thanks");
      }, 1500);
    }
  }

  public goToGameOver() {
    this.music.stop();
    this.scene.start("game_over");
  }
}
