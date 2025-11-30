import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const RegistrationSuccess = () => {
  const location = useLocation();
  const { registrationId, eventTitle } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-600 mb-6">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Registration Successful!
          </h1>

          {eventTitle && (
            <p className="text-gray-300 mb-6">
              You have successfully registered for <span className="font-semibold text-white">{eventTitle}</span>
            </p>
          )}

          {registrationId && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-1">Registration ID</p>
              <p className="text-white font-mono text-sm">{registrationId}</p>
            </div>
          )}

          <p className="text-gray-400 text-sm mb-8">
            A confirmation email has been sent to your registered email address with event details.
          </p>

          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Browse More Events
            </Link>
            <Link
              to="/admin/login"
              className="block w-full px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
