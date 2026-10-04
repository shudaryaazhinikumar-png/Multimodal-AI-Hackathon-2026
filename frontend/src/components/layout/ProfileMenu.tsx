import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface transition-colors"
        aria-label="Profile menu"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white">
          {user.avatar}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-text-primary leading-tight">{user.name}</p>
          <p className="text-[10px] text-text-secondary">{user.learningGoal}</p>
        </div>
        <ChevronDown size={16} className="hidden md:block text-text-secondary" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-border bg-surface-elevated shadow-xl animate-slide-up overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-text-primary">{user.name}</p>
            <p className="text-xs text-text-secondary">{user.email}</p>
          </div>
          <div className="p-1.5">
            <button
              onClick={() => { navigate('/profile'); setOpen(false); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
            >
              <User size={18} /> Profile
            </button>
            <button
              onClick={() => { navigate('/settings'); setOpen(false); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
            >
              <Settings size={18} /> Settings
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
            >
              <HelpCircle size={18} /> Help & Support
            </button>
            <div className="my-1 border-t border-border" />
            <button
              onClick={() => { setShowLogout(true); setOpen(false); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={() => { logout(); navigate('/login'); }}
        title="Log out?"
        message="You'll need to sign in again to continue learning."
        confirmLabel="Log out"
        danger
      />
    </div>
  );
}
