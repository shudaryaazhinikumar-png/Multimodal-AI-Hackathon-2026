import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ClayInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const ClayInput = forwardRef<HTMLInputElement, ClayInputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-charcoal-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-clay-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full rounded-clay bg-ivory-100 px-4 py-3 text-charcoal-900 placeholder:text-clay-500',
              'shadow-clay-pressed transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-clay-50',
              icon && 'pl-11',
              error && 'ring-2 ring-error-400',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
      </div>
    );
  }
);

ClayInput.displayName = 'ClayInput';

interface ClayTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const ClayTextarea = forwardRef<HTMLTextAreaElement, ClayTextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-charcoal-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-clay bg-ivory-100 px-4 py-3 text-charcoal-900 placeholder:text-clay-500',
            'shadow-clay-pressed transition-all duration-200 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-clay-50',
            error && 'ring-2 ring-error-400',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
      </div>
    );
  }
);

ClayTextarea.displayName = 'ClayTextarea';
