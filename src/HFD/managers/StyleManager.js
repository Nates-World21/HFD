const { join, resolve } = require('path');
const { readdirSync, existsSync } = require('fs');
const { readFile, lstat } = require('fs/promises');
const { rmdirRf } = require('hfd/util');

const { Theme } = require('hfd/entities');
const { SETTINGS_FOLDER } = require('hfd/constants');

const fileRegex = /\.((s?c|le)ss|styl)$/;

const ErrorTypes = Object.freeze({
  NOT_A_DIRECTORY: 'NOT_A_DIRECTORY',
  MANIFEST_LOAD_FAILED: 'MANIFEST_LOAD_FAILED',
  INVALID_MANIFEST: 'INVALID_MANIFEST'
});

module.exports = class StyleManager {
  constructor () {
    this._coreStyles = [];
    this.themesDir = join(__dirname, '../../themes');
    this.themes = new Map();
    this.appliedSettings = new Map();

    if (!window.__SPLASH__) {
      readFile(join(__dirname, 'style.css'), 'utf8').then((css) => {
        const appendStyle = () => {
          const style = document.createElement('style');
          style.id = 'hfd-main-css';
          style.dataset.hfd = true;
          style.innerHTML = css;
          document.head.appendChild(style);
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', appendStyle);
        } else {
          appendStyle();
        }
      });
    }
  }

  get disabledThemes () {
    if (window.__SPLASH__) {
      if (!this.__settings) {
        this.__settings = {};

        try {
          this.__settings = require(join(SETTINGS_FOLDER), 'general.json');
        } catch (e) { }

        return this.__settings.disabledThemes || [];
      }
    }

    return hfd.settings.get('disabledThemes', []);
  }

  /**
     *
     * @param {string} theme Name of the theme folder
     * @returns {Theme}
     */
  get (theme) {
    return this.themes.get(theme);
  }

  /**
     * @returns {Theme[]}
     */
  getThemes () {
    return [ ...this.themes.keys() ];
  }

  /**
     *
     * @param {string} theme Name of the theme folder
     * @returns {boolean}
     */
  isInstalled (theme) {
    return this.themes.has(theme);
  }

  /**
     *
     * @param {string} theme Name of the theme folder
     * @returns {boolean}
     */
  isEnabled (theme) {
    return !this.disabledThemes.includes(theme);
  }

  /**
     *
     * @param {string} theme Name of the theme folder
     * @returns {void}
     */
  enable (theme) {
    if (!this.get(theme)) {
      throw new Error(`Tried to enable a theme that is not installed: ${theme}`);
    }

    hfd.settings.set('disabledThemes', this.disabledThemes.filter((t) => t !== theme));
    this.themes.get(theme).apply();
  }

  /**
     *
     * @param {string} theme Name of the theme folder
     * @returns {void}
     */
  disable (theme) {
    if (!this.get(theme)) {
      throw new Error(`Tried to disable a theme that is not installed: ${theme}`);
    }

    hfd.settings.set('disabledThemes', [ ...this.disabledThemes, theme ]);
    this.themes.get(theme).remove();
  }

  /**
     *
     * @param {string} theme Theme name
     * @param {string} file Theme folder
     * @returns
     */
  async mount (themeID, file) {
    const stat = await lstat(join(this.themesDir, file));

    if (stat.isFile()) {
      this._logError(ErrorTypes.NOT_A_DIRECTORY, [ themeID ]);
      return;
    }

    const manifestFile = join(this.themesDir, file, 'manifest.json');
    if (!existsSync(manifestFile)) {
      return;
    }

    let manifest;
    try {
      manifest = require(manifestFile);
    } catch (e) {
      this._logError(ErrorTypes.MANIFEST_LOAD_FAILED, [ themeID ]);
      console.error('%c[HFD | StyleManager]', 'color: #7289da', 'Failed to load manifest', e);
      return;
    }

    const errors = this._validateManifest(manifest);
    if (errors.length > 0) {
      this._logError(ErrorTypes.INVALID_MANIFEST, [ themeID ]);
      console.error('%c[HFD | StyleManager]', 'color: #7289da', `Invalid manifest; The following errored:\n\t${errors.join('\n\t')}`);
      return;
    }

    if (window.__SPLASH__ && manifest.splashTheme) {
      manifest.effectiveTheme = manifest.splashTheme;
    } else if (window.__OVERLAY && manifest.overlayTheme) {
      manifest.effectiveTheme = manifest.overlayTheme;
    } else if (!window.__OVERLAY && !window.__SPLASH__ && manifest.theme) {
      manifest.effectiveTheme = manifest.theme;
    } else {
      return console.warn('%c[HFD | StyleManager]', 'color: #7289da', `Theme "${manifest.name}" is not meant to run on that environment - Skipping`);
    }

    manifest.effectiveTheme = join(this.themesDir, file, manifest.effectiveTheme);
    this.themes.set(themeID, new Theme(themeID, manifest));
  }

  /**
     *
     * @param {string} theme The theme ID
     */
  unmount (theme) {
    theme = this.themes.get(theme);
    if (!theme) {
      throw new Error(`Tried to unmount a theme that is not installed: ${theme}`);
    }

    theme.remove();
    this.themes.delete(theme);
  }

  /**
     *
     * @param {string} theme GitHub URL / URL to backend
     */

  async install () { // args are just theme
    throw new Error('soon:tm:');
  }

  async uninstall (theme) {
    this.unmount(theme);
    await rmdirRf(resolve(this.themesDir, theme));
  }


  /**
     *
     * @param {boolean} sync
     * @returns {theme[] | void}
     */
  async loadThemes (sync = false) {
    const missingThemes = [];
    const files = readdirSync(this.themesDir);

    for (const filename of files) {
      if (filename.startsWith('.')) {
        console.debug('%c[HFD | StyleManager]', 'color: #7289da', 'Ignoring dotfile', filename);
        continue;
      }

      const themeID = filename.split('.').shift();

      if (!sync) {
        await this.mount(themeID, filename);

        if (!this.themes.get(themeID)) {
          continue;
        }
      }

      if (!this.disabledThemes.includes(themeID)) {
        if (sync && !this.isInstalled(themeID)) {
          await this.mount(themeID, filename);
          missingThemes.push(themeID);
        }

        this.themes.get(themeID).apply();
      }
    }

    if (sync) {
      return missingThemes;
    }
  }

  unloadThemes () {
    [ ...this.themes.values() ].forEach((t) => t.remove());
  }

  /**
     *
     * @param {errorType} errorType Type of error that happened
     * @param {string[]} args Information about the error
     * @returns {void}
     */
  _logError (errorType, args) {
    if (window.__SPLASH__ || window.__OVERLAY) {
      return;
    }

    switch (errorType) {
      case ErrorTypes.NOT_A_DIRECTORY:
        console.error(ErrorTypes.NOT_A_DIRECTORY, args[0]);
        break;
      case ErrorTypes.MANIFEST_LOAD_FAILED:
        console.error(ErrorTypes.MANIFEST_LOAD_FAILED, args[0]);
        break;
      case ErrorTypes.INVALID_MANIFEST:
        console.error(ErrorTypes.INVALID_MANIFEST, args[0]);
        break;
    }
  }

  /**
     *
     * @param {themeManifest} manifest Theme's manifest object
     * @returns {errors[]} Errors in the theme manifest
     */
  _validateManifest (manifest) {
    const errors = [];
    if (typeof manifest.name !== 'string') {
      errors.push(`Invalid name: expected a string got ${typeof manifest.name}`);
    }
    if (typeof manifest.description !== 'string') {
      errors.push(`Invalid description: expected a string got ${typeof manifest.description}`);
    }
    if (typeof manifest.version !== 'string') {
      errors.push(`Invalid version: expected a string got ${typeof manifest.version}`);
    }
    if (typeof manifest.author !== 'string') {
      errors.push(`Invalid author: expected a string got ${typeof manifest.author}`);
    }
    if (typeof manifest.license !== 'string') {
      errors.push(`Invalid license: expected a string got ${typeof manifest.license}`);
    }
    if (typeof manifest.theme !== 'string') {
      errors.push(`Invalid theme: expected a string got ${typeof manifest.theme}`);
    } else if (!fileRegex.test(manifest.theme)) {
      errors.push('Invalid theme: unsupported file extension');
    }
    if (manifest.overlayTheme) {
      if (typeof manifest.overlayTheme !== 'string') {
        errors.push(`Invalid theme: expected a string got ${typeof manifest.overlayTheme}`);
      } else if (!fileRegex.test(manifest.overlayTheme)) {
        errors.push('Invalid theme: unsupported file extension');
      }
    }
    if (![ 'undefined', 'string' ].includes(typeof manifest.discord)) {
      errors.push(`Invalid discord code: expected a string got ${typeof manifest.discord}`);
    }
    if (manifest.plugins !== void 0) {
      if (!Array.isArray(manifest.plugins)) {
        errors.push(`Invalid plugins: expected an array got ${typeof manifest.plugins}`);
      } else {
        manifest.plugins.forEach(p => errors.push(...this._validatePlugin(p)));
      }
    }
    if (manifest.settings !== void 0) {
      errors.push(...this._validateSettings(manifest.settings));
    }


    return errors;
  }

  /**
     *
     * @param {themePlugin} plugin A plugin for a theme
     * @returns {errors[]} Errors in the theme plugin
     */
  _validatePlugin (plugin) {
    const errors = [];
    if (typeof plugin !== 'object') {
      errors.push(`Invalid plugin: expected an object got ${typeof plugin}`);
      return errors;
    }
    if (Array.isArray(plugin)) {
      errors.push('Invalid plugin: expected an object got an array');
      return errors;
    }
    if (typeof plugin.name !== 'string') {
      errors.push(`Invalid plugin name: expected a string got ${typeof plugin.name}`);
    }
    if (typeof plugin.description !== 'string') {
      errors.push(`Invalid plugin description: expected a string got ${typeof plugin.description}`);
    }
    if (![ 'undefined', 'string' ].includes(typeof plugin.author)) {
      errors.push(`Invalid plugin author: expected a string got ${typeof plugin.author}`);
    }
    if (![ 'undefined', 'string' ].includes(typeof plugin.license)) {
      errors.push(`Invalid plugin license: expected a string got ${typeof plugin.license}`);
    }
    if (typeof plugin.file !== 'string') {
      errors.push(`Invalid plugin file: expected a string got ${typeof plugin.file}`);
    } else if (!fileRegex.test(plugin.file)) {
      errors.push('Invalid plugin file: unsupported file extension');
    }
    if (plugin.settings !== void 0) {
      errors.push(...this._validateSettings(plugin.settings));
    }
    return errors;
  }

  /**
     *
     * @param {themePluginSettings} settings Theme plugin settings
     * @returns {errors[]} Errors with the theme plugin's settings
     */
  _validateSettings (settings) {
    const errors = [];
    if (!Array.isArray(settings)) {
      errors.push(`Invalid options: expected an array got ${typeof settings}`);
    } else {
      settings.forEach((o) => errors.push(...this._validateOption(o)));
    }
    return errors;
  }

  /**
     *
     * @param {themePluginOption} option Theme plugin options
     * @returns {errors[]} Errors with the theme plugin option
     */
  _validateOption (option) {
    const errors = [];
    if (typeof option !== 'object') {
      errors.push(`Invalid option: expected an object got ${option}`);
      return errors;
    }
    if (Array.isArray(option)) {
      errors.push('Invalid option: expected an object got an array');
      return errors;
    }
    if (typeof option.name !== 'string') {
      errors.push(`Invalid option name: expected a string got ${typeof option.name}`);
    }
    if (typeof option.variable !== 'string') {
      errors.push(`Invalid option variable: expected a string got ${typeof option.name}`);
    }
    if (option.variable.length === '') {
      errors.push('Invalid option variable: got an empty string');
    }
    if (![ 'undefined', 'string' ].includes(typeof option.description)) {
      errors.push(`Invalid option description: expected a string got ${typeof option.description}`);
    }
    if (typeof option.type !== 'string') {
      errors.push(`Invalid option type: expected a string got ${typeof option.type}`);
    } else if (![ 'string', 'select', 'number', 'color', 'color_alpha', 'url', 'background', 'font' ].includes(option.type)) {
      errors.push(`Invalid option type: "${option.type}" is not a valid option type. Please refer to the documentation.`);
    }
    if (option.type === 'string' && typeof option.limit !== 'undefined') {
      errors.push(...this._validateLimits(option.limit));
    }
    if (option.type === 'select') {
      errors.push(...this._validateSettingsSelect(option));
    }
    if (option.type === 'number') {
      errors.push(...this._validateSettingsNumber(option));
    }
    return errors;
  }

  /**
     *
     * @param {themePluginOptionSelect} option Option for dropdown in theme settings
     * @returns {errors[]} Errors with the theme plugin select option
     */
  _validateSettingsSelect (option) {
    const errors = [];
    if (!Array.isArray(option.options)) {
      errors.push(`Invalid select options: expected an array got ${typeof option.options}`);
    } else {
      option.options.forEach(opt => {
        if (typeof opt !== 'object') {
          errors.push(`Invalid select option: expected an object got ${typeof opt}`);
        } else {
          if (typeof opt.label !== 'string') {
            errors.push(`Invalid select option label: expected a string got ${typeof option.label}`);
          }
          if (typeof opt.value !== 'string') {
            errors.push(`Invalid select option value: expected a string got ${typeof option.name}`);
          }
        }
      });
    }
    return errors;
  }


  /**
     *
     * @param {themePluginSettingsNumber} option
     * @returns {errors[]}
     */
  _validateSettingsNumber (option) {
    const errors = [];
    if (typeof option.limit !== 'undefined') {
      errors.push(...this._validateLimits(option.limit));
    }
    if (typeof option.markers !== 'undefined') {
      if (!Array.isArray(option.markers)) {
        errors.push(`Invalid option markers: expected an array got ${typeof option.markers}`);
      } else if (option.markers.some(m => typeof m !== 'number')) {
        errors.push('Invalid option markers: some entries aren\'t numbers!');
      }
    }
    if (![ 'undefined', 'boolean' ].includes(typeof option.sticky)) {
      errors.push(`Invalid option stickyness: expected a boolean got ${typeof option.sticky}`);
    }
    return errors;
  }

  /**
     *
     * @param {*} limits
     * @returns {errors[]}
     */
  _validateLimits (limits) {
    const errors = [];
    if (!Array.isArray(limits)) {
      errors.push(`Invalid limit value: expected an array got ${typeof limits}`);
    } else if (limits.length !== 2) {
      errors.push(`Invalid limit value: expected two values, got ${limits.length}`);
    } else if (typeof limits[0] !== 'number' || typeof limits[1] !== 'number') {
      errors.push(`Invalid limit value: expected the values to be numbers, got [${typeof limits[0]}, ${typeof limits[1]}]`);
    } else if (limits[0] > limits[1]) {
      errors.push('Invalid limit value: minimum is greater than maximum');
    }
    return errors;
  }
};
