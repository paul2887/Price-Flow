import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Loading from "../components/Loading";
import "../styles/pages/AcceptInvite.css";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storeName, setStoreName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const token = searchParams.get("token");
  const storeId = searchParams.get("store");
  const storeNameParam = searchParams.get("storeName");

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided");
      setLoading(false);
      return;
    }

    if (storeNameParam) {
      setStoreName(decodeURIComponent(storeNameParam));
    }

    fetchInviteDetails();
  }, [token, storeNameParam]);

  const fetchInviteDetails = async () => {
    try {
      setLoading(true);

      const { data: invitation, error: inviteError } = await supabase
        .from("store_invitations")
        .select("store_id, stores(store_name, id), expires_at")
        .eq("token", token)
        .single();

      if (inviteError || !invitation) {
        setError("Invalid or expired invitation link");
        return;
      }

      if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
        setError("This invitation has expired");
        return;
      }

      if (invitation?.stores?.store_name) {
        setStoreName(invitation.stores.store_name);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching invitation details");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setIsProcessing(true);
    navigate(`/invite-signup?token=${token}&store=${storeId}&storeName=${encodeURIComponent(storeName)}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="accept-invite-container">
        <div className="accept-invite-content">
          <div className="error-icon">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="95" fill="none" stroke="#dc3545" strokeWidth="2" opacity="0.2" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#dc3545" strokeWidth="3" opacity="0.5" />
              <line x1="65" y1="65" x2="135" y2="135" stroke="#dc3545" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
              <line x1="135" y1="65" x2="65" y2="135" stroke="#dc3545" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>
          <div className="accept-invite-message">
            <h1 className="accept-invite-title">Invitation Error</h1>
            <p className="accept-invite-description error-text">{error}</p>
          </div>
          <button 
            className="accept-invite-btn"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="accept-invite-container">
      <div className="accept-invite-content">
        <div className="confetti-icon">
          🎉
        </div>
        <div className="accept-invite-message">
          <h1 className="accept-invite-title">You've been invited to join {storeName}</h1>
          <p className="accept-invite-description">
            You would be required to create an account which would be tied to {storeName}
          </p>
        </div>
        <button 
          className="accept-invite-btn"
          onClick={handleContinue}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
