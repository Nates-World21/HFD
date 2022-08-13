const { join } = require('path');
const { existsSync } = require('fs');
const { inject } = require('../../injectors/main.js');

if (process.platform === 'win32') {
  const injector = require(`../../injectors/${process.platform}`);
  const buildInfoFile = join(process.resourcesPath, 'build_info.json');

  const buildInfo = require(buildInfoFile);
  if (buildInfo && buildInfo.newUpdater) {
    const autoStartScript = join(require.main.filename, '..', 'autoStart', 'index.js');
    const { update } = require(autoStartScript);

    // New Updater Injection
    require.cache[autoStartScript].exports.update = async (callback) => {
      const appDir = await injector.getAppDir();
      console.log('[HFD] Checking for host updates...');
      if (!existsSync(appDir)) {
        console.log('[HFD] Host update is available! Injecting into new version...');
        return inject(injector).then(() => {
          console.log('[HFD] Successfully injected into new version!');

          update(callback);
        });
      }

      console.log(`[HFD] Host "${buildInfo.version}" is already injected with HFD.`);
    };
  } else {
    const hostUpdaterScript = join(require.main.filename, '..', 'hostUpdater.js');
    const { quitAndInstall } = require(hostUpdaterScript);

    require.cache[hostUpdaterScript].exports.quitAndInstall = () => {
      console.log('[HFD] Host update is available! Injecting into new version...');
      inject(injector).then(() => {
        console.log('[HFD] Successfully injected into new version!');

        quitAndInstall.call({ updateVersion: require.cache[hostUpdaterScript].exports.updateVersion });
      });
    };
  }
}
