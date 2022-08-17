const { React } = require('hfd/webpack');
const {
  ButtonItem,
  Category,
  SelectInput
} = require('hfd/components/settings');
const { CACHE_FOLDER } = require('hfd/constants');
const { rmdirRf } = require('hfd/util');

module.exports = class GeneralSettings extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      discordCleared: false,
      hfdCleared: false
    };
  }

  render () {
    const { getSetting, toggleSetting, updateSetting } = this.props;

    return (
      <div>
        <SelectInput
          note='Where theme settings should be put'
          value={getSetting('theme-location', 'cards')}
          placeholder={getSetting('theme-location', 'cards')}
          onChange={opt => updateSetting('theme-location', opt.value)}
          options={[
            {
              label: 'Theme Cards',
              value: 'cards'
            },
            {
              label: 'Settings Bar',
              value: 'tabs'
            }
          ]}
          clearable
        >
          Theme setting location
        </SelectInput>
        <Category
          name='Advanced Settings'
          description={'Don\'t touch stuff in here if you don\'t know what you\'re doing.'}
          opened={getSetting('advancedSettings', false)}
          onChange={() => toggleSetting('advancedSettings')}
        >
          <ButtonItem
            note={'Clears HFD\'s cache.'}
            button={this.state.hfdCleared ? 'Cache cleared!' : 'Clear HFD\'s Cache'}
            success={this.state.hfdCleared}
            onClick={() => this.clearHfdCache()}
          >
                        Clear HFD's Cache
          </ButtonItem>
          <ButtonItem
            note={'Removes everything stored in Discord\'s cache folder.'}
            button={this.state.discordCleared ? 'Cache cleared!' : 'Clear Discord\'s Cache'}
            success={this.state.discordCleared}
            onClick={() => this.clearDiscordCache()}
          >
                        Clear Discord's Cache
          </ButtonItem>
        </Category>
      </div >
    );
  }

  clearDiscordCache () {
    this.setState({ discordCleared: true });
    HfdNative.clearCache().then(() => {
      setTimeout(() => {
        this.setState({ discordCleared: false });
      }, 2500);
    });
  }

  clearHfdCache () {
    this.setState({ hfdCleared: true });
    rmdirRf(CACHE_FOLDER).then(() =>
      setTimeout(() => {
        this.setStae({ hfdCleared: false });
      }, 2500)
    );
  }
};
