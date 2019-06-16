const GRAVITY_FORCE = 2000;
const MOVE_SPEED = 250;
const JUMP_FORCE = 650;
const JUMP_LIMIT = 200;
const COLLISION_WIDTH = 40;
const COLLISION_HEIGHT = 69;

export class PlayerSprite extends Phaser.Physics.Arcade.Sprite {
  private moveSpeed: number;
  private jumpForce: number;
  private respawnX: number;
  private respawnY: number;
  private jumpCount = 0;
  private canMove = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player_idle");

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.enableGravity();
    this.moveSpeed = MOVE_SPEED;
    this.jumpForce = JUMP_FORCE;
    (this.body as Phaser.Physics.Arcade.Body).setSize(
      COLLISION_WIDTH,
      COLLISION_HEIGHT
    );
    this.setRespawnPosition(x, y);

    this.scene.anims.create({
      key: "idle",
      frames: this.scene.anims.generateFrameNumbers("player_idle", {
        frames: [0, 1, 0, 1, 2, 1, 0, 1]
      }),
      frameRate: 5,
      repeat: -1
    });

    this.scene.anims.create({
      key: "jump",
      frames: this.scene.anims.generateFrameNumbers("player_jumping", {
        frames: [3, 4]
      }),
      frameRate: 5,
      repeat: -1
    });

    this.scene.anims.create({
      key: "walk",
      frames: this.scene.anims.generateFrameNumbers("player_walking", {
        frames: [5, 6]
      }),
      frameRate: 6,
      repeat: -1
    });

    this.play("idle");
  }

  get canJump() {
    if (this.canMove) {
      return this.jumpCount < JUMP_LIMIT;
    }
  }

  public moveLeft(): void {
    if (this.canMove) {
      this.setVelocityX(-this.moveSpeed);
      this.flipX = true;
      if (this.jumpCount === 0) {
        this.play("walk", true);
      }
    }
  }

  public moveRight(): void {
    if (this.canMove) {
      this.setVelocityX(this.moveSpeed);
      this.flipX = false;
      if (this.jumpCount === 0) {
        this.play("walk", true);
      }
    }
  }

  public stop() {
    this.setVelocityX(0);
  }

  public jump(): void {
    if (this.canJump) {
      this.setVelocityY(-this.jumpForce);
      this.jumpCount++;
      this.play("jump");
    }
  }

  public enableJump() {
    this.jumpCount = 0;
  }

  public isOutsideCamera(camera: Phaser.Cameras.Scene2D.Camera): boolean {
    const {
      x: cameraX,
      y: cameraY,
      width: cameraWidth,
      height: cameraHeight
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
    this.setVelocity(0, 0);

    this.x = this.respawnX;
    this.y = this.respawnY;
  }

  public hasStopped(): boolean {
    return this.body.velocity.x === 0 && this.body.velocity.y === 0;
  }

  public disableMovement() {
    this.canMove = false;
    this.stop();
  }

  public enableMovement() {
    this.canMove = true;
  }

  public enableGravity() {
    this.setGravityY(GRAVITY_FORCE);
  }

  public disableGravity() {
    this.setGravityY(0);
  }
}
