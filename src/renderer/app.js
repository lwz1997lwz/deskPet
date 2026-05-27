const path = require('path');
const fs = require('fs');
const { ipcRenderer } = require('electron');
const CanvasManager = require('../engine/canvas');
const AnimationEngine = require('../engine/animation');
const CollisionSystem = require('../engine/collision');
const CatSprite = require('../cat/sprite');
const CatBehaviors = require('../cat/behaviors');
const TodoManager = require('../features/todo');
const SystemMonitor = require('../features/system-monitor');
const Bubble = require('../ui/bubble');
const ContextMenu = require('../ui/menu');
const Settings = require('../ui/settings');

// 初始化画布
const canvas = document.getElementById('catCanvas');
const ctx = canvas.getContext('2d');

console.log('Canvas 元素:', canvas);
console.log('Canvas 尺寸:', canvas.width, canvas.height);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  console.log('Canvas 已调整大小:', canvas.width, canvas.height);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


// 初始化各系统
const canvasManager = new CanvasManager(canvas);
const collisionSystem = new CollisionSystem(canvas.width, canvas.height);
const catSprite = new CatSprite(canvas.width / 2, canvas.height - 100);
const catBehaviors = new CatBehaviors(catSprite, collisionSystem);
const animationEngine = new AnimationEngine();
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const todoManager = new TodoManager(path.join(dataDir, 'todos.json'));
const systemMonitor = new SystemMonitor();
const bubble = new Bubble();
const contextMenu = new ContextMenu();
const settings = new Settings();

// 精灵图动画系统
const spriteAnimator = {
  frames: {},
  currentFrame: 0,
  frameTimer: 0,
  frameInterval: 200, // 每帧 200ms

  // 加载精灵图
  async loadSprites() {
    const states = ['idle', 'walk', 'sleep', 'interact', 'drag'];
    const basePath = path.join(__dirname, '../../assets/cats/default');

    for (const state of states) {
      this.frames[state] = [];
      const statePath = path.join(basePath, state);

      const files = fs.readdirSync(statePath)
        .filter(f => f.endsWith('.png'))
        .sort();

      for (const file of files) {
        const filePath = path.join(statePath, file);
        const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
        const img = new Image();
        img.src = fileUrl;
        await new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        // 将图片转为 canvas 以确保 drawImage 可用
        const offscreen = document.createElement('canvas');
        offscreen.width = img.width;
        offscreen.height = img.height;
        const offCtx = offscreen.getContext('2d');
        offCtx.drawImage(img, 0, 0);
        this.frames[state].push(offscreen);
      }
    }

    console.log('精灵图加载完成:', Object.keys(this.frames).map(k => `${k}:${this.frames[k].length}帧`).join(', '));
  },

  // 上一次的状态，用于检测状态切换
  lastState: null,

  // 更新动画帧
  update(deltaTime) {
    // 状态切换时重置帧索引
    if (this.lastState !== catSprite.state) {
      this.currentFrame = 0;
      this.frameTimer = 0;
      this.lastState = catSprite.state;
    }

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      const stateFrames = this.frames[catSprite.state];
      if (stateFrames && stateFrames.length > 0) {
        this.currentFrame = (this.currentFrame + 1) % stateFrames.length;
      }
    }
  },

  // 获取当前帧
  getCurrentFrame() {
    const stateFrames = this.frames[catSprite.state];
    if (stateFrames && stateFrames.length > 0) {
      return stateFrames[this.currentFrame];
    }
    return null;
  }
};

// 游戏循环
let lastTime = 0;
let isFirstFrame = true;
let frameCount = 0;

