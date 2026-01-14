import { TrainingService } from '../services/trainingService.js';

export class SwimmingView {
  constructor(trainingService, auth) {
    this.trainingService = trainingService;
    this.auth = auth;
  }

  renderTask(taskId) {
    return `
      <div class="task-item swimming" id="${taskId}">
        <div class="task-fields">
          <input type="text" placeholder="Dystans (np. 4x200m)*" 
                 onchange="window.validateAndUpdateSwimmingTask('${taskId}', 'distance', this.value)"
                 required>
          <input type="text" placeholder="Tempo (np. 3:00)*" 
                 onchange="window.validateAndUpdateSwimmingTask('${taskId}', 'pace', this.value)"
                 required>
          <input type="text" placeholder="Opis (np. kraul)*" 
                 onchange="window.validateAndUpdateSwimmingTask('${taskId}', 'description', this.value)"
                 required>
          <div class="task-error" id="error-${taskId}"></div>
          <button class="task-remove" 
                  onclick="window.removeTask('swimming', '${taskId}')">Usuń</button>
        </div>
      </div>
    `;
  }

  addTask() {
    const taskId = this.trainingService.addSwimmingTask();
    const tasksList = document.getElementById("swimming-tasks");
    if (tasksList) {
      tasksList.insertAdjacentHTML("beforeend", this.renderTask(taskId));
    }
  }

  showError(elementId, message) {
    const errorDiv = document.getElementById(`error-${elementId}`);
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = message ? 'block' : 'none';
    }
  }

  validateAndUpdateTask(id, field, value) {
    const task = this.trainingService.getTasksByType('swimming').find(t => t.id === id);
    if (!task) return false;
    
    this.trainingService.updateTask('swimming', id, field, value);
    
    const errors = this.trainingService.validateSwimmingTask(task);
    const fieldErrors = errors.filter(error => 
      error.includes(this.getFieldName(field))
    );
    
    this.showError(id, fieldErrors.join(', '));
    return fieldErrors.length === 0;
  }

  getFieldName(field) {
    const fieldNames = {
      'distance': 'Dystans',
      'pace': 'Tempo',
      'description': 'Opis'
    };
    return fieldNames[field] || field;
  }

  async saveTraining() {
    const nameInput = document.getElementById("swimming-name");
    const name = nameInput?.value || "";
    
    if (!name.trim()) {
      this.showFormError('Nazwa treningu jest wymagana');
      nameInput?.focus();
      return;
    }
    
    try {
      const savedId = await this.trainingService.saveTraining(this.auth, 'swimming', name);
      
      this.showSuccessMessage(name);
      this.clearForm();
      
      return savedId;
    } catch (error) {
      this.showFormError(error.message);
      console.error("Save error:", error);
    }
  }

  showSuccessMessage(name) {
    const savedDiv = document.createElement("div");
    savedDiv.className = "saved-trainings";
    savedDiv.innerHTML = `<strong>${name}</strong> zapisany pomyślnie!`;
    
    const section = document.querySelector("#swimming .training-section");
    if (section) {
      section.appendChild(savedDiv);
      setTimeout(() => savedDiv.remove(), 3000);
    }
  }

  showFormError(message) {
    const errorDiv = document.getElementById("swimming-error") || this.createErrorDiv();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  createErrorDiv() {
    const errorDiv = document.createElement("div");
    errorDiv.id = "swimming-error";
    errorDiv.className = "form-error";
    
    const section = document.querySelector("#swimming .training-section");
    if (section) {
      section.appendChild(errorDiv);
    }
    
    return errorDiv;
  }

  clearForm() {
    this.trainingService.clearTasks('swimming');
    const tasksEl = document.getElementById("swimming-tasks");
    const nameEl = document.getElementById("swimming-name");
    if (tasksEl) tasksEl.innerHTML = "";
    if (nameEl) nameEl.value = "";
  }
}