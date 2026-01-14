import { auth, onAuthStateChanged } from './auth/auth.js';
import { setupAuthUI } from './auth/authUI.js';
import { TrainingService } from './services/trainingService.js';
import { updateNavigation, setupNavigation } from './views/navigation.js';
import { showView, handleHashChange } from './views/viewManager.js';
import { RunningView } from './views/runningView.js';
import { SwimmingView } from './views/swimmingView.js';
import { StrengthView } from './views/strengthView.js';
import { HistoryView } from './views/historyView.js';

const trainingService = new TrainingService();
const runningView = new RunningView(trainingService, auth);
const swimmingView = new SwimmingView(trainingService, auth);
const strengthView = new StrengthView(trainingService, auth);
const historyView = new HistoryView();

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
window.updateRunningTask = (id, field, value) => 
  trainingService.updateTask('running', id, field, value);
window.updateSwimmingTask = (id, field, value) => 
  trainingService.updateTask('swimming', id, field, value);
window.updateStrengthTask = (id, field, value) => 
  trainingService.updateTask('strength', id, field, value);

function handleViewChange(viewId) {
  showView(viewId);

  if (viewId === 'history') {
    historyView.loadHistory();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupAuthUI();
  setupNavigation();

  const refreshHistoryBtn = document.getElementById('refresh-history-btn');
  if (refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener('click', () => historyView.loadHistory());
  }

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");
      if (href) {
        const viewId = href.substring(1);
        window.location.hash = viewId;
        handleViewChange(viewId);
      }
    });
  });

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.substring(1) || "";
    const user = auth.currentUser;
    
    if (!user && hash !== "login-view" && hash !== "") {
      window.location.hash = "login-view";
      handleViewChange("login-view");
      return;
    }
    
    if (user && (hash === "login-view" || hash === "")) {
      window.location.hash = "home";
      handleViewChange("home");
      return;
    }
    
    const viewToShow = hash || (user ? "home" : "login-view");
    handleViewChange(viewToShow);
  });
});

onAuthStateChanged(auth, (user) => {
  updateNavigation(user);
  
  if (user) {
    console.log("User logged in:", user.email);
    historyView.loadHistory();
    
    if (window.location.hash === "#login-view" || window.location.hash === "") {
      window.location.hash = "home";
      handleViewChange("home");
    } else {
      handleViewChange(window.location.hash.substring(1));
    }
  } else {
    console.log("User logged out");
    historyView.clearHistory();
    window.location.hash = "login-view";
    handleViewChange("login-view");
  }
});

const initialHash = window.location.hash.substring(1) || "";
const user = auth.currentUser;
const viewToShow = initialHash || (user ? "home" : "login-view");
handleViewChange(viewToShow);