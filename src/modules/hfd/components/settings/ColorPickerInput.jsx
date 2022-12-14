const { React, getModule, getModuleByDisplayName, constants: { DEFAULT_ROLE_COLOR, ROLE_COLORS } } = require('hfd/webpack');
const AsyncComponent = require('../AsyncComponent');
const ColorPicker = require('../ColorPicker');
const FormItem = require('./FormItem');

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));
const Slider = AsyncComponent.from(getModuleByDisplayName('Slider'));

class ColorPickerInput extends React.PureComponent {
  constructor (props) {
    super(props);
    const color = props.value || props.default || 0;
    const alpha = (color >> 24) & 255;
    this.state = {
      solid: color - alpha,
      alpha
    };
  }

  render () {
    // eslint-disable-next-line no-unused-vars
    const { children: title, note, required, default: def, defaultColors, value, disabled, transparency } = this.props;
    delete this.props.children;

    return (
      <FormItem title={title} note={note} required={required} noteHasMargin>
        <ColorPicker
          colors={defaultColors || ROLE_COLORS}
          defaultColor={typeof def === 'number' ? def : DEFAULT_ROLE_COLOR}
          onChange={s => this.props.onChange(s)}
          disabled={disabled}
          value={value}
        />
        {transparency && this.renderOpacity()}
      </FormItem>
    );
  }

  renderOpacity () {
    const { marginTop8, marginTop20 } = getModule([ 'marginSmall' ], false);
    return (
      <>
        <FormTitle className={marginTop8}>Opacity</FormTitle>
        <Slider
          initialValue={100}
          className={marginTop20}
          defaultValue={this.state.alpha / 255 * 100}
          markers={[ 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ]}
          onValueChange={a => this.handleChange(this.state.solid, a / 100 * 255)}
          onMarkerRender={s => `${s}%`}
        />
      </>
    );
  }

  handleChange (solid, alpha) {
    this.props.onChange(solid + (alpha << 24));
  }
}

module.exports = ColorPickerInput;
