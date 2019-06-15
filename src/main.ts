import "phaser";

import TestScene from "./scenes/PlayScene";

const config: GameConfig = {
  type: Phaser.WEBGL,
  parent: "content",
  width: 640,
  height: 480,
  resolution: 1,
  backgroundColor: "#EDEEC9",
  scene: [TestScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 800 },
      debug: true
    }
  }
};

new Phaser.Game(config);
