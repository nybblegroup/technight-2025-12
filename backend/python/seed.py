"""
Seed database with test data for Nybble Vibe MVP

Usage:
    # Opción 1: Usar el script wrapper (recomendado)
    ./seed.sh                    # Seed data with default phase (live)
    ./seed.sh --reset            # Drop all data and reseed
    ./seed.sh --phase pre        # Create event in specific phase
    
    # Opción 2: Activar el entorno virtual manualmente
    source venv/bin/activate
    python seed.py               # Seed data with default phase (live)
    python seed.py --reset       # Drop all data and reseed
    python seed.py --phase pre   # Create event in specific phase
"""

import sys
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import uuid

from database import SessionLocal, engine, Base
from models import (
    Event, AgendaItem, Poll, PollOption, PollVote,
    Participant, Reaction, Question
)

# Emoji avatars for participants
EMOJIS = ['🦊', '🐼', '🦄', '🤖', '🐱', '🐶', '🦁', '🐯', '🐨', '🐸']

# Argentine names
NAMES = [
    'María García', 'Juan Pérez', 'Ana Rodríguez', 'Carlos Martínez', 'Laura Fernández',
    'Pedro Sánchez', 'Sofía López', 'Diego Torres', 'Valentina Castro', 'Lucas Benítez'
]

# Reaction emojis
REACTION_EMOJIS = ['🔥', '👏', '💡', '🤔', '❤️', '🚀']

# Sample questions
SAMPLE_QUESTIONS = [
    "¿Cómo vamos a manejar la escalabilidad del sistema?",
    "¿Cuál es el roadmap para el próximo trimestre?",
    "¿Tenemos presupuesto aprobado para estas features?",
    "¿Qué stack tecnológico vamos a usar?",
    "¿Cómo vamos a hacer el onboarding del equipo?",
    "¿Cuándo planean empezar con la implementación?",
    "¿Hay algún riesgo que debamos considerar?",
    "¿Qué métricas vamos a trackear?",
]


def reset_database():
    """Drop all tables and recreate them"""
    print("🔄 Resetting database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database reset complete")


def seed_event(db: Session, phase='live'):
    """Create a test event"""
    print(f"📅 Creating event (phase: {phase})...")
    
    # Calculate times based on phase
    now = datetime.utcnow()
    
    if phase == 'pre':
        start_time = now + timedelta(hours=1)
        end_time = start_time + timedelta(hours=1)
    elif phase == 'live':
        start_time = now - timedelta(minutes=15)
        end_time = now + timedelta(minutes=45)
    elif phase == 'post':
        start_time = now - timedelta(hours=1, minutes=30)
        end_time = now - timedelta(minutes=30)
    else:  # closed
        start_time = now - timedelta(days=1)
        end_time = start_time + timedelta(hours=1)
    
    event = Event(
        id=uuid.uuid4(),
        title="Tech Talk Q4 2024 - Nybble Vibe Demo",
        description="Quarterly technology review and roadmap discussion. This is a demo event with sample data for testing the Nybble Vibe platform.",
        start_time=start_time,
        end_time=end_time,
        phase=phase,
        meeting_url="https://meet.google.com/nybble-vibe-demo",
        settings={
            "allow_anonymous_questions": True,
            "show_leaderboard": True,
            "require_preparation": False,
            "enable_ai_questions": False
        },
        created_by=uuid.uuid4()
    )
    
    db.add(event)
    db.flush()
    
    # Create agenda items
    agenda_items = [
        AgendaItem(
            event_id=event.id,
            title="Q4 Results Overview",
            duration=15,
            presenter="María García",
            position=0
        ),
        AgendaItem(
            event_id=event.id,
            title="AI/ML Initiatives Update",
            duration=20,
            presenter="Juan Pérez",
            position=1
        ),
        AgendaItem(
            event_id=event.id,
            title="Q1 2025 Roadmap Preview",
            duration=15,
            presenter="Ana Rodríguez",
            position=2
        ),
        AgendaItem(
            event_id=event.id,
            title="Q&A Session",
            duration=10,
            position=3
        ),
    ]
    
    for item in agenda_items:
        db.add(item)
    
    db.commit()
    event_id_str = str(event.id)
    print(f"✅ Event created: {event.title}")
    print(f"   ID: {event_id_str}")
    print(f"   Phase: {event.phase}")
    
    return event


