"use client";

import { RealtimeData } from "@/types/solar";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import SparklineChart from "@/components/ui/SparklineChart";
import { useEffect, useState } from "react";
import { formatNumber } from "@/utils/dateFormatters";
import { SYSTEM_SPECS, SystemCalculations } from "@/constants/systemSpecs";

interface Props {
  data: RealtimeData | null;
}

export default function SolarOverview({ data }: Props) {
  const [powerHistory, setPowerHistory] = useState<number[]>([]);
  const [sessionPeakPower, setSessionPeakPower] = useState<number>(0);

  useEffect(() => {
    if (data?.solar?.power_w !== undefined) {
      const currentPower = data.solar.power_w;
      
      // Update power history
      setPowerHistory(prev => {
        const newHistory = [...prev, currentPower];
        // Keep last 20 data points
        if (newHistory.length > 20) {
          newHistory.shift();
        }
        return newHistory;
      });
      
      // Track session peak power
      if (currentPower > sessionPeakPower) {
        setSessionPeakPower(currentPower);
      }
    }
  }, [data?.solar?.power_w, sessionPeakPower]);

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

  const solarPower = data.solar?.power_w || 0;
  const solarKwh = data.solar?.power_kwh || 0;
  const voltage = data.solar?.voltage || 0;
  const current = data.solar?.current || 0;
  const carbonReduction = data.solar?.carbon_reduction || 0;

  const isGenerating = solarPower > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 md:p-4">
        <h2 className="text-white text-base md:text-lg font-semibold flex items-center">
          <svg className="w-5 h-5 md:w-6 md:h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          Solar Power System
        </h2>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="text-center mb-4 md:mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full ${
            isGenerating ? "bg-yellow-100" : "bg-gray-100"
          }`}>
            <svg className={`w-10 h-10 md:w-12 md:h-12 ${isGenerating ? "text-yellow-500 animate-pulse-slow" : "text-gray-400"}`} 
                 fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="mt-3 md:mt-4">
            <AnimatedNumber 
              value={solarPower} 
              suffix=" W" 
              className="text-2xl md:text-3xl font-bold text-gray-900"
            />
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Current Power (Installed Power: 3kWp)</p>
        </div>
        
        {/* Mini Chart for Power Trend */}
        {powerHistory.length > 1 && (
          <div className="mb-4 px-4">
            <p className="text-xs text-gray-500 mb-1">Power Trend (Last 20 readings)</p>
            <SparklineChart 
              data={powerHistory} 
              color="#F59E0B"
              height={30}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-gray-50 rounded-lg p-2 md:p-3">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Current Output</p>
            <p className="text-lg md:text-xl font-semibold text-gray-900">{formatNumber(solarPower)} W</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 md:p-3">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Peak Output</p>
            <p className="text-lg md:text-xl font-semibold text-orange-600">{formatNumber(sessionPeakPower)} W</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 md:p-3">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Solar Voltage</p>
            <p className="text-lg md:text-xl font-semibold text-blue-600">{voltage.toFixed(1)} V</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 md:p-3">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Efficiency</p>
            <p className="text-lg md:text-xl font-semibold text-gray-900">
              {SystemCalculations.getSolarEfficiency(solarPower).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              isGenerating 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {isGenerating ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}