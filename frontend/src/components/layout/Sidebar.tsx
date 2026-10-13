import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  Library,
  ClipboardCheck,
  TrendingUp,
  RefreshCw,
  User,
  Settings,
  LogOut,
  Flame,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/learning', label: 'My Learning', icon: GraduationCap },
  { to: '/tutor', label: 'AI Tutor', icon: MessageSquare },
  { to: '/knowledge', label: 'Knowledge Base', icon: Library },
  { to: '/assessment', label: 'Assessments', icon: ClipboardCheck },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/revision', label: 'Revision', icon: RefreshCw },
  { to: '/knowledge-map', label: 'Knowledge Map', icon: Brain },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-ivory-200 bg-ivory-50 px-4 py-6 lg:flex">
      <div className="mb-8 px-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-clay bg-violet-600 shadow-clay-raised">
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-charcoal-900">AI Study</p>
            <p className="text-xs text-clay-500">Companion</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 rounded-clay px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-violet-700'
                    : 'text-clay-600 hover:bg-ivory-100 hover:text-charcoal-700'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-clay bg-clay-50 shadow-clay-raised"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={18} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 rounded-clay bg-clay-50 p-4 shadow-clay-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-charcoal-900">{user?.name || 'Alex Chen'}</p>
            <div className="flex items-center gap-1 text-xs text-clay-500">
              <Flame size={12} className="text-peach-400" />
              <span>{user?.streak || 12} day streak</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-clay bg-ivory-100 px-3 py-2 text-xs font-medium text-clay-600 hover:bg-ivory-200 hover:text-charcoal-700"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
}
