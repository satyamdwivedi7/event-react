// Events Page Integration
import API from "./api.js";
import AUTH from "./auth.js";
import UIUtils from "./utils.js";

class EventsPage {
  constructor() {
    this.user = AUTH.getUser();
    this.allEvents = [];
    this.filteredEvents = [];
    this.currentFilter = "all";
    this.searchQuery = "";
    this.init();
  }

  async init() {
    try {
      UIUtils.showLoading("eventsCardsContainer");
      UIUtils.showLoading("eventsTableBody");
      
      await this.loadEvents();
      this.setupEventListeners();
    } catch (error) {
      console.error("Events page initialization error:", error);
      UIUtils.showError("eventsCardsContainer", `Failed to load events: ${error.message}`);
      UIUtils.showError("eventsTableBody", `Failed to load events: ${error.message}`);
    }
  }

  async loadEvents() {
    try {
      const response = await API.getAllEvents();
      
      // Handle different response structures
      let events = [];
      if (response.success && response.data) {
        events = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        events = response;
      } else if (response.data && Array.isArray(response.data)) {
        events = response.data;
      }
      
      this.allEvents = events;
      
      // Filter events by current user (organizer) - only if user is not admin
      if (this.user && !AUTH.isAdmin()) {
        this.allEvents = this.allEvents.filter((event) => {
          // Skip filtering if organizer is null (show all events)
          if (!event.organizer) {
            return true;
          }
          
          // Handle organizer as object or string
          const organizerId = typeof event.organizer === 'object' && event.organizer !== null 
            ? event.organizer._id 
            : event.organizer;
          
          return organizerId === this.user.id || organizerId === this.user._id;
        });
      }

      this.filteredEvents = [...this.allEvents];
      this.renderEvents();
    } catch (error) {
      console.error("Error loading events:", error);
      UIUtils.showToast(error.message || "Failed to load events", "error");
      throw error;
    }
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("searchEvents");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.filterEvents();
      });
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll("[data-filter]");
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.currentFilter = btn.dataset.filter;
        
        // Update active state
        filterButtons.forEach((b) => b.classList.remove("bg-blue-600", "text-white"));
        btn.classList.add("bg-blue-600", "text-white");
        
        this.filterEvents();
      });
    });
  }

  filterEvents() {
    let filtered = [...this.allEvents];

    // Apply status filter
    if (this.currentFilter !== "all") {
      if (this.currentFilter === "upcoming") {
        filtered = filtered.filter((event) => UIUtils.isUpcoming(event.startDate));
      } else if (this.currentFilter === "ongoing") {
        filtered = filtered.filter((event) =>
          UIUtils.isOngoing(event.startDate, event.endDate)
        );
      } else if (this.currentFilter === "past") {
        filtered = filtered.filter((event) => UIUtils.isPast(event.endDate));
      } else {
        filtered = filtered.filter((event) => event.status === this.currentFilter);
      }
    }

    // Apply search filter
    if (this.searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(this.searchQuery) ||
          event.description.toLowerCase().includes(this.searchQuery) ||
          event.category.toLowerCase().includes(this.searchQuery)
      );
    }

    this.filteredEvents = filtered;
    this.renderEvents();
  }

  renderEvents() {
    this.renderEventCards();
    this.renderEventTable();
  }

  renderEventCards() {
    const container = document.getElementById("eventsCardsContainer");
    if (!container) return;

    if (this.filteredEvents.length === 0) {
      UIUtils.showEmptyState(
        "eventsCardsContainer",
        this.searchQuery
          ? "No events found matching your search"
          : "No events yet. Create your first event!",
        "📅"
      );
      return;
    }

    container.innerHTML = this.filteredEvents
      .map((event) => this.createEventCard(event))
      .join("");

    // Add event listeners to action buttons
    this.addCardEventListeners();
  }

  createEventCard(event) {
    const statusInfo = this.getEventStatus(event);
    return `
      <div class="p-4 bg-white rounded-md shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div class="flex items-start justify-between mb-2">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
            ${UIUtils.getEventIcon(event.category)} ${event.title}
          </h3>
          <span class="px-2 py-1 text-xs font-semibold rounded-full ${UIUtils.getStatusBadgeClass(
            event.status
          )}">
            ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          📅 ${UIUtils.formatDateTime(event.startDate)}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          📍 ${this.getLocationText(event)}
        </p>
        <div class="mt-2">
          ${UIUtils.getLocationTypeBadge(event.locationType)}
        </div>
        <div class="flex items-center justify-between mt-4">
          <span class="text-sm text-gray-600 dark:text-gray-300">
            <strong>${event.totalRegistrations || 0}</strong> / ${event.capacity} registered
          </span>
          ${
            event.ticketType === "paid"
              ? `<span class="text-sm font-semibold text-green-600 dark:text-green-400">
                ${UIUtils.formatCurrency(event.pricing?.regularPrice || 0, event.pricing?.currency || "USD")}
              </span>`
              : `<span class="text-sm font-semibold text-blue-600 dark:text-blue-400">FREE</span>`
          }
        </div>
        <div class="flex gap-2 mt-4">
          <button
            data-event-id="${event._id}"
            data-action="edit"
            class="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Edit
          </button>
          <button
            data-event-id="${event._id}"
            data-action="delete"
            class="px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
            Delete
          </button>
        </div>
      </div>
    `;
  }

  renderEventTable() {
    const tbody = document.getElementById("eventsTableBody");
    if (!tbody) return;

    if (this.filteredEvents.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center">
            <div class="text-gray-400 dark:text-gray-500">
              <div class="text-4xl mb-2">📭</div>
              <p>${
                this.searchQuery
                  ? "No events found matching your search"
                  : "No events yet. Create your first event!"
              }</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredEvents
      .map((event) => this.createEventRow(event))
      .join("");

    // Add event listeners to action buttons
    this.addTableEventListeners();
  }

  createEventRow(event) {
    const statusInfo = this.getEventStatus(event);
    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td class="px-3 py-4 sm:px-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span class="text-xl">${UIUtils.getEventIcon(event.category)}</span>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                ${event.title}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                ${event.category.charAt(0).toUpperCase() + event.category.slice(1)}
              </div>
            </div>
          </div>
        </td>
        <td class="px-3 py-4 sm:px-6 whitespace-nowrap">
          <div class="text-sm text-gray-900 dark:text-white">
            ${UIUtils.formatDate(event.startDate)}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            ${UIUtils.formatTime(event.startDate)}
          </div>
        </td>
        <td class="px-3 py-4 sm:px-6">
          <div class="text-sm text-gray-900 dark:text-white">
            ${this.getLocationText(event)}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ${UIUtils.getLocationTypeBadge(event.locationType)}
          </div>
        </td>
        <td class="px-3 py-4 sm:px-6 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${UIUtils.getStatusBadgeClass(
            event.status
          )}">
            ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </td>
        <td class="px-3 py-4 sm:px-6 whitespace-nowrap">
          <div class="text-sm text-gray-900 dark:text-white">
            ${event.totalRegistrations || 0} / ${event.capacity}
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-1">
            <div class="bg-blue-600 h-2 rounded-full" style="width: ${
              ((event.totalRegistrations || 0) / event.capacity) * 100
            }%"></div>
          </div>
        </td>
        <td class="px-3 py-4 sm:px-6 whitespace-nowrap text-right text-sm font-medium">
          <div class="flex justify-end gap-2">
            <button
              data-event-id="${event._id}"
              data-action="edit"
              class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              title="Edit Event">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              data-event-id="${event._id}"
              data-action="delete"
              class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              title="Delete Event">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  addCardEventListeners() {
    document.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventId = e.currentTarget.dataset.eventId;
        this.editEvent(eventId);
      });
    });

    document.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventId = e.currentTarget.dataset.eventId;
        this.deleteEvent(eventId);
      });
    });
  }

  addTableEventListeners() {
    this.addCardEventListeners(); // Same listeners work for table buttons
  }

  getLocationText(event) {
    if (event.locationType === "virtual") {
      return "Virtual Event";
    } else if (event.locationType === "hybrid") {
      return event.venue?.name || "Hybrid Event";
    } else {
      return event.venue
        ? `${event.venue.name}, ${event.venue.city || ""}`
        : "TBA";
    }
  }

  getEventStatus(event) {
    if (event.status === "cancelled") {
      return { text: "Cancelled", class: "bg-red-100 text-red-800" };
    }
    if (UIUtils.isUpcoming(event.startDate)) {
      return { text: "Upcoming", class: "bg-green-100 text-green-800" };
    }
    if (UIUtils.isOngoing(event.startDate, event.endDate)) {
      return { text: "Ongoing", class: "bg-blue-100 text-blue-800" };
    }
    if (UIUtils.isPast(event.endDate)) {
      return { text: "Completed", class: "bg-gray-100 text-gray-800" };
    }
    return { text: event.status, class: "bg-yellow-100 text-yellow-800" };
  }

  editEvent(eventId) {
    // Redirect to event details or edit page
    window.location.href = `create-event.html?id=${eventId}`;
  }

  async deleteEvent(eventId) {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await API.deleteEvent(eventId);
      
      if (response.success) {
        UIUtils.showToast("Event deleted successfully", "success");
        // Remove the event from the list
        this.allEvents = this.allEvents.filter((e) => e._id !== eventId);
        this.filterEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      UIUtils.showToast(error.message || "Failed to delete event", "error");
    }
  }
}

// Initialize events page when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new EventsPage();
  });
} else {
  new EventsPage();
}

export default EventsPage;
