interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'gold' | 'sage' | 'plum';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabel?: boolean;
}

const colorClasses = {
  primary: 'bg-primary',
  gold: 'bg-gold',
  sage: 'bg-sage',
  plum: 'bg-plum',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export function ProgressBar({ value, max = 100, color = 'primary', size = 'md', animated, showLabel }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full">
      <div className={`w-full overflow-hidden rounded-full bg-surface-elevated ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full ${colorClasses[color]} ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
          style={{ width: `${animated ? 0 : percentage}%` }}
          ref={(el) => {
            if (el && animated) {
              requestAnimationFrame(() => {
                el.style.width = `${percentage}%`;
              });
            }
          }}
        />
      </div>
      {showLabel && <span className="mt-1 block text-right text-xs text-text-secondary">{Math.round(percentage)}%</span>}
    </div>
  );
}
