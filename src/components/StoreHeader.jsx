import storeIcon from '../assets/icons/store-svgrepo-com.svg';
import '../styles/components/StoreHeader.css';

export default function StoreHeader({ storeName }) {
  return (
    <header className="store-header">
      <div className="store-header-content">
        <div className="store-icon-wrapper">
          <img src={storeIcon} alt="Store" className="store-icon" />
        </div>
        <div className="store-header-text">
          <h2 className="store-title">{storeName || 'Your Store'}</h2>
        </div>
      </div>
    </header>
  );
}
