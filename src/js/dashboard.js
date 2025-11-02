// Dashboard Integration
import API from "./api.js";
import AUTH from "./auth.js";
import UIUtils from "./utils.js";

class Dashboard {
  constructor() {
    this.user = AUTH.getUser();
    this.init();
  }

  async init() {
    try {
      await Promise.all([
        this.loadStatistics(),
        this.loadRecentEvents(),
        this.loadUpcomingEvents(),
      ]);
    } catch (error) {
      console.error("Dashboard initialization error:", error);
      UIUtils.showToast("Failed to load dashboard data", "error");
    }
  }

  async loadStatistics() {
    try {
      // Fetch all events for the organizer
      const eventsResponse = await API.getAllEvents();
      const events = eventsResponse.data || [];

      // Filter events by current user (organizer)
      const myEvents = events.filter(
        (event) => event.organizer === this.user.id || event.organizer._id === this.user.id
      );

      // Calculate statistics
      const totalEvents = myEvents.length;
      const upcomingEvents = myEvents.filter((event) =>
        UIUtils.isUpcoming(event.startDate)
      ).length;

      // Calculate total participants
      let totalParticipants = 0;
      let totalRevenue = 0;

      for (const event of myEvents) {
        totalParticipants += event.totalRegistrations || 0;
        totalRevenue += event.revenue || 0;
      }

      // Update UI
      this.updateStatCard("totalEvents", totalEvents);
      this.updateStatCard("totalParticipants", totalParticipants);
      this.updateStatCard("revenue", UIUtils.formatCurrency(totalRevenue));
      this.updateStatCard("upcomingEvents", upcomingEvents);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  }

  updateStatCard(cardId, value) {
    const element = document.getElementById(cardId);
    if (element) {
      element.textContent = value;
    }
  }

  async loadRecentEvents() {
    try {
      const response = await API.getAllEvents();
      const events = response.data || [];

      // Filter events by current user
      const myEvents = events.filter(
        (event) => event.organizer === this.user.id || event.organizer._id === this.user.id
      );

      // Sort by creation date (most recent first)
      const recentEvents = myEvents
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      this.renderRecentEvents(recentEvents);
    } catch (error) {
      console.error("Error loading recent events:", error);
      const container = document.getElementById("recentEventsList");
      if (container) {
        UIUtils.showError(
          "recentEventsList",
          "Failed to load recent events"
        );
      }
    }
  }

  renderRecentEvents(events) {
    const container = document.getElementById("recentEventsList");
    if (!container) return;

    if (events.length === 0) {
      UIUtils.showEmptyState(
        "recentEventsList",
        "No events yet. Create your first event!",
        "📅"
      );
      return;
    }

    container.innerHTML = events
      .map(
        (event) => `
      <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">
            ${UIUtils.getEventIcon(event.category)} ${event.title}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            ${UIUtils.formatDate(event.startDate)}
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="px-2 py-1 text-xs font-semibold rounded-full ${UIUtils.getStatusBadgeClass(
            event.status
          )}">
            ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>
      </div>
    `
      )
      .join("");
  }

  async loadUpcomingEvents() {
    try {
      const response = await API.getAllEvents();
      const events = response.data || [];

      // Filter upcoming events
      const upcomingEvents = events
        .filter((event) => UIUtils.isUpcoming(event.startDate))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5);

      this.renderUpcomingEvents(upcomingEvents);
    } catch (error) {
      console.error("Error loading upcoming events:", error);
    }
  }

  renderUpcomingEvents(events) {
    const container = document.getElementById("upcomingEventsList");
    if (!container) return;

    if (events.length === 0) {
      UIUtils.showEmptyState(
        "upcomingEventsList",
        "No upcoming events",
        "🗓️"
      );
      return;
    }

    container.innerHTML = events
      .map(
        (event) => `
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
              ${event.title}
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📅 ${UIUtils.formatDateTime(event.startDate)}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📍 ${
                event.locationType === "virtual"
                  ? "Virtual Event"
                  : event.venue?.name || "TBA"
              }
            </p>
            <div class="flex items-center gap-2 mt-2">
              ${UIUtils.getLocationTypeBadge(event.locationType)}
              <span class="text-xs text-gray-600 dark:text-gray-300">
                👥 ${event.totalRegistrations || 0}/${event.capacity} registered
              </span>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }
}

// Initialize dashboard when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new Dashboard();
  });
} else {
  new Dashboard();
}

export default Dashboard;
