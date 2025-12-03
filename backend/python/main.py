"""
Nybble Vibe - Backend API
FastAPI application with event management, polls, and participant tracking
"""

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from uuid import UUID
import os
import yaml
from dotenv import load_dotenv
import signal
import sys
import uvicorn

# Import database and models
from database import check_database_connection, get_db, create_tables
from models import (
    Event, AgendaItem, Poll, PollOption, PollVote,
    Participant, Reaction, Question
)
from schemas import (
    # Event schemas
    EventCreate, EventResponse, EventPhaseUpdate, EventSummary,
    # Poll schemas
    PollCreate, PollResponse, PollStatusUpdate, PollVoteCreate, PollVoteResponse,
    # Participant schemas
    ParticipantCreate, ParticipantResponse, ParticipantDetail, ParticipantStats,
    ReactionCreate, QuestionCreate, QuestionResponse, FeedbackCreate, ActionResponse,
    # Health
    HealthResponse, ErrorResponse
)

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Nybble Vibe API",
    version="1.0.0",
    description="Event engagement platform with gamification and real-time feedback",
    docs_url="/api/swagger",
    openapi_url="/api/openapi.json",
)

PORT = int(os.getenv("PORT", 8080))

# CORS configuration - permissive for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Admin dashboard
        "chrome-extension://*",       # Extension (wildcard)
        "https://meet.google.com"     # Google Meet
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Startup Event - Create Tables
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    try:
        create_tables()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️  Database initialization failed: {e}")
        print("⚠️  Server will start but database operations may fail")


# ============================================================================
# Health Check Endpoints
# ============================================================================

@app.get(
    "/api/health",
    tags=["Health"],
    response_model=HealthResponse,
    summary="Health check"
)
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow(),
        "database": "connected" if check_database_connection()["connected"] else "disconnected"
    }


@app.get("/api/openapi.yaml", include_in_schema=False)
async def get_openapi_yaml():
    """Serve OpenAPI spec as YAML"""
    openapi_schema = app.openapi()
    yaml_content = yaml.dump(openapi_schema, default_flow_style=False)
    return Response(content=yaml_content, media_type="text/yaml")


# ============================================================================
# Events Endpoints
# ============================================================================

@app.post(
    "/api/events",
    tags=["Events"],
    response_model=EventResponse,
    status_code=201,
    summary="Create a new event"
)
async def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new event with agenda items
    
    - **title**: Event title (required)
    - **description**: Event description
    - **start_time**: Start time (ISO 8601)
    - **end_time**: End time (ISO 8601, must be after start_time)
    - **settings**: Event settings (optional)
    - **agenda_items**: List of agenda items (optional)
    """
    try:
        # Create event
        new_event = Event(
            title=event_data.title,
            description=event_data.description,
            start_time=event_data.start_time,
            end_time=event_data.end_time,
            meeting_url=event_data.meeting_url,
            settings=event_data.settings.dict() if event_data.settings else {},
            phase='pre',  # Default phase
            created_by=UUID('00000000-0000-0000-0000-000000000000')  # Placeholder for MVP
        )
        
        db.add(new_event)
        db.flush()  # Get the ID without committing
        
        # Create agenda items
        for item_data in event_data.agenda_items:
            agenda_item = AgendaItem(
                event_id=new_event.id,
                title=item_data.title,
                duration=item_data.duration,
                presenter=item_data.presenter,
                position=item_data.position
            )
            db.add(agenda_item)
        
        db.commit()
        db.refresh(new_event)
        
        return new_event
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating event: {str(e)}")


@app.get(
    "/api/events/{event_id}",
    tags=["Events"],
    response_model=EventResponse,
    summary="Get event by ID"
)
async def get_event(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Get event details including agenda items"""
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return event


