export class WaterCloudSprite extends Phaser.Physics.Arcade.Sprite {
  private rain: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "water_cloud");

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.rain = this.scene.add.sprite(x, y + this.height - 10, "rain");

    this.rain.play("rain");
  }

  public onRainEnded(cb) {
    this.rain.on("animationcomplete", cb);
  }

  public destroy() {
    this.rain.destroy(true);
    super.destroy(true);
  }
}
