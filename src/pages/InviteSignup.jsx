import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../styles/pages/InviteSignup.css';
import signupPageImage from '../assets/Signup page image.png';

const BackIcon = () => (
  <svg fill="none" stroke="#000000" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M19 12H5M12 19l-7-7 7-7"></path></g></svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 8L8.44992 11.6333C9.73295 12.4886 10.3745 12.9163 11.0678 13.0825C11.6806 13.2293 12.3194 13.2293 12.9322 13.0825C13.6255 12.9163 14.2671 12.4886 15.5501 11.6333L21 8M6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V8.2C21 7.0799 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);

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
          <BackIcon />
        </button>
        <img src={signupPageImage} alt="Signup" className="invite-signup-image" />
      </div>

      <div className="invite-signup-middle">
        <h1>You're joining {storeName}</h1>
        <p className="invite-signup-subtitle">Fill in your details to continue</p>

        <form onSubmit={handleContinue} className="form" noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="fullname-field">
              <UserIcon />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  const value = e.target.value;
                  const words = value.split(' ');
                  
                  // Limit to 2 words maximum
                  if (words.length > 2) {
                    return;
                  }
                  
                  // Capitalize each word
                  const capitalizedWords = words.map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  );
                  
                  setFullName(capitalizedWords.join(' '));
                }}
                placeholder="John Doe"
                disabled={loading}
                className="fullname-input"
              />
            </div>
          </div>

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

          <button type="submit" disabled={loading} className="invite-signup-btn">
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
