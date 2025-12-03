# Nybble Vibe MVP - Progress Checklist

## 📊 Overall Progress: 0/60 tasks (0%)

---

## Phase 1: Backend Foundation (12-15h)

### Database Models & Schema (2-3h)
- [ ] Create `models.py` with SQLAlchemy models
  - [ ] Event model
  - [ ] AgendaItem model  
  - [ ] Poll model
  - [ ] PollOption model
  - [ ] PollVote model
  - [ ] Participant model
  - [ ] Reaction model
  - [ ] Question model
- [ ] Create `schemas.py` with Pydantic schemas
  - [ ] EventCreate, EventResponse
  - [ ] PollCreate, PollResponse
  - [ ] ParticipantCreate, ParticipantResponse
  - [ ] Validation schemas
- [ ] Update `database.py` with table creation
- [ ] Test database connection and table creation

### Events API (2h)
- [ ] Implement POST `/api/events`
- [ ] Implement GET `/api/events/:id`
- [ ] Implement PATCH `/api/events/:id/phase`
- [ ] Add Swagger documentation for endpoints
- [ ] Test endpoints with curl/Postman

### Polls API (3h)
- [ ] Implement GET `/api/events/:eventId/polls`
- [ ] Implement POST `/api/events/:eventId/polls`
- [ ] Implement PATCH `/api/polls/:id/status`
- [ ] Implement POST `/api/polls/:id/vote`
- [ ] Implement GET `/api/polls/:id/results`
- [ ] Add validation: only 1 active poll per event
- [ ] Add validation: unique vote per participant
- [ ] Add Swagger documentation
- [ ] Test poll lifecycle (create → launch → vote → close)

### Participants API (3h)
- [ ] Implement POST `/api/events/:eventId/join`
- [ ] Implement GET `/api/events/:eventId/participants`
- [ ] Implement GET `/api/participants/:id/stats`
- [ ] Implement POST `/api/participants/:id/reaction`
- [ ] Implement POST `/api/participants/:id/question`
- [ ] Implement POST `/api/participants/:id/feedback`
- [ ] Add Swagger documentation
- [ ] Test participant actions flow

### Points & Ranking System (2h)
- [ ] Implement points calculation logic
  - [ ] Attendance: +50 pts
  - [ ] Poll vote: +15 pts
  - [ ] Reaction: +5 pts (max 50)
  - [ ] Question: +25 pts
  - [ ] Feedback: +40 pts
- [ ] Implement ranking calculation
  - [ ] ORDER BY points DESC
  - [ ] Assign rank positions
- [ ] Test points calculation accuracy
- [ ] Test ranking updates

### Seed Script (2h)
- [ ] Create `seed.py` script
- [ ] Implement event creation
- [ ] Implement polls creation (3 polls)
- [ ] Implement participants creation (10 participants)
- [ ] Generate random reactions, questions, votes
- [ ] Add --reset flag functionality
- [ ] Add --phase flag functionality
- [ ] Test seed script execution
- [ ] Document seed usage

---

## Phase 2: Chrome Extension (10-12h)

### Extension Setup (2h)
- [ ] Create `extension/` folder structure
- [ ] Create `manifest.json` with V3 config
- [ ] Configure permissions (storage, activeTab)
- [ ] Configure host_permissions (meet.google.com)
- [ ] Create icons (16px, 48px, 128px)
- [ ] Test extension loads in Chrome

### Content Script Injection (1h)
- [ ] Create `content/inject.js`
- [ ] Implement sidebar injection logic
- [ ] Create `content/styles.css` for positioning
- [ ] Test sidebar appears in Meet (300px width)
- [ ] Test sidebar doesn't overlap video

### Sidebar Core (2h)
- [ ] Create `sidebar/index.html`
- [ ] Create `sidebar/app.js` main logic
- [ ] Implement phase detection via API
- [ ] Implement polling mechanism (every 5 sec)
- [ ] Implement UI state management
- [ ] Test phase switching works

