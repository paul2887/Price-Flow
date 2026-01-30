import '../styles/components/Loading.css';

export default function Loading() {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
}
