const CollisionSystem = require('../../src/engine/collision');

describe('CollisionSystem', () => {
  let system;

  beforeEach(() => {
    system = new CollisionSystem(300, 300);
  });

  describe('checkBoundary', () => {
    test('应该检测实体完全在边界内（返回 false）', () => {
      // 中心点在(150,150)，宽高50，半宽25，边界检查：125-175在0-300内
      const entity = { x: 150, y: 150, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(false);
    });

    test('应该检测实体在左边界（中心点x=25是合法位置）', () => {
      // 中心点在(25,25)，半宽25，左边界：25-25=0，合法
      const entity = { x: 25, y: 25, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(false);
    });

    test('应该检测实体超出左边界', () => {
      // 中心点在(10,50)，半宽25，左边界：10-25=-15<0，越界
      const entity = { x: 10, y: 50, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(true);
    });

    test('应该检测实体超出上边界', () => {
      // 中心点在(50,10)，半高25，上边界：10-25=-15<0，越界
      const entity = { x: 50, y: 10, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(true);
    });

    test('应该检测实体超出右边界', () => {
      // 中心点在(290,50)，半宽25，右边界：290+25=315>300，越界
      const entity = { x: 290, y: 50, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(true);
    });

    test('应该检测实体超出下边界', () => {
      // 中心点在(50,290)，半高25，下边界：290+25=315>300，越界
      const entity = { x: 50, y: 290, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(true);
    });

    test('应该检测实体同时超出多个边界', () => {
      // 中心点在(10,10)，半宽25，左边界：10-25=-15<0，上边界：10-25=-15<0
      const entity = { x: 10, y: 10, width: 50, height: 50 };
      expect(system.checkBoundary(entity)).toBe(true);
    });
  });

  describe('checkCollision', () => {
    test('应该检测实体碰撞', () => {
      // a 中心点(50,50)，半宽25，边界25-75
      // b 中心点(60,60)，半宽25，边界35-85
      // 重叠区域：x(35-75), y(35-75)
      const a = { x: 50, y: 50, width: 50, height: 50 };
      const b = { x: 60, y: 60, width: 50, height: 50 };
      expect(system.checkCollision(a, b)).toBe(true);
    });

    test('应该检测实体不碰撞', () => {
      // a 中心点(50,50)，半宽25，边界25-75
      // b 中心点(150,150)，半宽25，边界125-175
      // 无重叠
      const a = { x: 50, y: 50, width: 50, height: 50 };
      const b = { x: 150, y: 150, width: 50, height: 50 };
      expect(system.checkCollision(a, b)).toBe(false);
    });

    test('应该检测相邻但不碰撞的实体', () => {
      // a 中心点(50,50)，半宽25，右边界75
      // b 中心点(100,50)，半宽25，左边界75
      // 刚好接触但不重叠
      const a = { x: 50, y: 50, width: 50, height: 50 };
      const b = { x: 100, y: 50, width: 50, height: 50 };
      expect(system.checkCollision(a, b)).toBe(false);
    });
  });

  describe('clampToBoundary', () => {
    test('应该限制左侧越界', () => {
      // 中心点在(10,50)，半宽25，左边界：10-25=-15<0，应限制到x=25
      const entity = { x: 10, y: 50, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.x).toBe(25);
    });

    test('应该限制上方越界', () => {
      // 中心点在(50,10)，半高25，上边界：10-25=-15<0，应限制到y=25
      const entity = { x: 50, y: 10, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.y).toBe(25);
    });

    test('应该限制右侧越界', () => {
      // 中心点在(290,50)，半宽25，右边界：290+25=315>300，应限制到x=275
      const entity = { x: 290, y: 50, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.x).toBe(275);
    });

    test('应该限制下方越界', () => {
      // 中心点在(50,290)，半高25，下边界：290+25=315>300，应限制到y=275
      const entity = { x: 50, y: 290, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.y).toBe(275);
    });

    test('应该限制多个方向越界', () => {
      // 中心点在(10,290)，半宽25，左边界：10-25=-15<0，下边界：290+25=315>300
      const entity = { x: 10, y: 290, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.x).toBe(25);
      expect(entity.y).toBe(275);
    });

    test('不应该修改完全在边界内的实体', () => {
      // 中心点在(150,150)，宽高50，完全在边界内
      const entity = { x: 150, y: 150, width: 50, height: 50 };
      system.clampToBoundary(entity);
      expect(entity.x).toBe(150);
      expect(entity.y).toBe(150);
    });
  });
});
