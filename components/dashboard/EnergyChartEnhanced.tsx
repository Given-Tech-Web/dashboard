"use client";

import { RealtimeData } from "@/types/solar";
import { useState, useMemo } from "react";
import { useClientOnly } from "@/hooks/useClientOnly";

interface DataPoint {
  timestamp: string;
  solar_power: number;
  battery_percent: number;
  load_percentage: number;
}

interface Props {
  data: RealtimeData | null;
  history: DataPoint[];
}

export default function EnergyChartEnhanced({ data, history }: Props) {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("6h");
  const [metric, setMetric] = useState<"solar" | "battery" | "load">("solar");
  const isClient = useClientOnly();

  // Filter history based on time range
  const filteredHistory = useMemo(() => {
    const hours = timeRange === "1h" ? 1 : timeRange === "6h" ? 6 : 24;
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return history.filter(point => new Date(point.timestamp) >= cutoffTime);
  }, [history, timeRange]);

  // Calculate chart data
  const chartData = useMemo(() => {
    const points = [...filteredHistory];

    // Add current data as the latest point if available
    if (data) {
      points.push({
        timestamp: new Date().toISOString(),
        solar_power: data.solar?.power_w || 0,
        battery_percent: data.battery?.capacity_percent || 0,
        load_percentage: data.inverter?.load_percentage || 0,
      });
    }

    // Limit points for better visualization
    const maxPoints = timeRange === "1h" ? 12 : timeRange === "6h" ? 36 : 144;
    if (points.length > maxPoints) {
      const step = Math.ceil(points.length / maxPoints);
      return points.filter((_, index) => index % step === 0);
    }

    return points;
  }, [filteredHistory, data, timeRange]);

  // Get max value for scaling
  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;

    switch (metric) {
      case "solar":
        return Math.max(...chartData.map(d => d.solar_power), 1000);
      case "battery":
        return 100; // Battery is always 0-100%
      case "load":
        return 100; // Load is always 0-100%
      default:
        return 100;
    }
  }, [chartData, metric]);

  // Format time based on range
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === "1h") {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === "6h") {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit' });
    }
  };

  // Get current value
  const currentValue = data ? (
    metric === "solar" ? data.solar?.power_w || 0 :
    metric === "battery" ? data.battery?.capacity_percent || 0 :
    data.inverter?.load_percentage || 0
  ) : 0;

  const unitLabel = metric === "solar" ? "W" : "%";
  const metricLabel = metric === "solar" ? "Solar Power" : metric === "battery" ? "Battery" : "Load";

  if (!isClient) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Energy Monitoring</h2>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {currentValue.toFixed(metric === "solar" ? 0 : 1)} {unitLabel}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {/* Time Range Selection */}
          <div className="flex space-x-1">
            {(["1h", "6h", "24h"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          {/* Metric Selection */}
          <div className="flex space-x-1">
            {(["solar", "battery", "load"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                  metric === m
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-64 mt-4">
        {chartData.length > 0 ? (
          <>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8 w-8 text-right">
              <span>{maxValue.toFixed(0)}</span>
              <span>{(maxValue * 0.75).toFixed(0)}</span>
              <span>{(maxValue * 0.5).toFixed(0)}</span>
              <span>{(maxValue * 0.25).toFixed(0)}</span>
              <span>0</span>
            </div>

            {/* Chart */}
            <svg className="w-full h-full" viewBox={`0 0 ${chartData.length * 20} 256`} preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={256 - y * 256}
                  x2={chartData.length * 20}
                  y2={256 - y * 256}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Data line */}
              <polyline
                fill="none"
                stroke={metric === "solar" ? "#3b82f6" : metric === "battery" ? "#10b981" : "#f59e0b"}
                strokeWidth="2"
                points={chartData.map((point, index) => {
                  const value = metric === "solar" ? point.solar_power :
                               metric === "battery" ? point.battery_percent :
                               point.load_percentage;
                  const y = 256 - (value / maxValue) * 256;
                  return `${index * 20},${y}`;
                }).join(" ")}
              />

              {/* Data points */}
              {chartData.map((point, index) => {
                const value = metric === "solar" ? point.solar_power :
                             metric === "battery" ? point.battery_percent :
                             point.load_percentage;
                const y = 256 - (value / maxValue) * 256;
                return (
                  <circle
                    key={index}
                    cx={index * 20}
                    cy={y}
                    r="3"
                    fill={metric === "solar" ? "#3b82f6" : metric === "battery" ? "#10b981" : "#f59e0b"}
                  />
                );
              })}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              {chartData.filter((_, i) => i % Math.ceil(chartData.length / 5) === 0).map((point, index) => (
                <span key={index}>{formatTime(point.timestamp)}</span>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No data available for the selected range</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div>
          <p className="text-xs text-gray-500">Average</p>
          <p className="text-sm font-semibold">
            {chartData.length > 0 ? (
              chartData.reduce((sum, point) => {
                const value = metric === "solar" ? point.solar_power :
                             metric === "battery" ? point.battery_percent :
                             point.load_percentage;
                return sum + value;
              }, 0) / chartData.length
            ).toFixed(1) : 0} {unitLabel}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Peak</p>
          <p className="text-sm font-semibold">
            {chartData.length > 0 ? Math.max(...chartData.map(point => {
              return metric === "solar" ? point.solar_power :
                     metric === "battery" ? point.battery_percent :
                     point.load_percentage;
            })).toFixed(1) : 0} {unitLabel}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Data Points</p>
          <p className="text-sm font-semibold">{chartData.length}</p>
        </div>
      </div>
    </div>
  );
}