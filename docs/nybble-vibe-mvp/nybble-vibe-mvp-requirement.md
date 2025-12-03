# Nybble Vibe MVP - Requirements Document

## Overview

**Nybble Vibe MVP** es una implementación funcional end-to-end de la plataforma de engagement para eventos. Incluye backend API, Chrome Extension y Admin Dashboard básico para demostrar el flujo completo de un evento en vivo con participantes interactuando en tiempo real.

**Objetivo del MVP:** Demostrar un evento LIVE funcional donde múltiples participantes pueden:
- Unirse al evento desde Google Meet
- Votar en polls lanzadas por el admin
- Enviar reacciones con animaciones
- Hacer preguntas en Q&A
- Ver su score y ranking en tiempo real
- Completar feedback post-meeting

**Tiempo estimado:** 25-30 horas de desarrollo

---

## Business Requirements

### Use Case 1: Admin crea evento y lo controla en vivo

**Actor:** Administrador del evento

**Precondiciones:**
- Backend está corriendo
- Admin tiene acceso al dashboard
- Database está inicializada con seed data

**Flujo Principal:**

1. Admin ejecuta seed script: `python seed.py --reset`
2. Sistema crea 1 evento en fase LIVE con eventId
3. Admin abre dashboard: `http://localhost:5173/events/:eventId/control`
4. Admin ve:
   - Estado del evento (título, phase, participantes)
   - Lista de polls (activos, draft, cerrados)
   - Lista de participantes con puntos y ranking
   - Preguntas Q&A enviadas
5. Admin puede:
   - Lanzar poll (cambiar de draft a active)
   - Cerrar poll (cambiar de active a closed)
   - Ver resultados en tiempo real
   - Cambiar phase del evento (LIVE → POST)
6. Sistema actualiza extension de participantes automáticamente (polling cada 5 seg)

**Post-condiciones:**
- Event phase cambiado
- Polls activados/cerrados según acciones
- Participants reciben updates via polling

**Alternativas:**
- Si no hay seed data: Admin ve dashboard vacío
- Si extension no está conectada: Admin puede controlar igual

---

### Use Case 2: Participante se une a evento y participa

**Actor:** Participante del evento

**Precondiciones:**
- Extension instalada en Chrome
- Evento existe y está en fase PRE o LIVE
- Participante tiene eventId configurado

**Flujo Principal:**

1. Participante abre Google Meet: `https://meet.google.com/test-demo`
2. Extension detecta página y se inyecta automáticamente
3. Sidebar aparece 300px a la derecha
4. Participante hace click en "Join Event"
5. Sistema crea participant record con:
   - Display name (input del usuario)
   - Avatar aleatorio (emoji)
   - Join time (timestamp)
   - +50 puntos base por asistencia
6. Extension muestra fase actual:
   - **PRE:** Agenda, set goal, prepare questions
   - **LIVE:** Reactions bar, active poll, Q&A, points display
   - **POST:** Feedback form, stats, badges
7. Participante en fase LIVE:
   - Ve poll activo → vota → +15 pts → animación
   - Click reacción 🔥 → emoji flota → +5 pts
   - Escribe pregunta → submit → +25 pts
   - Ve su ranking actualizado en tiempo real
8. Admin cambia phase a POST
9. Extension detecta cambio (polling)
10. UI cambia a feedback form
11. Participante completa feedback → +40 pts
12. Ve stats finales: total points, rank, badges earned

**Post-condiciones:**
- Participant record creado en database
- Puntos calculados correctamente
- Ranking actualizado
- Todas las acciones registradas (reactions, votes, questions)

**Alternativas:**
- Si eventId no configurado: Mostrar "No event active"
- Si evento en fase POST: Saltar directo a feedback
- Si pierde conexión: Guardar en localStorage, sync cuando vuelve

---

### Use Case 3: Sistema calcula puntos y ranking automáticamente

**Actor:** Sistema (backend)

**Trigger:** Participante realiza acción puntuable

**Flujo Principal:**

1. Participant envía action (vote, reaction, question, feedback)
2. Backend recibe request en endpoint correspondiente
3. Sistema valida:
   - Participant existe
   - Action es válida (ej: no votar dos veces mismo poll)
   - Event está en fase correcta
4. Sistema ejecuta action:
   - Registra en tabla correspondiente (reactions, poll_votes, questions)
   - Calcula puntos según tabla de puntos
   - Actualiza participant.points
5. Sistema recalcula ranking:
   - Query: `SELECT * FROM participants WHERE event_id = X ORDER BY points DESC`
   - Asigna rank = position en resultado
   - Update participant.rank
6. Sistema retorna respuesta con:
   - Success status
   - Puntos ganados
   - Nuevo total de puntos
   - Nuevo ranking

**Post-condiciones:**
- Participant.points actualizado
- Participant.rank actualizado
- Action registrada en database
- Response enviado a extension

