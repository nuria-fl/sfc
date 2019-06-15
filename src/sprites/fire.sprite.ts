export class FireSprite extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.scene.anims.create({
      key: "fire",
      frames: this.scene.anims.generateFrameNumbers("fire", {
        frames: [0, 1],
      }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.play("fire");
  }
}
