import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import apiService from '../services/apiService';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setEvent(null);
    fetchEventDetails();
  }, [id, location.pathname]);

  const fetchEventDetails = async () => {
    try {
      const response = await apiService.getEventById(id, true);
      const eventData = response.data || response;
      setEvent(eventData);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await apiService.deleteEvent(id);
        toast.success('Event deleted successfully');
        navigate('/admin/events');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Loading event details...</div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-400 text-xl mb-4">{error || 'Event not found'}</p>
          <Link to="/admin/events" className="text-blue-400 hover:text-blue-300">
            ← Back to Events
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Link to="/admin/events" className="text-blue-400 hover:text-blue-300 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Events
          </Link>
          <div className="flex space-x-3">
            <Link
              to={`/admin/events/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Event
            </Link>
            <Link
              to={`/admin/events/${id}/participants`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              View Participants
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete Event
            </button>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <h2 className="text-5xl font-bold mb-2">{event.title}</h2>
                <p className="text-xl opacity-90 capitalize">{event.category}</p>
              </div>
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 text-sm rounded-full ${
                event.status === 'published'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-white'
              }`}>
                {event.status}
              </span>
              <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full capitalize">
                {event.category}
              </span>
              {event.ticketType && (
                <span className={`px-3 py-1 text-sm rounded-full ${
                  event.ticketType === 'free'
                    ? 'bg-green-600 text-white'
                    : 'bg-yellow-600 text-white'
                }`}>
                  {event.ticketType === 'free' ? 'Free Event' : `${event.pricing?.currency} ${event.pricing?.regularPrice}`}
                </span>
              )}
              {event.locationType && (
                <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full capitalize">
                  {event.locationType}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-white mb-6">{event.title}</h1>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center text-gray-300">
                  <svg className="w-6 h-6 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-400">Start Date</p>
                    <p className="font-semibold">{new Date(event.startDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center text-gray-300">
                  <svg className="w-6 h-6 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-400">End Date</p>
                    <p className="font-semibold">{new Date(event.endDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {event.registrationDeadline && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center text-gray-300">
                    <svg className="w-6 h-6 mr-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-400">Registration Deadline</p>
                      <p className="font-semibold">{new Date(event.registrationDeadline).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center text-gray-300">
                  <svg className="w-6 h-6 mr-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-400">Registrations / Capacity</p>
                    <p className="font-semibold">{event.totalRegistrations || 0} / {event.capacity || '∞'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Venue Information */}
            {event.venue && event.locationType !== 'virtual' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Venue</h2>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-white font-semibold mb-2">{event.venue.name}</p>
                  <p className="text-gray-300">{event.venue.address}</p>
                  <p className="text-gray-300">{event.venue.city}, {event.venue.state} {event.venue.zip}</p>
                  <p className="text-gray-300">{event.venue.country}</p>
                </div>
              </div>
            )}

            {/* Virtual Details */}
            {event.virtualDetails && (event.locationType === 'virtual' || event.locationType === 'hybrid') && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Virtual Meeting Details</h2>
                <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                  <p className="text-gray-300">
                    <span className="text-gray-400">Platform:</span>{' '}
                    <span className="font-semibold">{event.virtualDetails.platform}</span>
                  </p>
                  {event.virtualDetails.meetingUrl && (
                    <p className="text-gray-300">
                      <span className="text-gray-400">Meeting URL:</span>{' '}
                      <a href={event.virtualDetails.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                        {event.virtualDetails.meetingUrl}
                      </a>
                    </p>
                  )}
                  {event.virtualDetails.meetingId && (
                    <p className="text-gray-300">
                      <span className="text-gray-400">Meeting ID:</span>{' '}
                      <span className="font-mono">{event.virtualDetails.meetingId}</span>
                    </p>
                  )}
                  {event.virtualDetails.accessCode && (
                    <p className="text-gray-300">
                      <span className="text-gray-400">Access Code:</span>{' '}
                      <span className="font-mono">{event.virtualDetails.accessCode}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            {event.pricing && event.ticketType === 'paid' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Pricing</h2>
                <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                  <p className="text-gray-300">
                    <span className="text-gray-400">Regular Price:</span>{' '}
                    <span className="font-semibold">{event.pricing.currency} {event.pricing.regularPrice}</span>
                  </p>
                  {event.pricing.earlyBirdPrice && (
                    <>
                      <p className="text-gray-300">
                        <span className="text-gray-400">Early Bird Price:</span>{' '}
                        <span className="font-semibold">{event.pricing.currency} {event.pricing.earlyBirdPrice}</span>
                      </p>
                      {event.pricing.earlyBirdDeadline && (
                        <p className="text-gray-300">
                          <span className="text-gray-400">Early Bird Deadline:</span>{' '}
                          <span>{new Date(event.pricing.earlyBirdDeadline).toLocaleDateString()}</span>
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Organizer */}
            {event.organizer && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Organizer</h2>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-white font-semibold">
                    {typeof event.organizer === 'object' 
                      ? event.organizer.email || event.organizer.firstName + ' ' + event.organizer.lastName || event.organizer._id
                      : event.organizer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetails;
