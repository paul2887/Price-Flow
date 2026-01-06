import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import '../styles/pages/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(true);

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
        .select('store_name')
        .eq('user_id', user.id)
        .single();

      if (!storeError && store) {
        setStoreName(store.store_name);
        localStorage.setItem('storeName', store.store_name);
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
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to {storeName || 'Your Store'}</h1>
        <p className="user-email">{user?.email}</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Store Status</h2>
          <p>Your store is active and ready to use!</p>
        </div>

        <div className="dashboard-card">
          <h2>Account</h2>
          <p>Email: {user?.email}</p>
          <p>User ID: {user?.id}</p>
        </div>
      </div>

      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}
