const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('src/renderer/index.html');
  mainWindow.setIgnoreMouseEvents(false);
}

function createTray() {
  // 托盘图标将在后续任务中添加
  // tray = new Tray(path.join(__dirname, '../assets/icons/tray.png'));
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: '添加待办...', click: () => mainWindow.webContents.send('show-todo-input') },
  //   { label: '设置', click: () => mainWindow.webContents.send('show-settings') },
  //   { type: 'separator' },
  //   { label: '退出', click: () => app.quit() }
  // ]);
  // tray.setToolTip('桌面猫咪');
  // tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  // createTray(); // 托盘功能待图标资源就绪后启用
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
