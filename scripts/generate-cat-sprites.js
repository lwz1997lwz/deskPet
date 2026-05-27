/**
 * 生成简单的猫咪精灵图
 * 用于桌面宠物程序的默认素材
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 猫咪颜色配置
const CAT_COLORS = {
  body: '#FF9800',      // 橙色身体
  bodyLight: '#FFB74D', // 浅橙色
  ear: '#FF9800',       // 耳朵
  earInner: '#FFB74D',  // 耳朵内侧
  eye: '#333333',       // 眼睛
  nose: '#FF5722',      // 鼻子
  mouth: '#333333',     // 嘴巴
};

// 精灵图尺寸
const SPRITE_SIZE = 128;
const FRAMES_PER_STATE = {
  idle: 4,
  walk: 6,
  sleep: 4,
  interact: 4,
  drag: 2,
};

/**
 * 绘制猫咪基础形状
 */
function drawCatBase(ctx, x, y, options = {}) {
  const { eyeOpen = true, mouthOpen = false, tailWag = 0 } = options;

  ctx.save();

  // 绘制尾巴
  ctx.strokeStyle = CAT_COLORS.body;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 25, y + 5);
  ctx.quadraticCurveTo(
    x + 45,
    y - 10 + tailWag,
    x + 50,
    y - 25 + tailWag
  );
  ctx.stroke();

  // 绘制身体（椭圆）
  ctx.fillStyle = CAT_COLORS.body;
  ctx.beginPath();
  ctx.ellipse(x, y, 30, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // 绘制头部（圆形）
  ctx.beginPath();
  ctx.arc(x, y - 25, 20, 0, Math.PI * 2);
  ctx.fill();

  // 绘制左耳
  ctx.beginPath();
  ctx.moveTo(x - 18, y - 35);
  ctx.lineTo(x - 10, y - 55);
  ctx.lineTo(x - 2, y - 35);
  ctx.fill();

  // 绘制右耳
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 35);
  ctx.lineTo(x + 10, y - 55);
  ctx.lineTo(x + 18, y - 35);
  ctx.fill();

  // 绘制耳朵内侧
  ctx.fillStyle = CAT_COLORS.earInner;
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 37);
  ctx.lineTo(x - 10, y - 50);
  ctx.lineTo(x - 5, y - 37);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 5, y - 37);
  ctx.lineTo(x + 10, y - 50);
  ctx.lineTo(x + 15, y - 37);
  ctx.fill();

  // 绘制眼睛
  if (eyeOpen) {
    ctx.fillStyle = CAT_COLORS.eye;
    ctx.beginPath();
    ctx.arc(x - 8, y - 28, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 8, y - 28, 3, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛高光
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 7, y - 29, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 9, y - 29, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 闭眼
    ctx.strokeStyle = CAT_COLORS.eye;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 11, y - 28);
    ctx.lineTo(x - 5, y - 28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 5, y - 28);
    ctx.lineTo(x + 11, y - 28);
    ctx.stroke();
  }

  // 绘制鼻子
  ctx.fillStyle = CAT_COLORS.nose;
  ctx.beginPath();
  ctx.arc(x, y - 22, 2, 0, Math.PI * 2);
  ctx.fill();

  // 绘制嘴巴
  ctx.strokeStyle = CAT_COLORS.mouth;
  ctx.lineWidth = 1;
  if (mouthOpen) {
    // 张嘴
    ctx.beginPath();
    ctx.arc(x, y - 18, 4, 0, Math.PI);
    ctx.stroke();
  } else {
    // 闭嘴
    ctx.beginPath();
    ctx.arc(x - 3, y - 19, 3, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 3, y - 19, 3, 0, Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 生成待机动画帧
 */
function generateIdleFrames() {
  const frames = [];
  const centerX = SPRITE_SIZE / 2;
  const centerY = SPRITE_SIZE / 2 + 10;

  for (let i = 0; i < FRAMES_PER_STATE.idle; i++) {
    const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
    const ctx = canvas.getContext('2d');

    // 不同帧的尾巴位置
    const tailWag = Math.sin((i / FRAMES_PER_STATE.idle) * Math.PI * 2) * 8;

    drawCatBase(ctx, centerX, centerY, {
      eyeOpen: true,
      tailWag,
    });

    frames.push(canvas);
  }

  return frames;
}

/**
 * 生成走路动画帧
 */
function generateWalkFrames() {
  const frames = [];
  const centerX = SPRITE_SIZE / 2;
  const centerY = SPRITE_SIZE / 2 + 10;

  for (let i = 0; i < FRAMES_PER_STATE.walk; i++) {
    const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
    const ctx = canvas.getContext('2d');

    // 走路时身体上下移动
    const bounce = Math.sin((i / FRAMES_PER_STATE.walk) * Math.PI * 2) * 3;
    const tailWag = Math.sin((i / FRAMES_PER_STATE.walk) * Math.PI * 2) * 12;

    drawCatBase(ctx, centerX, centerY + bounce, {
      eyeOpen: true,
      tailWag,
    });

    frames.push(canvas);
  }

  return frames;
}

/**
 * 生成睡觉动画帧
 */
function generateSleepFrames() {
  const frames = [];
  const centerX = SPRITE_SIZE / 2;
  const centerY = SPRITE_SIZE / 2 + 10;

  for (let i = 0; i < FRAMES_PER_STATE.sleep; i++) {
    const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
    const ctx = canvas.getContext('2d');

    drawCatBase(ctx, centerX, centerY, {
      eyeOpen: false,
      tailWag: 0,
    });

    // 添加 "zzz" 文字
    ctx.fillStyle = '#666666';
    ctx.font = '12px sans-serif';
    ctx.fillText('z', centerX + 20, centerY - 45);
    ctx.font = '10px sans-serif';
    ctx.fillText('z', centerX + 28, centerY - 52);
    ctx.font = '8px sans-serif';
    ctx.fillText('z', centerX + 34, centerY - 57);

    frames.push(canvas);
  }

  return frames;
}

/**
 * 生成互动动画帧
 */
function generateInteractFrames() {
  const frames = [];
  const centerX = SPRITE_SIZE / 2;
  const centerY = SPRITE_SIZE / 2 + 10;

  for (let i = 0; i < FRAMES_PER_STATE.interact; i++) {
    const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
    const ctx = canvas.getContext('2d');

    // 互动时眼睛睁大，嘴巴微张
    drawCatBase(ctx, centerX, centerY, {
      eyeOpen: true,
      mouthOpen: i % 2 === 0,
      tailWag: i * 5,
    });

    // 添加爱心效果
    if (i >= 2) {
      ctx.fillStyle = '#FF4081';
      ctx.font = '16px sans-serif';
      ctx.fillText('❤', centerX + 15, centerY - 50);
    }

    frames.push(canvas);
  }

  return frames;
}

/**
 * 生成拖拽动画帧
 */
function generateDragFrames() {
  const frames = [];
  const centerX = SPRITE_SIZE / 2;
  const centerY = SPRITE_SIZE / 2 + 10;

  for (let i = 0; i < FRAMES_PER_STATE.drag; i++) {
    const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
    const ctx = canvas.getContext('2d');

    // 拖拽时惊恐表情
    drawCatBase(ctx, centerX, centerY, {
      eyeOpen: true,
      mouthOpen: true,
      tailWag: -10 + i * 20,
    });

    frames.push(canvas);
  }

  return frames;
}

/**
 * 保存帧到文件
 */
function saveFrames(frames, outputDir, stateName) {
  const stateDir = path.join(outputDir, stateName);

  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
  }

  frames.forEach((frame, index) => {
    const fileName = `${String(index + 1).padStart(2, '0')}.png`;
    const filePath = path.join(stateDir, fileName);
    const buffer = frame.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
    console.log(`已保存: ${filePath}`);
  });
}

/**
 * 主函数
 */
function main() {
  const outputDir = path.join(__dirname, '..', 'assets', 'cats', 'default');

  console.log('开始生成猫咪精灵图...');
  console.log(`输出目录: ${outputDir}`);

  // 生成各状态动画帧
  const idleFrames = generateIdleFrames();
  const walkFrames = generateWalkFrames();
  const sleepFrames = generateSleepFrames();
  const interactFrames = generateInteractFrames();
  const dragFrames = generateDragFrames();

  // 保存到文件
  saveFrames(idleFrames, outputDir, 'idle');
  saveFrames(walkFrames, outputDir, 'walk');
  saveFrames(sleepFrames, outputDir, 'sleep');
  saveFrames(interactFrames, outputDir, 'interact');
  saveFrames(dragFrames, outputDir, 'drag');

  console.log('猫咪精灵图生成完成！');
  console.log(`总共生成: ${
    FRAMES_PER_STATE.idle +
    FRAMES_PER_STATE.walk +
    FRAMES_PER_STATE.sleep +
    FRAMES_PER_STATE.interact +
    FRAMES_PER_STATE.drag
  } 帧`);
}

// 运行主函数
main();
