// Create Event Page Integration
import API from "./api.js";
import AUTH from "./auth.js";
import UIUtils from "./utils.js";

class CreateEventPage {
  constructor() {
    this.user = AUTH.getUser();
    this.form = document.querySelector("form");
    this.eventId = this.getEventIdFromURL();
    this.isEditMode = !!this.eventId;
    this.init();
  }

  getEventIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  async init() {
    this.setupEventListeners();
    this.initializeFormState();
    
    // If in edit mode, load existing event data
    if (this.isEditMode) {
      await this.loadEventData();
      this.updateUIForEditMode();
    }
  }

  setupEventListeners() {
    // Form submission
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Location type change
    const locationTypeRadios = document.querySelectorAll(
      'input[name="location-type"]'
    );
    locationTypeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => this.handleLocationTypeChange(e));
    });

    // Ticket type change
    const ticketTypeRadios = document.querySelectorAll(
      'input[name="ticket-type"]'
    );
    ticketTypeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => this.handleTicketTypeChange(e));
    });

    // Save as draft button
    const draftButton = this.form.querySelector('button[type="button"]');
    draftButton.addEventListener("click", () => this.handleSaveAsDraft());
  }

  initializeFormState() {
    // Set default location type
    this.handleLocationTypeChange({
      target: document.querySelector('input[name="location-type"]:checked'),
    });

    // Set default ticket type
    this.handleTicketTypeChange({
      target: document.querySelector('input[name="ticket-type"]:checked'),
    });

    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("start-date").min = today;
    document.getElementById("end-date").min = today;
    document.getElementById("registration-deadline").min = today;
  }

  async loadEventData() {
    try {
      const response = await API.getEventById(this.eventId);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to load event data");
      }

      const event = response.data;
      this.populateForm(event);
    } catch (error) {
      console.error("Error loading event data:", error);
      UIUtils.showToast(error.message || "Failed to load event data", "error");
      // Redirect back to events page after a delay
      setTimeout(() => {
        window.location.href = "events.html";
      }, 2000);
    }
  }

  populateForm(event) {
    // Basic Information
    document.getElementById("event-name").value = event.title || "";
    document.getElementById("description").value = event.description || "";
    document.getElementById("category").value = event.category || "";
    document.getElementById("capacity").value = event.capacity || "";

    // Date & Time
    if (event.startDate) {
      const startDate = new Date(event.startDate);
      document.getElementById("start-date").value = startDate.toISOString().split("T")[0];
      document.getElementById("start-time").value = startDate.toTimeString().slice(0, 5);
    }

    if (event.endDate) {
      const endDate = new Date(event.endDate);
      document.getElementById("end-date").value = endDate.toISOString().split("T")[0];
      document.getElementById("end-time").value = endDate.toTimeString().slice(0, 5);
    }

    if (event.registrationDeadline) {
      const regDeadline = new Date(event.registrationDeadline);
      document.getElementById("registration-deadline").value = regDeadline.toISOString().split("T")[0];
    }

    document.getElementById("timezone").value = event.timezone || "UTC";

    // Location Type
    const locationRadio = document.querySelector(`input[name="location-type"][value="${event.locationType}"]`);
    if (locationRadio) {
      locationRadio.checked = true;
      this.handleLocationTypeChange({ target: locationRadio });
    }

    // Venue Information
    if (event.venue) {
      document.getElementById("venue-name").value = event.venue.name || "";
      document.getElementById("address").value = event.venue.address || "";
      document.getElementById("city").value = event.venue.city || "";
      document.getElementById("state").value = event.venue.state || "";
      document.getElementById("zip").value = event.venue.zipCode || "";
    }

    // Virtual Details
    if (event.virtualDetails) {
      document.getElementById("meeting-url").value = event.virtualDetails.meetingUrl || "";
      document.getElementById("meeting-id").value = event.virtualDetails.meetingId || "";
    }

    // Ticket Type
    const ticketRadio = document.querySelector(`input[name="ticket-type"][value="${event.ticketType}"]`);
    if (ticketRadio) {
      ticketRadio.checked = true;
      this.handleTicketTypeChange({ target: ticketRadio });
    }

    // Pricing
    if (event.pricing && event.ticketType === "paid") {
      document.getElementById("ticket-price").value = event.pricing.regularPrice || "";
      document.getElementById("early-bird-price").value = event.pricing.earlyBirdPrice || "";
      
      if (event.pricing.earlyBirdDeadline) {
        const ebDeadline = new Date(event.pricing.earlyBirdDeadline);
        document.getElementById("early-bird-deadline").value = ebDeadline.toISOString().split("T")[0];
      }
    }

    // Additional Options
    document.getElementById("requires-approval").checked = event.requiresApproval || false;
    document.getElementById("allow-waitlist").checked = event.allowWaitlist !== undefined ? event.allowWaitlist : true;
    document.getElementById("send-reminders").checked = event.sendReminders !== undefined ? event.sendReminders : true;
    document.getElementById("public-event").checked = event.isPublic !== undefined ? event.isPublic : true;
  }

  updateUIForEditMode() {
    // Update page title
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) {
      pageTitle.textContent = "Edit Event";
    }

    // Update submit button text
    const submitButton = this.form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = "Update Event";
    }

    // Update draft button text
    const draftButton = this.form.querySelector('button[type="button"]');
    if (draftButton) {
      draftButton.textContent = "Save Changes as Draft";
    }
  }

  handleLocationTypeChange(e) {
    const locationType = e.target.value;
    const physicalLocation = document.getElementById("physical-location");
    const virtualLocation = document.getElementById("virtual-location");

    if (locationType === "virtual") {
      physicalLocation.classList.add("hidden");
      virtualLocation.classList.remove("hidden");
      this.setLocationFieldsRequired(false, true);
    } else if (locationType === "in-person") {
      physicalLocation.classList.remove("hidden");
      virtualLocation.classList.add("hidden");
      this.setLocationFieldsRequired(true, false);
    } else if (locationType === "hybrid") {
      physicalLocation.classList.remove("hidden");
      virtualLocation.classList.remove("hidden");
      this.setLocationFieldsRequired(true, true);
    }
  }

  setLocationFieldsRequired(physical, virtual) {
    // Physical location fields
    const physicalFields = ["venue-name", "address", "city"];
    physicalFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) field.required = physical;
    });

    // Virtual location fields
    const virtualFields = ["meeting-url"];
    virtualFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) field.required = virtual;
    });
  }

  handleTicketTypeChange(e) {
    const ticketType = e.target.value;
    const pricingSection = document.getElementById("pricing-section");

    if (ticketType === "paid") {
      pricingSection.classList.remove("hidden");
      document.getElementById("ticket-price").required = true;
    } else {
      pricingSection.classList.add("hidden");
      document.getElementById("ticket-price").required = false;
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    try {
      // Validate form
      if (!this.validateForm()) {
        return;
      }

      // Show loading state
      const submitButton = this.form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = this.isEditMode ? "Updating Event..." : "Creating Event...";

      // Prepare event data
      const eventData = this.prepareEventData("published");

      // Create or update event
      const response = this.isEditMode
        ? await API.updateEvent(this.eventId, eventData)
        : await API.createEvent(eventData);

      if (response.success) {
        UIUtils.showToast(
          this.isEditMode ? "Event updated successfully!" : "Event created successfully!",
          "success"
        );
        
        // Redirect to events page after a short delay
        setTimeout(() => {
          window.location.href = "events.html";
        }, 1500);
      } else {
        throw new Error(response.message || `Failed to ${this.isEditMode ? "update" : "create"} event`);
      }
    } catch (error) {
      console.error(`Error ${this.isEditMode ? "updating" : "creating"} event:`, error);
      UIUtils.showToast(
        error.message || `Failed to ${this.isEditMode ? "update" : "create"} event`,
        "error"
      );

      // Reset button state
      const submitButton = this.form.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.textContent = this.isEditMode ? "Update Event" : "Create Event";
    }
  }

  async handleSaveAsDraft() {
    try {
      // Validate required fields only
      const requiredFields = this.form.querySelectorAll("[required]");
      let isValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
        }
      });

      if (!isValid) {
        UIUtils.showToast(
          "Please fill in all required fields before saving",
          "error"
        );
        return;
      }

      // Show loading state
      const draftButton = this.form.querySelector('button[type="button"]');
      const originalText = draftButton.textContent;
      draftButton.disabled = true;
      draftButton.textContent = "Saving...";

      // Prepare event data with draft status
      const eventData = this.prepareEventData("draft");

      // Create or update event as draft
      const response = this.isEditMode
        ? await API.updateEvent(this.eventId, eventData)
        : await API.createEvent(eventData);

      if (response.success) {
        UIUtils.showToast(
          this.isEditMode ? "Changes saved as draft successfully!" : "Event saved as draft successfully!",
          "success"
        );
        
        // Redirect to events page after a short delay
        setTimeout(() => {
          window.location.href = "events.html";
        }, 1500);
      } else {
        throw new Error(response.message || "Failed to save event as draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      UIUtils.showToast(error.message || "Failed to save draft", "error");

      // Reset button state
      const draftButton = this.form.querySelector('button[type="button"]');
      draftButton.disabled = false;
      draftButton.textContent = this.isEditMode ? "Save Changes as Draft" : "Save as Draft";
    }
  }

  prepareEventData(status = "draft") {
    // Get form values
    const formData = new FormData(this.form);

    // Combine date and time
    const startDate = formData.get("start-date");
    const startTime = formData.get("start-time");
    const endDate = formData.get("end-date");
    const endTime = formData.get("end-time");

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    // Get location type
    const locationType = formData.get("location-type");

    // Prepare base event data
    const eventData = {
      title: formData.get("event-name"),
      description: formData.get("description"),
      category: formData.get("category"),
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      timezone: formData.get("timezone") || "UTC",
      locationType: locationType,
      capacity: parseInt(formData.get("capacity")),
      ticketType: formData.get("ticket-type"),
      status: status,
      requiresApproval: document.getElementById("requires-approval").checked,
      allowWaitlist: document.getElementById("allow-waitlist").checked,
      sendReminders: document.getElementById("send-reminders").checked,
      isPublic: document.getElementById("public-event").checked,
    };

    // Add organizer only when creating new event (not when editing)
    if (!this.isEditMode) {
      eventData.organizer = this.user._id || this.user.id;
    }

    // Add venue information for in-person or hybrid events
    if (locationType === "in-person" || locationType === "hybrid") {
      eventData.venue = {
        name: formData.get("venue-name") || "",
        address: formData.get("address") || "",
        city: formData.get("city") || "",
        state: formData.get("state") || "",
        zipCode: formData.get("zip") || "",
        country: "USA", // Default country
      };
    }

    // Add virtual details for virtual or hybrid events
    if (locationType === "virtual" || locationType === "hybrid") {
      const meetingIdValue = formData.get("meeting-id") || "";
      eventData.virtualDetails = {
        meetingUrl: formData.get("meeting-url") || "",
        meetingId: meetingIdValue,
        accessCode: meetingIdValue, // Use same value for accessCode
        platform: this.detectPlatform(formData.get("meeting-url") || ""),
      };
    }

    // Add pricing information for paid events
    if (formData.get("ticket-type") === "paid") {
      const regularPrice = parseFloat(formData.get("ticket-price")) || 0;
      const earlyBirdPrice = parseFloat(formData.get("early-bird-price")) || regularPrice;
      const earlyBirdDeadline = formData.get("early-bird-deadline");

      eventData.pricing = {
        regularPrice: regularPrice,
        earlyBirdPrice: earlyBirdPrice,
        currency: "USD",
      };

      if (earlyBirdDeadline) {
        eventData.pricing.earlyBirdDeadline = new Date(earlyBirdDeadline).toISOString();
      }
    }

    // Set registration deadline
    const registrationDeadlineInput = formData.get("registration-deadline");
    if (registrationDeadlineInput) {
      // Use the provided registration deadline
      eventData.registrationDeadline = new Date(registrationDeadlineInput).toISOString();
    } else {
      // Default to one day before start date if not specified
      const registrationDeadline = new Date(startDateTime);
      registrationDeadline.setDate(registrationDeadline.getDate() - 1);
      eventData.registrationDeadline = registrationDeadline.toISOString();
    }

    return eventData;
  }

  detectPlatform(url) {
    if (url.includes("zoom.us")) return "Zoom";
    if (url.includes("meet.google.com")) return "Google Meet";
    if (url.includes("teams.microsoft.com")) return "Microsoft Teams";
    if (url.includes("webex.com")) return "Webex";
    return "Other";
  }

  validateForm() {
    // Check if end date is after start date
    const startDate = new Date(
      `${document.getElementById("start-date").value}T${
        document.getElementById("start-time").value
      }`
    );
    const endDate = new Date(
      `${document.getElementById("end-date").value}T${
        document.getElementById("end-time").value
      }`
    );

    if (endDate <= startDate) {
      UIUtils.showToast("End date must be after start date", "error");
      return false;
    }

    // Check if registration deadline is before start date (if provided)
    const registrationDeadlineInput = document.getElementById("registration-deadline").value;
    if (registrationDeadlineInput) {
      const registrationDeadline = new Date(registrationDeadlineInput);
      if (registrationDeadline >= startDate) {
        UIUtils.showToast(
          "Registration deadline must be before event start date",
          "error"
        );
        return false;
      }
    }

    // Check if early bird deadline is before start date (if applicable)
    const earlyBirdDeadline = document.getElementById("early-bird-deadline").value;
    if (earlyBirdDeadline) {
      const deadline = new Date(earlyBirdDeadline);
      if (deadline >= startDate) {
        UIUtils.showToast(
          "Early bird deadline must be before event start date",
          "error"
        );
        return false;
      }
    }

    // Check if early bird price is less than regular price (if applicable)
    const ticketType = document.querySelector('input[name="ticket-type"]:checked').value;
    if (ticketType === "paid") {
      const regularPrice = parseFloat(document.getElementById("ticket-price").value) || 0;
      const earlyBirdPrice = parseFloat(document.getElementById("early-bird-price").value);

      if (earlyBirdPrice && earlyBirdPrice >= regularPrice) {
        UIUtils.showToast(
          "Early bird price must be less than regular price",
          "error"
        );
        return false;
      }
    }

    return true;
  }
}

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CreateEventPage();
});
