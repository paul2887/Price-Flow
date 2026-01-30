import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import AddProductModal from "../components/AddProductModal";
import UpdateProductModal from "../components/UpdateProductModal";
import DeleteProductModal from "../components/DeleteProductModal";
import { supabase } from "../utils/supabaseClient";
import { useRole } from "../context/RoleContext";
import "../styles/pages/HomeTab.css";

export default function HomeTab({ storeName, storeId, isVisible }) {
  const { userRole: currentUserRole, refreshKey } = useRole();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [storeMembers, setStoreMembers] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, [storeId]);

  const fetchStoreMembers = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('staff')
        .select('role')
        .eq('store_id', storeId);

      if (data) {
        setStoreMembers(data);
      }
    } catch (err) {
      console.error('Error fetching store members:', err);
    }
  }, [storeId]);

  // Initial fetch on mount
  useEffect(() => {
    fetchProducts();
    fetchStoreMembers();
  }, [fetchProducts, fetchStoreMembers]);

  // Refetch products and members when tab becomes visible or refreshKey changes
  useEffect(() => {
    if (isVisible) {
      fetchProducts();
      fetchStoreMembers();
    }
  }, [isVisible, refreshKey, fetchProducts, fetchStoreMembers]);

  const handleAddProduct = async (formData) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([
          {
            store_id: storeId,
            name: formData.productName,
            size: formData.productSize,
            price: parseFloat(formData.price),
            availability: true,
          }
        ]);

      if (error) throw error;
      setShowAddModal(false);
      toast.success('Product added');
      fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error('Failed to add product');
    }
  };

  const handleUpdateProduct = async (formData) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ price: parseFloat(formData.newPrice) })
        .eq('id', formData.productId);

      if (error) throw error;
      setShowUpdateModal(false);
      toast.success('Product updated');
      fetchProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (formData) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', formData.productId);

      if (error) throw error;
      setShowDeleteModal(false);
      toast.error('Product deleted');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };
  return (
    <div className="home-tab-content">
      <h2 className="store-name-display">
        Welcome to {storeName || 'Your Store'}
      </h2>

      <div className="card-section">
        <h3 className="card-label">Products Action</h3>
        <div className="products-action-card">
          <>
              <button className="product-action-btn" onClick={() => {
                if (currentUserRole !== 'Sales Person') {
                  setShowAddModal(true);
                }
              }}>
                <div className="icon-background">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="action-icon"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
                        stroke-width="1.5"
                      ></path>
                      <path
                        d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
                        stroke-width="1.5"
                      ></path>
                      <path
                        d="M13 13V11M13 11V9M13 11H15M13 11H11"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      ></path>
                      <path
                        d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      ></path>
                    </g>
                  </svg>
                </div>
                <span className="action-label">Add</span>
              </button>

              <button className="product-action-btn" onClick={() => {
                if (currentUserRole !== 'Sales Person') {
                  setShowUpdateModal(true);
                }
              }}>
                <div className="icon-background">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="action-icon"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
                        stroke-width="1.5"
                      ></path>
                      <path
                        d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
                        stroke-width="1.5"
                      ></path>
                      <path
                        d="M11 10.8L12.1429 12L15 9"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      ></path>
                    </g>
                  </svg>
                </div>
                <span className="action-label">Update</span>
              </button>

              <button className="product-action-btn" onClick={() => {
                if (currentUserRole !== 'Sales Person') {
                  setShowDeleteModal(true);
                }
              }}>
                <div className="icon-background">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="action-icon"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                  <path
                    d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
                    stroke-width="1.5"
                  ></path>
                  <path
                    d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
                    stroke-width="1.5"
                  ></path>
                  <path
                    d="M11.5 12.5L14.5 9.5M14.5 12.5L11.5 9.5"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  ></path>
                  <path
                    d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  ></path>
                </g>
              </svg>
            </div>
            <span className="action-label">Delete</span>
          </button>
          </>
        </div>
      </div>

      <div className="card-section">
        <h3 className="card-label">Products Stats</h3>
        <div className="home-stats-card">
          <div className="stats-header">
            <div className="stat-item">
              <p className="stat-label">Total <br /> Products</p>
              <p className="stat-value">{products.length}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">
                In <br /> Stock
              </p>
              <p className="stat-value in-stock">{products.filter(p => p.availability).length}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">
                Sold <br /> Out
              </p>
              <p className="stat-value sold-out">{products.filter(p => !p.availability).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-section">
        <h3 className="card-label">Store Members</h3>
        <div className="store-member-stats-card">
          <div className="store-member-stat-item">
            <p className="store-member-stat-label">Admins</p>
            <p className="store-member-stat-value">{storeMembers.filter(m => m.role === 'Store Admin').length}</p>
          </div>
          <div className="store-member-stat-item">
            <p className="store-member-stat-label">Sales Persons</p>
            <p className="store-member-stat-value">{storeMembers.filter(m => m.role === 'Sales Person').length}</p>
          </div>
        </div>
      </div>

      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
        existingProducts={products}
      />

      <UpdateProductModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        products={products}
        onUpdate={handleUpdateProduct}
      />

      <DeleteProductModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        products={products}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
}
