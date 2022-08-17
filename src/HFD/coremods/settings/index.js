const { React, getModuleByDisplayName } = require('hfd/webpack');
const { AsyncComponent } = require('hfd/components');
const { after } = require('hfd/injector');
const { join } = require('path');

const { loadStyle, unloadStyle } = require('../util');

const ErrorBoundary = require('./components/ErrorBoundary');
const GeneralSettings = require('./components/GeneralSettings');

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));
const FormSection = AsyncComponent.from(getModuleByDisplayName('FormSection'));

function renderWrapper (label, Component) {
  return React.createElement(ErrorBoundary, null,
    React.createElement(FormSection, {},
      React.createElement(FormTitle, { tag: 'h2' }, label),
      React.createElement(Component)
    )
  );
}

function makeSettingsSection (tab) {
  const props = hfd.api.settings.tabs[tab];
  const label = typeof props.label === 'function' ? props.label() : props.label;

  return {
    label,
    section: tab,
    element: () => renderWrapper(label, props.render)
  };
}


async function patchSettingsComponent () {
  const SettingsView = await getModuleByDisplayName('SettingsView');

  after('getPredicateSections', SettingsView.prototype, (_, sections) => {
    if (sections.length < 10) {
      return sections;
    }
    const changelog = sections.find(c => c.section === 'changelog');

    if (changelog) {
      const coremodSettings = [ 'module-manager-themes', 'general' ];

      const hfdSettings = Object.keys(hfd.api.settings.tabs)
        .filter((s) => coremodSettings.includes(s))
        .map((s) => makeSettingsSection(s));

      sections.splice(
        sections.indexOf(changelog),
        0,
        {
          section: 'HEADER',
          label: 'HFD'
        },
        ...hfdSettings,
        { section: 'DIVIDER' }
      );

      const pluginSettings = Object.keys(hfd.api.settings.tabs)
        .filter((s) => !coremodSettings.includes(s))
        .map((s) => makeSettingsSection(s));
      if (pluginSettings.length > 0) {
        sections.splice(
          sections.indexOf(changelog),
          0,
          {
            section: 'HEADER',
            label: 'Plugin Settings'
          },
          ...pluginSettings,
          { section: 'DIVIDER' }
        );
      }
    }
    return sections;
  });
}

module.exports = async function () {
  const styleId = loadStyle(join(__dirname, 'scss', 'style.scss'));

  hfd.api.settings.registerSettings('general', {
    category: 'general',
    label: 'General Settings',
    render: GeneralSettings
  });

  await patchSettingsComponent();
  // startup

  // hfd.api.settings.registerSettings('general', {
  //     category: 'general',
  //     label: () => 'General Settings',
  //     render: GeneralSettings
  // });


  console.log('[HFD | Settings] Loaded.');

  return () => {
    unloadStyle(styleId);
  };
};
