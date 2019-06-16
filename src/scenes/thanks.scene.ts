export class ThanksScene extends Phaser.Scene {
  constructor() {
    super({
      key: "thanks"
    });
  }

  public preload() {
    this.add.text(342, 330, "Thanks for playing", {
      fontFamily: "Amatic SC",
      fontSize: 40,
      color: "#fff"
    });

    // this.add
    //   .image(0, 0, "game_over_background")
    //   .setOrigin(0)
    //   .setInteractive()
    //   .on("pointerdown", () => {
    //     this.goToStart();
    //   });

    this.input.keyboard.on("keydown", () => {
      this.goToStart();
    });
  }

  private goToStart(): void {
    this.scene.start("start");
  }
}
