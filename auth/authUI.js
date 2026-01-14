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
      window.location.hash = "#home";
      emailInput.value = "";
      passwordInput.value = "";
    } catch (error) {
      if (authError) {
        let errorMessage = "Błąd logowania: ";
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage += "Nieprawidłowy adres email";
            break;
          case 'auth/user-disabled':
            errorMessage += "Konto zostało zablokowane";
            break;
          case 'auth/user-not-found':
            errorMessage += "Nie znaleziono użytkownika";
            break;
          case 'auth/wrong-password':
            errorMessage += "Nieprawidłowe hasło";
            break;
          case 'auth/too-many-requests':
            errorMessage += "Zbyt wiele prób logowania. Spróbuj później";
            break;
          default:
            errorMessage += error.message;
        }
        authError.textContent = errorMessage;
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

      if (password.length < 6) {
        if (authError) {
          authError.textContent = "Hasło musi mieć co najmniej 6 znaków";
        }
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        window.location.hash = "#home";
        emailInput.value = "";
        passwordInput.value = "";
      } catch (error) {
        if (authError) {
          let errorMessage = "Błąd rejestracji: ";
          switch (error.code) {
            case 'auth/email-already-in-use':
              errorMessage += "Email jest już używany";
              break;
            case 'auth/invalid-email':
              errorMessage += "Nieprawidłowy adres email";
              break;
            case 'auth/operation-not-allowed':
              errorMessage += "Rejestracja jest obecnie wyłączona";
              break;
            case 'auth/weak-password':
              errorMessage += "Hasło jest za słabe";
              break;
            default:
              errorMessage += error.message;
          }
          authError.textContent = errorMessage;
        }
        console.error("Register error:", error);
      }
    });
  }
}