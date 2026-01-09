import { useState, useEffect, useRef } from 'react';
import { products } from '../data/products';
import SearchHeader from '../components/SearchHeader';
import ProductStatusModal from '../components/ProductStatusModal';
import '../styles/pages/ProductsTab.css';

export default function ProductsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [activeDotsButton, setActiveDotsButton] = useState(null);
  const productsListRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery]);

  const handleOpenModal = (productId, e) => {
    e.stopPropagation();
    setSelectedProductId(productId);
    setActiveDotsButton(productId);
  };

  const handleCloseModal = () => {
    setSelectedProductId(null);
    setActiveDotsButton(null);
  };

  const handleScrollToTop = () => {
    if (productsListRef.current) {
      productsListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const selectedProduct = selectedProductId 
    ? filteredProducts.find(p => p.id === selectedProductId)
    : null;

  return (
    <div className="products-tab-content">
      <SearchHeader onSearchChange={setSearchQuery} searchQuery={searchQuery} onTitleClick={handleScrollToTop} />
      
      {searchQuery.trim() !== '' && (
        <div className="search-results-header">Search Results</div>
      )}
      
      <div className="products-list-card" ref={productsListRef}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-item">
              <div className="product-left">
                <p className="product-name">{product.name}</p>
                <p className="product-size">{product.size}</p>
              </div>
              
              <div className="product-right">
                <div className="product-info">
                  <p className="product-price">₦{product.price.toLocaleString()}</p>
                  <p className={`product-availability ${product.availability ? 'in-stock' : 'sold-out'}`}>
                    {product.availability ? 'In Stock' : 'Sold Out'}
                  </p>
                </div>
                <button
                  className={`dots-btn ${activeDotsButton === product.id ? 'active' : ''}`}
                  onClick={(e) => handleOpenModal(product.id, e)}
                >
                  <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 342.382 342.382" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M45.225,125.972C20.284,125.972,0,146.256,0,171.191c0,24.94,20.284,45.219,45.225,45.219 c24.926,0,45.219-20.278,45.219-45.219C90.444,146.256,70.151,125.972,45.225,125.972z"></path> </g> <g> <path d="M173.409,125.972c-24.938,0-45.225,20.284-45.225,45.219c0,24.94,20.287,45.219,45.225,45.219 c24.936,0,45.226-20.278,45.226-45.219C218.635,146.256,198.345,125.972,173.409,125.972z"></path> </g> <g> <path d="M297.165,125.972c-24.932,0-45.222,20.284-45.222,45.219c0,24.94,20.29,45.219,45.222,45.219 c24.926,0,45.217-20.278,45.217-45.219C342.382,146.256,322.091,125.972,297.165,125.972z"></path> </g> </g> </g> </g></svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>No products found</p>
          </div>
        )}
      </div>

      <ProductStatusModal 
        isOpen={selectedProductId !== null}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </div>
  );
}
