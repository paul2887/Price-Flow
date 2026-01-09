import '../styles/pages/StoreTab.css';

export default function StoreTab({ user }) {
  return (
    <div className="store-tab-content">
      <div className="store-card">
        <h2>Store Status</h2>
        <p>Your store is active and ready to use!</p>
      </div>

      <div className="store-card">
        <h2>Account</h2>
        <p>Email: {user?.email}</p>
        <p>User ID: {user?.id}</p>
      </div>
    </div>
  );
}
