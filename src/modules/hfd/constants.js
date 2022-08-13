const { join } = require('path');

module.exports = Object.freeze({
  SETTINGS_FOLDER: join(__dirname, '..', '..', '..', 'settings'),
  CACHE_FOLDER: join(__dirname, '..', '..', '..', '.cache'),

  PLUGIN_FOLDER: join(__dirname, '..', '..', 'plugins'),
  THEME_FOLDER: join(__dirname, '..', '..', 'themes')
});
