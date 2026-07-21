import { useEffect, useState, useCallback, useRef } from 'react';
import mqttService from '@/lib/mqtt';
import { RealtimeData } from '@/types/solar';

interface UseMQTTDataOptions {
  deviceId?: string;
  onError?: (error: Error) => void;
}

export function useMQTTData(options: UseMQTTDataOptions = {}) {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'waiting' | 'connected' | 'failed'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Use ref to avoid re-subscription when environment data changes
  const environmentDataRef = useRef<{ temperature: number; humidity: number } | null>(null);

  useEffect(() => {
    let unsubscribeInverter: (() => void) | null = null;
    let unsubscribeEnvironment: (() => void) | null = null;
    let connectionTimeout: NodeJS.Timeout;
    let statusTimeout: NodeJS.Timeout;

    // Set connection timeout - allow time for initial 30-second data cycle
    connectionTimeout = setTimeout(() => {
      if (isInitialLoading) {
        setConnectionStatus('failed');
        setIsInitialLoading(false);
      }
    }, 60000); // 60 seconds timeout (2x data interval to allow for first message)

    // Update status messages
    statusTimeout = setTimeout(() => {
      if (connectionStatus === 'connecting') {
        setConnectionStatus('waiting');
      }
    }, 10000); // After 10 seconds, show "waiting" status

    const setupSubscriptions = () => {

      const inverterTopic = options.deviceId ? `solar/inverter/status/${options.deviceId}` : 'solar/inverter/status/+';
      const envTopic = options.deviceId ? `solar/environment/data/${options.deviceId}` : 'solar/environment/data/+';

      // Subscribe to inverter status
      unsubscribeInverter = mqttService.subscribe(inverterTopic, (inverterData) => {
        console.log('Received inverter data:', inverterData);

        // Check if this is for our device
        if (options.deviceId && inverterData.device_id !== options.deviceId) {
          return;
        }

        const realtimeData = mqttService.transformToRealtimeData(inverterData, environmentDataRef.current);
        setData(realtimeData);
        setLastUpdate(new Date());
        setIsConnected(true);
        setIsInitialLoading(false);
        setConnectionStatus('connected');
        clearTimeout(connectionTimeout);
        clearTimeout(statusTimeout);
      });

      // Subscribe to environment data
      unsubscribeEnvironment = mqttService.subscribe(envTopic, (envData) => {
        console.log('Received environment data:', envData);

        // Check if this is for our device
        if (options.deviceId && envData.device_id !== options.deviceId) {
          return;
        }

        environmentDataRef.current = {
          temperature: envData.temperature,
          humidity: envData.humidity,
        };

        // Update existing data with new environment data if available
        setData(prevData => {
          if (prevData) {
            return {
              ...prevData,
              environment: {
                temperature: envData.temperature,
                humidity: envData.humidity,
              },
            };
          }
          return prevData;
        });
      });

      // Check connection status periodically
      const connectionCheck = setInterval(() => {
        const connected = mqttService.getConnectionStatus();
        setIsConnected(connected);
      }, 2000);

      return () => {
        if (unsubscribeInverter) unsubscribeInverter();
        if (unsubscribeEnvironment) unsubscribeEnvironment();
        clearInterval(connectionCheck);
        clearTimeout(connectionTimeout);
        clearTimeout(statusTimeout);
      };
    };

    const cleanup = setupSubscriptions();

    return () => {
      if (cleanup) cleanup();
    };
  }, [options.deviceId]);

  const reconnect = useCallback(() => {
    setIsInitialLoading(true);
    setConnectionStatus('connecting');
    mqttService.reconnect();
  }, []);

  return {
    data,
    isConnected,
    isInitialLoading,
    connectionStatus,
    lastUpdate,
    reconnect,
  };
}