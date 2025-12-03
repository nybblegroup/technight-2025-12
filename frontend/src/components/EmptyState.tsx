interface EmptyStateProps {
  onAddClick: () => void;
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '16px' }}>
        No examples yet. Create your first one!
      </p>
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

