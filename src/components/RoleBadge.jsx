import { useRole } from '../context/RoleContext';
import '../styles/components/RoleBadge.css';

export default function RoleBadge({ role, useLocalStorage = false }) {
  // For current user badges, use context directly
  const { userRole: contextRole } = useRole();
  
  // Determine which role to display
  const displayRole = useLocalStorage ? contextRole : role;

  // Get CSS class based on role
  const getRoleClass = () => {
    switch (displayRole) {
      case 'Store Owner':
        return 'role-badge role-owner';
      case 'Store Admin':
        return 'role-badge role-admin';
      case 'Sales Person':
        return 'role-badge role-sales';
      default:
        return 'role-badge';
    }
  };

  if (!displayRole) return null;

  return (
    <span className={getRoleClass()}>{displayRole}</span>
  );
}
