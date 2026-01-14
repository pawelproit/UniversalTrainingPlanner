import { TrainingService } from '../services/trainingService.js';

export class StrengthView {
  constructor(trainingService, auth) {
    this.trainingService = trainingService;
    this.auth = auth;
  }

  renderTask(taskId) {
    return `
      <div class="task-item strength" id="${taskId}">
        <div class="task-fields">
          <input type="text" placeholder="Ćwiczenie (np. Wyciskanie)*" 
                 onchange="window.validateAndUpdateStrengthTask('${taskId}', 'name', this.value)"
                 required>
          <input type="number" placeholder="Serie*" min="1" 
                 onchange="window.validateAndUpdateStrengthTask('${taskId}', 'sets', this.value)"
                 required>
          <input type="number" placeholder="Powtórzenia*" min="1" 
                 onchange="window.validateAndUpdateStrengthTask('${taskId}', 'reps', this.value)"
                 required>
          <input type="number" placeholder="Obciążenie (kg)*" min="0" step="0.5"
                 onchange="window.validateAndUpdateStrengthTask('${taskId}', 'weight', this.value)"
                 required>
          <div class="task-error" id="error-${taskId}"></div>
          <button class="task-remove" 
                  onclick="window.removeTask('strength', '${taskId}')">Usuń</button>
        </div>
      </div>
    `;
  }

  addTask() {
    const taskId = this.trainingService.addStrengthExercise();
    const tasksList = document.getElementById("strength-tasks");
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
    const task = this.trainingService.getTasksByType('strength').find(t => t.id === id);
    if (!task) return false;
    
    this.trainingService.updateTask('strength', id, field, value);

    let error = '';
    const numValue = parseFloat(value);
    
    switch(field) {
      case 'name':
        if (!value.trim()) error = 'Nazwa ćwiczenia jest wymagana';
        break;
      case 'sets':
        if (isNaN(numValue) || numValue <= 0) error = 'Serie muszą być większe od 0';
        break;
      case 'reps':
        if (isNaN(numValue) || numValue <= 0) error = 'Powtórzenia muszą być większe od 0';
        break;
      case 'weight':
        if (isNaN(numValue) || numValue < 0) error = 'Obciążenie musi być liczbą nieujemną';
        break;
    }
    
    this.showError(id, error);
    return !error;
  }

  async saveTraining() {
    const nameInput = document.getElementById("strength-name");
    const name = nameInput?.value || "";
    
    if (!name.trim()) {
      this.showFormError('Nazwa treningu jest wymagana');
      nameInput?.focus();
      return;
    }
    
    try {
      const savedId = await this.trainingService.saveTraining(this.auth, 'strength', name);
      
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
    
    const section = document.querySelector("#strength .training-section");
    if (section) {
      section.appendChild(savedDiv);
      setTimeout(() => savedDiv.remove(), 3000);
    }
  }

  showFormError(message) {
    const errorDiv = document.getElementById("strength-error") || this.createErrorDiv();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  createErrorDiv() {
    const errorDiv = document.createElement("div");
    errorDiv.id = "strength-error";
    errorDiv.className = "form-error";
    
    const section = document.querySelector("#strength .training-section");
    if (section) {
      section.appendChild(errorDiv);
    }
    
    return errorDiv;
  }

  clearForm() {
    this.trainingService.clearTasks('strength');
    const tasksEl = document.getElementById("strength-tasks");
    const nameEl = document.getElementById("strength-name");
    if (tasksEl) tasksEl.innerHTML = "";
    if (nameEl) nameEl.value = "";
  }
}