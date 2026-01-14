import { auth, onAuthStateChanged } from './auth/auth.js';
import { setupAuthUI } from './auth/authUI.js';
import { TrainingService } from './services/trainingService.js';
import { updateNavigation, setupNavigation } from './views/navigation.js';
import { showView } from './views/viewManager.js';
import { RunningView } from './views/runningView.js';
import { SwimmingView } from './views/swimmingView.js';
import { StrengthView } from './views/strengthView.js';
import { HistoryView } from './views/historyView.js';
import { ProfileView } from './views/profileView.js';
import { getTrainingsByFilter } from './services/database.js';

const trainingService = new TrainingService();
const runningView = new RunningView(trainingService, auth);
const swimmingView = new SwimmingView(trainingService, auth);
const strengthView = new StrengthView(trainingService, auth);
const historyView = new HistoryView();
const profileView = new ProfileView();

window.validateAndUpdateRunningTask = (id, field, value) => 
  runningView.validateAndUpdateTask(id, field, value);
window.validateAndUpdateSwimmingTask = (id, field, value) => 
  swimmingView.validateAndUpdateTask(id, field, value);
window.validateAndUpdateStrengthTask = (id, field, value) => 
  strengthView.validateAndUpdateTask(id, field, value);

window.addRunningTask = () => runningView.addTask();
window.addSwimmingTask = () => swimmingView.addTask();
window.addStrengthExercise = () => strengthView.addTask();

window.saveTraining = async (type) => {
  let savedId;
  switch(type) {
    case 'running': 
      savedId = await runningView.saveTraining();
      break;
    case 'swimming': 
      savedId = await swimmingView.saveTraining();
      break;
    case 'strength': 
      savedId = await strengthView.saveTraining();
      break;
  }
  
  if (window.location.hash === '#history') {
    await historyView.loadHistory();
  }
  
  return savedId;
};

window.removeTask = (type, id) => trainingService.removeTask(type, id);

window.applyHistoryFilters = () => {
  const type = document.getElementById('filter-type')?.value || '';
  const dateFrom = document.getElementById('filter-date-from')?.value || '';
  const dateTo = document.getElementById('filter-date-to')?.value || '';
  const search = document.getElementById('filter-search')?.value || '';
  
  const filters = {};
  if (type) filters.type = type;
  if (dateFrom) filters.dateFrom = dateFrom;
  if (dateTo) filters.dateTo = dateTo;
  if (search) filters.search = search;
  
  historyView.loadHistory(filters);
};

window.clearHistoryFilters = () => {
  historyView.currentFilters = {};
  historyView.loadHistory();
  const filterContainer = document.getElementById('history-filters');
  if (filterContainer) {
    filterContainer.querySelector('#filter-type').value = '';
    filterContainer.querySelector('#filter-date-from').value = '';
    filterContainer.querySelector('#filter-date-to').value = '';
    filterContainer.querySelector('#filter-search').value = '';
  }
};

window.saveProfile = () => profileView.saveProfile();
window.changeAvatar = () => {
  alert('Funkcja zmiany awatara w budowie!');
};

window.exportHistory = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;
    
    const trainings = await getTrainingsByFilter(user.uid, {});
    
    const csvData = formatTrainingsToCSV(trainings);
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `treningi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    historyView.showNotification('Historia wyeksportowana pomyślnie');
  } catch (error) {
    console.error('Error exporting history:', error);
    historyView.showError('Błąd podczas eksportowania historii');
  }
};

function formatTrainingsToCSV(trainings) {
  const headers = ['Data', 'Typ', 'Nazwa', 'Liczba zadań', 'Szczegóły'];
  const rows = trainings.map(training => {
    const date = new Date(training.createdAt).toLocaleDateString('pl-PL');
    const details = training.tasks?.map(task => {
      if (training.type === 'running') {
        return `${task.name || ''}: ${task.distance || ''} w ${task.pace || ''}/km`;
      } else if (training.type === 'swimming') {
        return `${task.description || ''}: ${task.distance || ''} w ${task.pace || ''}/100m`;
      } else if (training.type === 'strength') {
        return `${task.name || ''}: ${task.sets || ''} × ${task.reps || ''} × ${task.weight || ''}kg`;
      }
      return '';
    }).join('; ') || '';
    
    return [
      date,
      training.type,
      training.name,
      training.tasks?.length || 0,
      `"${details}"`
    ];
  });
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

window.handleViewChange = function(viewId) {
  showView(viewId);

  switch(viewId) {
    case 'history':
      historyView.loadHistory();
      break;
    case 'profile':
      profileView.loadProfile();
      break;
    case 'running':
      runningView.clearForm();
      break;
    case 'swimming':
      swimmingView.clearForm();
      break;
    case 'strength':
      strengthView.clearForm();
      break;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("Aplikacja się ładuje...");
  
  setupAuthUI();
  setupNavigation();

  const refreshHistoryBtn = document.getElementById('refresh-history-btn');
  if (refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener('click', () => historyView.loadHistory());
  }

  const exportBtn = document.getElementById('export-history-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', window.exportHistory);
  }

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");
      if (href) {
        const viewId = href.substring(1);
        window.location.hash = viewId;
        window.handleViewChange(viewId);
      }
    });
  });

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.substring(1) || "";
    const user = auth.currentUser;
    
    console.log("Hash zmieniony na:", hash, "Użytkownik:", user?.email);
    
    if (!user && hash !== "login-view" && hash !== "") {
      window.location.hash = "login-view";
      window.handleViewChange("login-view");
      return;
    }
    
    if (user && (hash === "login-view" || hash === "")) {
      window.location.hash = "home";
      window.handleViewChange("home");
      return;
    }
    
    const viewToShow = hash || (user ? "home" : "login-view");
    window.handleViewChange(viewToShow);
  });
  
  onAuthStateChanged(auth, (user) => {
    console.log("Stan autentykacji zmieniony:", user?.email);
    
    updateNavigation(user);
    
    if (user) {
      console.log("Użytkownik zalogowany:", user.email);
      historyView.loadHistory();
      
      const currentHash = window.location.hash.substring(1);
      if (currentHash === "login-view" || currentHash === "") {
        window.location.hash = "home";
        window.handleViewChange("home");
      } else {
        window.handleViewChange(currentHash);
      }
    } else {
      console.log("Użytkownik wylogowany");
      historyView.clearHistory();
      
      const currentHash = window.location.hash.substring(1);
      const protectedViews = ['home', 'running', 'swimming', 'strength', 'history', 'profile'];
      
      if (protectedViews.includes(currentHash)) {
        window.location.hash = "login-view";
        window.handleViewChange("login-view");
      } else if (currentHash === "") {
        window.location.hash = "login-view";
        window.handleViewChange("login-view");
      }
    }
  });

  const initialHash = window.location.hash.substring(1) || "";
  const user = auth.currentUser;
  const viewToShow = initialHash || (user ? "home" : "login-view");
  console.log("Początkowy widok:", viewToShow);
  window.handleViewChange(viewToShow);
});
console.log("Main.js loaded");
console.log("Auth state initial:", auth.currentUser);

window.testGlobalFunctions = () => {
  console.log("Global functions test:");
  console.log("addRunningTask:", typeof window.addRunningTask);
  console.log("saveTraining:", typeof window.saveTraining);
  console.log("handleViewChange:", typeof window.handleViewChange);
};