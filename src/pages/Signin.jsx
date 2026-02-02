import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import bcryptjs from "bcryptjs";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { saveToIndexedDB } from "../utils/indexedDBStorage";
import "../styles/pages/Signin.css";
import signinPageImage from "../assets/Signin page image.png";

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 8L8.44992 11.6333C9.73295 12.4886 10.3745 12.9163 11.0678 13.0825C11.6806 13.2293 12.3194 13.2293 12.9322 13.0825C13.6255 12.9163 14.2671 12.4886 15.5501 11.6333L21 8M6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V8.2C21 7.0799 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
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

export default function Signin({ onSignupClick, onForgotPassword }) {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
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
      // First, try signing in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!error && data.session) {
        // User authenticated successfully via Supabase auth
        toast.success("Signed in successfully!");
        localStorage.removeItem('signupEmail');
        localStorage.removeItem('signupUserId');
        
        // DEFENSIVE CHECK: Before checking stores table, check if user is an invited member
        // This handles the case where a password-reset invited member logs in with Supabase auth
        const { data: staffMember, error: staffError } = await supabase
          .from('staff')
          .select('id, store_id, role, full_name')
          .eq('email', email)
          .single();

        if (!staffError && staffMember) {
          // User is an invited member - use their staff record information
          localStorage.setItem('userId', email);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userFullName', staffMember.full_name || '');
          localStorage.setItem('userRole', staffMember.role);
          localStorage.setItem('storeId', staffMember.store_id);
          
          // Get store details for invited member
          const { data: storeData } = await supabase
            .from('stores')
            .select('store_name, admin_name')
            .eq('id', staffMember.store_id)
            .single();

          if (storeData) {
            localStorage.setItem('storeName', storeData.store_name);
            localStorage.setItem('adminName', storeData.admin_name);
          }

          // Save to IndexedDB for mobile persistence - WAIT FOR THIS
          const sessionData = {
            userEmail: email,
            userId: email,
            userFullName: staffMember.full_name || '',
            userRole: staffMember.role,
            storeId: staffMember.store_id,
            storeName: storeData?.store_name || '',
            adminName: storeData?.admin_name || ''
          };
          
          // IMPORTANT: Await this - don't proceed until IndexedDB save completes
          await saveToIndexedDB(sessionData);

          await checkAuth();
          navigate('/dashboard');
          setLoading(false);
          return;
        }

        // Not a staff member - check if user has a store (store owner)
        const { data: stores, error: storeError } = await supabase
          .from('stores')
          .select('store_name, admin_name')
          .eq('user_id', data.user.id)
          .single();

        if (!storeError && stores) {
          localStorage.setItem('storeName', stores.store_name);
          localStorage.setItem('adminName', stores.admin_name);
          localStorage.setItem('userId', data.user.id);
          navigate('/dashboard');
        } else {
          navigate('/create-store');
        }
        setLoading(false);
        return;
      }

      // If auth failed, try checking staff table (invited members with custom password)
      const { data: staffMember, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('email', email)
        .single();

      if (staffError) {
        toast.error("Invalid email or password");
        setLoading(false);
        return;
      }

      // Check if staff member has a password hash (invited member)
      if (!staffMember.password_hash) {
        toast.error("This email has not been set up yet. Please contact your store admin.");
        setLoading(false);
        return;
      }

      // Compare password with stored hash
      const passwordMatch = bcryptjs.compareSync(password, staffMember.password_hash);
      
      if (!passwordMatch) {
        toast.error("Invalid email or password");
        setLoading(false);
        return;
      }

      // Password matches - invited member can login
      toast.success("Signed in successfully!");
      localStorage.removeItem('signupEmail');
      localStorage.removeItem('signupUserId');
      
      // Set user info for invited member
      const userId = email; // Use email as ID for invited members
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userFullName', staffMember.full_name || '');
      localStorage.setItem('userRole', staffMember.role);
      localStorage.setItem('storeId', staffMember.store_id);
      
      // Get store details for invited member
      const { data: storeData } = await supabase
        .from('stores')
        .select('store_name, admin_name')
        .eq('id', staffMember.store_id)
        .single();

      if (storeData) {
        localStorage.setItem('storeName', storeData.store_name);
        localStorage.setItem('adminName', storeData.admin_name);
      }

      // Also save to IndexedDB for mobile persistence
      const sessionData = {
        userEmail: email,
        userId: userId,
        userFullName: staffMember.full_name || '',
        userRole: staffMember.role,
        storeId: staffMember.store_id,
        storeName: storeData?.store_name || '',
        adminName: storeData?.admin_name || ''
      };
      
      // IMPORTANT: Await this - don't proceed until IndexedDB save completes
      await saveToIndexedDB(sessionData);

      // Refresh auth context with new localStorage data
      await checkAuth();
      
      navigate('/dashboard');
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

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <PasswordIcon />
              <input
                id="password"
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
                {showPassword ? <EyeClosed /> : <EyeOpen />}
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
