const GRAVITY_FORCE = 2000;
const MOVE_SPEED = 250;
const JUMP_FORCE = 800;
const COLLISION_WIDTH = 40;
const COLLISION_HEIGHT = 76;

export class PlayerSprite extends Phaser.Physics.Arcade.Sprite {
  private moveSpeed: number;
  private jumpForce: number;
  private respawnX: number;
  private respawnY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.setGravity(0, GRAVITY_FORCE);
    this.moveSpeed = MOVE_SPEED;
    this.jumpForce = JUMP_FORCE;
    (this.body as Phaser.Physics.Arcade.Body).setSize(
      COLLISION_WIDTH,
      COLLISION_HEIGHT,
    );
    this.body.setSize(COLLISION_WIDTH, COLLISION_HEIGHT);
    this.setRespawnPosition(x, y);
  }

  public moveLeft(): void {
    this.setVelocityX(-this.moveSpeed);
  }

  public moveRight(): void {
    this.setVelocityX(this.moveSpeed);
  }

  public stop() {
    this.setVelocityX(0);
  }

  public jump(): void {
    this.setVelocityY(-this.jumpForce);
  }

  public canJump(): boolean {
    return this.body.touching.down;
  }

  public isOutsideCamera(camera: Phaser.Cameras.Scene2D.Camera): boolean {
    const {
      x: cameraX,
      y: cameraY,
      width: cameraWidth,
      height: cameraHeight,
    } = camera.worldView;

    return (
      this.x < cameraX ||
      this.x > cameraX + cameraWidth ||
      this.y < cameraY ||
      this.y > cameraY + cameraHeight
    );
  }

  public setRespawnPosition(x: number, y: number): void {
    this.respawnX = x;
    this.respawnY = y;
  }

  public respawn(): void {
    this.x = this.respawnX;
    this.y = this.respawnY;
  }
}