**Reglas de Negocio:**
- Attendance base: +50 puntos
- Vote poll: +15 puntos
- Reaction: +5 puntos (max 10 reacciones = 50 pts)
- Ask question: +25 puntos
- Submit feedback: +40 puntos
- Full attendance (90%+): +30 puntos bonus

---

## Technical Requirements

### Backend API

**Framework:** FastAPI 0.104+
**Database:** PostgreSQL 15+
**ORM:** SQLAlchemy

**Endpoints Required:**

```
# Events
POST   /api/events                    # Crear evento (usado por seeder)
GET    /api/events/:id                # Get event details
PATCH  /api/events/:id/phase          # Cambiar phase (admin)

# Polls
GET    /api/events/:eventId/polls     # Listar polls del evento
POST   /api/events/:eventId/polls     # Crear poll (usado por seeder)
PATCH  /api/polls/:id/status          # Launch/close poll (admin)
POST   /api/polls/:id/vote            # Votar en poll (participant)
GET    /api/polls/:id/results         # Ver resultados

# Participants
POST   /api/events/:eventId/join      # Unirse a evento
GET    /api/events/:eventId/participants  # Listar participantes (admin)
GET    /api/participants/:id/stats    # Mis stats (participant)
POST   /api/participants/:id/reaction # Enviar reacción
POST   /api/participants/:id/question # Hacer pregunta
POST   /api/participants/:id/feedback # Enviar feedback

# Health
GET    /api/health                    # Health check
```

**Database Tables:**

```sql
-- events: Información del evento
-- polls: Encuestas del evento
-- poll_options: Opciones de cada poll
-- poll_votes: Votos de participantes
-- participants: Participantes del evento
-- reactions: Reacciones enviadas
-- questions: Preguntas Q&A
```

**Validations:**
- Event: endTime > startTime
- Poll: 2-10 options, solo 1 activo por evento
- Vote: 1 voto por participant por poll (UNIQUE constraint)
- Reaction: max 10 por participant por evento
- Phase transitions: solo forward (pre→live→post→closed)

**CORS Configuration:**
```python
origins = [
    "http://localhost:5173",           # Admin dashboard
    "chrome-extension://*",            # Extension (wildcard for dev)
    "https://meet.google.com"          # Content script context
]
```

---

### Chrome Extension

**Manifest:** V3
**Language:** Vanilla JavaScript
**Storage:** chrome.storage.local

**Permissions Required:**
```json
{
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["https://meet.google.com/*"]
}
```

**Components:**

```
extension/
├── manifest.json              # Extension config
├── background/
│   └── service-worker.js      # Background tasks (minimal)
├── content/
│   ├── inject.js              # Inject sidebar into Meet
│   └── styles.css             # Sidebar positioning
├── sidebar/
│   ├── index.html             # Sidebar HTML
│   ├── app.js                 # Main app logic
│   ├── components/
│   │   ├── PreMeeting.js      # PRE phase UI
│   │   ├── LiveMeeting.js     # LIVE phase UI (core)
│   │   ├── PostMeeting.js     # POST phase UI
│   │   ├── Poll.js            # Poll voting component
│   │   └── ReactionBar.js     # Reactions with animations
│   └── services/
│       ├── api.js             # API client (fetch wrapper)
│       └── storage.js         # chrome.storage wrapper
└── assets/icons/
```

**Key Features:**
- Auto-inject en meet.google.com
- Phase detection via API polling (every 5 sec)
- Dynamic UI switching based on phase
- Animations: floating emojis, points popup, badge unlock
- localStorage sync para offline actions
- Retry logic para API calls

---

### Admin Dashboard

**Framework:** React 19 + TypeScript
**Build:** Vite 6
**Routing:** React Router v6

**Single Page Required (MVP):**

`/events/:eventId/control` - Event Control Panel

**Features:**
- Ver info del evento (title, phase, participant count)
- Cambiar phase con botón dropdown
- Lista de polls con actions:
  - Launch (draft → active)
  - Close (active → closed)
  - Ver resultados en tiempo real
- Lista de participants ordenada por points
- Lista de Q&A questions (public + anonymous)
- Auto-refresh cada 5 segundos (polling)

**No incluir en MVP:**
- Create event form (usar seeder)
- Analytics dashboard
- Settings page
- Export to CSV

---

## Acceptance Criteria

### Backend API

✅ **AC1:** Health check retorna 200 OK
```bash
curl http://localhost:8080/api/health
# Response: {"status": "ok", "timestamp": "..."}
```

✅ **AC2:** Seed script crea datos completos
```bash
python seed.py --reset
# Output: Event ID, polls creados, participantes creados
```

✅ **AC3:** Participant puede unirse a evento
```bash
POST /api/events/:eventId/join
Body: { "displayName": "Test User" }
# Response: 201, participant con points=50
```

✅ **AC4:** Participant puede votar poll activo
```bash
POST /api/polls/:pollId/vote
Body: { "participantId": "...", "optionId": "..." }
# Response: 200, points+=15, vote registrado
```

