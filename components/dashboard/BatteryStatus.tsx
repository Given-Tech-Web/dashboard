"use client";

import { RealtimeData } from "@/types/solar";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import { SYSTEM_SPECS, SystemCalculations } from "@/constants/systemSpecs";

interface Props {
  data: RealtimeData | null;
}

export default function BatteryStatus({ data }: Props) {
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

  const capacity = data.battery?.capacity_percent || 0;
  // Calculate actual kWh based on 19kWh system and current percentage
  const capacityKwh = (SYSTEM_SPECS.battery.totalCapacityKwh * capacity) / 100;
  const voltage = data.battery?.voltage || 0;
  const chargingCurrent = data.battery?.charging_current || 0;
  const dischargeCurrent = data.battery?.discharge_current || 0;

  const isCharging = chargingCurrent > 0;
  const isDischarging = dischargeCurrent > 0;

  const getBatteryColor = (percent: number) => {
    if (percent > 60) return "text-green-500";
    if (percent > 30) return "text-yellow-500";
    return "text-red-500";
  };

  const getBatteryBgColor = (percent: number) => {
    if (percent > 60) return "bg-green-500";
    if (percent > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 md:p-4">
        <h2 className="text-white text-base md:text-lg font-semibold flex items-center">
          <svg className="w-5 h-5 md:w-6 md:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-3-3v6m-7 0h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          Battery Storage System
        </h2>
      </div>

      <div className="p-4 md:p-6">
        <div className="flex justify-center mb-3 md:mb-4">
          <div className="relative w-28 h-14 md:w-32 md:h-16" role="img" aria-label={`Battery at ${capacity}% charge`}>
            <div className="absolute inset-0 border-2 border-gray-300 rounded-lg"></div>
            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-2 h-4 bg-gray-300 rounded-r"></div>
            <div 
              className={`absolute inset-1 ${getBatteryBgColor(capacity)} rounded opacity-30 transition-all duration-500`}
              style={{ width: `${capacity}%` }}
              aria-hidden="true"
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatedNumber 
                value={capacity} 
                suffix="%" 
                className={`text-xl md:text-2xl font-bold ${getBatteryColor(capacity)}`}
              />
            </div>
          </div>
        </div>

        <div className="text-center mb-3 md:mb-4">
          <AnimatedNumber 
            value={capacityKwh} 
            decimals={2}
            suffix=" kWh"
            className="text-xl md:text-2xl font-bold text-gray-900"
          />
          <p className="text-xs md:text-sm text-gray-600 mt-1">Current Capacity (Installed: 19kWh)</p>
        </div>

        <div className="space-y-2 md:space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-gray-600">Current Voltage / Nominal Voltage</span>
            <span className="text-xs md:text-sm font-medium text-gray-900">{voltage.toFixed(1)} V / {SYSTEM_SPECS.battery.systemVoltage}V</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-gray-600">Charging Current</span>
            <div className="flex items-center">
              {isCharging && (
                <svg className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20" aria-label="Charging">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-xs md:text-sm font-medium text-gray-900">{chargingCurrent} A</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-gray-600">Discharge Current</span>
            <div className="flex items-center">
              {isDischarging && (
                <svg className="w-3 h-3 md:w-4 md:h-4 text-orange-500 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20" aria-label="Discharging">
                  <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-xs md:text-sm font-medium text-gray-900">{dischargeCurrent.toFixed(1)} A</span>
            </div>
          </div>
        </div>

        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-gray-600">Status</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              isCharging ? "bg-green-100 text-green-800" :
              isDischarging ? "bg-orange-100 text-orange-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {isCharging ? "ON" : isDischarging ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}