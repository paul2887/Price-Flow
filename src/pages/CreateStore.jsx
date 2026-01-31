import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
import "../styles/pages/CreateStore.css";
import createStorePageImage from "../assets/create-store-page-image.png";

const StoreIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="-2.4 -2.4 28.80 28.80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="#CCCCCC"
      strokeWidth="0.048"
    />
    <g id="SVGRepo_iconCarrier">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 3C3.89543 3 3 3.89543 3 5V6.83772L1.49006 11.3675C1.10052 12.5362 1.8474 13.7393 3 13.963V20C3 21.1046 3.89543 22 5 22H9H10H14H15H19C20.1046 22 21 21.1046 21 20V13.963C22.1526 13.7393 22.8995 12.5362 22.5099 11.3675L21 6.83772V5C21 3.89543 20.1046 3 19 3H5ZM15 20H19V14H17.5H12H6.5H5V20H9V17C9 15.3431 10.3431 14 12 14C13.6569 14 15 15.3431 15 17V20ZM11 20H13V17C13 16.4477 12.5523 16 12 16C11.4477 16 11 16.4477 11 17V20ZM3.38743 12L4.72076 8H6.31954L5.65287 12H4H3.38743ZM7.68046 12L8.34713 8H11V12H7.68046ZM13 12V8H15.6529L16.3195 12H13ZM18.3471 12L17.6805 8H19.2792L20.6126 12H20H18.3471ZM19 5V6H16.5H12H7.5H5V5H19Z"
        fill="#000000"
      />
    </g>
  </svg>
);

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
      toast.error("Please enter a store owner name");
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

      // Check if user already has a store
      const { data: existingStore } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingStore) {
        toast.info("You already have a store! Redirecting to dashboard...");
        navigate("/dashboard");
        return;
      }

      // Save store to Supabase database
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .insert([
          {
            user_id: user.id,
            store_name: storeName.trim(),
            admin_name: adminName.trim(),
          },
        ])
        .select()
        .single();

      if (storeError) {
        toast.error(storeError.message || "Failed to create store");
        setLoading(false);
        return;
      }

      // Create staff record for store owner
      const { error: staffError } = await supabase
        .from("staff")
        .insert([
          {
            store_id: storeData.id,
            user_id: user.id,
            email: user.email,
            role: "Store Owner",
          },
        ])
        .select();

      if (staffError) {
        console.error('Staff insert error:', staffError);
        toast.error(staffError.message || "Failed to add store owner to staff");
        setLoading(false);
        return;
      }

      // Update user profile with the admin name (create if doesn't exist)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          { id: user.id, full_name: adminName.trim() },
          { onConflict: "id" }
        );

      if (profileError) {
        console.error('Profile update error:', profileError);
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
              <StoreIcon />
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
