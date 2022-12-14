const { findInTree, getReactInstance } = require('hfd/util');
const { React, modal } = require('hfd/webpack');
const { Modal } = require('hfd/components/modal');

module.exports = {
  /**
   * Opens a new modal
   * @param {React.Component|function(): React.Element} Component
   * @return {string} Modal ID
   */
  open: (Component) =>
    modal.openModal((p) =>
      React.createElement(Modal.ModalRoot, {
        ...p,
        className: 'hfd-fake-modal-container'
      }, React.createElement(Component))),

  /**
   * Closes the currently opened modal
   * @param {string} modal Modal ID
   */
  close: () => {
    const instance = getReactInstance(document.querySelector('[role=dialog]'));
    if (!instance) {
      return;
    }

    const props = findInTree(instance, (n) => n.modalKey, { walkable: [ 'memoizedProps', 'return' ] });
    if (!props) {
      return;
    }

    modal.closeModal(props.modalKey);
  },

  /**
   * Closes all modals
   */
  closeAll: () => {
    modal.closeAllModals();
  }
};
