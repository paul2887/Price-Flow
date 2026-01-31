import { useState } from 'react';
import '../styles/components/ProductHeader.css';

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
  >
    <circle cx="11" cy="11" r="8" stroke="#000000" strokeWidth="2" />
    <path
      d="M21 21L16.65 16.65"
      stroke="#000000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
            <SearchIcon />
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
