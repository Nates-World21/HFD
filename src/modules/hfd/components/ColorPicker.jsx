const { getModuleByDisplayName } = require('hfd/webpack');
const { findInReactTree, wrapInHooks } = require('hfd/util');
const AsyncComponent = require('./AsyncComponent');

module.exports = AsyncComponent.from(
  (async () => {
    const GuildSettingsRolesEditDisplay = await getModuleByDisplayName('GuildSettingsRolesEditDisplay');
    const SettingsPageContent = wrapInHooks(() => new GuildSettingsRolesEditDisplay({ guild: { id: '' },
      role: { id: '' } }))();
    const ColorPickerFormItem = findInReactTree(SettingsPageContent, (n) => n.type?.displayName === 'ColorPickerFormItem').type({ role: { id: '' } });
    const SuspendedPicker = findInReactTree(ColorPickerFormItem, (n) => n.props?.defaultColor).type;
    // eslint-disable-next-line new-cap
    const LazyWebpackModule = await SuspendedPicker().props.children.type;
    const mdl = await (LazyWebpackModule._ctor || LazyWebpackModule._payload._result)();

    return mdl.default;
  })()
);
