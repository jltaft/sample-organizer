const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// loads settings from a JSON
function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch {
  	// if settings file is missing
    return { skin: 'default' };
  }
}

// stores settings in a JSON
function saveSettings(newSettings) {
  fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
}

module.exports = { loadSettings, saveSettings };
