// ─── Domain primitives ───────────────────────────────────────────────────────

export type Route = '/home' | '/shop' | '/api' | '/checkout' | '/blog';
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TimeRange = '1m' | '5m' | '15m' | '1h';
export type ActiveChart = 'VOLUME' | 'ERRORS' | 'LATENCY';

// ─── SSE wire types (what the server emits) ──────────────────────────────────

export interface RawTickPayload {
  type: 'TICK';
  ts: number;
  tps: number;
  requests_today: number;
}

export interface RawFraudSignalPayload {
  type: 'FRAUD_SIGNAL';
  ts: number;
  req_id: string;
  error_rate: number;
  resp_ms: number;
  route: Route;
  flagged: boolean;
}

export interface RawGatewayHealthPayload {
  type: 'GATEWAY_HEALTH';
  ts: number;
  corridors: Record<Route, { latency_ms: number; success_rate: number; tps: number }>;
}

export interface RawLatencyMatrixPayload {
  type: 'LATENCY_MATRIX';
  ts: number;
  matrix: Record<Route, number[]>;
}

export interface RawAlertPayload {
  type: 'ALERT';
  ts: number;
  alert_id: string;
  severity: AlertSeverity;
  req_id: string;
  message: string;
  route: Route;
  resp_ms: number;
  error_rate: number;
}

export interface RawKPISnapshotPayload {
  type: 'KPI_SNAPSHOT';
  ts: number;
  total_rps: number;
  error_rate_pct: number;
  uptime_pct: number;
  requests_24h: number;
}

export type RawSSEPayload =
  | RawTickPayload
  | RawFraudSignalPayload
  | RawGatewayHealthPayload
  | RawLatencyMatrixPayload
  | RawAlertPayload
  | RawKPISnapshotPayload;

// ─── Normalized store types ───────────────────────────────────────────────────

export interface TickPoint {
  ts: number;
  tps: number;
}

export interface FraudPoint {
  ts: number;
  req_id: string;
  error_rate: number;
  resp_ms: number;
  route: Route;
  flagged: boolean;
}

export interface GatewayHealth {
  route: Route;
  latency_ms: number;
  success_rate: number;
  tps: number;
}

export interface LatencyCell {
  route: Route;
  bucket: number;
  value: number;
}

export interface ActivityRow {
  id: string;
  ts: number;
  severity: AlertSeverity;
  req_id: string;
  message: string;
  route: Route;
  resp_ms: number;
  error_rate: number;
}

export interface KPISnapshot {
  total_rps: number;
  error_rate_pct: number;
  uptime_pct: number;
  requests_24h: number;
}

export interface StreamState {
  connected: boolean;
  paused: boolean;
  reconnectAttempts: number;
}
