import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    category: 'conference',
    locationType: 'in-person',
    ticketType: 'free',
    capacity: '',
    status: 'draft',
    isPublic: true,
    coverImage: '',
    // Venue fields
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueState: '',
    venueZip: '',
    venueCountry: '',
    // Virtual details
    virtualPlatform: '',
    virtualMeetingUrl: '',
    virtualMeetingId: '',
    virtualAccessCode: '',
    // Pricing
    currency: 'USD',
    regularPrice: '',
    earlyBirdPrice: '',
    earlyBirdDeadline: '',
  });

  useEffect(() => {
    if (isEditMode) {
      fetchEventData();
    }
  }, [id]);

  const fetchEventData = async () => {
    try {
      const response = await apiService.getEventById(id, true);
      const event = response.data || response;
      
      // Format dates for datetime-local input
      const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        title: event.title || '',
        description: event.description || '',
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(event.endDate),
        registrationDeadline: formatDateForInput(event.registrationDeadline),
        category: event.category || 'conference',
        locationType: event.locationType || 'in-person',
        ticketType: event.ticketType || 'free',
        capacity: event.capacity || '',
        status: event.status || 'draft',
        isPublic: event.isPublic !== undefined ? event.isPublic : true,
        coverImage: event.coverImage || '',
        // Venue
        venueName: event.venue?.name || '',
        venueAddress: event.venue?.address || '',
        venueCity: event.venue?.city || '',
        venueState: event.venue?.state || '',
        venueZip: event.venue?.zip || '',
        venueCountry: event.venue?.country || '',
        // Virtual
        virtualPlatform: event.virtualDetails?.platform || '',
        virtualMeetingUrl: event.virtualDetails?.meetingUrl || '',
        virtualMeetingId: event.virtualDetails?.meetingId || '',
        virtualAccessCode: event.virtualDetails?.accessCode || '',
        // Pricing
        currency: event.pricing?.currency || 'USD',
        regularPrice: event.pricing?.regularPrice || '',
        earlyBirdPrice: event.pricing?.earlyBirdPrice || '',
        earlyBirdDeadline: formatDateForInput(event.pricing?.earlyBirdDeadline),
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event data');
      navigate('/admin/events');
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Current user from context:', user);
    console.log('User ID:', user?.id);

    try {
      // Build event data object
      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        category: formData.category,
        locationType: formData.locationType,
        ticketType: formData.ticketType,
        status: formData.status,
        isPublic: formData.isPublic,
        organizer: user ? user.id : null, // Send user ID, not name
      };
      
      console.log('Event data being sent:', eventData);

      // Add optional fields only if they have values
      if (formData.registrationDeadline) {
        eventData.registrationDeadline = formData.registrationDeadline;
      }
      if (formData.capacity) {
        eventData.capacity = parseInt(formData.capacity);
      }
      if (formData.coverImage) {
        eventData.coverImage = formData.coverImage;
      }

      // Add venue if any venue field is filled
      if (formData.venueName || formData.venueAddress || formData.venueCity) {
        eventData.venue = {};
        if (formData.venueName) eventData.venue.name = formData.venueName;
        if (formData.venueAddress) eventData.venue.address = formData.venueAddress;
        if (formData.venueCity) eventData.venue.city = formData.venueCity;
        if (formData.venueState) eventData.venue.state = formData.venueState;
        if (formData.venueZip) eventData.venue.zip = formData.venueZip;
        if (formData.venueCountry) eventData.venue.country = formData.venueCountry;
      }

      // Add virtual details if any virtual field is filled
      if (formData.virtualPlatform || formData.virtualMeetingUrl || formData.virtualMeetingId) {
        eventData.virtualDetails = {};
        if (formData.virtualPlatform) eventData.virtualDetails.platform = formData.virtualPlatform;
        if (formData.virtualMeetingUrl) eventData.virtualDetails.meetingUrl = formData.virtualMeetingUrl;
        if (formData.virtualMeetingId) eventData.virtualDetails.meetingId = formData.virtualMeetingId;
        if (formData.virtualAccessCode) eventData.virtualDetails.accessCode = formData.virtualAccessCode;
      }

      // Add pricing if ticket type is paid
      if (formData.ticketType === 'paid' && formData.regularPrice) {
        eventData.pricing = {
          currency: formData.currency,
          regularPrice: parseFloat(formData.regularPrice),
        };
        if (formData.earlyBirdPrice) {
          eventData.pricing.earlyBirdPrice = parseFloat(formData.earlyBirdPrice);
        }
        if (formData.earlyBirdDeadline) {
          eventData.pricing.earlyBirdDeadline = formData.earlyBirdDeadline;
        }
      }

      if (isEditMode) {
        await apiService.updateEvent(id, eventData);
        toast.success('Event updated successfully!');
        navigate(`/admin/events/${id}`);
      } else {
        await apiService.createEvent(eventData);
        toast.success('Event created successfully!');
        navigate('/admin/events');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Loading event data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-gray-400">
            {isEditMode ? 'Update event details' : 'Fill in the details to create a new event'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your event"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="conference">Conference</option>
                      <option value="meetup">Meetup</option>
                      <option value="sports">Sports</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-2">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    id="coverImage"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Dates and Time */}
            <div className="border-b border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Dates & Time</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-300 mb-2">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Location Settings */}
            <div className="border-b border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Location Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="locationType" className="block text-sm font-medium text-gray-300 mb-2">
                    Location Type *
                  </label>
                  <select
                    id="locationType"
                    name="locationType"
                    required
                    value={formData.locationType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="in-person">In-Person</option>
                    <option value="virtual">Virtual</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {(formData.locationType === 'in-person' || formData.locationType === 'hybrid') && (
                  <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300">Venue Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label htmlFor="venueName" className="block text-sm font-medium text-gray-300 mb-2">
                          Venue Name
                        </label>
                        <input
                          type="text"
                          id="venueName"
                          name="venueName"
                          value={formData.venueName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Conference Hall, Hotel Name, etc."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="venueAddress" className="block text-sm font-medium text-gray-300 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          id="venueAddress"
                          name="venueAddress"
                          value={formData.venueAddress}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Street address"
                        />
                      </div>
                      <div>
                        <label htmlFor="venueCity" className="block text-sm font-medium text-gray-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          id="venueCity"
                          name="venueCity"
                          value={formData.venueCity}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="venueState" className="block text-sm font-medium text-gray-300 mb-2">
                          State/Province
                        </label>
                        <input
                          type="text"
                          id="venueState"
                          name="venueState"
                          value={formData.venueState}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="venueZip" className="block text-sm font-medium text-gray-300 mb-2">
                          ZIP/Postal Code
                        </label>
                        <input
                          type="text"
                          id="venueZip"
                          name="venueZip"
                          value={formData.venueZip}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="venueCountry" className="block text-sm font-medium text-gray-300 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          id="venueCountry"
                          name="venueCountry"
                          value={formData.venueCountry}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(formData.locationType === 'virtual' || formData.locationType === 'hybrid') && (
                  <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300">Virtual Meeting Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="virtualPlatform" className="block text-sm font-medium text-gray-300 mb-2">
                          Platform
                        </label>
                        <input
                          type="text"
                          id="virtualPlatform"
                          name="virtualPlatform"
                          value={formData.virtualPlatform}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Zoom, Teams, Google Meet, etc."
                        />
                      </div>
                      <div>
                        <label htmlFor="virtualMeetingId" className="block text-sm font-medium text-gray-300 mb-2">
                          Meeting ID
                        </label>
                        <input
                          type="text"
                          id="virtualMeetingId"
                          name="virtualMeetingId"
                          value={formData.virtualMeetingId}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="virtualMeetingUrl" className="block text-sm font-medium text-gray-300 mb-2">
                          Meeting URL
                        </label>
                        <input
                          type="url"
                          id="virtualMeetingUrl"
                          name="virtualMeetingUrl"
                          value={formData.virtualMeetingUrl}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label htmlFor="virtualAccessCode" className="block text-sm font-medium text-gray-300 mb-2">
                          Access Code/Password
                        </label>
                        <input
                          type="text"
                          id="virtualAccessCode"
                          name="virtualAccessCode"
                          value={formData.virtualAccessCode}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Capacity and Pricing */}
            <div className="border-b border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Capacity & Pricing</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-300 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      min="1"
                      value={formData.capacity}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div>
                    <label htmlFor="ticketType" className="block text-sm font-medium text-gray-300 mb-2">
                      Ticket Type *
                    </label>
                    <select
                      id="ticketType"
                      name="ticketType"
                      required
                      value={formData.ticketType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                {formData.ticketType === 'paid' && (
                  <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300">Pricing Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-2">
                          Currency
                        </label>
                        <select
                          id="currency"
                          name="currency"
                          value={formData.currency}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="INR">INR</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="regularPrice" className="block text-sm font-medium text-gray-300 mb-2">
                          Regular Price *
                        </label>
                        <input
                          type="number"
                          id="regularPrice"
                          name="regularPrice"
                          min="0"
                          step="0.01"
                          value={formData.regularPrice}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="earlyBirdPrice" className="block text-sm font-medium text-gray-300 mb-2">
                          Early Bird Price
                        </label>
                        <input
                          type="number"
                          id="earlyBirdPrice"
                          name="earlyBirdPrice"
                          min="0"
                          step="0.01"
                          value={formData.earlyBirdPrice}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {formData.earlyBirdPrice && (
                        <div className="md:col-span-3">
                          <label htmlFor="earlyBirdDeadline" className="block text-sm font-medium text-gray-300 mb-2">
                            Early Bird Deadline
                          </label>
                          <input
                            type="datetime-local"
                            id="earlyBirdDeadline"
                            name="earlyBirdDeadline"
                            value={formData.earlyBirdDeadline}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status and Visibility */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Status & Visibility</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-300">
                      Public (visible to all users)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
              </button>
              <button
                type="button"
                onClick={() => navigate(isEditMode ? `/admin/events/${id}` : '/admin/events')}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateEvent;
