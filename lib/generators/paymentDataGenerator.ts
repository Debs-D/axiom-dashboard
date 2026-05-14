import type { Route, AlertSeverity } from '@/types';

const ROUTES: Route[] = ['/home', '/shop', '/api', '/checkout', '/blog'];

// Gaussian noise via Box-Muller transform
function gaussian(mean: number, std: number): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function hexId(len: number): string {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// Simulates traffic patterns — peaks during business hours, quiet at night
let _phase = 0;
let _requestsToday = 0;
let _alertSeq = 1000;

export function generateTick() {
  _phase += 0.002;
  const wave = Math.sin(_phase) * 40 + Math.sin(_phase * 3.7) * 12;
  const tps = clamp(gaussian(150 + wave, 12), 20, 600);
  _requestsToday += Math.floor(tps * 0.1);

  return {
    type: 'TICK' as const,
    ts: Date.now(),
    tps: Math.round(tps * 10) / 10,
    requests_today: _requestsToday,
  };
}

export function generateFraudSignal() {
  const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];

  // /checkout and /api have slightly higher error rates than static pages
  const baseErrorRate: Record<Route, number> = {
    '/home':     0.008,
    '/shop':     0.015,
    '/api':      0.020,
    '/checkout': 0.025,
    '/blog':     0.006,
  };

  const raw = gaussian(baseErrorRate[route], 0.05);
  const error_rate = clamp(raw, 0, 1);

  // Response times vary by route (API is fastest, blog slowest due to content rendering)
  const baseResp: Record<Route, number> = {
    '/home':     120,
    '/shop':     220,
    '/api':      80,
    '/checkout': 310,
    '/blog':     480,
  };
  const resp_ms = clamp(gaussian(baseResp[route], baseResp[route] * 0.2), 10, 5000);

  return {
    type: 'FRAUD_SIGNAL' as const,
    ts: Date.now(),
    req_id: `REQ-${hexId(8).toUpperCase()}`,
    error_rate: Math.round(error_rate * 1000) / 1000,
    resp_ms: Math.round(resp_ms),
    route,
    flagged: error_rate > 0.10,
  };
}

const BASE_RESPONSE_MS: Record<Route, number> = {
  '/home':     120,
  '/shop':     220,
  '/api':      80,
  '/checkout': 310,
  '/blog':     480,
};

export function generateGatewayHealth() {
  const corridors = Object.fromEntries(
    ROUTES.map(r => [
      r,
      {
        latency_ms: clamp(gaussian(BASE_RESPONSE_MS[r], BASE_RESPONSE_MS[r] * 0.15), 10, 5000),
        success_rate: clamp(gaussian(0.985, 0.012), 0.85, 1),
        tps: clamp(gaussian(30, 12), 1, 300),
      },
    ])
  ) as Record<Route, { latency_ms: number; success_rate: number; tps: number }>;

  return { type: 'GATEWAY_HEALTH' as const, ts: Date.now(), corridors };
}

export function generateLatencyMatrix() {
  const matrix = Object.fromEntries(
    ROUTES.map(r => {
      let prev = BASE_RESPONSE_MS[r];
      const buckets = Array.from({ length: 12 }, () => {
        prev = clamp(prev + gaussian(0, prev * 0.1), 10, 5000);
        return Math.round(prev);
      });
      return [r, buckets];
    })
  ) as Record<Route, number[]>;

  return { type: 'LATENCY_MATRIX' as const, ts: Date.now(), matrix };
}

const ALERT_MESSAGES: Record<AlertSeverity, string[]> = {
  CRITICAL: [
    '/checkout is returning 500 for all users — server crashed',
    'Database connection pool exhausted — queries timing out',
    'Out-of-memory error on API server — pod restarting now',
    '/api/orders returning 503 — downstream payment service is down',
  ],
  HIGH: [
    'Response time on /shop spiked to 4.2s — p99 heavily degraded',
    'Traffic spike on /home — 3.8x above normal baseline',
    'Error rate on /checkout jumped to 18% in the last 60 seconds',
    'CDN cache miss rate at 94% — origin server getting hammered',
  ],
  MEDIUM: [
    'Slow query detected on /api/products — averaging 820ms',
    'Memory usage at 78% on web-01 — approaching warning threshold',
    '/blog page load averaging 2.1s — above the 1.5s SLA target',
    'Auth service latency elevated to 340ms — login flow affected',
  ],
  LOW: [
    'Scheduled deployment starting in 10 minutes — brief downtime expected',
    'Cache warming complete — hit rate back to normal levels',
    '/shop load time improved 12% since last deploy',
    'SSL certificate renews in 7 days — auto-renewal is enabled',
  ],
};

export function generateAlert() {
  const rand = Math.random();
  const severity: AlertSeverity =
    rand < 0.05 ? 'CRITICAL' :
    rand < 0.25 ? 'HIGH' :
    rand < 0.70 ? 'MEDIUM' : 'LOW';

  const msgs = ALERT_MESSAGES[severity];
  const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];

  const errorRateByLevel: Record<AlertSeverity, () => number> = {
    CRITICAL: () => clamp(gaussian(0.45, 0.12), 0.25, 1),
    HIGH:     () => clamp(gaussian(0.18, 0.06), 0.10, 0.40),
    MEDIUM:   () => clamp(gaussian(0.08, 0.03), 0.04, 0.20),
    LOW:      () => clamp(gaussian(0.02, 0.01), 0.00, 0.06),
  };

  const respByLevel: Record<AlertSeverity, () => number> = {
    CRITICAL: () => clamp(gaussian(4500, 800), 2000, 8000),
    HIGH:     () => clamp(gaussian(2200, 600), 1000, 5000),
    MEDIUM:   () => clamp(gaussian(900, 250), 400, 2500),
    LOW:      () => clamp(gaussian(280, 80), 100, 600),
  };

  return {
    type: 'ALERT' as const,
    ts: Date.now(),
    alert_id: `EVT-${(++_alertSeq).toString().padStart(6, '0')}`,
    severity,
    req_id: `REQ-${hexId(8).toUpperCase()}`,
    message: msgs[Math.floor(Math.random() * msgs.length)],
    route,
    resp_ms: Math.round(respByLevel[severity]()),
    error_rate: Math.round(errorRateByLevel[severity]() * 1000) / 1000,
  };
}

export function generateKPI() {
  return {
    type: 'KPI_SNAPSHOT' as const,
    ts: Date.now(),
    total_rps: Math.round(clamp(gaussian(152, 18), 20, 600) * 10) / 10,
    error_rate_pct: Math.round(clamp(gaussian(2.7, 0.4), 0.1, 15) * 100) / 100,
    uptime_pct: Math.round(clamp(gaussian(99.97, 0.01), 99.8, 100) * 10000) / 10000,
    requests_24h: _requestsToday + Math.floor(gaussian(11_200_000, 400_000)),
  };
}
