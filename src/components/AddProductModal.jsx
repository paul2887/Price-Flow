import { useState, useMemo } from "react";
import { capitalizeWords } from "../utils/capitalize";
import { formatPriceDisplay, stripPriceCommas } from "../utils/priceFormatter";
import "../styles/components/AddProductModal.css";

export default function AddProductModal({ isOpen, onClose, onAdd, existingProducts = [] }) {
  const [formData, setFormData] = useState({
    productName: "",
    productSize: "",
    price: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      // Only allow numbers and decimal point
      const numericValue = value.replace(/[^\d.]/g, '');
      // Prevent multiple decimal points
      const cleanValue = numericValue.split('.').slice(0, 2).join('.');
      const strippedValue = stripPriceCommas(cleanValue);
      setFormData((prev) => ({
        ...prev,
        [name]: strippedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const isDuplicate = useMemo(() => {
    if (!formData.productName.trim() || !formData.productSize.trim()) return false;
    return existingProducts.some(
      (product) =>
        product.name.toLowerCase() === formData.productName.toLowerCase() &&
        product.size.toLowerCase() === formData.productSize.toLowerCase()
    );
  }, [formData.productName, formData.productSize, existingProducts]);

  const isFormValid =
    formData.productName.trim() &&
    formData.productSize.trim() &&
    formData.price.trim() &&
    !isDuplicate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onAdd({
        ...formData,
        productName: capitalizeWords(formData.productName),
        productSize: capitalizeWords(formData.productSize),
      });
      setFormData({ productName: "", productSize: "", price: "" });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-modal-overlay" onClick={onClose}>
      <div className="add-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="add-modal-header">
          <h2 className="add-modal-title">Add Product</h2>
          <button className="add-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-modal-form">
          <div className="add-form-group">
            <label htmlFor="productName">Product Name</label>
            <input
              id="productName"
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="Enter product name"
              className="add-modal-input"
              autoComplete="off"
            />
          </div>

          <div className="add-form-group">
            <label htmlFor="productSize">Product Size</label>
            <input
              id="productSize"
              type="text"
              name="productSize"
              value={formData.productSize}
              onChange={handleChange}
              placeholder="Enter product size"
              className="add-modal-input"
              autoComplete="off"
            />
          </div>

          <div className="add-form-group">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="text"
              name="price"
              value={formatPriceDisplay(formData.price)}
              onChange={handleChange}
              placeholder="Enter price"
              className="add-modal-input"
              autoComplete="off"
            />
            {isDuplicate && formData.price && (
              <div className="add-modal-error">
                Product already exists
              </div>
            )}
          </div>

          <button
            type="submit"
            className="add-modal-btn-primary"
            disabled={!isFormValid}
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}
