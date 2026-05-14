'use client';

import React, { Suspense } from 'react';
import { DashboardShell }        from '@/components/layout/DashboardShell';
import { NetworkStatusBar }      from '@/components/metrics/NetworkStatusBar';
import { KPICard }               from '@/components/metrics/KPICard';
import { TransactionVolumeChart } from '@/components/charts/TransactionVolumeChart';
import { FraudRiskChart }        from '@/components/charts/FraudRiskChart';
import { LatencyHeatmap }        from '@/components/charts/LatencyHeatmap';
import { RegionalGatewayBar }    from '@/components/charts/RegionalGatewayBar';
import { ActivityFeed }          from '@/components/feed/ActivityFeed';
import { ChartTabSwitcher }      from '@/components/controls/ChartTabSwitcher';
import { StreamControls }        from '@/components/controls/StreamControls';
import { PanelHeader }           from '@/components/layout/PanelHeader';
import { useSSEStream }          from '@/lib/stream/useSSEStream';
import { useDashboardStore, selectKPI, selectActiveChart } from '@/lib/store/dashboardStore';
import { formatLargeNumber }     from '@/lib/utils/formatters';

function StreamInitializer() {
  useSSEStream();
  return null;
}

function PrimaryPanel() {
  const activeChart = useDashboardStore(selectActiveChart);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between border-b border-[#1a1a35] bg-[#0a0a1a] shrink-0">
        <ChartTabSwitcher />
        <div className="pr-3">
          <StreamControls />
        </div>
      </div>
      <div className="flex-1 min-h-0 p-3">
        {activeChart === 'VOLUME'  && <TransactionVolumeChart />}
        {activeChart === 'ERRORS'  && <FraudRiskChart />}
        {activeChart === 'LATENCY' && <LatencyHeatmap />}
      </div>
    </div>
  );
}

function SidebarPanel() {
  const kpi = useDashboardStore(selectKPI);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* KPI Cards */}
      <KPICard
        label="Requests/sec"
        value={kpi.total_rps}
        unit="/s"
        decimals={1}
        accent="violet"
        sublabel="live traffic"
      />
      <KPICard
        label="Error Rate"
        value={kpi.error_rate_pct}
        unit="%"
        decimals={2}
        accent="amber"
        sublabel="of all requests"
      />
      <KPICard
        label="Uptime"
        value={kpi.uptime_pct}
        unit="%"
        decimals={3}
        accent="emerald"
        sublabel="SLA target 99.9%"
      />
      <KPICard
        label="Requests Today"
        value={kpi.requests_24h}
        decimals={0}
        accent="violet"
        sublabel={formatLargeNumber(kpi.requests_24h) + ' total'}
      />

      {/* Page response times bar chart */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-[#1a1a35]">
        <PanelHeader title="Page Load Times" subtitle="avg response ms · 5 routes" />
        <div className="flex-1 min-h-0 p-2">
          <RegionalGatewayBar />
        </div>
      </div>
    </div>
  );
}

function FeedPanel() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <PanelHeader
        title="Live Events"
        subtitle="real-time · newest first · up to 1000"
        right={
          <span className="text-[9px] font-mono text-[#2a2a4a] tracking-widest">
            LOCAL TIME
          </span>
        }
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        <ActivityFeed />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <StreamInitializer />
      </Suspense>
      <DashboardShell
        topbar={<NetworkStatusBar />}
        primary={<PrimaryPanel />}
        sidebar={<SidebarPanel />}
        feed={<FeedPanel />}
      />
    </>
  );
}
