'use client';

import React from 'react';
import { useDashboardStore, selectStream, selectKPI } from '@/lib/store/dashboardStore';
import { formatRPS, formatUptime } from '@/lib/utils/formatters';

const ROUTES = ['/home', '/shop', '/api', '/checkout', '/blog'] as const;

function LiveClock() {
  const [time, setTime] = React.useState('');

  React.useEffect(() => {
    const update = () => {
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date()) + ' UTC'
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="font-mono text-[11px] text-[#4a4a7a]">{time}</span>;
}

export function NetworkStatusBar() {
  const stream = useDashboardStore(selectStream);
  const kpi    = useDashboardStore(selectKPI);

  return (
    <div className="flex items-center w-full px-4 gap-6 h-full">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-glow-pulse" />
        </div>
        <span className="font-mono text-sm font-bold tracking-[0.15em] text-[#e2e8f0]">PULSE</span>
        <span className="font-mono text-[10px] text-[#4a4a7a] tracking-widest">live monitor</span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[#1a1a35]" />

      {/* Connection status */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className={`w-2 h-2 rounded-full ${
            stream.connected
              ? 'bg-[#10b981] animate-pulse-ring'
              : 'bg-[#ef4444] animate-pulse-ring-red'
          }`}
        />
        <span className="font-mono text-[11px] text-[#94a3b8]">
          {stream.connected
            ? 'LIVE'
            : stream.reconnectAttempts > 0
            ? `RECONNECTING (${stream.reconnectAttempts})`
            : 'OFFLINE'}
        </span>
      </div>

      {/* Requests per second */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-[#4a4a7a] font-mono tracking-widest">REQ/S</span>
        <span className="font-mono text-sm font-semibold text-[#8b5cf6]">
          {formatRPS(kpi.total_rps)}
        </span>
      </div>

      {/* Uptime */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-[#4a4a7a] font-mono tracking-widest">UPTIME</span>
        <span className="font-mono text-sm font-semibold text-[#10b981]">
          {formatUptime(kpi.uptime_pct)}
        </span>
      </div>

      {/* Route health dots */}
      <div className="hidden lg:flex items-center gap-3 ml-auto">
        <span className="text-[10px] text-[#4a4a7a] font-mono tracking-widest mr-1">ROUTES</span>
        {ROUTES.map((r) => (
          <div key={r} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span className="font-mono text-[10px] text-[#4a4a7a]">{r}</span>
          </div>
        ))}
      </div>

      {/* Clock */}
      <div className="shrink-0 ml-4 lg:ml-0">
        <LiveClock />
      </div>
    </div>
  );
}
