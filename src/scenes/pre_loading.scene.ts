export class PreLoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: "pre_loading"
    });
  }

  public preload() {
    this.load.image("loading_background", "./assets/loading_background.jpg");
  }

  public create() {
    this.scene.start("loading");
  }
}
