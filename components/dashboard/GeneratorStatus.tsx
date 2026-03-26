"use client";

import { RealtimeData } from "@/types/solar";
import { SYSTEM_SPECS, SystemCalculations } from "@/constants/systemSpecs";

interface Props {
  data: RealtimeData | null;
}

export default function GeneratorStatus({ data }: Props) {
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

  const voltage = data.generator?.voltage || 0;
  const frequency = data.generator?.frequency || 0;
  const isRunning = data.generator?.status === "running";
  const outputPower = data.inverter?.output_power || 0;
  const loadPercentage = data.inverter?.load_percentage || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
        <h2 className="text-white text-lg font-semibold flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Backup Power Generator
        </h2>
      </div>

      <div className="p-6">
        <div className="flex justify-center mb-4">
          <div className={`relative w-24 h-24 rounded-full ${
            isRunning ? "bg-blue-100" : "bg-gray-100"
          }`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className={`w-12 h-12 ${
                isRunning ? "text-blue-500 animate-spin" : "text-gray-400"
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {isRunning && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-pulse"></div>
            )}
          </div>
        </div>

        <div className="text-center mb-4">
          <p className={`text-2xl font-bold ${isRunning ? "text-blue-600" : "text-gray-400"}`}>
            {isRunning ? "RUNNING" : "STOPPED"}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Operating Voltage (AC)</span>
            <span className={`text-sm font-medium ${isRunning ? "text-gray-900" : "text-gray-400"}`}>
              {voltage.toFixed(1)} V
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Operating Frequency</span>
            <span className={`text-sm font-medium ${isRunning ? "text-gray-900" : "text-gray-400"}`}>
              {frequency.toFixed(1)} Hz
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Power Output</span>
            <span className="text-sm font-medium text-gray-900">
              {outputPower} W / {SYSTEM_SPECS.generator.maxPowerW} W
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Power Load</span>
            <div className="flex items-center">
              <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className={`h-2 rounded-full ${
                    loadPercentage > 80 ? "bg-red-500" :
                    loadPercentage > 60 ? "bg-yellow-500" :
                    "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">{loadPercentage}%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}