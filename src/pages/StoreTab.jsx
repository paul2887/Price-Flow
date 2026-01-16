import { useState } from 'react';
import ProductStatusModal from '../components/ProductStatusModal';
import '../styles/pages/StoreTab.css';

export default function StoreTab() {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [activeDotsButton, setActiveDotsButton] = useState(null);
  
  const storeMembers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Sales Person' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Sales Person' },
    { id: 4, name: 'Sarah Lee', email: 'sarah@example.com', role: 'Admin' },
  ];

  const stats = [
    { id: 'total', label: 'Total Products', value: 100 },
    { id: 'instock', label: 'In Stock', value: 87 },
    { id: 'soldout', label: 'Sold Out', value: 13 },
  ];

  const outOfStockProducts = [
    { id: 1, name: 'Product A', size: 'Medium', availability: false },
    { id: 2, name: 'Product B', size: 'Large', availability: false },
    { id: 3, name: 'Product C', size: 'Small', availability: false },
    { id: 4, name: 'Product D', size: 'Medium', availability: false },
    { id: 5, name: 'Product E', size: 'Large', availability: false },
    { id: 6, name: 'Product F', size: 'Small', availability: false },
    { id: 7, name: 'Product G', size: 'Medium', availability: false },
    { id: 8, name: 'Product H', size: 'Large', availability: false },
  ];

  const handleOpenModal = (productId, e) => {
    e.stopPropagation();
    setSelectedProductId(productId);
    setActiveDotsButton(productId);
  };

  const handleCloseModal = () => {
    setSelectedProductId(null);
    setActiveDotsButton(null);
  };

  const selectedProduct = selectedProductId 
    ? outOfStockProducts.find(p => p.id === selectedProductId)
    : null;

  return (
    <div className="store-tab-content">
      <div className="store-card-section">
        <h3 className="store-card-label">Products Stats</h3>
        <div className="store-stats-card">
          <div className="store-stats-header">
            {stats.map((stat) => (
              <div 
                key={stat.id} 
                className="store-stat-item"
              >
                <p className="store-stat-label">{stat.label}</p>
                <p className="store-stat-value">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="store-out-of-stock-products">
            <p className="store-out-of-stock-label">Out of Stock:</p>
            {outOfStockProducts.map((product) => (
              <div key={product.id} className="store-out-of-stock-item">
                <div className="store-product-left">
                  <p className="store-product-name">{product.name}</p>
                  <p className="store-product-size">{product.size}</p>
                </div>
                <div className="store-product-right">
                  <p className={`store-product-availability ${product.availability ? 'in-stock' : 'sold-out'}`}>
                    {product.availability ? 'In Stock' : 'Sold Out'}
                  </p>
                  <button
                    className={`store-dots-btn ${activeDotsButton === product.id ? 'active' : ''}`}
                    onClick={(e) => handleOpenModal(product.id, e)}
                  >
                    <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 342.382 342.382" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M45.225,125.972C20.284,125.972,0,146.256,0,171.191c0,24.94,20.284,45.219,45.225,45.219 c24.926,0,45.219-20.278,45.219-45.219C90.444,146.256,70.151,125.972,45.225,125.972z"></path> </g> <g> <path d="M173.409,125.972c-24.938,0-45.225,20.284-45.225,45.219c0,24.94,20.287,45.219,45.225,45.219 c24.936,0,45.226-20.278,45.226-45.219C218.635,146.256,198.345,125.972,173.409,125.972z"></path> </g> <g> <path d="M297.165,125.972c-24.932,0-45.222,20.284-45.222,45.219c0,24.94,20.29,45.219,45.222,45.219 c24.926,0,45.217-20.278,45.217-45.219C342.382,146.256,322.091,125.972,297.165,125.972z"></path> </g> </g> </g> </g></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductStatusModal 
        isOpen={selectedProductId !== null}
        onClose={handleCloseModal}
        product={selectedProduct}
      />

      <div className="store-card-section">
        <div className="store-members-header">
          <h3 className="store-card-label">Store Members</h3>
          <button className="store-add-member-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="10" cy="8" r="4" stroke="#33363F" stroke-width="2" stroke-linecap="round"></circle> <path d="M15.7956 20.4471C15.4537 19.1713 14.7004 18.0439 13.6526 17.2399C12.6047 16.4358 11.3208 16 10 16C8.6792 16 7.3953 16.4358 6.34743 17.2399C5.29957 18.0439 4.5463 19.1713 4.20445 20.4471" stroke="#33363F" stroke-width="2" stroke-linecap="round"></path> <path d="M19 10L19 16" stroke="#33363F" stroke-width="2" stroke-linecap="round"></path> <path d="M22 13L16 13" stroke="#33363F" stroke-width="2" stroke-linecap="round"></path> </g></svg>
          </button>
        </div>

        <div className="store-members-list">
          {storeMembers.map((member) => (
            <div key={member.id} className="store-member-item">
              <div className="store-member-role">
                <span className={`store-role-badge ${member.role.toLowerCase().replace(' ', '-')}`}>
                  {member.role}
                </span>
              </div>
              <div className="store-member-info">
                <p className="store-member-name">{member.name}</p>
                <p className="store-member-email">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
