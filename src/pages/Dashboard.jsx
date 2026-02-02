import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../context/RoleContext';
import Header from '../components/Header';
import StoreHeader from '../components/StoreHeader';
import SearchHeader from '../components/SearchHeader';
import Loading from '../components/Loading';
import BottomNav from '../components/BottomNav';
import HomeTab from './HomeTab';
import StoreTab from './StoreTab';
import ProductsTab from './ProductsTab';
import '../styles/pages/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
  const { refreshKey, refreshRole, updateRole } = useRole();
  const [user, setUser] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [storeId, setStoreId] = useState('');
  const [adminName, setAdminName] = useState('');
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('activeTab') || 'home';
  });
  const [loading, setLoading] = useState(true);

  // Save activeTab to localStorage when it changes and trigger refresh
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('activeTab', tab);
    refreshRole(); // Refresh role from context
  };

  useEffect(() => {
    // Wait for AuthContext to finish loading before checking auth
    if (!authLoading) {
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authUser, authLoading]);

  const checkAuth = async () => {
    try {
      // Check if user is authenticated via AuthContext
      if (!isAuthenticated) {
        navigate('/signin');
        return;
      }

      // For invited members (stored in staff table)
      if (authUser?.isInvitedMember) {
        const userFullName = localStorage.getItem('userFullName');
        const storedStoreId = localStorage.getItem('storeId');
        const storedStoreName = localStorage.getItem('storeName');
        const userEmail = localStorage.getItem('userEmail');

        setUser({ isInvitedMember: true });
        setStoreId(storedStoreId);
        setStoreName(storedStoreName); // Use stored name as initial value
        setAdminName(userFullName); // Use the invited member's actual full name
        
        // Fetch role and store name from database
        if (userEmail && storedStoreId) {
          const [staffResponse, storeResponse] = await Promise.all([
            supabase
              .from('staff')
              .select('role')
              .eq('email', userEmail)
              .eq('store_id', storedStoreId)
              .single(),
            supabase
              .from('stores')
              .select('store_name, admin_name')
              .eq('id', storedStoreId)
              .single()
          ]);
          
          if (!staffResponse.error && staffResponse.data) {
            updateRole(staffResponse.data.role);
          }
          
          if (!storeResponse.error && storeResponse.data) {
            const store = storeResponse.data;
            setStoreName(store.store_name);
            setAdminName(store.admin_name);
            localStorage.setItem('storeId', storedStoreId);
            localStorage.setItem('storeName', store.store_name);
            localStorage.setItem('adminName', store.admin_name);
          }
        }
        
        setLoading(false);
        return;
      }

      // For regular Supabase auth users
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        navigate('/signin');
        return;
      }

      setUser(user);
      
      // Run store and staff queries in parallel instead of sequentially
      const [storeResponse, staffResponse] = await Promise.all([
        supabase
          .from('stores')
          .select('id, store_name, admin_name')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('staff')
          .select('role')
          .eq('user_id', user.id)
          .single()
      ]);

      if (!storeResponse.error && storeResponse.data) {
        const store = storeResponse.data;
        setStoreId(store.id);
        setStoreName(store.store_name);
        setAdminName(store.admin_name);
        localStorage.setItem('storeId', store.id);
        localStorage.setItem('storeName', store.store_name);
        localStorage.setItem('adminName', store.admin_name);
      }

      if (!staffResponse.error && staffResponse.data) {
        updateRole(staffResponse.data.role);
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

  if (loading || authLoading) {
    return <Loading />;
  }

  return (
    <div className="dashboard-container">
      {/* Header - changes based on activeTab */}
      {activeTab === 'store' ? (
        <StoreHeader storeName={storeName} />
      ) : activeTab === 'products' ? (
        <SearchHeader />
      ) : (
        <Header adminName={adminName} />
      )}

      {/* Store info - removed */}

      {/* Content - all tabs mounted, visibility toggled with CSS */}
      <div className="dashboard-content">
        <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
          <HomeTab storeName={storeName} storeId={storeId} isVisible={activeTab === 'home'} />
        </div>
        <div style={{ display: activeTab === 'store' ? 'block' : 'none' }}>
          <StoreTab user={user} onLogout={handleLogout} storeId={storeId} isVisible={activeTab === 'store'} refreshKey={refreshKey} />
        </div>
        <div style={{ display: activeTab === 'products' ? 'block' : 'none' }}>
          <ProductsTab storeId={storeId} isVisible={activeTab === 'products'} refreshKey={refreshKey} />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
