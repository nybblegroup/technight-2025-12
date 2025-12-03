# Nybble Vibe - Event Engagement Platform - Feature Specification

## 1. Idea

**Nybble Vibe** es una extensión de Chrome que transforma reuniones virtuales en experiencias gamificadas y altamente interactivas. Actúa como un companion sidebar que se ejecuta junto a Google Meet (o cualquier plataforma de videoconferencia) para:

- **Gamificar la participación**: Sistema de puntos, badges y leaderboards que incentivan el engagement
- **Recolectar feedback estructurado**: Pre, durante y post-meeting con AI-powered insights
- **Medir engagement**: Analytics en tiempo real sobre participación, sentimiento y comportamiento
- **Proveer AI Q&A**: Los participantes pueden hacer preguntas sobre el contenido de la reunión usando transcripciones

**Problema que resuelve:**
- Reuniones pasivas con cámaras apagadas y silencio en Q&A
- Falta de feedback accionable y medible
- Imposibilidad de medir engagement real
- Experiencias aburridas que generan evitación de reuniones opcionales

**Propuesta de valor:**
Convertir cada reunión en una experiencia medible, interactiva y divertida donde los participantes quieren involucrarse activamente.

---

## 2. Technical Architecture Blueprint

### 2.1 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   CHROME EXTENSION          BACKEND API          DATABASE       │
│   (Sidebar)                 (Python/FastAPI)     (PostgreSQL)   │
│                                                                  │
│   • Content Script    ←→    • Events CRUD    ←→  • Events       │
│   • Sidebar UI              • Polls mgmt         • Participants │
│   • Local Storage           • User tracking      • Polls        │
│   • API Client              • Points system      • Reactions    │
│                             • AI integration  ←→  • Transcripts │
│                                    ↓                             │
│                             OPENAI API                           │
│                             • Transcript Q&A                     │
│                             • Smart questions                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Project Structure

Este proyecto utiliza el monorepo existente `technight-2025-12` con la siguiente estructura:

```
technight-2025-12/
├── backend/
│   └── python/                      # FastAPI backend (existing)
│       ├── main.py
│       ├── database.py
│       ├── requirements.txt
│       └── .env
│
├── frontend/                        # Admin Dashboard (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── events/
│   │   │   ├── polls/
│   │   │   ├── analytics/
│   │   │   └── participants/
│   │   ├── pages/
│   │   │   ├── Events.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── Settings.tsx
│   │   └── utils/
│   │       └── api.ts
│   └── package.json
│
└── extension/                       # Chrome Extension (NEW)
    ├── manifest.json
    ├── background/
    │   └── service-worker.js
    ├── content/
    │   ├── inject.js
    │   └── styles.css
    ├── sidebar/
    │   ├── index.html
    │   ├── index.js
    │   ├── components/
    │   │   ├── PreMeeting.js
    │   │   ├── LiveMeeting.js
    │   │   ├── PostMeeting.js
    │   │   ├── Poll.js
    │   │   ├── ReactionBar.js
    │   │   ├── PointsDisplay.js
    │   │   ├── Achievements.js
    │   │   └── AIChat.js
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── storage.js
    │   │   └── ai.js
    │   └── data/
    │       └── mockData.js
    └── assets/
        └── icons/
```

### 2.3 Technology Stack

**Backend (Python/FastAPI):**
- Framework: FastAPI 0.104+
- ORM: SQLAlchemy
- Database: PostgreSQL 15+
- AI: OpenAI API (GPT-4)
- Authentication: JWT (future phase)
- Real-time: WebSockets (future phase)

**Frontend (Admin Dashboard):**
- Framework: React 19
- Build: Vite 6
- Language: TypeScript 5.6
- Styling: CSS Modules + Tailwind (optional)
- State: React Context API
- Charts: Recharts or similar

**Chrome Extension:**
- Manifest: V3
- Language: JavaScript (vanilla or TypeScript compiled)
- Storage: chrome.storage.local API
- Styling: CSS3 with animations
- Build: Optional Webpack/Vite for bundling

### 2.4 Development Guidelines

**Code Standards:**
1. **SOLID Principles**: Aplicar en toda la arquitectura
2. **Secure Code**: Validación de inputs, sanitización, no exponer secrets
3. **Readable Code**: Comentarios claros, nombres descriptivos
4. **Separation of Concerns**: UI components, business logic, data access separados
5. **Reusability**: Componentes y funciones reutilizables
6. **Testing**: Unit tests con 90%+ coverage, integration tests para APIs

**Backend Guidelines:**
- RESTful API design con Swagger/OpenAPI documentation
- Error handling consistente con códigos HTTP apropiados
- Logging estructurado para debugging
- Database migrations versionadas
- Environment variables para configuración

**Frontend Guidelines:**
- Component-based architecture
- Props typing estricto (TypeScript)
- Responsive design
- Accessibility (WCAG 2.1)
- Loading states y error boundaries

**Extension Guidelines:**
- Manifest V3 compliance
- Minimal permissions
- Efficient background scripts
- CSP-compliant code (no eval, inline scripts)
- Cross-browser compatibility consideration

### 2.5 Validation & Testing Strategy

**Backend Testing:**
```bash
# Unit tests
cd backend/python
pytest tests/unit/

# Integration tests
pytest tests/integration/

# Coverage report
pytest --cov=. --cov-report=html
```

**Frontend Testing:**
```bash
# Unit tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

**Extension Testing:**
- Load unpacked in Chrome (`chrome://extensions/`)
- Test in Google Meet live environment
- Verify localStorage persistence
- Test phase transitions
- Validate API communication

### 2.6 API Documentation

All backend endpoints must be documented using FastAPI's automatic OpenAPI generation:

```python
@app.post("/api/events", response_model=Event, tags=["Events"])
async def create_event(
    event: EventCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new event
    
    - **title**: Event title
    - **description**: Event description
    - **startTime**: ISO 8601 datetime
    - **endTime**: ISO 8601 datetime
    """
    # Implementation
```

