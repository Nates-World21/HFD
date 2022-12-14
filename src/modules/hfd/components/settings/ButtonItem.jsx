const { getModule, getModuleByDisplayName, React } = require('hfd/webpack');
const { Divider } = require('hfd/components');
const AsyncComponent = require('../AsyncComponent');

const DFormItem = AsyncComponent.from(getModuleByDisplayName('FormItem'));
const FormText = AsyncComponent.from(getModuleByDisplayName('FormText'));
const Tooltip = AsyncComponent.from(getModuleByDisplayName('Tooltip'));

let classes = {
  initialized: false,
  flexClassName: '',
  classMargins: {},
  classDivider: '',
  classDividerDef: '',
  classesLabel: {}
};

module.exports = class ButtonItem extends React.PureComponent {
  constructor () {
    super();

    this.state = { classes };
  }

  async componentDidMount () {
    if (classes.initialized) {
      return;
    }

    const Flex = await getModuleByDisplayName('Flex');
    classes = {
      initialized: true,

      flexClassName: `${Flex.Direction.VERTICAL} ${Flex.Justify.START} ${Flex.Align.STRETCH} ${Flex.Wrap.NO_WRAP}`,
      classMargins: await getModule([ 'marginSmall' ]),
      classDescription: (await getModule([ 'formText', 'description' ])).description,
      classesLabel: (await getModule([ 'labelRow' ]))
    };

    this.setState({ classes });
  }

  render () {
    const { Button } = require('..');
    return <DFormItem
      className={`hfd-settings-item hfd-buttonitem ${this.state.classes.flexClassName} ${this.state.classes.classMargins.marginBottom20}`}>
      <div className='hfd-settings-item-title'>
        <div>
          <div className={this.state.classes.classesLabel.labelRow}>
            <label class={this.state.classes.classesLabel.title}>{this.props.children}</label>
          </div>
          <FormText className={this.state.classes.classDescription}>
            {this.props.note}
          </FormText>
        </div>
        <Tooltip
          text={this.props.tooltipText}
          position={this.props.tooltipPosition}
          shouldShow={Boolean(this.props.tooltipText)}
        >
          {() => (
            <Button
              color={this.props.success ? Button.Colors.GREEN : this.props.color || Button.Colors.BRAND}
              disabled={this.props.disabled}
              onClick={() => this.props.onClick()}
              style={{ marginLeft: 5 }}
            >
              {this.props.button}
            </Button>
          )}
        </Tooltip>
      </div>
      <Divider />
    </DFormItem>;
  }
};
