"use client";

import { RealtimeData } from "@/types/solar";
import { useState } from "react";
import { formatTime } from "@/utils/dateFormatters";
import { useClientOnly } from "@/hooks/useClientOnly";

interface Props {
  data: RealtimeData | null;
}

export default function EnergyChart({ data }: Props) {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("day");
  const isClient = useClientOnly();

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Simple chart data from realtime data
  const chartData = [
    { time: new Date().toLocaleTimeString(), value: data.solar?.power_w || 0 }
  ];
  const maxValue = data.solar?.power_w || 1000;
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Energy Production</h2>
        <div className="flex space-x-2">
          {(["day", "week", "month"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute -left-2 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>{(maxValue / 1000).toFixed(1)}kW</span>
          <span>{(maxValue / 2000).toFixed(1)}kW</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-10 relative" style={{ height: `${chartHeight}px` }}>
          <div className="absolute inset-0 flex items-end justify-between">
            {chartData.map((point, index) => {
              const height = maxValue > 0 ? (point.value / maxValue) * chartHeight : 0;
              const batteryHeight = data.battery ? (data.battery.capacity_percent / 100) * chartHeight : 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center justify-end mx-0.5">
                  <div className="w-full relative">
                    {/* Solar bar */}
                    <div
                      className="bg-yellow-400 hover:bg-yellow-500 transition-colors rounded-t cursor-pointer"
                      style={{ height: `${height}px` }}
                      title={`Solar: ${point.value}W at ${point.time}`}
                    />
                    {/* Battery line */}
                    <div
                      className="absolute bottom-0 w-full bg-green-500 opacity-30"
                      style={{ height: `${batteryHeight}px` }}
                      title={`Battery: ${data.battery?.capacity_percent}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-t border-gray-200"></div>
            <div className="border-t border-gray-100"></div>
            <div className="border-t border-gray-100"></div>
            <div className="border-t border-gray-200"></div>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="ml-10 mt-2 flex justify-between text-xs text-gray-500">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Solar Generation</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 opacity-30 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Battery Level</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-600">Peak Power</p>
          <p className="text-lg font-semibold text-gray-900">
            {(maxValue / 1000).toFixed(2)} kW
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Total Energy</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.solar?.power_kwh?.toFixed(2) || "0.00"} kWh
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Battery Level</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.battery?.capacity_percent?.toFixed(1) || "0.0"}%
          </p>
        </div>
      </div>
    </div>
  );
}