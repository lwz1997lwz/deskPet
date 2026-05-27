const CanvasManager = require('../../src/engine/canvas');

describe('CanvasManager', () => {
  let canvas;
  let manager;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    manager = new CanvasManager(canvas);
  });

  test('应该初始化画布', () => {
    expect(manager.canvas).toBe(canvas);
    expect(manager.ctx).toBeDefined();
  });

  test('应该清空画布', () => {
    manager.clear();
    const imageData = manager.ctx.getImageData(0, 0, 1, 1);
    expect(imageData.data[3]).toBe(0);
  });

  test('应该添加图层', () => {
    const layer = manager.addLayer('test');
    expect(layer).toBeDefined();
    expect(manager.layers.length).toBe(1);
  });
});
