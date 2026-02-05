import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { RoleProvider } from "./context/RoleContext";
import { isMobileDevice, checkMobileOnResize } from "./utils/mobileCheck";
import { getFromIndexedDB } from "./utils/indexedDBStorage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Onboarding from "./pages/Onboarding";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import InviteSignup from "./pages/InviteSignup";
import InviteCreatePassword from "./pages/InviteCreatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import EmailVerified from "./pages/EmailVerified";
import Setup from "./pages/Setup";
import SetPassword from "./pages/SetPassword";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import BlockedScreen from "./pages/BlockedScreen";
import CreateStore from "./pages/CreateStore";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AcceptInvite from "./pages/AcceptInvite";
import "./styles/global.css";
import "./App.css";

function App() {
  const [isMobile, setIsMobile] = useState(isMobileDevice());
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => {
    if (window.location.pathname === "/verify-email") {
      return localStorage.getItem("signupEmail") || "";
    }
    return "";
  });

  useEffect(() => {
    const unsubscribe = checkMobileOnResize(setIsMobile);
    return unsubscribe;
  }, []);

  // Check IndexedDB on startup and redirect to dashboard if session exists
  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      // Only check if we're on a public route (root, signup, signin)
      const publicPaths = ['/', '/signup', '/signin', '/onboarding'];
      if (!publicPaths.includes(window.location.pathname)) {
        return; // Don't redirect if already on a protected route
      }
      
      try {
        const sessionData = await getFromIndexedDB();
        
        if (sessionData && sessionData.userEmail && sessionData.userId) {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('Error checking IndexedDB on startup:', err);
      }
    };
    
    checkSessionAndRedirect();
  }, [navigate]);

  // Handle email confirmation token from URL fragment
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token') && hash.includes('type=email_confirmation')) {
      // Email confirmation token detected - navigate to email-verified
      navigate('/email-verified', { replace: true });
    }
  }, [navigate]);

  const handleSignupProceed = (userEmail) => {
    setEmail(userEmail);
    // Navigate to verify email screen (user checks their email for verification link)
    navigate("/verify-email");
  };

  const handleBackFromVerify = () => {
    navigate("/signup");
    setEmail("");
  };

  const handleGoToSignin = () => {
    navigate("/signin");
    setEmail("");
  };

  const handleGoToSignup = () => {
    navigate("/signup");
    setEmail("");
  };

  const handleBackToOnboarding = () => {
    navigate("/");
    setEmail("");
    localStorage.removeItem("hasSeenOnboarding");
  };

  const handleGoToForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleBackFromForgotPassword = () => {
    navigate("/signin");
  };

  if (!isMobile) {
    return <BlockedScreen />;
  }

  const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");

  return (
    <AuthProvider>
      <RoleProvider>
      <Toaster
        position="top-center"
        reverseOrder={true}
        gutter={-40}
        limit={3}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#007bff",
            color: "#fff",
            fontSize: "1.6rem",
            padding: "1.2rem 1.6rem",
            borderRadius: "0.5rem",
          },
          success: {
            duration: 3000,
            style: {
              background: "#007bff",
            },
          },
          error: {
            duration: 3000,
            style: {
              background: "#dc3545",
            },
          },
        }}
      />
      <Routes>
        <Route
          path="/"
          element={
            hasSeenOnboarding ? (
              <Navigate to="/signup" replace />
            ) : (
              <Onboarding
                onGetStarted={() => {
                  localStorage.setItem("hasSeenOnboarding", "true");
                  navigate("/signup");
                }}
              />
            )
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup
                onProceed={handleSignupProceed}
                onSigninClick={handleGoToSignin}
                onBack={handleBackToOnboarding}
              />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email"
          element={<VerifyEmail email={email} onBack={handleBackFromVerify} />}
        />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/setup" element={<Setup />} />
        <Route
          path="/set-password"
          element={
            <ProtectedRoute>
              <SetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <Signin
                onSignupClick={handleGoToSignup}
                onForgotPassword={handleGoToForgotPassword}
              />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword onBack={handleBackFromForgotPassword} />}
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/create-store"
          element={
            <ProtectedRoute>
              <CreateStore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/invite-signup" element={<InviteSignup />} />
        <Route path="/invite-create-password" element={<InviteCreatePassword />} />
      </Routes>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
