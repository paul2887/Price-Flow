import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import '../styles/pages/CreateStore.css';
import createStorePageImage from '../assets/create-store-page-image.png';
import storeIcon from '../assets/icons/store-svgrepo-com.svg';

export default function CreateStore() {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      toast.error('Please enter a shop name');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('User not authenticated');
        navigate('/signin');
        return;
      }

      // Save store to Supabase database
      const { error } = await supabase
        .from('stores')
        .insert([
          {
            user_id: user.id,
            store_name: storeName.trim()
          }
        ]);

      if (error) {
        toast.error(error.message || 'Failed to create store');
        setLoading(false);
        return;
      }

      // Also save to localStorage for quick access
      localStorage.setItem('storeName', storeName.trim());
      localStorage.setItem('userId', user.id);
      
      toast.success('Store created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Store creation error:', err);
      toast.error('Failed to create store');
      setLoading(false);
    }
  };

  return (
    <div className="create-store-container">
      {/* Top Section: Image Only */}
      <div className="create-store-top">
        <img src={createStorePageImage} alt="Create Store" className="create-store-page-image" />
      </div>

      {/* Middle Section: Store Name Form */}
      <div className="create-store-middle">
        <h1>Shop Name</h1>
        <p className="subtitle">Enter your shop name to continue</p>
        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="form-group">
            <label htmlFor="storeName">Shop Name</label>
            <div className="store-field">
              <img src={storeIcon} alt="Store" className="store-icon" />
              <input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Shop Name"
                disabled={loading}
                className="store-name-input"
              />
            </div>
          </div>
          <button type="submit" disabled={loading || !storeName.trim()} className="continue-btn">
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
