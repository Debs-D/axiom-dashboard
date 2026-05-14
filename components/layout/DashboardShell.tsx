'use client';

import React from 'react';

interface DashboardShellProps {
  topbar: React.ReactNode;
  primary: React.ReactNode;
  sidebar: React.ReactNode;
  feed: React.ReactNode;
}

export function DashboardShell({ topbar, primary, sidebar, feed }: DashboardShellProps) {
  return (
    <div
      className="h-screen w-screen overflow-hidden bg-[#06060f]"
      style={{
        display: 'grid',
        gridTemplateRows: '52px 1fr 220px',
        gridTemplateColumns: '65fr 35fr',
        gridTemplateAreas: '"topbar topbar" "primary sidebar" "feed feed"',
      }}
    >
      {/* Top bar */}
      <div
        style={{ gridArea: 'topbar' }}
        className="border-b border-[#1a1a35] bg-[#0a0a1a] flex items-center z-10"
      >
        {topbar}
      </div>

      {/* Primary chart area */}
      <div
        style={{ gridArea: 'primary' }}
        className="border-r border-[#1a1a35] overflow-hidden flex flex-col min-h-0"
      >
        {primary}
      </div>

      {/* Sidebar — KPI cards + gateway bar */}
      <div
        style={{ gridArea: 'sidebar' }}
        className="overflow-hidden flex flex-col min-h-0"
      >
        {sidebar}
      </div>

      {/* Activity feed */}
      <div
        style={{ gridArea: 'feed' }}
        className="border-t border-[#1a1a35] overflow-hidden flex flex-col min-h-0"
      >
        {feed}
      </div>
    </div>
  );
}
