import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import bcryptjs from 'bcryptjs';
import '../styles/pages/SetPassword.css';
import signupPageImage from '../assets/Signup page image.png';

const PasswordIcon = () => (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12.5 8.5V7.5C12.5 6.94772 12.0523 6.5 11.5 6.5H1.5C0.947715 6.5 0.5 6.94772 0.5 7.5V13.5C0.5 14.0523 0.947715 14.5 1.5 14.5H11.5C12.0523 14.5 12.5 14.0523 12.5 13.5V12.5M12.5 8.5H8.5C7.39543 8.5 6.5 9.39543 6.5 10.5C6.5 11.6046 7.39543 12.5 8.5 12.5H12.5M12.5 8.5C13.6046 8.5 14.5 9.39543 14.5 10.5C14.5 11.6046 13.6046 12.5 12.5 12.5M3.5 6.5V3.5C3.5 1.84315 4.84315 0.5 6.5 0.5C8.15685 0.5 9.5 1.84315 9.5 3.5V6.5M12 10.5H13M10 10.5H11M8 10.5H9" stroke="#000000"></path> </g></svg>
);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const [checking, setChecking] = useState(true);
  const [resetType, setResetType] = useState(null); // 'store-owner' or 'staff'
  const [staffEmail, setStaffEmail] = useState(null);

  const token = searchParams.get('token');

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkSession = async () => {
    try {
      // Check if token param exists (staff reset)
      if (token) {
        const { data: resetToken, error: tokenError } = await supabase
          .from('password_reset_tokens')
          .select('email, used, expires_at')
          .eq('token', token)
          .single();

        if (tokenError || !resetToken) {
          toast.error('Invalid reset token');
          navigate('/forgot-password');
          return;
        }

        if (resetToken.used) {
          toast.error('This reset link has already been used');
          navigate('/forgot-password');
          return;
        }

        if (new Date(resetToken.expires_at) < new Date()) {
          toast.error('Reset link has expired');
          navigate('/forgot-password');
          return;
        }

        setResetType('staff');
        setStaffEmail(resetToken.email);
        setSessionValid(true);
        setChecking(false);
        return;
      }

      // No token, check for Supabase session (store owner)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        toast.error('Invalid or expired reset link');
        navigate('/forgot-password');
        return;
      }

      setResetType('store-owner');
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

      // Handle staff member reset (custom token)
      if (resetType === 'staff' && token && staffEmail) {
        // Hash password for staff table
        const passwordHash = bcryptjs.hashSync(password, 10);

        // Update staff password_hash
        const { error: updateError } = await supabase
          .from('staff')
          .update({ password_hash: passwordHash })
          .eq('email', staffEmail);

        if (updateError) {
          toast.error('Failed to update password');
          setLoading(false);
          return;
        }

        // Mark token as used
        const { error: markError } = await supabase
          .from('password_reset_tokens')
          .update({ used: true })
          .eq('token', token);

        if (markError) {
          console.error('Error marking token as used:', markError);
        }

        toast.success('Password reset successfully!');
        navigate('/signin');
        setLoading(false);
        return;
      }

      // Handle store owner reset (Supabase session)
      if (resetType === 'store-owner') {
        // Get current user's email
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          toast.error('Session error. Please try again.');
          setLoading(false);
          return;
        }

        const userEmail = user.email;

        // Update password in Supabase
        const { error } = await supabase.auth.updateUser({
          password: password
        });

        if (error) {
          toast.error(error.message || 'Failed to reset password');
          setLoading(false);
          return;
        }

        // Check if this user is an invited member (exists in staff table)
        const { data: staffMember, error: staffError } = await supabase
          .from('staff')
          .select('id, store_id')
          .eq('email', userEmail)
          .single();

        // If user is an invited member, save their store context and navigate to dashboard
        if (!staffError && staffMember) {
          localStorage.setItem('userId', userEmail);
          localStorage.setItem('storeId', staffMember.store_id);
          
          // Fetch store name for invited member
          const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('store_name')
            .eq('id', staffMember.store_id)
            .single();

          if (!storeError && store) {
            localStorage.setItem('storeName', store.store_name);
          }

          toast.success('Password reset successfully!');
          navigate('/dashboard');
          setLoading(false);
          return;
        }

        // If not an invited member, they're a store owner - go to signin to complete auth
        toast.success('Password reset successfully!');
        navigate('/signin');
        setLoading(false);
        return;
      }
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
              <PasswordIcon />
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
              <PasswordIcon />
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
