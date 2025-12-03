/**
 * Nybble Vibe - Main App
 * 
 * Core application logic for the sidebar
 */

class NybbleVibeApp {
  constructor() {
    this.state = {
      eventId: null,
      participant: null,
      event: null,
      polls: [],
      phase: null,
      isLoading: true,
      error: null
    };
    
    this.pollingInterval = null;
    this.POLL_INTERVAL_MS = 5000; // 5 seconds
  }
  
  /**
   * Initialize the app
   */
  async init() {
    console.log('🎮 Nybble Vibe: Initializing app');
    
    try {
      // Get eventId from storage
      const eventId = await StorageService.get('eventId');
      
      if (!eventId) {
        this.showSetupScreen();
        return;
      }
      
      this.state.eventId = eventId;
      
      // Check if already joined
      const participantId = await StorageService.get('participantId');
      
      if (participantId) {
        // Already joined, load data
        await this.loadData();
        this.render();
        this.startPolling();
      } else {
        // Show join screen
        this.showJoinScreen();
      }
      
    } catch (error) {
      console.error('Error initializing app:', error);
      this.showError('Error al inicializar la aplicación');
    }
  }
  
  /**
   * Load all data from API
   */
  async loadData() {
    try {
      // Get event
      const event = await APIService.getEvent(this.state.eventId);
      this.state.event = event;
      this.state.phase = event.phase;
      
      // Get participant
      const participantId = await StorageService.get('participantId');
      const participants = await APIService.getParticipants(this.state.eventId);
      this.state.participant = participants.find(p => p.id === participantId);
      
      // Get polls
      const polls = await APIService.getPolls(this.state.eventId);
      this.state.polls = polls;
      
      this.state.isLoading = false;
      this.state.error = null;
      
      console.log('✅ Data loaded:', this.state);
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.state.error = error.message;
      this.state.isLoading = false;
      throw error;
    }
  }
  
