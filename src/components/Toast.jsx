import { useEffect, useState } from 'react';
import '../styles/components/Toast.css';

export default function Toast({ message, type, onClose, duration = 30000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const icon = type === 'delete' ? '❌' : '✅';

  return (
    <div className={`toast toast-${type}`}>
      <span>{message} {icon}</span>
    </div>
  );
}
