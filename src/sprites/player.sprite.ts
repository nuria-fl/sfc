export const GRAVITY_FORCE = 2000;
const MOVE_SPEED = 250;
const JUMP_FORCE = 650;
const JUMP_LIMIT = 2;
const COLLISION_WIDTH = 40;
const COLLISION_HEIGHT = 69;

export class PlayerSprite extends Phaser.Physics.Arcade.Sprite {
  get canJump() {
    if (this.canMove) {
      return this.jumpCount < JUMP_LIMIT;
    }
  }
  public lifes = 3;
  public dead = false;
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
    this.play("idle");
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
      this.scene.sound.play("jump");
    }
  }

  public enableJump() {
    this.jumpCount = 0;
  }

  public isOutsideWorld(world: { width: number; height: number }): boolean {
    return (
      this.x < 0 || this.x > world.width || this.y < 0 || this.y > world.height
    );
  }

  public setRespawnPosition(x: number, y: number): void {
    this.respawnX = x;
    this.respawnY = y;
  }

  public respawn(): boolean {
    this.lifes -= 1;

    if (this.lifes < 0) {
      return false;
    }
    this.setVelocity(0, 0);
    this.x = this.respawnX;
    this.y = this.respawnY;
    this.enableMovement();
    this.dead = false;
    return true;
  }

  public hasStopped(): boolean {
    return (
      !this.dead && this.body.velocity.x === 0 && this.body.velocity.y === 0
    );
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

  public die(scene) {
    if (!this.dead) {
      this.dead = true;
      this.play("die", true);
      this.setVelocityY(-500);
      this.disableMovement();
      setTimeout(() => {
        if (this.respawn()) {
          scene.playerLifes[this.lifes].setVisible(false);
        } else {
          scene.goToGameOver();
        }
      }, 1500);
    }
  }
}
