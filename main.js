function showView(viewId) {
  const views = document.querySelectorAll(".view");
  views.forEach((view) => view.classList.remove("active"));

  const selectedView = document.getElementById(viewId);
  if (selectedView) {
    selectedView.classList.add("active");
  }
}

function handleHashChange() {
  const hash = window.location.hash.substring(1) || "home";
  showView(hash);
}

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const viewId = e.target.getAttribute("href").substring(1);
      window.location.hash = viewId;
      showView(viewId);
    });
  });

  window.addEventListener("hashchange", handleHashChange);

  handleHashChange();
});
