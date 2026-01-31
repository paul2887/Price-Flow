import { useState } from 'react';
import '../styles/components/ProductHeader.css';

export default function ProductHeader({ onSearchChange, searchQuery }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    onSearchChange('');
  };

  return (
    <div className="product-header">
      {!isSearchOpen ? (
        <>
          <h2 className="product-header-title">Products</h2>
          <button 
            className="search-icon-btn"
            onClick={() => setIsSearchOpen(true)}
          >
            <img src={searchIcon} alt="Search" className="search-icon" />
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            className="product-search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
          />
          <button 
            className="cancel-btn"
            onClick={handleSearchClose}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
