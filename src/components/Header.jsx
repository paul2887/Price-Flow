import { useNavigate } from 'react-router-dom';
import userCircleIcon from '../assets/icons/user-circle-svgrepo-com.svg';
import RoleBadge from './RoleBadge';
import '../styles/components/Header.css';

export default function Header({ adminName }) {
  const navigate = useNavigate();
  
  // For invited members (store admin, sales person), use their own name
  // For store owner, use adminName
  const displayName = localStorage.getItem('userFullName') || adminName || 'User';
  
  // Extract only the first name (first word)
  const firstName = displayName.split(' ')[0];

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="header">
      <div className="header-content">
        <button className="profile-btn" onClick={handleProfileClick} title="View Profile">
          <img src={userCircleIcon} alt="User" className="user-circle-icon" />
        </button>
        <div className="header-text">
          <h2 className="greeting">Hello, {firstName}</h2>
          <RoleBadge useLocalStorage={true} />
        </div>
      </div>
    </header>
  );
}
