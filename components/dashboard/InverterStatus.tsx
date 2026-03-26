"use client";

import { RealtimeData } from "@/types/solar";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

interface Props {
  data: RealtimeData | null;
}

export default function InverterStatus({ data }: Props) {
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

  const outputVoltage = data.inverter?.output_voltage || 0;
  const outputFrequency = data.inverter?.output_frequency || 0;
  const outputPower = data.inverter?.output_power || 0;
  const apparentPower = outputPower; // Use output_power as apparent_power is not available
  const loadPercentage = data.inverter?.load_percentage || 0;
  
  // Calculate power factor if apparent power > 0
  const powerFactor = apparentPower > 0 ? (outputPower / apparentPower) : 0;
  
  // Determine inverter status
  const isActive = outputPower > 0 || loadPercentage > 0;
  
  // Get load level color
  const getLoadColor = (load: number) => {
    if (load > 80) return "text-red-500";
    if (load > 60) return "text-orange-500";
    if (load > 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getLoadBgColor = (load: number) => {
    if (load > 80) return "bg-red-500";
    if (load > 60) return "bg-orange-500";
    if (load > 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 md:p-4">
        <h2 className="text-white text-base md:text-lg font-semibold flex items-center">
          <svg className="w-5 h-5 md:w-6 md:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          Hybrid Inverter System
        </h2>
      </div>

      <div className="p-4 md:p-6">
        {/* Main Status Indicator */}
        <div className="text-center mb-4">
          <div className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full ${
            isActive ? "bg-purple-100" : "bg-gray-100"
          }`}>
            <svg className={`w-10 h-10 md:w-12 md:h-12 ${
              isActive ? "text-purple-500" : "text-gray-400"
            }`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <p className={`mt-2 text-sm font-medium ${isActive ? "text-purple-600" : "text-gray-500"}`}>
            {isActive ? "ACTIVE" : "STANDBY"}
          </p>
        </div>

        {/* Output Power Display */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Output Power</p>
            <AnimatedNumber 
              value={outputPower} 
              suffix=" W" 
              className="text-2xl md:text-3xl font-bold text-gray-900"
            />
            {apparentPower > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Apparent: {apparentPower} VA
              </p>
            )}
          </div>
        </div>

        {/* Load Percentage Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs md:text-sm text-gray-600">Load</span>
            <span className={`text-sm md:text-base font-bold ${getLoadColor(loadPercentage)}`}>
              {loadPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getLoadBgColor(loadPercentage)}`}
              style={{ width: `${Math.min(loadPercentage, 100)}%` }}
            >
              <div className="h-full rounded-full bg-white opacity-25 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Grid Output Parameters */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Voltage</p>
            <p className="text-lg font-semibold text-gray-900">{outputVoltage.toFixed(1)} V</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Frequency</p>
            <p className="text-lg font-semibold text-gray-900">{outputFrequency.toFixed(1)} Hz</p>
          </div>
        </div>

        {/* Power Factor */}
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 uppercase tracking-wide">Power Factor</span>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="h-2 rounded-full bg-purple-500"
                  style={{ width: `${powerFactor * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {powerFactor.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                outputVoltage > 200 ? "bg-green-500" : "bg-gray-300"
              }`}></div>
              <p className="text-xs text-gray-600">Grid</p>
            </div>
            <div>
              <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                isActive ? "bg-green-500" : "bg-gray-300"
              }`}></div>
              <p className="text-xs text-gray-600">Inverter</p>
            </div>
            <div>
              <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                loadPercentage > 0 ? "bg-green-500" : "bg-gray-300"
              }`}></div>
              <p className="text-xs text-gray-600">Load</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}