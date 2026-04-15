export default function Health() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>✅ System is LIVE</h1>
      <p>Timestamp: {new Date().toISOString()}</p>
      <p>This page proves Vercel is deploying correctly.</p>
      <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Login</a>
    </div>
  );
}
