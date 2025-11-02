import API from './api.js';
import AUTH from './auth.js';
import UIUtils from './utils.js';

class ViewParticipant {
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
      console.log('Loading participant with ID:', this.registrationId);
      UIUtils.showLoading('participant-content');
      
      const response = await API.getRegistration(this.registrationId);
      console.log('Full API Response:', JSON.stringify(response, null, 2));
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle backend response structure: { success: true, data: {...} }
      if (response.success && response.data) {
        this.registration = response.data;
        console.log('✅ Using response.data (success wrapper structure)');
      } else if (response.data) {
        this.registration = response.data;
        console.log('✅ Using response.data (data wrapper structure)');
      } else if (response.registration) {
        this.registration = response.registration;
        console.log('✅ Using response.registration');
      } else if (response._id) {
        // Direct registration object
        this.registration = response;
        console.log('✅ Using direct response (has _id)');
      } else {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid response structure from API');
      }
      
      console.log('Parsed Registration data:', JSON.stringify(this.registration, null, 2));
      
      if (!this.registration || !this.registration._id) {
        throw new Error('No valid registration data received');
      }
      
      this.renderParticipant();
    } catch (error) {
      console.error('Error loading participant:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        registrationId: this.registrationId
      });
      
      const container = document.getElementById('participant-content');
      if (container) {
        container.innerHTML = `
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <div class="text-red-600 dark:text-red-400 text-xl mb-2">⚠️ Error Loading Participant</div>
            <p class="text-red-700 dark:text-red-300 mb-4">${error.message}</p>
            <p class="text-sm text-red-600 dark:text-red-400 mb-4">Registration ID: ${this.registrationId}</p>
            <button 
              onclick="window.location.href='./registered-participants.html'"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Participants List
            </button>
          </div>
        `;
      }
      
      UIUtils.showToast('Failed to load participant details: ' + error.message, 'error');
    }
  }

  renderParticipant() {
    const container = document.getElementById('participant-content');
    if (!container || !this.registration) return;

    const { participant, event, status, ticketType, paymentStatus, paymentAmount, registrationDate, checkInTime, dietaryRestrictions, specialRequests, emergencyContact } = this.registration;

    const html = `
      <!-- Participant Info Card -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-white">
              ${participant.firstName} ${participant.lastName}
            </h2>
            <p class="text-gray-400 mt-1">${participant.email}</p>
          </div>
          <div class="flex gap-2">
            ${this.getStatusBadge(status)}
            ${checkInTime ? '<span class="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">✓ Checked In</span>' : ''}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Contact Information -->
          <div>
            <h3 class="text-lg font-semibold text-white mb-3">Contact Information</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-400">Phone</dt>
                <dd class="text-sm text-gray-200">${participant.phone || 'N/A'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-400">Organization</dt>
                <dd class="text-sm text-gray-200">${participant.organization || 'N/A'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-400">Job Title</dt>
                <dd class="text-sm text-gray-200">${participant.jobTitle || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          <!-- Registration Details -->
          <div>
            <h3 class="text-lg font-semibold text-white mb-3">Registration Details</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-400">Event</dt>
                <dd class="text-sm text-gray-200">${event?.title || 'N/A'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-400">Ticket Type</dt>
                <dd class="text-sm text-gray-200">${ticketType || 'N/A'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-400">Registration Date</dt>
                <dd class="text-sm text-gray-200">${new Date(registrationDate).toLocaleDateString()}</dd>
              </div>
              ${checkInTime ? `
              <div>
                <dt class="text-sm font-medium text-gray-400">Check-in Time</dt>
                <dd class="text-sm text-gray-200">${new Date(checkInTime).toLocaleString()}</dd>
              </div>
              ` : ''}
            </dl>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Payment Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt class="text-sm font-medium text-gray-400">Payment Status</dt>
            <dd class="mt-1">${this.getPaymentStatusBadge(paymentStatus)}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-400">Amount</dt>
            <dd class="mt-1 text-sm text-gray-200">$${paymentAmount?.toFixed(2) || '0.00'}</dd>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      ${dietaryRestrictions || specialRequests ? `
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Additional Information</h3>
        <dl class="space-y-4">
          ${dietaryRestrictions ? `
          <div>
            <dt class="text-sm font-medium text-gray-400">Dietary Restrictions</dt>
            <dd class="mt-1 text-sm text-gray-200">${dietaryRestrictions}</dd>
          </div>
          ` : ''}
          ${specialRequests ? `
          <div>
            <dt class="text-sm font-medium text-gray-400">Special Requests</dt>
            <dd class="mt-1 text-sm text-gray-200">${specialRequests}</dd>
          </div>
          ` : ''}
        </dl>
      </div>
      ` : ''}

      <!-- Emergency Contact -->
      ${emergencyContact?.name || emergencyContact?.phone ? `
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Emergency Contact</h3>
        <dl class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${emergencyContact.name ? `
          <div>
            <dt class="text-sm font-medium text-gray-400">Name</dt>
            <dd class="mt-1 text-sm text-gray-200">${emergencyContact.name}</dd>
          </div>
          ` : ''}
          ${emergencyContact.phone ? `
          <div>
            <dt class="text-sm font-medium text-gray-400">Phone</dt>
            <dd class="mt-1 text-sm text-gray-200">${emergencyContact.phone}</dd>
          </div>
          ` : ''}
          ${emergencyContact.relationship ? `
          <div>
            <dt class="text-sm font-medium text-gray-400">Relationship</dt>
            <dd class="mt-1 text-sm text-gray-200">${emergencyContact.relationship}</dd>
          </div>
          ` : ''}
        </dl>
      </div>
      ` : ''}

      <!-- Actions -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-white mb-6">Actions</h3>
        <div class="flex flex-wrap gap-4">
          ${status === 'pending' ? `
          <button
            id="confirm-btn"
            class="inline-flex items-center justify-center gap-2.5 px-6 py-3 text-base font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-w-[180px]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Confirm Registration</span>
          </button>
          ` : ''}
          ${status === 'confirmed' && !checkInTime ? `
          <button
            id="check-in-btn"
            class="inline-flex items-center justify-center gap-2.5 px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-w-[180px]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Check In Participant</span>
          </button>
          ` : ''}
          <button
            onclick="window.location.href='./edit-participant.html?id=${this.registrationId}'"
            class="inline-flex items-center justify-center gap-2.5 px-6 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-w-[180px]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span>Edit Details</span>
          </button>
          ${status !== 'cancelled' ? `
          <button
            id="cancel-btn"
            class="inline-flex items-center justify-center gap-2.5 px-6 py-3 text-base font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-w-[180px]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>Cancel Registration</span>
          </button>
          ` : ''}
          <button
            onclick="window.location.href='./registered-participants.html'"
            class="inline-flex items-center justify-center gap-2.5 px-6 py-3 text-base font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-w-[180px]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Back to List</span>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  getStatusBadge(status) {
    const statusClasses = {
      confirmed: 'bg-green-500 text-white',
      pending: 'bg-yellow-400 text-gray-900',
      cancelled: 'bg-red-500 text-white',
      waitlisted: 'bg-blue-500 text-white'
    };

    const statusClass = statusClasses[status] || 'bg-gray-500 text-white';
    return `<span class="px-3 py-1 text-xs font-semibold ${statusClass} rounded-full">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
  }

  getPaymentStatusBadge(paymentStatus) {
    const statusClasses = {
      paid: 'bg-green-500 text-white',
      pending: 'bg-yellow-400 text-gray-900',
      refunded: 'bg-gray-500 text-white',
      completed: 'bg-green-500 text-white'
    };

    const statusClass = statusClasses[paymentStatus] || 'bg-gray-500 text-white';
    return `<span class="px-3 py-1 text-xs font-semibold ${statusClass} rounded-full">${paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1) || 'N/A'}</span>`;
  }

  setupEventListeners() {
    // Button event listeners
    document.addEventListener('click', async (e) => {
      if (e.target.id === 'confirm-btn') {
        await this.handleConfirm();
      } else if (e.target.id === 'check-in-btn') {
        await this.handleCheckIn();
      } else if (e.target.id === 'cancel-btn') {
        await this.handleCancel();
      }
    });
  }

  async handleConfirm() {
    if (!confirm('Confirm this registration? The participant will be notified.')) return;

    try {
      await API.updateRegistrationStatus(this.registrationId, 'confirmed');
      UIUtils.showToast('Registration confirmed successfully!', 'success');
      await this.loadParticipant(); // Reload to show updated status
    } catch (error) {
      console.error('Error confirming registration:', error);
      UIUtils.showToast('Failed to confirm registration: ' + error.message, 'error');
    }
  }

  async handleCheckIn() {
    if (!confirm('Confirm check-in for this participant?')) return;

    try {
      await API.checkInParticipant(this.registrationId);
      UIUtils.showToast('Participant checked in successfully!', 'success');
      await this.loadParticipant(); // Reload to show updated status
    } catch (error) {
      console.error('Error checking in participant:', error);
      UIUtils.showToast('Failed to check in participant', 'error');
    }
  }

  async handleCancel() {
    if (!confirm('Are you sure you want to cancel this registration? This action cannot be undone.')) return;

    try {
      await API.cancelRegistration(this.registrationId);
      UIUtils.showToast('Registration cancelled successfully!', 'success');
      setTimeout(() => {
        window.location.href = './registered-participants.html';
      }, 1500);
    } catch (error) {
      console.error('Error cancelling registration:', error);
      UIUtils.showToast('Failed to cancel registration', 'error');
    }
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  const viewParticipant = new ViewParticipant();
  viewParticipant.init();
});
