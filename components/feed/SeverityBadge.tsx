import type { AlertSeverity } from '@/types';

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; bg: string; text: string; dot: string }> = {
  CRITICAL: { label: 'CRIT', bg: 'bg-[#ef4444]/15', text: 'text-[#ef4444]', dot: 'bg-[#ef4444]' },
  HIGH:     { label: 'HIGH', bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]', dot: 'bg-[#f59e0b]' },
  MEDIUM:   { label: 'MED',  bg: 'bg-[#8b5cf6]/15', text: 'text-[#8b5cf6]', dot: 'bg-[#8b5cf6]' },
  LOW:      { label: 'LOW',  bg: 'bg-[#4a4a7a]/20', text: 'text-[#94a3b8]', dot: 'bg-[#4a4a7a]'  },
};

interface SeverityBadgeProps {
  severity: AlertSeverity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
