import { Example } from '../utils/api';

interface ExampleCardProps {
  example: Example;
  onDelete: (id: number) => void;
}

export function ExampleCard({ example, onDelete }: ExampleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '12px'
      }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#1976d2' }}>
            {example.title}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            {example.name}
          </p>
        </div>
        <span style={{
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: '600',
          borderRadius: '12px',
          backgroundColor: example.isActive ? '#e8f5e9' : '#f5f5f5',
          color: example.isActive ? '#2e7d32' : '#666'
        }}>
          {example.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {example.description && (
        <p style={{ 
          margin: '12px 0', 
          color: '#444',
          lineHeight: '1.5'
        }}>
          {example.description}
        </p>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #e0e0e0'
      }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
          {formatDate(example.entryDate)}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(example.id);
          }}
          style={{
            padding: '6px 12px',
            fontSize: '14px',
            color: '#f44336',
            backgroundColor: 'transparent',
            border: '1px solid #f44336',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f44336';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#f44336';
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

