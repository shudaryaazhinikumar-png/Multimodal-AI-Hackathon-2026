import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ClayTabsProps {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function ClayTabs({ tabs, activeTab, onChange, className }: ClayTabsProps) {
  return (
    <div className={cn('inline-flex gap-1 rounded-clay bg-ivory-200 p-1.5 shadow-clay-pressed', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative rounded-[1.1rem] px-4 py-2 text-sm font-medium transition-colors duration-200',
            activeTab === tab.id ? 'text-violet-700' : 'text-clay-600 hover:text-charcoal-700'
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="clay-tab-indicator"
              className="absolute inset-0 rounded-[1.1rem] bg-clay-50 shadow-clay-sm"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

interface ClayDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'right' | 'bottom';
}

export function ClayDrawer({ open, onClose, title, children, side = 'right' }: ClayDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-charcoal-900/30 backdrop-blur-sm"
          />
          <motion.div
            initial={side === 'right' ? { x: '100%' } : { y: '100%' }}
            animate={side === 'right' ? { x: 0 } : { y: 0 }}
            exit={side === 'right' ? { x: '100%' } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'fixed z-50 bg-clay-50 shadow-clay-xl',
              side === 'right'
                ? 'right-0 top-0 h-full w-full max-w-md rounded-clay-2xl p-6 overflow-y-auto'
                : 'bottom-0 left-0 right-0 max-h-[80vh] rounded-t-clay-2xl p-6 overflow-y-auto'
            )}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-charcoal-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-clay-500 hover:bg-ivory-200 hover:text-charcoal-700"
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ClayModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function ClayModal({ open, onClose, title, children }: ClayModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-charcoal-900/30 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-lg rounded-clay-2xl bg-clay-50 p-6 shadow-clay-xl"
            >
              {title && (
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-charcoal-900">{title}</h3>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-clay-500 hover:bg-ivory-200 hover:text-charcoal-700"
                    aria-label="Close"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