Access Swagger UI at: `http://localhost:8080/api/swagger`

### 2.7 Mocked Services for MVP

**Phase 1 (MVP) - Mocked:**
- Real-time sync between users (local storage only)
- User authentication (hardcoded user)
- AI Integration (static responses)
- Admin-to-extension push notifications

**Phase 1 (MVP) - Real:**
- Backend API with PostgreSQL
- CRUD operations for events, polls, participants
- Points calculation system
- Basic analytics

**Phase 2+ - Real Implementation:**
- WebSocket real-time sync
- OAuth authentication
- OpenAI API integration
- Push notifications via WebSocket

---

## 3. Requirements

### Feature 1 - API - Event Management System

**User Story:**
Como administrador del sistema, necesito crear, editar y gestionar eventos (reuniones) con toda su información asociada (agenda, horarios, configuraciones) para que los participantes puedan unirse y participar activamente.

**Acceptance Criteria:**

1. **Create Event**
   - Admin puede crear un evento con: título, descripción, fecha/hora inicio, fecha/hora fin
   - Admin puede agregar agenda items con: título, duración, presenter (opcional)
   - Admin puede configurar: allowAnonymousQuestions, showLeaderboard, requirePreparation, enableAIQuestions
   - El sistema asigna automáticamente phase: 'pre' al crear
   - El sistema valida que endTime > startTime
   - El sistema retorna el evento creado con ID único

2. **Update Event**
   - Admin puede modificar cualquier campo del evento
   - Admin puede agregar/eliminar agenda items
   - Admin puede modificar configuraciones
   - El sistema actualiza `updatedAt` timestamp
   - El sistema valida integridad de datos

3. **Change Event Phase**
   - El sistema permite cambios de phase: pre → live → post → closed
   - El sistema NO permite retroceder phases (one-way flow)
   - El sistema actualiza automáticamente phase basado en startTime/endTime (opcional: auto-transition)
   - El sistema notifica a participantes sobre cambio de phase (future)

4. **Upload Transcript**
   - Admin puede subir transcript en formatos: .txt, .vtt, .srt, .json
   - El sistema procesa y almacena el transcript como texto plano
   - El sistema vincula transcript con el evento
   - El sistema habilita AI Q&A automáticamente si enableAIQuestions = true

5. **List Events**
   - El sistema retorna eventos filtrados por: phase, dateRange, createdBy
   - El sistema incluye contadores: totalParticipants, totalPolls, avgRating
   - El sistema ordena por: startTime (default), createdAt, participantCount

6. **Get Event Details**
   - El sistema retorna evento completo con: agenda, polls, participant summary
   - El sistema NO expone datos sensibles de participantes individuales (solo agregados)

**Technical Requirements:**

- Endpoints: 
  ```
  POST   /api/events
  GET    /api/events
  GET    /api/events/:id
  PUT    /api/events/:id
  DELETE /api/events/:id
  PATCH  /api/events/:id/phase
  POST   /api/events/:id/transcript
  ```
- Database tables: `events`, `agenda_items`
- Validation: Pydantic models
- Error handling: HTTP 400 (validation), 404 (not found), 500 (server error)
- Response format: JSON con camelCase fields

**Database Schema:**

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  phase VARCHAR(20) DEFAULT 'pre' CHECK (phase IN ('pre', 'live', 'post', 'closed')),
  meeting_url TEXT,
  calendar_event_id VARCHAR(255),
  transcript_url TEXT,
  transcript_text TEXT,
  settings JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  presenter VARCHAR(255),
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Feature 2 - API - Polls Management System

**User Story:**
Como administrador, necesito crear polls (encuestas) asociadas a eventos y poder lanzarlas/cerrarlas durante la reunión en vivo para recopilar opiniones de los participantes en tiempo real.

**Acceptance Criteria:**

1. **Create Poll**
   - Admin puede crear poll con: question, options (array de strings), showResultsTo
   - El sistema valida: mínimo 2 opciones, máximo 10 opciones
   - El poll se crea en estado 'draft'
   - El poll queda vinculado al eventId

2. **Launch Poll**
   - Admin puede cambiar poll status de 'draft' a 'active'
   - Solo puede haber 1 poll activo a la vez por evento
   - El sistema valida que el evento esté en phase 'live'
   - Los participantes conectados reciben notificación (future: WebSocket)

3. **Vote on Poll**
   - Participant puede votar en poll activo
   - Cada participant puede votar solo 1 vez por poll
   - El sistema valida que el poll esté 'active'
   - El sistema incrementa vote count de la opción seleccionada
   - El participant gana +15 puntos por votar

4. **Close Poll**
   - Admin puede cambiar status de 'active' a 'closed'
   - El sistema registra `closedAt` timestamp
   - El sistema calcula porcentajes finales
   - Los participantes ya no pueden votar

5. **View Results**
   - Si showResultsTo = 'all': cualquiera puede ver resultados
   - Si showResultsTo = 'voted': solo quien votó puede ver
   - Si showResultsTo = 'admin': solo admin puede ver
   - Resultados incluyen: option text, votes count, percentage

**Technical Requirements:**

- Endpoints:
  ```
  GET    /api/events/:eventId/polls
  POST   /api/events/:eventId/polls
  PATCH  /api/polls/:id/status
  POST   /api/polls/:id/vote
  GET    /api/polls/:id/results
  ```
- Database tables: `polls`, `poll_options`, `poll_votes`
- Validation: Max 1 active poll per event
- Points award: Automatic on vote submission

**Database Schema:**

```sql
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  show_results_to VARCHAR(20) DEFAULT 'voted' CHECK (show_results_to IN ('all', 'voted', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP
);

CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  text VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL,
  votes INTEGER DEFAULT 0
);

CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  UNIQUE(poll_id, participant_id)
);
```

---

### Feature 3 - API - Participant Engagement Tracking

