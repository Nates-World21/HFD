const getPatchFunc = require('./getPatchFunc.js');
const { unpatchAll, unpatch } = require('./unpatch');


const before = getPatchFunc('b');
const instead = getPatchFunc('i');
const after = getPatchFunc('a');

module.exports = {
  instead,
  before,
  after,
  unpatchAll,
  unpatch
};

// ps: thanks cumcord - https://github.com/Cumcord/spitroast