function gameLoop(timestamp) {
  try {
    if (isFirstFrame) {
      lastTime = timestamp;
      isFirstFrame = false;
      console.log('游戏循环已启动');
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 更新碰撞系统边界（窗口可能已调整大小）
    collisionSystem.width = canvas.width;
    collisionSystem.height = canvas.height;

    catSprite.update(deltaTime);
    animationEngine.update(deltaTime);
    spriteAnimator.update(deltaTime);
    canvasManager.render();

    // 待办提醒定时检查
    lastTodoCheckTime += deltaTime;
    if (lastTodoCheckTime >= TODO_CHECK_INTERVAL) {
      lastTodoCheckTime = 0;
      checkTodoReminders();
    }

    frameCount++;

    requestAnimationFrame(gameLoop);
  } catch (error) {
    console.error('游戏循环错误:', error);
  }
}

// 加载精灵图，然后启动游戏循环
spriteAnimator.loadSprites().then(() => {
  console.log('精灵图已就绪，启动游戏循环');
  // 启动游戏循环
  requestAnimationFrame(gameLoop);
}).catch(err => {
  console.error('精灵图加载失败:', err);
  // 即使加载失败也启动游戏循环
  requestAnimationFrame(gameLoop);
});

// 添加猫咪渲染层
const catLayer = canvasManager.addLayer('cat');
catLayer.elements.push({
  render: function(ctx) {
    const frame = spriteAnimator.getCurrentFrame();
    if (frame && frame.width && frame.height) {
      ctx.save();

      // 根据方向翻转图片
      if (catSprite.direction === -1) {
        ctx.translate(catSprite.x, catSprite.y);
        ctx.scale(-1, 1);
        ctx.drawImage(frame, -frame.width / 2, -frame.height / 2);
      } else {
        ctx.drawImage(frame, catSprite.x - frame.width / 2, catSprite.y - frame.height / 2);
      }

      ctx.restore();
    } else {
      // 如果没有帧，绘制一个调试矩形
      ctx.fillStyle = 'red';
      ctx.fillRect(catSprite.x - 20, catSprite.y - 20, 40, 40);
    }
  }
});

// 配置状态机（使用 CatSprite 内部的状态机）
catSprite.stateMachine.addState('idle', {
  onEnter: () => catBehaviors.idle(),
  onUpdate: (dt) => {}
});

catSprite.stateMachine.addState('walk', {
  onEnter: () => {
    const targetX = Math.random() * canvas.width;
    const targetY = Math.random() * canvas.height;
    catBehaviors.walkTo(targetX, targetY);
  },
  onUpdate: (dt) => catBehaviors.update(dt)
});

catSprite.stateMachine.addState('sleep', {
  onEnter: () => {
    catBehaviors.sleep();
    // 自动唤醒：15~30秒后自动回到 idle
    const wakeDelay = 15000 + Math.random() * 15000;
    catSprite._sleepTimer = setTimeout(() => {
      if (catSprite.state === 'sleep') {
        catSprite.setState('idle');
        bubble.show('伸个懒腰~', catSprite.x, catSprite.y - 70);
      }
    }, wakeDelay);
  },
  onExit: () => {
    // 清除自动唤醒定时器
    if (catSprite._sleepTimer) {
      clearTimeout(catSprite._sleepTimer);
      catSprite._sleepTimer = null;
    }
  },
  onUpdate: (dt) => {}
});

catSprite.stateMachine.addState('interact', {
  onEnter: () => catBehaviors.interact(),
  onExit: () => {},
  onUpdate: (dt) => {
    // 互动后自动回到空闲状态
  }
});

// 初始状态为空闲
catSprite.setState('idle');

// 定时随机切换状态
setInterval(() => {
  if (catSprite.stateMachine.currentState === 'idle') {
    const actions = ['walk', 'sleep', 'idle'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    catSprite.setState(action);
  }
}, 5000);

// 初始化系统监控
systemMonitor.onUpdate((data) => {
  const status = systemMonitor.getStatus();
  if (status.cpuLevel === 'critical') {
    bubble.show('CPU 快冒烟了！', catSprite.x, catSprite.y - 70);
  } else if (status.memoryLevel === 'high') {
    bubble.show('内存快不够了...', catSprite.x, catSprite.y - 70);
  }
});

systemMonitor.start();

// 窗口拖拽状态
let isDragging = false;
let dragMoved = false;
let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 在猫咪区域按下时开始拖拽
  if (Math.abs(x - catSprite.x) < 50 && Math.abs(y - catSprite.y) < 50) {
    isDragging = true;
    dragMoved = false;
    catSprite.setState('drag'); // 切换到拖拽精灵图
    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const deltaX = e.screenX - lastMouseX;
    const deltaY = e.screenY - lastMouseY;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      dragMoved = true;
    }
    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
    ipcRenderer.send('window-move', { deltaX, deltaY });
  } else {
    // 非拖拽时，猫咪跟随鼠标轻微移动视线
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = mouseX - catSprite.x;
    const dy = mouseY - catSprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 200) {
      catSprite.direction = dx > 0 ? 1 : -1;
    }
  }
});

