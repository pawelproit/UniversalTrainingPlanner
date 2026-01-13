import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiEcksBi4G9OR7H3GA8VYwm7G73YlspaI",
  authDomain: "universaltrainingplanner-241fc.firebaseapp.com",
  databaseURL:
    "https://universaltrainingplanner-241fc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "universaltrainingplanner-241fc",
  storageBucket: "universaltrainingplanner-241fc.firebasestorage.app",
  messagingSenderId: "1087012477704",
  appId: "1:1087012477704:web:c30b98af4a5691e3726abd",
  measurementId: "G-NYJPYV8ZFG",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let runningTasks = [];
let swimmingTasks = [];
let strengthTasks = [];

function showView(viewId) {
  const views = document.querySelectorAll(".view");
  views.forEach((view) => view.classList.remove("active"));

  const selectedView = document.getElementById(viewId);
  if (selectedView) {
    selectedView.classList.add("active");
  }
}

function handleHashChange() {
  const hash = window.location.hash.substring(1) || "login-view";
  showView(hash);
}

function addRunningTask() {
  const tasksList = document.getElementById("running-tasks");
  const taskId = "running-" + Date.now();

  const taskHtml = `
        <div class="task-item running" id="${taskId}">
            <div class="task-fields">
                <input type="text" placeholder="Nazwa zadania (np. Interwały)" onchange="updateRunningTask('${taskId}', 'name', this.value)">
                <input type="text" placeholder="Dystans (np. 4x200m)" onchange="updateRunningTask('${taskId}', 'distance', this.value)">
                <input type="text" placeholder="Tempo (np. 3:00)" onchange="updateRunningTask('${taskId}', 'pace', this.value)">
                <button class="task-remove" onclick="removeTask('running', '${taskId}')">Usuń</button>
            </div>
        </div>
    `;
  tasksList.insertAdjacentHTML("beforeend", taskHtml);
  runningTasks.push({ id: taskId, name: "", distance: "", pace: "" });
}

function addSwimmingTask() {
  const tasksList = document.getElementById("swimming-tasks");
  const taskId = "swimming-" + Date.now();

  const taskHtml = `
        <div class="task-item swimming" id="${taskId}">
            <div class="task-fields">
                <input type="text" placeholder="Dystans (np. 4x200m)" onchange="updateSwimmingTask('${taskId}', 'distance', this.value)">
                <input type="text" placeholder="Tempo (np. 3:00)" onchange="updateSwimmingTask('${taskId}', 'pace', this.value)">
                <input type="text" placeholder="Opis (np. kraul)" onchange="updateSwimmingTask('${taskId}', 'description', this.value)">
                <button class="task-remove" onclick="removeTask('swimming', '${taskId}')">Usuń</button>
            </div>
        </div>
    `;
  tasksList.insertAdjacentHTML("beforeend", taskHtml);
  swimmingTasks.push({ id: taskId, distance: "", pace: "", description: "" });
}

function addStrengthExercise() {
  const tasksList = document.getElementById("strength-tasks");
  const taskId = "strength-" + Date.now();

  const taskHtml = `
        <div class="task-item strength" id="${taskId}">
            <div class="task-fields">
                <input type="text" placeholder="Ćwiczenie (np. Wyciskanie)" onchange="updateStrengthTask('${taskId}', 'name', this.value)">
                <input type="number" placeholder="Serie" onchange="updateStrengthTask('${taskId}', 'sets', this.value)">
                <input type="number" placeholder="Powtórzenia" onchange="updateStrengthTask('${taskId}', 'reps', this.value)">
                <input type="number" placeholder="Obciążenie (kg)" onchange="updateStrengthTask('${taskId}', 'weight', this.value)">
                <button class="task-remove" onclick="removeTask('strength', '${taskId}')">Usuń</button>
            </div>
        </div>
    `;
  tasksList.insertAdjacentHTML("beforeend", taskHtml);
  strengthTasks.push({ id: taskId, name: "", sets: "", reps: "", weight: "" });
}

function updateSwimmingTask(id, field, value) {
  const task = swimmingTasks.find((t) => t.id === id);
  if (task) task[field] = value;
}

function updateRunningTask(id, field, value) {
  const task = runningTasks.find((t) => t.id === id);
  if (task) task[field] = value;
}

function updateStrengthTask(id, field, value) {
  const task = strengthTasks.find((t) => t.id === id);
  if (task) task[field] = value;
}

function removeTask(type, id) {
  document.getElementById(id).remove();
  if (type === "running")
    runningTasks = runningTasks.filter((t) => t.id !== id);
  if (type === "swimming")
    swimmingTasks = swimmingTasks.filter((t) => t.id !== id);
  if (type === "strength")
    strengthTasks = strengthTasks.filter((t) => t.id !== id);
}

function saveTraining(type) {
  let name, tasks;
  if (type === "running") {
    name = document.getElementById("running-name").value;
    tasks = runningTasks;
  } else if (type === "swimming") {
    name = document.getElementById("swimming-name").value;
    tasks = swimmingTasks;
  } else {
    name = document.getElementById("strength-name").value;
    tasks = strengthTasks;
  }

  if (!name || tasks.length === 0) {
    alert("Podaj nazwę treningu i dodaj przynajmniej jedno zadanie!");
    return;
  }

  const savedDiv = document.createElement("div");
  savedDiv.className = "saved-trainings";
  savedDiv.innerHTML = `<strong>${name}</strong> zapisany z ${tasks.length} zadaniami!`;
  document.querySelector(".training-section").appendChild(savedDiv);

  setTimeout(() => savedDiv.remove(), 3000);
}

onAuthStateChanged(auth, (user) => {
  const body = document.body;

  if (user) {
    // Użytkownik zalogowany
    body.classList.add("logged-in");
    // Przekieruj na stronę główną, jeśli był na logowaniu
    if (window.location.hash === "" || window.location.hash === "#login-view") {
      window.location.hash = "home";
      showView("home");
    } else {
      showView(window.location.hash.substring(1));
    }
  } else {
    // Użytkownik wylogowany
    body.classList.remove("logged-in");
    window.location.hash = "login-view";
    showView("login-view");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const authForm = document.getElementById("auth-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const authError = document.getElementById("auth-error");

  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput.value;
      const password = passwordInput.value;

      signInWithEmailAndPassword(auth, email, password).catch((error) => {
        authError.textContent = "Błąd logowania: " + error.message;
      });
    });

    document.getElementById("register-btn").addEventListener("click", () => {
      const email = emailInput.value;
      const password = passwordInput.value;

      createUserWithEmailAndPassword(auth, email, password).catch((error) => {
        authError.textContent = "Błąd rejestracji: " + error.message;
      });
    });
  }

  document.getElementById("logout-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth);
  });

  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (e.target.id === "logout-btn") return;

      e.preventDefault();
      const viewId = e.target.getAttribute("href").substring(1);

      // Blokada dostępu dla niezalogowanych
      if (!auth.currentUser && viewId !== "login-view") {
        window.location.hash = "login-view";
        showView("login-view");
      } else {
        window.location.hash = viewId;
        showView(viewId);
      }
    });
  });

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.substring(1) || "login-view";
    // Blokada dostępu dla niezalogowanych
    if (!auth.currentUser && hash !== "login-view") {
      window.location.hash = "login-view";
      showView("login-view");
    } else {
      showView(hash);
    }
  });
});
