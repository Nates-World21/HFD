const { getModuleByDisplayName } = require('hfd/webpack');
const AsyncComponent = require('../AsyncComponent');

require('fs')
  .readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file !== '.DS_Store')
  .forEach(filename => {
    const moduleName = filename.split('.')[0];
    exports[moduleName] = require(`${__dirname}/${filename}`);
  });

// Add some util components
Object.assign(exports, {
  SwitchItem: AsyncComponent.from(getModuleByDisplayName('SwitchItem'))
});

// Re-export module properties
(async () => {
  const SwitchItem = await getModuleByDisplayName('SwitchItem', true, true);
  [ 'Sizes', 'Themes' ].forEach(prop => exports.SwitchItem[prop] = SwitchItem[prop]);
})();
