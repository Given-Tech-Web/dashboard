"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface Props {
  connectionStatus: 'connecting' | 'waiting' | 'connected' | 'failed';
  onRetry: () => void;
}

export default function LoadingOverlay({ connectionStatus, onRetry }: Props) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'connecting':
        return {
          icon: <Wifi className="w-8 h-8 text-blue-500" />,
          title: "Connecting to Solar System",
          message: "Establishing connection to MQTT broker...",
          subMessage: `${elapsedTime}s elapsed`,
        };
      case 'waiting':
        return {
          icon: <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />,
          title: "Waiting for Solar Data",
          message: "Connection established, waiting for solar system data...",
          subMessage: elapsedTime < 15
            ? `${elapsedTime}s elapsed`
            : "Taking longer than expected...",
        };
      case 'failed':
        return {
          icon: <WifiOff className="w-8 h-8 text-red-500" />,
          title: "Connection Failed",
          message: "Unable to connect to the solar monitoring system",
          subMessage: "Please check your network and try again",
        };
      case 'connected':
        return {
          icon: <Wifi className="w-8 h-8 text-green-500" />,
          title: "Connected",
          message: "Successfully connected to solar system",
          subMessage: "Loading dashboard...",
        };
      default:
        return {
          icon: <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />,
          title: "Loading",
          message: "Initializing...",
          subMessage: "",
        };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          {status.icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {status.title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-2">
          {status.message}
        </p>

        {/* Sub Message */}
        {status.subMessage && (
          <p className="text-sm text-gray-500 mb-6">
            {status.subMessage}
          </p>
        )}

        {/* Progress Bar */}
        {connectionStatus !== 'failed' && connectionStatus !== 'connected' && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: connectionStatus === 'connecting'
                  ? '30%'
                  : connectionStatus === 'waiting'
                    ? '60%'
                    : '100%'
              }}
            >
              <div className="h-full bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Retry Button */}
        {connectionStatus === 'failed' && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </button>
        )}

        {/* Connection Tips */}
        {connectionStatus === 'waiting' && elapsedTime > 15 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              Connection Tips:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Check if the solar inverter is powered on</li>
              <li>• Verify network connectivity</li>
              <li>• Ensure MQTT service is running</li>
            </ul>
          </div>
        )}

        {/* Solar Animation */}
        {connectionStatus !== 'failed' && (
          <div className="mt-8 flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}