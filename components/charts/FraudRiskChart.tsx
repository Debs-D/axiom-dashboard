'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardStore, selectFraudSeries, selectTimeRange } from '@/lib/store/dashboardStore';
import { filterByTimeRange } from '@/lib/utils/chartHelpers';
import { formatTimestampShort, formatErrorRate } from '@/lib/utils/formatters';

const TICK_STYLE = { fill: '#4a4a7a', fontSize: 10, fontFamily: 'var(--font-geist-mono)' };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const rate = payload[0]?.value as number;
  const color = rate > 0.10 ? '#ef4444' : rate > 0.05 ? '#f59e0b' : '#10b981';
  return (
    <div className="bg-[#0d0d1f] border border-[#1a1a35] rounded px-3 py-2 text-[11px] font-mono shadow-lg">
      <p className="text-[#4a4a7a] mb-1">{formatTimestampShort(label)}</p>
      <p style={{ color }} className="font-semibold">
        {formatErrorRate(rate)}
        {rate > 0.10 && <span className="ml-2 text-[#ef4444]">CRITICAL</span>}
      </p>
    </div>
  );
}

export const FraudRiskChart = React.memo(function FraudRiskChart() {
  const fraudSeries = useDashboardStore(selectFraudSeries);
  const timeRange   = useDashboardStore(selectTimeRange);

  const data = useMemo(
    () => filterByTimeRange(fraudSeries, timeRange),
    [fraudSeries, timeRange]
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1a1a35" strokeDasharray="2 6" vertical={false} />
        <XAxis
          dataKey="ts"
          tickFormatter={(v) => formatTimestampShort(v)}
          tick={TICK_STYLE}
          stroke="#1a1a35"
          interval="preserveStartEnd"
          minTickGap={60}
        />
        <YAxis
          domain={[0, 0.3]}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          tick={TICK_STYLE}
          stroke="#1a1a35"
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        {/* Critical threshold — 10% error rate */}
        <ReferenceLine
          y={0.10}
          stroke="#ef4444"
          strokeDasharray="4 3"
          strokeWidth={1}
          label={{ value: 'CRITICAL 10%', fill: '#ef4444', fontSize: 9, fontFamily: 'var(--font-geist-mono)' }}
        />
        {/* Warning threshold — 5% error rate */}
        <ReferenceLine
          y={0.05}
          stroke="#f59e0b"
          strokeDasharray="4 3"
          strokeWidth={1}
          label={{ value: 'WARNING 5%', fill: '#f59e0b', fontSize: 9, fontFamily: 'var(--font-geist-mono)' }}
        />
        <Area
          type="monotone"
          dataKey="error_rate"
          stroke="#f59e0b"
          strokeWidth={1.5}
          fill="url(#errorGradient)"
          dot={false}
          isAnimationActive={false}
          activeDot={{ r: 3, fill: '#f59e0b', stroke: '#0d0d1f', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
