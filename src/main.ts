import "phaser";

import { GameOverScene } from "./scenes/game_over.scene";
import { LoadingScene } from "./scenes/loading.scene";
import { PlayScene } from "./scenes/play.scene";
import { PreLoadingScene } from "./scenes/pre_loading.scene";
import { StartScene } from "./scenes/start.scene";
import { ThanksScene } from "./scenes/thanks.scene";

const config: GameConfig = {
  type: Phaser.AUTO,
  parent: "content",
  width: 800,
  height: 600,
  resolution: 1,
  backgroundColor: "#040407",
  scene: [
    PreLoadingScene,
    LoadingScene,
    StartScene,
    PlayScene,
    GameOverScene,
    ThanksScene
  ],
  physics: {
    default: "arcade",
    arcade: { debug: true }
  }
};

// tslint:disable-next-line:no-unused-expression
new Phaser.Game(config);
