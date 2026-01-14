import { auth, signOut } from '../auth/auth.js';

export function updateNavigation(user) {
  const authOnlyLinks = document.querySelectorAll('.auth-only');
  if (user) {
    authOnlyLinks.forEach(link => {
      link.style.display = 'inline-block';
    });
    document.body.classList.add('logged-in');
  } else {
    authOnlyLinks.forEach(link => {
      if (link.id !== 'logout-btn') {
        link.style.display = 'none';
      }
    });
    document.body.classList.remove('logged-in');
  }
}

export function setupNavigation() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  }

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");
      if (href) {
        const viewId = href.substring(1);
        window.location.hash = viewId;
      }
    });
  });
}