✅ **AC5:** Ranking se calcula correctamente
```bash
GET /api/events/:eventId/participants
# Response: participants ordenados por points DESC, rank asignado
```

✅ **AC6:** Solo 1 poll activo por evento
```bash
# Launch poll 2 mientras poll 1 está activo
PATCH /api/polls/:poll2Id/status { "status": "active" }
# Response: 400, error "Only one active poll allowed"
```

---

### Chrome Extension

✅ **AC7:** Extension se inyecta en Google Meet
```
1. Abrir https://meet.google.com/test-demo
2. Sidebar aparece en lado derecho 300px width
3. No tapa video de Meet
```

✅ **AC8:** Join event funciona
```
1. Click "Join Event"
2. Enter display name
3. Extension muestra: "🔴 LIVE | 🏆 50 pts | Rank #X"
```

✅ **AC9:** Poll voting funciona con animación
```
1. Ver poll activo en sidebar
2. Select opción → Click "Vote"
3. Animation "+15 pts" aparece
4. Total points actualiza
5. Poll marca como "Voted"
```

✅ **AC10:** Reactions funcionan con animaciones
```
1. Click emoji 🔥
2. Emoji flota hacia arriba y desaparece (2 seg animation)
3. "+5 pts" popup aparece
4. Counter muestra "1/10 reactions used"
```

✅ **AC11:** Phase switching automático
```
1. Extension en phase LIVE
2. Admin cambia a POST en dashboard
3. En <10 segundos, extension detecta cambio (polling)
4. UI hace fade out → fade in a POST phase UI
```

---

### Admin Dashboard

✅ **AC12:** Control panel carga correctamente
```
1. Abrir http://localhost:5173/events/:eventId/control
2. Ver título del evento
3. Ver phase badge (LIVE)
4. Ver contador de participantes
```

✅ **AC13:** Launch poll funciona
```
1. Ver poll en status "DRAFT"
2. Click botón "Launch"
3. Status cambia a "ACTIVE"
4. Aparece en "Active Polls" section
5. Extension users ven poll en <10 seg
```

✅ **AC14:** Poll results actualizan en tiempo real
```
1. Poll activo con 3 opciones
2. Participants votan desde extension
3. Dashboard actualiza porcentajes cada 5 seg
4. Progress bars reflejan votos correctos
```

✅ **AC15:** Participants list muestra ranking
```
1. Ver lista ordenada por points DESC
2. Columnas: Rank, Avatar, Name, Points
3. Top 3 tienen badge especial (🥇🥈🥉)
4. Auto-refresh cada 5 segundos
```

---

## Clarifications

### Decisiones Técnicas Tomadas

1. **Database: PostgreSQL** - No SQLite por features avanzadas (JSONB, UUID)
2. **Extension: Vanilla JS** - No TypeScript para más velocidad en MVP
3. **No AI Q&A** - Excluido del MVP, fase 2
4. **No WebSockets** - Polling cada 5 segundos es suficiente para MVP
5. **No Authentication** - Todos users anónimos, admin hardcoded
6. **CORS Permisivo** - Para facilitar desarrollo
7. **Test Coverage: 80%** - En vez de 90% para más velocidad
8. **1 Branch único** - No feature branches separadas

### Limitaciones Conocidas MVP

- Polling en vez de real-time (puede tener 5 seg delay)
- Sin offline-first (sync básico en localStorage)
- Sin autenticación (cualquiera puede ser admin)
- Sin rate limiting en endpoints
- Sin optimistic updates en UI
- Sin animations avanzadas (solo básicas)

### Datos de Seed

El script `seed.py` genera:
- 1 evento "Tech Talk Q4 2024" en fase LIVE
- 3 polls (1 activo: "Q1 Priority", 2 draft)
- 10 participantes con nombres argentinos
- Puntos aleatorios 50-300
- 1-5 reactions por participante
- 40% de participantes tienen pregunta Q&A

### Próximos Pasos (Fase 2)

No incluidos en MVP:
- AI Q&A con OpenAI
- Transcript upload
- Badges avanzados (solo 3 básicos)
- Streaks cross-events
- Analytics dashboard completo
- Create/Edit event UI
- Email notifications
- Export to CSV
- WebSocket real-time updates

---

## Success Metrics

El MVP está completo cuando:

✅ Seed script ejecuta en < 10 segundos
✅ Backend responde en < 200ms endpoints GET
✅ Extension carga en Meet en < 100ms
✅ Participant puede unirse, votar, reaccionar sin bugs
✅ Admin puede controlar evento desde dashboard
✅ Puntos y ranking calculan correctamente
✅ Todas las animaciones son smooth (60fps)
✅ Unit tests pasan con 80%+ coverage
✅ Demo end-to-end funciona sin errores

---

**Document Version:** 1.0
**Last Updated:** 2024-12-03
**Author:** AI Agent + Fernando Fiocca

