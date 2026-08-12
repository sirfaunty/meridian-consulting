// Minimal progressive enhancement. Safe to leave as-is for most sites.

// Close the mobile menu after a nav link is tapped.
document.addEventListener("click", (e) => {
  const link = e.target.closest(".site-nav a");
  if (link) {
    const toggle = document.getElementById("nav-toggle");
    if (toggle) toggle.checked = false;
  }
});
