class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.layers = [];
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  addLayer(name) {
    const layer = {
      name,
      elements: [],
      visible: true
    };
    this.layers.push(layer);
    return layer;
  }

  render() {
    this.clear();
    for (const layer of this.layers) {
      if (layer.visible) {
        for (const element of layer.elements) {
          element.render(this.ctx);
        }
      }
    }
  }
}

module.exports = CanvasManager;
