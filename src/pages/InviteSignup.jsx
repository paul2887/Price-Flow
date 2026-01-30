import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../styles/pages/InviteSignup.css';
import backIcon from '../assets/icons/back-svgrepo-com.svg';
import signupPageImage from '../assets/Signup page image.png';
import mailIcon from '../assets/icons/mail-alt-svgrepo-com.svg';

export default function InviteSignup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState('');

  const token = searchParams.get('token');
  const storeId = searchParams.get('store');
  const storeNameParam = searchParams.get('storeName');

  useEffect(() => {
    if (storeNameParam) {
      setStoreName(decodeURIComponent(storeNameParam));
    }
  }, [storeNameParam]);

  const handleContinue = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!fullName.trim()) {
        toast.error('Please enter your full name');
        setLoading(false);
        return;
      }

      if (!email.trim()) {
        toast.error('Please enter your email address');
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Store data for next step
      localStorage.setItem('inviteSignupFullName', fullName.trim());
      localStorage.setItem('inviteSignupEmail', email.trim());
      localStorage.setItem('storeId', storeId);
      localStorage.setItem('storeName', storeName);

      // Go to password creation page
      navigate(`/invite-create-password?token=${token}&store=${storeId}&storeName=${storeNameParam}`);
    } catch (err) {
      console.error('Error in handleContinue:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="invite-signup-container">
      <div className="invite-signup-top">
        <button className="back-btn" onClick={handleBack} disabled={loading}>
          <img src={backIcon} alt="Back" />
        </button>
        <img src={signupPageImage} alt="Signup" className="invite-signup-image" />
      </div>

      <div className="invite-signup-middle">
        <h1>You're joining {storeName}</h1>
        <p className="invite-signup-subtitle">Fill in your details to continue</p>

        <form onSubmit={handleContinue} className="form" noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={loading}
              className="text-input"
            />
          </div>

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

          <button type="submit" disabled={loading} className="continue-btn">
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
