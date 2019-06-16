import "phaser";

import { PlayScene } from "./scenes/play.scene";
import { StartScene } from "./scenes/start.scene";

const config: GameConfig = {
  type: Phaser.AUTO,
  parent: "content",
  width: 800,
  height: 600,
  resolution: 1,
  backgroundColor: "#EDEEC9",
  scene: [StartScene, PlayScene],
  physics: {
    default: "arcade",
    arcade: { debug: true }
  }
};

// tslint:disable-next-line:no-unused-expression
new Phaser.Game(config);
