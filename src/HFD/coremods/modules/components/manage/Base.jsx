const { join } = require('path');
const { shell } = require('electron');
const {
  React,
  getModule,
  contextMenu
} = require('hfd/webpack');
const {
  ContextMenu,
  Divider,
  Icons: { Overflow }
} = require('hfd/components');
const { TextInput } = require('hfd/components/settings');

class Base extends React.Component {
  constructor () {
    super();

    this.state = {
      key: this.constructor.name.toUpperCase(),
      search: ''
    };
  }

  render () {
    return (
      <div className='hfd-entities-manage hfd-text'>
        <div className='hfd-entities-manage-header'>
          {this.renderHeader()}
          {this.renderButtons()}
        </div>
        <Divider />
        {this.renderBody()}
      </div>
    );
  }

  renderHeader () {
    return (
      <span>Installed {this.state.key.toLowerCase()}</span>
    );
  }

  renderButtons () {
    return (
      <div className='buttons'>
        {/* {hfd.api.labs.isExperimentEnabled('module-manager-store')
          ? <Button onClick={() => this.goToStore()}>Explore {this.state.key.split('')[0] + this.state.key.slice(1)} Store</Button>
          : <Tooltip text='Store coming soon'>
            <Button disabled>Expore {this.state.key.split('')[0] + this.state.key.slice(1)} Store</Button>
          </Tooltip>
        } */}
        <Overflow onClick={(e) => this.openOverflowMenu(e)} onContextMenu={(e) => this.openOverflowMenu(e)} />
      </div>
    );
  }

  renderBody () {
    const items = this.getItems();

    return (
      <div className='hfd-entities-manage-items'>
        {this.renderSearch()}
        {items.length === 0
          ? <div className='empty'>
            <div className='emptyStateImage-21OKoR' />
            <p>No results</p>
          </div>
          : items.map((item) => this.renderItem(item))}
      </div>
    );
  }

  renderSearch () {
    return (
      <div clasName='hfd-entities-manage-search'>
        <TextInput
          value={this.state.search}
          onChange={(search) => this.setState({ search })}
          placeholder='What are you looking for?'
        >
                    Search {this.state.key.split('')[0] + this.state.key.slice(1)}s...
        </TextInput>
      </div>
    );
  }

  renderItem () {
    return null;
  }

  getItems () {
    return [];
  }

  openOverflowMenu (e) {
    contextMenu.openContextMenu(e, () =>
      React.createElement(ContextMenu, {
        width: '50px',
        itemGroups: [ [
          {
            type: 'button',
            name: `Open ${this.state.key.toLowerCase()} folder.`,
            onClick: () => shell.openPath(join(__dirname, '..', '..', '..', '..', '..', this.constructor.name.toLowerCase()))
          },
          {
            type: 'button',
            name: `Load missing ${this.state.key.toLowerCase()}`
          }
        ] ]
      })
    );
  }

  async goToStore () {
    const popLayer = await getModule([ 'popLayer' ]);
    const { transitionTo } = await getModule([ 'transitionTo' ]);
    popLayer();
    transitionTo(`/_hfd/store/${this.constructor.name.toLowerCase()}`);
  }

  fetchMissing () {
    throw new Error('not implemented');
  }

  _sortItems (items) {
    if (this.state.search !== '') {
      const search = this.state.search.toLowerCase();
      items = items.filter((p) =>
        p.manifest?.name?.toLowerCase()?.includes(search) ||
                p.manifest?.author?.toLowerCase()?.includes(search) ||
                p.manifest?.descrition?.toLowerCase()?.includes(search)
      );
    }

    return items.sort((a, b) => {
      const nameA = a.manifest.name.toLowerCase();
      const nameB = b.manifest.name.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }

      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });
  }
}


module.exports = Base;
