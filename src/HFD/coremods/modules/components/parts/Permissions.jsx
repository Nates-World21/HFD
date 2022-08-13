const { React } = require('hfd/webpack');
const {
  FormTitle,
  Icons: {
    Keyboard,
    PersonShield,
    Copy,
    ImportExport
  }
} = require('hfd/components');

const perms = {
  keypresses: {
    icon: ({ svgSize }) => <Keyboard width={svgSize} height={svgSize}/>,
    text: () => 'Listen to keypresses'
  },
  use_eud: {
    icon: ({ svgSize }) => <PersonShield width={svgSize} height={svgSize}/>,
    text: () => 'Collect and use your data'
  },
  filesystem: {
    icon: ({ svgSize }) => <Copy width={svgSize} height={svgSize}/>,
    text: () => 'Read and write files on your computer'
  },
  ext_api: {
    icon: ({ svgSize }) => <ImportExport width={svgSize} height={svgSize}/>,
    text: () => 'Perform requests to remote services'
  }
};

module.exports = ({ permissions, svgSize }) => (
  <div className='hfd-product-permissions'>
    <FormTitle>Permissions</FormTitle>
    {Object.keys(perms).map(perm => permissions.includes(perm) &&
      <div className='item'>
        {React.createElement(perms[perm].icon, { svgSize })} {perms[perm].text()}
      </div>)}
  </div>
);
