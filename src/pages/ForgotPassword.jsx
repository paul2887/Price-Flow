import { useState } from 'react';
import toast from 'react-hot-toast';
import '../styles/pages/ForgotPassword.css';
import backIcon from '../assets/icons/back-svgrepo-com.svg';
import forgotPasswordImage from '../assets/forgotten password page image.png';
import mailIcon from '../assets/icons/mail-alt-svgrepo-com.svg';

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate email
    if (!email.trim()) {
      toast.error('Please enter your email address');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }

    console.log('Password reset requested for:', { email });
    toast.success('Reset link sent to your email');
    setEmail('');

    setLoading(false);
  };

  return (
    <div className="forgot-password-container">
      {/* Top Section: Back Button + Image */}
      <div className="forgot-password-top">
        <button className="back-btn" onClick={onBack} disabled={loading}>
          <img src={backIcon} alt="Back" />
        </button>
        <img src={forgotPasswordImage} alt="Forgot Password" className="forgot-password-image" />
      </div>

      {/* Middle Section: Forgot Password Form */}
      <div className="forgot-password-middle">
        <h1>Reset Password</h1>
        <p className="subtitle">Enter your email to receive a reset link</p>

        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="email-field">
              <img src={mailIcon} alt="Email" className="email-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                className="email-input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="reset-btn">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>

      {/* Bottom Section: Back to Sign In */}
      {/* <div className="forgot-password-bottom">
        <button className="back-btn-bottom" onClick={onBack} disabled={loading}>
          <img src={backIcon} alt="Back" />
        </button>
      </div> */}
    </div>
  );
}
