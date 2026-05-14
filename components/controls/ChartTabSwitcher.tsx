'use client';

import { useDashboardStore, selectActiveChart } from '@/lib/store/dashboardStore';
import type { ActiveChart } from '@/types';
import { cn } from '@/lib/utils/cn';

const TABS: { id: ActiveChart; label: string; sublabel: string }[] = [
  { id: 'VOLUME',  label: 'TRAFFIC',      sublabel: 'requests per second' },
  { id: 'ERRORS',  label: 'ERROR RATE',   sublabel: '% of failing requests' },
  { id: 'LATENCY', label: 'RESPONSE MAP', sublabel: '5 routes × last 60s' },
];

export function ChartTabSwitcher() {
  const activeChart   = useDashboardStore(selectActiveChart);
  const setActiveChart = useDashboardStore((s) => s.setActiveChart);

  return (
    <div className="flex gap-0 border-b border-[#1a1a35]">
      {TABS.map((tab) => {
        const active = activeChart === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id)}
            className={cn(
              'px-4 py-2.5 text-left transition-all border-b-2 -mb-px',
              active
                ? 'border-[#8b5cf6] bg-[#8b5cf6]/5'
                : 'border-transparent hover:border-[#1a1a35] hover:bg-[#0f0f22]'
            )}
          >
            <div className={cn(
              'text-[11px] font-mono font-semibold tracking-wider',
              active ? 'text-[#8b5cf6]' : 'text-[#4a4a7a]'
            )}>
              {tab.label}
            </div>
            <div className="text-[9px] font-mono text-[#2a2a4a] mt-0.5">{tab.sublabel}</div>
          </button>
        );
      })}
    </div>
  );
}
