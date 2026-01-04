import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import '../styles/pages/VerifyEmail.css';
import backIcon from '../assets/icons/back-svgrepo-com.svg';
import verifyEmailImage from '../assets/verify email page image.png';

export default function VerifyEmail({ email, onBack }) {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    setLoading(true);
    
    console.log('Resending verification link to:', email);
    
    setLoading(false);
    toast.success('Link sent successfully!');
    setCountdown(30);
  };

  return (
    <div className="verify-email-container">
      {/* Top Section: Back Button + Image */}
      <div className="verify-email-top">
        <button className="back-btn" onClick={onBack} disabled={loading}>
          <img src={backIcon} alt="Back" />
        </button>
        <img src={verifyEmailImage} alt="Verify Email" className="verify-email-page-image" />
      </div>

      {/* Middle Section: Verify Email Form */}
      <div className="verify-email-middle">
        <h1>Check Your Email</h1>
        <p className="subtitle">A verification link has been sent to</p>
        <p className="verify-email-address">{email}</p>

        <div className="verify-email-message">
          <p>Click the link in your email to verify your account and continue.</p>
        </div>

        <button 
          onClick={handleResend} 
          disabled={loading || countdown > 0} 
          className="resend-btn"
        >
          {loading ? 'Sending...' : countdown > 0 ? `Resend in (${countdown}s)` : 'Resend Link'}
        </button>
      </div>

      {/* Bottom Section: Help Text */}
      <div className="verify-email-bottom">
        {/* <p>Didn't receive an email? Check your spam folder or <a onClick={handleResend}>try again</a></p> */}
        <p>Didn't receive an email? Check your spam folder</p>
      </div>
    </div>
  );
}