export function showView(viewId) {
  const views = document.querySelectorAll(".view");
  views.forEach((view) => view.classList.remove("active"));

  const selectedView = document.getElementById(viewId);
  if (selectedView) {
    selectedView.classList.add("active");
  }
}

export function handleHashChange(auth) {
  const user = auth.currentUser;
  const hash = window.location.hash.substring(1) || "";
  
  if (!user && hash !== "login-view" && hash !== "") {
    window.location.hash = "login-view";
    showView("login-view");
    return;
  }
  
  if (user && (hash === "login-view" || hash === "")) {
    window.location.hash = "home";
    showView("home");
    return;
  }
  
  const viewToShow = hash || (user ? "home" : "login-view");
  showView(viewToShow);
}