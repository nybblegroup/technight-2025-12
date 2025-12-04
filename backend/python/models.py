"""
SQLAlchemy models for Nybble Vibe

All database models for events, polls, participants, and engagement tracking.
"""

from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, 
    DateTime, ForeignKey, CheckConstraint, UniqueConstraint, TIMESTAMP
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from database import Base


class Event(Base):
    """Event model - represents a meeting/event"""
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    phase = Column(
        String(20), 
        default='pre',
        nullable=False
    )
    meeting_url = Column(Text)
    calendar_event_id = Column(String(255))
    transcript_url = Column(Text)
    transcript_text = Column(Text)
    settings = Column(JSONB, default=lambda: {})
    created_by = Column(UUID(as_uuid=True), nullable=False, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    agenda_items = relationship("AgendaItem", back_populates="event", cascade="all, delete-orphan")
    polls = relationship("Poll", back_populates="event", cascade="all, delete-orphan")
    participants = relationship("Participant", back_populates="event", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("phase IN ('pre', 'live', 'post', 'closed')", name="check_phase"),
        CheckConstraint("end_time > start_time", name="check_time_order"),
    )
    
    def __repr__(self):
        return f"<Event {self.title} ({self.phase})>"


class AgendaItem(Base):
    """Agenda item within an event"""
    __tablename__ = "agenda_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(255), nullable=False)
    duration = Column(Integer, nullable=False)  # in minutes
    presenter = Column(String(255))
    position = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    event = relationship("Event", back_populates="agenda_items")
    
    def __repr__(self):
        return f"<AgendaItem {self.title} ({self.duration}min)>"


class Poll(Base):
    """Poll/survey within an event"""
    __tablename__ = "polls"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    question = Column(Text, nullable=False)
    status = Column(String(20), default='draft', nullable=False)
    show_results_to = Column(String(20), default='voted', nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    closed_at = Column(DateTime)
    
    # Relationships
    event = relationship("Event", back_populates="polls")
    options = relationship("PollOption", back_populates="poll", cascade="all, delete-orphan")
    votes = relationship("PollVote", back_populates="poll", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('draft', 'active', 'closed')", name="check_poll_status"),
        CheckConstraint("show_results_to IN ('all', 'voted', 'admin')", name="check_show_results"),
    )
    
    def __repr__(self):
        return f"<Poll {self.question[:50]} ({self.status})>"


class PollOption(Base):
    """Option within a poll"""
    __tablename__ = "poll_options"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    poll_id = Column(UUID(as_uuid=True), ForeignKey('polls.id', ondelete='CASCADE'), nullable=False)
    text = Column(String(255), nullable=False)
    position = Column(Integer, nullable=False)
    votes = Column(Integer, default=0, nullable=False)
    
    # Relationships
    poll = relationship("Poll", back_populates="options")
    
    def __repr__(self):
        return f"<PollOption {self.text} ({self.votes} votes)>"


class PollVote(Base):
    """Individual vote on a poll"""
    __tablename__ = "poll_votes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    poll_id = Column(UUID(as_uuid=True), ForeignKey('polls.id', ondelete='CASCADE'), nullable=False)
    option_id = Column(UUID(as_uuid=True), ForeignKey('poll_options.id', ondelete='CASCADE'), nullable=False)
    participant_id = Column(UUID(as_uuid=True), ForeignKey('participants.id', ondelete='CASCADE'), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    poll = relationship("Poll", back_populates="votes")
    participant = relationship("Participant")
    option = relationship("PollOption")
    
    # Constraints - one vote per participant per poll
    __table_args__ = (
        UniqueConstraint('poll_id', 'participant_id', name='unique_vote_per_participant'),
    )
    
    def __repr__(self):
        return f"<PollVote poll={self.poll_id} participant={self.participant_id}>"


class Participant(Base):
    """Participant in an event"""
    __tablename__ = "participants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(UUID(as_uuid=True))  # Future: link to users table
    display_name = Column(String(255), nullable=False)
    avatar = Column(String(50), default='🤖')
    is_external = Column(Boolean, default=False)
    
    # Attendance tracking
    join_time = Column(DateTime)
    leave_time = Column(DateTime)
    attendance_percent = Column(Integer, default=0)
    
    # Engagement data (stored as JSONB for flexibility)
    reactions = Column(JSONB, default=lambda: [])
    questions = Column(JSONB, default=lambda: [])
    poll_votes_count = Column(Integer, default=0)
    
    # Feedback
    rating = Column(Integer)
    goal_achieved = Column(String(20))
    feedback = Column(Text)
    
    # Gamification
    points = Column(Integer, default=0, nullable=False)
    badges = Column(JSONB, default=lambda: [])
    rank = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    event = relationship("Event", back_populates="participants")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("rating IS NULL OR (rating >= 1 AND rating <= 5)", name="check_rating"),
        CheckConstraint(
            "goal_achieved IS NULL OR goal_achieved IN ('yes', 'partially', 'no')", 
            name="check_goal_achieved"
        ),
    )
    
    def __repr__(self):
        return f"<Participant {self.display_name} ({self.points} pts, rank #{self.rank})>"


class Reaction(Base):
    """Emoji reaction from a participant"""
    __tablename__ = "reactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id = Column(UUID(as_uuid=True), ForeignKey('participants.id', ondelete='CASCADE'), nullable=False)
    emoji = Column(String(10), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Reaction {self.emoji} at {self.timestamp}>"


class Question(Base):
    """Q&A question from a participant"""
    __tablename__ = "questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id = Column(UUID(as_uuid=True), ForeignKey('participants.id', ondelete='CASCADE'), nullable=False)
    text = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    participant = relationship("Participant")
    
    def __repr__(self):
        return f"<Question {'(anonymous)' if self.is_anonymous else ''} at {self.timestamp}>"
