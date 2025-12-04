"""
Pydantic schemas for request/response validation

Defines data models for API inputs and outputs.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from uuid import UUID


# ============================================================================
# Event Schemas
# ============================================================================

class AgendaItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    duration: int = Field(..., gt=0, description="Duration in minutes")
    presenter: Optional[str] = Field(None, max_length=255)
    position: int = Field(..., ge=0)


class AgendaItemCreate(AgendaItemBase):
    pass


class AgendaItemResponse(AgendaItemBase):
    id: UUID
    event_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class EventSettings(BaseModel):
    allow_anonymous_questions: bool = True
    show_leaderboard: bool = True
    require_preparation: bool = False
    enable_ai_questions: bool = False


class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    meeting_url: Optional[str] = None
    settings: Optional[EventSettings] = EventSettings()
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class EventCreate(EventBase):
    agenda_items: Optional[List[AgendaItemCreate]] = []


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    meeting_url: Optional[str] = None
    settings: Optional[EventSettings] = None


class EventPhaseUpdate(BaseModel):
    phase: str = Field(..., pattern="^(pre|live|post|closed)$")


class EventResponse(EventBase):
    id: UUID
    phase: str
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    agenda_items: List[AgendaItemResponse] = []
    
    class Config:
        from_attributes = True


class EventSummary(BaseModel):
    """Simplified event response for lists"""
    id: UUID
    title: str
    phase: str
    start_time: datetime
    end_time: datetime
    participant_count: int = 0
    active_polls_count: int = 0
    
    class Config:
        from_attributes = True


# ============================================================================
# Poll Schemas
# ============================================================================

class PollOptionBase(BaseModel):
    text: str = Field(..., min_length=1, max_length=255)
    position: int = Field(..., ge=0)


class PollOptionCreate(PollOptionBase):
    pass


class PollOptionResponse(PollOptionBase):
    id: UUID
    votes: int = 0
    percentage: Optional[float] = None
    
    class Config:
        from_attributes = True


class PollBase(BaseModel):
    question: str = Field(..., min_length=1)
    show_results_to: str = Field(default='voted', pattern="^(all|voted|admin)$")


class PollCreate(PollBase):
    options: List[PollOptionCreate] = Field(..., min_items=2, max_items=10)
    
    @validator('options')
    def validate_options(cls, v):
        if len(v) < 2:
            raise ValueError('Poll must have at least 2 options')
        if len(v) > 10:
            raise ValueError('Poll cannot have more than 10 options')
        return v


class PollStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(draft|active|closed)$")


class PollResponse(PollBase):
    id: UUID
    event_id: UUID
    status: str
    created_at: datetime
    closed_at: Optional[datetime] = None
    options: List[PollOptionResponse] = []
    total_votes: int = 0
    
    class Config:
        from_attributes = True


class PollVoteCreate(BaseModel):
    participant_id: UUID
    option_id: UUID


class PollVoteResponse(BaseModel):
    id: UUID
    poll_id: UUID
    option_id: UUID
    participant_id: UUID
    timestamp: datetime
    points_earned: int = 15
    
    class Config:
        from_attributes = True


# ============================================================================
# Participant Schemas
# ============================================================================

class Badge(BaseModel):
    id: str
    name: str
    icon: str
    earned_at: str
    
    class Config:
        from_attributes = True
        # Allow JSONB dicts to be converted to Badge objects
        json_encoders = {
            dict: lambda v: v if isinstance(v, dict) else {}
        }


class ParticipantBase(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=255)


class ParticipantCreate(ParticipantBase):
    avatar: Optional[str] = '🤖'


class ReactionCreate(BaseModel):
    emoji: str = Field(..., min_length=1, max_length=10)
    
    @validator('emoji')
    def validate_emoji(cls, v):
        allowed_emojis = ['🔥', '👏', '💡', '🤔', '❤️', '🚀']
        if v not in allowed_emojis:
            raise ValueError(f'Emoji must be one of: {", ".join(allowed_emojis)}')
        return v


class QuestionCreate(BaseModel):
    text: str = Field(..., min_length=1)
    is_anonymous: bool = False


class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    goal_achieved: Optional[str] = Field(None, pattern="^(yes|partially|no)$")
    feedback: Optional[str] = None


class ParticipantStats(BaseModel):
    total_points: int
    rank: int
    attendance_percent: int
    reactions_count: int
    questions_count: int
    polls_voted: int
    badges: List[Badge] = []


class ParticipantResponse(ParticipantBase):
    id: UUID
    event_id: UUID
    avatar: str
    join_time: Optional[datetime] = None
    points: int = 0
    rank: Optional[int] = None
    badges: List[Badge] = []
    
    @validator('badges', pre=True)
    def validate_badges(cls, v):
        """Convert JSONB dicts to Badge objects"""
        if v is None:
            return []
        if isinstance(v, list):
            return [Badge(**badge) if isinstance(badge, dict) else badge for badge in v]
        return v
    
    class Config:
        from_attributes = True


class ParticipantDetail(ParticipantResponse):
    """Extended participant info for admin"""
    attendance_percent: int
    poll_votes_count: int
    rating: Optional[int] = None
    goal_achieved: Optional[str] = None
    feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class QuestionResponse(BaseModel):
    id: UUID
    text: str
    is_anonymous: bool
    timestamp: datetime
    author_name: Optional[str] = None  # None if anonymous
    
    class Config:
        from_attributes = True


class ActionResponse(BaseModel):
    """Generic response for participant actions"""
    success: bool = True
    message: str
    points_earned: int
    total_points: int
    new_rank: Optional[int] = None


# ============================================================================
# Health Check
# ============================================================================

class HealthResponse(BaseModel):
    status: str = "ok"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    database: str = "connected"


# ============================================================================
# Error Response
# ============================================================================

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