**User Story:**
Como sistema, necesito trackear toda la actividad de participantes (asistencia, reacciones, preguntas, feedback) para calcular puntos, rankings y analytics de engagement en tiempo real.

**Acceptance Criteria:**

1. **Join Event**
   - Participant puede unirse a un evento usando eventId
   - El sistema crea registro de participante con: displayName, avatar (emoji random)
   - El sistema registra joinTime
   - El participant gana +50 puntos por asistencia base
   - El sistema calcula isExternal basado en email domain (future)

2. **Submit Reaction**
   - Participant puede enviar emoji reactions: 🔥👏💡🤔❤️🚀
   - Límite: 10 reacciones por evento (anti-spam)
   - Cada reacción da +5 puntos (max 50 puntos)
   - El sistema registra timestamp de cada reacción
   - Las reacciones se muestran en leaderboard activity feed (future)

3. **Ask Question**
   - Participant puede enviar preguntas en Q&A
   - Pregunta puede ser anonymous (si allowAnonymousQuestions = true)
   - Cada pregunta da +25 puntos
   - El sistema almacena: text, isAnonymous, timestamp
   - Admin puede ver todas las preguntas en dashboard

4. **Submit Feedback**
   - Participant puede completar feedback post-meeting
   - Feedback incluye: rating (1-5), goalAchieved (yes/partially/no), feedback text
   - Completar feedback da +40 puntos
   - El sistema valida que event.phase = 'post'

5. **Calculate Points & Rank**
   - El sistema calcula puntos totales del participant en el evento
   - El sistema calcula ranking relativo (position entre todos los participants)
   - El sistema aplica streak multipliers si aplica
   - El sistema detecta y asigna badges automáticamente

6. **Track Attendance**
   - El sistema registra leaveTime cuando participant se desconecta
   - El sistema calcula attendancePercent = (stayDuration / eventDuration) * 100
   - Si attendancePercent >= 90%, otorga +30 puntos extra (Full Attendance badge)

**Technical Requirements:**

- Endpoints:
  ```
  POST   /api/events/:eventId/join
  GET    /api/events/:eventId/participants
  PATCH  /api/participants/:id
  POST   /api/participants/:id/reaction
  POST   /api/participants/:id/question
  POST   /api/participants/:id/feedback
  GET    /api/participants/:id/stats
  ```
- Real-time tracking: joinTime, leaveTime, lastActivity
- Points calculation: Server-side, immutable logs
- Ranking calculation: Dynamic query on participants table

**Database Schema:**

```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  display_name VARCHAR(255) NOT NULL,
  avatar VARCHAR(50) DEFAULT '🤖',
  is_external BOOLEAN DEFAULT false,
  
  -- Attendance
  join_time TIMESTAMP,
  leave_time TIMESTAMP,
  attendance_percent INTEGER DEFAULT 0,
  
  -- Engagement
  reactions JSONB DEFAULT '[]',
  questions JSONB DEFAULT '[]',
  poll_votes_count INTEGER DEFAULT 0,
  
  -- Feedback
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  goal_achieved VARCHAR(20) CHECK (goal_achieved IN ('yes', 'partially', 'no')),
  feedback TEXT,
  
  -- Gamification
  points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  rank INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

### Feature 4 - API - AI Meeting Q&A System

**User Story:**
Como participante, quiero poder hacer preguntas sobre el contenido de una reunión después de que terminó, usando el transcript, para obtener respuestas contextuales sin tener que leer todo el transcript manualmente.

**Acceptance Criteria:**

1. **Ask AI Question**
   - Participant puede enviar pregunta usando interfaz de chat
   - El sistema valida que el evento tenga transcript cargado
   - El sistema valida que event.phase = 'post' o 'closed'
   - El sistema valida que event.settings.enableAIQuestions = true
   - El participant gana +10 puntos por pregunta

2. **Generate AI Answer**
   - El sistema envía prompt a OpenAI API con: transcript + question
   - El prompt instruye: "responder solo basado en transcript, citar cuando sea útil, mencionar quién dijo qué"
   - El sistema retorna respuesta en < 10 segundos
   - El sistema registra pregunta + respuesta para analytics

3. **Handle Edge Cases**
   - Si no hay transcript: retornar error "Transcript not available yet"
   - Si transcript está vacío: retornar error "Transcript is empty"
   - Si AI no encuentra respuesta: "I couldn't find that information in the meeting transcript"
   - Si API falla: retornar error graceful + log error

4. **View Q&A History**
   - Participant puede ver historial de sus preguntas + respuestas
   - El sistema muestra: timestamp, pregunta, respuesta
   - El sistema ordena por timestamp DESC

**Technical Requirements:**

- Endpoints:
  ```
  POST   /api/events/:eventId/ai/ask
  GET    /api/participants/:participantId/ai/questions
  ```
- External API: OpenAI GPT-4 Turbo
- Timeout: 30 segundos máximo
- Rate limiting: 10 preguntas por participant por evento
- Cost control: Limitar transcript size a 50k tokens

**Prompt Template:**

```python
def generate_ai_prompt(transcript: str, question: str) -> str:
    return f"""
You are an AI assistant that answers questions about a meeting based on its transcript.

MEETING TRANSCRIPT:
{transcript}

USER QUESTION:
{question}

INSTRUCTIONS:
1. Answer based ONLY on the transcript content
2. If the information is not in the transcript, say so clearly
3. Quote relevant parts when helpful
4. Be concise but complete
5. Mention who said what when relevant
6. Use Spanish (Argentina) for the response

ANSWER:
"""
```

**Database Schema:**

```sql
CREATE TABLE ai_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

### Feature 5 - UI - Chrome Extension Sidebar

**User Story:**
Como participante en Google Meet, necesito ver una sidebar junto al video que me permita interactuar con el evento en sus diferentes fases (PRE/LIVE/POST) sin interrumpir la reunión en curso.

**Acceptance Criteria:**

