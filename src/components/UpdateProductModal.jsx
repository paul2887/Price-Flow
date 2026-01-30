import { useState } from 'react';
import '../styles/components/UpdateProductModal.css';
import { formatPrice } from '../utils/formatPrice';
import { formatPriceDisplay, stripPriceCommas } from '../utils/priceFormatter';

export default function UpdateProductModal({ isOpen, onClose, products = [], onUpdate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !newPrice.trim()) {
      return;
    }

    onUpdate({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productSize: selectedProduct.size,
      newPrice: newPrice
    });

    // Reset form
    setSearchQuery('');
    setSelectedProduct(null);
    setNewPrice('');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('update-modal-overlay')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="update-modal-overlay" onClick={handleOverlayClick}>
      <div className="update-modal-content">
        <div className="update-modal-header">
          <h2 className="update-modal-title">Update Product</h2>
          <button className="update-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="update-modal-form">
          <div className="update-modal-form-group">
            <label htmlFor="update-search-product">Product to be Updated</label>
            <input
              id="update-search-product"
              type="text"
              className="update-modal-input"
              placeholder="Search existing product"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedProduct(null);
              }}
              autoComplete="off"
            />
            
            {searchQuery && filteredProducts.length > 0 && !selectedProduct && (
              <div className="update-search-results">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="update-search-result-item"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="update-result-info">
                      <p className="update-result-name">{product.name}</p>
                      <p className="update-result-details">{product.size} • ₦{formatPrice(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedProduct && (
              <div className="update-selected-product-display">
                <div className="update-selected-product-left">
                  <p className="update-selected-name">{selectedProduct.name}</p>
                  <p className="update-selected-size">{selectedProduct.size}</p>
                </div>
                <p className="update-selected-product-price">₦{formatPrice(selectedProduct.price)}</p>
              </div>
            )}
          </div>

          <div className="update-modal-form-group">
            <label htmlFor="update-price">Price</label>
            <input
              id="update-price"
              type="text"
              name="price"
              className="update-modal-input"
              placeholder="Enter new price"
              value={formatPriceDisplay(newPrice)}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^\d.]/g, '');
                const cleanValue = numericValue.split('.').slice(0, 2).join('.');
                setNewPrice(stripPriceCommas(cleanValue));
              }}
              autoComplete="off"
            />
          </div>

          <button type="submit" className="update-modal-btn-primary">
            Update Price
          </button>
        </form>
      </div>
    </div>
  );
}
