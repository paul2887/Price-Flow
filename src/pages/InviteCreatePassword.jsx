import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import bcryptjs from 'bcryptjs';
import { acceptInvitation } from '../utils/inviteService';
import '../styles/pages/InviteCreatePassword.css';
import signupPageImage from '../assets/Signup page image.png';

const BackIcon = () => (
  <svg fill="none" stroke="#000000" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M19 12H5M12 19l-7-7 7-7"></path></g></svg>
);

const PasswordIcon = () => (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12.5 8.5V7.5C12.5 6.94772 12.0523 6.5 11.5 6.5H1.5C0.947715 6.5 0.5 6.94772 0.5 7.5V13.5C0.5 14.0523 0.947715 14.5 1.5 14.5H11.5C12.0523 14.5 12.5 14.0523 12.5 13.5V12.5M12.5 8.5H8.5C7.39543 8.5 6.5 9.39543 6.5 10.5C6.5 11.6046 7.39543 12.5 8.5 12.5H12.5M12.5 8.5C13.6046 8.5 14.5 9.39543 14.5 10.5C14.5 11.6046 13.6046 12.5 12.5 12.5M3.5 6.5V3.5C3.5 1.84315 4.84315 0.5 6.5 0.5C8.15685 0.5 9.5 1.84315 9.5 3.5V6.5M12 10.5H13M10 10.5H11M8 10.5H9" stroke="#000000"></path> </g></svg>
);

const EyeOpen = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="style=stroke"> <g id="eye-open"> <path id="vector (Stroke)" fill-rule="evenodd" clip-rule="evenodd" d="M12 9.75C10.755 9.75 9.75 10.755 9.75 12C9.75 13.245 10.755 14.25 12 14.25C13.245 14.25 14.25 13.245 14.25 12C14.25 10.755 13.245 9.75 12 9.75ZM8.25 12C8.25 9.92657 9.92657 8.25 12 8.25C14.0734 8.25 15.75 9.92657 15.75 12C15.75 14.0734 14.0734 15.75 12 15.75C9.92657 15.75 8.25 14.0734 8.25 12Z" fill="#000000"></path> <path id="vector (Stroke)_2" fill-rule="evenodd" clip-rule="evenodd" d="M2.28282 9.27342C4.69299 5.94267 8.19618 3.96997 12.0001 3.96997C15.8042 3.96997 19.3075 5.94286 21.7177 9.27392C22.2793 10.0479 22.5351 11.0421 22.5351 11.995C22.5351 12.948 22.2792 13.9424 21.7174 14.7165C19.3072 18.0473 15.804 20.02 12.0001 20.02C8.19599 20.02 4.69264 18.0471 2.28246 14.716C1.7209 13.942 1.46509 12.9478 1.46509 11.995C1.46509 11.0419 1.721 10.0475 2.28282 9.27342ZM12.0001 5.46997C8.74418 5.46997 5.66753 7.15436 3.49771 10.1532L3.497 10.1542C3.15906 10.6197 2.96509 11.2866 2.96509 11.995C2.96509 12.7033 3.15906 13.3703 3.497 13.8357L3.49771 13.8367C5.66753 16.8356 8.74418 18.52 12.0001 18.52C15.256 18.52 18.3326 16.8356 20.5025 13.8367L20.5032 13.8357C20.8411 13.3703 21.0351 12.7033 21.0351 11.995C21.0351 11.2866 20.8411 10.6197 20.5032 10.1542L20.5025 10.1532C18.3326 7.15436 15.256 5.46997 12.0001 5.46997Z" fill="#000000"></path> </g> </g> </g></svg>
);

const EyeClosed = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 14.8335C21.3082 13.3317 22 12 22 12C22 12 18.3636 5 12 5C11.6588 5 11.3254 5.02013 11 5.05822C10.6578 5.09828 10.3244 5.15822 10 5.23552M12 9C12.3506 9 12.6872 9.06015 13 9.17071C13.8524 9.47199 14.528 10.1476 14.8293 11C14.9398 11.3128 15 11.6494 15 12M3 3L21 21M12 15C11.6494 15 11.3128 14.9398 11 14.8293C10.1476 14.528 9.47198 13.8524 9.1707 13C9.11386 12.8392 9.07034 12.6721 9.04147 12.5M4.14701 9C3.83877 9.34451 3.56234 9.68241 3.31864 10C2.45286 11.1282 2 12 2 12C2 12 5.63636 19 12 19C12.3412 19 12.6746 18.9799 13 18.9418" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);

export default function InviteCreatePassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
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

  // Real-time validation
  useEffect(() => {
    if (!password && !confirmPassword) {
      setPasswordError('');
      setConfirmPasswordError('');
      return;
    }

    // Check password length
    if (password && password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else if (password) {
      setPasswordError('');
    }

    // Check if passwords match
    if (password && confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword) {
      setConfirmPasswordError('');
    }
  }, [password, confirmPassword]);

  const hasErrors = () => {
    return !!passwordError || !!confirmPasswordError || !password || !confirmPassword;
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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
          <BackIcon />
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
              <PasswordIcon />
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
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
            {passwordError && <p className="validation-message error">{passwordError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-field">
              <PasswordIcon />
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
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
            {confirmPasswordError && <p className="validation-message error">{confirmPasswordError}</p>}
          </div>

          <button type="submit" disabled={loading || hasErrors()} className="invite-create-password-btn">
            {loading ? 'Processing...' : 'Finish'}
          </button>
        </form>
      </div>
    </div>
  );
}
