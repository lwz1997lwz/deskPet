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
  }

  loadImages(imageMap) {
    this.images = imageMap;
  }

  setState(state) {
    this.state = state;
    if (this.images[state]) {
      this.currentImage = this.images[state];
    }
  }

  update(deltaTime) {
    // 状态更新逻辑
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
