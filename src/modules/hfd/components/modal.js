const { React, getModule, getModuleByDisplayName } = require('hfd/webpack');
const AsyncComponent = require('./AsyncComponent');

const promiseModal = getModule([ 'ModalRoot' ], true, true);

Object.assign(exports, {
  Confirm: AsyncComponent.from(getModuleByDisplayName('ConfirmModal')),
  Modal: AsyncComponent.from((async () => {
    const module = await promiseModal;
    return (p) =>
      React.createElement(module.ModalRoot, {
        ...p,
        transitionState: 1
      });
  })())
});

// Re-export module properties
(async () => {
  const module = await promiseModal;
  const { close } = require('hfd/modal');
  exports.Modal.ModalCloseButton = module.ModalCloseButton;
  exports.Modal.ModalContent = module.ModalContent;
  exports.Modal.ModalFooter = module.ModalFooter;
  exports.Modal.ModalHeader = module.ModalHeader;
  exports.Modal.ModalListContent = module.ModalListContent;
  exports.Modal.ModalRoot = module.ModalRoot;
  exports.Modal.ModalSize = module.ModalSize;

  Object.defineProperty(exports.Modal, 'Header', { get: () => exports.Modal.ModalHeader });
  Object.defineProperty(exports.Modal, 'Footer', { get: () => exports.Modal.ModalFooter });
  Object.defineProperty(exports.Modal, 'Content', { get: () => exports.Modal.ModalContent });
  Object.defineProperty(exports.Modal, 'ListContent', { get: () => exports.Modal.ModalListContent });
  Object.defineProperty(exports.Modal, 'CloseButton', { get: () => exports.Modal.ModalCloseButton });
  Object.defineProperty(exports.Modal, 'Sizes', { get: () => exports.Modal.ModalSize });

  exports.Confirm.defaultProps = {
    transitionState: 1,
    onClose: close
  };
})();
