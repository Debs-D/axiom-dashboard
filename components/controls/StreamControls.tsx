'use client';

import { useDashboardStore, selectStream, selectTimeRange } from '@/lib/store/dashboardStore';
import type { TimeRange } from '@/types';
import { cn } from '@/lib/utils/cn';

const TIME_RANGES: { id: TimeRange; label: string }[] = [
  { id: '1m',  label: '1M' },
  { id: '5m',  label: '5M' },
  { id: '15m', label: '15M' },
  { id: '1h',  label: '1H' },
];

export function StreamControls() {
  const stream    = useDashboardStore(selectStream);
  const timeRange = useDashboardStore(selectTimeRange);
  const setPaused    = useDashboardStore((s) => s.setPaused);
  const setTimeRange = useDashboardStore((s) => s.setTimeRange);

  function handleExport() {
    const state = useDashboardStore.getState();
    const snapshot = {
      exported_at: new Date().toISOString(),
      kpi: state.kpi,
      traffic_last_100: state.tickSeries.slice(-100),
      route_health: state.gatewayHealth,
      recent_events: state.activityFeed.slice(0, 25),
      error_signals_last_50: state.fraudSeries.slice(-50),
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `pulse-snapshot-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-3">
      {/* Time range */}
      <div className="flex items-center gap-0.5 bg-[#06060f] rounded border border-[#1a1a35] p-0.5">
        {TIME_RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setTimeRange(r.id)}
            className={cn(
              'px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-all',
              timeRange === r.id
                ? 'bg-[#8b5cf6] text-white'
                : 'text-[#4a4a7a] hover:text-[#94a3b8]'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Pause / Resume */}
      <button
        onClick={() => setPaused(!stream.paused)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-mono font-semibold transition-all',
          stream.paused
            ? 'border-[#f59e0b]/40 text-[#f59e0b] bg-[#f59e0b]/10 hover:bg-[#f59e0b]/15'
            : 'border-[#1a1a35] text-[#94a3b8] hover:border-[#8b5cf6]/40 hover:text-[#8b5cf6]'
        )}
      >
        <span className={stream.paused ? 'text-[#f59e0b]' : 'text-[#4a4a7a]'}>
          {stream.paused ? '▶' : '⏸'}
        </span>
        {stream.paused ? 'RESUME' : 'PAUSE'}
      </button>

      {/* Export */}
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1a1a35] text-[10px] font-mono font-semibold text-[#94a3b8] hover:border-[#8b5cf6]/40 hover:text-[#8b5cf6] transition-all"
      >
        <span className="text-[#4a4a7a]">↓</span>
        EXPORT
      </button>
    </div>
  );
}
