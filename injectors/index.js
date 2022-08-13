require('./elevate');
require('./env_check')();
require('../polyfills');

const { join } = require('path');
const { writeFile } = require('fs/promises');
const { BasicMessages } = require('./log');
const main = require('./main');

let platformModule;

try {
    platformModule = require(`./${process.platform}.js`);
} catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
        console.log(BasicMessages.INJECT_FAILED, '\n')
        console.log('It seems like your platform is not supported yet.', '\n');
        console.log(
            'Feel free to open an issue about it, so we can add support for it!'
        );
        console.log(
            `Make sure to mention the platform you are on is "${process.platform}" in your issue ticket.`
        );

        process.exit(process.argv.includes('no-exit-codes') ? 0 : 1)
    }
}

const VALID_PLATFORMS = ['stable', 'ptb', 'canary', 'dev', 'development'];

(async () => {
    let platform = process.argv.find((x) => VALID_PLATFORMS.includes(x.toLocaleLowerCase())) || 'stable'
    if (platform === 'development') {
        platform = 'dev'
    }

    if (process.argv[2] === 'inject') {
        if (await main.inject(platformModule, platform)) {

            console.log(BasicMessages.INJECT_SUCCESS, '\n')
            console.log('Kill Discord and restart for changes to appear.')
        }
    } else if (process.argv[2] === 'uninject') {
        if (await main.uninject(platformModule, platform)) {
            console.log(BasicMessages.UNINJECT_SUCCESS, '\n');
            console.log('Kill Discord and restart for changes to appear.')
        }
    }
})().catch((e) => {
    if (e.code === 'EACCES') {
        console.log(
            process.argv[2] === 'inject' ? BasicMessages.INJECT_FAILED : BasicMessages.UNINJECT_FAILED, '\n'
        )

        console.log('Missing permissions!')
    } else {
        console.error(e)
    }
})