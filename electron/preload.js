const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendTodo: (todo) => ipcRenderer.send('add-todo', todo),
  getTodos: () => ipcRenderer.invoke('get-todos'),
  updateConfig: (config) => ipcRenderer.send('update-config', config),
  getConfig: () => ipcRenderer.invoke('get-config')
});