@app.patch(
    "/api/events/{event_id}/phase",
    tags=["Events"],
    response_model=EventResponse,
    summary="Update event phase"
)
async def update_event_phase(
    event_id: UUID,
    phase_data: EventPhaseUpdate,
    db: Session = Depends(get_db)
):
    """
    Update event phase (admin only)
    
    Transitions: pre → live → post → closed
    Cannot go backwards!
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Validate phase transition (no backwards)
    phases = ['pre', 'live', 'post', 'closed']
    current_idx = phases.index(event.phase)
    new_idx = phases.index(phase_data.phase)
    
    if new_idx < current_idx:
        raise HTTPException(
            status_code=400,
            detail="Cannot revert to previous phase"
        )
    
    event.phase = phase_data.phase
    event.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(event)
    
    return event


# ============================================================================
# Polls Endpoints
# ============================================================================

@app.get(
    "/api/events/{event_id}/polls",
    tags=["Polls"],
    response_model=List[PollResponse],
    summary="Get all polls for an event"
)
async def get_polls(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all polls for an event with their options and results"""
    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Get polls with options
    polls = db.query(Poll).filter(Poll.event_id == event_id).all()
    
    # Add total votes count and percentage to each poll
    result = []
    for poll in polls:
        poll_dict = PollResponse.from_orm(poll).dict()
        poll_dict['total_votes'] = sum(opt.votes for opt in poll.options)
        
        # Calculate percentages for each option
        total = poll_dict['total_votes']
        for opt in poll_dict['options']:
            opt['percentage'] = (opt['votes'] / total * 100) if total > 0 else 0
        
        result.append(poll_dict)
    
    return result


