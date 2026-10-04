import { useState, useRef, useEffect } from 'react';
import { Bell, Target, Lightbulb, CheckSquare, Flame } from 'lucide-react';
import type { Notification } from '@/types';
import { mockNotifications } from '@/data/mockNotifications';

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const icons = {
    mastery: <Target size={18} className="text-gold" />,
    recommendation: <Lightbulb size={18} className="text-plum" />,
    quiz: <CheckSquare size={18} className="text-primary" />,
    streak: <Flame size={18} className="text-gold" />,
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-surface-elevated shadow-xl animate-slide-up overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-semibold text-text-primary">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:text-primary-hover">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 border-b border-border/50 px-4 py-3 transition-colors hover:bg-surface ${
                  !n.read ? 'bg-primary-soft/30' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">{icons[n.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{n.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-text-secondary mt-1">{n.time}</p>
                </div>
                {!n.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
