// Registered Participants Page Module
import API from "./api.js";
import AUTH from "./auth.js";
import UIUtils from "./utils.js";

class ParticipantsManager {
  constructor() {
    this.allRegistrations = [];
    this.filteredRegistrations = [];
    this.allEvents = [];
    this.selectedRegistration = null;
    this.currentFilters = {
      search: "",
      event: "all",
      status: "all",
    };
  }

  // Initialize the page
  async init() {
    try {
      // Load all events first (to populate filter dropdown)
      await this.loadEvents();

      // Load all registrations
      await this.loadAllRegistrations();

      // Setup event listeners
      this.setupEventListeners();

      // Initial render
      this.renderStats();
      this.renderRegistrations();
    } catch (error) {
      console.error("Error initializing participants page:", error);
      UIUtils.showToast(error.message || "Failed to load participants", "error");
    }
  }

  // Load all events for filter dropdown
  async loadEvents() {
    try {
      const response = await API.getAllEvents();
      this.allEvents = response.data || [];
      this.populateEventFilter();
    } catch (error) {
      console.error("Error loading events:", error);
    }
  }

  // Populate event filter dropdown
  populateEventFilter() {
    const eventFilter = document.querySelector('select[id="event-filter"]');
    if (!eventFilter) return;

    // Keep "All Events" option
    eventFilter.innerHTML = '<option value="all">All Events</option>';

    // Add each event
    this.allEvents.forEach((event) => {
      const option = document.createElement("option");
      option.value = event._id;
      option.textContent = event.title;
      eventFilter.appendChild(option);
    });
  }

  // Load all registrations across all events
  async loadAllRegistrations() {
    try {
      UIUtils.showLoading("participants-content");

      // Get all registrations for all events
      const registrationsPromises = this.allEvents.map((event) =>
        API.getEventRegistrations(event._id).catch(() => ({ data: [] }))
      );

      const responses = await Promise.all(registrationsPromises);

      // Flatten all registrations and add event details
      this.allRegistrations = responses.flatMap((response, index) => {
        const registrations = response.data || [];
        return registrations.map((reg) => ({
          ...reg,
          eventDetails: this.allEvents[index],
        }));
      });

      this.filteredRegistrations = [...this.allRegistrations];
    } catch (error) {
      console.error("Error loading registrations:", error);
      throw error;
    }
  }

  // Apply filters to registrations
  applyFilters() {
    this.filteredRegistrations = this.allRegistrations.filter((reg) => {
      // Search filter (name or email)
      const searchTerm = this.currentFilters.search.toLowerCase();
      const nameMatch =
        `${reg.participant.firstName} ${reg.participant.lastName}`
          .toLowerCase()
          .includes(searchTerm) || reg.participant.email.toLowerCase().includes(searchTerm);

      if (!nameMatch) return false;

      // Event filter
      if (
        this.currentFilters.event !== "all" &&
        reg.event !== this.currentFilters.event
      ) {
        return false;
      }

      // Status filter
      if (
        this.currentFilters.status !== "all" &&
        reg.status !== this.currentFilters.status
      ) {
        return false;
      }

      return true;
    });

    this.renderStats();
    this.renderRegistrations();
  }

  // Calculate and render statistics
  renderStats() {
    const stats = {
      total: this.filteredRegistrations.length,
      confirmed: this.filteredRegistrations.filter(
        (r) => r.status === "confirmed"
      ).length,
      pending: this.filteredRegistrations.filter((r) => r.status === "pending")
        .length,
      cancelled: this.filteredRegistrations.filter(
        (r) => r.status === "cancelled"
      ).length,
    };

    // Update stat cards
    this.updateStatCard("total", stats.total);
    this.updateStatCard("confirmed", stats.confirmed);
    this.updateStatCard("pending", stats.pending);
    this.updateStatCard("cancelled", stats.cancelled);
  }

  // Update individual stat card
  updateStatCard(type, value) {
    const cards = document.querySelectorAll(".bg-white.dark\\:bg-gray-800.p-4");
    const cardTitles = ["Total", "Confirmed", "Pending", "Cancelled"];
    const index = cardTitles.findIndex((title) => title.toLowerCase() === type);

    if (index !== -1 && cards[index]) {
      const valueElement = cards[index].querySelector(
        ".text-xl.font-semibold"
      );
      if (valueElement) {
        valueElement.textContent = value.toLocaleString();
      }
    }
  }

