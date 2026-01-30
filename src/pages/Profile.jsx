import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import userCircleIcon from "../assets/icons/user-circle-svgrepo-com.svg";
import backIcon from "../assets/icons/back-svgrepo-com.svg";
import LogoutModal from "../components/LogoutModal";
import RoleBadge from "../components/RoleBadge";
import "../styles/pages/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  // Role is now managed by RoleContext, used by RoleBadge component
  const [user, setUser] = useState(null);
  const [adminName, setAdminName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isInvitedMember, setIsInvitedMember] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Check if user is an invited member
        if (authUser?.isInvitedMember) {
          const userFullName = localStorage.getItem("userFullName");
          const userEmail = localStorage.getItem("userEmail");
          const storeId = localStorage.getItem("storeId");
          let storedStoreName = localStorage.getItem("storeName");

          setUser({ email: userEmail, isInvitedMember: true });
          setAdminName(userFullName || "");
          setStoreName(storedStoreName || "");
          setIsInvitedMember(true);
          
          // If storeName is not in localStorage, fetch it from database
          if (!storedStoreName && storeId) {
            try {
              const { data: storeData } = await supabase
                .from("stores")
                .select("store_name, admin_name")
                .eq("id", storeId)
                .single();

              if (storeData) {
                setStoreName(storeData.store_name || "");
                setAdminName(storeData.admin_name || "");
                localStorage.setItem("storeName", storeData.store_name);
                localStorage.setItem("adminName", storeData.admin_name);
              }
            } catch (err) {
              console.error("Error fetching store data:", err);
            }
          }
          
          setLoading(false);
          return;
        }

        // Regular Supabase auth user
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          navigate("/signin");
          return;
        }

        setUser(user);

        // Fetch latest data from Supabase stores table
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .select("admin_name, store_name")
          .eq("user_id", user.id)
          .single();

        if (!storeError && storeData) {
          setAdminName(storeData.admin_name || "");
          setStoreName(storeData.store_name || "");
          localStorage.setItem("adminName", storeData.admin_name || "");
          localStorage.setItem("storeName", storeData.store_name || "");
        } else {
          // Fall back to localStorage if query fails
          const cachedStoreName = localStorage.getItem("storeName");
          const cachedAdminName = localStorage.getItem("adminName");
          if (cachedStoreName) setStoreName(cachedStoreName);
          if (cachedAdminName) setAdminName(cachedAdminName);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [navigate, authUser]);

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("storeName");
    localStorage.removeItem("adminName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("activeTab");
    navigate("/signin");
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleEditName = () => {
    setTempName(adminName);
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) return;

    try {
      // For invited members - update staff table
      if (isInvitedMember) {
        const userEmail = localStorage.getItem("userEmail");
        
        const { error } = await supabase
          .from("staff")
          .update({ full_name: tempName })
          .eq("email", userEmail);

        if (error) {
          console.error("Error updating name in Supabase:", error);
          alert("Failed to save name. Please try again.");
          return;
        }

        localStorage.setItem("userFullName", tempName);
        setAdminName(tempName);
        setEditingName(false);
        return;
      }

      // For regular Supabase auth users - update stores table
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        console.error("User not authenticated");
        return;
      }

      // Update localStorage FIRST to ensure it persists
      localStorage.setItem("adminName", tempName);
      setAdminName(tempName);

      // Update in stores table
      const { data, error } = await supabase
        .from("stores")
        .update({ admin_name: tempName })
        .eq("user_id", currentUser.id)
        .select();

      if (error) {
        console.error("Error updating name in Supabase:", error);
        alert("Failed to save name. Please try again.");
        return;
      }

      setEditingName(false);
    } catch (err) {
      console.error("Save name error:", err);
      alert("Error saving name: " + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingName(false);
    setTempName("");
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <header className="profile-page-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          title="Go Back"
        >
          <img src={backIcon} alt="Back" className="back-icon" />
        </button>
        <h1>My Profile</h1>
      </header>

      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-info-card">
            <div className="profile-header-section">
              <img src={userCircleIcon} alt="User" className="profile-icon" />
              <div className="profile-name-section">
                <h2>{adminName || "User"}</h2>
                <RoleBadge useLocalStorage={true} />
              </div>
            </div>
            <div className="info-item-container">
              <div className="info-item">
                <label>Profile Name</label>
                {editingName ? (
                  <div className="name-edit-container">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Enter your name"
                      className="name-input"
                      autoFocus
                    />
                    <div className="name-edit-buttons">
                      <button
                        onClick={handleSaveName}
                        className="name-save-btn"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="name-cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="info-value">
                    <p>{adminName || "User"}</p>
                    <button
                      onClick={handleEditName}
                      className="edit-icon-btn"
                      title="Edit name"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                          <path d="M10 7L15 12L10 17" stroke="#007bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </g>
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="info-item">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>

              <div className="info-item">
                <label>Store Name</label>
                <p>{storeName || "No store"}</p>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            Log Out
          </button>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </div>
  );
}
