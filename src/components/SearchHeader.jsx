import { useState } from 'react';
import searchIcon from '../assets/icons/search-svgrepo-com.svg';
import '../styles/components/SearchHeader.css';

export default function SearchHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <header className="search-header">
      <div className="search-input-wrapper">
        <img src={searchIcon} alt="Search" className="search-icon-input" />
        <input
          type="text"
          placeholder="Search Products"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button className="clear-button" onClick={handleClear} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>
    </header>
  );
}
