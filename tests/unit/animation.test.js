const AnimationEngine = require('../../src/engine/animation');

describe('AnimationEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new AnimationEngine();
  });

  test('应该注册动画', () => {
    const animation = {
      frames: [{ duration: 100 }, { duration: 100 }],
      loop: true
    };
    engine.register('walk', animation);
    expect(engine.animations.walk).toBeDefined();
  });

  test('应该播放动画', () => {
    const animation = {
      frames: [{ duration: 100 }, { duration: 100 }],
      loop: false
    };
    engine.register('test', animation);
    engine.play('test');
    expect(engine.currentAnimation).toBe('test');
    expect(engine.currentFrame).toBe(0);
  });

  test('应该更新帧', () => {
    const animation = {
      frames: [{ duration: 100 }, { duration: 100 }],
      loop: false
    };
    engine.register('test', animation);
    engine.play('test');
    engine.update(150);
    expect(engine.currentFrame).toBe(1);
  });
});
