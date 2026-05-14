'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useDashboardStore } from '@/lib/store/dashboardStore';
import type { ValidatedSSEPayload } from '@/lib/stream/streamProcessor';
import type { TickPoint, FraudPoint, GatewayHealth, ActivityRow, LatencyCell, KPISnapshot, Route } from '@/types';

const ROUTES: Route[] = ['/home', '/shop', '/api', '/checkout', '/blog'];

interface PendingBatch {
  ticks: TickPoint[];
  fraudPoints: FraudPoint[];
  gatewayHealth: GatewayHealth[] | null;
  latencyCells: LatencyCell[] | null;
  activities: ActivityRow[];
  kpi: KPISnapshot | null;
}

function emptyBatch(): PendingBatch {
  return { ticks: [], fraudPoints: [], gatewayHealth: null, latencyCells: null, activities: [], kpi: null };
}

export function useThrottledUpdate() {
  const batch = useRef<PendingBatch>(emptyBatch());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
    };
  }, []);

  const flush = useCallback(() => {
    flushTimer.current = null;
    const b = batch.current;
    batch.current = emptyBatch();

    const state = useDashboardStore.getState();
    if (b.ticks.length > 0)      state.pushTicks(b.ticks);
    if (b.fraudPoints.length > 0) state.pushFraudPoints(b.fraudPoints);
    if (b.gatewayHealth)         state.setGatewayHealth(b.gatewayHealth);
    if (b.latencyCells)          state.setLatencyCells(b.latencyCells);
    if (b.activities.length > 0) state.prependActivities(b.activities);
    if (b.kpi)                   state.setKPI(b.kpi);
  }, []);

  const scheduleFlush = useCallback(() => {
    if (!flushTimer.current) {
      flushTimer.current = setTimeout(flush, 250);
    }
  }, [flush]);

  const enqueue = useCallback((payload: ValidatedSSEPayload) => {
    switch (payload.type) {
      case 'TICK':
        batch.current.ticks.push({ ts: payload.ts, tps: payload.tps });
        break;

      case 'FRAUD_SIGNAL':
        batch.current.fraudPoints.push({
          ts: payload.ts,
          req_id: payload.req_id,
          error_rate: payload.error_rate,
          resp_ms: payload.resp_ms,
          route: payload.route,
          flagged: payload.flagged,
        });
        break;

      case 'GATEWAY_HEALTH':
        batch.current.gatewayHealth = ROUTES.map((r) => ({
          route: r,
          ...payload.corridors[r],
        }));
        break;

      case 'LATENCY_MATRIX':
        batch.current.latencyCells = ROUTES.flatMap((r) =>
          payload.matrix[r].map((value, bucket) => ({ route: r, bucket, value }))
        );
        break;

      case 'ALERT':
        batch.current.activities.unshift({
          id: payload.alert_id,
          ts: payload.ts,
          severity: payload.severity,
          req_id: payload.req_id,
          message: payload.message,
          route: payload.route,
          resp_ms: payload.resp_ms,
          error_rate: payload.error_rate,
        });
        break;

      case 'KPI_SNAPSHOT':
        batch.current.kpi = {
          total_rps: payload.total_rps,
          error_rate_pct: payload.error_rate_pct,
          uptime_pct: payload.uptime_pct,
          requests_24h: payload.requests_24h,
        };
        break;
    }
    scheduleFlush();
  }, [scheduleFlush]);

  return { enqueue };
}
