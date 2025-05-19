import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Status = () => {
  const [status, setStatus] = useState({
    backend: 'unknown',
    database: 'unknown',
    lastChecked: null,
  });
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkStatus = async () => {
    try {
      const [healthResponse, metricsResponse] = await Promise.all([
        axios.get(`${API_URL}/health`),
        axios.get(`${API_URL}/metrics`),
      ]);

      setStatus({
        backend: healthResponse.data.status,
        database: healthResponse.data.database || 'unknown',
        lastChecked: new Date().toLocaleTimeString(),
      });

      setMetrics(metricsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch status information');
      setStatus({
        backend: 'error',
        database: 'error',
        lastChecked: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
          <button
            onClick={checkStatus}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Backend Status
            </h3>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                status.backend
              )}`}
            >
              {status.backend}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Database Status
            </h3>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                status.database
              )}`}
            >
              {status.database}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Last checked: {status.lastChecked}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          System Metrics
        </h3>
        {metrics ? (
          <div className="overflow-x-auto">
            <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">
              {metrics}
            </pre>
          </div>
        ) : (
          <div className="text-gray-500">No metrics available</div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Network Information
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900">API Endpoint</h4>
              <p className="mt-1 text-sm text-gray-500">{API_URL}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900">Environment</h4>
              <p className="mt-1 text-sm text-gray-500">
                {process.env.NODE_ENV || 'development'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status; 