import { Search, Menu } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { ProfileMenu } from './ProfileMenu';

interface TopHeaderProps {
  onOpenSearch: () => void;
  onOpenMobileNav: () => void;
}

export function TopHeader({ onOpenSearch, onOpenMobileNav }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/95 backdrop-blur-sm px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-secondary hover:border-primary/40 transition-colors w-48 sm:w-64"
        >
          <Search size={16} />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] text-text-secondary">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <NotificationPanel />
        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
        <ProfileMenu />
      </div>
    </header>
  );
}
