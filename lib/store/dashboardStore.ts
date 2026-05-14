import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { pushFIFO } from '@/lib/utils/chartHelpers';
import type {
  TickPoint,
  FraudPoint,
  GatewayHealth,
  LatencyCell,
  ActivityRow,
  KPISnapshot,
  StreamState,
  TimeRange,
  ActiveChart,
} from '@/types';

const MAX_CHART_POINTS = 300;
const MAX_FEED_ROWS = 1000;

interface DashboardStore {
  // Stream control
  stream: StreamState;
  setConnected: (v: boolean) => void;
  setPaused: (v: boolean) => void;
  incrementReconnect: () => void;
  resetReconnect: () => void;

  // UI state
  activeChart: ActiveChart;
  timeRange: TimeRange;
  setActiveChart: (c: ActiveChart) => void;
  setTimeRange: (r: TimeRange) => void;

  // Data slices
  tickSeries: TickPoint[];
  fraudSeries: FraudPoint[];
  gatewayHealth: GatewayHealth[];
  latencyCells: LatencyCell[];
  activityFeed: ActivityRow[];
  kpi: KPISnapshot;

  // Batched mutations
  pushTicks: (points: TickPoint[]) => void;
  pushFraudPoints: (points: FraudPoint[]) => void;
  setGatewayHealth: (health: GatewayHealth[]) => void;
  setLatencyCells: (cells: LatencyCell[]) => void;
  prependActivities: (rows: ActivityRow[]) => void;
  setKPI: (kpi: KPISnapshot) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  subscribeWithSelector((set) => ({
    stream: { connected: false, paused: false, reconnectAttempts: 0 },
    setConnected: (connected) => set((s) => ({ stream: { ...s.stream, connected } })),
    setPaused: (paused) => set((s) => ({ stream: { ...s.stream, paused } })),
    incrementReconnect: () =>
      set((s) => ({ stream: { ...s.stream, reconnectAttempts: s.stream.reconnectAttempts + 1 } })),
    resetReconnect: () =>
      set((s) => ({ stream: { ...s.stream, reconnectAttempts: 0 } })),

    activeChart: 'VOLUME',
    timeRange: '5m',
    setActiveChart: (activeChart) => set({ activeChart }),
    setTimeRange: (timeRange) => set({ timeRange }),

    tickSeries: [],
    fraudSeries: [],
    gatewayHealth: [],
    latencyCells: [],
    activityFeed: [],
    kpi: { total_rps: 0, error_rate_pct: 0, uptime_pct: 0, requests_24h: 0 },

    pushTicks: (points) =>
      set((s) => {
        let series = s.tickSeries;
        for (const p of points) series = pushFIFO(series, p, MAX_CHART_POINTS);
        return { tickSeries: series };
      }),

    pushFraudPoints: (points) =>
      set((s) => {
        let series = s.fraudSeries;
        for (const p of points) series = pushFIFO(series, p, MAX_CHART_POINTS);
        return { fraudSeries: series };
      }),

    setGatewayHealth: (gatewayHealth) => set({ gatewayHealth }),
    setLatencyCells: (latencyCells) => set({ latencyCells }),

    prependActivities: (rows) =>
      set((s) => ({
        activityFeed: [...rows, ...s.activityFeed].slice(0, MAX_FEED_ROWS),
      })),

    setKPI: (kpi) => set({ kpi }),
  }))
);

// Fine-grained selectors — import these in components, never destructure store directly
export const selectTickSeries    = (s: DashboardStore) => s.tickSeries;
export const selectFraudSeries   = (s: DashboardStore) => s.fraudSeries;
export const selectGatewayHealth = (s: DashboardStore) => s.gatewayHealth;
export const selectLatencyCells  = (s: DashboardStore) => s.latencyCells;
export const selectActivityFeed  = (s: DashboardStore) => s.activityFeed;
export const selectKPI           = (s: DashboardStore) => s.kpi;
export const selectStream        = (s: DashboardStore) => s.stream;
export const selectActiveChart   = (s: DashboardStore) => s.activeChart;
export const selectTimeRange     = (s: DashboardStore) => s.timeRange;
