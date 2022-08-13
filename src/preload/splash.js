const { ipcRenderer } = require('electron');
const { join } = require('path');
require('../ipc/renderer');

require('module').Module.globalPaths.push(join(__dirname, '../modules'));

const preload = ipcRenderer.sendSync('HFD_GET_PRELOAD');
if (preload) {
  require(preload);
}

window.__SPLASH__ = true;

function init () {
  document.body.classList.add('hfd');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
