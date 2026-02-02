import { createContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getFromIndexedDB, clearFromIndexedDB } from '../utils/indexedDBStorage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    let subscription;

    const initAuth = async () => {
      // Complete initial auth check first to avoid race condition
      await checkAuth();

      if (!mounted) return;

      // Only then subscribe to future auth changes
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;

          if (session?.user) {
            setUser(session.user);
            setIsAuthenticated(true);
          } else {
            // Check if user is invited member - first try localStorage, then IndexedDB
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
              setUser({ email: userEmail, isInvitedMember: true });
              setIsAuthenticated(true);
            } else {
              // Try IndexedDB as fallback for mobile
              const sessionData = await getFromIndexedDB();
              if (mounted && sessionData?.userEmail) {
                setUser({ email: sessionData.userEmail, isInvitedMember: true });
                setIsAuthenticated(true);
              } else if (mounted) {
                setUser(null);
                setIsAuthenticated(false);
              }
            }
          }
          setLoading(false);
        }
      );

      subscription = authSubscription;
    };

    initAuth();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const checkAuth = async () => {
    try {
      // First check Supabase auth
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // For invited members (no Supabase session), check IndexedDB FIRST, then localStorage
      let sessionData = await getFromIndexedDB();
      
      if (sessionData?.userEmail && sessionData?.userId) {
        // Restore to localStorage as well for compatibility
        localStorage.setItem('userEmail', sessionData.userEmail);
        localStorage.setItem('userId', sessionData.userId);
        if (sessionData.userRole) localStorage.setItem('userRole', sessionData.userRole);
        if (sessionData.storeId) localStorage.setItem('storeId', sessionData.storeId);
        if (sessionData.storeName) localStorage.setItem('storeName', sessionData.storeName);
        if (sessionData.adminName) localStorage.setItem('adminName', sessionData.adminName);
        if (sessionData.userFullName) localStorage.setItem('userFullName', sessionData.userFullName);
        
        // Verify the staff record still exists in database
        const { data: staffRecord } = await supabase
          .from('staff')
          .select('email')
          .eq('email', sessionData.userEmail)
          .single();

        if (staffRecord) {
          setUser({
            email: sessionData.userEmail,
            id: sessionData.userId,
            isInvitedMember: true
          });
          setIsAuthenticated(true);
        } else {
          // Staff record doesn't exist, clear all auth data
          await clearAuthData();
          setIsAuthenticated(false);
        }
      } else {
        // No IndexedDB data, try localStorage fallback
        let userEmail = localStorage.getItem('userEmail');
        let userId = localStorage.getItem('userId');

        if (userEmail && userId) {
          // Verify the staff record still exists
          const { data: staffRecord } = await supabase
            .from('staff')
            .select('email')
            .eq('email', userEmail)
            .single();

          if (staffRecord) {
            setUser({
              email: userEmail,
              id: userId,
              isInvitedMember: true
            });
            setIsAuthenticated(true);
          } else {
            // Staff record doesn't exist, clear all auth data
            await clearAuthData();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = async () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('storeId');
    localStorage.removeItem('storeName');
    localStorage.removeItem('adminName');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('signupEmail');
    localStorage.removeItem('signupUserId');
    localStorage.removeItem('activeTab');
    await clearFromIndexedDB();
  };

  const logout = async () => {
    try {
      // Sign out from Supabase if logged in via auth
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear all auth data
    await clearAuthData();

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
