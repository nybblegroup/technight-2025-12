export function LoadingIndicator() {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '60px', 
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <p style={{ fontSize: '18px', color: '#666' }}>Loading examples... 🔄</p>
    </div>
  );
}