1. **Injection & Initialization**
   - La extensión se inyecta automáticamente en meet.google.com
   - El sidebar aparece en el lado derecho (300px width, full height)
   - El sidebar NO tapa el video de Google Meet
   - La extensión detecta eventId desde URL parameter o localStorage
   - Si no hay eventId: mostrar "No event active" con link a setup

2. **Phase Detection & UI Switching**
   - La extensión detecta phase actual del evento via API call
   - La UI cambia automáticamente basado en phase:
     - **PRE**: Mostrar agenda, set goals, prepare questions
     - **LIVE**: Mostrar reactions bar, active poll, Q&A submit
     - **POST**: Mostrar feedback form, stats, AI Q&A
     - **CLOSED**: Mostrar final stats, leaderboard, share results
   - El cambio de phase es smooth con animación de fade

3. **PRE-Meeting UI Components**
   ```
   ┌─────────────────────────────────────┐
   │  📋 Agenda Preview                  │
   │  • Item 1 - 15 min                  │
   │  • Item 2 - 20 min                  │
   │  • Item 3 - 15 min                  │
   │                                     │
   │  🎯 Set Your Goal                   │
   │  [Text input]                       │
   │  [Save Goal] +20 pts                │
   │                                     │
   │  ❓ Prepare Questions                │
   │  [Text input]                       │
   │  [Add Question] +15 pts             │
   │  • Question 1 [ ] Asked             │
   │  • Question 2 [ ] Asked             │
   │                                     │
   │  👥 Attendees: 12 joined            │
   └─────────────────────────────────────┘
   ```

4. **LIVE-Meeting UI Components**
   ```
   ┌─────────────────────────────────────┐
   │  🔴 LIVE  |  🏆 145 pts  |  Rank #7 │
   │                                     │
   │  📊 Active Poll                     │
   │  "What's your Q1 priority?"         │
   │  ( ) Performance                    │
   │  ( ) Security                       │
   │  ( ) New Features                   │
   │  [Vote] +15 pts                     │
   │                                     │
   │  ⚡ Quick Reactions                 │
   │  [ 🔥 ] [ 👏 ] [ 💡 ]               │
   │  [ 🤔 ] [ ❤️ ] [ 🚀 ]               │
   │  5/10 reactions used                │
   │                                     │
   │  💬 Ask a Question                  │
   │  [Text input]                       │
   │  [ ] Anonymous                      │
   │  [Submit] +25 pts                   │
   └─────────────────────────────────────┘
   ```

5. **POST-Meeting UI Components**
   ```
   ┌─────────────────────────────────────┐
   │  ✅ Meeting Completed               │
   │                                     │
   │  📊 Your Stats                      │
   │  Total Points: 285                  │
   │  Rank: #3 / 45                      │
   │  Attendance: 95%                    │
   │  Polls Voted: 3/3                   │
   │  Questions Asked: 2                 │
   │                                     │
   │  🎖️ Badges Earned                   │
   │  🎯 Full Journey                    │
   │  📊 Poll Master                     │
   │                                     │
   │  ⭐ Rate this meeting               │
   │  [ 😞 ] [ 😐 ] [ 🙂 ] [ 😊 ] [ 🤩 ] │
   │                                     │
   │  🎯 Did you achieve your goal?      │
   │  ( ) Yes  ( ) Partially  ( ) No     │
   │                                     │
   │  💭 Feedback (optional)             │
   │  [Text area]                        │
   │  [Submit Feedback] +40 pts          │
   │                                     │
   │  🤖 Ask AI about the meeting        │
   │  [Chat interface]                   │
   └─────────────────────────────────────┘
   ```

6. **Animations & Feedback**
   - Cuando gana puntos: mostrar "+15 pts" floating animation
   - Cuando envía reacción: emoji flotante sube y desaparece
   - Cuando desbloquea badge: animación de confetti + badge rotation
   - Transiciones smooth entre phases (300ms fade)

7. **Offline Support**
   - Si pierde conexión: mostrar "Reconnecting..." banner
   - Acciones se guardan en localStorage y se sincronizan cuando vuelve conexión
   - Mostrar "Offline mode" indicator

**Technical Requirements:**

- Build: HTML + CSS + Vanilla JS (o TypeScript compilado)
- Storage: chrome.storage.local para persistencia
- API Client: fetch() con retry logic
- Styles: CSS3 con variables para theming
- Responsive: Fixed 300px width, responsive height
- Performance: < 50ms render time, < 10MB memory usage

**Component Files:**

```javascript
// sidebar/components/PreMeeting.js
// sidebar/components/LiveMeeting.js
// sidebar/components/PostMeeting.js
// sidebar/components/Poll.js
// sidebar/components/ReactionBar.js
// sidebar/components/PointsDisplay.js
// sidebar/components/Achievements.js
// sidebar/components/AIChat.js
```

---

### Feature 6 - UI - Admin Dashboard (React)

**User Story:**
Como administrador, necesito un dashboard web donde pueda crear eventos, gestionar polls, subir transcripts y ver analytics de engagement en tiempo real.

**Acceptance Criteria:**

1. **Events Management Page**
   - Admin puede ver lista de eventos: upcoming, live, completed
   - Admin puede filtrar por: fecha, phase, createdBy
   - Admin puede crear evento con modal form
   - Admin puede editar evento existente
   - Admin puede eliminar evento (con confirmación)
   - Admin puede cambiar phase manualmente
   - Lista muestra: title, startTime, participantCount, status badge

2. **Event Detail Page**
   - Admin ve detalle completo del evento
   - Admin ve lista de participants con stats individuales
   - Admin ve live participation metrics (si está en phase 'live')
   - Admin puede exportar datos a CSV

3. **Polls Management**
   - Admin puede crear poll asociado a evento
   - Admin puede ver estado de polls: draft, active, closed
   - Admin puede launch poll (solo si event.phase = 'live')
   - Admin puede close poll
   - Admin ve resultados en tiempo real con gráfico de barras
   - Admin puede exportar resultados de poll

