const GRAVITY_FORCE = 2000;
const MOVE_SPEED = 5;
const JUMP_FORCE = 800;
const COLLISION_WIDTH = 40;
const COLLISION_HEIGHT = 76;

export class PlayerSprite extends Phaser.Physics.Arcade.Sprite {
  private moveSpeed: number;
  private jumpForce: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.setGravity(0, GRAVITY_FORCE);
    this.moveSpeed = MOVE_SPEED;
    this.jumpForce = JUMP_FORCE;
    this.body.setSize(COLLISION_WIDTH, COLLISION_HEIGHT);
  }

  public moveLeft(): void {
    this.x -= this.moveSpeed;
  }

  public moveRight(): void {
    this.x += this.moveSpeed;
  }

  public jump(): void {
    this.setVelocityY(-this.jumpForce);
  }

  public canJump(): boolean {
    return this.body.touching.down;
  }
}
