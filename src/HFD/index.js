const { Updatable } = require('hfd/entities');
const { join } = require('path');
const Webpack = require('hfd/webpack');

const StyleManager = require('./managers/StyleManager.js');
const APIManager = require('./managers/APIs.js');
const modules = require('./modules');

let coremods;

class HFD extends Updatable {
  constructor () {
    super(join(__dirname), '..', '..', '', 'hfd');

    this.api = {};
    this.styleManager = new StyleManager();
    this.apiManager = new APIManager();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init () {
    // Webpack/Module init
    await Webpack.init();
    await Promise.all(modules.map(mdl => mdl()));
    this.emit('initializing');


    // Startup
    await this.startup();

    this.emit('loaded');
  }

  async startup () {
    console.log('[HFD] Starting...');

    // Startup APIs
    await this.apiManager.startAPIs();
    this.settings = this.api.settings.buildCategoryObject('general');
    this.emit('settingsReady');

    // Plugins;
    coremods = require('./coremods');
    await coremods.load();

    // Load themes
    this.styleManager.loadThemes();
  }

  async shutdown () {
    // unload coremods
    await coremods.unload();

    // unload all themes
    this.styleManager.unloadThemes();

    // unload all apis
    await this.apiManager.unload();
  }
}

module.exports = HFD;
