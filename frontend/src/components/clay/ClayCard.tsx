import { forwardRef, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ClayCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  raised?: boolean;
  inset?: boolean;
  delay?: number;
}

export const ClayCard = forwardRef<HTMLDivElement, ClayCardProps>(
  ({ hover, raised, inset, delay = 0, className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay, ease: 'easeOut' }}
        whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : undefined}
        className={cn(
          'rounded-clay p-6',
          inset
            ? 'bg-ivory-100 shadow-clay-pressed'
            : raised
            ? 'bg-clay-50 shadow-clay-raised'
            : 'bg-clay-50 shadow-clay',
          hover && 'cursor-pointer hover:shadow-clay-hover',
          className
        )}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }
);

ClayCard.displayName = 'ClayCard';
