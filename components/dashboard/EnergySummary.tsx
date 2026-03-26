"use client";

import { RealtimeData } from "@/types/solar";
import { TrendingUp, Zap, Battery, Sun, Activity } from "lucide-react";
import { useClientOnly } from "@/hooks/useClientOnly";
import { SYSTEM_SPECS, SystemCalculations } from "@/constants/systemSpecs";

interface Props {
  data: RealtimeData | null;
}

export default function EnergySummary({ data }: Props) {
  const isClient = useClientOnly();

  if (!isClient || !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate efficiency based on actual solar system capacity (3kW)
  const solarEfficiency = SystemCalculations.getSolarEfficiency(data.solar?.power_w || 0);

  // Calculate self-sufficiency (solar power vs load)
  const loadWatts = data.inverter?.output_power || 0;
  const selfSufficiency = data.solar?.power_w && loadWatts > 0
    ? Math.min((data.solar.power_w / loadWatts * 100), 100)
    : 0;

  // Determine energy flow status
  const getEnergyStatus = () => {
    const solarPower = data.solar?.power_w || 0;
    const batteryCharging = data.battery?.charging_current > 0;
    const gridConnected = data.generator?.status === 'running';

    if (solarPower > 500) {
      return { text: "High Production", color: "text-green-600", icon: TrendingUp };
    } else if (solarPower > 100) {
      return { text: "Moderate Production", color: "text-yellow-600", icon: Sun };
    } else if (batteryCharging) {
      return { text: "Battery Charging", color: "text-blue-600", icon: Battery };
    } else if (gridConnected) {
      return { text: "Grid Supply", color: "text-gray-600", icon: Zap };
    } else {
      return { text: "Low Production", color: "text-gray-500", icon: Activity };
    }
  };

  const energyStatus = getEnergyStatus();
  const StatusIcon = energyStatus.icon;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">System Configuration</h2>
          <p className="text-xs text-gray-500">3kW Solar | 19kWh Battery | 6.5kW Generator</p>
          <div className={`flex items-center mt-2 ${energyStatus.color}`}>
            <StatusIcon className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{energyStatus.text}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">
            {((data.solar?.power_w || 0) / 1000).toFixed(2)} kW
          </p>
          <p className="text-xs text-gray-500">Current Output</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <Sun className="w-4 h-4 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-900">
              {solarEfficiency.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Solar Efficiency</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-lg font-semibold text-gray-900">
              {selfSufficiency.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Self-Sufficiency</p>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Today's Energy Capacity</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {data.solar?.power_kwh?.toFixed(2) || "0.00"} kWh
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Current Power Load</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {(loadWatts / 1000).toFixed(2)} kW
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Battery Storage Capacity</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {data.battery?.charging_current > 0 ? "Charging " : data.battery?.discharge_current > 0 ? "Discharging " : "Idle "}
            ({data.battery?.capacity_percent?.toFixed(0) || 0}%)
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Backup Power Generator</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {data.generator?.status === 'running' ?
              `Running (${data.generator.voltage}V / ${data.generator.frequency}Hz)` :
              "Stopped"}
          </span>
        </div>
      </div>

      {/* Energy Flow Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <Sun className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-gray-600">Solar</span>
          </div>
          <div className="flex-1 mx-2 relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(solarEfficiency, 100)}%` }}
            />
          </div>
          <div className="flex items-center">
            <Battery className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-gray-600">{data.battery?.capacity_percent?.toFixed(0) || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}