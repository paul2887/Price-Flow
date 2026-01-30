import { useState, useEffect } from 'react';
import RemoveMemberConfirmModal from './RemoveMemberConfirmModal';
import RoleBadge from './RoleBadge';
import '../styles/components/UpdateMemberRoleModal.css';

export default function UpdateMemberRoleModal({ isOpen, onClose, member, onUpdate, onRemove, storeName = "Store" }) {
  const [newRole, setNewRole] = useState(member?.role === 'Store Admin' ? 'Sales Person' : 'Store Admin');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update the selected role when member changes
  useEffect(() => {
    if (member) {
      const roleToShow = member.role === 'Store Admin' ? 'Sales Person' : 'Store Admin';
      setNewRole(roleToShow);
    }
  }, [member?.id, member?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (member && newRole) {
      setIsLoading(true);
      try {
        // Pass the display name so the handler can convert it
        await onUpdate(member.id, newRole);
        onClose();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  if (!isOpen || !member) return null;

  const roleDescription = newRole === 'Sales Person' 
    ? `${member.name} will have sales person access only.` 
    : `${member.name} will have full administrative access to the store.`;

  return (
    <>
      {!showRemoveConfirm && (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Change Member Role</h2>
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="role-info">
              <p className="role-member-name">{member.name}</p>
              <p className="role-member-email">{member.email}</p>
              <p className="role-current">Current role: <RoleBadge role={member.role} /></p>
            </div>

            <div className="form-group">
              <label>New Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="modal-input"
              >
                {member.role === 'Store Admin' ? (
                  <option value="Sales Person">Sales Person</option>
                ) : (
                  <option value="Store Admin">Store Admin</option>
                )}
              </select>
            </div>

            <p className="role-description">{roleDescription}</p>

            <button type="submit" className="modal-btn-primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Change Role'}
            </button>

            <button 
              type="button" 
              className="modal-btn-danger"
              onClick={() => setShowRemoveConfirm(true)}
              disabled={isLoading}
            >
              Remove Member
            </button>
          </form>
        </div>
      </div>
      )}

      <RemoveMemberConfirmModal
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        memberName={member.name}
        storeName={storeName}
        isLoading={isLoading}
        onConfirm={async () => {
          if (member && onRemove) {
            setIsLoading(true);
            try {
              await onRemove(member.id);
              setShowRemoveConfirm(false);
              onClose();
            } finally {
              setIsLoading(false);
            }
          }
        }}
      />
    </>
  );
}
