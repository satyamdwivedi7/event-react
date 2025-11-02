// Authentication Guard - Check if user is logged in
import AUTH from "./auth.js";

// Run authentication check when page loads
(function () {
  // Check if user is authenticated
  if (!AUTH.isAuthenticated()) {
    // Redirect to login page
    window.location.href = "/src/login.html";
    return;
  }

  // Display user info in the sidebar
  const user = AUTH.getUser();
  if (user) {
    // Update user name in sidebar if element exists
    const userNameElements = document.querySelectorAll(".user-name");
    userNameElements.forEach((el) => {
      el.textContent = `${user.firstName} ${user.lastName}`;
    });

    // Update user email in sidebar if element exists
    const userEmailElements = document.querySelectorAll(".user-email");
    userEmailElements.forEach((el) => {
      el.textContent = user.email;
    });

    // Update user role badge if element exists
    const userRoleElements = document.querySelectorAll(".user-role");
    userRoleElements.forEach((el) => {
      el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    });

    // Show/hide admin-only elements
    const adminElements = document.querySelectorAll("[data-admin-only]");
    adminElements.forEach((el) => {
      if (AUTH.isAdmin()) {
        el.style.display = "";
      } else {
        el.style.display = "none";
      }
    });
  }

  // Add logout functionality
  const logoutButtons = document.querySelectorAll(".logout-btn");
  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to logout?")) {
        AUTH.logout();
      }
    });
  });
})();
