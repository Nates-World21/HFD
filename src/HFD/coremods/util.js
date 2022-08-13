const { createElement } = require('hfd/util');
const { resolveCompiler } = require('hfd/compilers');

module.exports = {
  loadStyle (file) {
    const id = Math.random().toString(36).slice(2);
    const style = createElement('style', {
      id: `style-coremod-${id}`,
      'data-hfd': true,
      'data-coremod': true
    });

    document.head.appendChild(style);
    const compiler = resolveCompiler(file);
    compiler.compile().then(css => (style.innerHTML = css));
    return id;
  },

  unloadStyle (id) {
    const el = document.getElementById(`style-coremod-${id}`);
    if (el) {
      el.remove();
    }
  }
};
