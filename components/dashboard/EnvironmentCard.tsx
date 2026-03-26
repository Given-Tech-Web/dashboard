"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  pressure: number;
  cloudiness: number;
  city: string;
}

export default function EnvironmentCard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('/api/weather');
        if (response.ok) {
          const data = await response.json();
          setWeatherData(data);
        }
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather data every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl shadow-xl overflow-hidden border border-purple-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 px-6 py-4">
        <h2 className="text-white text-xl font-bold flex items-center">
          <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          Outdoor Weather
        </h2>
      </div>

      <div className="p-6">
        {/* Main Weather Display */}
        {weatherData && (
          <div className="mb-6">
            <div className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-2">
                  <Image
                    src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                    alt={weatherData.description}
                    width={64}
                    height={64}
                    className="w-16 h-16"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {weatherData.temperature}°C
                  </p>
                  <p className="text-base font-medium text-gray-700 capitalize mt-1">
                    {weatherData.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {weatherData.city}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Details Grid */}
        {weatherData && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Wind Speed</p>
                  <p className="text-base font-bold text-gray-900">{weatherData.windSpeed} km/h</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Cloudiness</p>
                  <p className="text-base font-bold text-gray-900">{weatherData.cloudiness}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.5 2a.5.5 0 01.5.5V4h8V2.5a.5.5 0 011 0V4h.5A1.5 1.5 0 0117 5.5v9a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14.5v-9A1.5 1.5 0 014.5 4H5V2.5a.5.5 0 01.5-.5zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Humidity</p>
                  <p className="text-base font-bold text-gray-900">{weatherData.humidity}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Pressure</p>
                  <p className="text-base font-bold text-gray-900">{weatherData.pressure} hPa</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Feels Like</p>
                  <p className="text-base font-bold text-gray-900">{weatherData.feelsLike}°C</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {weatherLoading && (
          <div>
            <div className="animate-pulse space-y-3">
              <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}