  /**
   * Render current phase UI
   */
  render() {
    const content = document.getElementById('content');
    if (!content) return;
    
    // Update header
    this.updateHeader();
    
    // Render phase-specific content
    if (this.state.isLoading) {
      content.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          <div>Cargando evento...</div>
        </div>
      `;
      return;
    }
    
    if (this.state.error) {
      content.innerHTML = `
        <div class="error">
          ⚠️ ${this.state.error}
        </div>
        <button onclick="app.init()">Reintentar</button>
      `;
      return;
    }
    
    let html = '';
    
    switch (this.state.phase) {
      case 'pre':
        html = PreMeetingComponent.render(this.state.event, this.state.participant);
        break;
      case 'live':
        html = LiveMeetingComponent.render(
          this.state.event,
          this.state.participant,
          this.state.polls
        );
        break;
      case 'post':
      case 'closed':
        html = PostMeetingComponent.render(this.state.event, this.state.participant);
        break;
      default:
        html = '<div class="error">Fase desconocida</div>';
    }
    
    content.innerHTML = html;
    
    // Attach phase-specific listeners
    this.attachListeners();
  }
  
  /**
   * Attach event listeners based on current phase
   */
  attachListeners() {
    switch (this.state.phase) {
      case 'pre':
        PreMeetingComponent.attachListeners(this);
        break;
      case 'live':
        LiveMeetingComponent.attachListeners(this);
        break;
      case 'post':
      case 'closed':
        PostMeetingComponent.attachListeners(this);
        break;
    }
  }
  
  /**
   * Update header with current points and rank
   */
  updateHeader() {
    const phaseBadge = document.getElementById('phase-badge');
    const pointsValue = document.getElementById('points-value');
    const rankValue = document.getElementById('rank-value');
    
    if (phaseBadge && this.state.phase) {
      phaseBadge.textContent = this.state.phase.toUpperCase();
      phaseBadge.className = `phase-badge ${this.state.phase}`;
    }
    
    if (pointsValue && this.state.participant) {
      pointsValue.textContent = this.state.participant.points || 0;
    }
    
    if (rankValue && this.state.participant) {
      rankValue.textContent = this.state.participant.rank || '-';
    }
  }
  
  /**
   * Start polling for updates
   */
  startPolling() {
    console.log('🔄 Starting polling (every 5 seconds)');
    
    this.pollingInterval = setInterval(async () => {
      try {
        const previousPhase = this.state.phase;
        
        await this.loadData();
        
        // Check if phase changed
        if (previousPhase !== this.state.phase) {
          console.log(`📍 Phase changed: ${previousPhase} → ${this.state.phase}`);
          this.render();
        } else {
          // Just update header (points/rank may have changed)
          this.updateHeader();
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        // Don't show error popup on polling failures (might be temporary)
      }
    }, this.POLL_INTERVAL_MS);
  }
  
  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('🛑 Polling stopped');
    }
  }
  
  /**
   * Show setup screen (no eventId configured)
   */
  showSetupScreen() {
    const content = document.getElementById('content');
    if (!content) return;
    
    content.innerHTML = `
      <div class="card" style="text-align: center; padding: 32px 16px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🎮</div>
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">
          Bienvenido a Nybble Vibe
        </div>
        <div style="color: #9CA3AF; margin-bottom: 24px;">
          Para comenzar, necesitas configurar el ID del evento
        </div>
        <input 
          type="text" 
          id="event-id-input" 
          placeholder="ID del evento"
          style="margin-bottom: 12px;"
        />
        <button id="set-event-id-btn">
          Configurar Evento
        </button>
        <div style="color: #9CA3AF; font-size: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #2A2A2F;">
          💡 El ID del evento te lo proporciona el organizador
        </div>
      </div>
    `;
    
    // Attach listener
    const setBtn = document.getElementById('set-event-id-btn');
    const input = document.getElementById('event-id-input');
    
    if (setBtn && input) {
      setBtn.addEventListener('click', async () => {
        const eventId = input.value.trim();
        
        if (!eventId) {
          this.showError('Por favor ingresá un ID de evento');
          return;
        }
        
        setBtn.disabled = true;
        setBtn.textContent = 'Verificando...';
        
        try {
          // Verify event exists
          await APIService.getEvent(eventId);
          
          // Save to storage
          await StorageService.set('eventId', eventId);
          this.state.eventId = eventId;
          
          // Show join screen
          this.showJoinScreen();
          
        } catch (error) {
          console.error('Error verifying event:', error);
          this.showError('Evento no encontrado. Verificá el ID.');
          setBtn.disabled = false;
          setBtn.textContent = 'Configurar Evento';
        }
      });
    }
  }
  
  /**
   * Show join screen
   */
  showJoinScreen() {
    const content = document.getElementById('content');
    if (!content) return;
    
    content.innerHTML = `
      <div class="card" style="text-align: center; padding: 32px 16px;">
        <div style="font-size: 64px; margin-bottom: 16px;">👋</div>
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">
          Únete al Evento
        </div>
        <div style="color: #9CA3AF; margin-bottom: 24px;">
          Ingresá tu nombre para comenzar
        </div>
        <input 
          type="text" 
          id="display-name-input" 
          placeholder="Tu nombre"
          maxlength="50"
          style="margin-bottom: 12px;"
        />
        <div style="margin-bottom: 16px;">
          <div style="color: #9CA3AF; font-size: 13px; margin-bottom: 8px;">
            Elegí tu avatar
          </div>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;" id="avatar-selector">
            ${['🦊', '🐼', '🦄', '🤖', '🐱', '🐶', '🦁', '🐯', '🐨', '🐸'].map(emoji => `
              <button 
                class="avatar-btn" 
                data-avatar="${emoji}"
                style="font-size: 32px; padding: 8px; background: #1A1A1F; border: 2px solid #2A2A2F; border-radius: 8px; cursor: pointer;"
              >
                ${emoji}
              </button>
            `).join('')}
          </div>
        </div>
        <button id="join-event-btn" disabled>
          Unirse al Evento (+50 pts)
        </button>
        <div style="color: #9CA3AF; font-size: 12px; margin-top: 12px;">
          Ganarás 50 puntos base por asistir
        </div>
      </div>
    `;
    
    // Avatar selection
    let selectedAvatar = null;
    
    document.querySelectorAll('.avatar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedAvatar = e.target.dataset.avatar;
        
        // Update UI
        document.querySelectorAll('.avatar-btn').forEach(b => {
          if (b.dataset.avatar === selectedAvatar) {
            b.style.borderColor = '#6366F1';
            b.style.background = '#6366F1';
          } else {
            b.style.borderColor = '#2A2A2F';
            b.style.background = '#1A1A1F';
          }
        });
        
        // Enable join button if name is filled
        const nameInput = document.getElementById('display-name-input');
        const joinBtn = document.getElementById('join-event-btn');
        
        if (nameInput?.value.trim() && selectedAvatar && joinBtn) {
          joinBtn.disabled = false;
        }
      });
    });
    
    // Name input
    const nameInput = document.getElementById('display-name-input');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        const joinBtn = document.getElementById('join-event-btn');
        if (joinBtn && e.target.value.trim() && selectedAvatar) {
          joinBtn.disabled = false;
        }
      });
    }
    
    // Join button
    const joinBtn = document.getElementById('join-event-btn');
    if (joinBtn) {
      joinBtn.addEventListener('click', async () => {
        const displayName = nameInput?.value.trim();
        
        if (!displayName || !selectedAvatar) {
          this.showError('Por favor ingresá tu nombre y elegí un avatar');
          return;
        }
        
        joinBtn.disabled = true;
        joinBtn.textContent = 'Uniéndose...';
        
        try {
          const participant = await APIService.joinEvent(
            this.state.eventId,
            displayName,
            selectedAvatar
          );
          
          // Save participant ID
          await StorageService.set('participantId', participant.id);
          
          // Load data and render
          await this.loadData();
          this.render();
          this.startPolling();
          
          // Show welcome points
          this.showPointsPopup(50);
          
        } catch (error) {
          console.error('Error joining event:', error);
          this.showError('Error al unirse al evento');
          joinBtn.disabled = false;
          joinBtn.textContent = 'Unirse al Evento (+50 pts)';
        }
      });
    }
  }
  
  /**
   * Show points earned popup
   */
  showPointsPopup(points) {
    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.textContent = `+${points} pts`;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
      popup.remove();
    }, 2000);
  }
  
  /**
   * Show floating emoji animation
   */
  showFloatingEmoji(emoji, x, y) {
    const floatingEmoji = document.createElement('div');
    floatingEmoji.className = 'floating-emoji';
    floatingEmoji.textContent = emoji;
    floatingEmoji.style.left = `${x}px`;
    floatingEmoji.style.top = `${y}px`;
    
    document.body.appendChild(floatingEmoji);
    
    setTimeout(() => {
      floatingEmoji.remove();
    }, 2000);
  }
  
  /**
   * Show error message
   */
  showError(message) {
    const content = document.getElementById('content');
    if (!content) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error fade-in';
    errorDiv.textContent = message;
    
    content.prepend(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Initialize app
const app = new NybbleVibeApp();

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

console.log('✅ NybbleVibeApp initialized');

