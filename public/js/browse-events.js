// Browse Events Page Integration
import API from "./api.js";
import AUTH from "./auth.js";
import UIUtils from "./utils.js";

class BrowseEventsPage {
  constructor() {
    this.user = AUTH.getUser();
    this.allEvents = [];
    this.filteredEvents = [];
    this.currentFilter = "all";
    this.searchQuery = "";
    this.selectedEvent = null;
    this.init();
  }

  async init() {
    await this.loadUpcomingEvents();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.filterEvents();
    });

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const filter = e.target.dataset.filter;
        this.setActiveFilter(filter);
      });
    });

    // Modal controls
    document.getElementById("close-modal").addEventListener("click", () => {
      this.closeModal();
    });

    document.getElementById("cancel-btn").addEventListener("click", () => {
      this.closeModal();
    });

    document.getElementById("registration-form").addEventListener("submit", (e) => {
      this.handleRegistration(e);
    });

    // Close modal when clicking outside
    document.getElementById("registration-modal").addEventListener("click", (e) => {
      if (e.target.id === "registration-modal") {
        this.closeModal();
      }
    });
  }

  async loadUpcomingEvents() {
    try {
      UIUtils.showLoading("events-container");

      const response = await API.getAllEvents();
      console.log("API Response:", response);
      const events = response.data || [];
      console.log("Total events fetched:", events.length);
      
      // Check first event structure for debugging
      if (events.length > 0) {
        console.log("First event ID field check:");
        console.log("  _id:", events[0]._id);
        console.log("  id:", events[0].id);
        console.log("  Full event:", events[0]);
      }

      // Filter: upcoming events only and public
      // Note: Showing all upcoming events regardless of status for now
      // You can add status === "published" filter if needed
      this.allEvents = events.filter((event) => {
        const isUpcoming = UIUtils.isUpcoming(event.startDate);
        const isPublic = event.isPublic !== false;
        // const isPublished = event.status === "published"; // Optional: uncomment to only show published
        const notPastRegistrationDeadline = event.registrationDeadline
          ? new Date(event.registrationDeadline) > new Date()
          : true;
        
        console.log(`Event: ${event.title}`, {
          isUpcoming,
          isPublic,
          // isPublished,
          notPastRegistrationDeadline,
          startDate: event.startDate,
          status: event.status,
        });
        
        return isUpcoming && isPublic && notPastRegistrationDeadline;
      });

      console.log("Filtered events:", this.allEvents.length);

      // Sort by start date
      this.allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      this.filteredEvents = [...this.allEvents];
      this.renderEvents();
    } catch (error) {
      console.error("Error loading events:", error);
      UIUtils.showError("events-container", "Failed to load events");
    }
  }

  filterEvents() {
    this.filteredEvents = this.allEvents.filter((event) => {
      // Search filter
      const matchesSearch =
        !this.searchQuery ||
        event.title.toLowerCase().includes(this.searchQuery) ||
        event.description.toLowerCase().includes(this.searchQuery) ||
        event.category.toLowerCase().includes(this.searchQuery);

      // Type filter
      let matchesType = true;
      if (this.currentFilter === "free") {
        matchesType = event.ticketType === "free";
      } else if (this.currentFilter === "paid") {
        matchesType = event.ticketType === "paid";
      }

      return matchesSearch && matchesType;
    });

    this.renderEvents();
  }

  setActiveFilter(filter) {
    this.currentFilter = filter;

    // Update button styles
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      if (btn.dataset.filter === filter) {
        btn.className =
          "filter-btn px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500";
      } else {
        btn.className =
          "filter-btn px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500";
      }
    });

    this.filterEvents();
  }

  renderEvents() {
    const container = document.getElementById("events-container");

    if (this.filteredEvents.length === 0) {
      UIUtils.showEmptyState(
        "events-container",
        this.searchQuery
          ? "No events found matching your search"
          : "No upcoming events available for registration",
        "🎫"
      );
      return;
    }

    container.innerHTML = this.filteredEvents
      .map((event) => this.createEventCard(event))
      .join("");

    // Add event listeners to register buttons
    this.addRegisterButtonListeners();
  }

  createEventCard(event) {
    const registrationStatus = this.getRegistrationStatus(event);
    const priceDisplay =
      event.ticketType === "paid"
        ? UIUtils.formatCurrency(event.pricing?.regularPrice || 0, event.pricing?.currency || "USD")
        : "FREE";

    return `
      <div class="p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col h-full">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
            ${UIUtils.getEventIcon(event.category)} ${event.title}
          </h3>
          <span class="px-2 py-1 text-xs font-semibold rounded-full ${
            event.ticketType === "paid"
              ? "bg-green-500 text-white"
              : "bg-blue-500 text-white"
          }">
            ${priceDisplay}
          </span>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          ${event.description}
        </p>

        <div class="space-y-2 mb-4 flex-grow">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            📅 ${UIUtils.formatDateTime(event.startDate)}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            📍 ${this.getLocationText(event)}
          </p>
          <div>
            ${UIUtils.getLocationTypeBadge(event.locationType)}
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            👥 ${event.totalRegistrations || 0} / ${event.capacity} registered
          </p>
          ${
            event.registrationDeadline
              ? `<p class="text-xs text-gray-500 dark:text-gray-400">
                  ⏰ Register by ${UIUtils.formatDate(event.registrationDeadline)}
                </p>`
              : ""
          }
        </div>

        <div class="mt-auto">
          ${registrationStatus.canRegister
            ? `<button
                data-event-id="${event._id}"
                class="register-btn w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Register Now
              </button>`
            : `<button
                disabled
                class="w-full px-4 py-2 text-sm font-medium text-gray-400 bg-gray-200 rounded-md cursor-not-allowed dark:bg-gray-700"
              >
                ${registrationStatus.message}
              </button>`
          }
        </div>
      </div>
    `;
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

  getRegistrationStatus(event) {
    const spotsLeft = event.capacity - (event.totalRegistrations || 0);

    if (spotsLeft <= 0) {
      return {
        canRegister: event.allowWaitlist,
        message: event.allowWaitlist ? "Join Waitlist" : "Event Full"
      };
    }

    return { canRegister: true, message: "Available" };
  }

  addRegisterButtonListeners() {
    document.querySelectorAll(".register-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventId = e.target.dataset.eventId;
        this.openRegistrationModal(eventId);
      });
    });
  }

  openRegistrationModal(eventId) {
    this.selectedEvent = this.allEvents.find((e) => e._id === eventId);
    
    if (!this.selectedEvent) return;

    // Populate event info in modal
    const eventInfo = document.getElementById("modal-event-info");
    eventInfo.innerHTML = `
      <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        ${this.selectedEvent.title}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
        📅 ${UIUtils.formatDateTime(this.selectedEvent.startDate)}
      </p>
      <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
        📍 ${this.getLocationText(this.selectedEvent)}
      </p>
      <p class="text-sm font-semibold text-gray-800 dark:text-white">
        ${
          this.selectedEvent.ticketType === "paid"
            ? `Price: ${UIUtils.formatCurrency(
                this.selectedEvent.pricing?.regularPrice || 0,
                this.selectedEvent.pricing?.currency || "USD"
              )}`
            : "Free Event"
        }
      </p>
    `;

    // Reset form
    document.getElementById("registration-form").reset();

    // Pre-fill form with logged-in user's information if available
    if (this.user) {
      const firstNameInput = document.getElementById("first-name");
      const lastNameInput = document.getElementById("last-name");
      const emailInput = document.getElementById("email");
      const phoneInput = document.getElementById("phone");
      const organizationInput = document.getElementById("organization");
      const jobTitleInput = document.getElementById("job-title");

      if (this.user.firstName && firstNameInput) {
        firstNameInput.value = this.user.firstName;
      }
      if (this.user.lastName && lastNameInput) {
        lastNameInput.value = this.user.lastName;
      }
      if (this.user.email && emailInput) {
        emailInput.value = this.user.email;
      }
      if (this.user.phone && phoneInput) {
        phoneInput.value = this.user.phone;
      }
      if (this.user.organization && organizationInput) {
        organizationInput.value = this.user.organization;
      }
      if (this.user.jobTitle && jobTitleInput) {
        jobTitleInput.value = this.user.jobTitle;
      }
    }

    // Show modal
    const modal = document.getElementById("registration-modal");
    modal.classList.remove("hidden");
    modal.style.display = "flex";
    modal.style.opacity = "0";
    document.body.style.overflow = "hidden";
    
    // Fade in animation
    setTimeout(() => {
      modal.style.transition = "opacity 0.3s ease-in-out";
      modal.style.opacity = "1";
    }, 10);
  }

  closeModal() {
    const modal = document.getElementById("registration-modal");
    modal.style.opacity = "0";
    
    // Wait for fade out before hiding
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.style.display = "none";
      document.body.style.overflow = "auto";
      this.selectedEvent = null;
    }, 300);
  }

  async handleRegistration(e) {
    e.preventDefault();

    if (!this.selectedEvent) return;

    try {
      const submitButton = e.target.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Registering...";

      const formData = new FormData(e.target);

      // Prepare registration data according to NEW Registration schema
      // Participant is now an embedded object, not a reference
      const registrationData = {
        eventId: this.selectedEvent._id || this.selectedEvent.id, // Backend expects "eventId" not "event"
        participant: {
          firstName: formData.get("first-name").trim(),
          lastName: formData.get("last-name").trim(),
          email: formData.get("email").trim().toLowerCase(),
          phone: formData.get("phone").trim(),
        },
        ticketType: formData.get("ticket-type"), // regular, early-bird, vip, student, group
        status: "confirmed", // Auto-confirm registration
        // Payment: For paid events mark as completed (since no actual payment integration)
        // For free events, keep as free
        paymentStatus: this.selectedEvent.ticketType === "paid" ? "completed" : "free",
        paymentAmount: this.selectedEvent.ticketType === "paid" 
          ? (this.selectedEvent.pricing?.regularPrice || 0)
          : 0,
      };

      // Add optional participant fields
      const organization = formData.get("organization");
      const jobTitle = formData.get("job-title");
      
      if (organization && organization.trim()) {
        registrationData.participant.organization = organization.trim();
      }
      
      if (jobTitle && jobTitle.trim()) {
        registrationData.participant.jobTitle = jobTitle.trim();
      }

      // Add optional fields only if they have values
      const dietaryRestrictions = formData.get("dietary-restrictions");
      const specialRequests = formData.get("special-requests");
      
      if (dietaryRestrictions && dietaryRestrictions.trim()) {
        registrationData.dietaryRestrictions = dietaryRestrictions.trim();
      }
      
      if (specialRequests && specialRequests.trim()) {
        registrationData.specialRequests = specialRequests.trim();
      }

      // Add emergency contact object only if at least one field is provided
      const emergencyName = formData.get("emergency-name");
      const emergencyPhone = formData.get("emergency-phone");
      const emergencyRelationship = formData.get("emergency-relationship");

      if (emergencyName?.trim() || emergencyPhone?.trim() || emergencyRelationship?.trim()) {
        registrationData.emergencyContact = {};
        
        if (emergencyName?.trim()) {
          registrationData.emergencyContact.name = emergencyName.trim();
        }
        if (emergencyPhone?.trim()) {
          registrationData.emergencyContact.phone = emergencyPhone.trim();
        }
        if (emergencyRelationship?.trim()) {
          registrationData.emergencyContact.relationship = emergencyRelationship.trim();
        }
      }

      console.log("===== REGISTRATION DEBUG =====");
      console.log("Full Selected Event Object:", this.selectedEvent);
      console.log("Event Object Keys:", Object.keys(this.selectedEvent));
      console.log("Selected Event._id:", this.selectedEvent._id);
      console.log("Selected Event.id:", this.selectedEvent.id);
      console.log("EventId field in registrationData:", registrationData.eventId);
      console.log("Registration Data BEFORE fix:", JSON.stringify(registrationData, null, 2));

      // CRITICAL FIX: Ensure event ID is present
      // The backend expects "eventId" field (not "event")
      const eventId = this.selectedEvent._id || this.selectedEvent.id;
      console.log("Extracted Event ID:", eventId);
      
      if (!eventId) {
        console.error("CRITICAL: No event ID found!");
        UIUtils.showToast("Error: Event information is missing. Please try again.", "error");
        submitButton.disabled = false;
        submitButton.textContent = "Register";
        return;
      }
      
      // Force set the event ID (backend expects "eventId" not "event")
      registrationData.eventId = eventId;
      
      console.log("Registration Data AFTER fix:", JSON.stringify(registrationData, null, 2));
      console.log("===== END DEBUG =====");

      // Submit registration
      const response = await API.createRegistration(registrationData);
      
      console.log("Registration Response:", response);

      if (response.success) {
        UIUtils.showToast("Successfully registered for the event!", "success");
        this.closeModal();
        
        // Reload events to update registration counts
        await this.loadUpcomingEvents();
      } else {
        throw new Error(response.message || "Failed to register for event");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Check for specific error types
      if (error.message && (error.message.toLowerCase().includes("already registered") || 
          error.message.toLowerCase().includes("duplicate") || 
          error.message.toLowerCase().includes("e11000"))) {
        UIUtils.showToast("This email is already registered for this event", "error");
      } else if (error.message && error.message.toLowerCase().includes("not found")) {
        UIUtils.showToast("Event or user not found. Please try again.", "error");
      } else if (error.message && error.message.toLowerCase().includes("capacity")) {
        UIUtils.showToast("Event is at full capacity", "error");
      } else if (error.message && error.message.toLowerCase().includes("unauthorized")) {
        UIUtils.showToast("Please login again to register", "error");
        setTimeout(() => window.location.href = "login.html", 2000);
      } else {
        UIUtils.showToast(error.message || "Failed to register for event", "error");
      }

      const submitButton = e.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Register";
      }
    }
  }
}

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new BrowseEventsPage();
});

export default BrowseEventsPage;
