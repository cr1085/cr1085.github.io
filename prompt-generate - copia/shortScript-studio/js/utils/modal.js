/**
 * modal.js — Modal open/close manager
 */

export class ModalManager {
  open(id) {
    const modal = document.getElementById(`modal-${id}`);
    if (modal) modal.classList.remove('hidden');
  }

  close(id) {
    const modal = document.getElementById(`modal-${id}`);
    if (modal) modal.classList.add('hidden');
  }

  closeAll() {
    document.querySelectorAll('.modal-backdrop')
      .forEach(m => m.classList.add('hidden'));
  }
}