4. **Transcript Upload**
   - Admin puede arrastrar archivo o seleccionar desde file picker
   - Formatos soportados: .txt, .vtt, .srt, .json
   - Mostrar progress bar durante upload
   - Validar tamaño máximo: 10MB
   - Preview del transcript antes de confirmar
   - Una vez subido, mostrar "AI Q&A Enabled" badge

5. **Analytics Dashboard**
   - Mostrar KPIs globales:
     - Average Rating (últimos 30 días)
     - Attendance Rate %
     - Poll Participation %
     - Feedback Completion %
   - Gráfico de engagement trend (últimos 3 meses)
   - Top feedback themes (análisis de texto con keywords)
   - Leaderboard global (top 10 participants all-time)
   - Filter por date range

6. **Settings Page**
   - Admin puede configurar puntos por acción
   - Admin puede crear badges custom (future)
   - Admin puede integrar con Google Calendar (future)
   - Admin puede configurar OpenAI API key

**Technical Requirements:**

- Framework: React 19 + TypeScript
- Routing: React Router v6
- State: React Context API + useReducer
- API Client: axios con interceptors
- UI Components: Build custom (no library needed for MVP)
- Charts: Recharts
- File upload: react-dropzone
- Authentication: Mock for MVP (hardcoded admin user)

**Pages Structure:**

```
/                  → Dashboard (analytics overview)
/events            → Events list
/events/:id        → Event detail
/events/new        → Create event
/polls             → Polls management
/analytics         → Full analytics
/settings          → Settings
```

**Component Structure:**

```tsx
// src/pages/Events.tsx
// src/pages/EventDetail.tsx
// src/pages/Analytics.tsx
// src/components/events/EventCard.tsx
// src/components/events/EventForm.tsx
// src/components/polls/PollCard.tsx
// src/components/polls/PollForm.tsx
// src/components/polls/PollResults.tsx
// src/components/analytics/KPICard.tsx
// src/components/analytics/EngagementChart.tsx
// src/components/analytics/Leaderboard.tsx
```

---

## 4. Non Functional Requirements

### 4.1 Performance

- **API Response Time**: < 200ms para endpoints GET, < 500ms para POST/PUT
- **Extension Load Time**: < 100ms desde página cargada hasta sidebar renderizada
- **AI Response Time**: < 10 segundos para respuesta de AI Q&A
- **Database Queries**: Indexar por event_id, participant_id, timestamp
- **Frontend Bundle Size**: < 500KB total para admin dashboard
- **Extension Bundle Size**: < 200KB total

### 4.2 Scalability

- **Concurrent Users**: Soportar 100 participants simultáneos en un evento
- **API Rate Limiting**: 100 requests por minuto por usuario
- **Database**: PostgreSQL con connection pooling (min=5, max=20)
- **AI Rate Limiting**: 10 preguntas por participant por evento

### 4.3 Security

- **Input Validation**: Sanitizar todos los inputs del usuario (XSS prevention)
- **SQL Injection Prevention**: Usar ORM queries (SQLAlchemy)
- **CORS**: Whitelist solo domains permitidos
- **Environment Variables**: Nunca exponer API keys en código
- **CSP Headers**: Content Security Policy en extension manifest
- **Data Privacy**: No almacenar datos sensibles sin encriptación

### 4.4 Usability

- **Responsive Design**: Admin dashboard responsive en mobile/tablet/desktop
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Loading States**: Mostrar spinners/skeletons durante carga
- **Error Messages**: Mensajes claros y accionables para el usuario
- **Internationalization**: Preparar estructura para i18n (español argentina por default)

### 4.5 Reliability

- **Uptime**: 99.5% uptime objetivo
- **Error Handling**: Graceful degradation si servicios externos fallan
- **Data Persistence**: Auto-save cada 30 segundos en extension localStorage
- **Retry Logic**: Reintentar API calls fallidos 3 veces con exponential backoff
- **Logging**: Structured logging con niveles (debug, info, warn, error)

### 4.6 Maintainability

- **Code Coverage**: Mínimo 90% unit test coverage
- **Documentation**: Swagger/OpenAPI para API, JSDoc para componentes
- **Git Strategy**: Feature branches, PR reviews obligatorios
- **Versioning**: Semantic versioning (semver) para releases
- **Monitoring**: Health checks endpoint `/api/health`

### 4.7 Browser Compatibility

- **Chrome**: v100+ (primary target)
- **Edge**: v100+ (Chromium-based, compatible)
- **Firefox**: v100+ (future phase, requires separate manifest)

---

## 5. Criteria Acceptance / Test Cases

### 5.1 Feature 1 - Event Management

**Test Case 1.1: Create Event Successfully**
```
GIVEN: Admin está autenticado
WHEN: POST /api/events con payload válido
THEN: 
  - Status code 201
  - Response contiene event con id, phase='pre'
  - Event está en database
  - createdAt y updatedAt están seteados
```

**Test Case 1.2: Cannot Create Event with Invalid Dates**
```
GIVEN: Admin envía endTime < startTime
WHEN: POST /api/events
THEN:
  - Status code 400
  - Error message: "endTime must be after startTime"
```

**Test Case 1.3: Update Event Phase from PRE to LIVE**
```
GIVEN: Event con phase='pre' existe
WHEN: PATCH /api/events/:id/phase con body { "phase": "live" }
THEN:
  - Status code 200
  - Event.phase = 'live'
  - updatedAt actualizado
```

**Test Case 1.4: Cannot Revert Phase**
```
GIVEN: Event con phase='live'
WHEN: PATCH /api/events/:id/phase con body { "phase": "pre" }
THEN:
  - Status code 400
  - Error: "Cannot revert to previous phase"
```

### 5.2 Feature 2 - Polls Management

**Test Case 2.1: Create Poll Successfully**
```
GIVEN: Event existe
WHEN: POST /api/events/:eventId/polls con payload válido
THEN:
  - Status code 201
  - Poll creado con status='draft'
  - Poll options creados en poll_options table
```

