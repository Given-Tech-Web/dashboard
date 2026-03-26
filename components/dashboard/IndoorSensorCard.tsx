"use client";

import { RealtimeData } from "@/types/solar";

interface Props {
  data: RealtimeData | null;
}

export default function IndoorSensorCard({ data }: Props) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const temperature = data.environment?.temperature || 0;
  const humidity = data.environment?.humidity || 0;

  const getTempColor = (temp: number) => {
    if (temp > 35) return "text-red-500";
    if (temp > 30) return "text-orange-500";
    if (temp > 25) return "text-yellow-500";
    if (temp > 20) return "text-green-500";
    return "text-blue-500";
  };

  const getHumidityColor = (humidity: number) => {
    if (humidity > 70) return "text-blue-600";
    if (humidity > 50) return "text-blue-500";
    if (humidity > 30) return "text-green-500";
    return "text-yellow-500";
  };

  return (
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-xl overflow-hidden border border-green-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 px-6 py-4">
        <h2 className="text-white text-xl font-bold flex items-center">
          <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Indoor Environment
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Temperature */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-orange-100 hover:shadow-lg transition-shadow">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  temperature > 30 ? "bg-red-100" :
                  temperature > 25 ? "bg-orange-100" :
                  temperature > 20 ? "bg-yellow-100" :
                  "bg-blue-100"
                }`}>
                  <svg className={`w-7 h-7 ${getTempColor(temperature)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getTempColor(temperature)}`}>
                    {temperature.toFixed(1)}°C
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Temperature</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      temperature > 35 ? "bg-red-500" :
                      temperature > 30 ? "bg-orange-500" :
                      temperature > 25 ? "bg-yellow-500" :
                      temperature > 20 ? "bg-green-500" :
                      "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min((temperature / 50) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  humidity > 70 ? "bg-blue-100" :
                  humidity > 50 ? "bg-cyan-100" :
                  "bg-green-100"
                }`}>
                  <svg className={`w-7 h-7 ${getHumidityColor(humidity)}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.5 2a.5.5 0 01.5.5V4h8V2.5a.5.5 0 011 0V4h.5A1.5 1.5 0 0117 5.5v9a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14.5v-9A1.5 1.5 0 014.5 4H5V2.5a.5.5 0 01.5-.5zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getHumidityColor(humidity)}`}>
                    {humidity.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Humidity</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      humidity > 70 ? "bg-blue-600" :
                      humidity > 50 ? "bg-blue-500" :
                      humidity > 30 ? "bg-green-500" :
                      "bg-yellow-500"
                    }`}
                    style={{ width: `${humidity}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
