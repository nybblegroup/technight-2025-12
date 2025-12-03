/**
 * PreMeeting Component
 * 
 * UI for PRE phase: agenda preview, set goals, prepare questions
 */

const PreMeetingComponent = {
  render(event, participant) {
    return `
      <div class="pre-meeting fade-in">
        <!-- Welcome Message -->
        <div class="card">
          <div class="card-title">
            👋 ¡Bienvenido ${participant ? participant.display_name : ''}!
          </div>
          <p style="color: #9CA3AF; margin-bottom: 12px;">
            La reunión comienza pronto. Prepárate para una experiencia interactiva.
          </p>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6366F1;">
            <span>⏰</span>
            <span>Comienza: ${new Date(event.start_time).toLocaleTimeString('es-AR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
        </div>
        
        <!-- Agenda -->
        <div class="card">
          <div class="card-title">📋 Agenda</div>
          <div class="agenda-list">
            ${event.agenda_items.map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #2A2A2F;">
                <div>
                  <div style="font-weight: 500;">${item.title}</div>
                  ${item.presenter ? `<div style="font-size: 12px; color: #9CA3AF;">${item.presenter}</div>` : ''}
                </div>
                <div style="color: #6366F1; font-size: 13px; font-weight: 600;">
                  ${item.duration}min
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Set Goal -->
        <div class="card">
          <div class="card-title">🎯 Define tu objetivo</div>
          <p style="color: #9CA3AF; font-size: 13px; margin-bottom: 12px;">
            ¿Qué querés lograr en esta reunión?
          </p>
          <textarea 
            id="goal-input" 
            placeholder="Ej: Entender el roadmap de Q1..."
            maxlength="200"
          ></textarea>
          <button 
            id="save-goal-btn" 
            style="margin-top: 12px;"
          >
            Guardar Objetivo (+20 pts)
          </button>
        </div>
        
        <!-- Prepare Questions -->
        <div class="card">
          <div class="card-title">❓ Prepara tus preguntas</div>
          <p style="color: #9CA3AF; font-size: 13px; margin-bottom: 12px;">
            Anotá las preguntas que querés hacer durante la reunión
          </p>
          <input 
            type="text" 
            id="question-input" 
            placeholder="¿Cuál es el timeline del proyecto?"
            maxlength="200"
          />
          <button 
            id="add-question-btn" 
            style="margin-top: 12px;"
          >
            Agregar Pregunta (+15 pts)
          </button>
          
          <!-- Questions List -->
          <div id="questions-list" style="margin-top: 16px;">
            <!-- Dynamic questions will appear here -->
          </div>
        </div>
        
        <!-- Attendees Counter -->
        <div class="card" style="text-align: center;">
          <div style="font-size: 32px; margin-bottom: 8px;">👥</div>
          <div style="font-size: 24px; font-weight: 700; color: #22D3EE;">
            ${event.participant_count || 0}
          </div>
          <div style="color: #9CA3AF; font-size: 13px;">
            participantes listos
          </div>
        </div>
      </div>
    `;
  },
  
  attachListeners(app) {
    // Save Goal
    const saveGoalBtn = document.getElementById('save-goal-btn');
    const goalInput = document.getElementById('goal-input');
    
    if (saveGoalBtn && goalInput) {
      saveGoalBtn.addEventListener('click', async () => {
        const goal = goalInput.value.trim();
        
        if (!goal) {
          app.showError('Por favor ingresá un objetivo');
          return;
        }
        
        saveGoalBtn.disabled = true;
        saveGoalBtn.textContent = 'Guardando...';
        
        try {
          // Save to local storage (no API endpoint for goals in MVP)
          await StorageService.set('userGoal', goal);
          
          // Show success
          app.showPointsPopup(20);
          goalInput.disabled = true;
          saveGoalBtn.textContent = '✅ Objetivo guardado';
          
          // Update points (simulate, in real system would come from API)
          const currentPoints = parseInt(document.getElementById('points-value').textContent);
          document.getElementById('points-value').textContent = currentPoints + 20;
          
        } catch (error) {
          console.error('Error saving goal:', error);
          app.showError('Error al guardar objetivo');
          saveGoalBtn.disabled = false;
          saveGoalBtn.textContent = 'Guardar Objetivo (+20 pts)';
        }
      });
    }
    
    // Add Question
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionInput = document.getElementById('question-input');
    const questionsList = document.getElementById('questions-list');
    
    if (addQuestionBtn && questionInput) {
      addQuestionBtn.addEventListener('click', async () => {
        const question = questionInput.value.trim();
        
        if (!question) {
          app.showError('Por favor ingresá una pregunta');
          return;
        }
        
        addQuestionBtn.disabled = true;
        addQuestionBtn.textContent = 'Agregando...';
        
        try {
          // Get current questions from storage
          const questions = await StorageService.get('preparedQuestions') || [];
          
          questions.push({
            text: question,
            asked: false,
            timestamp: new Date().toISOString()
          });
          
          await StorageService.set('preparedQuestions', questions);
          
          // Show success
          app.showPointsPopup(15);
          questionInput.value = '';
          
          // Update questions list
          renderQuestionsList(questions, questionsList);
          
          // Update points
          const currentPoints = parseInt(document.getElementById('points-value').textContent);
          document.getElementById('points-value').textContent = currentPoints + 15;
          
        } catch (error) {
          console.error('Error adding question:', error);
          app.showError('Error al agregar pregunta');
        } finally {
          addQuestionBtn.disabled = false;
          addQuestionBtn.textContent = 'Agregar Pregunta (+15 pts)';
        }
      });
    }
    
    // Load existing questions
    StorageService.get('preparedQuestions').then(questions => {
      if (questions && questions.length > 0 && questionsList) {
        renderQuestionsList(questions, questionsList);
      }
    });
  }
};

function renderQuestionsList(questions, container) {
  if (!container) return;
  
  container.innerHTML = questions.map((q, idx) => `
    <div style="background: #0D0D0F; padding: 12px; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
      <div style="flex: 1;">
        <div style="font-size: 13px;">${q.text}</div>
        ${q.asked ? '<div style="color: #10B981; font-size: 12px; margin-top: 4px;">✓ Preguntada</div>' : ''}
      </div>
      ${!q.asked ? `
        <input 
          type="checkbox" 
          data-question-idx="${idx}"
          style="width: auto; margin-left: 8px;"
        />
      ` : ''}
    </div>
  `).join('');
  
  // Add listeners for checkboxes
  container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const idx = parseInt(e.target.dataset.questionIdx);
      const questions = await StorageService.get('preparedQuestions') || [];
      
      if (questions[idx]) {
        questions[idx].asked = e.target.checked;
        await StorageService.set('preparedQuestions', questions);
        renderQuestionsList(questions, container);
      }
    });
  });
}

console.log('✅ PreMeetingComponent loaded');