**Test Case 2.2: Launch Poll During Live Event**
```
GIVEN: Event con phase='live' y poll con status='draft'
WHEN: PATCH /api/polls/:id/status con { "status": "active" }
THEN:
  - Status code 200
  - Poll.status = 'active'
  - Solo 1 poll activo por evento
```

**Test Case 2.3: Vote on Active Poll**
```
GIVEN: Poll con status='active'
WHEN: POST /api/polls/:id/vote con { "optionId": "xyz" }
THEN:
  - Status code 200
  - vote_count incrementado
  - participant.points += 15
  - No puede votar dos veces (UNIQUE constraint)
```

**Test Case 2.4: Cannot Launch Poll if Event Not Live**
```
GIVEN: Event con phase='pre'
WHEN: PATCH /api/polls/:id/status con { "status": "active" }
THEN:
  - Status code 400
  - Error: "Cannot launch poll until event is live"
```

### 5.3 Feature 3 - Participant Tracking

**Test Case 3.1: Join Event Successfully**
```
GIVEN: Event existe con phase='pre' o 'live'
WHEN: POST /api/events/:eventId/join con { "displayName": "Juan" }
THEN:
  - Status code 201
  - Participant creado con joinTime
  - participant.points = 50 (attendance base)
```

**Test Case 3.2: Submit Reaction**
```
GIVEN: Participant en evento activo
WHEN: POST /api/participants/:id/reaction con { "emoji": "🔥" }
THEN:
  - Status code 200
  - Reaction registrada con timestamp
  - participant.points += 5
  - reactions.length <= 10 (limit enforced)
```

**Test Case 3.3: Ask Question Anonymously**
```
GIVEN: Event con allowAnonymousQuestions=true
WHEN: POST /api/participants/:id/question con { "text": "...", "isAnonymous": true }
THEN:
  - Status code 201
  - Question creada
  - participant.points += 25
  - displayName NO aparece en question para admin
```

**Test Case 3.4: Calculate Rank Correctly**
```
GIVEN: 5 participants con diferentes points
WHEN: GET /api/events/:eventId/participants
THEN:
  - Participants ordenados por points DESC
  - rank asignado correctamente (1, 2, 3, 4, 5)
```

### 5.4 Feature 4 - AI Q&A

**Test Case 4.1: Ask AI Question Successfully**
```
GIVEN: Event con transcript y enableAIQuestions=true, phase='post'
WHEN: POST /api/events/:eventId/ai/ask con { "question": "What was decided?" }
THEN:
  - Status code 200
  - Response contiene answer generado por AI
  - participant.points += 10
  - AI question registrada en database
```

**Test Case 4.2: Cannot Ask if No Transcript**
```
GIVEN: Event sin transcript
WHEN: POST /api/events/:eventId/ai/ask
THEN:
  - Status code 400
  - Error: "Transcript not available yet"
```

**Test Case 4.3: Rate Limiting AI Questions**
```
GIVEN: Participant ya hizo 10 preguntas
WHEN: POST /api/events/:eventId/ai/ask (pregunta #11)
THEN:
  - Status code 429
  - Error: "Rate limit exceeded. Max 10 questions per event."
```

### 5.5 Feature 5 - Extension UI

**Test Case 5.1: Extension Loads in Google Meet**
```
GIVEN: Extension instalada
WHEN: Usuario navega a meet.google.com
THEN:
  - Sidebar aparece en 300px width
  - No tapa el video
  - Muestra "No event active" si no hay eventId
```

**Test Case 5.2: Phase Switching Works**
```
GIVEN: Extension cargada con eventId
WHEN: Event.phase cambia de 'pre' a 'live'
THEN:
  - UI cambia de PreMeeting a LiveMeeting component
  - Transition smooth con fade animation
```

**Test Case 5.3: Points Animation Shows**
```
GIVEN: Extension en phase 'live'
WHEN: User envía reacción
THEN:
  - "+5 pts" aparece con floating animation
  - Emoji reacción flota hacia arriba y desaparece
  - Points total se actualiza en header
```

**Test Case 5.4: Offline Mode Works**
```
GIVEN: Extension activa con conexión
WHEN: Conexión se pierde
THEN:
  - Banner "Reconnecting..." aparece
  - Acciones se guardan en localStorage
  - Cuando vuelve conexión: se sincronizan automáticamente
```

### 5.6 Feature 6 - Admin Dashboard

**Test Case 6.1: Events List Loads**
```
GIVEN: Admin autenticado
WHEN: Navega a /events
THEN:
  - Lista de eventos se muestra
  - Eventos agrupados por status: live, upcoming, completed
  - Cada card muestra: title, startTime, participantCount
```

**Test Case 6.2: Create Event Modal Works**
```
GIVEN: Admin en /events
WHEN: Click [+ Create Event]
THEN:
  - Modal aparece con form
  - Campos validados en real-time
  - Submit crea evento y cierra modal
  - Lista se actualiza automáticamente
```

**Test Case 6.3: Transcript Upload Works**
```
GIVEN: Admin en event detail page
WHEN: Arrastra archivo .txt al dropzone
THEN:
  - Progress bar muestra upload
  - Preview del transcript se muestra
  - [Confirm] guarda transcript
  - "AI Q&A Enabled" badge aparece
```

**Test Case 6.4: Analytics Charts Render**
```
GIVEN: Admin en /analytics
WHEN: Página carga
THEN:
  - 4 KPI cards muestran métricas actualizadas
  - Engagement trend chart renderiza
  - Top feedback themes list aparece
  - Leaderboard muestra top 10
```

---

## 6. Considerations / Constraints / Additional Context

### 6.1 Existing System Integration

Este proyecto utiliza el monorepo existente **technight-2025-12** que ya tiene:

- ✅ Backend Python/FastAPI configurado en `backend/python/`
- ✅ Frontend React+Vite configurado en `frontend/`
- ✅ Database setup con SQLAlchemy ORM
- ✅ Swagger/OpenAPI auto-generation
- ✅ Health check endpoints