@app.post(
    "/api/events/{event_id}/polls",
    tags=["Polls"],
    response_model=PollResponse,
    status_code=201,
    summary="Create a new poll"
)
async def create_poll(
    event_id: UUID,
    poll_data: PollCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new poll with options
    
    - **question**: Poll question (required)
    - **options**: 2-10 options (required)
    - **show_results_to**: Who can see results ('all', 'voted', 'admin')
    """
    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    try:
        # Create poll
        new_poll = Poll(
            event_id=event_id,
            question=poll_data.question,
            show_results_to=poll_data.show_results_to,
            status='draft'
        )
        
        db.add(new_poll)
        db.flush()
        
        # Create options
        for opt_data in poll_data.options:
            option = PollOption(
                poll_id=new_poll.id,
                text=opt_data.text,
                position=opt_data.position,
                votes=0
            )
            db.add(option)
        
        db.commit()
        db.refresh(new_poll)
        
        # Add total_votes
        response = PollResponse.from_orm(new_poll).dict()
        response['total_votes'] = 0
        return response
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating poll: {str(e)}")


@app.patch(
    "/api/polls/{poll_id}/status",
    tags=["Polls"],
    response_model=PollResponse,
    summary="Update poll status (launch/close)"
)
async def update_poll_status(
    poll_id: UUID,
    status_data: PollStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update poll status (admin only)
    
    - draft → active: Launch poll (only if event is LIVE and no other active polls)
    - active → closed: Close poll
    """
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Get event
    event = db.query(Event).filter(Event.id == poll.event_id).first()
    
    # Validate transitions
    if status_data.status == 'active':
        # Can only launch if event is LIVE
        if event.phase != 'live':
            raise HTTPException(
                status_code=400,
                detail="Cannot launch poll until event is live"
            )
        
        # Check if another poll is active
        active_poll = db.query(Poll).filter(
            Poll.event_id == poll.event_id,
            Poll.status == 'active',
            Poll.id != poll_id
        ).first()
        
        if active_poll:
            raise HTTPException(
                status_code=400,
                detail="Only one active poll allowed per event"
            )
    
    if status_data.status == 'closed':
        poll.closed_at = datetime.utcnow()
    
    poll.status = status_data.status
    
    db.commit()
    db.refresh(poll)
    
    response = PollResponse.from_orm(poll).dict()
    response['total_votes'] = sum(opt.votes for opt in poll.options)
    return response


@app.post(
    "/api/polls/{poll_id}/vote",
    tags=["Polls"],
    response_model=PollVoteResponse,
    status_code=200,
    summary="Vote on a poll"
)
async def vote_on_poll(
    poll_id: UUID,
    vote_data: PollVoteCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a vote on an active poll
    
    - One vote per participant per poll
    - Poll must be active
    - Awards +15 points
    """
    # Verify poll exists and is active
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if poll.status != 'active':
        raise HTTPException(status_code=400, detail="Poll is not active")
    
    # Verify participant exists
    participant = db.query(Participant).filter(
        Participant.id == vote_data.participant_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    # Check if already voted (unique constraint will catch this too)
    existing_vote = db.query(PollVote).filter(
        PollVote.poll_id == poll_id,
        PollVote.participant_id == vote_data.participant_id
    ).first()
    
    if existing_vote:
        raise HTTPException(status_code=400, detail="Already voted on this poll")
    
    try:
        # Create vote
        new_vote = PollVote(
            poll_id=poll_id,
            option_id=vote_data.option_id,
            participant_id=vote_data.participant_id,
            timestamp=datetime.utcnow()
        )
        
        db.add(new_vote)
        
        # Update option vote count
        option = db.query(PollOption).filter(
            PollOption.id == vote_data.option_id
        ).first()
        
        if option:
            option.votes += 1
        
        # Award points (+15)
        participant.points += 15
        participant.poll_votes_count += 1
        
        # Recalculate rank
        _recalculate_ranks(db, participant.event_id)
        
        db.commit()
        db.refresh(new_vote)
        db.refresh(participant)
        
        return PollVoteResponse(
            id=new_vote.id,
            poll_id=new_vote.poll_id,
            option_id=new_vote.option_id,
            participant_id=new_vote.participant_id,
            timestamp=new_vote.timestamp,
            points_earned=15
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error submitting vote: {str(e)}")


@app.get(
    "/api/polls/{poll_id}/results",
    tags=["Polls"],
    response_model=PollResponse,
    summary="Get poll results"
)
async def get_poll_results(
    poll_id: UUID,
    db: Session = Depends(get_db)
):
    """Get poll results with vote counts and percentages"""
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Calculate total votes and percentages
    total_votes = sum(opt.votes for opt in poll.options)
    
    response = PollResponse.from_orm(poll).dict()
    response['total_votes'] = total_votes
    
    for opt in response['options']:
        opt['percentage'] = (opt['votes'] / total_votes * 100) if total_votes > 0 else 0
    
    return response


# ============================================================================
# Participants Endpoints
# ============================================================================

@app.post(
    "/api/events/{event_id}/join",
    tags=["Participants"],
    response_model=ParticipantResponse,
    status_code=201,
    summary="Join an event"
)
async def join_event(
    event_id: UUID,
    participant_data: ParticipantCreate,
    db: Session = Depends(get_db)
):
    """
    Join an event as a participant
    
    - Creates participant record
    - Awards +50 points (base attendance)
    - Records join time
    """
    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Event must be in pre or live phase
    if event.phase not in ['pre', 'live']:
        raise HTTPException(
            status_code=400,
            detail="Cannot join event in this phase"
        )
    
    try:
        # Create participant
        new_participant = Participant(
            event_id=event_id,
            display_name=participant_data.display_name,
            avatar=participant_data.avatar,
            join_time=datetime.utcnow(),
            points=50,  # Base attendance points
            reactions=[],
            questions=[],
            badges=[]
        )
        
        db.add(new_participant)
        db.commit()
        db.refresh(new_participant)
        
        # Recalculate ranks
        _recalculate_ranks(db, event_id)
        
        db.refresh(new_participant)
        
        return new_participant
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error joining event: {str(e)}")


@app.get(
    "/api/events/{event_id}/participants",
    tags=["Participants"],
    response_model=List[ParticipantDetail],
    summary="Get all participants for an event"
)
async def get_participants(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all participants with their stats, ordered by points (leaderboard)"""
    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Get participants ordered by points
    participants = db.query(Participant).filter(
        Participant.event_id == event_id
    ).order_by(desc(Participant.points)).all()
    
    return participants


@app.get(
    "/api/participants/{participant_id}/stats",
    tags=["Participants"],
    response_model=ParticipantStats,
    summary="Get participant stats"
)
async def get_participant_stats(
    participant_id: UUID,
    db: Session = Depends(get_db)
):
    """Get detailed stats for a participant"""
    participant = db.query(Participant).filter(
        Participant.id == participant_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    # Count reactions and questions
    reactions_count = len(participant.reactions) if participant.reactions else 0
    questions_count = len(participant.questions) if participant.questions else 0
    
    return ParticipantStats(
        total_points=participant.points,
        rank=participant.rank or 0,
        attendance_percent=participant.attendance_percent,
        reactions_count=reactions_count,
        questions_count=questions_count,
        polls_voted=participant.poll_votes_count,
        badges=participant.badges or []
    )


@app.post(
    "/api/participants/{participant_id}/reaction",
    tags=["Participants"],
    response_model=ActionResponse,
    summary="Submit a reaction"
)
async def submit_reaction(
    participant_id: UUID,
    reaction_data: ReactionCreate,
    db: Session = Depends(get_db)
):
    """
    Submit an emoji reaction
    
    - Max 10 reactions per event
    - Awards +5 points per reaction
    - Allowed emojis: 🔥 👏 💡 🤔 ❤️ 🚀
    """
    participant = db.query(Participant).filter(
        Participant.id == participant_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    # Check reaction limit (max 10)
    current_reactions = participant.reactions or []
    if len(current_reactions) >= 10:
        raise HTTPException(status_code=400, detail="Maximum 10 reactions allowed")
    
    try:
        # Create reaction
        new_reaction = Reaction(
            participant_id=participant_id,
            emoji=reaction_data.emoji,
            timestamp=datetime.utcnow()
        )
        
        db.add(new_reaction)
        
        # Update participant reactions (JSONB)
        current_reactions.append({
            'emoji': reaction_data.emoji,
            'timestamp': datetime.utcnow().isoformat()
        })
        participant.reactions = current_reactions
        
        # Award points (+5)
        participant.points += 5
        
        # Recalculate rank
        _recalculate_ranks(db, participant.event_id)
        
        db.commit()
        db.refresh(participant)
        
        return ActionResponse(
            success=True,
            message="Reaction submitted successfully",
            points_earned=5,
            total_points=participant.points,
            new_rank=participant.rank
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error submitting reaction: {str(e)}")


@app.post(
    "/api/participants/{participant_id}/question",
    tags=["Participants"],
    response_model=ActionResponse,
    summary="Ask a question"
)
async def submit_question(
    participant_id: UUID,
    question_data: QuestionCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a Q&A question
    
    - Can be anonymous
    - Awards +25 points
    """
    participant = db.query(Participant).filter(
        Participant.id == participant_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    try:
        # Create question
        new_question = Question(
            participant_id=participant_id,
            text=question_data.text,
            is_anonymous=question_data.is_anonymous,
            timestamp=datetime.utcnow()
        )
        
        db.add(new_question)
        
        # Update participant questions (JSONB)
        current_questions = participant.questions or []
        current_questions.append({
            'text': question_data.text,
            'is_anonymous': question_data.is_anonymous,
            'timestamp': datetime.utcnow().isoformat()
        })
        participant.questions = current_questions
        
        # Award points (+25)
        participant.points += 25
        
        # Recalculate rank
        _recalculate_ranks(db, participant.event_id)
        
        db.commit()
        db.refresh(participant)
        
        return ActionResponse(
            success=True,
            message="Question submitted successfully",
            points_earned=25,
            total_points=participant.points,
            new_rank=participant.rank
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error submitting question: {str(e)}")


@app.post(
    "/api/participants/{participant_id}/feedback",
    tags=["Participants"],
    response_model=ActionResponse,
    summary="Submit feedback"
)
async def submit_feedback(
    participant_id: UUID,
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db)
):
    """
    Submit post-meeting feedback
    
    - Rating: 1-5
    - Goal achieved: yes/partially/no
    - Optional text feedback
    - Awards +40 points
    - Event must be in POST phase
    """
    participant = db.query(Participant).filter(
        Participant.id == participant_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    # Verify event is in POST phase
    event = db.query(Event).filter(Event.id == participant.event_id).first()
    if event.phase != 'post':
        raise HTTPException(
            status_code=400,
            detail="Feedback can only be submitted in POST phase"
        )
    
    try:
        # Update feedback
        participant.rating = feedback_data.rating
        participant.goal_achieved = feedback_data.goal_achieved
        participant.feedback = feedback_data.feedback
        
        # Award points (+40)
        participant.points += 40
        
        # Recalculate rank
        _recalculate_ranks(db, participant.event_id)
        
        # Award "Full Journey" badge if completed all phases
        if not any(b.get('id') == 'full_journey' for b in (participant.badges or [])):
            badges = participant.badges or []
            badges.append({
                'id': 'full_journey',
                'name': 'Full Journey',
                'icon': '🎯',
                'earned_at': datetime.utcnow().isoformat()
            })
            participant.badges = badges
        
        db.commit()
        db.refresh(participant)
        
        return ActionResponse(
            success=True,
            message="Feedback submitted successfully",
            points_earned=40,
            total_points=participant.points,
            new_rank=participant.rank
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error submitting feedback: {str(e)}")


@app.get(
    "/api/events/{event_id}/questions",
    tags=["Participants"],
    response_model=List[QuestionResponse],
    summary="Get all questions for an event"
)
async def get_questions(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all Q&A questions for an event (for admin dashboard)"""
    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Get all questions with participant info
    questions = db.query(Question).join(Participant).filter(
        Participant.event_id == event_id
    ).order_by(desc(Question.timestamp)).all()
    
    result = []
    for q in questions:
        result.append(QuestionResponse(
            id=q.id,
            text=q.text,
            is_anonymous=q.is_anonymous,
            timestamp=q.timestamp,
            author_name=None if q.is_anonymous else q.participant.display_name
        ))
    
    return result


# ============================================================================
# Helper Functions
# ============================================================================

def _recalculate_ranks(db: Session, event_id: UUID):
    """Recalculate ranks for all participants in an event"""
    participants = db.query(Participant).filter(
        Participant.event_id == event_id
    ).order_by(desc(Participant.points)).all()
    
    for rank, participant in enumerate(participants, start=1):
        participant.rank = rank
        
        # Award "Top 3" badge
        if rank <= 3:
            if not any(b.get('id') == 'top_3' for b in (participant.badges or [])):
                badges = participant.badges or []
                badges.append({
                    'id': 'top_3',
                    'name': 'Podium Finish',
                    'icon': '🎖️',
                    'earned_at': datetime.utcnow().isoformat()
                })
                participant.badges = badges
        
        # Award "Poll Master" badge if voted in all polls
        if event_id:
            event = db.query(Event).filter(Event.id == event_id).first()
            if event:
                total_polls = db.query(Poll).filter(
                    Poll.event_id == event_id,
                    Poll.status.in_(['active', 'closed'])
                ).count()
                
                if total_polls > 0 and participant.poll_votes_count == total_polls:
                    if not any(b.get('id') == 'poll_master' for b in (participant.badges or [])):
                        badges = participant.badges or []
                        badges.append({
                            'id': 'poll_master',
                            'name': 'Poll Master',
                            'icon': '📊',
                            'earned_at': datetime.utcnow().isoformat()
                        })
                        participant.badges = badges
    
    db.flush()


# ============================================================================
# Graceful Shutdown
# ============================================================================

def handle_shutdown(signum, frame):
    """Handle graceful shutdown on SIGTERM/SIGINT"""
    print(f"\n{'SIGTERM' if signum == signal.SIGTERM else 'SIGINT'} signal received: closing server")
    sys.exit(0)


signal.signal(signal.SIGTERM, handle_shutdown)
signal.signal(signal.SIGINT, handle_shutdown)


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*80)
    print("🎮 NYBBLE VIBE - Event Engagement Platform")
    print("="*80)
    print(f"\n🚀 Server starting on http://localhost:{PORT}")
    print(f"📚 Swagger UI available at http://localhost:{PORT}/api/swagger")
    print(f"📄 OpenAPI JSON available at http://localhost:{PORT}/api/openapi.json")
    print(f"📋 OpenAPI YAML available at http://localhost:{PORT}/api/openapi.yaml")
    print("\n" + "="*80 + "\n")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=True,
        log_level="info"
    )
