import '../styles/pages/BlockedScreen.css';

export default function BlockedScreen() {
  return (
    <div className="blocked-screen">
      <div className="blocked-content">
        <h1>Mobile Only</h1>
        <p>This app is optimized for mobile devices.</p>
        <p>Please use a mobile device or resize your browser to continue.</p>
      </div>
    </div>
  );
}