const CollisionSystem = require('../../src/engine/collision');

describe('CollisionSystem', () => {
  let system;

  beforeEach(() => {
    system = new CollisionSystem(300, 300);
  });

  test('应该检测边界碰撞', () => {
    const entity = { x: 0, y: 0, width: 50, height: 50 };
    expect(system.checkBoundary(entity)).toBe(true);
  });

  test('应该检测实体碰撞', () => {
    const a = { x: 10, y: 10, width: 50, height: 50 };
    const b = { x: 30, y: 30, width: 50, height: 50 };
    expect(system.checkCollision(a, b)).toBe(true);
  });

  test('应该限制在边界内', () => {
    const entity = { x: -10, y: 0, width: 50, height: 50 };
    system.clampToBoundary(entity);
    expect(entity.x).toBe(0);
  });
});
