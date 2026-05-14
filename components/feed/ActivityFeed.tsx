'use client';

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDashboardStore, selectActivityFeed } from '@/lib/store/dashboardStore';
import { SeverityBadge } from './SeverityBadge';
import { formatTimestamp, formatLatency, formatErrorRate } from '@/lib/utils/formatters';
import type { ActivityRow } from '@/types';

function FeedRow({ row }: { row: ActivityRow }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-[#1a1a35]/60 hover:bg-[#0f0f22] transition-colors text-[11px]">
      <SeverityBadge severity={row.severity} />
      <span className="font-mono text-[#4a4a7a] shrink-0 w-20">
        {formatTimestamp(row.ts)}
      </span>
      <span className="font-mono text-[#8b5cf6] shrink-0 w-28 truncate">
        {row.req_id}
      </span>
      <span className="font-mono text-[#4a4a7a] shrink-0 w-20">
        {row.route}
      </span>
      <span className="font-mono text-[#e2e8f0] flex-1 truncate">
        {row.message}
      </span>
      <span className="font-mono text-[#94a3b8] shrink-0 w-20 text-right">
        {formatLatency(row.resp_ms)}
      </span>
      <span className={`font-mono shrink-0 w-14 text-right ${
        row.error_rate > 0.10 ? 'text-[#ef4444]' :
        row.error_rate > 0.05 ? 'text-[#f59e0b]' : 'text-[#10b981]'
      }`}>
        {formatErrorRate(row.error_rate)}
      </span>
    </div>
  );
}

export function ActivityFeed() {
  const feed      = useDashboardStore(selectActivityFeed);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: feed.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 37,
    overscan: 5,
  });

  return (
    <div className="flex flex-col h-full bg-[#06060f]">
      {/* Column header */}
      <div className="flex items-center gap-3 px-4 py-1.5 border-b border-[#1a1a35] bg-[#0a0a1a] shrink-0">
        <span className="text-[9px] font-mono tracking-widest uppercase text-[#2a2a4a] w-14">SEV</span>
        <span className="text-[9px] font-mono tracking-widest uppercase text-[#2a2a4a] w-20">TIME</span>
        <span className="text-[9px] font-mono tracking-widest uppercase text-[#2a2a4a] w-28">REQ ID</span>
        <span className="text-[9px] font-mono tracking-widest uppercase text-[#2a2a4a] w-20">ROUTE</span>
        <span className="text-[9px] font-mono tracking-widest uppercase text-[#2a2a4a] flex-1">EVENT</span>
        <span className="text-[9px] font-mono tracking-widest uppercase text-[#2a2a4a] w-20 text-right">RESP TIME</span>
        <span className="text-[9px] font-mono tracking-widest uppercase text-[#2a2a4a] w-14 text-right">ERR%</span>
      </div>

      {/* Virtual list */}
      <div ref={parentRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        {feed.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#4a4a7a] font-mono text-xs">
            Waiting for events…
          </div>
        ) : (
          <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            {virtualizer.getVirtualItems().map((item) => (
              <div
                key={item.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  transform: `translateY(${item.start}px)`,
                  height: `${item.size}px`,
                }}
              >
                <FeedRow row={feed[item.index]} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
