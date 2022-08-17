const { API } = require('hfd/entities');

/**
 * @typedef HfdRoute
 * @property {String} path Route path
 * @property {React.Component|function(): React.ReactNode} render Route renderer
 * @property {React.Component|function(): React.ReactNode|undefined} sidebar Sidebar renderer
 */


/**
 * HFD custom router API
 * @property {HfdRoute[]} routes Registered routes
 */
class RouterAPI extends API {
  constructor () {
    super();

    this.routes = [];
  }


  /**
   * Registers a route
   * @param {HfdRoute} route Route to register
   * @emits RouterAPI#routeAdded
   */
  registerRoute (route) {
    if (this.routes.find((r) => r.path === route.path)) {
      throw new Error(`Route "${route.path}" is already registered`);
    }

    this.routes.push(route);
    this.emit('reouteaAdded', route);
  }


  /**
   * Unregisters a route
   * @param {String} path Route to unregister
   * @emits RouterAPI#routeRemoved
   */
  unregisterRoute (path) {
    if (this.routes.find((r) => r.path === path)) {
      this.routes = this.routes.filter((r) => r.path !== path);
      this.emit('routeRemoved', path);
    }
  }
}

module.exports = RouterAPI;
