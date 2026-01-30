import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import bcryptjs from 'bcryptjs';
import { acceptInvitation } from '../utils/inviteService';
import '../styles/pages/InviteCreatePassword.css';
import backIcon from '../assets/icons/back-svgrepo-com.svg';
import signupPageImage from '../assets/Signup page image.png';
import passwordIcon from '../assets/icons/password-svgrepo-com.svg';
import eyeOpen from '../assets/icons/eye-closed-svgrepo-com.svg';
import eyeClosed from '../assets/icons/eye-off-svgrepo-com.svg';

export default function InviteCreatePassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');
  const storeId = searchParams.get('store');
  const storeNameParam = searchParams.get('storeName');

  useEffect(() => {
    const storedEmail = localStorage.getItem('inviteSignupEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!password || !confirmPassword) {
        toast.error('Please fill in both password fields');
        setLoading(false);
        return;
      }

      if (!validatePasswords()) {
        setLoading(false);
        return;
      }

      // Get data from localStorage (stored in InviteSignup)
      const fullName = localStorage.getItem('inviteSignupFullName');
      const email = localStorage.getItem('inviteSignupEmail');

      if (!fullName || !email) {
        toast.error('Session expired. Please start over.');
        navigate('/accept-invite');
        setLoading(false);
        return;
      }

      // Hash password using bcryptjs
      const passwordHash = bcryptjs.hashSync(password, 10);

      // Accept invitation with password hash (stores in staff table)
      const result = await acceptInvitation(
        token,
        fullName,
        email,
        passwordHash
      );

      if (result.success) {
        // storeId and storeName already saved in InviteSignup, no need to save again
        // Just ensure they persist
        if (storeId) localStorage.setItem('storeId', storeId);
        if (storeNameParam) localStorage.setItem('storeName', decodeURIComponent(storeNameParam));
        
        // Clear temporary localStorage items
        localStorage.removeItem('inviteSignupFullName');
        localStorage.removeItem('inviteSignupEmail');

        toast.success('Welcome! You can now login.');
        navigate('/signin');
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Error in handleFinish:', err);
      toast.error(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="invite-create-password-container">
      <div className="invite-create-password-top">
        <button className="back-btn" onClick={handleBack} disabled={loading}>
          <img src={backIcon} alt="Back" />
        </button>
        <img src={signupPageImage} alt="Signup" className="invite-create-password-image" />
      </div>

      <div className="invite-create-password-middle">
        <h1>Set your password</h1>
        <p className="invite-create-password-subtitle">Create a secure password for your account</p>
        {email && <p className="invite-email-display">Email: {email}</p>}

        <form onSubmit={handleFinish} className="form" noValidate>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <img src={passwordIcon} alt="Password" className="password-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
                className="password-input"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <img src={showPassword ? eyeOpen : eyeClosed} alt="Toggle" />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-field">
              <img src={passwordIcon} alt="Password" className="password-icon" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                disabled={loading}
                className="password-input"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <img src={showConfirmPassword ? eyeOpen : eyeClosed} alt="Toggle" />
              </button>
            </div>
            {passwordError && <p className="validation-message error">{passwordError}</p>}
          </div>

          <button type="submit" disabled={loading} className="continue-btn">
            {loading ? 'Processing...' : 'Finish'}
          </button>
        </form>
      </div>
    </div>
  );
}
