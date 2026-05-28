class CollisionSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  checkBoundary(entity) {
    // 考虑中心点定位：x,y是中心点，需要减去宽高的一半
    const halfWidth = entity.width / 2;
    const halfHeight = entity.height / 2;
    return (
      entity.x - halfWidth < 0 ||
      entity.y - halfHeight < 0 ||
      entity.x + halfWidth > this.width ||
      entity.y + halfHeight > this.height
    );
  }

  checkCollision(a, b) {
    // 考虑中心点定位：x,y是中心点，需要减去宽高的一半
    const aHalfW = a.width / 2;
    const aHalfH = a.height / 2;
    const bHalfW = b.width / 2;
    const bHalfH = b.height / 2;
    return (
      a.x - aHalfW < b.x + bHalfW &&
      a.x + aHalfW > b.x - bHalfW &&
      a.y - aHalfH < b.y + bHalfH &&
      a.y + aHalfH > b.y - bHalfH
    );
  }

  clampToBoundary(entity) {
    // 考虑中心点定位：x,y是中心点，需要减去宽高的一半
    const halfWidth = entity.width / 2;
    const halfHeight = entity.height / 2;
    if (entity.x - halfWidth < 0) entity.x = halfWidth;
    if (entity.y - halfHeight < 0) entity.y = halfHeight;
    if (entity.x + halfWidth > this.width) {
      entity.x = this.width - halfWidth;
    }
    if (entity.y + halfHeight > this.height) {
      entity.y = this.height - halfHeight;
    }
  }
}

module.exports = CollisionSystem;
