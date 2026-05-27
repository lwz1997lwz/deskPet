class AnimationEngine {
  constructor() {
    this.animations = {};
    this.currentAnimation = null;
    this.currentFrame = 0;
    this.elapsedTime = 0;
  }

  register(name, animation) {
    this.animations[name] = animation;
  }

  play(name) {
    if (this.animations[name]) {
      this.currentAnimation = name;
      this.currentFrame = 0;
      this.elapsedTime = 0;
    }
  }

  update(deltaTime) {
    if (!this.currentAnimation) return;

    const animation = this.animations[this.currentAnimation];
    this.elapsedTime += deltaTime;

    const currentFrameData = animation.frames[this.currentFrame];
    if (this.elapsedTime >= currentFrameData.duration) {
      this.elapsedTime -= currentFrameData.duration;
      this.currentFrame++;

      if (this.currentFrame >= animation.frames.length) {
        if (animation.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = animation.frames.length - 1;
          return false;
        }
      }
    }
    return true;
  }

  getCurrentFrame() {
    if (!this.currentAnimation) return null;
    return this.animations[this.currentAnimation].frames[this.currentFrame];
  }
}

module.exports = AnimationEngine;