  // Render registrations (both cards and table)
  renderRegistrations() {
    this.renderCards();
    this.renderTable();
  }

  // Render participant cards (mobile/tablet view)
  renderCards() {
    const cardsContainer = document.querySelector(
      ".grid.grid-cols-1.md\\:grid-cols-2.xl\\:grid-cols-3"
    );
    
    console.log("renderCards called");
    console.log("Cards container found:", !!cardsContainer);
    console.log("Filtered registrations count:", this.filteredRegistrations.length);
    
    if (!cardsContainer) {
      console.error("Cards container not found!");
      return;
    }

    if (this.filteredRegistrations.length === 0) {
      cardsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-6xl mb-4">📭</div>
          <p class="text-gray-400 text-lg">No participants found</p>
        </div>
      `;
      return;
    }

    cardsContainer.innerHTML = this.filteredRegistrations
      .map((reg) => this.createParticipantCard(reg))
      .join("");

    // Add event listeners to card buttons
    this.attachCardEventListeners();
  }

  // Create participant card HTML
  createParticipantCard(registration) {
    console.log('Creating card for registration:', {
      _id: registration._id,
      participant: registration.participant,
      event: registration.event
    });
    
    const initials = `${registration.participant.firstName[0]}${registration.participant.lastName[0]}`;
    const avatarColors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
    ];
    const colorIndex =
      (registration.participant.firstName.charCodeAt(0) +
        registration.participant.lastName.charCodeAt(0)) %
      avatarColors.length;
    const avatarColor = avatarColors[colorIndex];

    const statusBadgeClass = UIUtils.getStatusBadgeClass(registration.status);

    return `
      <div class="p-4 bg-white rounded-md shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-white font-semibold">
              ${initials}
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white truncate">
              ${registration.participant.firstName} ${registration.participant.lastName}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 truncate">
              ${registration.participant.email}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ${registration.eventDetails?.title || "Unknown Event"}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500">
              Registered: ${UIUtils.formatDate(registration.registrationDate)}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-600 font-mono">
              ID: ${registration._id}
            </p>
          </div>
        </div>
        <div class="flex items-center justify-between mt-4">
          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass}">
            ${registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
          </span>
          <div class="flex gap-2">
            <button 
              class="view-btn px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-registration-id="${registration._id}"
            >
              View
            </button>
            <button 
              class="edit-btn px-2 py-1 text-xs text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200"
              data-registration-id="${registration._id}"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Render participants table (desktop view)
  renderTable() {
    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    if (this.filteredRegistrations.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-3 py-12 text-center">
            <div class="text-6xl mb-4">📭</div>
            <p class="text-gray-400 text-lg">No participants found</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredRegistrations
      .map((reg) => this.createTableRow(reg))
      .join("");

    // Add event listeners to table buttons
    this.attachTableEventListeners();
  }

  // Create table row HTML
  createTableRow(registration) {
    const initials = `${registration.participant.firstName[0]}${registration.participant.lastName[0]}`;
    const avatarColors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
    ];
    const colorIndex =
      (registration.participant.firstName.charCodeAt(0) +
        registration.participant.lastName.charCodeAt(0)) %
      avatarColors.length;
    const avatarColor = avatarColors[colorIndex];

    const statusBadgeClass = UIUtils.getStatusBadgeClass(registration.status);

    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td class="px-3 py-4 sm:px-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-white font-semibold">
                ${initials}
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                ${registration.participant.firstName} ${registration.participant.lastName}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                ${registration.participant.email}
              </div>
            </div>
          </div>
        </td>
        <td class="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
          ${registration.eventDetails?.title || "Unknown Event"}
        </td>
        <td class="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
          ${UIUtils.formatDate(registration.registrationDate)}
        </td>
        <td class="px-3 py-4 sm:px-6 whitespace-nowrap">
          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass}">
            ${registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
          </span>
        </td>
        <td class="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
          ${registration.ticketType.charAt(0).toUpperCase() + registration.ticketType.slice(1).replace("-", " ")}
        </td>
        <td class="px-3 py-4 sm:px-6 whitespace-nowrap text-right text-sm font-medium">
          <div class="flex justify-end gap-2">
            <button 
              class="view-btn px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              data-registration-id="${registration._id}"
            >
              View
            </button>
            <button 
              class="edit-btn px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200"
              data-registration-id="${registration._id}"
            >
              Edit
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Attach event listeners to card buttons
  attachCardEventListeners() {
    const viewButtons = document.querySelectorAll(".view-btn");
    const editButtons = document.querySelectorAll(".edit-btn");
    
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const registrationId = e.currentTarget.getAttribute("data-registration-id");
        console.log('View button clicked for registration ID:', registrationId);
        console.log('Navigating to:', `./view-participant.html?id=${registrationId}`);
        window.location.href = `./view-participant.html?id=${registrationId}`;
      });
    });

    editButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const registrationId = e.currentTarget.getAttribute("data-registration-id");
        console.log('Edit button clicked for registration ID:', registrationId);
        console.log('Navigating to:', `./edit-participant.html?id=${registrationId}`);
        window.location.href = `./edit-participant.html?id=${registrationId}`;
      });
    });
  }

  // Attach event listeners to table buttons
  attachTableEventListeners() {
    this.attachCardEventListeners(); // Same logic
  }

  // Setup main event listeners
  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById("search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.currentFilters.search = e.target.value;
        this.applyFilters();
      });
    }

    // Event filter
    const eventFilter = document.getElementById("event-filter");
    if (eventFilter) {
      eventFilter.addEventListener("change", (e) => {
        this.currentFilters.event = e.target.value;
        this.applyFilters();
      });
    }

    // Status filter
    const statusFilter = document.getElementById("status-filter");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.currentFilters.status = e.target.value;
        this.applyFilters();
      });
    }
  }

  // Open view details modal
  // Removed - using separate pages now

  // Create view modal content HTML
  createViewModalContent(registration) {
    const statusBadgeClass = UIUtils.getStatusBadgeClass(registration.status);
    const paymentStatusBadgeClass = UIUtils.getStatusBadgeClass(
      registration.paymentStatus
    );

    return `
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          Participant Details
        </h3>
      </div>
      
      <div class="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <!-- Participant Information -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Participant Information
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</label>
              <p class="text-gray-900 dark:text-white">${registration.participant.firstName}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</label>
              <p class="text-gray-900 dark:text-white">${registration.participant.lastName}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <p class="text-gray-900 dark:text-white">${registration.participant.email}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
              <p class="text-gray-900 dark:text-white">${registration.participant.phone}</p>
            </div>
            ${
              registration.participant.organization
                ? `
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Organization</label>
              <p class="text-gray-900 dark:text-white">${registration.participant.organization}</p>
            </div>
            `
                : ""
            }
            ${
              registration.participant.jobTitle
                ? `
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title</label>
              <p class="text-gray-900 dark:text-white">${registration.participant.jobTitle}</p>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <!-- Registration Details -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Registration Details
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Event</label>
              <p class="text-gray-900 dark:text-white">${registration.eventDetails?.title || "Unknown"}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</label>
              <p class="text-gray-900 dark:text-white">${UIUtils.formatDateTime(registration.registrationDate)}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
              <p><span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass}">${registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}</span></p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Ticket Type</label>
              <p class="text-gray-900 dark:text-white">${registration.ticketType.charAt(0).toUpperCase() + registration.ticketType.slice(1).replace("-", " ")}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</label>
              <p><span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusBadgeClass}">${registration.paymentStatus.charAt(0).toUpperCase() + registration.paymentStatus.slice(1)}</span></p>
            </div>
            ${
              registration.paymentAmount > 0
                ? `
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Amount</label>
              <p class="text-gray-900 dark:text-white">${UIUtils.formatCurrency(registration.paymentAmount)}</p>
            </div>
            `
                : ""
            }
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Checked In</label>
              <p class="text-gray-900 dark:text-white">${registration.checkedIn ? "Yes" : "No"}${registration.checkInTime ? ` (${UIUtils.formatDateTime(registration.checkInTime)})` : ""}</p>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        ${
          registration.dietaryRestrictions ||
          registration.specialRequests ||
          registration.emergencyContact?.name
            ? `
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Additional Information
          </h4>
          <div class="grid grid-cols-1 gap-4">
            ${
              registration.dietaryRestrictions
                ? `
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Dietary Restrictions</label>
              <p class="text-gray-900 dark:text-white">${registration.dietaryRestrictions}</p>
            </div>
            `
                : ""
            }
            ${
              registration.specialRequests
                ? `
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Special Requests</label>
              <p class="text-gray-900 dark:text-white">${registration.specialRequests}</p>
            </div>
            `
                : ""
            }
            ${
              registration.emergencyContact?.name
                ? `
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Contact</label>
              <p class="text-gray-900 dark:text-white">
                ${registration.emergencyContact.name}
                ${registration.emergencyContact.phone ? ` - ${registration.emergencyContact.phone}` : ""}
                ${registration.emergencyContact.relationship ? ` (${registration.emergencyContact.relationship})` : ""}
              </p>
            </div>
            `
                : ""
            }
          </div>
        </div>
        `
            : ""
        }
      </div>

      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        ${
          !registration.checkedIn
            ? `
        <button
          id="checkin-btn"
          class="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Check In
        </button>
        `
            : ""
        }
        <button
          id="close-view-modal"
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200"
        >
          Close
        </button>
      </div>
    `;
  }

  // Setup view modal event listeners
  setupViewModalListeners() {
    const closeBtn = document.getElementById("close-view-modal");
    const modal = document.getElementById("view-modal");
    const modalContent = document.getElementById("view-modal-content");
    const checkinBtn = document.getElementById("checkin-btn");

    const closeModal = () => {
      modal.classList.add("hidden");
      modal.style.display = "none";
    };

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    if (checkinBtn) {
      checkinBtn.addEventListener("click", () => this.handleCheckIn());
    }

    // Close on background click (clicking outside the modal content)
    modal.addEventListener("click", (e) => {
      if (e.target === modal || (e.target.classList && e.target.classList.contains('flex'))) {
        closeModal();
      }
    });

    // Prevent modal from closing when clicking inside the content
    if (modalContent) {
      modalContent.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  }

  // Handle check-in
  async handleCheckIn() {
    if (!this.selectedRegistration) return;

    try {
      await API.checkInParticipant(this.selectedRegistration._id);
      UIUtils.showToast("Participant checked in successfully!", "success");

      // Close modal and reload data
      const modal = document.getElementById("view-modal");
      modal.classList.add("hidden");
      modal.style.display = "none";
      await this.loadAllRegistrations();
      this.applyFilters();
    } catch (error) {
      console.error("Error checking in participant:", error);
      UIUtils.showToast(error.message || "Failed to check in participant", "error");
    }
  }

  // Open edit modal
  openEditModal(registrationId) {
    try {
      console.log("=== openEditModal START ===");
      console.log("openEditModal called with ID:", registrationId);
      
      const registration = this.filteredRegistrations.find(
        (r) => r._id === registrationId
      );
      
      if (!registration) {
        console.error("Registration not found with ID:", registrationId);
        UIUtils.showToast("Registration not found", "error");
        return;
      }

      console.log("Found registration:", registration);
      this.selectedRegistration = registration;

      const modal = document.getElementById("edit-modal");
      const form = document.getElementById("edit-form");
      
      console.log("Edit modal element:", modal);
      console.log("Edit form element:", form);
      
      if (!modal) {
        console.error("Edit modal element not found!");
        UIUtils.showToast("Edit modal element not found in DOM", "error");
        return;
      }
      
      if (!form) {
        console.error("Edit form element not found!");
        UIUtils.showToast("Edit form element not found in DOM", "error");
        return;
      }

      // Populate form with registration data
      console.log("Populating edit form...");
      this.populateEditForm(registration);
      console.log("Edit form populated");

      // Show modal - just remove hidden class, CSS will handle the rest
      console.log("Removing hidden class...");
      modal.classList.remove("hidden");
      console.log("Adding flex display...");
      modal.style.display = "flex"; // Use flex instead of block
      modal.style.alignItems = "center";
      modal.style.justifyContent = "center";
      console.log("Edit modal should be visible now");
      console.log("Edit modal classes:", modal.className);
      console.log("Edit modal display:", modal.style.display);
      console.log("Edit modal computed style display:", window.getComputedStyle(modal).display);

      // Setup modal listeners
      console.log("Setting up edit modal event listeners...");
      this.setupEditModalListeners();
      console.log("=== openEditModal END ===");
    } catch (error) {
      console.error("Error in openEditModal:", error);
      console.error("Error stack:", error.stack);
      UIUtils.showToast("Error opening edit modal: " + error.message, "error");
    }
  }

  // Populate edit form with registration data
  populateEditForm(registration) {
    document.getElementById("edit-firstName").value =
      registration.participant.firstName;
    document.getElementById("edit-lastName").value =
      registration.participant.lastName;
    document.getElementById("edit-email").value =
      registration.participant.email;
    document.getElementById("edit-phone").value =
      registration.participant.phone;
    document.getElementById("edit-organization").value =
      registration.participant.organization || "";
    document.getElementById("edit-jobTitle").value =
      registration.participant.jobTitle || "";
    document.getElementById("edit-status").value = registration.status;
    document.getElementById("edit-ticketType").value = registration.ticketType;
    document.getElementById("edit-paymentStatus").value =
      registration.paymentStatus;
    document.getElementById("edit-paymentAmount").value =
      registration.paymentAmount || 0;
    document.getElementById("edit-dietaryRestrictions").value =
      registration.dietaryRestrictions || "";
    document.getElementById("edit-specialRequests").value =
      registration.specialRequests || "";
    document.getElementById("edit-emergencyName").value =
      registration.emergencyContact?.name || "";
    document.getElementById("edit-emergencyPhone").value =
      registration.emergencyContact?.phone || "";
    document.getElementById("edit-emergencyRelationship").value =
      registration.emergencyContact?.relationship || "";
  }

  // Setup edit modal event listeners
  setupEditModalListeners() {
    const form = document.getElementById("edit-form");
    const closeBtn = document.getElementById("close-edit-modal");
    const cancelBtn = document.getElementById("cancel-edit");
    const modal = document.getElementById("edit-modal");
    const modalWrapper = modal.querySelector(".flex");

    const closeModal = () => {
      modal.classList.add("hidden");
      modal.style.display = "none";
    };

    if (form) {
      form.removeEventListener("submit", this.boundHandleEditSubmit);
      this.boundHandleEditSubmit = (e) => this.handleEditSubmit(e);
      form.addEventListener("submit", this.boundHandleEditSubmit);
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", closeModal);
    }

    // Close on background click (clicking outside the modal content)
    modal.addEventListener("click", (e) => {
      if (e.target === modal || (e.target.classList && e.target.classList.contains('flex'))) {
        closeModal();
      }
    });

    // Prevent modal from closing when clicking inside the content
    if (modalWrapper) {
      const modalContent = modalWrapper.querySelector(".relative");
      if (modalContent) {
        modalContent.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      }
    }
  }

  // Handle edit form submission
  async handleEditSubmit(e) {
    e.preventDefault();

    if (!this.selectedRegistration) return;

    try {
      const formData = {
        participant: {
          firstName: document.getElementById("edit-firstName").value,
          lastName: document.getElementById("edit-lastName").value,
          email: document.getElementById("edit-email").value,
          phone: document.getElementById("edit-phone").value,
          organization: document.getElementById("edit-organization").value,
          jobTitle: document.getElementById("edit-jobTitle").value,
        },
        status: document.getElementById("edit-status").value,
        ticketType: document.getElementById("edit-ticketType").value,
        paymentStatus: document.getElementById("edit-paymentStatus").value,
        paymentAmount: parseFloat(
          document.getElementById("edit-paymentAmount").value
        ),
        dietaryRestrictions: document.getElementById(
          "edit-dietaryRestrictions"
        ).value,
        specialRequests: document.getElementById("edit-specialRequests").value,
        emergencyContact: {
          name: document.getElementById("edit-emergencyName").value,
          phone: document.getElementById("edit-emergencyPhone").value,
          relationship: document.getElementById("edit-emergencyRelationship")
            .value,
        },
      };

      await API.updateRegistration(this.selectedRegistration._id, formData);
      UIUtils.showToast("Registration updated successfully!", "success");

      // Close modal and reload data
      const modal = document.getElementById("edit-modal");
      modal.classList.add("hidden");
      modal.style.display = "none";
      await this.loadAllRegistrations();
      this.applyFilters();
    } catch (error) {
      console.error("Error updating registration:", error);
      UIUtils.showToast(
        error.message || "Failed to update registration",
        "error"
      );
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const manager = new ParticipantsManager();
  manager.init();
});
