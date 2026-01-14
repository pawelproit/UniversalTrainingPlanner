import { loadTrainingsFromDB } from '../services/database.js';
import { auth } from '../auth/auth.js';

export class HistoryView {
  constructor() {
    this.isLoading = false;
  }

  async loadHistory() {
    if (this.isLoading) return;
    
    const user = auth.currentUser;
    if (!user) {
      console.log("User not logged in, cannot load history");
      return;
    }

    const historyDiv = document.getElementById("history-list");
    if (!historyDiv) return;
    
    this.isLoading = true;
    historyDiv.innerHTML = '<div class="loading">Ładowanie historii...</div>';

    try {
      const allTrainings = await loadTrainingsFromDB(user.uid, ["running", "swimming", "strength"]);

      if (allTrainings.length === 0) {
        historyDiv.innerHTML = '<div class="no-history">Brak zapisanych treningów. Zacznij dodawać swoje pierwsze treningi!</div>';
        return;
      }

      this.renderTrainings(historyDiv, allTrainings);
    } catch (error) {
      console.error("Error loading history:", error);
      historyDiv.innerHTML = `<div class="error">Błąd podczas ładowania historii: ${error.message}</div>`;
    } finally {
      this.isLoading = false;
    }
  }

  renderTrainings(container, trainings) {
    container.innerHTML = '';

    const groupedByDate = trainings.reduce((groups, training) => {
      const date = new Date(training.createdAt).toLocaleDateString('pl-PL');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(training);
      return groups;
    }, {});

    Object.entries(groupedByDate).forEach(([date, dateTrainings]) => {
      const dateSection = document.createElement('div');
      dateSection.className = 'history-date-section';
      dateSection.innerHTML = `<h3 class="history-date">${date}</h3>`;
      
      dateTrainings.forEach(training => {
        const item = this.createHistoryItem(training);
        dateSection.appendChild(item);
      });
      
      container.appendChild(dateSection);
    });
  }

  createHistoryItem(training) {
    const item = document.createElement('div');
    item.className = `history-item history-type-${training.type}`;

    const time = new Date(training.createdAt).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const icon = this.getTypeIcon(training.type);
    
    item.innerHTML = `
      <div class="history-item-header">
        <div class="history-type-icon">${icon}</div>
        <div class="history-item-info">
          <h4 class="history-item-title">${training.name}</h4>
          <div class="history-item-meta">
            <span class="history-item-type">${this.getTypeName(training.type)}</span>
            <span class="history-item-time">${time}</span>
          </div>
        </div>
        <div class="history-item-actions">
          <span class="history-item-count">${training.tasks.length} zadań</span>
        </div>
      </div>
      <div class="history-item-details">
        ${this.renderTasks(training.tasks)}
      </div>
    `;
    
    return item;
  }

  renderTasks(tasks) {
    if (!tasks || tasks.length === 0) return '<p class="no-tasks">Brak szczegółów</p>';
    
    return `
      <ul class="history-tasks-list">
        ${tasks.map((task, index) => `
          <li class="history-task">
            <span class="task-number">${index + 1}.</span>
            <span class="task-content">${this.formatTask(task)}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  formatTask(task) {
    if (task.name && task.distance && task.pace) {
      return `${task.name}: ${task.distance} w ${task.pace}/km`;
    } else if (task.distance && task.pace && task.description) {
      return `${task.description}: ${task.distance} w ${task.pace}/100m`;
    } else if (task.name && task.sets && task.reps && task.weight) {
      return `${task.name}: ${task.sets} × ${task.reps} × ${task.weight}kg`;
    }

    return JSON.stringify(task);
  }

  getTypeIcon(type) {
    const icons = {
      'running': '🏃',
      'swimming': '🏊',
      'strength': '🏋️'
    };
    return icons[type] || '📝';
  }

  getTypeName(type) {
    const names = {
      'running': 'Bieganie',
      'swimming': 'Pływanie',
      'strength': 'Siłownia'
    };
    return names[type] || type;
  }

  clearHistory() {
    const historyDiv = document.getElementById("history-list");
    if (historyDiv) {
      historyDiv.innerHTML = '';
    }
  }

  showEmptyState() {
    const historyDiv = document.getElementById("history-list");
    if (historyDiv) {
      historyDiv.innerHTML = '<div class="no-history">Brak treningów. Zacznij dodawać swoje pierwsze treningi!</div>';
    }
  }
}