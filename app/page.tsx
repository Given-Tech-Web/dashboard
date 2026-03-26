'use client';

import { useMQTTData } from '@/hooks/useMQTTData';
import GeneratorStatus from '@/components/dashboard/GeneratorStatus';
import BatteryStatus from '@/components/dashboard/BatteryStatus';
import SolarOverview from '@/components/dashboard/SolarOverview';
import InverterStatus from '@/components/dashboard/InverterStatus';
import EnvironmentCard from '@/components/dashboard/EnvironmentCard';
import IndoorSensorCard from '@/components/dashboard/IndoorSensorCard';
import CarbonSavings from '@/components/dashboard/CarbonSavings';
import EnergySummary from '@/components/dashboard/EnergySummary';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import LoadingOverlay from '@/components/dashboard/LoadingOverlay';
import Image from 'next/image';

export default function DashboardPage() {
  const { data, isConnected, isInitialLoading, connectionStatus, lastUpdate, reconnect } = useMQTTData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {isInitialLoading && (
        <LoadingOverlay
          connectionStatus={connectionStatus}
          onRetry={reconnect}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Giventech EMS Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time EMS Monitoring and Control System</p>
            </div>
            <div className="flex-shrink-0 mx-8">
              <Image
                src="/images/giventech-logo.png"
                alt="GIVENTECH Logo"
                width={200}
                height={50}
                className="object-contain"
                priority
                style={{ height: '50px', width: 'auto' }}
              />
            </div>
            <div className="flex-1 flex items-center justify-end text-sm">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {lastUpdate && (
                <span className="text-gray-500 ml-2">
                  Last update: {new Date(lastUpdate).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Row - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <InverterStatus data={data} />
          <BatteryStatus data={data} />
          <SolarOverview data={data} />
          <GeneratorStatus data={data} />
        </div>

        {/* Middle Row - Environment and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <IndoorSensorCard data={data} />
          </div>
          <div>
            <EnvironmentCard />
          </div>
          <div>
            <AlertsPanel />
          </div>
        </div>

        {/* Bottom Row - Energy Summary and Carbon Savings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EnergySummary data={data} />
          <CarbonSavings data={data} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Copyright ⓒ GIVENTECH All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}