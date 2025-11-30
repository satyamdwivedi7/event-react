import React, { useState, useEffect } from 'react';
import API_CONFIG from '../utils/config';
import apiService from '../services/apiService';

const APITestPanel = () => {
  const [apiStatus, setApiStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    testAPIConnection();
  }, []);

  const testAPIConnection = async () => {
    setApiStatus('checking');
    setError(null);
    
    try {
      // Try a simple health check or login endpoint
      const response = await fetch(`${API_CONFIG.BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok || response.status === 401 || response.status === 403) {
        // 401/403 means the API is working but needs auth
        setApiStatus('connected');
      } else {
        setApiStatus('error');
        setError(`API returned status: ${response.status}`);
      }
    } catch (err) {
      setApiStatus('error');
      setError(err.message);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg max-w-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold">API Status</h3>
        <button
          onClick={testAPIConnection}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Recheck
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Status:</span>
          <span className={`font-semibold ${
            apiStatus === 'connected' ? 'text-green-400' :
            apiStatus === 'checking' ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {apiStatus === 'connected' ? '✓ Connected' :
             apiStatus === 'checking' ? '⟳ Checking...' :
             '✗ Error'}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-400 mb-1">API URL:</span>
          <code className="text-xs bg-gray-900 text-blue-400 p-2 rounded break-all">
            {API_CONFIG.BASE_URL}
          </code>
        </div>
        
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded p-2">
            <span className="text-red-400 text-xs">{error}</span>
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Register endpoint: <code className="text-blue-400">{API_CONFIG.ENDPOINTS.REGISTER}</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default APITestPanel;