**Integración requerida:**
1. Extender modelos de SQLAlchemy en `backend/python/database.py`
2. Agregar nuevos endpoints en `backend/python/main.py`
3. Reutilizar `frontend/src/utils/api.ts` para API client
4. Crear nueva carpeta `extension/` en root del proyecto

### 6.2 Technical Constraints

**Backend:**
- PostgreSQL 15+ es requerido (no SQLite)
- OpenAI API key necesaria para Feature 4 (AI Q&A)
- Port 8080 debe estar disponible

**Extension:**
- Manifest V3 es obligatorio (V2 deprecated)
- Cannot use `eval()` or inline scripts (CSP)
- Storage limit: chrome.storage.local max 5MB
- Must request minimal permissions

**Browser Support:**
- Chrome 100+ (primary target)
- Google Meet only for MVP (no Zoom/Teams yet)

### 6.3 External Dependencies

**Required:**
- OpenAI API (GPT-4 Turbo) - $0.01 per 1K tokens
- PostgreSQL database (local or cloud)
- Chrome browser for development

**Optional (Future):**
- Google Calendar API (event sync)
- Slack API (notifications)
- Otter.ai API (transcript import)

### 6.4 Design Assets

**Color Palette:**
```css
--bg-primary: #0D0D0F;
--bg-secondary: #1A1A1F;
--accent-primary: #6366F1;
--accent-secondary: #22D3EE;
--success: #10B981;
--error: #EF4444;
--live: #EF4444;
```

**Typography:**
- Font: Inter (primary), Space Grotesk (headings)
- Sizes: 12px, 14px, 16px, 18px, 20px, 24px

**Icons:**
No icon library needed, use emojis for MVP:
- 🔥 Fire (reactions)
- 👏 Clap (reactions)
- 💡 Idea (reactions)
- 🎯 Goal (badges)
- 📊 Poll (badges)
- 🤖 AI (features)
- 🏆 Trophy (points)

### 6.5 Data Privacy Considerations

- **Anonymous Questions**: displayName nunca se expone si isAnonymous=true
- **Participant Data**: Solo agregados públicos, detalles solo para admin
- **Transcript Privacy**: No compartir fuera del sistema, no usar para training AI
- **GDPR Compliance**: Permitir delete account (future)

### 6.6 Known Limitations

**MVP Phase:**
- No real-time sync entre usuarios (polling cada 5 segundos)
- No WebSocket (HTTP polling solo)
- No authentication real (mock user)
- No multi-language support (español argentina solo)
- No mobile app (desktop Chrome solo)
- No Safari/Firefox extensions (Chrome solo)

**Performance:**
- AI responses pueden tardar 5-10 segundos
- Transcripts largos (>20k palabras) pueden causar timeout
- Leaderboard recalculation es O(n log n) - puede ser lento con >500 participants

### 6.7 Documentation Links

- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/mv3/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **React Docs**: https://react.dev/
- **OpenAI API Docs**: https://platform.openai.com/docs/

---

## 7. Agent Role

Sos un **Senior Full-Stack Engineer** especializado en:

1. **Chrome Extensions Development**
   - Manifest V3 architecture
   - Content scripts injection
   - chrome.storage API
   - Cross-origin communication
   - CSP-compliant code

2. **Backend API Development**
   - Python + FastAPI
   - SQLAlchemy ORM
   - RESTful design patterns
   - OpenAPI/Swagger documentation
   - Database optimization

3. **Frontend Development**
   - React 19 + TypeScript
   - Component architecture
   - State management patterns
   - Responsive design
   - Animations with CSS3

4. **AI Integration**
   - OpenAI API usage
   - Prompt engineering
   - Token optimization
   - Error handling for AI services

5. **Gamification Systems**
   - Points calculation algorithms
   - Badge/achievement logic
   - Ranking systems
   - Engagement metrics

**Tu expertise incluye:**
- SOLID principles en todas las capas
- Security best practices
- Performance optimization
- Testing strategies (unit, integration, e2e)
- Clean code y documentación clara

**Contexto adicional:**
- El proyecto usa el stack: Python/FastAPI + React + PostgreSQL
- Ya existe un monorepo configurado que debés extender
- El cliente prefiere respuestas en español argentina
- MVP debe completarse en iteraciones cortas (2-3 horas por feature)

---

## 8. Agent Planning Instructions

Estamos siguiendo un proceso de **NEW BRANCH → PLAN → DOCUMENT → IMPLEMENT → SMOKE TEST → CRITERIA ACCEPTANCE TESTS → COMMIT → PUSH**.

### Workflow Steps:

#### 1. **Create a New Branch**

Crear branch basada en `master` con nomenclatura:
```bash
feat/{tu-nombre}/{feature-name}
```

Ejemplo: `feat/fiocca/event-management-api`

#### 2. **Plan**

Evaluar el mejor approach para construir la feature:
- Revisar dependencias existentes
- Identificar componentes reutilizables
- Estimar complejidad y tiempo
- Definir orden de implementación

#### 3. **Ask for Approval**

**IMPORTANTE**: Antes de proceder a documentar o implementar:
- Hacer preguntas técnicas o de feature
- Clarificar ambigüedades
- Validar approach propuesto
- **Esperar aprobación explícita del usuario**

#### 4. **Document the Requirement**

Crear documentación en: `docs/{feat-name}/{feat-name}-requirement.md`

**Secciones obligatorias:**
- **Overview**: Resumen de la feature
- **Business Requirements**: Casos de uso detallados
- **Technical Requirements**: Especificaciones técnicas
- **Acceptance Criteria**: Criterios de aceptación claros
- **Clarifications**: Decisiones tomadas durante planning

#### 5. **Generate Progress Checklist**

Crear checklist en: `docs/{feat-name}/{feat-name}-progress.md`

