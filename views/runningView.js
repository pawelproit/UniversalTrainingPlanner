import { TrainingService } from '../services/trainingService.js';

export class RunningView {
  constructor(trainingService, auth) {
    this.trainingService = trainingService;
    this.auth = auth;
  }

  renderTask(taskId) {
    return `
      <div class="task-item running" id="${taskId}">
        <div class="task-fields">
          <input type="text" placeholder="Nazwa zadania (np. Interwały)*" 
                 onchange="window.validateAndUpdateRunningTask('${taskId}', 'name', this.value)"
                 required>
          <input type="text" placeholder="Dystans (np. 4x200m)*" 
                 onchange="window.validateAndUpdateRunningTask('${taskId}', 'distance', this.value)"
                 required>
          <input type="text" placeholder="Tempo (np. 3:00)*" 
                 onchange="window.validateAndUpdateRunningTask('${taskId}', 'pace', this.value)"
                 required>
          <div class="task-error" id="error-${taskId}"></div>
          <button class="task-remove" 
                  onclick="window.removeTask('running', '${taskId}')">Usuń</button>
        </div>
      </div>
    `;
  }

  addTask() {
    const taskId = this.trainingService.addRunningTask();
    const tasksList = document.getElementById("running-tasks");
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
    const task = this.trainingService.getTasksByType('running').find(t => t.id === id);
    if (!task) return false;

    this.trainingService.updateTask('running', id, field, value);

    const errors = this.trainingService.validateRunningTask(task);
    const fieldErrors = errors.filter(error => 
      error.includes(this.getFieldName(field))
    );
    
    this.showError(id, fieldErrors.join(', '));
    return fieldErrors.length === 0;
  }

  getFieldName(field) {
    const fieldNames = {
      'name': 'Nazwa zadania',
      'distance': 'Dystans',
      'pace': 'Tempo'
    };
    return fieldNames[field] || field;
  }

  async saveTraining() {
    const nameInput = document.getElementById("running-name");
    const name = nameInput?.value || "";

    if (!name.trim()) {
      this.showFormError('Nazwa treningu jest wymagana');
      nameInput?.focus();
      return;
    }
    
    try {
      const savedId = await this.trainingService.saveTraining(this.auth, 'running', name);
      
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
    
    const section = document.querySelector("#running .training-section");
    if (section) {
      section.appendChild(savedDiv);
      setTimeout(() => savedDiv.remove(), 3000);
    }
  }

  showFormError(message) {
    const errorDiv = document.getElementById("running-error") || this.createErrorDiv();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  createErrorDiv() {
    const errorDiv = document.createElement("div");
    errorDiv.id = "running-error";
    errorDiv.className = "form-error";
    
    const section = document.querySelector("#running .training-section");
    if (section) {
      section.appendChild(errorDiv);
    }
    
    return errorDiv;
  }

  clearForm() {
    this.trainingService.clearTasks('running');
    const tasksEl = document.getElementById("running-tasks");
    const nameEl = document.getElementById("running-name");
    if (tasksEl) tasksEl.innerHTML = "";
    if (nameEl) nameEl.value = "";
  }
}