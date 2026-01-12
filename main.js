import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiEcksBi4G9OR7H3GA8VYwm7G73YlspaI",
  authDomain: "universaltrainingplanner-241fc.firebaseapp.com",
  databaseURL: "https://universaltrainingplanner-241fc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "universaltrainingplanner-241fc",
  storageBucket: "universaltrainingplanner-241fc.firebasestorage.app",
  messagingSenderId: "1087012477704",
  appId: "1:1087012477704:web:c30b98af4a5691e3726abd",
  measurementId: "G-NYJPYV8ZFG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function showView(viewId) {
  const views = document.querySelectorAll(".view");
  views.forEach((view) => view.classList.remove("active"));

  const selectedView = document.getElementById(viewId);
  if (selectedView) {
    selectedView.classList.add("active");
  }
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

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        authError.textContent = "Błąd logowania: " + error.message;
      });
  });

  document.getElementById("register-btn").addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    createUserWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        authError.textContent = "Błąd rejestracji: " + error.message;
      });
  });

  document.getElementById("logout-btn").addEventListener("click", (e) => {
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
    showView(hash);
  });
});