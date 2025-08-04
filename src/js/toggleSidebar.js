// Toggle sidebar functionality
const sidebarToggle = document.querySelector(
  '[data-drawer-toggle="default-sidebar"]'
);
const sidebar = document.getElementById("default-sidebar");

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
  });
}

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  if (window.innerWidth < 640) {
    // sm breakpoint
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.add("-translate-x-full");
    }
  }
});
