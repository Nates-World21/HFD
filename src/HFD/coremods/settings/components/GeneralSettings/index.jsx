const { React } = require('hfd/webpack');
const { ButtonItem, Category } = require('hfd/components/settings');
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
    const { getSetting, toggleSetting } = this.props;

    return (
      <div>
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
