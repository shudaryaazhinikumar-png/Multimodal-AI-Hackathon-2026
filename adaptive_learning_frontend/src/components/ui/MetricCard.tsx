import { motion } from 'framer-motion';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayProgressRing } from '@/components/clay/ClayProgressRing';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  trend?: string;
  ring?: number;
  delay?: number;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  color = '#7C3AED',
  trend,
  ring,
  delay = 0,
  className,
}: MetricCardProps) {
  return (
    <ClayCard hover delay={delay} className={cn('flex items-center gap-4', className)}>
      {ring !== undefined && <ClayProgressRing value={ring} size={64} strokeWidth={6} color={color} label="" />}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} style={{ color }} />}
          <p className="text-sm font-medium text-clay-600">{label}</p>
        </div>
        <p className="mt-1 text-2xl font-bold text-charcoal-900">{value}</p>
        {trend && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="mt-0.5 text-xs text-clay-500"
          >
            {trend}
          </motion.p>
        )}
      </div>
    </ClayCard>
  );
}
