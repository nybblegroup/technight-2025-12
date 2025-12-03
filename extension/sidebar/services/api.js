/**
 * API Service
 * 
 * Handles all API calls to the backend with retry logic
 */

const API_BASE_URL = 'http://localhost:8080/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const APIService = {
  /**
   * Generic fetch with retry logic
   */
  async fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        console.log(`⚠️  API call failed, retrying... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  },
  
  /**
   * Get event by ID
   */
  async getEvent(eventId) {
    return this.fetchWithRetry(`${API_BASE_URL}/events/${eventId}`);
  },
  
  /**
   * Join event
   */
  async joinEvent(eventId, displayName, avatar = '🤖') {
    return this.fetchWithRetry(`${API_BASE_URL}/events/${eventId}/join`, {
      method: 'POST',
      body: JSON.stringify({ display_name: displayName, avatar })
    });
  },
  
  /**
   * Get polls for event
   */
  async getPolls(eventId) {
    return this.fetchWithRetry(`${API_BASE_URL}/events/${eventId}/polls`);
  },
  
  /**
   * Vote on poll
   */
  async voteOnPoll(pollId, participantId, optionId) {
    return this.fetchWithRetry(`${API_BASE_URL}/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({
        participant_id: participantId,
        option_id: optionId
      })
    });
  },
  
  /**
   * Submit reaction
   */
  async submitReaction(participantId, emoji) {
    return this.fetchWithRetry(`${API_BASE_URL}/participants/${participantId}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ emoji })
    });
  },
  
  /**
   * Submit question
   */
  async submitQuestion(participantId, text, isAnonymous = false) {
    return this.fetchWithRetry(`${API_BASE_URL}/participants/${participantId}/question`, {
      method: 'POST',
      body: JSON.stringify({
        text,
        is_anonymous: isAnonymous
      })
    });
  },
  
  /**
   * Submit feedback
   */
  async submitFeedback(participantId, rating, goalAchieved, feedback = '') {
    return this.fetchWithRetry(`${API_BASE_URL}/participants/${participantId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({
        rating,
        goal_achieved: goalAchieved,
        feedback
      })
    });
  },
  
  /**
   * Get participant stats
   */
  async getParticipantStats(participantId) {
    return this.fetchWithRetry(`${API_BASE_URL}/participants/${participantId}/stats`);
  },
  
  /**
   * Get participants for event (leaderboard)
   */
  async getParticipants(eventId) {
    return this.fetchWithRetry(`${API_BASE_URL}/events/${eventId}/participants`);
  }
};

console.log('✅ APIService loaded');

