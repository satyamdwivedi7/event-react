import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import apiService from '../services/apiService';

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);

  useEffect(() => {
    fetchPublishedEvents();
  }, []);

  const fetchPublishedEvents = async () => {
    try {
      const response = await apiService.getEvents({ status: 'published' });
      // Handle different response formats
      const events = response.data?.events || response.events || response.data || [];
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setRegistering(eventId);
    try {
      await apiService.createRegistration({ eventId });
      alert('Successfully registered for the event!');
      fetchPublishedEvents();
    } catch (error) {
      console.error('Error registering:', error);
      alert(error.message || 'Failed to register');
    } finally {
      setRegistering(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Browse Events</h1>
          <p className="text-gray-400">Discover and register for upcoming events</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition">
              {event.bannerImage && (
                <img
                  src={event.bannerImage}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 rounded text-xs bg-blue-500 bg-opacity-20 text-blue-400">
                    {event.eventType}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {event.capacity ? `${event.registrationCount || 0}/${event.capacity}` : '∞'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {event.location || 'Online'}
                  </div>
                </div>
                <button
                  onClick={() => handleRegister(event._id)}
                  disabled={registering === event._id}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {registering === event._id ? 'Registering...' : 'Register Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No published events available at the moment</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrowseEvents;
