import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import '../styles/pages/EmailVerified.css';
import emailVerifiedImage from '../assets/email-verified-page-image.png';

export default function EmailVerified() {
  const navigate = useNavigate();
  const [sessionChecking, setSessionChecking] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setSessionChecking(true);

      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session check error:', error);
        setHasValidSession(false);
        return;
      }

      if (session && session.user) {
        // Valid session exists
        setHasValidSession(true);
      } else {
        // No session found
        setHasValidSession(false);
      }
    } catch (err) {
      console.error('Unexpected error checking session:', err);
      setHasValidSession(false);
    } finally {
      setSessionChecking(false);
    }
  };

  // Loading state
  if (sessionChecking) {
    return (
      <div className="email-verified-container">
        <div className="email-verified-top">
          <img src={emailVerifiedImage} alt="Email Verified" className="email-verified-page-image" />
        </div>
        <div className="email-verified-middle">
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Verifying your email...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - no valid session
  if (!hasValidSession) {
    return (
      <div className="email-verified-container">
        <div className="email-verified-top">
          <img src={emailVerifiedImage} alt="Email Verified" className="email-verified-page-image" />
        </div>
        <div className="email-verified-middle">
          <h1>Verification Failed</h1>
          <p className="subtitle">Invalid or Expired Link</p>

          <div className="email-verified-message error">
            <p>The verification link has expired or is invalid. Please sign up again to receive a new verification email.</p>
          </div>

          <button 
            onClick={() => navigate('/signup')} 
            className="continue-btn"
          >
            Back to Signup
          </button>
        </div>
      </div>
    );
  }

  // Success state - valid session exists
  return (
    <div className="email-verified-container">
      {/* Top Section: Image */}
      <div className="email-verified-top">
        <img src={emailVerifiedImage} alt="Email Verified" className="email-verified-page-image" />
      </div>

      {/* Middle Section: Email Verified Form */}
      <div className="email-verified-middle">
        <h1>Email Verified!</h1>
        <p className="subtitle">Your email has been successfully verified.</p>

        <div className="email-verified-message">
          <p>You can now proceed to complete your account setup.</p>
        </div>

        <button 
          onClick={() => navigate('/set-password')} 
          className="continue-btn"
        >
          Continue to Set Password
        </button>
      </div>
    </div>
  );
}
