import userCircleIcon from '../assets/icons/user-circle-svgrepo-com.svg';
import '../styles/components/Header.css';

export default function Header({ adminName }) {
  // Extract only the first name (first word)
  const firstName = adminName ? adminName.split(' ')[0] : 'Admin';

  return (
    <header className="header">
      <div className="header-content">
        <img src={userCircleIcon} alt="User" className="user-circle-icon" />
        <div className="header-text">
          <h2 className="greeting">Hello, {firstName}</h2>
        </div>
      </div>
    </header>
  );
}
