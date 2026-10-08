import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AssessmentOptionProps {
  optionId: string;
  text: string;
  selected?: boolean;
  correct?: boolean;
  showResult?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  delay?: number;
}

export function AssessmentOption({
  text,
  selected,
  correct,
  showResult,
  disabled,
  onClick,
  delay = 0,
}: AssessmentOptionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={!disabled ? { y: -2, transition: { duration: 0.15 } } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-clay-lg p-4 text-left shadow-clay transition-all duration-200',
        showResult && correct && 'bg-mint-100 ring-2 ring-mint-300',
        showResult && selected && !correct && 'bg-peach-100 ring-2 ring-peach-300',
        !showResult && selected && 'bg-violet-100 ring-2 ring-violet-300',
        !showResult && !selected && 'bg-clay-50 hover:shadow-clay-hover',
        showResult && !correct && !selected && 'opacity-50',
        disabled && !showResult && 'cursor-not-allowed opacity-60'
      )}
    >
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
          selected || (showResult && correct) ? 'border-transparent text-white' : 'border-clay-300 text-clay-500',
          showResult && correct && 'bg-mint-500',
          showResult && selected && !correct && 'bg-peach-500',
          !showResult && selected && 'bg-violet-600'
        )}
      >
        {showResult && correct ? '✓' : showResult && selected && !correct ? '✗' : ''}
      </div>
      <span className="flex-1 text-sm font-medium text-charcoal-800">{text}</span>
    </motion.button>
  );
}
