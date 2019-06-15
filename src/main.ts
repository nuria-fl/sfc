import "phaser";

import TestScene from "./scenes/PlayScene";

const config: GameConfig = {
  type: Phaser.AUTO,
  parent: "content",
  width: 800,
  height: 600,
  resolution: 1,
  backgroundColor: "#EDEEC9",
  scene: [TestScene],
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
};

// tslint:disable-next-line:no-unused-expression
new Phaser.Game(config);
