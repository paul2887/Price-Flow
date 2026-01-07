import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import Header from '../components/Header';
import StoreHeader from '../components/StoreHeader';
import Loading from '../components/Loading';
import BottomNav from '../components/BottomNav';
import '../styles/pages/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('activeTab') || 'home';
  });
  const [loading, setLoading] = useState(true);

  // Save activeTab to localStorage when it changes
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('activeTab', tab);
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        navigate('/signin');
        return;
      }

      setUser(user);
      
      // Fetch store from Supabase
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('store_name, admin_name')
        .eq('user_id', user.id)
        .single();

      if (!storeError && store) {
        setStoreName(store.store_name);
        setAdminName(store.admin_name);
        localStorage.setItem('storeName', store.store_name);
        localStorage.setItem('adminName', store.admin_name);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Failed to logout');
        return;
      }
      
      localStorage.removeItem('storeName');
      localStorage.removeItem('userId');
      localStorage.removeItem('signupEmail');
      localStorage.removeItem('signupUserId');
      
      toast.success('Logged out successfully');
      navigate('/signin');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="dashboard-container">
      {/* Header - changes based on activeTab */}
      {activeTab === 'store' ? (
        <StoreHeader storeName={storeName} />
      ) : (
        <Header adminName={adminName} />
      )}

      {/* Store info - removed */}

      {/* Content - changes based on activeTab */}
      <div className="dashboard-content">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <>
            <div className="dashboard-header header-spacer">
              <p className="store-name">spacer</p>
            </div>
            <div className="dashboard-card">
              <h2>Welcome Home</h2>
              <p>Welcome to {storeName || 'Your Store'}!</p>
              <p className="coming-soon">
                Coming soon...
              </p>
            </div>
          </>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <>
            <div className="dashboard-header header-spacer">
              <p className="store-name">spacer</p>
            </div>
            <div className="dashboard-card">
              <h2>Store Status</h2>
              <p>Your store is active and ready to use!</p>
            </div>

            <div className="dashboard-card">
              <h2>Account</h2>
              <p>Email: {user?.email}</p>
              <p>User ID: {user?.id}</p>
            </div>

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <div className="dashboard-header header-spacer-store">
              <p className="store-name">spacer</p>
            </div>
            <div className="dashboard-card">
              <h2>Products</h2>
              <p>Manage your store products here
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
