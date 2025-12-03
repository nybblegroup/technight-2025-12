import { useEffect, useState } from 'react';
import { api, Example, CreateExampleDto } from './utils/api';
import { Header } from './components/Header';
import { ExampleCard } from './components/ExampleCard';
import { CreateExampleModal } from './components/CreateExampleModal';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ErrorMessage } from './components/ErrorMessage';
import { EmptyState } from './components/EmptyState';

function App() {
  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load examples on mount
  useEffect(() => {
    loadExamples();
  }, []);

  const loadExamples = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.examples.getAll();
      setExamples(data);
    } catch (err) {
      console.error('Failed to load examples:', err);
      setError(err instanceof Error ? err.message : 'Failed to load examples');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExample = async (data: CreateExampleDto) => {
    await api.examples.create(data);
    setShowModal(false);
    await loadExamples();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this example?')) {
      return;
    }

    try {
      await api.examples.delete(id);
      await loadExamples();
    } catch (err) {
      console.error('Failed to delete example:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete example');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <Header onAddClick={() => setShowModal(true)} />

        {/* Loading State */}
        {loading && <LoadingIndicator />}

        {/* Error State */}
        {error && !loading && <ErrorMessage message={error} onRetry={loadExamples} />}

        {/* Empty State */}
        {!loading && !error && examples.length === 0 && (
          <EmptyState onAddClick={() => setShowModal(true)} />
        )}

        {!loading && !error && examples.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {examples.map((example) => (
              <ExampleCard
                key={example.id}
                example={example}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <CreateExampleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateExample}
        />
      </div>
    </div>
  );
}

export default App;
