'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardStore, selectTickSeries, selectTimeRange } from '@/lib/store/dashboardStore';
import { filterByTimeRange } from '@/lib/utils/chartHelpers';
import { formatTimestampShort, formatRPS } from '@/lib/utils/formatters';

const TICK_STYLE = { fill: '#4a4a7a', fontSize: 10, fontFamily: 'var(--font-geist-mono)' };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d1f] border border-[#1a1a35] rounded px-3 py-2 text-[11px] font-mono shadow-lg">
      <p className="text-[#4a4a7a] mb-1">{formatTimestampShort(label)}</p>
      <p className="text-[#8b5cf6] font-semibold">{formatRPS(payload[0].value)}</p>
    </div>
  );
}

export const TransactionVolumeChart = React.memo(function TransactionVolumeChart() {
  const tickSeries = useDashboardStore(selectTickSeries);
  const timeRange  = useDashboardStore(selectTimeRange);

  const data = useMemo(
    () => filterByTimeRange(tickSeries, timeRange),
    [tickSeries, timeRange]
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01} />
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
          tickFormatter={(v) => formatRPS(v)}
          tick={TICK_STYLE}
          stroke="#1a1a35"
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="tps"
          stroke="#8b5cf6"
          strokeWidth={1.5}
          fill="url(#tpsGradient)"
          dot={false}
          isAnimationActive={false}
          activeDot={{ r: 3, fill: '#8b5cf6', stroke: '#0d0d1f', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
