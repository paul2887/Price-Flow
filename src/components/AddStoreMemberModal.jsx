import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../utils/supabaseClient";
import "../styles/components/AddStoreMemberModal.css";

export default function AddStoreMemberModal({ isOpen, onClose, storeId, storeName }) {
  const [view, setView] = useState(null); // null | 'email' | 'link'
  const [inviteLink, setInviteLink] = useState(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Generate a shareable invite link by creating a database record
  const generateInviteLink = useCallback(async () => {
    setIsLoading(true);

    try {
      const token = uuidv4();
      
      // Calculate expiry date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Create invitation record in database
      const { error: insertError } = await supabase
        .from('store_invitations')
        .insert({
          store_id: storeId,
          email: `link-${token.substring(0, 8)}@invite.local`, // Placeholder for link-based invites
          token: token,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error('Failed to create invitation: ' + insertError.message);
      }

      // Build the invite URL with store name
      const encodedStoreName = storeName ? encodeURIComponent(storeName) : '';
      const inviteUrl = `${window.location.origin}/accept-invite?token=${token}&store=${storeId}&storeName=${encodedStoreName}`;

      setInviteLink({
        link: inviteUrl,
        token: token,
      });
      toast.success("Invite link generated!", { duration: 3000 });
    } catch (error) {
      console.error("Full error:", error);
      toast.error("Failed to generate invite link: " + error.message, { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [storeId, storeName]);

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink.link);
      toast.success("Link copied to clipboard!", { duration: 3000 });
    }
  };

  const handleBack = () => {
    setView(null);
    setInviteLink(null);
  };

  const handleGenerateNewLink = async () => {
    setIsLoading(true);

    try {
      const token = uuidv4();
      
      // Calculate expiry date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Create new invitation record in database
      const { error: insertError } = await supabase
        .from('store_invitations')
        .insert({
          store_id: storeId,
          email: `link-${token.substring(0, 8)}@invite.local`, // Placeholder for link-based invites
          token: token,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error('Failed to create invitation: ' + insertError.message);
      }

      const encodedStoreName = storeName ? encodeURIComponent(storeName) : '';
      const inviteUrl = `${window.location.origin}/accept-invite?token=${token}&store=${storeId}&storeName=${encodedStoreName}`;

      setInviteLink({
        link: inviteUrl,
        token: token,
      });
      toast.success("New invite link generated!", { duration: 3000 });
    } catch (error) {
      console.error("Full error:", error);
      toast.error("Failed to generate link: " + error.message, { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkMethod = () => {
    setView("link");
    generateInviteLink();
  };

  const handleClose = () => {
    setView(null);
    setInviteLink(null);
    setEmail("");
    onClose();
  };

  if (!isOpen) return null;

  // Show link sharing view
  if (view === "link" && inviteLink) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content invite-link-modal" onClick={(e) => e.stopPropagation()}>
          <div className="invite-link-container">
            <div className="invite-link-header">
              <button className="invite-back-btn" onClick={handleBack} title="Back">
                <svg viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z" fill=""></path></g></svg>
              </button>
              <button className="invite-close-btn" onClick={handleClose} title="Close">
                ✕
              </button>
            </div>

            <div className="invite-header">
              <h2 className="invite-title">{storeName} is active</h2>
              <p className="invite-subtitle">Share this link with your store members to invite them to join.</p>
            </div>

            <div className="invite-link-section">
              <label className="invite-link-label">Share link</label>
              
              <div className="invite-link-input-wrapper">
                <input
                  type="text"
                  readOnly
                  value={inviteLink.link}
                  className="invite-link-input"
                />
              </div>
            </div>

            <div className="invite-actions">
              <button
                className="invite-btn invite-btn-secondary"
                onClick={handleGenerateNewLink}
                disabled={isLoading}
              >
                <svg className="invite-btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14 7H16C18.7614 7 21 9.23858 21 12C21 14.7614 18.7614 17 16 17H14M10 7H8C5.23858 7 3 9.23858 3 12C3 14.7614 5.23858 17 8 17H10M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                {isLoading ? "Generating..." : "Generate New Link"}
              </button>
              <button
                className="invite-btn invite-btn-primary"
                onClick={handleCopyLink}
              >
                <svg className="invite-btn-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show email view
  if (view === "email") {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Send Email Invite</h2>
            <button className="modal-close" onClick={handleClose}>
              ✕
            </button>
          </div>

          <div className="add-member-content">
            <p className="add-member-description">
              Add members by sending them an invite email to join <strong>{storeName}</strong>.
            </p>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="modal-input"
                disabled={isLoading}
              />
            </div>

            <button 
              className="modal-btn-primary" 
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? "Sending..." : "Send Email Invite"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Initial screen - Choose method
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content method-selection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Store Member</h2>
          <button className="modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="method-selection-content">
          {/* Link Option */}
          <div className="method-option">
            <p className="method-description">
              Generate a unique invite link to share with your team members. They can use it to sign up and join <strong>{storeName}</strong>
            </p>
          </div>

          {/* Buttons */}
          <div className="method-buttons">
            <button 
              className="method-btn method-btn-primary"
              onClick={handleLinkMethod}
            >
              <svg className="method-btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14 7H16C18.7614 7 21 9.23858 21 12C21 14.7614 18.7614 17 16 17H14M10 7H8C5.23858 7 3 9.23858 3 12C3 14.7614 5.23858 17 8 17H10M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
              Generate Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
