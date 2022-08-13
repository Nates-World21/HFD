const { patchTypes, patchedObjects } = require('./shared');

function unpatch (
  funcParent,
  funcName,
  hookId,
  type
) {
  const patchedObject = patchedObjects.get(funcParent);
  const patch = patchedObject[funcName];

  if (!patch[type].has(hookId)) {
    return false;
  }

  patch[type].delete(hookId);

  if (patchTypes.every((t) => patch[t].size === 0)) {
    const success = Reflect.defineProperty(funcParent, funcName, {
      value: patch.o,
      writable: true,
      configurable: true
    });

    if (!success) {
      funcParent[funcName] = patch.o;
    }

    delete patchedObject[funcName];
  }

  if (Object.keys(patchedObject).length === 0) {
    patchedObjects.delete(funcParent);
  }

  return true;
}

function unpatchAll () {
  for (const [ parentObject, patchedObject ] of patchedObjects.entries()) {
    for (const funcName in patchedObjects) {
      for (const hookType of patchTypes) {
        for (const hookId of patchedObject[funcName][hookType].keys() ?? []) {
          unpatch(parentObject, funcName, hookId, hookType);
        }
      }
    }
  }
}

module.exports = { unpatchAll,
  unpatch };
