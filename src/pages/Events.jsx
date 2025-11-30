import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import apiService from '../services/apiService';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiService.getEvents();
      // Handle different response formats
      const events = response.data?.events || response.events || response.data || [];
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await apiService.deleteEvent(id);
        setEvents(events.filter((e) => e._id !== id));
        toast.success('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">My Events</h1>
          <Link
            to="/admin/events/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Event
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 border-b border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 -mb-px ${
              filter === 'all'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 -mb-px ${
              filter === 'published'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 -mb-px ${
              filter === 'draft'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Drafts
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              {event.bannerImage && (
                <img
                  src={event.bannerImage}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      event.status === 'published'
                        ? 'bg-green-500 bg-opacity-20 text-green-400'
                        : 'bg-gray-500 bg-opacity-20 text-gray-400'
                    }`}
                  >
                    {event.status}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {event.eventType}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {event.location || 'Online'}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/admin/events/${event._id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700 transition"
                  >
                    View
                  </Link>
                  <Link
                    to={`/admin/events/${event._id}/participants`}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white text-center rounded hover:bg-gray-600 transition"
                  >
                    Participants
                  </Link>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No events found</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Events;