**Formato:**
```markdown
# Feature Progress - {Nombre Feature}

## Backend
- [ ] Crear modelos SQLAlchemy
- [ ] Implementar endpoints API
- [ ] Agregar validaciones Pydantic
- [ ] Escribir unit tests
- [ ] Documentar con Swagger

## Frontend
- [ ] Crear componentes React
- [ ] Implementar API client methods
- [ ] Agregar estilos CSS
- [ ] Escribir unit tests
- [ ] Testear en navegador

## Integration
- [ ] Testear end-to-end
- [ ] Verificar criterios de aceptación
- [ ] Code review interno
```

#### 6. **Implement the Feature**

Seguir **code guidelines**:

**Security & Quality:**
- ✅ Código seguro (sanitización, validación)
- ✅ Human-readable (nombres descriptivos)
- ✅ Comentarios claros en lógica compleja

**Architecture:**
- ✅ Separar UI components de business logic
- ✅ Métodos cortos y claros (max 20 líneas)
- ✅ Aplicar los 5 principios SOLID
- ✅ Reutilizar componentes siempre que sea posible

**Documentation:**
- ✅ Documentar todos los endpoints con Swagger
- ✅ JSDoc en funciones públicas
- ✅ README actualizado si es necesario

**Testing:**
- ✅ Unit tests con 90%+ coverage
- ✅ Tests de complejidad (edge cases)
- ✅ Verificar que el código compila sin errores

**Refactoring:**
- ✅ Code review interno de tus cambios
- ✅ Eliminar código duplicado
- ✅ Optimizar queries N+1 si aplica

#### 7. **SMOKE TEST**

**IMPORTANTE**: Solicitar al usuario que inicie el SMOKE TEST.

**NO ejecutar el dev server vos mismo.**

El usuario ejecutará:
```bash
npm run dev:python  # Backend
npm run dev:frontend  # Admin dashboard
# Extension: Load unpacked en Chrome
```

Durante el smoke test:
- Iterar sobre cambios necesarios
- Fix bugs encontrados
- Ajustar UX según feedback
- Una vez satisfecho, continuar

#### 8. **Implement Test Cases**

Escribir tests que validen todos los **Criteria Acceptance**.

**Backend Tests:**
```bash
# Estructura
backend/python/tests/
├── unit/
│   ├── test_events.py
│   ├── test_polls.py
│   └── test_participants.py
└── integration/
    ├── test_event_flow.py
    └── test_poll_voting.py
```

**Ejemplo test:**
```python
def test_create_event_success():
    """Test creating event with valid payload"""
    response = client.post("/api/events", json={
        "title": "Test Event",
        "description": "Test Description",
        "startTime": "2024-12-20T10:00:00",
        "endTime": "2024-12-20T11:00:00"
    })
    assert response.status_code == 201
    assert response.json()["phase"] == "pre"
```

**Ejecutar tests:**
```bash
cd backend/python
pytest tests/ -v --cov=. --cov-report=html
```

#### 9. **Document the Implementation**

Crear documentación en: `docs/{feat-name}/{feat-name}-implementation.md`

**Secciones obligatorias:**
- **Overview**: Resumen de lo implementado
- **Implementation Strategy**: Qué checklist seguiste
- **Implementation Plan**:
  - Backend: Qué archivos modificaste/creaste
  - Frontend: Qué componentes agregaste
  - Database: Qué tablas/campos creaste
- **Testing Plan**: Qué tests escribiste y sus resultados
- **Deployment Plan**: Qué cambios en pipelines/DevSecOps si aplica

#### 10. **Maintain Documentation**

**Durante toda la sesión:**
- Actualizar `{feat-name}-requirement.md` si cambian requirements
- Actualizar `{feat-name}-progress.md` al completar items
- Actualizar `{feat-name}-implementation.md` con cambios iterativos

**Antes del commit final:**
- Verificar que toda la documentación esté sincronizada
- Agregar screenshots si es feature UI
- Incluir ejemplos de API requests/responses

---

### Ejemplo de Flow Completo

```bash
# 1. Branch
git checkout master
git pull origin master
git checkout -b feat/fiocca/event-management-api

# 2-3. Plan & Ask Approval
# (Dialog con usuario)

# 4. Document
# Crear docs/event-management/event-management-requirement.md

# 5. Checklist
# Crear docs/event-management/event-management-progress.md

# 6. Implement
# Modificar backend/python/main.py, database.py, etc.

# 7. Smoke Test
# Usuario ejecuta y valida

# 8. Tests
cd backend/python
pytest tests/ -v

# 9. Document Implementation
# Crear docs/event-management/event-management-implementation.md

# 10. Commit & Push
git add .
git commit -m "feat: implement event management API

- Add Event, AgendaItem models
- Add CRUD endpoints for events
- Add phase transition logic
- Add unit and integration tests
- 95% test coverage achieved

Closes #XX"
git push origin feat/fiocca/event-management-api
```

---

### Commit Message Guidelines

Usar **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: Nueva feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Ejemplo:**
```
feat(events): implement event management API

- Add Event and AgendaItem SQLAlchemy models
- Add POST /api/events endpoint
- Add GET /api/events/:id endpoint
- Add PATCH /api/events/:id/phase endpoint
- Add phase transition validation
- Add unit tests with 95% coverage
- Document all endpoints in Swagger

Closes #123
```

---

### Pre-Push Checklist

Antes de hacer push, verificar:

- [ ] ✅ Código compila sin errores
- [ ] ✅ Tests pasan: `pytest tests/ -v`
- [ ] ✅ Linter pasa: `flake8 .` o `pylint`
- [ ] ✅ Coverage >= 90%
- [ ] ✅ Swagger docs generadas correctamente
- [ ] ✅ No hay console.log() o print() olvidados
- [ ] ✅ No hay secrets hardcodeados
- [ ] ✅ Documentation actualizada
- [ ] ✅ Checklist de progreso completo

---

**¿Todo claro? ¡Empecemos! 🚀**

