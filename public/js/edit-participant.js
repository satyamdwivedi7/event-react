import API from './api.js';
import AUTH from './auth.js';
import UIUtils from './utils.js';

class EditParticipant {
  constructor() {
    this.registrationId = null;
    this.registration = null;
  }

  async init() {
    // Check authentication
    if (!AUTH.isAuthenticated()) {
      window.location.href = './login.html';
      return;
    }

    // Get registration ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.registrationId = urlParams.get('id');

    if (!this.registrationId) {
      UIUtils.showError('No participant ID provided');
      setTimeout(() => {
        window.location.href = './registered-participants.html';
      }, 2000);
      return;
    }

    await this.loadParticipant();
    this.setupEventListeners();
  }

  async loadParticipant() {
    try {
      const response = await API.getRegistration(this.registrationId);
      
      // Handle backend response structure: { success: true, data: {...} }
      if (response.success && response.data) {
        this.registration = response.data;
      } else if (response.data) {
        this.registration = response.data;
      } else if (response.registration) {
        this.registration = response.registration;
      } else if (response._id) {
        // Direct registration object
        this.registration = response;
      } else {
        throw new Error('Invalid response structure from API');
      }
      
      if (!this.registration || !this.registration._id) {
        throw new Error('No valid registration data received');
      }
      
      this.populateForm();
    } catch (error) {
      console.error('Error loading participant:', error);
      
      UIUtils.showToast('Failed to load participant details: ' + error.message, 'error');
      
      alert(`Error: ${error.message}\n\nRegistration ID: ${this.registrationId}\n\nYou will be redirected back to the participants list.`);
      
      setTimeout(() => {
        window.location.href = './registered-participants.html';
      }, 2000);
    }
  }

  populateForm() {
    if (!this.registration) return;

    const { participant, status, ticketType, paymentStatus, paymentAmount, dietaryRestrictions, specialRequests, emergencyContact } = this.registration;

    // Participant Information
    document.getElementById('firstName').value = participant.firstName || '';
    document.getElementById('lastName').value = participant.lastName || '';
    document.getElementById('email').value = participant.email || '';
    document.getElementById('phone').value = participant.phone || '';
    document.getElementById('organization').value = participant.organization || '';
    document.getElementById('jobTitle').value = participant.jobTitle || '';

    // Registration Details
    document.getElementById('status').value = status || 'pending';
    document.getElementById('ticketType').value = ticketType || '';
    document.getElementById('paymentStatus').value = paymentStatus || 'pending';
    document.getElementById('paymentAmount').value = paymentAmount || 0;

    // Additional Information
    document.getElementById('dietaryRestrictions').value = dietaryRestrictions || '';
    document.getElementById('specialRequests').value = specialRequests || '';

    // Emergency Contact
    if (emergencyContact) {
      document.getElementById('emergencyContactName').value = emergencyContact.name || '';
      document.getElementById('emergencyContactPhone').value = emergencyContact.phone || '';
      document.getElementById('emergencyContactRelationship').value = emergencyContact.relationship || '';
    }
  }

  setupEventListeners() {
    const form = document.getElementById('edit-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    try {
      const formData = {
        participant: {
          firstName: document.getElementById('firstName').value.trim(),
          lastName: document.getElementById('lastName').value.trim(),
          email: document.getElementById('email').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          organization: document.getElementById('organization').value.trim(),
          jobTitle: document.getElementById('jobTitle').value.trim()
        },
        status: document.getElementById('status').value,
        ticketType: document.getElementById('ticketType').value.trim(),
        paymentStatus: document.getElementById('paymentStatus').value,
        paymentAmount: parseFloat(document.getElementById('paymentAmount').value) || 0,
        dietaryRestrictions: document.getElementById('dietaryRestrictions').value.trim(),
        specialRequests: document.getElementById('specialRequests').value.trim(),
        emergencyContact: {
          name: document.getElementById('emergencyContactName').value.trim(),
          phone: document.getElementById('emergencyContactPhone').value.trim(),
          relationship: document.getElementById('emergencyContactRelationship').value.trim()
        }
      };

      await API.updateRegistration(this.registrationId, formData);
      UIUtils.showToast('Participant updated successfully!', 'success');
      
      // Redirect back to view page or participants list
      setTimeout(() => {
        window.location.href = `./view-participant.html?id=${this.registrationId}`;
      }, 1500);
    } catch (error) {
      console.error('Error updating participant:', error);
      UIUtils.showToast(error.message || 'Failed to update participant', 'error');
    }
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  const editParticipant = new EditParticipant();
  editParticipant.init();
});
