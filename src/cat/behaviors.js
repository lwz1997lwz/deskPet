class CatBehaviors {
  constructor(sprite, collisionSystem) {
    this.sprite = sprite;
    this.collision = collisionSystem;
    this.targetX = null;
    this.targetY = null;
  }

  idle() {
    this.sprite.setState('idle');
  }

  moveTo(x, y, state) {
    this.targetX = x;
    this.targetY = y;
    this.sprite.setState(state);
  }

  walkTo(x, y) {
    this.moveTo(x, y, 'walk');
  }

  sleep() {
    this.sprite.setState('sleep');
  }

  interact() {
    this.sprite.setState('interact');
  }

  chase(targetX, targetY) {
    this.moveTo(targetX, targetY, 'chase');
  }

  update(deltaTime) {
    if (this.targetX !== null && this.targetY !== null) {
      const dx = this.targetX - this.sprite.x;
      const dy = this.targetY - this.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        this.sprite.x += (dx / distance) * this.sprite.speed * deltaTime;
        this.sprite.y += (dy / distance) * this.sprite.speed * deltaTime;
        this.sprite.direction = dx > 0 ? 1 : -1;
      } else {
        this.targetX = null;
        this.targetY = null;
        this.idle();
      }
    }

    this.collision.clampToBoundary(this.sprite);
  }
}

module.exports = CatBehaviors;
