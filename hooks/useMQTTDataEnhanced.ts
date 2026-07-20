'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import mqttService from '@/lib/mqtt-client';
import { RealtimeData, MQTTInverterData } from '@/types/solar';

interface DataPoint {
  timestamp: string;
  solar_power: number;
  battery_percent: number;
  load_percentage: number;
}

interface MQTTDataState {
  data: RealtimeData | null;
  history: DataPoint[];
  isConnected: boolean;
  lastUpdate: string | null;
  error: Error | null;
  reconnectAttempts: number;
}

const MAX_HISTORY_POINTS = 288; // 24 hours * 12 (5-minute intervals)
const HISTORY_INTERVAL = 300000; // 5 minutes in milliseconds

export function useMQTTDataEnhanced(deviceId?: string) {
  const [state, setState] = useState<MQTTDataState>({
    data: null,
    history: [],
    isConnected: false,
    lastUpdate: null,
    error: null,
    reconnectAttempts: 0,
  });

  const historyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHistoryUpdateRef = useRef<number>(0);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('solarDataHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setState(prev => ({ ...prev, history: parsed }));
      } catch (error) {
        console.error('Failed to load history from localStorage:', error);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (state.history.length > 0) {
      try {
        localStorage.setItem('solarDataHistory', JSON.stringify(state.history));
      } catch (error) {
        console.error('Failed to save history to localStorage:', error);
      }
    }
  }, [state.history]);

  // Add data point to history
  const addToHistory = useCallback((data: RealtimeData) => {
    const now = Date.now();

    // Only add to history if enough time has passed
    if (now - lastHistoryUpdateRef.current >= HISTORY_INTERVAL) {
      lastHistoryUpdateRef.current = now;

      const newPoint: DataPoint = {
        timestamp: new Date().toISOString(),
        solar_power: data.solar?.power_w || 0,
        battery_percent: data.battery?.capacity_percent || 0,
        load_percentage: data.inverter?.load_percentage || 0,
      };

      setState(prev => {
        const newHistory = [...prev.history, newPoint];

        // Keep only the most recent data points
        if (newHistory.length > MAX_HISTORY_POINTS) {
          return {
            ...prev,
            history: newHistory.slice(-MAX_HISTORY_POINTS),
          };
        }

        return {
          ...prev,
          history: newHistory,
        };
      });
    }
  }, []);

  // Handle connection status changes
  useEffect(() => {
    const unsubscribeStatus = mqttService.onStatusChange((status) => {
      setState(prev => ({
        ...prev,
        isConnected: status,
        error: status ? null : prev.error,
        reconnectAttempts: status ? 0 : prev.reconnectAttempts,
      }));
    });

    const unsubscribeError = mqttService.onError((error) => {
      setState(prev => ({
        ...prev,
        error,
        reconnectAttempts: prev.reconnectAttempts + 1,
      }));
    });

    return () => {
      unsubscribeStatus();
      unsubscribeError();
    };
  }, []);

  // Subscribe to MQTT topics
  useEffect(() => {
    let environmentData: { temperature: number; humidity: number } | null = null;

    const unsubscribeInverter = mqttService.subscribe('solar/inverter/status', (data: MQTTInverterData) => {

      if (deviceId && data.device_id !== deviceId) {
        return;
      }

      const realtimeData = mqttService.transformToRealtimeData(data, environmentData);

      setState(prev => ({
        ...prev,
        data: realtimeData,
        lastUpdate: new Date().toISOString(),
        error: null,
      }));

      // Add to history
      addToHistory(realtimeData);
    });

    const unsubscribeEnvironment = mqttService.subscribe<{ temperature: number; humidity: number; device_id?: string }>('solar/environment/data', (data) => {

      if (deviceId && data.device_id !== deviceId) {
        return;
      }

      environmentData = {
        temperature: data.temperature,
        humidity: data.humidity,
      };

      setState(prev => {
        if (prev.data) {
          return {
            ...prev,
            data: {
              ...prev.data,
              environment: environmentData || undefined,
            },
            lastUpdate: new Date().toISOString(),
          };
        }
        return prev;
      });
    });

    return () => {
      unsubscribeInverter();
      unsubscribeEnvironment();
      if (historyTimerRef.current) {
        clearInterval(historyTimerRef.current);
      }
    };
  }, [addToHistory, deviceId]);

  // Manual reconnect function
  const reconnect = useCallback(async () => {
    setState(prev => ({
      ...prev,
      error: null,
      reconnectAttempts: 0,
    }));

    try {
      await mqttService.reconnect();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
    }
  }, []);

  // Clear history function
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: [],
    }));
    localStorage.removeItem('solarDataHistory');
  }, []);

  // Get history by time range
  const getHistoryByRange = useCallback((hours: number): DataPoint[] => {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return state.history.filter(point =>
      new Date(point.timestamp) >= cutoffTime
    );
  }, [state.history]);

  return {
    data: state.data,
    history: state.history,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    error: state.error,
    reconnectAttempts: state.reconnectAttempts,
    reconnect,
    clearHistory,
    getHistoryByRange,
  };
}