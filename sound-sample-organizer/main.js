const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const {loadSettings, saveSettings } = require('./settings');

function createWindow() {
const iconPath = process.platform === 'win32'
	? path.join(__dirname, 'assets', 'official-icon.ico')    
	: path.join(__dirname, 'assets', 'official-icon.png');
const win = new BrowserWindow({
    width: 1600,
    height: 900,
    icon: iconPath,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true
    }
    });
    win.loadFile('index.html');
}

app.whenReady().then(() => {
	if (process.platform === 'darwin') {
		app.dock.setIcon(path.join(__dirname, 'assets', 'official-icon.png'));
	}
	createWindow();
});

ipcMain.handle('load-settings', () => loadSettings());
ipcMain.handle('save-settings', (event, settings) => saveSettings(settings));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


