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
      this.updateAndApplySettings();
      return this._doCompile();
    }
  }

  updateAndApplySettings () {
    console.log('running func');
    if (!this.settingsApplied) {
      console.log('applied thing');
      this.settingsApplied = true;
      const themeSettings = hfd.api.settings._fluxProps(`theme-${this.manifest.name}`).settings;

      let rootStyle = ':root {\n';

      for (const setting of this.manifest.settings.options) {
        if (themeSettings[setting.variable]) {
          if (setting.type === 'color') {
            rootStyle += `${setting.variable}: ${parseInt(themeSettings[setting.variable], 16)}\n`;
          }
        }
      }

      rootStyle += '}';

      const appendStyle = () => {
        const style = document.createElement('style');
        style.id = `hfd-${this.manifest.name}-settings`;
        style.dataset.hfd = true;
        style.innerHTML = rootStyle;
        document.head.appendChild(style);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', appendStyle);
      } else {
        appendStyle();
      }
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
