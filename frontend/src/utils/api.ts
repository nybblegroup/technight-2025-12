// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Type definitions for API responses
export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface Example {
  id: number;
  name: string;
  title: string;
  entryDate: string;
  description: string | null;
  isActive: boolean;
}

export interface CreateExampleDto {
  name: string;
  title: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateExampleDto {
  name?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Nybble Vibe types
export interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  phase: 'pre' | 'live' | 'post' | 'closed';
  meeting_url?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
  agenda_items: AgendaItem[];
}

export interface AgendaItem {
  id: string;
  title: string;
  duration: number;
  presenter?: string;
  position: number;
}

export interface Poll {
  id: string;
  event_id: string;
  question: string;
  status: 'draft' | 'active' | 'closed';
  show_results_to: string;
  created_at: string;
  closed_at?: string;
  options: PollOption[];
  total_votes: number;
}

export interface PollOption {
  id: string;
  text: string;
  position: number;
  votes: number;
  percentage?: number;
}

export interface Participant {
  id: string;
  event_id: string;
  display_name: string;
  avatar: string;
  join_time?: string;
  points: number;
  rank?: number;
  badges: Badge[];
  attendance_percent: number;
  poll_votes_count: number;
  rating?: number;
  goal_achieved?: string;
  feedback?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earned_at: string;
}

export interface Question {
  id: string;
  text: string;
  is_anonymous: boolean;
  timestamp: string;
  author_name?: string;
}

// Generic fetch helper with error handling
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
}

// API Methods
export const api = {
  // Health check endpoint
  health: {
    get: () => apiFetch<HealthResponse>('/api/health'),
  },

  // Examples endpoints
  examples: {
    getAll: () => apiFetch<Example[]>('/api/examples'),
    getById: (id: number) => apiFetch<Example>(`/api/examples/${id}`),
    search: (name: string) => apiFetch<Example[]>(`/api/examples/search?name=${encodeURIComponent(name)}`),
    create: (data: CreateExampleDto) => apiFetch<Example>('/api/examples', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: UpdateExampleDto) => apiFetch<Example>(`/api/examples/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => apiFetch<void>(`/api/examples/${id}`, {
      method: 'DELETE',
    }),
  },

  // Nybble Vibe - Events
  events: {
    getById: (id: string) => apiFetch<Event>(`/api/events/${id}`),
    updatePhase: (id: string, phase: string) => apiFetch<Event>(`/api/events/${id}/phase`, {
      method: 'PATCH',
      body: JSON.stringify({ phase }),
    }),
  },

  // Nybble Vibe - Polls
  polls: {
    getByEventId: (eventId: string) => apiFetch<Poll[]>(`/api/events/${eventId}/polls`),
    updateStatus: (pollId: string, status: string) => apiFetch<Poll>(`/api/polls/${pollId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
    getResults: (pollId: string) => apiFetch<Poll>(`/api/polls/${pollId}/results`),
  },

  // Nybble Vibe - Participants
  participants: {
    getByEventId: (eventId: string) => apiFetch<Participant[]>(`/api/events/${eventId}/participants`),
  },

  // Nybble Vibe - Questions
  questions: {
    getByEventId: (eventId: string) => apiFetch<Question[]>(`/api/events/${eventId}/questions`),
  },
};
