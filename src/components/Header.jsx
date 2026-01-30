import { useNavigate } from 'react-router-dom';
import userCircleIcon from '../assets/icons/user-circle-svgrepo-com.svg';
import RoleBadge from './RoleBadge';
import '../styles/components/Header.css';

export default function Header({ adminName }) {
  const navigate = useNavigate();
  
  // Extract only the first name (first word)
  const firstName = adminName ? adminName.split(' ')[0] : 'User';

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
