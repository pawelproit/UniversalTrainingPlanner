import { loadTrainingsFromDB, deleteTrainingFromDB } from '../services/database.js';
import { auth } from '../auth/auth.js';

export class HistoryView {
  constructor() {
    this.isLoading = false;
    this.currentFilters = {};
    this.allTrainings = [];
  }

  async loadHistory(filters = {}) {
    if (this.isLoading) return;
    
    const user = auth.currentUser;
    if (!user) {
      console.log("User not logged in, cannot load history");
      return;
    }

    this.currentFilters = { ...this.currentFilters, ...filters };
    const historyDiv = document.getElementById("history-list");
    if (!historyDiv) return;
    
    this.isLoading = true;
    this.showLoading();

    try {
      this.allTrainings = await loadTrainingsFromDB(user.uid, ["running", "swimming", "strength"]);
      
      this.allTrainings = this.applyFilters(this.allTrainings, this.currentFilters);
      
      this.renderTrainings(historyDiv, this.allTrainings);
      this.renderFilters();
      
      this.showSimpleStats(this.allTrainings);
      
    } catch (error) {
      console.error("Error loading history:", error);
      this.showError("Błąd ładowania historii: " + error.message);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(trainings, filters) {
    let filtered = [...trainings];
    
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filtered = filtered.filter(t => new Date(t.createdAt) >= dateFrom);
    }
    
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.createdAt) <= dateTo);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(training => 
        training.name.toLowerCase().includes(searchLower) ||
        (training.tasks && training.tasks.some(task => 
          (task.name && task.name.toLowerCase().includes(searchLower)) ||
          (task.description && task.description.toLowerCase().includes(searchLower))
        ))
      );
    }
    
    return filtered;
  }

  showSimpleStats(trainings) {
    const statsDiv = document.getElementById("history-stats");
    if (!statsDiv) return;
    
    const runningCount = trainings.filter(t => t.type === 'running').length;
    const swimmingCount = trainings.filter(t => t.type === 'swimming').length;
    const strengthCount = trainings.filter(t => t.type === 'strength').length;
    
    statsDiv.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${trainings.length}</div>
          <div class="stat-label">Wszystkich treningów</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${runningCount}</div>
          <div class="stat-label">Biegowych</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${swimmingCount}</div>
          <div class="stat-label">Pływackich</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${strengthCount}</div>
          <div class="stat-label">Siłowych</div>
        </div>
      </div>
    `;
  }

  showLoading() {
    const historyDiv = document.getElementById("history-list");
    if (historyDiv) {
      historyDiv.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Ładowanie historii treningów...</p>
        </div>
      `;
    }
  }

  async updateStats(uid) {
    try {
      const stats = await getUserStats(uid);
      const statsDiv = document.getElementById("history-stats");
      if (statsDiv) {
        statsDiv.innerHTML = `
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${stats.totalTrainings}</div>
              <div class="stat-label">Wszystkich treningów</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.byType.running || 0}</div>
              <div class="stat-label">Biegowych</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.byType.swimming || 0}</div>
              <div class="stat-label">Pływackich</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.byType.strength || 0}</div>
              <div class="stat-label">Siłowych</div>
            </div>
            ${stats.volumeStats.strength ? `
            <div class="stat-card">
              <div class="stat-number">${stats.volumeStats.strength}kg</div>
              <div class="stat-label">Łączna objętość</div>
            </div>
            ` : ''}
          </div>
        `;
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  renderFilters() {
    const filterContainer = document.getElementById("history-filters") || this.createFilterContainer();
    
    filterContainer.innerHTML = `
      <div class="filter-section">
        <h3>Filtruj treningi</h3>
        <div class="filter-grid">
          <div class="filter-group">
            <label for="filter-type">Typ treningu:</label>
            <select id="filter-type" class="filter-select">
              <option value="">Wszystkie typy</option>
              <option value="running">Bieganie</option>
              <option value="swimming">Pływanie</option>
              <option value="strength">Siłownia</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="filter-date-from">Data od:</label>
            <input type="date" id="filter-date-from" class="filter-input">
          </div>
          
          <div class="filter-group">
            <label for="filter-date-to">Data do:</label>
            <input type="date" id="filter-date-to" class="filter-input">
          </div>
          
          <div class="filter-group">
            <label for="filter-search">Szukaj:</label>
            <input type="text" id="filter-search" placeholder="Nazwa lub opis..." class="filter-input">
          </div>
          
          <div class="filter-actions">
            <button onclick="window.applyHistoryFilters()" class="filter-btn">Filtruj</button>
            <button onclick="window.clearHistoryFilters()" class="filter-btn secondary">Wyczyść</button>
          </div>
        </div>
      </div>
    `;

    if (this.currentFilters.type) {
      filterContainer.querySelector('#filter-type').value = this.currentFilters.type;
    }
    if (this.currentFilters.dateFrom) {
      filterContainer.querySelector('#filter-date-from').value = this.currentFilters.dateFrom;
    }
    if (this.currentFilters.dateTo) {
      filterContainer.querySelector('#filter-date-to').value = this.currentFilters.dateTo;
    }
    if (this.currentFilters.search) {
      filterContainer.querySelector('#filter-search').value = this.currentFilters.search;
    }
  }

  createFilterContainer() {
    const container = document.createElement('div');
    container.id = 'history-filters';
    const historyDiv = document.getElementById("history-list");
    if (historyDiv) {
      historyDiv.parentNode.insertBefore(container, historyDiv);
    }
    return container;
  }

  renderTrainings(container, trainings) {
    container.innerHTML = '';

    if (trainings.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">📝</div>
          <h3>Brak treningów</h3>
          <p>Nie znaleziono treningów spełniających kryteria wyszukiwania.</p>
        </div>
      `;
      return;
    }

    const groupedByDate = this.groupTrainingsByDate(trainings);

    Object.entries(groupedByDate).forEach(([date, dateTrainings]) => {
      const dateSection = this.createDateSection(date, dateTrainings);
      container.appendChild(dateSection);
    });
  }

  groupTrainingsByDate(trainings) {
    return trainings.reduce((groups, training) => {
      const date = new Date(training.createdAt).toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(training);
      return groups;
    }, {});
  }

  createDateSection(date, dateTrainings) {
    const section = document.createElement('div');
    section.className = 'history-date-section';
    
    section.innerHTML = `
      <div class="date-header">
        <h3 class="history-date">${date}</h3>
        <span class="date-count">${dateTrainings.length} treningów</span>
      </div>
      <div class="date-trainings">
        ${dateTrainings.map(training => this.getHistoryItemHTML(training)).join('')}
      </div>
    `;
    
    setTimeout(() => {
      dateTrainings.forEach((training, index) => {
        const deleteBtn = section.querySelector(`.delete-training-btn[data-index="${index}"]`);
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => this.deleteTraining(training));
        }
      });
    }, 0);
    
    return section;
  }

  createHistoryItem(training) {
    const item = document.createElement('div');
    item.className = `history-item history-type-${training.type}`;
    item.innerHTML = this.getHistoryItemHTML(training);
    
    const deleteBtn = item.querySelector('.delete-training-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteTraining(training));
    }
    
    return item;
  }

  getHistoryItemHTML(training) {
    const time = new Date(training.createdAt).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const icon = this.getTypeIcon(training.type);
    const tasksSummary = this.getTasksSummary(training.tasks);
    
    return `
      <div class="history-item">
        <div class="history-item-header">
          <div class="history-type-icon">${icon}</div>
          <div class="history-item-info">
            <h4 class="history-item-title">${training.name}</h4>
            <div class="history-item-meta">
              <span class="history-item-type">${this.getTypeName(training.type)}</span>
              <span class="history-item-time">${time}</span>
              ${tasksSummary ? `<span class="tasks-summary">${tasksSummary}</span>` : ''}
            </div>
          </div>
          <div class="history-item-actions">
            <span class="history-item-count">${training.tasks?.length || 0} zadań</span>
            <button class="history-action-btn delete-training-btn" title="Usuń trening">
              🗑️
            </button>
          </div>
        </div>
        <div class="history-item-details">
          ${this.renderTasksHTML(training.tasks)}
        </div>
      </div>
    `;
  }

  renderTasksHTML(tasks) {
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

  renderTasks(tasks) {
    if (!tasks || tasks.length === 0) {
      const p = document.createElement('p');
      p.className = 'no-tasks';
      p.textContent = 'Brak szczegółów';
      return p;
    }

    const ul = document.createElement('ul');
    ul.className = 'history-tasks-list';
    
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = 'history-task';
      li.innerHTML = `
        <span class="task-number">${index + 1}.</span>
        <span class="task-content">${this.formatTask(task)}</span>
      `;
      ul.appendChild(li);
    });
    
    return ul;
  }

  formatTask(task) {
    if (!task) return 'Brak danych';
    
    if (task.name && task.distance && task.pace) {
      return `${task.name}: ${task.distance} w ${task.pace}/km`;
    } else if (task.distance && task.pace && task.description) {
      return `${task.description}: ${task.distance} w ${task.pace}/100m`;
    } else if (task.name && task.sets && task.reps && task.weight) {
      return `${task.name}: ${task.sets} × ${task.reps} × ${task.weight}kg`;
    }

    const parts = [];
    if (task.name) parts.push(`Nazwa: ${task.name}`);
    if (task.distance) parts.push(`Dystans: ${task.distance}`);
    if (task.pace) parts.push(`Tempo: ${task.pace}`);
    if (task.description) parts.push(`Opis: ${task.description}`);
    if (task.sets) parts.push(`Serie: ${task.sets}`);
    if (task.reps) parts.push(`Powtórzenia: ${task.reps}`);
    if (task.weight) parts.push(`Obciążenie: ${task.weight}kg`);
    
    return parts.length > 0 ? parts.join(', ') : 'Brak szczegółów';
  }

  getTasksSummary(tasks) {
    if (!tasks || tasks.length === 0) return '';
    
    if (tasks[0].distance && tasks[0].pace) {
      return `${tasks.length}×${tasks[0].distance}`;
    } else if (tasks[0].sets && tasks[0].reps) {
      const totalSets = tasks.reduce((sum, task) => sum + (parseInt(task.sets) || 0), 0);
      return `${totalSets} serii`;
    }
    
    return '';
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

  async deleteTraining(training) {
    if (!confirm('Czy na pewno chcesz usunąć ten trening?')) return;
    
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      await deleteTrainingFromDB(user.uid, training.type, training.id);
      
      this.allTrainings = this.allTrainings.filter(t => t.id !== training.id);
      const historyDiv = document.getElementById("history-list");
      if (historyDiv) {
        this.renderTrainings(historyDiv, this.allTrainings);
      }
      
      this.showSimpleStats(this.allTrainings);
      
      this.showNotification('Trening został usunięty');
    } catch (error) {
      console.error("Error deleting training:", error);
      this.showError('Błąd podczas usuwania treningu');
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 5px;
      z-index: 1000;
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'notification error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 5px;
      z-index: 1000;
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
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