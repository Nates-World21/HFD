const { React, getModuleByDisplayName } = require('hfd/webpack');
const { AsyncComponent, ErrorBoundary } = require('hfd/components');
const { after } = require('hfd/injector');
const { join } = require('path');

const { loadStyle, unloadStyle } = require('../util');

const GeneralSettings = require('./components/GeneralSettings');
const ThemeSettings = require('../modules/components/manage/ThemeSettings');

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));
const FormSection = AsyncComponent.from(getModuleByDisplayName('FormSection'));

function renderWrapper (label, Component, themeID) {
  return React.createElement(ErrorBoundary, null,
    React.createElement(FormSection, {},
      React.createElement(FormTitle, { tag: 'h2' }, label),
      React.createElement(Component, { theme: themeID })
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

function makeThemeSection (themeID) {
  const theme = hfd.styleManager.get(themeID);

  return {
    label: theme.manifest.name,
    section: themeID,
    element: () => renderWrapper(theme.manifest.name, ThemeSettings, themeID)
  };
}


async function patchSettingsComponent () {
  const SettingsView = await getModuleByDisplayName('SettingsView');

  after('getPredicateSections', SettingsView.prototype, (_, sections) => {
    if (sections.length < 10) {
      return sections;
    }
    const changelog = sections.find((c) => c.section === 'changelog');

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

      const themeSettings = Object.keys(hfd.api.settings.store.getAllSettings())
        .filter((s) => s.startsWith('theme-'))
        .map((s) => makeThemeSection(s.replace(/theme-/g, '')));
      if (themeSettings.length > 0 && hfd.settings.get('theme-location') === 'tabs') {
        sections.splice(
          sections.indexOf(changelog),
          0,
          {
            section: 'HEADER',
            label: 'Theme Settings'
          },
          ...themeSettings,
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
