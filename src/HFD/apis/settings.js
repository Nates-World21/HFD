const { Flux } = require('hfd/webpack');
const { API } = require('hfd/entities');

const store = require('./settingsStore/store');
const actions = require('./settingsStore/actions');

class SettingsAPI extends API {
  constructor () {
    super();

    this.store = store;
    this.tabs = {};
  }

  registerSettings (tabId, props) {
    if (this.tabs[tabId]) {
      throw new Error(`Settings tab ${tabId} is already registered!`);
    }

    this.tabs[tabId] = props;
    this.tabs[tabId].render = this.connectStores(props.category)(props.render);
    Object.freeze(this.tabs[tabId].render.prototype);
    Object.freeze(this.tabs[tabId]);
  }

  unregisterSettings (tabId) {
    if (this.tabs[tabId]) {
      delete this.tabs[tabId];
    }
  }

  buildCategoryObject (category) {
    return {
      connectStore: (component) => this.connectStores(category)(component),
      getKeys: () => store.getSettingsKeys(category),
      get: (setting, defaultValue) => store.getSetting(category, setting, defaultValue),
      set: (setting, newValue) => {
        if (newValue === void 0) {
          return actions.toggleSetting(category, setting);
        }

        actions.updateSetting(category, setting, newValue);
      },
      delete: (setting) => {
        actions.deleteSetting(category, setting);
      }
    };
  }

  connectStores (category) {
    return Flux.connectStores([ this.store ], () => this._fluxProps(category));
  }

  /** @private */
  _fluxProps (category) {
    return {
      settings: store.getSettings(category),
      getSetting: (setting, defaultValue) => store.getSetting(category, setting, defaultValue),
      updateSetting: (setting, value) => actions.updateSetting(category, setting, value),
      toggleSetting: (setting, defaultValue) => actions.toggleSetting(category, setting, defaultValue)
    };
  }

  async startAPI () {
    setTimeout(this.download.bind(this), 1500);
    this._interval = setInterval(this.upload.bind(this), 10 * 60 * 1000);
  }

  async apiWillUnload () {
    clearInterval(this._interval);
    await this.upload();
  }

  async upload () {
    return false;
  }

  async download () {
    return false;
  }
}

module.exports = SettingsAPI;
