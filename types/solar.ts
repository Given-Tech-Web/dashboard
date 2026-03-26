export interface RealtimeData {
  device_id: string;
  timestamp: string;
  generator: {
    status: 'running' | 'stopped';
    voltage: number;
    frequency: number;
  };
  battery: {
    capacity_percent: number;
    capacity_kwh: number;
    voltage: number;
    charging_current: number;
    discharge_current: number;
  };
  solar: {
    power_w: number;
    power_kwh: number;
    voltage: number;
    current: number;
    carbon_reduction: number;
  };
  inverter: {
    output_voltage: number;
    output_frequency: number;
    output_power: number;
    load_percentage: number;
  };
  environment?: {
    temperature: number;
    humidity: number;
  };
}

export interface MQTTInverterData {
  device_id: string;
  timestamp: string;
  ac_voltage: number;
  ac_frequency: number;
  output_voltage: number;
  output_frequency: number;
  output_apparent_power: number;
  output_active_power: number;
  load_percentage: number;
  battery_voltage: number;
  charging_current: number;
  battery_capacity: number;
  pv1_input_current: number;
  pv1_input_voltage: number;
  battery_discharge_current: number;
  pv1_charging_power: number;
  raw_data?: string;
}

export interface MQTTEnvironmentData {
  device_id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
}

export interface HistoricalData {
  timestamp: string;
  power: number;
  battery: number;
}