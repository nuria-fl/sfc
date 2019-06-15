import pages from "../text";

class TestScene extends Phaser.Scene {
  player: Phaser.GameObjects.Sprite;
  cursors: any;
  words: Phaser.GameObjects.Text[] = [];
  platforms: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({
      key: "TestScene"
    });
  }

  preload() {
    this.load.tilemapTiledJSON("map", "/assets/tilemaps/desert.json");
    this.load.image("Desert", "/assets/tilemaps/tmw_desert_spacing.png");
    this.load.image("player", "/assets/sprites/mushroom.png");
    this.load.image("floor", `/assets/px.png`);
  }

  create() {
    // var map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: "map" });

    this.platforms = this.physics.add.staticGroup();

    let lineY = 100;

    pages[0].forEach(line => {
      const currentLine = line.split(" ");
      let wordX = 100;

      currentLine.forEach(word => {
        const currentWord = this.add.text(wordX, lineY, word, {
          fontFamily: "Amatic SC",
          fontSize: 80,
          color: "#333"
        });

        this.words.push(currentWord);

        const bounds = currentWord.getBounds();

        this.platforms
          .create(bounds.x, bounds.y + 10, "floor")
          .setOrigin(0, 0)
          .setScale(bounds.width, bounds.height - 20)
          .refreshBody();

        wordX += bounds.width + 50;
      });
      lineY += 120;
    });

    this.platforms.toggleVisible();

    this.player = this.add.sprite(150, 0, "player");
    this.physics.world.enable(this.player);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(this.player, this.platforms);

    // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, false);
  }

  update(time: number, delta: number) {
    if (this.cursors.left.isDown) {
      this.player.x -= 5;
    }
    if (this.cursors.right.isDown) {
      this.player.x += 5;
    }
    if (this.cursors.down.isDown) {
      this.player.y += 5;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= 5;
    }
  }
}

export default TestScene;
