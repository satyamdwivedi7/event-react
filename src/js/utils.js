// Utility functions for displaying data in the UI
const UIUtils = {
  // Format date to readable string
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  // Format datetime to readable string
  formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Format time only
  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Format currency
  formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  // Get status badge class with visible colors on dark backgrounds
  getStatusBadgeClass(status) {
    const statusClasses = {
      draft: "bg-gray-500 text-white dark:bg-gray-500 dark:text-white",
      published: "bg-green-500 text-white dark:bg-green-500 dark:text-white",
      cancelled: "bg-red-500 text-white dark:bg-red-500 dark:text-white",
      completed: "bg-blue-500 text-white dark:bg-blue-500 dark:text-white",
      pending: "bg-yellow-400 text-gray-900 dark:bg-yellow-400 dark:text-gray-900",
      confirmed: "bg-green-500 text-white dark:bg-green-500 dark:text-white",
      waitlisted: "bg-purple-500 text-white dark:bg-purple-500 dark:text-white",
      attended: "bg-blue-500 text-white dark:bg-blue-500 dark:text-white",
      paid: "bg-green-500 text-white dark:bg-green-500 dark:text-white",
      refunded: "bg-gray-500 text-white dark:bg-gray-500 dark:text-white",
    };
    return (
      statusClasses[status] ||
      "bg-gray-500 text-white dark:bg-gray-500 dark:text-white"
    );
  },

  // Show loading spinner
  showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      `;
    }
  },

  // Show error message
  showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div class="rounded-md bg-red-900 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-200">${message}</p>
            </div>
          </div>
        </div>
      `;
    }
  },

  // Show empty state
  showEmptyState(elementId, message, icon = "📭") {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div class="text-center py-12">
          <div class="text-6xl mb-4">${icon}</div>
          <p class="text-gray-400 text-lg">${message}</p>
        </div>
      `;
    }
  },

  // Show toast notification at top-right corner
  showToast(message, type = "success") {
    // Get or create toast container
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    
    // Determine colors based on type
    const bgColor =
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : type === "warning"
        ? "bg-yellow-500"
        : "bg-blue-500";

    const icon = 
      type === "success"
        ? "✓"
        : type === "error"
        ? "✕"
        : type === "warning"
        ? "⚠"
        : "ℹ";

    // Create toast with icon and message
    toast.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl transition-all duration-300 flex items-center gap-3 min-w-[300px] max-w-[500px]`;
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.pointerEvents = "auto";
    toast.style.cursor = "pointer";
    
    toast.innerHTML = `
      <span class="text-2xl font-bold">${icon}</span>
      <span class="flex-1">${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Slide in animation
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(0)";
    }, 10);

    // Auto dismiss after 4 seconds
    const dismissToast = () => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
        // Remove container if no toasts left
        if (toastContainer.children.length === 0 && document.body.contains(toastContainer)) {
          document.body.removeChild(toastContainer);
        }
      }, 300);
    };

    const autoHideTimer = setTimeout(dismissToast, 4000);

    // Click to dismiss
    toast.addEventListener("click", () => {
      clearTimeout(autoHideTimer);
      dismissToast();
    });
  },

  // Truncate text
  truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  },

  // Get event type icon
  getEventIcon(category) {
    const icons = {
      conference: "🎤",
      workshop: "🛠️",
      seminar: "📚",
      networking: "🤝",
      social: "🎉",
      sports: "⚽",
      entertainment: "🎭",
      other: "📅",
    };
    return icons[category] || "📅";
  },

  // Get location type badge with visible colors
  getLocationTypeBadge(locationType) {
    const badges = {
      "in-person": `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white">🏢 In-Person</span>`,
      virtual: `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-500 text-white">💻 Virtual</span>`,
      hybrid: `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">🌐 Hybrid</span>`,
    };
    return badges[locationType] || "";
  },

  // Check if event is upcoming
  isUpcoming(startDate) {
    return new Date(startDate) > new Date();
  },

  // Check if event is ongoing
  isOngoing(startDate, endDate) {
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  },

  // Check if event is past
  isPast(endDate) {
    return new Date(endDate) < new Date();
  },
};

export default UIUtils;
