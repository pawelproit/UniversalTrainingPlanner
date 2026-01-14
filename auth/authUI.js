import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from './auth.js';

export function setupAuthUI() {
  const authForm = document.getElementById("auth-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const authError = document.getElementById("auth-error");

  if (!authForm) return;

  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (authError) authError.textContent = "";

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (authError) {
        authError.textContent = "Błąd logowania: " + error.message;
      }
      console.error("Login error:", error);
    }
  });

  const registerBtn = document.getElementById("register-btn");
  if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      if (authError) authError.textContent = "";

      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error) {
        if (authError) {
          authError.textContent = "Błąd rejestracji: " + error.message;
        }
        console.error("Register error:", error);
      }
    });
  }
}