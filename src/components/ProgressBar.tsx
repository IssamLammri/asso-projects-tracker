interface ProgressBarProps {
  current: number;
  total: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ProgressBar({ current, total, size = 'md' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  
  const heights = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-12'
  };

  return (
    <div className="w-full bg-slate-200 rounded-full overflow-hidden">
      <div 
        className={`bg-emerald-500 transition-all duration-1000 ease-out ${heights[size]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
