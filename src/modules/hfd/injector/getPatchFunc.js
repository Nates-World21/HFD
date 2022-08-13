const hook = require('./hook');
const { patchedObjects } = require('./shared');
const { unpatch } = require('./unpatch');

module.exports = (patchType) =>
/**
 *
 * @param {*} funcName
 * @param {*} funcParent
 * @param {*} callback
 * @param {*} oneTime
 * @returns
 */
  (
    funcName,
    funcParent,
    callback,
    oneTime = false
  ) => {
    if (typeof funcParent[funcName] !== 'function') {
      throw new Error(`${funcName} is not a function in ${funcParent.constructor.name}`);
    }

    if (!patchedObjects.has(funcParent)) {
      patchedObjects.set(funcParent, {});
    }

    const parentInjections = patchedObjects.get(funcParent);

    if (!parentInjections[funcName]) {
      const origFunc = funcParent[funcName];

      parentInjections[funcName] = {
        o: origFunc,
        b: new Map(),
        i: new Map(),
        a: new Map()
      };

      const runHook = (ctxt, args, construct) => {
        const ret = hook(funcName, funcParent, args, ctxt, construct);
        if (oneTime) {
          // eslint-disable-next-line no-use-before-define
          unpatchThisPatch();
        }
        return ret;
      };

      const replaceProxy = new Proxy(origFunc, {
        apply: (_, ctxt, args) => runHook(ctxt, args, false),
        construct: (_, args) => runHook(origFunc, args, true),

        get: (target, prop, reciever) => prop === 'toString' ? origFunc.toString.bind(origFunc) : Reflect.get(target, prop, reciever)
      });

      const success = Reflect.defineProperty(funcParent, funcName, {
        value: replaceProxy,
        configurable: true,
        writable: true
      });

      if (!success) {
        funcParent[funcName] = replaceProxy;
      }
    }

    // eslint-disable-next-line symbol-description
    const hookId = Symbol();
    const unpatchThisPatch = () => unpatch(funcParent, funcName, hookId, patchType);

    parentInjections[funcName][patchType].set(hookId, callback);

    return unpatchThisPatch;
  };
