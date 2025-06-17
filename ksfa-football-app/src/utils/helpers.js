// src/utils/helpers.js

// Helper function for a custom alert modal
export const showMessageModal = (message, type = 'info', duration = 3000) => {
  const modalContainer = document.getElementById('message-modal-container');
  if (!modalContainer) {
    console.error('Message modal container not found.');
    return;
  }

  // Remove any existing modals to ensure only one is active
  const existingModal = modalContainer.querySelector('.fixed.inset-0');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = `fixed inset-0 z-50 flex items-center justify-center p-4 ${
    type === 'error' ? 'bg-red-800 bg-opacity-75' : 'bg-gray-900 bg-opacity-75'
  }`; // Darker overlay
  modal.innerHTML = `
    <div class="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center transform scale-95 transition-transform duration-300 ease-out">
      <p class="text-lg font-semibold ${type === 'error' ? 'text-red-700' : 'text-gray-800'}">${message}</p>
      <button class="mt-5 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out font-medium text-base">Close</button>
    </div>
  `;

  modalContainer.appendChild(modal);

  // Add a slight animation for the modal appearing
  setTimeout(() => {
      modal.querySelector('div').classList.remove('scale-95');
      modal.querySelector('div').classList.add('scale-100');
  }, 50);

  const closeButton = modal.querySelector('button');
  closeButton.onclick = () => {
    modal.querySelector('div').classList.remove('scale-100');
    modal.querySelector('div').classList.add('scale-95');
    modal.addEventListener('transitionend', () => modal.remove()); // Remove after animation
  };

  if (duration > 0) {
    setTimeout(() => {
      if (modal.parentNode) {
        modal.querySelector('div').classList.remove('scale-100');
        modal.querySelector('div').classList.add('scale-95');
        modal.addEventListener('transitionend', () => modal.remove());
      }
    }, duration);
  }
};

