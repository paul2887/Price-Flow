import { useState } from 'react';
import '../styles/components/DeleteProductModal.css';
import { formatPrice } from '../utils/formatPrice';

export default function DeleteProductModal({ isOpen, onClose, products = [], onDelete }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      return;
    }

    onDelete({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productSize: selectedProduct.size
    });

    // Reset form
    setSearchQuery('');
    setSelectedProduct(null);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('delete-modal-overlay')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-modal-content">
        <div className="delete-modal-header">
          <h2 className="delete-modal-title">Delete Product</h2>
          <button className="delete-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="delete-modal-form">
          <div className="delete-modal-form-group">
            <label htmlFor="delete-search-product">Product to be Deleted</label>
            <input
              id="delete-search-product"
              type="text"
              className="delete-modal-input"
              placeholder="Search product"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedProduct(null);
              }}
              autoComplete="off"
            />
            
            {searchQuery && filteredProducts.length > 0 && !selectedProduct && (
              <div className="delete-search-results">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="delete-search-result-item"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="delete-result-info">
                      <p className="delete-result-name">{product.name}</p>
                      <p className="delete-result-details">{product.size} • ₦{formatPrice(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedProduct && (
              <div className="delete-selected-product-display">
                <div className="delete-selected-product-left">
                  <p className="delete-selected-name">{selectedProduct.name}</p>
                  <p className="delete-selected-size">{selectedProduct.size}</p>
                </div>
                <p className="delete-selected-product-price">₦{formatPrice(selectedProduct.price)}</p>
              </div>
            )}
          </div>

          <button type="submit" className="delete-modal-btn-primary">
            Delete Product
          </button>
        </form>
      </div>
    </div>
  );
}
