import mqtt from 'mqtt';
import { RealtimeData, MQTTInverterData, MQTTEnvironmentData } from '@/types/solar';

interface MQTTConfig {
  host: string;
  port: number;
  credentials: {
    username: string;
    password: string;
  };
  config: {
    reconnectPeriod: number;
    connectTimeout: number;
    clean: boolean;
    protocol: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MQTTMessageCallback<T = any> = (data: T) => void;

class SecureMQTTService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private callbacks: Map<string, MQTTMessageCallback<any>[]> = new Map();
  private client: mqtt.MqttClient | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionPromise: Promise<void> | null = null;
  private config: MQTTConfig | null = null;
  private statusCallbacks: ((status: boolean) => void)[] = [];
  private errorCallbacks: ((error: Error) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeConnection();
    }
  }

  private async initializeConnection() {
    try {
      console.log('[MQTT] Fetching configuration from API...');
      // Fetch configuration from API route
      const response = await fetch('/api/mqtt/config');
      if (!response.ok) {
        console.error('[MQTT] API response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('[MQTT] Error response:', errorText);
        throw new Error(`Failed to fetch MQTT configuration: ${response.status}`);
      }

      this.config = await response.json();
      console.log('[MQTT] Configuration received:', {
        host: this.config?.host,
        port: this.config?.port,
        hasCredentials: !!(this.config?.credentials?.username && this.config?.credentials?.password)
      });
      await this.connect();
    } catch (error) {
      console.error('[MQTT] Failed to initialize connection:', error);
      this.notifyError(error as Error);
      // Retry after delay
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Exponential backoff with jitter
    const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    const jitter = Math.random() * 1000;
    const delay = baseDelay + jitter;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.initializeConnection();
      } else {
        console.error('Max reconnection attempts reached');
        this.notifyError(new Error('Max reconnection attempts reached'));
      }
    }, delay);
  }

  private async connect(): Promise<void> {
    if (!this.config) {
      throw new Error('MQTT configuration not available');
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const { host, port, credentials, config } = this.config!;
      const url = `${config.protocol}://${host}:${port}/mqtt`;

      console.log('Connecting to MQTT broker...');

      this.client = mqtt.connect(url, {
        username: credentials.username,
        password: credentials.password,
        clientId: `mysolar_dashboard_${Math.random().toString(16).substring(2, 10)}`,
        protocol: config.protocol as any,
        reconnectPeriod: config.reconnectPeriod,
        connectTimeout: config.connectTimeout,
        clean: config.clean,
        rejectUnauthorized: false,
      });

      const connectionTimeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
        this.client?.end();
      }, config.connectTimeout);

      this.client.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log('Connected to MQTT broker');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyStatusChange(true);

        // Subscribe to topics
        this.client?.subscribe('solar/inverter/status', { qos: 0 });
        this.client?.subscribe('solar/environment/data', { qos: 0 });

        console.log('Subscribed to topics');
        resolve();
      });

      this.client.on('message', (topic: string, message: Buffer) => {
        try {
          const data = JSON.parse(message.toString()) as MQTTInverterData | MQTTEnvironmentData;
          console.log('Received message on topic:', topic);

          const callbacks = this.callbacks.get(topic) || [];
          callbacks.forEach(callback => callback(data));
        } catch (error) {
          console.error('Error parsing MQTT message:', error);
          this.notifyError(new Error(`Failed to parse message: ${String(error)}`));
        }
      });

      this.client.on('error', (error) => {
        clearTimeout(connectionTimeout);
        console.error('MQTT connection error:', error);
        this.isConnected = false;
        this.notifyStatusChange(false);
        this.notifyError(error);
        reject(error);
      });

      this.client.on('offline', () => {
        console.log('MQTT client offline');
        this.isConnected = false;
        this.notifyStatusChange(false);
        this.scheduleReconnect();
      });

      this.client.on('disconnect', () => {
        console.log('MQTT disconnected');
        this.isConnected = false;
        this.notifyStatusChange(false);
      });
    });

    this.connectionPromise.finally(() => {
      this.connectionPromise = null;
    });

    return this.connectionPromise;
  }

  public onStatusChange(callback: (status: boolean) => void) {
    this.statusCallbacks.push(callback);
    // Immediately notify current status
    callback(this.isConnected);

    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  public onError(callback: (error: Error) => void) {
    this.errorCallbacks.push(callback);

    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  private notifyStatusChange(status: boolean) {
    this.statusCallbacks.forEach(callback => callback(status));
  }

  private notifyError(error: Error) {
    this.errorCallbacks.forEach(callback => callback(error));
  }

  public subscribe<T = MQTTInverterData | MQTTEnvironmentData>(topic: string, callback: MQTTMessageCallback<T>) {
    if (!this.callbacks.has(topic)) {
      this.callbacks.set(topic, []);
    }
    this.callbacks.get(topic)?.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(topic) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  public async publish(topic: string, message: Record<string, unknown>) {
    if (!this.isConnected) {
      console.warn('Cannot publish: MQTT client not connected, attempting to reconnect...');
      await this.reconnect();
    }

    if (this.client && this.isConnected) {
      this.client.publish(topic, JSON.stringify(message));
    } else {
      throw new Error('Failed to publish: MQTT client not connected');
    }
  }

  public getConnectionStatus() {
    return this.isConnected;
  }

  public async reconnect() {
    if (!this.isConnected) {
      this.reconnectAttempts = 0;
      await this.initializeConnection();
    }
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.client) {
      this.client.end();
      this.client = null;
    }
    this.isConnected = false;
    this.notifyStatusChange(false);
  }

  public transformToRealtimeData(inverterData: MQTTInverterData, environmentData?: { temperature: number; humidity: number } | null): RealtimeData {
    return {
      device_id: inverterData.device_id,
      timestamp: inverterData.timestamp,
      generator: {
        status: inverterData.ac_voltage > 200 ? 'running' : 'stopped',
        voltage: inverterData.ac_voltage,
        frequency: inverterData.ac_frequency,
      },
      battery: {
        capacity_percent: inverterData.battery_capacity,
        capacity_kwh: (inverterData.battery_capacity / 100) * 19.2,
        voltage: inverterData.battery_voltage,
        charging_current: inverterData.charging_current,
        discharge_current: inverterData.battery_discharge_current,
      },
      solar: {
        power_w: inverterData.pv1_charging_power,
        power_kwh: inverterData.pv1_charging_power / 1000,
        voltage: inverterData.pv1_input_voltage,
        current: inverterData.pv1_input_current,
        carbon_reduction: (inverterData.pv1_charging_power / 1000) * 0.4781,
      },
      inverter: {
        output_voltage: inverterData.output_voltage,
        output_frequency: inverterData.output_frequency,
        output_power: inverterData.output_active_power,
        load_percentage: inverterData.load_percentage,
      },
      environment: environmentData || undefined,
    };
  }
}

// Create singleton instance
const mqttService = new SecureMQTTService();

export default mqttService;