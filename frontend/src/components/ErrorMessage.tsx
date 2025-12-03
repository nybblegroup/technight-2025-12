interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#ffebee',
      borderRadius: '12px',
      border: '2px solid #f44336',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#c62828' }}>❌ Error</h3>
      <p style={{ margin: 0, color: '#c62828' }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          marginTop: '12px',
          padding: '8px 16px',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
      >
        Retry
      </button>
    </div>
  );
}

