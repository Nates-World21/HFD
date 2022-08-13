const { React, Flux, getModule, getModuleByDisplayName } = require('hfd/webpack');
const { TabBar, Divider, AsyncComponent } = require('hfd/components');

const InstalledProduct = require('../parts/InstalledProduct');
const ThemeField = require('./ThemeField');

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));

class ThemeSettings extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      errors: {},
      theme: hfd.styleManager.get(props.theme),
      tab: 'SETTINGS'
    };
  }

  render () {
    const { theme } = this.state;
    if (!theme) {
      console.log('No theme');
      return this.renderWtf();
    }
    const { manifest: { name, plugins } } = theme;
    const settings = this.getApplicableSettings();
    const hasSettings = settings && settings.length !== 0;
    const hasPlugins = plugins && plugins.length !== 0;
    const hasBoth = hasSettings && hasPlugins;
    if (!hasSettings && !hasPlugins) {
      console.log('No settings or plugins');
      return this.renderWtf();
    }

    return (
      <div className='hfd-entities-manage hfd-text'>
        <div className='hfd-entities-manage-header'>
          <span>{name}</span>
        </div>
        <Divider/>
        {hasBoth && this.renderTopPills()}
        {((hasBoth && this.state.tab === 'SETTINGS') || (!hasBoth && hasSettings)) && this.renderSettings(settings)}
        {((hasBoth && this.state.tab === 'PLUGINS') || (!hasBoth && hasPlugins)) && this.renderPlugins()}
      </div>
    );
  }

  renderTopPills () {
    const { topPill, item } = getModule([ 'topPill' ], false);
    return (
      <div className='hfd-entities-manage-tabs'>
        <TabBar
          selectedItem={this.state.tab}
          onItemSelect={tab => this.setState({ tab })}
          type={topPill}
        >
          <TabBar.Item className={item} selectedItem={this.state.tab} id='SETTINGS'>
            Theme Settings
          </TabBar.Item>
          <TabBar.Item className={item} selectedItem={this.state.tab} id='PLUGINS'>
            CSS Plugins
          </TabBar.Item>
        </TabBar>
      </div>
    );
  }

  renderSettings (settings) {
    return settings.map(setting => this.renderSettingsGroup(setting.name, setting.options));
  }

  renderSettingsGroup (groupName, options) {
    return (
      <div className='hfd-entities-settings-group' key={groupName}>
        <FormTitle tag='h2'>{groupName}</FormTitle>
        {options.map(opt => (
          <ThemeField
            option={opt}
            key={opt.variable}
            value={this.props.getSetting(opt.variable)}
            onChange={v => {
              this.props.updateSetting(opt.variable, v);
              this.applySettings();
            }}
          />
        ))}
      </div>
    );
  }


  renderPlugins () {
    const { manifest: { author, version, license, plugins } } = this.state.theme;
    if (plugins.length === 0) {
      console.log('No plugins');
      return this.renderWtf();
    }
    return plugins.map(plugin => (
      <InstalledProduct
        isEnabled={this.props.getSetting('_enabledPlugins', []).includes(plugin.file)}
        product={{
          name: plugin.name,
          description: plugin.description,
          author: plugin.author || author,
          version: plugin.version || version,
          license: plugin.license || license
        }}
        onToggle={v => {
          const enabled = this.props.getSetting('_enabledPlugins', []);
          if (v) {
            this.props.updateSetting('_enabledPlugins', enabled.concat(plugin.file));
          } else {
            this.props.updateSetting('_enabledPlugins', enabled.filter(e => e !== plugin.file));
          }
        }}
      />
    ));
  }

  renderWtf () {
    return (
      <div
        style={{
          fontSize: 69,
          marginTop: 69,
          textAlign: 'center',
          fontFamily: '"Comic Sans MS", "Comic Sans", cursive'
        }}
      >
        Something went wrong here.
      </div>
    );
  }

  getApplicableSettings () {
    const settings = [];
    if (this.state.theme.manifest.settings) {
      settings.push({
        name: 'Theme Settings',
        options: this.state.theme.manifest.settings.options
      });
    }
    for (const plugin of this.state.theme.manifest.plugins.filter(p => p.settings)) {
      if (this.props.getSetting('_enabledPlugins', []).includes(plugin.file)) {
        settings.push({
          name: plugin.name,
          options: plugin.settings.options
        });
      }
    }
    return settings;
  }

  applySettings () {
    this.state.theme.updateAndApplySettings();
  }
}

module.exports = Flux.connectStores(
  [ hfd.api.settings.store ],
  ({ theme }) => ({
    ...hfd.api.settings._fluxProps(`theme-${theme}`)
  })
)(ThemeSettings);
