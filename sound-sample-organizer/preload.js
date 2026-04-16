const { contextBridge, webUtils, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    'electron', 
    {
        getFilePath(file) {
            const path = webUtils.getPathForFile(file);
            return path;
    },
    loadSettings: () => ipcRenderer.invoke('load-settings'),
  	saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
});
