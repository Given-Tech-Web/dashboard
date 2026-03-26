"use client";

import { RealtimeData } from "@/types/solar";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

interface Props {
  data: RealtimeData | null;
}

export default function CarbonSavings({ data }: Props) {

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

  // Real-time carbon reduction from current solar power (kg CO2 per kWh)
  const CO2_PER_KWH = 0.5; // kg CO2 saved per kWh
  const currentCarbonSaved = (data.solar?.power_kwh || 0) * CO2_PER_KWH;

  // Real-time rate calculation (kg/hr based on current power)
  const currentPowerKw = (data.solar?.power_w || 0) / 1000;
  const carbonRatePerHour = currentPowerKw * CO2_PER_KWH;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 md:p-4">
        <h2 className="text-white text-base md:text-lg font-semibold flex items-center">
          <svg className="w-5 h-5 md:w-6 md:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Today's Carbon Savings
        </h2>
      </div>

      <div className="p-4 md:p-6">
        {/* Main Carbon Display */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-100">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="mt-3">
            <AnimatedNumber
              value={currentCarbonSaved}
              decimals={2}
              suffix=" kg"
              className="text-2xl md:text-3xl font-bold text-gray-900"
            />
            <p className="text-xs md:text-sm text-gray-600 mt-1">Current Carbon Savings</p>
          </div>
        </div>

        {/* Real-time Rate */}
        <div className="bg-green-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-gray-600">Current Carbon Savings</span>
            <div className="flex items-center">
              {carbonRatePerHour > 0 && (
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              )}
              <span className="text-sm md:text-base font-semibold text-green-600">
                {carbonRatePerHour.toFixed(3)} kg/hr
              </span>
            </div>
          </div>
        </div>

        {/* Current Generation Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-2">⚡</span>
              <span className="text-xs md:text-sm text-gray-600">Current Power Output</span>
            </div>
            <span className="text-sm md:text-base font-medium text-gray-900">{currentPowerKw.toFixed(2)} kW</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-2">📊</span>
              <span className="text-xs md:text-sm text-gray-600">Total Energy Capacity</span>
            </div>
            <span className="text-sm md:text-base font-medium text-gray-900">{(data.solar?.power_kwh || 0).toFixed(2)} kWh</span>
          </div>
        </div>


        {/* Impact Message */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-xs md:text-sm text-green-800 font-medium">Contribution to Carbon Reduction</p>
              <p className="text-xs text-green-700 mt-1">
                Carbon savings generated through Giventech's standalone solar power generation system are generated through direct use of solar energy and can be used as basis data for trading as a potential carbon credit resource.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}