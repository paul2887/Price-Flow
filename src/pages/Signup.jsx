import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import '../styles/pages/Signup.css';
import backIcon from '../assets/icons/back-svgrepo-com.svg';
import signupPageImage from '../assets/Signup page image.png';
import mailIcon from '../assets/icons/mail-alt-svgrepo-com.svg';

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
          <img src={backIcon} alt="Back" />
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