def seed_polls(db: Session, event_id: uuid.UUID):
    """Create test polls"""
    print("📊 Creating polls...")
    
    # Poll 1: Active poll
    poll1 = Poll(
        id=uuid.uuid4(),
        event_id=event_id,
        question="¿Cuál debería ser nuestra prioridad para Q1 2025?",
        status='active',
        show_results_to='voted'
    )
    db.add(poll1)
    db.flush()
    
    options1 = [
        PollOption(
            poll_id=poll1.id,
            text="Optimización de Performance",
            position=0,
            votes=0  # Will be incremented by votes
        ),
        PollOption(
            poll_id=poll1.id,
            text="Mejoras de Seguridad",
            position=1,
            votes=0
        ),
        PollOption(
            poll_id=poll1.id,
            text="Nuevas Features",
            position=2,
            votes=0
        ),
    ]
    
    for opt in options1:
        db.add(opt)
    
    # Poll 2: Draft poll
    poll2 = Poll(
        id=uuid.uuid4(),
        event_id=event_id,
        question="¿Qué stack de IA preferís para nuestro caso de uso?",
        status='draft',
        show_results_to='all'
    )
    db.add(poll2)
    db.flush()
    
    options2 = [
        PollOption(poll_id=poll2.id, text="OpenAI GPT-4", position=0, votes=0),
        PollOption(poll_id=poll2.id, text="Anthropic Claude", position=1, votes=0),
        PollOption(poll_id=poll2.id, text="Google Gemini", position=2, votes=0),
        PollOption(poll_id=poll2.id, text="Open Source (Llama, etc)", position=3, votes=0),
    ]
    
    for opt in options2:
        db.add(opt)
    
    # Poll 3: Draft poll
    poll3 = Poll(
        id=uuid.uuid4(),
        event_id=event_id,
        question="¿Cuándo deberíamos lanzar la versión beta?",
        status='draft',
        show_results_to='voted'
    )
    db.add(poll3)
    db.flush()
    
    options3 = [
        PollOption(poll_id=poll3.id, text="Enero 2025", position=0, votes=0),
        PollOption(poll_id=poll3.id, text="Febrero 2025", position=1, votes=0),
        PollOption(poll_id=poll3.id, text="Marzo 2025", position=2, votes=0),
    ]
    
    for opt in options3:
        db.add(opt)
    
    db.commit()
    print(f"✅ Created 3 polls (1 active, 2 draft)")
    
    return [poll1, poll2, poll3]


