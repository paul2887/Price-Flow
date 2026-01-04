import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { isMobileDevice, checkMobileOnResize } from './utils/mobileCheck';
import Onboarding from './pages/Onboarding';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import BlockedScreen from './pages/BlockedScreen';
import './styles/global.css';
import './App.css';

function App() {
  const [isMobile, setIsMobile] = useState(isMobileDevice());
  const [currentPage, setCurrentPage] = useState(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    return hasSeenOnboarding ? 'signup' : 'onboarding';
  });
  const [email, setEmail] = useState('');

  useEffect(() => {
    const unsubscribe = checkMobileOnResize(setIsMobile);
    return unsubscribe;
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setCurrentPage('signup');
  };

  const handleSignupProceed = (userEmail) => {
    setEmail(userEmail);
    setCurrentPage('verify-email');
  };

  const handleBackFromVerify = () => {
    setCurrentPage('signup');
    setEmail('');
  };

  const handleGoToSignin = () => {
    setCurrentPage('signin');
    setEmail('');
  };

  const handleGoToSignup = () => {
    setCurrentPage('signup');
    setEmail('');
  };

  const handleBackToOnboarding = () => {
    setCurrentPage('onboarding');
    setEmail('');
    localStorage.removeItem('hasSeenOnboarding');
  };

  const handleGoToForgotPassword = () => {
    setCurrentPage('forgot-password');
  };

  const handleBackFromForgotPassword = () => {
    setCurrentPage('signin');
  };

  if (!isMobile) {
    return <BlockedScreen />;
  }

  return (
    <>
      <Toaster 
        position="top-center"
        reverseOrder={true}
        gutter={-40}
        limit={3}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#007bff',
            color: '#fff',
            fontSize: '1.6rem',
            padding: '1.2rem 1.6rem',
            borderRadius: '0.5rem',
          },
          success: {
            duration: 3000,
            style: {
              background: '#007bff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#dc3545',
            },
          },
        }}
      />
      {currentPage === 'onboarding' && (
        <Onboarding onGetStarted={handleOnboardingComplete} />
      )}
      {currentPage === 'signup' && (
        <Signup onProceed={handleSignupProceed} onSigninClick={handleGoToSignin} onBack={handleBackToOnboarding} />
      )}
      {currentPage === 'verify-email' && (
        <VerifyEmail email={email} onBack={handleBackFromVerify} />
      )}
      {currentPage === 'signin' && (
        <Signin onSignupClick={handleGoToSignup} onForgotPassword={handleGoToForgotPassword} />
      )}
      {currentPage === 'forgot-password' && (
        <ForgotPassword onBack={handleBackFromForgotPassword} />
      )}
    </>
  );
}

export default App;
