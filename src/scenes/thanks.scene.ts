export class ThanksScene extends Phaser.Scene {
  constructor() {
    super({
      key: "thanks"
    });
  }

  public preload() {
    this.add
      .image(0, 0, "thanks_background")
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