def seed_participants(db: Session, event_id: uuid.UUID, polls: list, count=10):
    """Create test participants with random engagement data"""
    print(f"👥 Creating {count} participants...")
    
    participants = []
    
    for i in range(count):
        # Random points between 50 and 300
        base_points = 50  # attendance
        poll_points = 15 if random.random() > 0.3 else 0  # 70% voted
        reaction_points = random.randint(0, 10) * 5  # 0-10 reactions
        question_points = 25 if random.random() > 0.6 else 0  # 40% asked question
        
        total_points = base_points + poll_points + reaction_points + question_points
        
        participant = Participant(
            id=uuid.uuid4(),
            event_id=event_id,
            display_name=NAMES[i],
            avatar=EMOJIS[i],
            join_time=datetime.utcnow() - timedelta(minutes=random.randint(5, 20)),
            points=total_points,
            attendance_percent=random.randint(85, 100),
            reactions=[],
            questions=[],
            poll_votes_count=1 if poll_points > 0 else 0,
            badges=[]
        )
        
        db.add(participant)
        db.flush()
        
        # Add reactions
        reaction_count = reaction_points // 5
        for _ in range(reaction_count):
            emoji = random.choice(REACTION_EMOJIS)
            reaction = Reaction(
                participant_id=participant.id,
                emoji=emoji,
                timestamp=datetime.utcnow() - timedelta(minutes=random.randint(1, 15))
            )
            db.add(reaction)
            
            # Also add to JSONB
            participant.reactions.append({
                'emoji': emoji,
                'timestamp': reaction.timestamp.isoformat()
            })
        
        # Maybe ask a question
        if question_points > 0:
            is_anonymous = random.choice([True, False])
            question_text = random.choice(SAMPLE_QUESTIONS)
            
            question = Question(
                participant_id=participant.id,
                text=question_text,
                is_anonymous=is_anonymous,
                timestamp=datetime.utcnow() - timedelta(minutes=random.randint(1, 10))
            )
            db.add(question)
            
            # Also add to JSONB
            participant.questions.append({
                'text': question_text,
                'is_anonymous': is_anonymous,
                'timestamp': question.timestamp.isoformat()
            })
        
        # Vote on active poll (poll1) if they got poll points
        if poll_points > 0 and polls:
            poll = polls[0]  # Active poll
            # Get options for this poll
            options = db.query(PollOption).filter(PollOption.poll_id == poll.id).all()
            if options:
                chosen_option = random.choice(options)
                
                vote = PollVote(
                    poll_id=poll.id,
                    option_id=chosen_option.id,
                    participant_id=participant.id,
                    timestamp=datetime.utcnow() - timedelta(minutes=random.randint(1, 12))
                )
                db.add(vote)
                
                # Increment option votes
                chosen_option.votes += 1
        
        participants.append(participant)
    
    db.commit()
    
    # Recalculate ranks
    participants_sorted = sorted(participants, key=lambda p: p.points, reverse=True)
    for rank, participant in enumerate(participants_sorted, start=1):
        participant.rank = rank
        
        # Award badges
        badges = []
        
        # Top 3 badge
        if rank <= 3:
            badges.append({
                'id': 'top_3',
                'name': 'Podium Finish',
                'icon': '🎖️',
                'earned_at': datetime.utcnow().isoformat()
            })
        
        # Poll Master badge (voted in all active/closed polls)
        active_polls_count = db.query(Poll).filter(
            Poll.event_id == event_id,
            Poll.status.in_(['active', 'closed'])
        ).count()
        
        if participant.poll_votes_count == active_polls_count and active_polls_count > 0:
            badges.append({
                'id': 'poll_master',
                'name': 'Poll Master',
                'icon': '📊',
                'earned_at': datetime.utcnow().isoformat()
            })
        
        participant.badges = badges
    
    db.commit()
    
    print(f"✅ Created {count} participants with engagement data")
    print(f"   Reactions: {sum(len(p.reactions or []) for p in participants)}")
    print(f"   Questions: {sum(len(p.questions or []) for p in participants)}")
    print(f"   Poll votes: {sum(p.poll_votes_count for p in participants)}")
    
    return participants


def main():
    """Main seed function"""
    # Parse arguments
    reset = '--reset' in sys.argv
    phase = 'live'  # default
    
    if '--phase' in sys.argv:
        idx = sys.argv.index('--phase')
        if idx + 1 < len(sys.argv):
            phase = sys.argv[idx + 1]
            if phase not in ['pre', 'live', 'post', 'closed']:
                print(f"❌ Invalid phase: {phase}")
                print("   Valid phases: pre, live, post, closed")
                sys.exit(1)
    
    # Reset database if requested
    if reset:
        reset_database()
    
    # Create session
    db = SessionLocal()
    
    try:
        print("\n" + "="*80)
        print("🌱 NYBBLE VIBE - Database Seeder")
        print("="*80 + "\n")
        
        # Create event
        event = seed_event(db, phase=phase)
        
        # Create polls
        polls = seed_polls(db, event.id)
        
        # Create participants
        participants = seed_participants(db, event.id, polls, count=10)
        
        event_id_str = str(event.id)
        
        print("\n" + "="*80)
        print("🎉 Seed Complete!")
        print("="*80)
        print(f"\n📋 Summary:")
        print(f"   Event ID: {event_id_str}")
        print(f"   Event Title: {event.title}")
        print(f"   Phase: {event.phase}")
        print(f"   Polls: {len(polls)} (1 active, 2 draft)")
        print(f"   Participants: {len(participants)}")
        print(f"\n🔗 Quick Links:")
        print(f"   Backend: http://localhost:8080/api/health")
        print(f"   Swagger: http://localhost:8080/api/swagger")
        print(f"   Event API: http://localhost:8080/api/events/{event_id_str}")
        print(f"\n🌐 Frontend Control Panel:")
        print(f"   http://localhost:5173/events/{event_id_str}/control")
        print(f"\n📝 For Chrome Extension:")
        print(f"   Set eventId in localStorage: '{event_id_str}'")
        print(f"\n💡 To reseed with different phase:")
        print(f"   ./seed.sh --reset --phase pre")
        print(f"   ./seed.sh --reset --phase post")
        print("\n" + "="*80 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == '__main__':
    main()

