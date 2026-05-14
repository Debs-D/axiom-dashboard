interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function PanelHeader({ title, subtitle, right }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a35]">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-[#8b5cf6]" />
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#94a3b8] font-mono">
            {title}
          </span>
          {subtitle && (
            <span className="ml-2 text-[10px] text-[#4a4a7a] font-mono">{subtitle}</span>
          )}
        </div>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
