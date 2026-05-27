// src/ui/menu.js
class ContextMenu {
  constructor() {
    this.element = null;
  }

  show(x, y, items) {
    this.hide();

    this.element = document.createElement('div');
    this.element.className = 'context-menu';
    this.element.style.left = x + 'px';
    this.element.style.top = y + 'px';

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
