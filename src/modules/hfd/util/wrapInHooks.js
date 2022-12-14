/* Credit to Strencher-kernel
 * https://github.com/strencher-kernel/pc-compat/commit/05b841401cf239c9682c83f57f48bc4b5080f117
 */

/* eslint-disable no-empty-function */
const defaultOverrides = {
  useMemo: factory => factory(),
  useState: initialState => [ initialState, () => void 0 ],
  useReducer: initialValue => [ initialValue, () => void 0 ],
  useEffect: () => {},
  useLayoutEffect: () => {},
  useRef: () => ({ current: null }),
  useCallback: callback => callback,
  useContext: ctx => ctx._currentValue
};

module.exports = function wrapInHooks (functionalComponent, options) {
  const overrides = Object.assign({}, options, defaultOverrides);
  const keys = Object.keys(overrides);

  const { React } = require('hfd/webpack');

  return (...args) => {
    const ReactDispatcher = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
    const originals = keys.map(e => [ e, ReactDispatcher[e] ]);
    Object.assign(ReactDispatcher, overrides);
    let returnValue = null,
      error = null;
    try {
      returnValue = functionalComponent(...args);
    } catch (err) {
      error = err;
    }
    Object.assign(ReactDispatcher, Object.fromEntries(originals));
    // Throw it after react we re-assigned react's dispatcher stuff so it won't break discord entirely.
    if (error) {
      throw error;
    }
    return returnValue;
  };
};
