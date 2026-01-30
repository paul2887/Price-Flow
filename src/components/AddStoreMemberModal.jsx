import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../utils/supabaseClient";
import "../styles/components/AddStoreMemberModal.css";

export default function AddStoreMemberModal({ isOpen, onClose, onAdd, storeId, storeName }) {
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
      const { data: invitationData, error: insertError } = await supabase
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

  const handleOpenLink = () => {
    if (inviteLink) {
      window.open(inviteLink.link, '_blank');
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
      const { data: invitationData, error: insertError } = await supabase
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

  const handleEmailMethod = () => {
    setView("email");
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
          {/* Email Option */}
          <div className="method-option">
            <p className="method-description">
              Add members by sending them an invite email to join <strong>{storeName}</strong>
            </p>
          </div>

          {/* Divider */}
          <div className="method-divider">
            <span className="divider-text">OR</span>
          </div>

          {/* Link Option */}
          <div className="method-option">
            <p className="method-description">
              Generate a unique invite link to share with your team members. They can use it to sign up and join <strong>{storeName}</strong>
            </p>
          </div>

          {/* Add by label */}
          <div className="method-add-by-label">Add by?</div>

          {/* Buttons */}
          <div className="method-buttons">
            <button 
              className="method-btn method-btn-secondary"
              onClick={handleLinkMethod}
            >
              <svg className="method-btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14 7H16C18.7614 7 21 9.23858 21 12C21 14.7614 18.7614 17 16 17H14M10 7H8C5.23858 7 3 9.23858 3 12C3 14.7614 5.23858 17 8 17H10M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
              Link
            </button>
            <button 
              className="method-btn method-btn-primary"
              onClick={handleEmailMethod}
            >
              <svg className="method-btn-icon" viewBox="0 -4 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="currentColor"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>mail</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" sketch:type="MSPage"> <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-412.000000, -259.000000)" fill="currentColor"> <path d="M442,279 C442,279.203 441.961,279.395 441.905,279.578 L433,270 L442,263 L442,279 L442,279 Z M415.556,280.946 L424.58,271.33 L428,273.915 L431.272,271.314 L440.444,280.946 C440.301,280.979 415.699,280.979 415.556,280.946 L415.556,280.946 Z M414,279 L414,263 L423,270 L414.095,279.578 C414.039,279.395 414,279.203 414,279 L414,279 Z M441,261 L428,271 L415,261 L441,261 L441,261 Z M440,259 L416,259 C413.791,259 412,260.791 412,263 L412,279 C412,281.209 413.791,283 416,283 L440,283 C442.209,283 444,281.209 444,279 L444,263 C444,260.791 442.209,259 440,259 L440,259 Z" id="mail" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
              Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
