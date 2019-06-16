import { GRAVITY_FORCE } from "./player.sprite";

export class PigSprite extends Phaser.Physics.Arcade.Sprite {
  private vulnerable = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.play(texture);
    this.setGravityY(GRAVITY_FORCE);
  }

  public canBeEaten(): boolean {
    return this.vulnerable;
  }

  public setVulnerable(): void {
    this.vulnerable = true;
    this.play(this.texture.key.replace("pig", "meat"));
  }
}
