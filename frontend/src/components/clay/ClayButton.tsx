import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ClayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-violet-600 text-white shadow-clay-raised hover:bg-violet-700 hover:shadow-clay-hover',
  secondary:
    'bg-ivory-100 text-charcoal-800 shadow-clay hover:bg-ivory-200',
  ghost: 'bg-transparent text-charcoal-700 hover:bg-ivory-100',
  outline:
    'bg-clay-50/50 text-charcoal-800 border border-clay-300 shadow-clay-sm hover:bg-ivory-100',
  danger:
    'bg-error-500 text-white shadow-clay-raised hover:bg-error-600',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-clay',
  md: 'px-6 py-3 text-sm rounded-clay',
  lg: 'px-8 py-4 text-base rounded-clay-lg',
};

export const ClayButton = forwardRef<HTMLButtonElement, ClayButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {children}
      </motion.button>
    );
  }
);

ClayButton.displayName = 'ClayButton';
