const { existsSync } = require('fs');
const { mkdir, writeFile, readdir, lstat, unlink, rmdir } = require('fs/promises');
const { join, sep } = require('path');
const rmdirRf = require('../src/modules/HFD/util/rmdirRf')
const { AnsiEscapes } = require('./log');

exports.inject = async ({ getAppDir }, platform) => {
    const appDir = await getAppDir(platform);

    if (existsSync(appDir)) {
        console.log('Looks like you already have an injector in place. Try unplugging (`npm run unplug`) and try again.', '\n');
        console.log(`${AnsiEscapes.YELLOW}NOTE:${AnsiEscapes.RESET} If you already have BetterDiscord or another client mod injected, HFD cannot run along with it!`);

        return false;
    }

    await mkdir(appDir);

    await Promise.all([
        writeFile(
            join(appDir, 'index.js'),
            `require(\`${__dirname.replace(RegExp(sep.repeat(2), 'g'), '/')}/../src/patcher/index.js\`)`
        ),
        writeFile(
            join(appDir, 'package.json'),
            JSON.stringify({
                main: 'index.js',
                name: 'discord'
            })
        )
    ])

    return true;
}

exports.uninject = async ({ getAppDir }, platform) => {
    const appDir = await getAppDir(platform);

    if (!existsSync(appDir)) {
        console.log('There is nothing to uninject. You are already running Discord without mods.')
        return false;
    }

    await rmdirRf(appDir);
    return true;
}