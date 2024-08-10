document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("animationOverlay");
  const button = document.getElementById("triggerButton");
  button.addEventListener("click", () => {
    overlay.classList.add("show");
    setTimeout(() => overlay.classList.remove("show"), 3000);
  });
});
