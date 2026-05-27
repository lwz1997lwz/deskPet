class CollisionSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  checkBoundary(entity) {
    return (
      entity.x < 0 ||
      entity.y < 0 ||
      entity.x + entity.width > this.width ||
      entity.y + entity.height > this.height
    );
  }

  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  clampToBoundary(entity) {
    if (entity.x < 0) entity.x = 0;
    if (entity.y < 0) entity.y = 0;
    if (entity.x + entity.width > this.width) {
      entity.x = this.width - entity.width;
    }
    if (entity.y + entity.height > this.height) {
      entity.y = this.height - entity.height;
    }
  }
}

module.exports = CollisionSystem;
