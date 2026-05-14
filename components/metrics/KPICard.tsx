'use client';

import React from 'react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { cn } from '@/lib/utils/cn';

interface KPICardProps {
  label: string;
  value: number;
  unit?: string;
  decimals?: number;
  prefix?: string;
  accent?: 'violet' | 'emerald' | 'amber' | 'danger';
  trend?: 'up' | 'down' | 'neutral';
  sublabel?: string;
}

const ACCENT_STYLES = {
  violet:  { bar: 'bg-[#8b5cf6]', value: 'text-[#8b5cf6]',  glow: 'shadow-[0_0_20px_rgba(139,92,246,0.12)]' },
  emerald: { bar: 'bg-[#10b981]', value: 'text-[#10b981]',  glow: 'shadow-[0_0_20px_rgba(16,185,129,0.12)]' },
  amber:   { bar: 'bg-[#f59e0b]', value: 'text-[#f59e0b]',  glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]' },
  danger:  { bar: 'bg-[#ef4444]', value: 'text-[#ef4444]',  glow: 'shadow-[0_0_20px_rgba(239,68,68,0.12)]' },
};

export function KPICard({
  label,
  value,
  unit,
  decimals = 0,
  prefix,
  accent = 'violet',
  sublabel,
}: KPICardProps) {
  const ref = useAnimatedCounter(value, 0.5, decimals);
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className={cn(
        'flex flex-col justify-between px-4 py-3 border-b border-[#1a1a35]',
        'bg-[#0d0d1f] relative overflow-hidden',
        styles.glow
      )}
    >
      {/* Top accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px]', styles.bar)} />

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#4a4a7a]">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] font-mono text-[#2a2a4a]">{sublabel}</span>
        )}
      </div>

      <div className="flex items-end gap-1 mt-1">
        {prefix && (
          <span className={cn('font-mono text-sm font-semibold mb-0.5', styles.value)}>
            {prefix}
          </span>
        )}
        <span
          ref={ref as React.RefObject<HTMLSpanElement>}
          className={cn('font-mono text-2xl font-bold leading-none tabular-nums', styles.value)}
        >
          {value.toFixed(decimals)}
        </span>
        {unit && (
          <span className="font-mono text-xs text-[#4a4a7a] mb-0.5 ml-0.5">{unit}</span>
        )}
      </div>
    </div>
  );
}
