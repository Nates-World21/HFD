const { React } = require('hfd/webpack');
const AsyncComponent = require('./AsyncComponent');

const Switch = AsyncComponent.fromDisplayName('Switch');

module.exports = React.memo(
  (props) => {
    // Compatibility for legacy syntax
    if (props.onChange && !props.__newOnChange) {
      const fn = props.onChange;
      props.onChange = (checked) => fn({ target: { checked } });
    }
    if (props.checked === void 0) {
      props.checked = props.value;
    }
    return <Switch {...props}/>;
  }
);
