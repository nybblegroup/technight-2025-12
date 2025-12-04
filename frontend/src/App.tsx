import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EventControl } from './pages/EventControl';

function WelcomeScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0D0D0F',
      color: '#FFFFFF',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>🎮 Nybble Vibe</h1>
        <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#9CA3AF' }}>
          Admin Dashboard
        </h2>
        <p style={{ fontSize: '16px', marginBottom: '32px', color: '#9CA3AF', lineHeight: '1.6' }}>
          Para acceder al control panel, necesitas el ID del evento.
        </p>
        <div style={{
          background: '#1A1A1F',
          padding: '24px',
          borderRadius: '12px',
          border: '2px solid #6366F1'
        }}>
          <p style={{ marginBottom: '16px', color: '#FFFFFF' }}>
            <strong>Opción 1:</strong> Usar la URL con el Event ID
          </p>
          <code style={{
            background: '#0D0D0F',
            padding: '12px',
            borderRadius: '6px',
            display: 'block',
            color: '#22D3EE',
            marginBottom: '24px',
            wordBreak: 'break-all'
          }}>
            http://localhost:5173/events/&lt;EVENT_ID&gt;/control
          </code>
          <p style={{ marginBottom: '16px', color: '#FFFFFF' }}>
            <strong>Opción 2:</strong> Ejecutar el seed script para obtener el Event ID
          </p>
          <code style={{
            background: '#0D0D0F',
            padding: '12px',
            borderRadius: '6px',
            display: 'block',
            color: '#22D3EE',
            marginBottom: '16px'
          }}>
            cd backend/python<br />
            python seed.py --reset
          </code>
          <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '24px' }}>
            💡 El Event ID se muestra en la consola después de ejecutar el seed script
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/events/:eventId/control" element={<EventControl />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
