import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import '../styles/pages/Signup.css';
import signupPageImage from '../assets/Signup page image.png';

const BackIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 18L9 12L15 6"
      stroke="#000000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 8L8.44992 11.6333C9.73295 12.4886 10.3745 12.9163 11.0678 13.0825C11.6806 13.2293 12.3194 13.2293 12.9322 13.0825C13.6255 12.9163 14.2671 12.4886 15.5501 11.6333L21 8M6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V8.2C21 7.0799 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
);

export default function Signup({ onProceed, onSigninClick, onBack }) {
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
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: Math.random().toString(36).slice(-16), // Generate random password
        options: {
          emailRedirectTo: 'http://localhost:5173/email-verified',
        },
      });

      if (error) {
        toast.error(error.message || 'Failed to sign up. Please try again.');
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Check your email to verify your account');
        // Save email to localStorage for persistence after refresh
        localStorage.setItem('signupEmail', email);
        // Navigate to verify email page instead of proceeding immediately
        onProceed(email);
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Top Section: Back Button + Image */}
      <div className="signup-top">
        <button className="back-btn" onClick={onBack} disabled={loading}>
          <BackIcon />
        </button>
        <img src={signupPageImage} alt="Signup" className="signup-image" />
      </div>

      {/* Middle Section: Create Account Form */}
      <div className="signup-middle">
        {/* <h1>Create Account</h1> */}
        <h1>Get Started</h1>
        <p className="subtitle">Enter your email to continue</p>

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

          <button type="submit" disabled={loading} className="proceed-btn">
            {loading ? 'Processing...' : 'Proceed'}
          </button>
        </form>
      </div>

      {/* Bottom Section: Already have account */}
      <div className="signup-bottom">
        <p>Already have an account? <a onClick={onSigninClick}>Sign in</a></p>
      </div>
    </div>
  );
}