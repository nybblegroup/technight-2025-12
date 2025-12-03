import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EventControl } from './pages/EventControl';

function App() {
  // Get eventId from URL parameter or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const eventIdFromUrl = urlParams.get('eventId');
  const eventIdFromStorage = localStorage.getItem('nybble_event_id');
  const eventId = eventIdFromUrl || eventIdFromStorage || '';

  // Save to localStorage if from URL
  if (eventIdFromUrl && eventIdFromUrl !== eventIdFromStorage) {
    localStorage.setItem('nybble_event_id', eventIdFromUrl);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/events/${eventId}/control`} replace />} />
        <Route path="/events/:eventId/control" element={<EventControl />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
