import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/pages/SetPassword.css';
import signupPageImage from '../assets/signup page image.png';
import passwordIcon from '../assets/icons/password-svgrepo-com.svg';

export default function SetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      
      // Update user password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error(error.message || 'Failed to set password');
        setLoading(false);
        return;
      }

      toast.success('Password set successfully!');
      // Clear stored signup data
      localStorage.removeItem('signupEmail');
      localStorage.removeItem('signupUserId');
      // Navigate to create store
      navigate('/create-store');
    } catch (err) {
      console.error('Password set error:', err);
      toast.error('Failed to set password. Please try again.');
      setLoading(false);
    }
  };

  const isFormValid = password && confirmPassword && password === confirmPassword && password.length >= 8;

  return (
    <div className="set-password-container">
      {/* Top Section: Image */}
      <div className="set-password-top">
        <img src={signupPageImage} alt="Set Password" className="set-password-image" />
      </div>

      {/* Middle Section: Create Password Form */}
      <div className="set-password-middle">
        <h1>Create Your Password</h1>
        <p className="subtitle">Set a password to secure your account</p>

        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <img src={passwordIcon} alt="Password" className="password-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Enter password"
                disabled={loading}
                className="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password.length > 0 && password.length < 8 && (
              <p className="validation-message error">
                At least 8 characters
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-field">
              <img src={passwordIcon} alt="Password" className="password-icon" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Confirm password"
                disabled={loading}
                className="password-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="validation-message error">
                Passwords match
              </p>
            )}
          </div>

          {passwordError && <p className="error-message">{passwordError}</p>}

          <button type="submit" disabled={!isFormValid || loading} className="set-password-btn">
            {loading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
