import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';

const PublicEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    dietaryRestrictions: '',
    specialRequests: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await apiService.getEventById(id, false);
      const eventData = response.data || response;
      
      // Check if event is published and public
      if (eventData.status !== 'published' || !eventData.isPublic) {
        setError('This event is not available');
        setLoading(false);
        return;
      }
      
      setEvent(eventData);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRegistering(true);

    console.log('Event ID from params:', id);
    console.log('Form data:', formData);

    if (!id) {
      setError('Event ID is missing');
      setRegistering(false);
      toast.error('Event ID is missing');
      return;
    }

    try {
      const registrationData = {
        eventId: id,
        participant: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
      };

      // Add optional fields only if they have values
      if (formData.organization && formData.organization.trim()) {
        registrationData.participant.organization = formData.organization.trim();
      }
      if (formData.dietaryRestrictions && formData.dietaryRestrictions.trim()) {
        registrationData.dietaryRestrictions = formData.dietaryRestrictions.trim();
      }
      if (formData.specialRequests && formData.specialRequests.trim()) {
        registrationData.specialRequests = formData.specialRequests.trim();
      }

      console.log('Sending registration data:', JSON.stringify(registrationData, null, 2));

      const response = await apiService.createRegistration(registrationData);
      console.log('Registration successful:', response);
      
      toast.success('Registration successful!');
      
      // Redirect to success page
      navigate('/registration/success', { 
        state: { 
          registrationId: response.data?._id || response._id,
          eventTitle: event.title 
        } 
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading event details...</div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isRegistrationOpen = new Date() < new Date(event.registrationDeadline);
  const isFull = event.capacity && event.totalRegistrations >= event.capacity;
  const canRegister = isRegistrationOpen && !isFull;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Events
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {event.coverImage ? (
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <h2 className="text-5xl font-bold mb-2">{event.title}</h2>
                  <p className="text-xl opacity-90 capitalize">{event.category}</p>
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full capitalize">
                  {event.category}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  event.ticketType === 'free'
                    ? 'bg-green-600 text-white'
                    : 'bg-yellow-600 text-white'
                }`}>
                  {event.ticketType === 'free' ? 'Free Event' : `${event.pricing?.currency} ${event.pricing?.regularPrice}`}
                </span>
                <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full capitalize">
                  {event.locationType}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">{event.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-400">Start Date</p>
                    <p>{new Date(event.startDate).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-400">End Date</p>
                    <p>{new Date(event.endDate).toLocaleString()}</p>
                  </div>
                </div>

                {event.locationType !== 'virtual' && event.venue && (
                  <div className="flex items-start text-gray-300">
                    <svg className="w-5 h-5 mr-3 mt-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-400">Venue</p>
                      <p>{event.venue.name}</p>
                      <p className="text-sm">{event.venue.address}, {event.venue.city}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-400">Capacity</p>
                    <p>{event.totalRegistrations || 0} / {event.capacity || '∞'} registered</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{event.description}</p>
              </div>

              {event.virtualDetails && (event.locationType === 'virtual' || event.locationType === 'hybrid') && (
                <div className="border-t border-gray-700 pt-6 mt-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Virtual Meeting Details</h2>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                    <p className="text-gray-300"><span className="text-gray-400">Platform:</span> {event.virtualDetails.platform}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Meeting ID:</span> {event.virtualDetails.meetingId}</p>
                    {event.virtualDetails.accessCode && (
                      <p className="text-gray-300"><span className="text-gray-400">Access Code:</span> {event.virtualDetails.accessCode}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-4">
              <h2 className="text-2xl font-bold text-white mb-6">Register for Event</h2>

              {!canRegister && (
                <div className="mb-4 p-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg">
                  <p className="text-red-400 text-sm">
                    {isFull ? 'This event is full' : 'Registration has closed'}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!canRegister}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!canRegister}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!canRegister}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!canRegister}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!canRegister}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    name="dietaryRestrictions"
                    value={formData.dietaryRestrictions}
                    onChange={handleChange}
                    placeholder="e.g., Vegetarian, Vegan"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!canRegister}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    rows="3"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    placeholder="Any special requirements?"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!canRegister}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canRegister || registering}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registering ? 'Registering...' : 'Register Now'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicEventDetails;
