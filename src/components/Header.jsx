import { useNavigate } from 'react-router-dom';
import userCircleIcon from '../assets/icons/user-circle-svgrepo-com.svg';
import '../styles/components/Header.css';

export default function Header({ adminName, userRole  }) {
  const navigate = useNavigate();
  // Extract only the first name (first word)
  const firstName = adminName ? adminName.split(' ')[0] : 'Admin';

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
          <span className="role-badge">{userRole}</span>
        </div>
      </div>
    </header>
  );
}
