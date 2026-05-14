export function formatRPS(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K/s`;
  return `${v.toFixed(0)}/s`;
}

// Keep alias so chart imports don't break during transition
export const formatTPS = formatRPS;

export function formatLargeNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return `${v.toFixed(0)}`;
}

export function formatUSD(v: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: v >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: v >= 1_000_000 ? 1 : 2,
  }).format(v);
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatTimestamp(ts: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(ts));
}

export function formatTimestampShort(ts: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(ts));
}

export function formatErrorRate(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

// Keep alias
export const formatRiskScore = formatErrorRate;

export function formatUptime(v: number): string {
  return `${v.toFixed(3)}%`;
}

export function formatPct(v: number): string {
  return `${v.toFixed(2)}%`;
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 1000) return 'just now';
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return formatTimestamp(ts);
}
