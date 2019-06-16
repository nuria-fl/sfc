export class StartScene extends Phaser.Scene {
  constructor() {
    super({
      key: "start"
    });
  }

  public create() {
    const background = this.add.image(0, 0, "start_background");
    background.setOrigin(0);

    this.add
      .text(342, 284, "Start Game", {
        fontFamily: "Amatic SC",
        fontSize: 40,
        color: "#fff"
      })
      .setInteractive()
      .on("pointerdown", () => {
        this.scene.start("play");
      });

    this.add
      .text(352, 324, "Continue", {
        fontFamily: "Amatic SC",
        fontSize: 40,
        color: "#fff"
      })
      .setAlpha(0.5);

    this.add
      .text(360, 366, "Options", {
        fontFamily: "Amatic SC",
        fontSize: 40,
        color: "#fff"
      })
      .setAlpha(0.5);
  }
}
