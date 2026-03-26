"use client";

import { useState, useEffect } from 'react';

interface Props {
  isConnected: boolean;
  lastUpdate: string | null;
  error: Error | null;
  reconnectAttempts: number;
  onReconnect: () => void;
}

export default function ConnectionStatus({
  isConnected,
  lastUpdate,
  error,
  reconnectAttempts,
  onReconnect,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Auto-hide details when connected
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => setShowDetails(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await onReconnect();
    } finally {
      setTimeout(() => setIsReconnecting(false), 1000);
    }
  };

  const formatLastUpdate = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Main Status Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
          isConnected
            ? 'bg-green-50 hover:bg-green-100'
            : 'bg-red-50 hover:bg-red-100 animate-pulse'
        }`}
      >
        <div className="relative">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          {isConnected && (
            <span className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping" />
          )}
        </div>
        <span
          className={`text-sm font-medium ${
            isConnected ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {!isConnected && reconnectAttempts > 0 && (
          <span className="text-xs text-red-600">
            (Attempt {reconnectAttempts})
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${
            showDetails ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Details Dropdown */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Connection Details
            </h3>

            <div className="space-y-2">
              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span
                  className={`text-sm font-medium ${
                    isConnected ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Last Update */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Update</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatLastUpdate(lastUpdate)}
                </span>
              </div>

              {/* Data Interval Notice */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Update Interval</span>
                <span className="text-sm font-medium text-blue-600">
                  Every 30 seconds
                </span>
              </div>

              {/* Protocol */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Protocol</span>
                <span className="text-sm font-medium text-gray-900">
                  MQTT over WebSocket
                </span>
              </div>

              {/* Broker */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Broker</span>
                <span className="text-sm font-medium text-gray-900">
                  HiveMQ Cloud
                </span>
              </div>

              {/* Error Message */}
              {error && !isConnected && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-700">
                    Error: {error.message}
                  </p>
                </div>
              )}

              {/* Reconnect Button */}
              {!isConnected && (
                <button
                  onClick={handleReconnect}
                  disabled={isReconnecting}
                  className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isReconnecting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Reconnecting...
                    </span>
                  ) : (
                    'Reconnect Now'
                  )}
                </button>
              )}

              {/* Success Message */}
              {isConnected && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700">
                    ✓ Real-time data streaming active (30s interval)
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Next update expected in ~{30 - (lastUpdate ? Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 1000) % 30 : 0)}s
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}