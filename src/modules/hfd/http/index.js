const GenericRequest = require('./GenericRequest.js');

module.exports = {
  /**
 * Creates a GET request
 * @param {String} url URL to call
 * @returns {GenericRequest} Created request
 */
  get (url) {
    return new GenericRequest('GET', url);
  },

  /**
     * Creates a POST request
     * @param {String} url URL to call
     * @returns {GenericRequest} Created request
     */
  post (url) {
    return new GenericRequest('POST', url);
  },

  /**
     * Creates a PUT request
     * @param {String} url URL to call
     * @returns {GenericRequest} Created request
     */
  put (url) {
    return new GenericRequest('PUT', url);
  },

  /**
     * Creates a DELETE request
     * @param {String} url URL to call
     * @returns {GenericRequest} Created request
     */
  del (url) {
    return new GenericRequest('DELETE', url);
  },

  /**
     * Creates a HEAD request
     * @param {String} url URL to call
     * @returns {GenericRequest} Created request
     */
  head (url) {
    return new GenericRequest('HEAD', url);
  }
};
