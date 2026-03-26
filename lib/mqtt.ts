import mqtt from 'mqtt';
import { RealtimeData, MQTTInverterData, MQTTEnvironmentData } from '@/types/solar';

class MQTTService {
  private client: mqtt.MqttClient | null = null;
  private callbacks: Map<string, ((data: any) => void)[]> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private isConnecting: boolean = false; // 🔒 Prevent duplicate connections

  constructor() {
    if (typeof window !== 'undefined') {
      // 🔒 HMR Safety: Check if already connected
      if (this.client && this.isConnected) {
        console.log('♻️ HMR: Reusing existing MQTT connection');
        return;
      }
      this.connect();
    }
  }

  private connect() {
    // 🔒 Prevent duplicate connections during HMR
    if (this.isConnecting || (this.client && this.isConnected)) {
      console.log('⚠️ Connection already in progress or established, skipping...');
      return;
    }

    this.isConnecting = true;

    // 🔍 ENVIRONMENT VARIABLE DEBUGGING
    console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      isClient: typeof window !== 'undefined',
      isBrowser: typeof window !== 'undefined',
    });
    console.log('MQTT Config from process.env:', {
      NEXT_PUBLIC_HIVEMQ_HOST: process.env.NEXT_PUBLIC_HIVEMQ_HOST,
      NEXT_PUBLIC_HIVEMQ_PORT: process.env.NEXT_PUBLIC_HIVEMQ_PORT,
      NEXT_PUBLIC_HIVEMQ_USERNAME: process.env.NEXT_PUBLIC_HIVEMQ_USERNAME,
      NEXT_PUBLIC_HIVEMQ_PASSWORD: process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD ? '[SET]' : '[NOT SET]',
    });
    console.log('===================================');

    const host = process.env.NEXT_PUBLIC_HIVEMQ_HOST;
    const port = parseInt(process.env.NEXT_PUBLIC_HIVEMQ_PORT || '8884');
    const username = process.env.NEXT_PUBLIC_HIVEMQ_USERNAME;
    const password = process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD;

    if (!host || !username || !password) {
      console.error('❌ Missing required MQTT environment variables', {
        hasHost: !!host,
        host: host || 'MISSING',
        hasUsername: !!username,
        username: username || 'MISSING',
        hasPassword: !!password,
        passwordLength: password?.length || 0,
      });
      console.error('💡 Check your .env or .env.local file');
      console.error('💡 Make sure to restart dev server after changing .env files');
      this.isConnecting = false; // 🔒 Reset flag
      return;
    }

    const url = `wss://${host}:${port}/mqtt`;

    console.log('✅ Connecting to MQTT broker:', {
      url,
      username: username.substring(0, 15) + '...',
      port,
      passwordLength: password.length,
    });

    // Don't encode credentials - MQTT.js handles this internally
    // Data arrives every 30 seconds, so adjust timeouts accordingly
    this.client = mqtt.connect(url, {
      username: username,  // Use plain username, not encoded
      password: password,  // Use plain password, not encoded
      clientId: `mysolar_dashboard_${Math.random().toString(16).substring(2, 10)}`,
      protocol: 'wss',
      reconnectPeriod: 5000,      // Retry connection every 5 seconds
      connectTimeout: 45000,       // Wait 45 seconds for connection (longer than data interval)
      clean: true,
      rejectUnauthorized: true,
      keepalive: 60,               // Send keepalive every 60 seconds
    });

    this.client.on('connect', () => {
      console.log('✅ Connected to MQTT broker');
      this.isConnected = true;
      this.isConnecting = false; // 🔒 Reset flag
      this.reconnectAttempts = 0;

      // Subscribe to topics
      this.client?.subscribe('solar/inverter/status', { qos: 0 });
      this.client?.subscribe('solar/environment/data', { qos: 0 });

      console.log('✅ Subscribed to topics: solar/inverter/status, solar/environment/data');
    });

    this.client.on('message', (topic: string, message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message on topic:', topic, data);

        const callbacks = this.callbacks.get(topic) || [];
        callbacks.forEach(callback => callback(data));
      } catch (error) {
        console.error('Error parsing MQTT message:', error);
      }
    });

    this.client.on('error', (error: any) => {
      // Comprehensive error logging
      console.error('===== MQTT ERROR START =====');
      console.error('Raw error object:', error);
      console.error('Error code value:', error?.code);
      console.error('Error code type:', typeof error?.code);
      console.error('Error stringified:', JSON.stringify(error, null, 2));

      // MQTT error codes:
      // 0 = Connection accepted
      // 1 = Unacceptable protocol version
      // 2 = Identifier rejected
      // 3 = Server unavailable
      // 4 = Bad username or password
      // 5 = Not authorized

      const errorCode = error?.code;
      let errorDescription = 'Unknown error';

      if (errorCode === 1) errorDescription = 'Unacceptable protocol version';
      else if (errorCode === 2) errorDescription = 'Client identifier rejected';
      else if (errorCode === 3) errorDescription = 'Server unavailable';
      else if (errorCode === 4) errorDescription = 'Bad username or password ❌';
      else if (errorCode === 5) errorDescription = 'Not authorized ❌';

      console.error(`Error Code ${errorCode}: ${errorDescription}`);

      // Log connection details for debugging
      console.error('Connection attempt details:', {
        host: process.env.NEXT_PUBLIC_HIVEMQ_HOST,
        port: process.env.NEXT_PUBLIC_HIVEMQ_PORT,
        username: process.env.NEXT_PUBLIC_HIVEMQ_USERNAME,
        passwordLength: process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD?.length,
        url: `wss://${process.env.NEXT_PUBLIC_HIVEMQ_HOST}:${process.env.NEXT_PUBLIC_HIVEMQ_PORT}/mqtt`,
      });

      console.error('===== MQTT ERROR END =====');

      this.isConnected = false;
      this.isConnecting = false; // 🔒 Reset flag on error
    });

    this.client.on('offline', () => {
      console.log('MQTT client offline');
      this.isConnected = false;
    });

    this.client.on('reconnect', () => {
      this.reconnectAttempts++;
      console.log(`🔄 MQTT reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error(`❌ Max reconnect attempts (${this.maxReconnectAttempts}) reached. Stopping reconnection.`);
        this.client?.end(true);
      }
    });

    this.client.on('disconnect', () => {
      console.log('⚠️ MQTT disconnected');
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('🔌 MQTT connection closed');
      this.isConnected = false;
      this.isConnecting = false;
    });
  }

  public subscribe(topic: string, callback: (data: any) => void) {
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

  public publish(topic: string, message: any) {
    if (this.client && this.isConnected) {
      this.client.publish(topic, JSON.stringify(message));
    } else {
      console.warn('Cannot publish: MQTT client not connected');
    }
  }

  public getConnectionStatus() {
    return this.isConnected;
  }

  public reconnect() {
    if (!this.isConnected && this.client) {
      this.client.reconnect();
    }
  }

  public disconnect() {
    if (this.client) {
      this.client.end();
    }
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
const mqttService = new MQTTService();

export default mqttService;