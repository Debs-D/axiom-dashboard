import type { TimeRange } from '@/types';

export const TIME_RANGE_MS: Record<TimeRange, number> = {
  '1m':  60_000,
  '5m':  300_000,
  '15m': 900_000,
  '1h':  3_600_000,
};

export function filterByTimeRange<T extends { ts: number }>(
  data: T[],
  range: TimeRange
): T[] {
  const cutoff = Date.now() - TIME_RANGE_MS[range];
  return data.filter(p => p.ts >= cutoff);
}

// FIFO eviction — keeps array under max length
export function pushFIFO<T>(arr: T[], item: T, max: number): T[] {
  const base = arr.length >= max ? arr.slice(-(max - 1)) : arr;
  return [...base, item];
}

// Interpolate two hex colors by t (0–1)
export function interpolateColor(
  from: [number, number, number],
  to: [number, number, number],
  t: number
): string {
  const r = Math.round(from[0] + (to[0] - from[0]) * t);
  const g = Math.round(from[1] + (to[1] - from[1]) * t);
  const b = Math.round(from[2] + (to[2] - from[2]) * t);
  return `rgb(${r},${g},${b})`;
}

// Emerald → Amber → Red ramp for latency heatmap
export function latencyColor(value: number, min: number, max: number): string {
  const range = max - min || 1;
  const t = Math.max(0, Math.min(1, (value - min) / range));

  const emerald: [number, number, number] = [16, 185, 129];
  const amber: [number, number, number]   = [245, 158, 11];
  const red: [number, number, number]     = [239, 68, 68];

  if (t < 0.5) return interpolateColor(emerald, amber, t * 2);
  return interpolateColor(amber, red, (t - 0.5) * 2);
}

export function fraudRiskColor(score: number): string {
  if (score > 0.72) return '#ef4444';
  if (score > 0.45) return '#f59e0b';
  return '#10b981';
}
