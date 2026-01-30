import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          // Check if user is invited member logged in via localStorage
          const userEmail = localStorage.getItem('userEmail');
          if (userEmail) {
            setUser({ email: userEmail, isInvitedMember: true });
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
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

      // Check if user is invited member logged in via localStorage
      const userEmail = localStorage.getItem('userEmail');
      const userId = localStorage.getItem('userId');

      if (userEmail && userId) {
        // Verify the staff record still exists
        const { data: staffRecord, error: staffError } = await supabase
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
          // Staff record doesn't exist, clear localStorage
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userId');
          localStorage.removeItem('userRole');
          localStorage.removeItem('storeId');
          localStorage.removeItem('storeName');
          localStorage.removeItem('adminName');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase if logged in via auth
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('storeId');
    localStorage.removeItem('storeName');
    localStorage.removeItem('adminName');
    localStorage.removeItem('signupEmail');
    localStorage.removeItem('signupUserId');

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
