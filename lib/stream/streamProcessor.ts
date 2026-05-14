import { z } from 'zod';

const routeEnum = z.enum(['/home', '/shop', '/api', '/checkout', '/blog']);
const severityEnum = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);

const TickSchema = z.object({
  type: z.literal('TICK'),
  ts: z.number().int().positive(),
  tps: z.number().min(0).max(100_000),
  requests_today: z.number().nonnegative(),
});

const FraudSignalSchema = z.object({
  type: z.literal('FRAUD_SIGNAL'),
  ts: z.number().int().positive(),
  req_id: z.string().min(1),
  error_rate: z.number().min(0).max(1),
  resp_ms: z.number().nonnegative(),
  route: routeEnum,
  flagged: z.boolean(),
});

const routeHealthSchema = z.object({
  latency_ms: z.number().nonnegative(),
  success_rate: z.number().min(0).max(1),
  tps: z.number().nonnegative(),
});

const GatewayHealthSchema = z.object({
  type: z.literal('GATEWAY_HEALTH'),
  ts: z.number().int().positive(),
  corridors: z.object({
    '/home':     routeHealthSchema,
    '/shop':     routeHealthSchema,
    '/api':      routeHealthSchema,
    '/checkout': routeHealthSchema,
    '/blog':     routeHealthSchema,
  }),
});

const LatencyMatrixSchema = z.object({
  type: z.literal('LATENCY_MATRIX'),
  ts: z.number().int().positive(),
  matrix: z.object({
    '/home':     z.array(z.number().nonnegative()).length(12),
    '/shop':     z.array(z.number().nonnegative()).length(12),
    '/api':      z.array(z.number().nonnegative()).length(12),
    '/checkout': z.array(z.number().nonnegative()).length(12),
    '/blog':     z.array(z.number().nonnegative()).length(12),
  }),
});

const AlertSchema = z.object({
  type: z.literal('ALERT'),
  ts: z.number().int().positive(),
  alert_id: z.string().min(1),
  severity: severityEnum,
  req_id: z.string(),
  message: z.string().max(200),
  route: routeEnum,
  resp_ms: z.number().nonnegative(),
  error_rate: z.number().min(0).max(1),
});

const KPISnapshotSchema = z.object({
  type: z.literal('KPI_SNAPSHOT'),
  ts: z.number().int().positive(),
  total_rps: z.number().nonnegative(),
  error_rate_pct: z.number().min(0).max(100),
  uptime_pct: z.number().min(0).max(100),
  requests_24h: z.number().nonnegative(),
});

export const SSEPayloadSchema = z.discriminatedUnion('type', [
  TickSchema,
  FraudSignalSchema,
  GatewayHealthSchema,
  LatencyMatrixSchema,
  AlertSchema,
  KPISnapshotSchema,
]);

export type ValidatedSSEPayload = z.infer<typeof SSEPayloadSchema>;

export function parseSSEPayload(raw: string): ValidatedSSEPayload | null {
  try {
    const json = JSON.parse(raw);
    const result = SSEPayloadSchema.safeParse(json);
    if (!result.success) return null;
    return result.data;
  } catch {
    return null;
  }
}