### API Service Layer (1h)
- [ ] Create `sidebar/services/api.js`
- [ ] Implement fetch wrapper with error handling
- [ ] Implement retry logic (3 attempts)
- [ ] Add endpoints methods:
  - [ ] getEvent(eventId)
  - [ ] joinEvent(eventId, displayName)
  - [ ] getPolls(eventId)
  - [ ] voteOnPoll(pollId, optionId)
  - [ ] submitReaction(participantId, emoji)
  - [ ] submitQuestion(participantId, text, anonymous)
  - [ ] submitFeedback(participantId, data)
- [ ] Test API calls work from extension

### Storage Service (30min)
- [ ] Create `sidebar/services/storage.js`
- [ ] Implement chrome.storage.local wrappers
- [ ] Store: eventId, participantId, phase
- [ ] Implement offline queue for actions
- [ ] Test storage persistence

### PRE-Meeting UI (2h)
- [ ] Create `sidebar/components/PreMeeting.js`
- [ ] Implement agenda display
- [ ] Implement "Set Goal" form
- [ ] Implement "Prepare Questions" form
- [ ] Implement attendees counter
- [ ] Style with CSS
- [ ] Test PRE phase UI

### LIVE-Meeting UI (3h)
- [ ] Create `sidebar/components/LiveMeeting.js`
- [ ] Create `sidebar/components/Poll.js`
  - [ ] Display poll question
  - [ ] Radio buttons for options
  - [ ] Vote button
  - [ ] "Voted" state
- [ ] Create `sidebar/components/ReactionBar.js`
  - [ ] 6 emoji buttons (🔥👏💡🤔❤️🚀)
  - [ ] Click handler
  - [ ] Floating emoji animation
  - [ ] Counter: X/10 reactions used
- [ ] Implement points display header
  - [ ] Current points
  - [ ] Current rank
  - [ ] LIVE indicator
- [ ] Implement Q&A form
  - [ ] Text input
  - [ ] Anonymous checkbox
  - [ ] Submit button
- [ ] Style with CSS (dark theme)
- [ ] Test LIVE phase UI

### POST-Meeting UI (2h)
- [ ] Create `sidebar/components/PostMeeting.js`
- [ ] Implement stats display
  - [ ] Total points
  - [ ] Final rank
  - [ ] Attendance %
  - [ ] Polls voted
  - [ ] Questions asked
- [ ] Implement badges display
- [ ] Implement rating selector (emoji scale)
- [ ] Implement goal achievement selector
- [ ] Implement feedback textarea
- [ ] Submit feedback button
- [ ] Style with CSS
- [ ] Test POST phase UI

### Animations (1h)
- [ ] Points popup animation (+X pts)
- [ ] Floating emoji animation (reaction)
- [ ] Badge unlock animation (confetti effect)
- [ ] Phase transition fade animation
- [ ] Test animations are smooth (60fps)

---

## Phase 3: Admin Dashboard (5-8h)

### React Setup (1h)
- [ ] Navigate to `frontend/` directory
- [ ] Install additional dependencies (if needed)
- [ ] Create `/events/:eventId/control` route
- [ ] Setup TypeScript types for API responses
- [ ] Test routing works

### Event Control Panel Page (2h)
- [ ] Create `frontend/src/pages/EventControl.tsx`
- [ ] Fetch event data on mount
- [ ] Display event info card:
  - [ ] Title
  - [ ] Phase badge
  - [ ] Participant count
  - [ ] Start/End time
- [ ] Implement phase controller dropdown
  - [ ] Buttons: PRE, LIVE, POST, CLOSED
  - [ ] PATCH request to change phase
- [ ] Implement auto-refresh (polling every 5 sec)
- [ ] Style with CSS
- [ ] Test page loads and displays data

### Poll Management UI (2h)
- [ ] Create `frontend/src/components/PollCard.tsx`
- [ ] Display poll status badge (draft/active/closed)
- [ ] Display poll question
- [ ] Display poll options with vote counts
- [ ] Implement "Launch" button (draft → active)
- [ ] Implement "Close" button (active → closed)
- [ ] Show progress bars for results
- [ ] Calculate percentages
- [ ] Style with CSS
- [ ] Test poll actions work

### Participants List (1h)
- [ ] Create `frontend/src/components/ParticipantList.tsx`
- [ ] Fetch participants on mount
- [ ] Display table columns:
  - [ ] Rank (with 🥇🥈🥉 for top 3)
  - [ ] Avatar (emoji)
  - [ ] Display Name
  - [ ] Points
