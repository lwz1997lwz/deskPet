// src/ui/settings.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULTS = {
  autoLaunch: false,
  soundEnabled: true,
  opacity: 100
};

class Settings {
  constructor() {
    this.element = null;
    this.isOpen = false;
  }

  open() {
    if (this.isOpen) return;

    this.element = document.createElement('div');
    this.element.className = 'settings-panel';

    const settings = this.load();

    this.element.innerHTML = `
      <div class="settings-header">
        <h3>设置</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="settings-content">
        <div class="setting-item">
          <label>开机自启动</label>
          <input type="checkbox" id="autoLaunch" ${settings.autoLaunch ? 'checked' : ''}>
        </div>
        <div class="setting-item">
          <label>音效</label>
          <input type="checkbox" id="soundEnabled" ${settings.soundEnabled ? 'checked' : ''}>
        </div>
        <div class="setting-item">
          <label>透明度</label>
          <input type="range" id="opacity" min="30" max="100" value="${settings.opacity || 100}">
          <span class="opacity-value">${settings.opacity || 100}%</span>
        </div>
      </div>
      <div class="settings-footer">
        <button class="save-btn">保存</button>
        <button class="cancel-btn">取消</button>
      </div>
    `;

    this.element.querySelector('.close-btn').onclick = () => this.close();
    this.element.querySelector('.cancel-btn').onclick = () => this.close();
    this.element.querySelector('.save-btn').onclick = () => this.save();

    const opacityInput = this.element.querySelector('#opacity');
    const opacityValue = this.element.querySelector('.opacity-value');
    opacityInput.oninput = () => {
      opacityValue.textContent = opacityInput.value + '%';
    };

    document.body.appendChild(this.element);
    this.isOpen = true;
  }

  close() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.isOpen = false;
  }

  save() {
    const settings = {
      autoLaunch: this.element.querySelector('#autoLaunch').checked,
      soundEnabled: this.element.querySelector('#soundEnabled').checked,
      opacity: parseInt(this.element.querySelector('#opacity').value)
    };

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    } catch (e) {
      console.error('保存设置失败:', e);
    }
    this.close();

    return settings;
  }

  load() {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) };
      }
    } catch (e) {
      console.error('加载设置失败:', e);
    }
    return { ...DEFAULTS };
  }
}

module.exports = Settings;
