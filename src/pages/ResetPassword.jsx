import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/pages/SetPassword.css';
import signupPageImage from '../assets/signup page image.png';
import passwordIcon from '../assets/icons/password-svgrepo-com.svg';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkSession = async () => {
    try {
      // Check if user has a valid session (from reset link)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        toast.error('Invalid or expired reset link');
        navigate('/forgot-password');
        return;
      }

      setSessionValid(true);
    } catch (err) {
      console.error('Session check error:', err);
      toast.error('An error occurred');
      navigate('/forgot-password');
    } finally {
      setChecking(false);
    }
  };

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validatePasswords()) {
      return;
    }

    try {
      setLoading(true);

      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error(error.message || 'Failed to reset password');
        setLoading(false);
        return;
      }

      toast.success('Password reset successfully!');
      navigate('/signin');
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error('Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  const isFormValid = password && confirmPassword && password === confirmPassword && password.length >= 8;

  if (checking) {
    return (
      <div className="set-password-container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '1.5rem',
          color: '#666'
        }}>
          Verifying reset link...
        </div>
      </div>
    );
  }

  if (!sessionValid) {
    return null;
  }

  return (
    <div className="set-password-container">
      {/* Top Section: Image */}
      <div className="set-password-top">
        <img src={signupPageImage} alt="Reset Password" className="set-password-image" />
      </div>

      {/* Middle Section: Reset Password Form */}
      <div className="set-password-middle">
        <h1>Reset Password</h1>
        <p className="subtitle">Enter your new password</p>

        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <div className="password-field">
              <img src={passwordIcon} alt="Password" className="password-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="At least 8 characters"
                disabled={loading}
                className="password-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-field">
              <img src={passwordIcon} alt="Confirm" className="password-icon" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Confirm your password"
                disabled={loading}
                className="password-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && (
              <div className="error-message">
                <p>{passwordError}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="set-password-btn"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
