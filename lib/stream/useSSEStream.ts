'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useDashboardStore } from '@/lib/store/dashboardStore';
import { parseSSEPayload } from './streamProcessor';
import { useThrottledUpdate } from '@/hooks/useThrottledUpdate';

const BASE_DELAY = 1000;
const MAX_DELAY = 30_000;
const MAX_ATTEMPTS = 10;

export function useSSEStream() {
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const pausedRef = useRef(false);
  const { enqueue } = useThrottledUpdate();

  // Track paused state without re-creating the connect function
  useEffect(() => {
    return useDashboardStore.subscribe(
      (s) => s.stream.paused,
      (paused) => { pausedRef.current = paused; }
    );
  }, []);

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const es = new EventSource('/api/stream');
    esRef.current = es;

    es.onopen = () => {
      useDashboardStore.getState().setConnected(true);
      useDashboardStore.getState().resetReconnect();
      attemptRef.current = 0;
    };

    es.onmessage = (event: MessageEvent) => {
      if (pausedRef.current) return;
      const payload = parseSSEPayload(event.data);
      if (payload) enqueue(payload);
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      useDashboardStore.getState().setConnected(false);

      if (attemptRef.current >= MAX_ATTEMPTS) return;

      // Full jitter exponential backoff
      const delay = Math.min(
        BASE_DELAY * Math.pow(2, attemptRef.current) * (0.5 + Math.random() * 0.5),
        MAX_DELAY
      );
      attemptRef.current++;
      useDashboardStore.getState().incrementReconnect();
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, [enqueue]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      useDashboardStore.getState().setConnected(false);
    };
  }, [connect]);

  return { reconnect: connect };
}
