export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: "loading"
    });
  }

  public preload() {
    this.add.image(0, 0, "loading_background").setOrigin(0);

    this.add.text(342, 330, "loading...", {
      fontFamily: "Amatic SC",
      fontSize: 40,
      color: "#fff"
    });

    this.load.image("start_background", "/assets/start_background.jpg");

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
      },
      {
        key: "player_climbing",
        url: "/assets/sprites/wolf_spritesheet.png",
        frameConfig: {
          frameWidth: 50,
          frameHeight: 87,
          startFrame: 7,
          endFrame: 8
        }
      },
      {
        key: "player_dying",
        url: "/assets/sprites/wolf_spritesheet.png",
        frameConfig: {
          frameWidth: 50,
          frameHeight: 69,
          startFrame: 9,
          endFrame: 10
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
    this.load.image("life", `/assets/sprites/wolf_life.png`);
    this.load.audio("jump", "/assets/audio/jump.wav");
    this.load.audio("background_music", "/assets/audio/background_music.mp3");
    this.load.image("game_over_background", "/assets/game_over_background.jpg");
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

    this.anims.create({
      key: "climb",
      frames: this.anims.generateFrameNumbers("player_climbing", {
        frames: [7, 8]
      }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: "die",
      frames: this.anims.generateFrameNumbers("player_dying", {
        frames: [9, 10]
      }),
      frameRate: 6,
      repeat: -1
    });

    this.scene.start("play");
    // this.scene.start("start");
  }
}
