export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({
      key: "game_over"
    });
  }

  public preload() {
    this.load.image("game_over_background", "/assets/game_over_background.jpg");
  }

  public create() {
    this.add
      .image(0, 0, "game_over_background")
      .setOrigin(0)
      .setInteractive()
      .on("pointerdown", () => {
        this.goToStart();
      });

    this.input.keyboard.on("keydown", () => {
      this.goToStart();
    });
  }

  private goToStart(): void {
    this.scene.start("start");
  }
}
