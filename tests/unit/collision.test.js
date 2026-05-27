const CollisionSystem = require('../../src/engine/collision');

describe('CollisionSystem', () => {
  let system;

  beforeEach(() => {
    system = new CollisionSystem(300, 300);
  });

  describe('checkBoundary', () => {
    test('应该检测实体完全在边界内（返回 false）', () => {
      const entity = { x: 50, y: 50, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(false);
    });

    test('应该检测实体在左边界（x=0 是合法位置）', () => {
      const entity = { x: 0, y: 0, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(false);
    });

    test('应该检测实体超出左边界', () => {
      const entity = { x: -10, y: 50, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(true);
    });

    test('应该检测实体超出上边界', () => {
      const entity = { x: 50, y: -10, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(true);
    });

    test('应该检测实体超出右边界', () => {
      const entity = { x: 260, y: 50, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(true);
    });

    test('应该检测实体超出下边界', () => {
      const entity = { x: 50, y: 260, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(true);
    });

    test('应该检测实体同时超出多个边界', () => {
      const entity = { x: -10, y: -10, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(true);
    });
  });

  describe('checkCollision', () => {
    test('应该检测实体碰撞', () => {
      const a = { x: 10, y: 10, width: 50, height: 50 };
      const b = { x: 30, y: 30, width: 50, height: 50 };
      expect(system.checkCollision(a, b)).toBe(true);
    });

    test('应该检测实体不碰撞', () => {
      const a = { x: 10, y: 10, width: 50, height: 50 };
      const b = { x: 100, y: 100, width: 50, height: 50 };
      expect(system.checkCollision(a, b)).toBe(false);
    });

    test('应该检测相邻但不碰撞的实体', () => {
      const a = { x: 10, y: 10, width: 50, height: 50 };
      const b = { x: 60, y: 10, width: 50, height: 50 };
      expect(system.checkCollision(a, b)).toBe(false);
    });
  });

  describe('clampToBoundary', () => {
    test('应该限制左侧越界', () => {
      const entity = { x: -10, y: 50, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.x).toBe(0);
    });

    test('应该限制上方越界', () => {
      const entity = { x: 50, y: -10, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.y).toBe(0);
    });

    test('应该限制右侧越界', () => {
      const entity = { x: 260, y: 50, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.x).toBe(250);
    });

    test('应该限制下方越界', () => {
      const entity = { x: 50, y: 260, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.y).toBe(250);
    });

    test('应该限制多个方向越界', () => {
      const entity = { x: -10, y: 260, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.x).toBe(0);
      expect(entity.y).toBe(250);
    });

    test('不应该修改完全在边界内的实体', () => {
      const entity = { x: 50, y: 50, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.x).toBe(50);
      expect(entity.y).toBe(50);
    });
  });
});
