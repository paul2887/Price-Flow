import addIcon from "../assets/icons/cart-plus-svgrepo-com.svg";
import updateIcon from "../assets/icons/cart-check-svgrepo-com.svg";
import deleteIcon from "../assets/icons/cart-cross-svgrepo-com.svg";
import "../styles/pages/HomeTab.css";

export default function HomeTab({ storeName }) {
  return (
    <div className="home-tab-content">
      <div className="products-action-card">
        <button className="product-action-btn">
          <div className="icon-background">
            <img src={addIcon} alt="Add" className="action-icon" />
          </div>
          <span className="action-label">Add</span>
        </button>

        <button className="product-action-btn">
          <div className="icon-background">
            <img src={updateIcon} alt="Update" className="action-icon" />
          </div>
          <span className="action-label">Update</span>
        </button>

        <button className="product-action-btn">
          <div className="icon-background">
            <img src={deleteIcon} alt="Delete" className="action-icon" />
          </div>
          <span className="action-label">Delete</span>
        </button>
      </div>

      <div className="home-card">
        <h2>Welcome Home</h2>
        <p>Welcome to {storeName || "Your Store"}!</p>
        <p className="coming-soon">Coming soon...</p>
      </div>
    </div>
  );
}
