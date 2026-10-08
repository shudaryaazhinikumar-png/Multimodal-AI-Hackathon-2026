import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'violet';

interface ClayBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-ivory-200 text-clay-700',
  success: 'bg-mint-100 text-mint-500',
  warning: 'bg-warmyellow-100 text-warmyellow-600',
  error: 'bg-peach-100 text-peach-500',
  info: 'bg-lavender-100 text-lavender-500',
  violet: 'bg-violet-100 text-violet-600',
};

export function ClayBadge({ variant = 'default', children, className }: ClayBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-clay-sm',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
