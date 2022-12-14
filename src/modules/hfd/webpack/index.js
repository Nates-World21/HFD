const { sleep } = require('hfd/util');
const moduleFilters = require('./modules.json');

const webpack = {
  ...require('./lazy'),

  /**
    * Grabs a module from the Webpack store
    * @param {function|string[]} filter Filter used to grab the module. Can be a function or an array of keys the object must have.
    * @param {boolean} retry Whether or not to retry fetching if the module is not found. Each try will be delayed by 100ms and max retries is 20.
    * @param {boolean} forever If HFD should try to fetch the module forever. Should be used only if you're in early stages of startup.
    * @returns {Promise<object>|object} The found module. A promise will always be returned, unless retry is false.
    */
  getModule (filter, retry = true, forever = false) {
    if (Array.isArray(filter)) {
      const keys = filter;
      filter = m => keys.every(key => m.hasOwnProperty(key) || (m.__proto__ && m.__proto__.hasOwnProperty(key)));
    }

    if (!retry) {
      return webpack._getModules(filter);
    }

    return new Promise(async (res) => {
      let mdl;
      for (let i = 0; i < 21; !forever && i++) {
        mdl = webpack._getModules(filter);
        if (mdl) {
          return res(mdl);
        }
        await sleep(100);
      }

      res(mdl);
    });
  },

  /**
    * Grabs all found modules from the webpack store
    * @param {function|string[]} filter Filter used to grab the module. Can be a function or an array of keys the object must have.
    * @returns {object[]} The found modules.
    */
  getAllModules (filter) {
    if (Array.isArray(filter)) {
      const keys = filter;
      filter = m => keys.every(key => m.hasOwnProperty(key) || (m.__proto__ && m.__proto__.hasOwnProperty(key)));
    }

    return webpack._getModules(filter, true);
  },

  /**
    * Grabs a React component by its display name
    * @param {string} displayName Component's display name.
    * @param {boolean} retry Whether or not to retry fetching if the module is not found. Each try will be delayed by 100ms and max retries is 20.
    * @param {boolean} forever If HFD should try to fetch the module forever. Should be used only if you're in early stages of startup.
    * @returns {Promise<object>|object} The component. A promise will always be returned, unless retry is false.
    */
  getModuleByDisplayName (displayName, retry = true, forever = false) {
    return webpack.getModule(m => m.displayName && m.displayName.toLowerCase() === displayName.toLowerCase(), retry, forever);
  },

  /**
    * Grabs a React component's module info by its display name
    * @param {string} displayName Component's display name.
    * @returns {ModuleInfo} The module info.
    */
  getModuleInfoByDisplayName (displayName) {
    return Object.values(webpack.instance.cache).find(m => m?.exports?.displayName === displayName || m?.exports?.default?.displayName === displayName);
  },

  /**
    * Grabs a chunk by one of its modules' id
    * @param {number} id The module id.
    * @returns {Chunk} The chunk.
    */
  getChunkByModuleId (id) {
    return webpackChunkdiscord_app.find(m => id in m[1]);
  },

  /**
    * Gets the source function of a module by its id
    * @param {number} id The module id.
    * @returns {function} The source function.
    */
  getModuleSourceById (id) {
    const chunk = webpack.getChunkByModuleId(id);
    return chunk[1][id];
  },

  /**
    * From a given module id, gets a list of chunk ids that said module might lazy load.
    * @param {number} id The module id.
    * @returns {number[]} The 'to be lazy-loaded' chunk ids
    */
  getLazyLoadedChunkIdsByModuleId (id) {
    const srcStr = webpack.getModuleSourceById(id).toString();
    const requireArgument = srcStr.toString().match(/^\(.,.,(.)\)/)?.[1];

    if (!requireArgument) {
      return [];
    }

    const importPattern = new RegExp(`\\b${requireArgument}\\.e\\(\\d+\\)`, 'g');
    const imports = srcStr.toString().match(importPattern);
    const ids = imports.map(e => e.slice(4, -1));
    return ids;
  },


  /**
    * Initializes the injection into Webpack
    * @returns {Promise<void>}
    */
  async init () {
    delete webpack.init;

    // Wait until webpack is ready
    while (!window.webpackChunkdiscord_app || !window._) {
      await sleep(100);
    }

    // Extract values from webpack
    webpack.instance = {};
    webpackChunkdiscord_app.push([
      [ [ '_hfd' ] ],
      {},
      (r) => {
        webpack.instance.cache = r.c;
        webpack.instance.require = (m) => r(m);

        webpack.instance.loadChunk = (c) => r.e(c)
          .then(() => {
            // Get chunk
            const chunk = webpackChunkdiscord_app.find(C => `${C[0][0]}` === c);
            // Cache all the modules
            Object.keys(chunk[1]).forEach(m => r(m));
          });
      }
    ]);
    webpackChunkdiscord_app.pop();

    // Patch push to enable webpack chunk listeners
    webpack._patchPush();
    delete webpack._patchPush;

    // Load modules pre-fetched
    for (const mdl in moduleFilters) {
      // noinspection JSUnfilteredForInLoop
      this[mdl] = await webpack.getModule(moduleFilters[mdl]);
    }

    this.i18n = webpack.getAllModules([ 'Messages', 'getLanguages' ]).find((m) => m.Messages.ACCOUNT);
  },

  _getModules (filter, all = false) {
    const moduleInstances = Object.values(webpack.instance.cache).filter(m => m.exports);
    if (all) {
      const exports = moduleInstances.filter(m => filter(m.exports)).map(m => m.exports);
      const expDefault = moduleInstances.filter(m => m.exports.default && filter(m.exports.default)).map(m => m.exports.default);
      return exports.concat(expDefault);
    }

    const exports = moduleInstances.find(m => filter(m.exports));
    if (exports) {
      return exports.exports;
    }
    const expDefault = moduleInstances.find(m => m.exports.default && filter(m.exports.default));
    if (expDefault) {
      return expDefault.exports.default;
    }
    return null;
  }
};

module.exports = webpack;
