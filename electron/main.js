const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    x: 100,
    y: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('src/renderer/index.html');
  mainWindow.setIgnoreMouseEvents(false);

  // 捕获渲染进程的控制台输出
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[渲染进程] ${message}`);
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/icons/tray.png');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: '添加待办...', click: () => mainWindow.webContents.send('show-todo-input') },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ]);
  tray.setToolTip('桌面猫咪');
  tray.setContextMenu(contextMenu);
}

// IPC：窗口拖拽
ipcMain.on('window-move', (event, { deltaX, deltaY }) => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x + deltaX, y + deltaY);
  }
});

// IPC：退出应用
ipcMain.on('app-quit', () => {
  app.quit();
});

app.whenReady().then(() => {
  createWindow();
  createTray();
  console.log('窗口已创建');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
