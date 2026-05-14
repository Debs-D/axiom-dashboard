'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardStore, selectGatewayHealth } from '@/lib/store/dashboardStore';
import { formatLatency } from '@/lib/utils/formatters';

const TICK_STYLE = { fill: '#4a4a7a', fontSize: 10, fontFamily: 'var(--font-geist-mono)' };

function routeColor(successRate: number): string {
  if (successRate >= 0.995) return '#10b981';
  if (successRate >= 0.98)  return '#f59e0b';
  return '#ef4444';
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-[#0d0d1f] border border-[#1a1a35] rounded px-3 py-2 text-[11px] font-mono shadow-lg">
      <p className="text-[#94a3b8] font-semibold mb-1">{d.route}</p>
      <p className="text-[#4a4a7a]">Response: <span className="text-[#e2e8f0]">{formatLatency(d.latency_ms)}</span></p>
      <p className="text-[#4a4a7a]">Success: <span className="text-[#e2e8f0]">{(d.success_rate * 100).toFixed(2)}%</span></p>
      <p className="text-[#4a4a7a]">Req/s: <span className="text-[#e2e8f0]">{d.tps.toFixed(0)}</span></p>
    </div>
  );
}

export const RegionalGatewayBar = React.memo(function RegionalGatewayBar() {
  const gatewayHealth = useDashboardStore(selectGatewayHealth);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={gatewayHealth}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        barCategoryGap="25%"
      >
        <CartesianGrid stroke="#1a1a35" strokeDasharray="2 6" vertical={false} />
        <XAxis
          dataKey="route"
          tick={TICK_STYLE}
          stroke="#1a1a35"
        />
        <YAxis
          tickFormatter={(v) => formatLatency(v)}
          tick={TICK_STYLE}
          stroke="#1a1a35"
          width={46}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
        {/* SLA threshold — pages should respond under 500ms */}
        <ReferenceLine
          y={500}
          stroke="#f59e0b"
          strokeDasharray="4 3"
          strokeWidth={1}
          label={{ value: 'SLA 500ms', fill: '#f59e0b', fontSize: 9, fontFamily: 'var(--font-geist-mono)', position: 'right' }}
        />
        <Bar dataKey="latency_ms" isAnimationActive={false} radius={[2, 2, 0, 0]}>
          {gatewayHealth.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={routeColor(entry.success_rate)} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});