canvas.addEventListener('mouseup', () => {
  if (isDragging) {
    catSprite.setState('idle');
  }
  isDragging = false;
});
window.addEventListener('mouseup', () => {
  if (isDragging) {
    catSprite.setState('idle');
  }
  isDragging = false;
});

// 鼠标点击交互（非拖拽时触发）
canvas.addEventListener('click', (e) => {
  if (dragMoved) {
    dragMoved = false;
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 检测是否点击到猫咪
  if (Math.abs(x - catSprite.x) < 50 && Math.abs(y - catSprite.y) < 50) {
    // 睡觉时点击唤醒
    if (catSprite.state === 'sleep') {
      catSprite.setState('idle');
      bubble.show('喵？被吵醒了...', catSprite.x, catSprite.y - 70);
    } else {
      catSprite.setState('interact');
      const messages = ['喵~', '呼噜噜~', '摸摸头~', '开心！', '再摸摸！'];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      bubble.show(msg, catSprite.x, catSprite.y - 70);
      // 2秒后回到空闲状态
      setTimeout(() => {
        if (catSprite.state === 'interact') {
          catSprite.setState('idle');
        }
      }, 2000);
    }
  }
});

// 右键菜单
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  contextMenu.show(e.clientX, e.clientY, [
    {
      label: '摸摸头',
      action: () => {
        catSprite.setState('interact');
        bubble.show('呼噜噜~', catSprite.x, catSprite.y - 70);
        setTimeout(() => catSprite.setState('idle'), 2000);
      }
    },
    {
      label: '添加待办',
      action: () => {
        const content = prompt('请输入待办事项：');
        if (content) {
          todoManager.add(content);
          bubble.show('已添加待办：' + content, catSprite.x, catSprite.y - 70);
        }
      }
    },
    {
      label: '查看待办',
      action: () => {
        const pending = todoManager.getPending();
        if (pending.length === 0) {
          bubble.show('没有待办事项', catSprite.x, catSprite.y - 70);
        } else {
          bubble.show('有 ' + pending.length + ' 个待办', catSprite.x, catSprite.y - 70);
        }
      }
    },
    {
      label: '睡觉',
      action: () => {
        catSprite.setState('sleep');
        bubble.show('晚安~', catSprite.x, catSprite.y - 70);
      }
    },
    {
      label: '走走',
      action: () => {
        catSprite.setState('walk');
      }
    },
    {
      label: '设置',
      action: () => {
        settings.open();
      }
    },
    {
      label: '退出',
      action: () => {
        ipcRenderer.send('app-quit');
      }
    }
  ]);
});

// 待办提醒：每 30 秒检查一次即将到期的待办
let lastTodoCheckTime = 0;
const TODO_CHECK_INTERVAL = 30000; // 30 秒
const notifiedTodoIds = new Set(); // 避免重复提醒

function checkTodoReminders() {
  const dueSoon = todoManager.getDueSoon(5); // 5 分钟内到期
  for (const todo of dueSoon) {
    if (!notifiedTodoIds.has(todo.id)) {
      notifiedTodoIds.add(todo.id);
      const timeStr = todo.reminderTime ? new Date(todo.reminderTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '';
      bubble.show('📋 待办提醒：' + todo.content + (timeStr ? ' (' + timeStr + ')' : ''), catSprite.x, catSprite.y - 70);
      // 如果猫咪在睡觉，唤醒它来提醒
      if (catSprite.state === 'sleep') {
        catSprite.setState('idle');
      }
    }
  }
  // 清理已完成或已删除的 todo id
  for (const id of notifiedTodoIds) {
    if (!todoManager.todos.find(t => t.id === id && !t.completed)) {
      notifiedTodoIds.delete(id);
    }
  }
}

console.log('桌面猫咪已启动！');
console.log('猫咪位置:', catSprite.x, catSprite.y);
console.log('猫咪状态:', catSprite.state);

// 监听托盘的「添加待办」事件
ipcRenderer.on('show-todo-input', () => {
  const content = prompt('请输入待办事项：');
  if (content) {
    todoManager.add(content);
    bubble.show('已添加待办：' + content, catSprite.x, catSprite.y - 70);
  }
});
