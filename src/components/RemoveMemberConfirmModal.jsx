import '../styles/components/RemoveMemberConfirmModal.css';

export default function RemoveMemberConfirmModal({ isOpen, onClose, memberName, storeName, onConfirm, isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="remove-modal-overlay" onClick={(e) => {
      if (e.target.classList.contains('remove-modal-overlay')) onClose();
    }}>
      <div className="remove-modal-content">
        <div className="remove-modal-header">
          <h2 className="remove-modal-title">Remove Member</h2>
        </div>

        <div className="remove-confirm-message">
          <p>You are about to remove <span className="remove-member-highlight">{memberName}</span> from <span className="remove-store-highlight">{storeName}</span></p>
        </div>

        <div className="remove-confirm-buttons">
          <button 
            className="remove-modal-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="remove-modal-btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}
