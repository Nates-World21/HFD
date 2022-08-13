const { resolveCompiler } = require('hfd/compilers');
const { createElement } = require('hfd/util');

const Updatable = require('./Updatable');

class Theme extends Updatable {
  constructor (themeID, manifest) {
    const styleManager = typeof hfd !== 'undefined' ? hfd.styleManager : global.sm;
    super(styleManager.themesDir, themeID);
    this.compiler = resolveCompiler(manifest.effectiveTheme);
    this.manifest = manifest;
    this.applied = false;
    this.settingsApplied = false;
  }

  apply () {
    if (!this.applied) {
      this.applied = true;
      const style = createElement('style', {
        id: `theme-${this.entityID}`,
        'data-hfd': true,
        'data-theme': true
      });

      document.head.appendChild(style);
      this._doCompile = async () => {
        style.innerHTML = await this.compiler.compile();
      };

      this.compiler.enableWatcher();
      this.compiler.on('src-update', this._doCompile);
      return this._doCompile();
    }
  }

  remove () {
    if (this.applied) {
      this.applied = false;
      this.compiler.off('src-update', this._doCompile);
      document.getElementById(`theme-${this.entityID}`).remove();
      this.compiler.disableWatcher();
    }
  }
}

module.exports = Theme;
