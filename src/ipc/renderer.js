const { ipcRenderer } = require('electron');

if (!ipcRenderer) {
  throw new Error('Lmao what no ipc??');
}

global.HfdNative = {
  openDevTools (opts, externalWindow) {
    return ipcRenderer.invoke('HFD_OPEN_DEVTOOLS', opts, externalWindow);
  },
  closeDevTools () {
    return ipcRenderer.invoke('HFD_CLOSE_DEVTOOLS');
  },
  clearCache () {
    return ipcRenderer.invoke('HFD_CLEAR_CACHE');
  },

  // eslint-disable-next-line no-unused-vars
  openBrowserWindow (_opts) {
    throw new Error('Not implemented');
  },
  __compileSass (file) {
    return ipcRenderer.invoke('HFD_COMPILE_SASS', file);
  },
  exec (...args) {
    return ipcRenderer.invoke('HFD_EXEC_COMMAND', ...args);
  }
};

if (!window.__SPLASH__) {
  window.require = function (mdl) {
    switch (mdl) {
      case 'hfd/compilers':
      case 'hfd/components':
      case 'hfd/components/settings':
      case 'hfd/http':
      case 'hfd/injector':
      case 'hfd/util':
      case 'hfd/webpack':
      case 'hfd/constants':
      case 'hfd/modal':
      case 'hfd':
      case 'electron':
        return require(mdl);
      default:
        throw new Error('Unknown module');
    }
  };
}
