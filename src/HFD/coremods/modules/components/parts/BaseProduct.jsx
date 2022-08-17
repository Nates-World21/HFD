const {
  React,
  getModule,
  constants: {
    Routes
  }
} = require('hfd/webpack');
const {
  Tooltip,
  Clickable,
  Divider,
  Button,
  Icons: {
    Discord
  }
} = require('hfd/components');

const Details = require('./Details');
const Permissions = require('./Permissions');

class BaseProduct extends React.PureComponent {
  renderDetails () {
    const { product } = this.props;
    return (
      <>
        <Divider />
        <Details
          svgSize={24}
          author={product.author}
          version={product.version}
          description={product.description}
          license={product.description}
        />
      </>
    );
  }

  renderPermissions () {
    const { product } = this.props;
    const hasPermissions = product.permissions && product.permissions.length > 0;

    if (!hasPermissions) {
      return null;
    }

    return (
      <>
        <Divider />
        <Permissions svgSize={22} permissions={product.permissions} />
      </>
    );
  }

  renderFooter () {
    const { product } = this.props;

    if (!product.discord && this.props.goToSettings !== 'function' && typeof this.props.onUninstall !== 'function') {
      return null;
    }

    return (
      <>
        <div className='hfd-product-footer'>
          {product.discord &&
            <Tooltip text='Go to their Discord support server'>
              <Clickable onClick={() => this.goToDiscord(product.discord)}>
                <Discord />
              </Clickable>
            </Tooltip>}
          <div className='buttons'>
            {typeof this.props.goToSettings === 'function' &&
                <Button
                  onClick={() => this.props.goToSettings()}
                  color={Button.Colors.BLUE}
                  look={Button.Looks.FILLED}
                  size={Button.Sizes.SMALL}
                >
                  Go to Settings
                </Button>
            }
            {typeof this.props.onUninstall === 'function' &&
                <Button
                  onClick={() => this.props.onUninstall()}
                  color={Button.Colors.RED}
                  look={Button.Looks.FILLED}
                  size={Button.Sizes.SMALL}
                >
                    Uninstall
                </Button>}
          </div>
        </div>
      </>
    );
  }

  async goToDiscord (code) {
    const inviteLocalStore = await getModule([ 'getInvite' ]);
    const inviteRemoteStore = await getModule([ 'resolveInvite' ]);
    const guildsStore = await getModule([ 'getGuilds' ]);

    let invite = inviteLocalStore.getInvite(code);

    if (!invite) {
      // eslint-disable-next-line prefer-destructuring
      invite = (await inviteRemoteStore.resolveInvite(code)).invite;
    }

    if (guildsStore.getGuilds()[invite.guild.id]) {
      const channel = await getModule([ 'getLastSelectedChannelId' ]);
      const router = await getModule([ 'transitionTo' ]);

      // eslint-disable-next-line new-cap
      router.transitionTo(Routes.CHANNEL(invite.guild.id, channel.getChannelId(invite.guild.id)));
    } else {
      const windowManager = await getModule([ 'flashFrame', 'minimize' ]);
      const { INVITE_BROWSER: { handler: popInvite } } = await getModule([ 'INVITE_BROWSER' ]);
      const oldMinimize = windowManager.minimize;

      windowManager.minimize = () => void 0;
      popInvite({ args: { code } });
      windowManager.minimize = oldMinimize;
    }
  }
}

module.exports = BaseProduct;
