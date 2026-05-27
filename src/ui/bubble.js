// src/ui/bubble.js
class Bubble {
  constructor() {
    this.element = document.getElementById('bubble');
    this.hideTimeout = null;
  }

  show(text, x, y, duration = 5000) {
    this.element.textContent = text;
    this.element.style.left = x + 'px';
    this.element.style.top = y + 'px';
    this.element.classList.remove('hidden');

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.hideTimeout = setTimeout(() => this.hide(), duration);
  }

  hide() {
    this.element.classList.add('hidden');
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
}

module.exports = Bubble;
