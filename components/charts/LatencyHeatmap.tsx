'use client';

import React, { useMemo } from 'react';
import { useDashboardStore, selectLatencyCells } from '@/lib/store/dashboardStore';
import { latencyColor } from '@/lib/utils/chartHelpers';
import { formatLatency } from '@/lib/utils/formatters';

const ROUTES = ['/home', '/shop', '/api', '/checkout', '/blog'] as const;
const BUCKETS   = 12;
const CELL_W    = 100 / BUCKETS;

export const LatencyHeatmap = React.memo(function LatencyHeatmap() {
  const cells = useDashboardStore(selectLatencyCells);

  const { cellMap, globalMin, globalMax } = useMemo(() => {
    const map: Record<string, number> = {};
    let min = Infinity;
    let max = -Infinity;

    for (const c of cells) {
      map[`${c.route}:${c.bucket}`] = c.value;
      if (c.value < min) min = c.value;
      if (c.value > max) max = c.value;
    }

    return { cellMap: map, globalMin: min === Infinity ? 0 : min, globalMax: max === -Infinity ? 500 : max };
  }, [cells]);

  if (cells.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#4a4a7a] font-mono text-xs">
        Awaiting response time data…
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Time bucket labels */}
      <div className="flex px-20 pb-1">
        {Array.from({ length: BUCKETS }, (_, i) => (
          <div
            key={i}
            className="text-[9px] font-mono text-[#2a2a4a] text-center"
            style={{ width: `${CELL_W}%` }}
          >
            -{(BUCKETS - 1 - i) * 5}s
          </div>
        ))}
      </div>

      {/* Heatmap rows */}
      <div className="flex-1 flex flex-col gap-[2px] px-2">
        {ROUTES.map((route) => (
          <div key={route} className="flex items-center gap-2 flex-1">
            {/* Route label */}
            <div className="w-18 text-right shrink-0" style={{ width: '70px' }}>
              <span className="font-mono text-[10px] text-[#4a4a7a]">{route}</span>
            </div>

            {/* Cells */}
            <div className="flex gap-[2px] flex-1 h-full">
              {Array.from({ length: BUCKETS }, (_, bucket) => {
                const value = cellMap[`${route}:${bucket}`] ?? 0;
                const color = latencyColor(value, globalMin, globalMax);
                return (
                  <div
                    key={bucket}
                    className="flex-1 rounded-[2px] relative group cursor-default transition-opacity hover:opacity-90"
                    style={{ backgroundColor: color, minHeight: '20px' }}
                    title={`${route} t-${(BUCKETS - 1 - bucket) * 5}s: ${formatLatency(value)}`}
                  >
                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#0d0d1f] border border-[#1a1a35] rounded text-[9px] font-mono text-[#e2e8f0] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-20 transition-opacity">
                      {formatLatency(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 px-2 pt-2 pb-1">
        <span className="font-mono text-[9px] text-[#2a2a4a]">{formatLatency(globalMin)} fast</span>
        <div
          className="flex-1 h-1.5 rounded-full"
          style={{
            background: 'linear-gradient(to right, #10b981, #f59e0b, #ef4444)',
          }}
        />
        <span className="font-mono text-[9px] text-[#2a2a4a]">slow {formatLatency(globalMax)}</span>
      </div>
    </div>
  );
});
