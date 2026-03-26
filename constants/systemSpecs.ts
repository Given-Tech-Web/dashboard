/**
 * MySolar System Specifications
 * Actual hardware specifications for the solar monitoring system
 */

export const SYSTEM_SPECS = {
  // Solar PV System: 3kW (500Wp × 6 modules)
  solar: {
    totalCapacityW: 3000,           // Total system capacity in watts
    totalCapacityKw: 3,             // Total system capacity in kilowatts
    moduleCount: 6,                 // Number of solar panels
    moduleCapacityWp: 500,          // Each module capacity in Wp
    maxVoltage: 48,                 // System voltage (typical for 6 modules)
    maxCurrent: 62.5,               // Max current at peak (3000W / 48V)
    efficiencyLoss: 0.85,           // System efficiency factor (85% typical)
    temperatureCoefficient: -0.004,  // Power loss per degree above 25°C
  },

  // Generator: 6.5kW (5.5kVA ~ 6.5kVA)
  generator: {
    maxPowerKw: 6.5,                // Maximum power in kW
    maxPowerW: 6500,                // Maximum power in watts
    ratedKva: 5.5,                  // Rated apparent power in kVA
    maxKva: 6.5,                    // Maximum apparent power in kVA
    powerFactor: 0.8,               // Typical power factor
    voltage: 220,                   // Output voltage (V)
    frequency: 60,                  // Frequency (Hz) - Korea standard
    fuelConsumptionLph: 2.5,        // Fuel consumption liters per hour at full load
  },

  // Battery Bank: 19kWh (12VDC × 200Ah × 8 sets)
  battery: {
    totalCapacityKwh: 19,           // Total battery capacity in kWh
    totalCapacityWh: 19000,         // Total battery capacity in Wh
    voltage: 12,                    // Individual battery voltage
    ampHours: 200,                  // Individual battery capacity in Ah
    setCount: 8,                    // Number of battery sets
    systemVoltage: 48,              // Total system voltage (12V × 4 series = 48V)
    parallelStrings: 2,             // Number of parallel strings (8 batteries / 4 series)
    totalAmpHours: 400,             // Total Ah (200Ah × 2 parallel)
    depthOfDischarge: 0.8,          // Recommended DoD (80%)
    usableCapacityKwh: 15.2,       // Usable capacity (19kWh × 0.8)
    chargingEfficiency: 0.95,       // Charging efficiency
    maxChargeCurrent: 40,           // Maximum charging current (A)
    maxDischargeCurrent: 100,       // Maximum discharge current (A)
  },

  // Inverter specifications (typical for this system size)
  inverter: {
    ratedPowerW: 5000,              // Rated continuous power
    maxPowerW: 6000,                // Peak/surge power
    efficiency: 0.94,               // Typical efficiency at rated load
    inputVoltageRange: {
      min: 42,                      // Minimum DC input voltage
      max: 58,                      // Maximum DC input voltage
    },
    outputVoltage: 220,             // AC output voltage
    outputFrequency: 60,            // AC output frequency (Hz)
  },

  // System operation parameters
  operation: {
    maxLoadW: 5000,                 // Maximum recommended continuous load
    criticalLoadThreshold: 0.8,    // Critical load warning (80%)
    batteryLowThreshold: 0.2,      // Battery low warning (20%)
    batteryCriticalThreshold: 0.1,  // Battery critical (10%)
    solarMinimumW: 50,              // Minimum solar power to consider "generating"
    generatorAutoStartBattery: 0.15, // Auto-start generator at 15% battery
  },

  // Environmental limits
  environmental: {
    optimalTemperature: 25,         // Optimal temperature for solar panels (°C)
    maxOperatingTemp: 60,           // Maximum operating temperature (°C)
    minOperatingTemp: -10,          // Minimum operating temperature (°C)
    optimalHumidity: 50,            // Optimal humidity (%)
    maxHumidity: 95,                // Maximum humidity (%)
  },
} as const;

// Helper functions for calculations
export const SystemCalculations = {
  // Calculate solar efficiency based on current power output
  getSolarEfficiency: (currentPowerW: number): number => {
    return Math.min((currentPowerW / SYSTEM_SPECS.solar.totalCapacityW) * 100, 100);
  },

  // Calculate battery runtime based on current load
  getBatteryRuntime: (currentLoadW: number, batteryPercent: number): number => {
    if (currentLoadW <= 0) return 0;
    const availableWh = (SYSTEM_SPECS.battery.usableCapacityKwh * 1000) * (batteryPercent / 100);
    return availableWh / currentLoadW; // Hours
  },

  // Calculate if generator should auto-start
  shouldAutoStartGenerator: (batteryPercent: number, solarPowerW: number): boolean => {
    return batteryPercent <= SYSTEM_SPECS.operation.generatorAutoStartBattery * 100
           && solarPowerW < SYSTEM_SPECS.operation.solarMinimumW;
  },

  // Get load level status
  getLoadStatus: (loadPercentage: number): 'normal' | 'warning' | 'critical' | 'overload' => {
    if (loadPercentage >= 100) return 'overload';
    if (loadPercentage >= 80) return 'critical';
    if (loadPercentage >= 60) return 'warning';
    return 'normal';
  },

  // Get battery status
  getBatteryStatus: (batteryPercent: number): 'good' | 'low' | 'critical' => {
    if (batteryPercent <= SYSTEM_SPECS.operation.batteryCriticalThreshold * 100) return 'critical';
    if (batteryPercent <= SYSTEM_SPECS.operation.batteryLowThreshold * 100) return 'low';
    return 'good';
  },

  // Calculate CO2 savings (kg per kWh)
  getCO2Saved: (energyKwh: number): number => {
    const CO2_PER_KWH = 0.5; // kg CO2 saved per kWh in Korea
    return energyKwh * CO2_PER_KWH;
  },
};