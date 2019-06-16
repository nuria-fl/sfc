export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({
      key: "game_over"
    });
  }

  public create() {
    const music = this.sound.add("finale_music");
    music.play();

    this.add
      .image(0, 0, "game_over_background")
      .setOrigin(0)
      .setInteractive()
      .on("pointerdown", () => {
        music.stop();
        this.goToStart();
      });

    this.input.keyboard.on("keydown", () => {
      music.stop();
      this.goToStart();
    });
  }

  private goToStart(): void {
    this.scene.start("start");
  }
}