- [ ] Sort by points DESC
- [ ] Auto-refresh with parent component
- [ ] Style table with CSS
- [ ] Test list updates

### Q&A Questions View (1h)
- [ ] Create `frontend/src/components/QuestionsList.tsx`
- [ ] Fetch questions on mount
- [ ] Display question cards:
  - [ ] Text
  - [ ] "Anonymous" badge if anonymous
  - [ ] Author name if not anonymous
  - [ ] Timestamp
- [ ] Sort by timestamp DESC
- [ ] Auto-refresh with parent
- [ ] Style with CSS
- [ ] Test questions display

### API Integration (1h)
- [ ] Update `frontend/src/utils/api.ts`
- [ ] Add event endpoints:
  - [ ] getEvent(id)
  - [ ] updatePhase(id, phase)
- [ ] Add poll endpoints:
  - [ ] getPolls(eventId)
  - [ ] updatePollStatus(pollId, status)
  - [ ] getPollResults(pollId)
- [ ] Add participant endpoints:
  - [ ] getParticipants(eventId)
  - [ ] getQuestions(eventId)
- [ ] Test API client works

---

## Phase 4: Testing & Polish (3-5h)

### Backend Unit Tests (2h)
- [ ] Setup pytest in `backend/python/tests/`
- [ ] Create `test_events.py`
  - [ ] Test create event
  - [ ] Test get event
  - [ ] Test update phase
  - [ ] Test phase validation (no backwards)
- [ ] Create `test_polls.py`
  - [ ] Test create poll
  - [ ] Test launch poll (only 1 active)
  - [ ] Test vote (unique constraint)
  - [ ] Test close poll
- [ ] Create `test_participants.py`
  - [ ] Test join event
  - [ ] Test submit reaction (max 10)
  - [ ] Test submit question
  - [ ] Test points calculation
  - [ ] Test ranking calculation
- [ ] Run tests: `pytest -v --cov`
- [ ] Achieve 80%+ coverage

### Integration Testing (1h)
- [ ] Test full flow: seed → join → vote → react → feedback
- [ ] Test concurrent participants
- [ ] Test phase transitions
- [ ] Test error handling (404, 400, 500)
- [ ] Fix bugs found during testing

### Extension Testing (1h)
- [ ] Load extension in Chrome
- [ ] Test in Google Meet
- [ ] Test all phase UIs
- [ ] Test all animations
- [ ] Test API integration
- [ ] Test offline mode (disconnect network)
- [ ] Fix bugs found

### Dashboard Testing (30min)
- [ ] Test control panel loads
- [ ] Test poll launch/close
- [ ] Test phase change
- [ ] Test auto-refresh
- [ ] Fix bugs found

### Documentation (30min)
- [ ] Update README.md with setup instructions
- [ ] Document API endpoints in Swagger
- [ ] Add comments to complex code
- [ ] Create demo video script

---

## Phase 5: Integration & Demo Prep (1-2h)

### End-to-End Test (1h)
- [ ] Reset database: `python seed.py --reset`
- [ ] Start backend: `npm run dev:python`
- [ ] Start frontend: `npm run dev:frontend`
- [ ] Load extension in Chrome
- [ ] Open Google Meet
- [ ] Test complete flow:
  - [ ] Join event from extension
  - [ ] Vote on poll
  - [ ] Send reactions
  - [ ] Ask question
  - [ ] Admin launches new poll
  - [ ] Admin changes phase to POST
  - [ ] Submit feedback
  - [ ] View final stats
- [ ] Document any issues
- [ ] Fix critical bugs

### Demo Preparation (30min)
- [ ] Create demo script
- [ ] Prepare seed data with good examples
- [ ] Test demo flow 3 times
- [ ] Record demo video (optional)
- [ ] Prepare screenshots

---

## 📝 Notes

### Blockers
- None currently

### Questions
- None currently

### Nice-to-Haves (Future)
- AI Q&A mock responses
- More badge types
- Better animations
- WebSocket real-time
- Mobile responsive dashboard

---

**Last Updated:** 2024-12-03
**Total Estimated Time:** 25-30 hours
**Current Phase:** Starting Phase 1

