class CatBehaviors {
  constructor(sprite, collisionSystem) {
    this.sprite = sprite;
    this.collision = collisionSystem;
    this.targetX = null;
    this.targetY = null;
    this.totalDistance = 0;
  }

  idle() {
    this.sprite.setState('idle');
  }

  moveTo(x, y, state) {
    this.targetX = x;
    this.targetY = y;
    const dx = x - this.sprite.x;
    const dy = y - this.sprite.y;
    this.totalDistance = Math.sqrt(dx * dx + dy * dy);
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

      if (distance > 10) {
        const dt = deltaTime / 1000;
        // 缓入缓出：根据已走距离占比计算速度系数
        const traveled = this.totalDistance > 0 ? this.totalDistance - distance : 0;
        const ratio = this.totalDistance > 0 ? traveled / this.totalDistance : 0.5;
        const speedFactor = 0.3 + 0.7 * Math.sin(ratio * Math.PI);
        const speed = this.sprite.speed * Math.max(speedFactor, 0.15);

        this.sprite.x += (dx / distance) * speed * dt;
        this.sprite.y += (dy / distance) * speed * dt;
        this.sprite.direction = dx > 0 ? 1 : -1;
      } else {
        this.targetX = null;
        this.targetY = null;
        this.totalDistance = 0;
        this.idle();
      }
    }

    this.collision.clampToBoundary(this.sprite);
  }
}

module.exports = CatBehaviors;
