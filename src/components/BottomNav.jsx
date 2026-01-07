import homeIcon from '../assets/icons/home-svgrepo-com.svg';
import productsIcon from '../assets/icons/products-svgrepo-com.svg';
import storeIcon from '../assets/icons/store-svgrepo-com.svg';
import '../styles/components/BottomNav.css';

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { name: 'Home', id: 'home', icon: homeIcon },
    { name: 'Products', id: 'products', icon: productsIcon },
    { name: 'Store', id: 'store', icon: storeIcon }
  ];

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={tab.name}
          >
            <img src={tab.icon} alt={tab.name} className="nav-icon" />
            <span className="nav-label">{tab.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
