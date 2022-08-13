const { React } = require('hfd/webpack');
const { loadStyle, unloadStyle } = require('../util');
const { join } = require('path');

const Themes = require('./components/manage/Themes');


module.exports = async function () {
  // start
  const styleId = loadStyle(join(__dirname, 'scss', 'style.scss'));


  hfd.api.settings.registerSettings('module-manager-themes', {
    category: this.entityID,
    label: () => 'Themes',
    render: (props) => React.createElement(Themes, {
      openPopout: () => this._openQuickCSSPopout(),
      ...props
    })
  });
  return () => {
    unloadStyle(styleId);
  };
};
