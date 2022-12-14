const { getModuleByDisplayName, React } = require('hfd/webpack');
const AsyncComponent = require('../AsyncComponent');
const FormItem = require('./FormItem.jsx');

const Input = AsyncComponent.from(getModuleByDisplayName('TextInput'));

module.exports = class TextInput extends React.PureComponent {
  render () {
    const { children: title, note, required } = this.props;
    delete this.props.children;

    return (
      <FormItem title={title} note={note} required={required} noteHasMargin>
        <Input {...this.props} />
      </FormItem>
    );
  }
};
