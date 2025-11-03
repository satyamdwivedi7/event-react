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
      // Initialize chart after data is loaded
      this.initializeChart();
    } catch (error) {
      console.error("Dashboard initialization error:", error);
      UIUtils.showToast("Failed to load dashboard data", "error");
    }
  }

  async loadStatistics() {
    try {
      // Fetch all events for the organizer
      const eventsResponse = await API.getAllEvents();
      
      // API returns { success: true, data: [...] }
      const events = eventsResponse.data || [];
      
      // Get current user ID
      const userId = this.user._id || this.user.id;

      // Filter events by current user (organizer)
      // Handle cases where organizer is null, a string ID, or a populated object
      const myEvents = events.filter((event) => {
        if (!event.organizer) return false;
        
        const organizerId = typeof event.organizer === 'object' 
          ? event.organizer._id 
          : event.organizer;
        
        return organizerId === userId;
      });

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

      // Update next event date
      const nextEvent = myEvents
        .filter((event) => UIUtils.isUpcoming(event.startDate))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
      
      const nextEventElement = document.getElementById("nextEventDate");
      if (nextEventElement) {
        if (nextEvent) {
          nextEventElement.innerHTML = `Next: <span class="font-medium">${UIUtils.formatDate(nextEvent.startDate)}</span>`;
        } else {
          nextEventElement.innerHTML = `<span class="text-gray-500 dark:text-gray-500">No upcoming events</span>`;
        }
      }
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
      
      // Get current user ID
      const userId = this.user._id || this.user.id;

      // Filter events by current user
      const myEvents = events.filter((event) => {
        if (!event.organizer) return false;
        
        const organizerId = typeof event.organizer === 'object' 
          ? event.organizer._id 
          : event.organizer;
        
        return organizerId === userId;
      });

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
      
      // Get current user ID
      const userId = this.user._id || this.user.id;

      // Filter events by current user first, then filter upcoming
      const myEvents = events.filter((event) => {
        if (!event.organizer) return false;
        
        const organizerId = typeof event.organizer === 'object' 
          ? event.organizer._id 
          : event.organizer;
        
        return organizerId === userId;
      });

      // Filter upcoming events
      const upcomingEvents = myEvents
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

  async initializeChart() {
    try {
      const chartCanvas = document.getElementById("registrationChart");
      if (!chartCanvas) return;

      const response = await API.getAllEvents();
      const events = response.data || [];
      
      // Get current user ID
      const userId = this.user._id || this.user.id;

      // Filter events by current user
      const myEvents = events.filter((event) => {
        if (!event.organizer) return false;
        
        const organizerId = typeof event.organizer === 'object' 
          ? event.organizer._id 
          : event.organizer;
        
        return organizerId === userId;
      });

      // Get registration data for the last 6 months
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentDate = new Date();
      const last6Months = [];
      const registrationCounts = [];

      // Generate labels and counts for last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        last6Months.push(monthLabel);

        // Count registrations for this month
        const count = myEvents.filter(event => {
          const eventDate = new Date(event.createdAt || event.startDate);
          return eventDate.getMonth() === date.getMonth() && 
                 eventDate.getFullYear() === date.getFullYear();
        }).reduce((sum, event) => sum + (event.totalRegistrations || 0), 0);

        registrationCounts.push(count);
      }

      const ctx = chartCanvas.getContext("2d");
      
      // Check if chart already exists and destroy it
      if (window.dashboardChart) {
        window.dashboardChart.destroy();
      }

      window.dashboardChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: last6Months,
          datasets: [
            {
              label: "Registrations",
              data: registrationCounts,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(17, 24, 39, 0.95)",
              titleColor: "rgb(255, 255, 255)",
              bodyColor: "rgb(229, 231, 235)",
              borderColor: "rgba(75, 85, 99, 0.5)",
              borderWidth: 1,
              padding: 12,
              displayColors: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "rgb(156, 163, 175)",
                precision: 0,
              },
              grid: {
                color: "rgba(156, 163, 175, 0.1)",
              },
            },
            x: {
              ticks: {
                color: "rgb(156, 163, 175)",
              },
              grid: {
                color: "rgba(156, 163, 175, 0.1)",
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error initializing chart:", error);
    }
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
