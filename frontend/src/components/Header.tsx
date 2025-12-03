interface HeaderProps {
  onAddClick: () => void;
}

export function Header({ onAddClick }: HeaderProps) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '40px'
    }}>
      <div>
        <h1 style={{ margin: '0 0 8px 0' }}>Technight 2025 - Examples</h1>
        <p style={{ margin: 0, color: '#666' }}>
          Manage your examples from the backend API
        </p>
      </div>
      <button
        onClick={onAddClick}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '600',
          color: '#fff',
          backgroundColor: '#2196f3',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196f3'}
      >
        + Add Example
      </button>
    </div>
  );
}

