import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || '';
  });
  const [storeId, setStoreId] = useState(() => {
    return localStorage.getItem('storeId') || '';
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh function that components can call
  const refreshRole = useCallback(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedStoreId = localStorage.getItem('storeId');
    if (storedRole) {
      setUserRole(storedRole);
    }
    if (storedStoreId && storedStoreId !== storeId) {
      setStoreId(storedStoreId);
    }
    setRefreshKey(prev => prev + 1);
  }, [storeId]);

  // Update role and sync to localStorage
  const updateRole = useCallback((newRole) => {
    localStorage.setItem('userRole', newRole);
    setUserRole(newRole);
    setRefreshKey(prev => prev + 1);
    // Dispatch event for any components that still listen to it
    window.dispatchEvent(new CustomEvent('userRoleChanged', { 
      detail: { role: newRole } 
    }));
  }, []);

  // Single real-time subscription for the entire app
  useEffect(() => {
    if (!storeId) {
      return;
    }

    const userEmail = localStorage.getItem('userEmail');

    // Get user ID asynchronously
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Subscribe to ALL staff updates, then filter in the callback
      const channel = supabase
        .channel(`role-changes-${storeId}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'staff'
          },
          (payload) => {
            const updatedStaff = payload.new;
            
            // Filter for our store in the callback
            if (updatedStaff.store_id !== storeId) {
              return;
            }
            
            const isCurrentUser = 
              (userEmail && updatedStaff.email === userEmail) ||
              (userId && updatedStaff.user_id === userId);
            
            if (isCurrentUser && updatedStaff.role) {
              updateRole(updatedStaff.role);
            }
          }
        )
        .subscribe((status) => {
        });

      return channel;
    };

    let channel;
    setupSubscription().then(ch => {
      channel = ch;
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [storeId, updateRole]);

  // Check for storeId changes only on visibility change (no polling)
  useEffect(() => {
    const checkStoreId = () => {
      const storedStoreId = localStorage.getItem('storeId');
      if (storedStoreId && storedStoreId !== storeId) {
        setStoreId(storedStoreId);
      }
    };

    // Check on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStoreId();
      }
    };

    // Check once on mount
    checkStoreId();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [storeId]);

  // Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'userRole' && event.newValue) {
        setUserRole(event.newValue);
        setRefreshKey(prev => prev + 1);
      }
      // Also listen for storeId changes
      if (event.key === 'storeId' && event.newValue) {
        setStoreId(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <RoleContext.Provider value={{ 
      userRole, 
      refreshKey, 
      refreshRole, 
      updateRole 
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
}
