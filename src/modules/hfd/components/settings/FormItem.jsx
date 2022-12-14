const { getModule, getModuleByDisplayName, React } = require('hfd/webpack');
const AsyncComponent = require('../AsyncComponent');
const Divider = require('../Divider');

const DFormItem = AsyncComponent.from(getModuleByDisplayName('FormItem'));
const FormText = AsyncComponent.from(getModuleByDisplayName('FormText'));

const Flex = getModuleByDisplayName('Flex', false);
const margins = getModule([ 'marginSmall' ], false);
const { description } = getModule([ 'formText', 'description' ], false);

module.exports = class FormItem extends React.PureComponent {
  render () {
    const noteClasses = [ description, this.props.noteHasMargin && margins.marginTop8 ].filter(Boolean).join(' ');
    return (
      <DFormItem
        title={this.props.title}
        required={this.props.required}
        className={`${Flex.Direction.VERTICAL} ${Flex.Justify.START} ${Flex.Align.STRETCH} ${Flex.Wrap.NO_WRAP} ${margins.marginBottom20}`}
      >
        {this.props.children}
        {this.props.note && <FormText className={noteClasses}>{this.props.note}</FormText>}
        <Divider/>
      </DFormItem>
    );
  }
};
