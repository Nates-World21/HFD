try {
  require('fix-path')();
} catch (e) {}
const Module = require('module');
const { join, dirname } = require('path');
const { existsSync, unlinkSync } = require('fs');
const electronPath = require.resolve('electron');
const discordPath = join(dirname(require.main.filename), '..', 'app.asar');
require.main.filename = join(discordPath, 'app_bootstrap/index.js');

const electron = require('electron');
const PatchedBrowserWindow = require('./browserWindow');

require('../ipc/main');

let _patched = false;
const appSetAppUserModelId = electron.app.setAppUserModelId;
function setAppUserModelId (...args) {
  appSetAppUserModelId.apply(this, args);
  if (!_patched) {
    _patched = true;
    require('./updater.win32');
  }
}

electron.app.setAppUserModelId = setAppUserModelId;

if (!electron.safeStorage) {
  electron.safeStorage = {
    isEncryptionAvailable: () => false,
    encryptString: () => {
      throw new Error('Unavailable');
    },
    decryptString: () => {
      throw new Error('Unavailable');
    }
  };
}

const electronExports = new Proxy(electron, {
  get (target, prop) {
    switch (prop) {
      case 'BrowserWindow': return PatchedBrowserWindow;

        // Trick Babel's polyfill thing into not touching Electron's exported object with its logic
      case 'default': return electronExports;
      case '__esModule': return true;
      default: return target[prop];
    }
  }
});

delete require.cache[electronPath].exports;
require.cache[electronPath].exports = electronExports;

electron.app.once('ready', () => {
  electron.session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    Object.keys(responseHeaders)
      .filter(k => (/^content-security-policy/i).test(k))
      .map(k => (delete responseHeaders[k]));

    done({ responseHeaders });
  });

  electron.session.defaultSession.webRequest.onBeforeRequest((details, done) => {
    const domainMatch = details.url.match(/^https:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com/);
    if (domainMatch) {
      const domain = domainMatch[0];
      if (details.url.startsWith(`${domain}/_hfd`)) {
        done({ redirectURL: `${domain}/app` });
      } else {
        done({});
      }
    } else {
      done({});
    }
  });
});

const discordPackage = require(join(discordPath, 'package.json'));
electron.app.setAppPath(discordPath);
electron.app.name = discordPackage.name;

if (process.platform === 'win32') {
  setImmediate(() => {
    const devToolsExtensions = join(electron.app.getPath('userData'), 'DevTools Extensions');

    if (existsSync(devToolsExtensions)) {
      unlinkSync(devToolsExtensions);
    }
  });
}

console.log('Loading Discord');
Module._load(join(discordPath, discordPackage.main), null, true);
