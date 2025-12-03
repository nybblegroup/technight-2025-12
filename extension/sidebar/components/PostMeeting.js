/**
 * PostMeeting Component
 * 
 * UI for POST phase: feedback form, stats, badges
 */

const PostMeetingComponent = {
  render(event, participant) {
    const hasSubmittedFeedback = participant.rating !== null && participant.rating !== undefined;
    
    return `
      <div class="post-meeting fade-in">
        <!-- Completion Message -->
        <div class="card" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
          <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">
            ¡Reunión Completada!
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px;">
            Gracias por tu participación activa
          </div>
        </div>
        
        <!-- Stats Summary -->
        <div class="card">
          <div class="card-title">📊 Tus Estadísticas</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 12px;">
            <div style="text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #22D3EE;">
                ${participant.points}
              </div>
              <div style="color: #9CA3AF; font-size: 12px;">PUNTOS TOTALES</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #6366F1;">
                #${participant.rank || '-'}
              </div>
              <div style="color: #9CA3AF; font-size: 12px;">RANKING FINAL</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: 700; color: #10B981;">
                ${participant.attendance_percent}%
              </div>
              <div style="color: #9CA3AF; font-size: 12px;">ASISTENCIA</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: 700; color: #F59E0B;">
                ${participant.poll_votes_count || 0}/${event.polls?.length || 0}
              </div>
              <div style="color: #9CA3AF; font-size: 12px;">ENCUESTAS</div>
            </div>
          </div>
          
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #2A2A2F;">
            <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 8px;">Actividad</div>
            <div style="display: flex; gap: 16px; font-size: 13px;">
              <div>🔥 ${participant.reactions?.length || 0} reacciones</div>
              <div>💬 ${participant.questions?.length || 0} preguntas</div>
            </div>
          </div>
        </div>
        
        <!-- Badges -->
        ${participant.badges && participant.badges.length > 0 ? `
          <div class="card">
            <div class="card-title">🎖️ Logros Desbloqueados</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px;">
              ${participant.badges.map(badge => `
                <div style="background: #1A1A1F; padding: 12px; border-radius: 8px; text-align: center; border: 2px solid #6366F1;">
                  <div style="font-size: 32px; margin-bottom: 4px;">${badge.icon}</div>
                  <div style="font-size: 13px; font-weight: 600;">${badge.name}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Feedback Form -->
        ${!hasSubmittedFeedback ? `
          <div class="card">
            <div class="card-title">⭐ Calificá esta reunión</div>
            
            <!-- Rating -->
            <div style="margin-bottom: 20px;">
              <div style="color: #9CA3AF; font-size: 13px; margin-bottom: 12px;">
                ¿Qué te pareció la reunión?
              </div>
              <div style="display: flex; justify-content: center; gap: 8px;" id="rating-selector">
                ${[1, 2, 3, 4, 5].map(rating => `
                  <button 
                    class="rating-btn" 
                    data-rating="${rating}"
                    style="font-size: 32px; background: transparent; border: none; padding: 4px; cursor: pointer; transition: transform 0.2s; filter: grayscale(100%);"
                  >
                    ${rating <= 2 ? '😞' : rating === 3 ? '😐' : rating === 4 ? '🙂' : '🤩'}
                  </button>
                `).join('')}
              </div>
              <div style="text-align: center; margin-top: 8px; font-size: 12px; color: #6366F1; font-weight: 600;" id="rating-label">
                Seleccioná una calificación
              </div>
            </div>
            
            <!-- Goal Achievement -->
            <div style="margin-bottom: 20px;">
              <div style="color: #9CA3AF; font-size: 13px; margin-bottom: 12px;">
                🎯 ¿Lograste tu objetivo?
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;" id="goal-achievement-selector">
                ${[
                  { value: 'yes', label: '✓ Sí', color: '#10B981' },
                  { value: 'partially', label: '~ Parcial', color: '#F59E0B' },
                  { value: 'no', label: '✗ No', color: '#EF4444' }
                ].map(opt => `
                  <button 
                    class="goal-btn" 
                    data-goal="${opt.value}"
                    style="background: #1A1A1F; border: 2px solid #2A2A2F; padding: 12px; border-radius: 6px; font-size: 13px; font-weight: 600; transition: all 0.2s;"
                  >
                    ${opt.label}
                  </button>
                `).join('')}
              </div>
            </div>
            
            <!-- Feedback Text -->
            <div style="margin-bottom: 16px;">
              <div style="color: #9CA3AF; font-size: 13px; margin-bottom: 12px;">
                💭 Comentarios adicionales (opcional)
              </div>
              <textarea 
                id="feedback-text" 
                placeholder="¿Qué podríamos mejorar? ¿Qué te gustó?"
                maxlength="500"
              ></textarea>
            </div>
            
            <!-- Submit Button -->
            <button 
              id="submit-feedback-btn"
              disabled
            >
              Enviar Feedback (+40 pts)
            </button>
            <div style="color: #9CA3AF; font-size: 11px; text-align: center; margin-top: 8px;">
              Calificación y objetivo son requeridos
            </div>
          </div>
        ` : `
          <div class="card" style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
            <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">
              ¡Gracias por tu Feedback!
            </div>
            <div style="color: rgba(255,255,255,0.9); font-size: 14px;">
              Tu opinión nos ayuda a mejorar
            </div>
          </div>
        `}
      </div>
    `;
  },
  
  attachListeners(app) {
    // Rating selector
    const ratingBtns = document.querySelectorAll('.rating-btn');
    const ratingLabel = document.getElementById('rating-label');
    let selectedRating = null;
    
    ratingBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedRating = parseInt(e.target.dataset.rating);
        
        // Update UI
        ratingBtns.forEach(b => {
          const rating = parseInt(b.dataset.rating);
          if (rating <= selectedRating) {
            b.style.filter = 'grayscale(0%)';
            b.style.transform = 'scale(1.1)';
          } else {
            b.style.filter = 'grayscale(100%)';
            b.style.transform = 'scale(1)';
          }
        });
        
        // Update label
        const labels = ['Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'];
        ratingLabel.textContent = labels[selectedRating - 1];
        ratingLabel.style.color = selectedRating >= 4 ? '#10B981' : selectedRating === 3 ? '#F59E0B' : '#EF4444';
        
        checkFormComplete();
      });
    });
    
    // Goal achievement selector
    const goalBtns = document.querySelectorAll('.goal-btn');
    let selectedGoal = null;
    
    goalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedGoal = e.target.dataset.goal;
        
        // Update UI
        goalBtns.forEach(b => {
          if (b.dataset.goal === selectedGoal) {
            b.style.borderColor = '#6366F1';
            b.style.background = '#6366F1';
          } else {
            b.style.borderColor = '#2A2A2F';
            b.style.background = '#1A1A1F';
          }
        });
        
        checkFormComplete();
      });
    });
    
    // Check if form is complete
    function checkFormComplete() {
      const submitBtn = document.getElementById('submit-feedback-btn');
      if (submitBtn && selectedRating && selectedGoal) {
        submitBtn.disabled = false;
      }
    }
    
    // Submit feedback
    const submitBtn = document.getElementById('submit-feedback-btn');
    const feedbackText = document.getElementById('feedback-text');
    
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        if (!selectedRating || !selectedGoal) {
          app.showError('Por favor completá la calificación y el objetivo');
          return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        try {
          const result = await APIService.submitFeedback(
            app.state.participant.id,
            selectedRating,
            selectedGoal,
            feedbackText?.value || ''
          );
          
          // Show points popup
          app.showPointsPopup(40);
          
          // Update points
          app.state.participant.points = result.total_points;
          app.state.participant.rank = result.new_rank;
          app.state.participant.rating = selectedRating;
          app.state.participant.goal_achieved = selectedGoal;
          app.updateHeader();
          
          // Re-render to show thank you message
          setTimeout(() => {
            app.render();
          }, 1000);
          
        } catch (error) {
          console.error('Error submitting feedback:', error);
          app.showError('Error al enviar feedback');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar Feedback (+40 pts)';
        }
      });
    }
  }
};

console.log('✅ PostMeetingComponent loaded');

