/**
 * Event Control Panel
 * 
 * Admin dashboard for controlling live events
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, Event, Poll, Participant, Question } from '../utils/api';
import './EventControl.css';

export function EventControl() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!eventId) return;

    loadData();

    const interval = setInterval(() => {
      loadData(true); // Silent refresh
    }, 5000);

    return () => clearInterval(interval);
  }, [eventId]);

  async function loadData(silent = false) {
    if (!eventId) return;

    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const [eventData, pollsData, participantsData, questionsData] = await Promise.all([
        api.events.getById(eventId),
        api.polls.getByEventId(eventId),
        api.participants.getByEventId(eventId),
        api.questions.getByEventId(eventId),
      ]);

      setEvent(eventData);
      setPolls(pollsData);
      setParticipants(participantsData);
      setQuestions(questionsData);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function changePhase(newPhase: string) {
    if (!eventId || !event) return;

    const confirmed = window.confirm(
      `¿Cambiar fase de ${event.phase.toUpperCase()} a ${newPhase.toUpperCase()}?`
    );

    if (!confirmed) return;

    try {
      await api.events.updatePhase(eventId, newPhase);
      await loadData();
    } catch (err) {
      console.error('Error changing phase:', err);
      alert('Error al cambiar fase');
    }
  }

  async function changePollStatus(pollId: string, status: string) {
    try {
      await api.polls.updateStatus(pollId, status);
      await loadData();
    } catch (err) {
      console.error('Error changing poll status:', err);
      alert(err instanceof Error ? err.message : 'Error al cambiar estado de encuesta');
    }
  }

  if (loading) {
    return (
      <div className="event-control-loading">
        <div className="spinner"></div>
        <div>Cargando evento...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-control-error">
        <h2>⚠️ Error</h2>
        <p>{error || 'Evento no encontrado'}</p>
        <button onClick={() => loadData()}>Reintentar</button>
      </div>
    );
  }

  const activePoll = polls.find(p => p.status === 'active');
  const draftPolls = polls.filter(p => p.status === 'draft');
  const closedPolls = polls.filter(p => p.status === 'closed');
  const top3 = participants.slice(0, 3);

  return (
    <div className="event-control">
      {/* Header */}
      <header className="control-header">
        <div>
          <h1>🎮 Control Panel</h1>
          <div className="breadcrumb">
            {event.title}
          </div>
        </div>
        {refreshing && <div className="refreshing-indicator">🔄 Actualizando...</div>}
      </header>

      {/* Event Info Card */}
      <div className="control-section">
        <div className="card event-info-card">
          <div className="card-header">
            <h2>📅 Información del Evento</h2>
            <span className={`phase-badge phase-${event.phase}`}>
              {event.phase.toUpperCase()}
            </span>
          </div>
          <div className="event-info-content">
            <div className="info-row">
              <span className="label">Título:</span>
              <span className="value">{event.title}</span>
            </div>
            <div className="info-row">
              <span className="label">Horario:</span>
              <span className="value">
                {new Date(event.start_time).toLocaleTimeString('es-AR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} - {new Date(event.end_time).toLocaleTimeString('es-AR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Participantes:</span>
              <span className="value">{participants.length}</span>
            </div>
          </div>

          {/* Phase Controller */}
          <div className="phase-controller">
            <h3>Cambiar Fase:</h3>
            <div className="phase-buttons">
              {['pre', 'live', 'post', 'closed'].map(phase => (
                <button
                  key={phase}
                  className={`phase-btn ${event.phase === phase ? 'active' : ''}`}
                  onClick={() => changePhase(phase)}
                  disabled={event.phase === phase}
                >
                  {phase.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Polls Management */}
      <div className="control-section">
        <h2>📊 Encuestas</h2>

        {/* Active Poll */}
        {activePoll && (
          <div className="card poll-card active-poll">
            <div className="card-header">
              <h3>🔴 Encuesta Activa</h3>
              <button
                className="btn btn-danger"
                onClick={() => changePollStatus(activePoll.id, 'closed')}
              >
                Cerrar Encuesta
              </button>
            </div>
            <div className="poll-content">
              <p className="poll-question">{activePoll.question}</p>
              <div className="poll-results">
                {activePoll.options.map(option => {
                  const percentage = activePoll.total_votes > 0 
                    ? Math.round((option.votes / activePoll.total_votes) * 100) 
                    : 0;

                  return (
                    <div key={option.id} className="poll-result-item">
                      <div className="result-header">
                        <span>{option.text}</span>
                        <span className="result-votes">
                          {option.votes} votos ({percentage}%)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="poll-stats">
                Total de votos: {activePoll.total_votes}
              </div>
            </div>
          </div>
        )}

        {/* Draft Polls */}
        {draftPolls.length > 0 && (
          <div className="polls-grid">
            {draftPolls.map(poll => (
              <div key={poll.id} className="card poll-card draft-poll">
                <div className="card-header">
                  <span className="poll-status-badge">DRAFT</span>
                  <button
                    className="btn btn-primary"
                    onClick={() => changePollStatus(poll.id, 'active')}
                    disabled={event.phase !== 'live'}
                  >
                    Lanzar
                  </button>
                </div>
                <p className="poll-question">{poll.question}</p>
                <ul className="poll-options-list">
                  {poll.options.map(opt => (
                    <li key={opt.id}>{opt.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {polls.length === 0 && (
          <div className="empty-state">
            <p>No hay encuestas creadas para este evento</p>
          </div>
        )}
      </div>

      {/* Participants Leaderboard */}
      <div className="control-section">
        <h2>🏆 Ranking de Participantes</h2>
        <div className="card">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Avatar</th>
                <th>Nombre</th>
                <th>Puntos</th>
                <th>Votos</th>
                <th>Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {participants.map(p => (
                <tr key={p.id} className={top3.includes(p) ? 'top-3' : ''}>
                  <td className="rank-cell">
                    {p.rank === 1 && '🥇'}
                    {p.rank === 2 && '🥈'}
                    {p.rank === 3 && '🥉'}
                    {p.rank && p.rank > 3 && `#${p.rank}`}
                  </td>
                  <td className="avatar-cell">{p.avatar}</td>
                  <td className="name-cell">{p.display_name}</td>
                  <td className="points-cell">{p.points}</td>
                  <td>{p.poll_votes_count}</td>
                  <td>{p.attendance_percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Questions */}
      <div className="control-section">
        <h2>💬 Preguntas Q&A ({questions.length})</h2>
        <div className="card questions-list">
          {questions.length > 0 ? (
            questions.map(q => (
              <div key={q.id} className="question-item">
                <div className="question-header">
                  {q.is_anonymous ? (
                    <span className="author anonymous">👤 Anónimo</span>
                  ) : (
                    <span className="author">{q.author_name}</span>
                  )}
                  <span className="timestamp">
                    {new Date(q.timestamp).toLocaleTimeString('es-AR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <p className="question-text">{q.text}</p>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Aún no hay preguntas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

