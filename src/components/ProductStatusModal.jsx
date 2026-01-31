import { supabase } from '../utils/supabaseClient';
import { formatPrice } from '../utils/formatPrice';
import '../styles/components/ProductStatusModal.css';

export default function ProductStatusModal({ isOpen, onClose, product, onStatusChange }) {
  const handleStatusChange = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ availability: newStatus })
        .eq('id', product.id);

      if (error) throw error;
      
      // Notify parent with the new status for immediate update
      if (onStatusChange) {
        onStatusChange(product.id, newStatus);
      }
      onClose();
    } catch (err) {
      console.error('Error updating product status:', err);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="product-status-modal">
        <button 
          className="modal-close-btn"
          onClick={onClose}
        >
          <svg viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>cancel</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="work-case" fill="#000000" transform="translate(91.520000, 91.520000)"> <polygon id="Close" points="328.96 30.2933333 298.666667 1.42108547e-14 164.48 134.4 30.2933333 1.42108547e-14 1.42108547e-14 30.2933333 134.4 164.48 1.42108547e-14 298.666667 30.2933333 328.96 164.48 194.56 298.666667 328.96 328.96 298.666667 194.56 164.48"> </polygon> </g> </g> </g></svg>
        </button>

        <h3 className="modal-header">Product Status</h3>
        
        {/* Product Display */}
        <div className="status-product-display">
          <div className="status-product-left">
            <p className="status-product-name">{product.name}</p>
            <p className="status-product-size">{product.size}</p>
          </div>
          <p className="status-product-price">₦{formatPrice(product.price)}</p>
        </div>
        
        <div className="status-buttons">
          <button 
            className="status-btn sold-out-btn"
            onClick={() => handleStatusChange(false)}
          >
            Sold Out
          </button>
          <button 
            className="status-btn in-stock-btn"
            onClick={() => handleStatusChange(true)}
          >
            In Stock
          </button>
        </div>
      </div>
    </>
  );
}
