import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import '../styles/pages/ForgotPassword.css';
import forgotPasswordImage from '../assets/forgotten password page image.png';

const BackIcon = () => (
  <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#000000" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path><path fill="#000000" d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path></g></svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 8L8.44992 11.6333C9.73295 12.4886 10.3745 12.9163 11.0678 13.0825C11.6806 13.2293 12.3194 13.2293 12.9322 13.0825C13.6255 12.9163 14.2671 12.4886 15.5501 11.6333L21 8M6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V8.2C21 7.0799 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);

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
      const trimmedEmail = email.trim();

      // Check staff table for the email
      const { data: staffMember } = await supabase
        .from('staff')
        .select('id, role')
        .eq('email', trimmedEmail)
        .single();

      // Email not found anywhere
      if (!staffMember) {
        toast.error('Email not found');
        setLoading(false);
        return;
      }

      // If staff but NOT store owner (admin/sales person)
      if (staffMember.role !== 'Store Owner') {
        toast.error('Contact your store owner to reset your password');
        setLoading(false);
        return;
      }

      // Store owner - send Supabase reset
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (!resetError) {
        toast.success('Reset link sent to your email');
        setEmail('');
      } else {
        toast.error('Failed to send reset link');
      }
      setLoading(false);
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      {/* Top Section: Back Button + Image */}
      <div className="forgot-password-top">
        <button className="back-btn" onClick={onBack} disabled={loading}>
          <BackIcon />
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
              <MailIcon />
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
