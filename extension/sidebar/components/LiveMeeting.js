/**
 * LiveMeeting Component
 * 
 * UI for LIVE phase: polls, reactions, Q&A
 */

const LiveMeetingComponent = {
  state: {
    activePoll: null,
    voted: false,
    reactionsCount: 0
  },
  
  render(event, participant, polls) {
    // Find active poll
    const activePoll = polls.find(p => p.status === 'active');
    this.state.activePoll = activePoll;
    
    // Get reactions count from participant
    const reactionsCount = participant.reactions?.length || 0;
    this.state.reactionsCount = reactionsCount;
    
    return `
      <div class="live-meeting fade-in">
        <!-- Active Poll -->
        ${activePoll ? this.renderPoll(activePoll, participant) : `
          <div class="card">
            <div style="text-align: center; padding: 20px 0; color: #9CA3AF;">
              <div style="font-size: 32px; margin-bottom: 8px;">📊</div>
              <div>Esperando encuesta...</div>
              <div style="font-size: 12px; margin-top: 4px;">
                El host lanzará una encuesta pronto
              </div>
            </div>
          </div>
        `}
        
        <!-- Reactions Bar -->
        <div class="card">
          <div class="card-title">⚡ Reacciones Rápidas</div>
          <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 12px;">
            Expresá tu opinión en tiempo real (${reactionsCount}/10)
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            ${['🔥', '👏', '💡', '🤔', '❤️', '🚀'].map(emoji => `
              <button 
                class="reaction-btn" 
                data-emoji="${emoji}"
                ${reactionsCount >= 10 ? 'disabled' : ''}
                style="font-size: 32px; padding: 16px; background: #1A1A1F; border: 2px solid #2A2A2F;"
              >
                ${emoji}
              </button>
            `).join('')}
          </div>
          ${reactionsCount >= 10 ? `
            <div style="color: #EF4444; font-size: 12px; margin-top: 8px; text-align: center;">
              ⚠️ Límite alcanzado (10 reacciones)
            </div>
          ` : ''}
        </div>
        
        <!-- Q&A -->
        <div class="card">
          <div class="card-title">💬 Hacé una Pregunta</div>
          <textarea 
            id="qa-input" 
            placeholder="Escribí tu pregunta aquí..."
            maxlength="500"
          ></textarea>
          <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
            <input 
              type="checkbox" 
              id="anonymous-checkbox"
              style="width: auto;"
            />
            <label for="anonymous-checkbox" style="font-size: 13px; color: #9CA3AF; cursor: pointer;">
              Pregunta anónima
            </label>
          </div>
          <button 
            id="submit-question-btn" 
            style="margin-top: 12px;"
          >
            Enviar Pregunta (+25 pts)
          </button>
        </div>
        
        <!-- Engagement Stats -->
        <div class="card" style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);">
          <div style="text-align: center;">
            <div style="font-size: 13px; color: rgba(255,255,255,0.8); margin-bottom: 8px;">
              Tu Participación
            </div>
            <div style="display: flex; justify-content: space-around; margin-top: 16px;">
              <div>
                <div style="font-size: 24px; font-weight: 700;">${reactionsCount}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.8);">REACCIONES</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: 700;">${participant.poll_votes_count || 0}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.8);">VOTOS</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: 700;">${participant.questions?.length || 0}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.8);">PREGUNTAS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  renderPoll(poll, participant) {
    // Check if already voted
    const hasVoted = participant.poll_votes_count > 0; // Simplified check
    
    return `
      <div class="card" style="border: 2px solid #6366F1;">
        <div class="card-title">
          📊 Encuesta Activa
        </div>
        <div style="font-size: 15px; font-weight: 600; margin-bottom: 16px; line-height: 1.4;">
          ${poll.question}
        </div>
        
        ${hasVoted ? `
          <!-- Results View -->
          <div class="poll-results">
            ${poll.options.map(opt => {
              const percentage = poll.total_votes > 0 
                ? Math.round((opt.votes / poll.total_votes) * 100) 
                : 0;
              
              return `
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                    <span>${opt.text}</span>
                    <span style="color: #6366F1; font-weight: 600;">${percentage}%</span>
                  </div>
                  <div style="background: #2A2A2F; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: #6366F1; height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
                  </div>
                </div>
              `;
            }).join('')}
            <div style="color: #10B981; font-size: 13px; margin-top: 12px; text-align: center;">
              ✓ Ya votaste (+15 pts)
            </div>
          </div>
        ` : `
          <!-- Voting View -->
          <div class="poll-options">
            ${poll.options.map(opt => `
              <button 
                class="poll-option-btn" 
                data-option-id="${opt.id}"
                data-poll-id="${poll.id}"
                style="background: #1A1A1F; border: 2px solid #2A2A2F; margin-bottom: 8px; text-align: left; padding: 12px; transition: all 0.2s;"
                onmouseover="this.style.borderColor='#6366F1'"
                onmouseout="this.style.borderColor='#2A2A2F'"
              >
                ${opt.text}
              </button>
            `).join('')}
          </div>
          <div style="color: #9CA3AF; font-size: 12px; margin-top: 8px; text-align: center;">
            Votá para ganar +15 puntos
          </div>
        `}
      </div>
    `;
  },
  
  attachListeners(app) {
    // Reaction buttons
    document.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const emoji = e.target.dataset.emoji;
        const participantId = app.state.participant.id;
        
        btn.disabled = true;
        
        try {
          const result = await APIService.submitReaction(participantId, emoji);
          
          // Show floating emoji animation
          app.showFloatingEmoji(emoji, e.clientX, e.clientY);
          
          // Show points popup
          app.showPointsPopup(5);
          
          // Update points and state
          app.state.participant.points = result.total_points;
          app.state.participant.rank = result.new_rank;
          app.updateHeader();
          
          // Increment reactions count
          this.state.reactionsCount++;
          
          // Re-render if limit reached
          if (this.state.reactionsCount >= 10) {
            setTimeout(() => {
              app.render();
            }, 500);
          }
          
        } catch (error) {
          console.error('Error submitting reaction:', error);
          app.showError('Error al enviar reacción');
          btn.disabled = false;
        }
      });
    });
    
    // Poll voting
    document.querySelectorAll('.poll-option-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const pollId = e.target.dataset.pollId;
        const optionId = e.target.dataset.optionId;
        const participantId = app.state.participant.id;
        
        // Disable all buttons
        document.querySelectorAll('.poll-option-btn').forEach(b => b.disabled = true);
        e.target.textContent = 'Votando...';
        
        try {
          await APIService.voteOnPoll(pollId, participantId, optionId);
          
          // Show points popup
          app.showPointsPopup(15);
          
          // Reload to show results
          await app.loadData();
          app.render();
          
        } catch (error) {
          console.error('Error voting on poll:', error);
          app.showError(error.message || 'Error al votar');
          
          // Re-enable buttons
          document.querySelectorAll('.poll-option-btn').forEach(b => b.disabled = false);
        }
      });
    });
    
    // Submit question
    const submitQuestionBtn = document.getElementById('submit-question-btn');
    const qaInput = document.getElementById('qa-input');
    const anonymousCheckbox = document.getElementById('anonymous-checkbox');
    
    if (submitQuestionBtn && qaInput) {
      submitQuestionBtn.addEventListener('click', async () => {
        const question = qaInput.value.trim();
        const isAnonymous = anonymousCheckbox?.checked || false;
        
        if (!question) {
          app.showError('Por favor escribí una pregunta');
          return;
        }
        
        submitQuestionBtn.disabled = true;
        submitQuestionBtn.textContent = 'Enviando...';
        
        try {
          const result = await APIService.submitQuestion(
            app.state.participant.id,
            question,
            isAnonymous
          );
          
          // Show points popup
          app.showPointsPopup(25);
          
          // Update points
          app.state.participant.points = result.total_points;
          app.state.participant.rank = result.new_rank;
          app.updateHeader();
          
          // Clear input
          qaInput.value = '';
          if (anonymousCheckbox) anonymousCheckbox.checked = false;
          
          // Show success
          submitQuestionBtn.textContent = '✓ Pregunta enviada';
          setTimeout(() => {
            submitQuestionBtn.textContent = 'Enviar Pregunta (+25 pts)';
            submitQuestionBtn.disabled = false;
          }, 2000);
          
        } catch (error) {
          console.error('Error submitting question:', error);
          app.showError('Error al enviar pregunta');
          submitQuestionBtn.textContent = 'Enviar Pregunta (+25 pts)';
          submitQuestionBtn.disabled = false;
        }
      });
    }
  }
};

console.log('✅ LiveMeetingComponent loaded');

