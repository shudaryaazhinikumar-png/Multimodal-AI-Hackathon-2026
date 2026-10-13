import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { ClayButton } from '@/components/clay/ClayButton';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-clay ${className}`} />;
}

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-3 border-ivory-200 border-t-violet-600"
      style={{ width: size, height: size, borderWidth: 3 }}
    />
  );
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <Spinner size={32} />
      <p className="text-sm text-clay-500">{label}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-clay bg-clay-50 p-6 shadow-clay">
      <Skeleton className="h-12 w-12 rounded-clay" />
      <Skeleton className="mt-4 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-4 h-2 w-full rounded-full" />
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 rounded-clay-lg bg-clay-50 p-12 text-center shadow-clay"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-peach-100">
        <AlertCircle size={28} className="text-peach-500" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-charcoal-900">{title}</h3>
        <p className="mt-1 text-sm text-clay-600">{message}</p>
      </div>
      {onRetry && (
        <ClayButton variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw size={16} className="mr-2 inline" />
          Retry
        </ClayButton>
      )}
    </motion.div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 rounded-clay-lg border-2 border-dashed border-clay-300 bg-clay-50/50 p-12 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-clay bg-ivory-100 shadow-clay-sm">
        {icon || <Inbox size={28} className="text-clay-400" />}
      </div>
      <div>
        <h3 className="text-lg font-bold text-charcoal-900">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-clay-600">{message}</p>
      </div>
      {actionLabel && onAction && (
        <ClayButton variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </ClayButton>
      )}
    </motion.div>
  );
}
