const { getModule, getModuleByDisplayName, React } = require('hfd/webpack');
const AsyncComponent = require('../AsyncComponent');
const FormItem = require('./FormItem.jsx');

const Slider = AsyncComponent.from(getModuleByDisplayName('Slider'));
const { marginTop20 } = getModule([ 'marginSmall' ], false);

module.exports = class SliderInput extends React.PureComponent {
  render () {
    const { children: title, note, required } = this.props;
    delete this.props.children;

    return (
      <FormItem title={title} note={note} required={required}>
        <Slider {...{
          ...this.props,
          className: `${this.props.className || ''} ${marginTop20}`.trim()
        }} />
      </FormItem>
    );
  }
};
