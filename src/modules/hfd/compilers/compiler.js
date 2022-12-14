const Events = require('events');
const { join } = require('path');
const watch = require('node-watch');
const { createHash } = require('crypto');
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const { CACHE_FOLDER } = require('../constants');


/**
 * Main class for compilers used in HFD.
 *
 * If using the watcher, MAKE SURE TO DISPOSE OF THE COMPILER PROPERLY. You **MUST** disable
 * the watcher if you no longer need the compiler. When watch events are emitted, the compiler
 * should be re-used if a recompile is performed.
 *
 * @property {String} file File to compile
 * @property {String} cacheDir Path where cached files will go
 * @property {String} watcherEnabled Whether the file watcher is enabled or not
 * @abstract
 */
class Compiler extends Events {
  constructor (file) {
    super();
    this.file = file;
    this.cacheDir = join(CACHE_FOLDER, this.constructor.name.toLowerCase());
    this.watcherEnabled = false;
    this._watchers = {};
    this._compiledOnce = {};

    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Enables the file watcher. Will emit "src-update" event if any of the files are updated.
   */
  enableWatcher () {
    this.watcherEnabled = true;
  }

  /**
   * Disables the file watcher. MUST be called if you no longer need the compiler and the watcher
   * was previously enabled.
   */
  disableWatcher () {
    this.watcherEnabled = false;
    Object.values(this._watchers).forEach(w => w.close());
    this._watchers = {};
  }

  /**
   * Arbitrary configuration for the compiler. Useless if not implemented in the _compile method.
   * *NOTE*: Will fire "src-update" if the watcher is enabled and at least one compilation has been performed.
   * @param {Object} options Options for the compiler
   */
  setCompileOptions (options) {
    // @todo: finish this
    this.compileOptions = options;
  }

  /**
   * Compiles the file (if necessary), and perform cache-related operations.
   * @returns {Promise<String>|String} Compilation result
   */
  compile () {
    // Attemt to fetch from cache
    const cacheKey = this.computeCacheKey();
    if (cacheKey instanceof Promise) {
      return cacheKey.then(key => this._doCompilation(key));
    }
    return this._doCompilation(cacheKey);
  }

  /** @private */
  _doCompilation (cacheKey) {
    let cacheFile;
    if (cacheKey) {
      cacheFile = join(this.cacheDir, cacheKey);
      if (existsSync(cacheFile)) {
        const compiled = readFileSync(cacheFile, 'utf8');
        this._finishCompilation(null, compiled);
        return compiled;
      }
    }

    // Perform compilation
    const compiled = this._compile();
    if (compiled instanceof Promise) {
      return compiled.then(finalCompiled => {
        this._finishCompilation(cacheFile, finalCompiled);
        return finalCompiled;
      });
    }
    this._finishCompilation(cacheFile, compiled);
    return compiled;
  }

  /** @private */
  _finishCompilation (cacheFile, compiled) {
    if (cacheFile) {
      writeFileSync(cacheFile, compiled, () => void 0);
    }
    if (this.watcherEnabled) {
      this._watchFiles();
    }
  }

  /** @private */
  async _watchFiles () {
    const files = await this.listFiles();
    // Filter no longer used watchers
    Object.keys(this._watchers).forEach(k => {
      if (!files.includes(k)) {
        this._watchers[k].close();
        delete this._watchers[k];
      }
    });

    // Add new watchers
    files.forEach(f => {
      if (!this._watchers[f]) {
        this._watchers[f] = watch(f, () => this.emit('src-update'));
      }
    });
  }

  /**
   * Lists all files involved during the compilation (parent file + imported files)
   * Only applicable if files are concatenated during compilation (e.g. scss files)
   * @returns {Promise<String[]>|String[]}
   */
  listFiles () {
    return [ this.file ];
  }

  /**
   * Computes the hash corresponding to the file we're compiling.
   * MUST take into account imported files (if any) and always return the same hash for the same given file.
   * @returns {Promise<String|null>|String|null} Cache key, or null if cache isn't available
   */
  computeCacheKey () {
    const files = this.listFiles();
    if (files instanceof Promise) {
      return files.then(this._computeCacheKey.bind(this));
    }
    return this._computeCacheKey(files);
  }

  /** @private */
  _computeCacheKey (files) {
    const hashes = files.map(this.computeFileHash.bind(this));
    if (hashes.length === 1) {
      return hashes[0];
    }
    const hash = createHash('sha1');
    hashes.forEach(h => hash.update(h));
    return hash.digest('hex');
  }

  /**
   * Computes the hash of a given file
   * @param {String} file File path
   */
  computeFileHash (file) {
    if (!existsSync(file)) {
      throw new Error('File doesn\'t exist!');
    }

    const fileBuffer = readFileSync(file);
    return createHash('sha1')
      .update(this._metadata)
      .update(fileBuffer)
      .digest('hex');
  }

  /**
   * Compiles the file. Should NOT perform any cache-related actions
   * @returns {Promise<String>} Compilation results.
   */
  _compile () {
    throw new Error('Not implemented');
  }

  /**
   * @returns {String} Compiler metadata (compiler used, version)
   */
  get _metadata () {
    return '';
  }
}

module.exports = Compiler;
