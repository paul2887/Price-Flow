import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
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

    try {
      // Send password reset email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'http://localhost:5173/reset-password'
      });

      if (error) {
        toast.error(error.message || 'Failed to send reset link');
        setLoading(false);
        return;
      }

      toast.success('Reset link sent to your email');
      setEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error('An error occurred. Please try again.');
      setLoading(false);
    }

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
