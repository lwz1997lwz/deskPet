const StateMachine = require('./state-machine');

class CatSprite {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    this.speed = 2;
    this.direction = 1;
    this.state = 'idle';
    this.images = {};
    this.currentImage = null;
    this.stateMachine = new StateMachine();
  }

  loadImages(imageMap) {
    this.images = imageMap;
  }

  setState(state) {
    // 避免相同状态重复转换导致无限递归
    if (this.state === state && this.stateMachine.currentState === state) {
      return;
    }
    this.state = state;
    if (this.images[state]) {
      this.currentImage = this.images[state];
    }
    this.stateMachine.transition(state);
  }

  update(deltaTime) {
    this.stateMachine.update(deltaTime);
  }

  render(ctx) {
    if (this.currentImage) {
      ctx.drawImage(
        this.currentImage,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
}

module.exports = CatSprite;
