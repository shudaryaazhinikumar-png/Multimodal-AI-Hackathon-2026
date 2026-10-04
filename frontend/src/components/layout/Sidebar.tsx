import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Sparkles,
  CheckSquare,
  TrendingUp,
  Lightbulb,
  BookOpen,
  Settings,
  User,
  ChevronLeft,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/materials', label: 'Materials', icon: Upload },
  { to: '/tutor', label: 'AI Tutor', icon: Sparkles, accent: 'plum' },
  { to: '/quiz', label: 'Quizzes', icon: CheckSquare },
  { to: '/progress', label: 'My Progress', icon: TrendingUp },
  { to: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
];

const secondaryItems = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen border-r border-border bg-surface transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-border px-5 py-5 h-16">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
              <GraduationCap size={20} className="text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-text-primary leading-tight">Learning Companion</p>
                <p className="text-[10px] text-text-secondary">AI Personalized</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {!collapsed && <p className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary">Main</p>}
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-soft text-primary'
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={20}
                      className={`shrink-0 ${isActive && item.accent === 'plum' ? 'text-plum' : ''}`}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}

            {!collapsed && <p className="px-3 py-1 mt-6 text-[10px] font-medium uppercase tracking-wider text-text-secondary">Account</p>}
            {secondaryItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-soft text-primary'
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center gap-2 border-t border-border px-4 py-3 text-text-secondary hover:text-text-primary transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={18} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
