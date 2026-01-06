import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
import "../styles/pages/Signin.css";
import signinPageImage from "../assets/Signin page image.png";
import mailIcon from "../assets/icons/mail-alt-svgrepo-com.svg";
import passwordIcon from "../assets/icons/password-svgrepo-com.svg";
import eyeOpen from "../assets/icons/eye-closed-svgrepo-com.svg";
import eyeClosed from "../assets/icons/eye-off-svgrepo-com.svg";

export default function Signin({ onSignupClick, onForgotPassword }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate email
    if (!email.trim()) {
      toast.error("Please enter your email address");
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Validate password
    if (!password) {
      toast.error("Please enter your password");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message || "Failed to sign in");
        setLoading(false);
        return;
      }

      if (!data.session) {
        toast.error("Sign in failed. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Signed in successfully!");
      // Clear any stored signup data
      localStorage.removeItem('signupEmail');
      localStorage.removeItem('signupUserId');
      
      // Check if user already has a store in Supabase
      const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('store_name, admin_name')
        .eq('user_id', data.user.id)
        .single();

      if (!storeError && stores) {
        // Store exists, save to localStorage and go to dashboard
        localStorage.setItem('storeName', stores.store_name);
        localStorage.setItem('adminName', stores.admin_name);
        localStorage.setItem('userId', data.user.id);
        navigate('/dashboard');
      } else {
        // No store yet, go to create store
        navigate('/create-store');
      }
    } catch (err) {
      console.error('Signin error:', err);
      toast.error("An error occurred during sign in");
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      {/* Top Section: Image */}
      <div className="signin-top">
        <img src={signinPageImage} alt="Signin" className="signin-image" />
      </div>

      {/* Middle Section: Sign In Form */}
      <div className="signin-middle">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign into your account</p>

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

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <img
                src={passwordIcon}
                alt="Password"
                className="password-icon"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="your password"
                disabled={loading}
                className="password-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <img
                  src={showPassword ? eyeClosed : eyeOpen}
                  alt={showPassword ? "Hide password" : "Show password"}
                  className="eye-icon"
                />
              </button>
            </div>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              onForgotPassword();
            }} className="forgot-password-link">Forgot Password?</a>
          </div>

          <button type="submit" disabled={loading} className="signin-btn">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* Bottom Section: Sign Up Link */}
      <div className="signin-bottom">
        <p>
          Don't have an account? <a onClick={onSignupClick}>Sign up</a>
        </p>
      </div>
    </div>
  );
}
