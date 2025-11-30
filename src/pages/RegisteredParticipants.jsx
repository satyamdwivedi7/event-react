import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import apiService from '../services/apiService';

const RegisteredParticipants = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEventAndRegistrations();
  }, [id]);

  const fetchEventAndRegistrations = async () => {
    try {
      // Fetch event details
      const eventResponse = await apiService.getEventById(id, true);
      const eventData = eventResponse.data || eventResponse;
      setEvent(eventData);

      // Fetch registrations for this event
      const registrationsResponse = await apiService.getEventRegistrations(id);
      const registrationsData = registrationsResponse.data?.registrations || registrationsResponse.registrations || registrationsResponse.data || [];
      setRegistrations(registrationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (filter === 'all') return true;
    return reg.status === filter;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Organization', 'Registration Date', 'Status'];
    const rows = registrations.map(reg => [
      `${reg.participant?.firstName} ${reg.participant?.lastName}`,
      reg.participant?.email,
      reg.participant?.phone || '',
      reg.participant?.organization || '',
      new Date(reg.createdAt).toLocaleDateString(),
      reg.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title || 'event'}-participants.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Loading participants...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-400 text-xl mb-4">{error}</p>
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
          <div>
            <Link to="/admin/events" className="text-blue-400 hover:text-blue-300 flex items-center mb-2">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Events
            </Link>
            <h1 className="text-3xl font-bold text-white">{event?.title}</h1>
            <p className="text-gray-400 mt-1">Registered Participants</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/admin/events/${id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              View Event Details
            </Link>
            {registrations.length > 0 && (
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Registrations</p>
            <p className="text-3xl font-bold text-white">{registrations.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Confirmed</p>
            <p className="text-3xl font-bold text-green-400">
              {registrations.filter(r => r.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">
              {registrations.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Capacity</p>
            <p className="text-3xl font-bold text-blue-400">
              {event?.capacity ? `${registrations.length}/${event.capacity}` : '∞'}
            </p>
          </div>
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
            All ({registrations.length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 -mb-px ${
              filter === 'confirmed'
                ? 'border-b-2 border-green-500 text-green-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Confirmed ({registrations.filter(r => r.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 -mb-px ${
              filter === 'pending'
                ? 'border-b-2 border-yellow-500 text-yellow-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Pending ({registrations.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 -mb-px ${
              filter === 'cancelled'
                ? 'border-b-2 border-red-500 text-red-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Cancelled ({registrations.filter(r => r.status === 'cancelled').length})
          </button>
        </div>

        {/* Participants Table */}
        {filteredRegistrations.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredRegistrations.map((registration) => (
                    <tr key={registration._id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {registration.participant?.firstName} {registration.participant?.lastName}
                        </div>
                        {registration.dietaryRestrictions && (
                          <div className="text-xs text-gray-400">
                            Diet: {registration.dietaryRestrictions}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{registration.participant?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {registration.participant?.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {registration.participant?.organization || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {new Date(registration.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          registration.status === 'confirmed'
                            ? 'bg-green-500 bg-opacity-20 text-green-400'
                            : registration.status === 'pending'
                            ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                            : 'bg-red-500 bg-opacity-20 text-red-400'
                        }`}>
                          {registration.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <p className="text-gray-400 text-lg">No participants found</p>
            <p className="text-gray-500 text-sm mt-2">
              {filter !== 'all' ? 'Try changing the filter' : 'Registrations will appear here once users sign up'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RegisteredParticipants;
