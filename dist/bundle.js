webpackJsonp([0],{

/***/ 1076:
/*!*********************************!*\
  !*** ./src/scenes/PlayScene.ts ***!
  \*********************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __extends = this && this.__extends || function () {
  var extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  };

  return function (d, b) {
    extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var TestScene =
/** @class */
function (_super) {
  __extends(TestScene, _super);

  function TestScene() {
    return _super.call(this, {
      key: 'TestScene'
    }) || this;
  }

  TestScene.prototype.preload = function () {
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/desert.json');
    this.load.image('Desert', '/assets/tilemaps/tmw_desert_spacing.png');
    this.load.image('player', '/assets/sprites/mushroom.png');
  };

  TestScene.prototype.create = function () {
    var map = this.make.tilemap({
      key: 'map'
    });
    var tileset = map.addTilesetImage('Desert');
    var layer = map.createStaticLayer(0, tileset, 0, 0);
    this.player = this.add.sprite(100, 100, 'player');
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, false);
  };

  TestScene.prototype.update = function (time, delta) {
    this.player.angle += 1;

    if (this.cursors.left.isDown) {
      this.player.x -= 5;
    }

    if (this.cursors.right.isDown) {
      this.player.x += 5;
    }

    if (this.cursors.down.isDown) {
      this.player.y += 5;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= 5;
    }
  };

  return TestScene;
}(Phaser.Scene);

exports.default = TestScene;

/***/ }),

/***/ 434:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/nuria/dev/personal/sfc/src/main.ts */435);


/***/ }),

/***/ 435:
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(/*! phaser */ 210);

var PlayScene_1 = __webpack_require__(/*! ./scenes/PlayScene */ 1076);

var config = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 640,
  height: 480,
  resolution: 1,
  backgroundColor: "#EDEEC9",
  scene: [PlayScene_1.default]
};
new Phaser.Game(config);

/***/ })

},[434]);
//# sourceMappingURL=bundle.js.map