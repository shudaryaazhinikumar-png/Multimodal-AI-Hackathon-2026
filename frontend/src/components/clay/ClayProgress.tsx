import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ClayProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'violet' | 'mint' | 'peach' | 'warmyellow';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const colorStyles = {
  violet: 'bg-violet-500',
  mint: 'bg-mint-500',
  peach: 'bg-peach-400',
  warmyellow: 'bg-warmyellow-400',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export function ClayProgress({
  value,
  max = 100,
  className,
  color = 'violet',
  showLabel = false,
  size = 'md',
}: ClayProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-xs font-medium text-clay-600">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-ivory-200 shadow-clay-pressed', sizeStyles[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full shadow-sm', colorStyles[color])}
        />
      </div>
    </div>
  );
}
