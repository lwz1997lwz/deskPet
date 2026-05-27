const path = require('path');
const CanvasManager = require('../engine/canvas');
const AnimationEngine = require('../engine/animation');
const CollisionSystem = require('../engine/collision');
const CatSprite = require('../cat/sprite');
const CatBehaviors = require('../cat/behaviors');
const TodoManager = require('../features/todo');
const SystemMonitor = require('../features/system-monitor');
const Bubble = require('../ui/bubble');
const ContextMenu = require('../ui/menu');

// 初始化画布
const canvas = document.getElementById('catCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 初始化各系统
const canvasManager = new CanvasManager(canvas);
const collisionSystem = new CollisionSystem(canvas.width, canvas.height);
const catSprite = new CatSprite(canvas.width / 2, canvas.height - 100);
const catBehaviors = new CatBehaviors(catSprite, collisionSystem);
const animationEngine = new AnimationEngine();
const todoManager = new TodoManager(path.join(__dirname, '../../data/todos.json'));
const systemMonitor = new SystemMonitor();
const bubble = new Bubble();
const contextMenu = new ContextMenu();

// 添加猫咪渲染层
const catLayer = canvasManager.addLayer('cat');
catLayer.elements.push({
  render: function(ctx) {
    // 临时绘制方案：在没有图片素材时用 Canvas 基本图形绘制猫咪
    ctx.save();

    // 绘制猫咪身体（椭圆）
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.ellipse(catSprite.x, catSprite.y, 30, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 绘制猫咪头部（圆形）
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.arc(catSprite.x, catSprite.y - 25, 20, 0, Math.PI * 2);
    ctx.fill();

    // 绘制左耳
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(catSprite.x - 18, catSprite.y - 35);
    ctx.lineTo(catSprite.x - 10, catSprite.y - 55);
    ctx.lineTo(catSprite.x - 2, catSprite.y - 35);
    ctx.fill();

    // 绘制右耳
    ctx.beginPath();
    ctx.moveTo(catSprite.x + 2, catSprite.y - 35);
    ctx.lineTo(catSprite.x + 10, catSprite.y - 55);
    ctx.lineTo(catSprite.x + 18, catSprite.y - 35);
    ctx.fill();

    // 绘制耳朵内侧
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath();
    ctx.moveTo(catSprite.x - 15, catSprite.y - 37);
    ctx.lineTo(catSprite.x - 10, catSprite.y - 50);
    ctx.lineTo(catSprite.x - 5, catSprite.y - 37);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(catSprite.x + 5, catSprite.y - 37);
    ctx.lineTo(catSprite.x + 10, catSprite.y - 50);
    ctx.lineTo(catSprite.x + 15, catSprite.y - 37);
    ctx.fill();

    // 绘制眼睛
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(catSprite.x - 8, catSprite.y - 28, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(catSprite.x + 8, catSprite.y - 28, 3, 0, Math.PI * 2);
    ctx.fill();

    // 绘制鼻子
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(catSprite.x, catSprite.y - 22, 2, 0, Math.PI * 2);
    ctx.fill();

    // 绘制嘴巴
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(catSprite.x - 3, catSprite.y - 19, 3, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(catSprite.x + 3, catSprite.y - 19, 3, 0, Math.PI);
    ctx.stroke();

    // 绘制尾巴
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(catSprite.x + 25, catSprite.y + 5);
    const tailWag = Math.sin(Date.now() / 200) * 10;
    ctx.quadraticCurveTo(catSprite.x + 45, catSprite.y - 10 + tailWag, catSprite.x + 50, catSprite.y - 25 + tailWag);
    ctx.stroke();

    // 根据状态显示不同效果
    if (catSprite.state === 'sleep') {
      // 睡眠时绘制闭眼
      ctx.fillStyle = '#FF9800';
      ctx.fillRect(catSprite.x - 11, catSprite.y - 29, 7, 2);
      ctx.fillRect(catSprite.x + 5, catSprite.y - 29, 7, 2);

      // 绘制 "zzz"
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.fillText('z', catSprite.x + 20, catSprite.y - 45);
      ctx.font = '10px sans-serif';
      ctx.fillText('z', catSprite.x + 28, catSprite.y - 52);
      ctx.font = '8px sans-serif';
      ctx.fillText('z', catSprite.x + 34, catSprite.y - 57);
    }

    ctx.restore();
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
  onEnter: () => catBehaviors.sleep(),
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

// 游戏循环
let lastTime = 0;
let isFirstFrame = true;

function gameLoop(timestamp) {
  if (isFirstFrame) {
    lastTime = timestamp;
    isFirstFrame = false;
  }

  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // 更新碰撞系统边界（窗口可能已调整大小）
  collisionSystem.width = canvas.width;
  collisionSystem.height = canvas.height;

  catSprite.update(deltaTime);
  animationEngine.update(deltaTime);
  canvasManager.render();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// 鼠标点击交互
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 检测是否点击到猫咪
  if (Math.abs(x - catSprite.x) < 50 && Math.abs(y - catSprite.y) < 50) {
    catSprite.setState('interact');
    const messages = ['喵~', '呼噜噜~', '摸摸头~', '开心！', '再摸摸！'];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    bubble.show(msg, catSprite.x, catSprite.y - 70);

    // 2秒后回到空闲状态
    setTimeout(() => {
      catSprite.setState('idle');
    }, 2000);
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
    }
  ]);
});

// 鼠标移动 - 猫咪跟随鼠标轻微移动视线
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // 计算鼠标与猫咪的距离
  const dx = mouseX - catSprite.x;
  const dy = mouseY - catSprite.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 如果鼠标在猫咪附近，更新朝向
  if (distance < 200) {
    catSprite.direction = dx > 0 ? 1 : -1;
  }
});

console.log('桌面猫咪已启动！');
