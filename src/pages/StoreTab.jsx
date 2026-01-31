import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ProductStatusModal from '../components/ProductStatusModal';
import AddStoreMemberModal from '../components/AddStoreMemberModal';
import UpdateMemberRoleModal from '../components/UpdateMemberRoleModal';
import RoleBadge from '../components/RoleBadge';
import '../styles/pages/StoreTab.css';
import { supabase } from '../utils/supabaseClient';

// Helper function to sort members with Store Owner always first
const sortMembersWithOwnerFirst = (members) => {
  return [...members].sort((a, b) => {
    if (a.role === 'Store Owner') return -1;
    if (b.role === 'Store Owner') return 1;
    // Secondary sort: Store Admin before Sales Person
    if (a.role === 'Store Admin' && b.role === 'Sales Person') return -1;
    if (a.role === 'Sales Person' && b.role === 'Store Admin') return 1;
    return 0;
  });
};

export default function StoreTab({ storeId, isVisible, refreshKey }) {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [activeDotsButton, setActiveDotsButton] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [activeMemberDotsButton, setActiveMemberDotsButton] = useState(null);
  const [products, setProducts] = useState([]);
  const [storeMembers, setStoreMembers] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Fetch products and members from database on mount
  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('staff')
          .select('role')
          .eq('store_id', storeId)
          .eq('user_id', user.id)
          .single();

        if (data) {
          setCurrentUserRole(data.role);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    };

    const fetchStoreInfo = async () => {
      try {
        const { data } = await supabase
          .from('stores')
          .select('store_name, admin_name')
          .eq('id', storeId)
          .single();

        if (data) {
          setStoreName(data.store_name);
        }
      } catch (err) {
        console.error('Error fetching store info:', err);
      }
    };

    const fetchProductsAndMembers = async () => {
      try {
        // Fetch products
        const productsResponse = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeId)
          .order('created_at', { ascending: false });

        if (productsResponse.error) throw productsResponse.error;
        setProducts(productsResponse.data || []);

        // Fetch staff first
        const staffResponse = await supabase
          .from('staff')
          .select('id, user_id, role, email, full_name, stores(admin_name)')
          .eq('store_id', storeId);

        if (staffResponse.error) {
          console.error('Staff fetch error:', staffResponse.error);
          return;
        }

        // Map staff data
        if (staffResponse.data && staffResponse.data.length > 0) {
          // Fetch profiles for all non-store-owner staff
          const userIds = staffResponse.data
            .filter(s => s.role !== 'Store Owner' && s.user_id)
            .map(s => s.user_id);

          let profileMap = {};
          if (userIds.length > 0) {
            const profilesResponse = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', userIds);

            if (profilesResponse.data) {
              profileMap = Object.fromEntries(
                profilesResponse.data.map(p => [p.id, p])
              );
            }
          }

          const mappedMembers = staffResponse.data.map(staff => {
            let name = 'Team Member';
            if (staff.role === 'Store Owner') {
              name = staff.stores?.admin_name || 'Store Owner';
            } else if (staff.full_name && staff.full_name.trim()) {
              // Use full_name if available (for invited members)
              name = staff.full_name;
            } else if (staff.user_id && profileMap[staff.user_id]) {
              // Fallback to profiles table for regular users
              name = profileMap[staff.user_id].full_name || 'Team Member';
            }
            
            return {
              id: staff.id,
              name: name,
              email: staff.email || 'N/A',
              role: staff.role || 'Staff'
            };
          });

          setStoreMembers(sortMembersWithOwnerFirst(mappedMembers));
        } else {
          setStoreMembers([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchProductsAndMembers();
    fetchStoreInfo();
    fetchCurrentUserRole();
  }, [storeId]);

  // Refetch when tab becomes visible
  useEffect(() => {
    if (isVisible) {
      const fetchProductsAndMembers = async () => {
        try {
          const productsResponse = await supabase
            .from('products')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

          if (productsResponse.error) throw productsResponse.error;
          setProducts(productsResponse.data || []);

          const staffResponse = await supabase
            .from('staff')
            .select('id, user_id, role, email, full_name, stores(admin_name)')
            .eq('store_id', storeId);

          if (staffResponse.error) {
            console.error('Staff fetch error:', staffResponse.error);
            return;
          }

          if (staffResponse.data && staffResponse.data.length > 0) {
            // Fetch profiles for all non-store-owner staff
            const userIds = staffResponse.data
              .filter(s => s.role !== 'Store Owner' && s.user_id)
              .map(s => s.user_id);

            let profileMap = {};
            if (userIds.length > 0) {
              const profilesResponse = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);

              if (profilesResponse.data) {
                profileMap = Object.fromEntries(
                  profilesResponse.data.map(p => [p.id, p])
                );
              }
            }

            const mappedMembers = staffResponse.data.map(staff => {
              let name = 'Team Member';
              if (staff.role === 'Store Owner') {
                name = staff.stores?.admin_name || 'Store Owner';
              } else if (staff.full_name) {
                // Use full_name for invited members
                name = staff.full_name;
              } else if (staff.user_id && profileMap[staff.user_id]) {
                name = profileMap[staff.user_id].full_name || 'Team Member';
              }
              
              return {
                id: staff.id,
                name: name,
                email: staff.email || 'N/A',
                role: staff.role || 'Staff'
              };
            });
            setStoreMembers(sortMembersWithOwnerFirst(mappedMembers));
          } else {
            setStoreMembers([]);
          }
        } catch (err) {
          console.error('Error fetching data:', err);
        }
      };
      fetchProductsAndMembers();
    }
  }, [isVisible, storeId, refreshKey]);

  const handleAddMember = () => {
    // TODO: Save to database/state
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      // No conversion needed - use the role value directly
      const dbRole = newRole;
      
      const updateResponse = await supabase
        .from('staff')
        .update({ role: dbRole })
        .eq('id', memberId);
      
      const { error } = updateResponse;
      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      toast.success('Member role updated successfully');
      
      // Check if the updated member is the current user
      const currentUserEmail = localStorage.getItem('userEmail');
      
      // Get current Supabase user for comparison
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      // Refresh the member list
      const staffResponse = await supabase
        .from('staff')
        .select('id, user_id, role, email, full_name, stores(admin_name)')
        .eq('store_id', storeId);

      if (staffResponse.error) {
        console.error('Staff fetch error:', staffResponse.error);
        return;
      }

      // Update localStorage if current user's role changed
      if (staffResponse.data) {
        const updatedMember = staffResponse.data.find(s => s.id === memberId);
        
        // Check if this is an invited member (has email match) or Supabase user (has user_id match)
        const isCurrentInvitedUser = updatedMember && updatedMember.email === currentUserEmail;
        const isCurrentSupabaseUser = updatedMember && supabaseUser && updatedMember.user_id === supabaseUser.id;
        
        if (isCurrentInvitedUser || isCurrentSupabaseUser) {
          localStorage.setItem('userRole', updatedMember.role);
          // Dispatch event so Header and other components know to update
          window.dispatchEvent(new CustomEvent('userRoleChanged', { detail: { role: updatedMember.role } }));
        }
      }

      if (staffResponse.data && staffResponse.data.length > 0) {
        const userIds = staffResponse.data
          .filter(s => s.role !== 'Store Owner' && s.user_id)
          .map(s => s.user_id);

        let profileMap = {};
        if (userIds.length > 0) {
          const profilesResponse = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

          if (profilesResponse.data) {
            profileMap = Object.fromEntries(
              profilesResponse.data.map(p => [p.id, p])
            );
          }
        }

        const mappedMembers = staffResponse.data.map(staff => {
          let name = 'Team Member';
          if (staff.role === 'Store Owner') {
            name = staff.stores?.admin_name || 'Store Owner';
          } else if (staff.full_name && staff.full_name.trim()) {
            name = staff.full_name;
          } else if (staff.user_id && profileMap[staff.user_id]) {
            name = profileMap[staff.user_id].full_name || 'Team Member';
          }
          
          return {
            id: staff.id,
            name: name,
            email: staff.email || 'N/A',
            role: staff.role || 'Staff'
          };
        });

        setStoreMembers(sortMembersWithOwnerFirst(mappedMembers));
      }
    } catch (err) {
      console.error('Error updating member role:', err);
      toast.error('Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Member removed successfully');
      
      // Refresh the member list
      const staffResponse = await supabase
        .from('staff')
        .select('id, user_id, role, email, full_name, stores(admin_name)')
        .eq('store_id', storeId);

      if (staffResponse.error) {
        console.error('Staff fetch error:', staffResponse.error);
        return;
      }

      if (staffResponse.data && staffResponse.data.length > 0) {
        const userIds = staffResponse.data
          .filter(s => s.role !== 'Store Owner' && s.user_id)
          .map(s => s.user_id);

        let profileMap = {};
        if (userIds.length > 0) {
          const profilesResponse = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

          if (profilesResponse.data) {
            profileMap = Object.fromEntries(
              profilesResponse.data.map(p => [p.id, p])
            );
          }
        }

        const mappedMembers = staffResponse.data.map(staff => {
          let name = 'Team Member';
          if (staff.role === 'Store Owner') {
            name = staff.stores?.admin_name || 'Store Owner';
          } else if (staff.full_name && staff.full_name.trim()) {
            name = staff.full_name;
          } else if (staff.user_id && profileMap[staff.user_id]) {
            name = profileMap[staff.user_id].full_name || 'Team Member';
          }
          
          return {
            id: staff.id,
            name: name,
            email: staff.email || 'N/A',
            role: staff.role || 'Staff'
          };
        });

        setStoreMembers(sortMembersWithOwnerFirst(mappedMembers));
      } else {
        setStoreMembers([]);
      }
    } catch (err) {
      console.error('Error removing member:', err);
      toast.error('Failed to remove member');
    }
  };

  // Calculate stats from real products
  const stats = [
    { id: 'total', label: 'Total Products', value: products.length, type: 'total' },
    { id: 'instock', label: 'In Stock', value: products.filter(p => p.availability).length, type: 'in-stock' },
    { id: 'soldout', label: 'Sold Out', value: products.filter(p => !p.availability).length, type: 'sold-out' },
  ];

  // Get only out of stock products for the list
  const outOfStockProducts = products.filter(p => !p.availability);

  const handleOpenModal = (productId, e) => {
    e.stopPropagation();
    setSelectedProductId(productId);
    setActiveDotsButton(productId);
  };

  const handleCloseModal = () => {
    setSelectedProductId(null);
    setActiveDotsButton(null);
  };

  const handleProductStatusChange = (productId, newStatus) => {
    // Update the product in the products array immediately
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId ? { ...product, availability: newStatus } : product
      )
    );
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
                <p className={`store-stat-value ${stat.type}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="store-out-of-stock-products">
            <p className="store-out-of-stock-label">
              {products.length === 0 && (
                <span style={{ color: '#28a745', marginLeft: '0.5rem' }}>No products added to store</span>
              )}
              {products.length > 0 && outOfStockProducts.length === 0 && (
                <span style={{ color: '#28a745', marginLeft: '0.5rem' }}>All products are available</span>
              )}
              {outOfStockProducts.length > 0 && (
                <>
                  Out of Stock:
                </>
              )}
            </p>
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
        onStatusChange={handleProductStatusChange}
      />

      <div className="store-card-section">
        <div className="store-members-header">
          <h3 className="store-card-label">Store Members</h3>
          {(currentUserRole === 'Store Owner' || currentUserRole === 'Store Admin') && (
            <button className="store-add-member-btn" onClick={() => setShowAddMemberModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="10" cy="8" r="4" stroke="#33363F" stroke-width="2" stroke-linecap="round"></circle> <path d="M15.7956 20.4471C15.4537 19.1713 14.7004 18.0439 13.6526 17.2399C12.6047 16.4358 11.3208 16 10 16C8.6792 16 7.3953 16.4358 6.34743 17.2399C5.29957 18.0439 4.5463 19.1713 4.20445 20.4471" stroke="#33363F" stroke-width="2" stroke-linecap="round"></path> <path d="M19 10L19 16" stroke="#33363F" stroke-width="2" stroke-linecap="round"></path> <path d="M22 13L16 13" stroke="#33363F" stroke-width="2" stroke-linecap="round"></path> </g></svg>
            </button>
          )}
        </div>

        <div className="store-members-list">
          {storeMembers.map((member) => (
            <div key={member.id} className="store-member-item">
              <div className="store-member-role">
                <RoleBadge role={member.role} />
              </div>
              <div className="store-member-info">
                <p className="store-member-name">{member.name}</p>
                <p className="store-member-email">{member.email}</p>
              </div>
              {currentUserRole === 'Store Owner' && member.role !== 'Store Owner' && (
                <button
                  className={`store-member-dots-btn ${activeMemberDotsButton === member.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMemberId(member.id);
                    setActiveMemberDotsButton(member.id);
                  }}
                >
                  <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 342.382 342.382" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M45.225,125.972C20.284,125.972,0,146.256,0,171.191c0,24.94,20.284,45.219,45.225,45.219 c24.926,0,45.219-20.278,45.219-45.219C90.444,146.256,70.151,125.972,45.225,125.972z"></path> </g> <g> <path d="M173.409,125.972c-24.938,0-45.225,20.284-45.225,45.219c0,24.94,20.287,45.219,45.225,45.219 c24.936,0,45.226-20.278,45.226-45.219C218.635,146.256,198.345,125.972,173.409,125.972z"></path> </g> <g> <path d="M297.165,125.972c-24.932,0-45.222,20.284-45.222,45.219c0,24.94,20.29,45.219,45.222,45.219 c24.926,0,45.217-20.278,45.217-45.219C342.382,146.256,322.091,125.972,297.165,125.972z"></path> </g> </g> </g> </g></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <AddStoreMemberModal 
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAdd={handleAddMember}
        storeId={storeId}
        storeName={storeName}
      />

      <UpdateMemberRoleModal
        isOpen={selectedMemberId !== null && currentUserRole === 'Store Owner'}
        onClose={() => {
          setSelectedMemberId(null);
          setActiveMemberDotsButton(null);
        }}
        member={storeMembers.find(m => m.id === selectedMemberId)}
        onUpdate={handleUpdateMemberRole}
        onRemove={handleRemoveMember}
        storeName={storeName}
      />
    </div>
  );
}
