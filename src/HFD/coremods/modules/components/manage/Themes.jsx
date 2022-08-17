const { React, getModule } = require('hfd/webpack');
const { TabBar } = require('hfd/components');
const { open: openModal, close: closeModal } = require('hfd/modal');
const { Card, Divider } = require('hfd/components');
const { Category } = require('hfd/components/settings');

const Base = require('./Base');
const InstalledProduct = require('../parts/InstalledProduct');
const ThemeSettings = require('./ThemeSettings');

class InstalledTheme extends InstalledProduct {
  constructor (props) {
    super(props);

    this.state = {
      ...super.state,
      dropdownOpened: false
    };
  }

  render () {
    return (
      <Card className='hfd-product'>
        {this.renderHeader()}
        {this.renderDetails()}
        {this.renderPermissions()}
        {this.renderSettings()}
        {this.renderFooter()}
      </Card>
    );
  }

  renderSettings () {
    const { product } = this.props;

    const doSettingsRender = hfd.api.settings._fluxProps('general').getSetting('theme-location', 'cards') === 'cards';
    if (!doSettingsRender) {
      return null;
    }

    if (product.settings.length > 0 || product.plugins.length > 0) {
      return (
        <>
          <Divider />
          <Category
            name='Theme Settings'
            description='Change how your theme looks!'
            opened={this.state.dropdownOpened}
            onChange={() => this.setState({ dropdownOpened: !this.state.dropdownOpened })}
          >
            {<ThemeSettings theme={this.props.entityID} />}
          </Category>
        </>
      );
    }

    return null;
  }
}

module.exports = class Themes extends Base {
  constructor () {
    super();

    this.state = {
      ...this.state,
      tab: 'INSTALLED'
    };
  }

  render () {
    const { topPill, item } = getModule([ 'topPill' ], false);

    return (
      <>
        <div className='hfd-entities-manage-tabs'>
          <TabBar
            selectedItem={this.state.tab}
            onItemSelect={(tab) => this.setState({ tab })}
            type={topPill}
          >
            <TabBar.Item className={item} selectedItem={this.state.tab} id='INSTALLED'>
              Installed Themes
            </TabBar.Item>
          </TabBar>
        </div>
        {this.renderTab(this.state.tab)}
      </>
    );
  }

  renderTab (tab) {
    switch (tab) {
      case 'INSTALLED':
        return super.render();
      default:
        return null;
    }
  }

  renderItem (item) {
    return (
      <InstalledTheme
        product={item.manifest}
        entityID={item.entityID}
        isEnabled={hfd.styleManager.isEnabled(item.entityID)}
        onToggle={async (v) => {
          await this._toggle(item.entityID, v);
          this.forceUpdate();
        }}
        onUninstall={() => this._uninstall(this.entityID)}
      />
    );
  }

  _toggle (themeID, enabled) {
    if (!enabled) {
      hfd.styleManager.disable(themeID);
    } else {
      hfd.styleManager.enable(themeID);
    }
  }

  async fetchMissing () {
    await hfd.styleManager.loadThemes(true);
  }

  getItems () {
    return this._sortItems([ ...hfd.styleManager.themes.values() ]);
  }

  _uninstall (themeID) {
    const themes = [ themeID ];

    openModal(() => {
      <Confirm
        red
        header='Uninstall Theme'
        confirmText='Uninstall Theme'
        cancelText='Cancel'
        onConfirm={async () => {
          for (const theme of themes) {
            try {
              await hfd.styleManager.uninstall(theme);
            } catch (err) {
              console.error(err);
            }
          }

          closeModal();
          this.forceUpdate();
        }}
      >
        <div className='hfd-products-modal'>
          <span>Are you sure you want to uninstall this theme?</span>
          <ul>
            {themes.map((p) => <li key={p}>{hfd.styleManager.get(p)?.manifest?.name}</li>)}
          </ul>
        </div>
      </Confirm>;
    });
  }
};
