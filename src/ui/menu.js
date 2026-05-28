// src/ui/menu.js
class ContextMenu {
  constructor() {
    this.element = null;
  }

  show(x, y, items) {
    this.hide();

    this.element = document.createElement('div');
    this.element.className = 'context-menu';

    items.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'menu-item';
      menuItem.textContent = item.label;
      menuItem.onclick = () => {
        item.action();
        this.hide();
      };
      this.element.appendChild(menuItem);
    });

    document.body.appendChild(this.element);

    // 边界检测：超出窗口时翻转方向
    const rect = this.element.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 4;
    const maxY = window.innerHeight - rect.height - 4;
    this.element.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    this.element.style.top = Math.max(0, Math.min(y, maxY)) + 'px';

    setTimeout(() => {
      document.addEventListener('click', this.hide.bind(this), { once: true });
    }, 0);
  }

  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

module.exports = ContextMenu;
