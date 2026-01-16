import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
import "../styles/pages/CreateStore.css";
import createStorePageImage from "../assets/create-store-page-image.png";
import storeIcon from "../assets/icons/store-svgrepo-com.svg";

export default function CreateStore() {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      toast.error("Please enter a shop name");
      return;
    }
    if (!adminName.trim()) {
      toast.error("Please enter an admin name");
      return;
    }

    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("User not authenticated");
        navigate("/signin");
        return;
      }

      // Save store to Supabase database
      const { error } = await supabase.from("stores").insert([
        {
          user_id: user.id,
          store_name: storeName.trim(),
          admin_name: adminName.trim(),
        },
      ]);

      if (error) {
        toast.error(error.message || "Failed to create store");
        setLoading(false);
        return;
      }

      // Also save to localStorage for quick access
      localStorage.setItem("storeName", storeName.trim());
      localStorage.setItem("adminName", adminName.trim());
      localStorage.setItem("userId", user.id);

      toast.success("Store created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Store creation error:", err);
      toast.error("Failed to create store");
      setLoading(false);
    }
  };

  return (
    <div className="cs-container">
      {/* Top Section: Image Only */}
      <div className="cs-top">
        <img
          src={createStorePageImage}
          alt="Create Store"
          className="cs-image"
        />
      </div>

      {/* Middle Section: Store Name Form */}
      <div className="cs-middle">
        <h1 className="cs-title">Setup Your Store</h1>
        <p className="cs-subtitle">Enter your store details to continue</p>
        <form onSubmit={handleSubmit} className="cs-form" noValidate>
          <div className="cs-form-group">
            <label htmlFor="storeName" className="cs-label">Shop Name</label>
            <div className="cs-input-field">
              <img src={storeIcon} alt="Store" className="cs-input-icon" />
              <input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Shop Name"
                disabled={loading}
                className="cs-input"
              />
            </div>
          </div>

          <div className="cs-form-group">
            <label htmlFor="adminName" className="cs-label">Admin Name</label>
            <div className="cs-input-field">
              <svg
                className="cs-input-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                id="adminName"
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Your Name"
                disabled={loading}
                className="cs-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !storeName.trim() || !adminName.trim()}
            className="cs-btn"
          >
            {loading ? "Processing..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
